import { expect } from 'chai';
import 'mocha';
import moment from 'moment';
import {
  HasAssignments,
  WithProfile,
  HasTeamInformation,
  User,
} from '../src/types';
import { states } from '../src/model';

import {
  hasActiveRole,
  endingEmploymentInWeek,
  onlyInTeams,
  getOrderedSkills,
  resolveSkillName,
  getActiveAssignments,
  notUpdatedSince,
  employmentStarted,
  isActiveProject,
  dropByEmail,
} from '../src/utils';

import { skill, user, project, assignment } from './test-builder';

import { versionControlSkill } from './testdata';

describe('cinode utils', () => {
  context('hasActiveRole', () => {
    it('returns true if has project without start date', () => {
      expect(
        hasActiveRole(
          user({
            assignments: {
              assigned: [
                {
                  endDate: moment().add(1, 'week').toISOString(),
                },
              ],
            },
          }) as User & HasAssignments
        )
      ).is.eql(true);
    });
    it('returns true if has project without end date', () => {
      expect(
        hasActiveRole(
          user({
            assignments: {
              assigned: [
                {
                  startDate: moment().subtract(1, 'week').toISOString(),
                },
              ],
            },
          }) as User & HasAssignments
        )
      ).is.eql(true);
    });
    it('returns true if has project is about to start in less than two weeks', () => {
      expect(
        hasActiveRole(
          user({
            assignments: {
              assigned: [
                {
                  startDate: moment().add(13, 'days').toISOString(),
                },
              ],
            },
          }) as User & HasAssignments
        )
      ).is.eql(true);
    });
  });

  context('employmentStarted', () => {
    it('should return true if employment start date not set', () => {
      expect(employmentStarted({})).is.eql(true);
      expect(employmentStarted({ employmentStartDate: null })).is.eql(true);
    });
    it('should return false if employment start date in a month', () => {
      expect(
        employmentStarted({
          employmentStartDate: moment().add(1, 'week').toISOString(),
        })
      ).is.eql(false);
    });
    it('should return true if employment ending date in past', () => {
      expect(
        employmentStarted({
          employmentStartDate: moment().subtract(1, 'week').toISOString(),
        })
      ).is.eql(true);
    });
    it('should ignore hours and minutes and return true if start date is current day', () => {
      expect(
        employmentStarted({
          employmentStartDate: moment()
            .set({ hour: 23, minute: 59, second: 59 })
            .toISOString(),
        })
      ).is.eql(false);
    });
  });

  context('endingEmploymentInWeek', () => {
    it('should return false if no employment ending date', () => {
      expect(endingEmploymentInWeek({})).is.eql(false);
    });
    it('should return false if employment ending date in a month', () => {
      expect(
        endingEmploymentInWeek({
          employmentEndDate: moment().add(1, 'month').toISOString(),
        })
      ).is.eql(false);
    });
    it('should return true if employment ending date in a week', () => {
      expect(
        endingEmploymentInWeek({
          employmentEndDate: moment().add(5, 'days').toISOString(),
        })
      ).is.eql(true);
    });
  });

  context('onlyInTeams', () => {
    it('should return true if user only in the Backoffice team', () => {
      expect(
        onlyInTeams(
          user({
            teamMembers: [
              {
                team: { name: 'Backoffice' },
              },
            ],
          }) as User & HasTeamInformation,
          ['Backoffice']
        )
      ).is.eql(true);
    });

    it('should return true if user in each of the teams', () => {
      expect(
        onlyInTeams(
          user({
            teamMembers: [
              {
                team: { name: 'Backoffice' },
              },
              {
                team: { name: 'Admin' },
              },
            ],
          }) as User & HasTeamInformation,
          ['Backoffice', 'Admin']
        )
      ).is.eql(true);
    });

    it('should return true if user only in one of the teams', () => {
      expect(
        onlyInTeams(
          user({
            teamMembers: [
              {
                team: { name: 'Admin' },
              },
            ],
          }) as User & HasTeamInformation,
          ['Backoffice', 'Admin']
        )
      ).is.eql(true);
    });

    it('should return true if not in any team', () => {
      expect(
        onlyInTeams(
          user({
            teamMembers: [],
          }) as User & HasTeamInformation,
          ['Backoffice']
        )
      ).is.eql(true);
    });

    it('should return false if in some other team', () => {
      expect(
        onlyInTeams(
          user({
            teamMembers: [
              {
                team: { name: 'Consultants / HKI' },
              },
            ],
          }) as User & HasTeamInformation,
          ['Backoffice']
        )
      ).is.eql(false);
    });
    it('should return false if also in some other team', () => {
      expect(
        onlyInTeams(
          user({
            teamMembers: [
              {
                team: { name: 'Consultants / HKI' },
              },
              {
                team: { name: 'Backoffice' },
              },
            ],
          }) as User & HasTeamInformation,
          ['Backoffice']
        )
      ).is.eql(false);
    });
  });

  context('getOrderedSkills', () => {
    it('should return empty if no skills selected', () => {
      expect(
        getOrderedSkills(user({ profile: {} }) as User & WithProfile)
      ).to.eql([]);
    });

    it('should return starred skills', () => {
      const starredSkills = [...Array(5).keys()].map((i) =>
        skill({
          level: i + 1,
          favourite: true,
        })
      );
      expect(
        getOrderedSkills(
          user({
            profile: {
              skills: [skill({ level: 3, favourite: false }), ...starredSkills],
            },
          }) as User & WithProfile
        )
      ).to.eql(starredSkills.reverse());
    });

    it('should prefer higher skill level over lower', () => {
      const lowSkills = [...Array(5).keys()].map(() =>
        skill({
          level: 4,
        })
      );
      const highSkills = [...Array(5).keys()].map(() =>
        skill({
          level: 5,
        })
      );

      expect(
        getOrderedSkills(
          user({
            profile: {
              skills: [...lowSkills, ...highSkills],
            },
          }) as User & WithProfile
        )
      ).to.eql([...highSkills, ...lowSkills]);
    });

    it('should prefer favourite skills over high level', () => {
      const highSkills = [...Array(20).keys()].map(() =>
        skill({
          level: 5,
        })
      );
      const favouriteSkill = skill({
        level: 2,
        favourite: true,
      });

      expect(
        getOrderedSkills(
          user({
            profile: {
              skills: [...highSkills, favouriteSkill],
            },
          }) as User & WithProfile
        )
      ).to.include(favouriteSkill);
    });

    it('should sort lately changed first', () => {
      const notUpdatedSkill = skill({
        level: 5,
        changeHistory: [],
      });

      const oldSkill = skill({
        level: 5,
        changeHistory: [
          {
            changeDateTime: '2019-02-19T17:47:48.8501648',
          },
        ],
      });

      const newSkill = skill({
        level: 5,
        changeHistory: [
          {
            changeDateTime: '2021-02-19T17:47:48.8501648',
          },
        ],
      });

      expect(
        getOrderedSkills(
          user({
            profile: {
              skills: [oldSkill, notUpdatedSkill, newSkill],
            },
          }) as User & WithProfile
        )
      ).to.eql([newSkill, oldSkill, notUpdatedSkill]);
    });
  });

  context('resolveSkillName', () => {
    it('should return english translation if available', () => {
      expect(resolveSkillName(versionControlSkill)).to.eql('Version control');
    });
  });

  context('getActiveAssignments', () => {
    it('should return only active assignments', () => {
      const active = assignment({
        startDate: moment().subtract(1, 'week').toISOString(),
        endDate: moment().add(1, 'month').toISOString(),
      });
      const ended = assignment({
        startDate: moment().subtract(2, 'months').toISOString(),
        endDate: moment().subtract(1, 'week').toISOString(),
      });
      expect(getActiveAssignments([active, ended])).to.eql([active]);
    });

    it('assignment without end date is forever active', () => {
      const forever = assignment({
        startDate: moment().subtract(1, 'week').toISOString(),
      });
      expect(getActiveAssignments([forever])).to.eql([forever]);
    });

    it('assignment without start date is from epoch', () => {
      const fromDayOne = assignment({
        endDate: moment().add(1, 'month').toISOString(),
      });
      expect(getActiveAssignments([fromDayOne])).to.eql([fromDayOne]);
    });

    it('assignment without any dates is whole lifetime project', () => {
      const lifetime = assignment();
      expect(getActiveAssignments([lifetime])).to.eql([lifetime]);
    });

    it('should return also assignments that are coming up', () => {
      const active = assignment({
        id: 'active',
        startDate: moment().subtract(1, 'week').toISOString(),
        endDate: moment().add(1, 'month').toISOString(),
      });
      const comingUp = assignment({
        id: 'coming up',
        startDate: moment().add(1, 'month').toISOString(),
        endDate: moment().add(12, 'month').toISOString(),
      });
      const ended = assignment({
        id: 'ended',
        startDate: moment().subtract(2, 'months').toISOString(),
        endDate: moment().subtract(1, 'week').toISOString(),
      });
      expect(getActiveAssignments([active, comingUp, ended])).to.eql([
        active,
        comingUp,
      ]);
    });
  });

  context('notUpdatedSince', () => {
    it('should filter out just lately updated', () => {
      const updatedUser = {
        id: 1,
        updatedDateTime: moment().subtract(1, 'day').toISOString(),
      };
      const outdatedUser = {
        id: 2,
        updatedDateTime: moment().subtract(2, 'months').toISOString(),
      };
      expect(
        [outdatedUser, updatedUser].filter(
          notUpdatedSince(moment().subtract(1, 'month').toDate())
        )
      ).to.eql([outdatedUser]);
    });
  });

  context('isActiveProject', () => {
    it('should return true if project is active', () => {
      expect(
        isActiveProject(
          project({
            currentState: states.PROJECT_STATE_Won,
            assignments: [
              assignment({
                startDate: moment().subtract(1, 'week').toISOString(),
                endDate: moment().add(1, 'month').toISOString(),
              }),
            ],
          })
        )
      ).to.eql(true);
    });

    it('should return false if project has completed assignment', () => {
      expect(
        isActiveProject(
          project({
            currentState: states.PROJECT_STATE_Won,
            assignments: [
              assignment({
                startDate: moment().subtract(2, 'months').toISOString(),
                endDate: moment().subtract(1, 'week').toISOString(),
              }),
            ],
          })
        )
      ).to.eql(false);
    });

    it('should return false if project is still in open state', () => {
      expect(
        isActiveProject(
          project({
            currentState: states.PROJECT_STATE_Open,
          })
        )
      ).to.eql(false);
    });
  });

  context('dropByEmail', () => {
    it('should drop people with matching email', () => {
      expect(
        dropByEmail(['john.doe@example.com'])(
          user({
            companyUserEmail: 'john.doe@example.com',
          })
        )
      ).to.eql(false);
    });

    it('should not drop people with not matching email', () => {
      const expected = user({
        companyUserEmail: 'foo.bar@example.com',
      });
      expect(dropByEmail(['john.doe@example.com'])(expected)).to.eql(true);
    });

    it('used as a filter, should drop only matching people', () => {
      const expected = user({
        companyUserEmail: 'foo.bar@example.com',
      });
      expect(
        [
          user({
            companyUserEmail: 'john.doe@example.com',
          }),
          expected,
        ].filter(dropByEmail(['john.doe@example.com']))
      ).to.eql([expected]);
    });
  });
});
