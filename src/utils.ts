import moment from 'moment';

import type {
  Skill,
  User,
  Project,
  Assignment,
  Absence,
  TimeSpan,
  HasAssignments,
  WithProfile,
  HasTeamInformation,
  HasAbsenceInformation,
} from './types';

import {
  states,
  stages,
  projectStateToHumanReadable,
  projectStageToHumanReadable,
} from './model';

const latestChangeFirst = (
  a: { changeDateTime: string },
  b: { changeDateTime: string }
): number => {
  return (
    new Date(b.changeDateTime).getTime() - new Date(a.changeDateTime).getTime()
  );
};

export const findLatestChangeDate = (skill: Skill): string | null => {
  if (!skill.changeHistory || !skill.changeHistory.length) {
    return null;
  }

  return skill.changeHistory.sort(latestChangeFirst)[0].changeDateTime || null;
};

const descendingBySkillLevel = (a: Skill, b: Skill): number =>
  b.level - a.level;

const latelyChangedFirst = (a: Skill, b: Skill): number => {
  const aChangeDate = findLatestChangeDate(a);
  const bChangeDate = findLatestChangeDate(b);

  if (aChangeDate && bChangeDate) {
    return new Date(bChangeDate).getTime() - new Date(aChangeDate).getTime();
  } else if (!aChangeDate && !bChangeDate) {
    return 0;
  } else if (aChangeDate) {
    return -1;
  } else {
    return 1;
  }
};

const favouriteFirst = (a: Skill, b: Skill): number => {
  if (!a.favourite && b.favourite) {
    return 1;
  }
  if (a.favourite && !b.favourite) {
    return -1;
  }

  return 0;
};

// Have no clue, is this right way to resolve this
// because there wasn't too much documentation about
// the skill data structure.
const resolveSkillTranslation = (lang, skill: Skill): string | null => {
  if (!skill.translations || !skill.translations.length) {
    return null;
  }

  const translation = skill.translations.find(
    (t) => t.profileTranslation.languageBranch.language.lang === lang
  );

  if (translation) {
    return translation.keywordSynonym.name;
  }

  return null;
};

// Filter for project list to select only projects that are in specific state
const isInState =
  (...states: number[]) =>
  (project: Project) =>
    states.includes(project.currentState);

export const isInOpenState = isInState(states.PROJECT_STATE_Open);

export const isInWonState = isInState(states.PROJECT_STATE_Won);

// Filter for project list to select only projects that are in specific stage
const isInStage =
  (...stages: number[]) =>
  (project: Project) =>
    stages.includes(project.currentStageId);

export const isInProposalSentStage = isInStage(
  stages.PROJECT_PIPELINE_STAGE_Proposal_Sent
);

export const isActiveProject = (project: Project) =>
  isInWonState(project) && project.assignments.some(isActiveNow);

// Filter for users to only users that are updated after specific date
export const notUpdatedSince =
  (since) =>
  ({ updatedDateTime }) =>
    moment(updatedDateTime).isBefore(since);

export const employmentStarted = (user) => {
  return (
    !user.employmentStartDate || moment(user.employmentStartDate).isBefore()
  );
};

export const endingEmploymentInWeek = (user) => {
  return (
    !!user.employmentEndDate &&
    moment(user.employmentEndDate).isBefore(moment().add(1, 'week'))
  );
};

export const onlyInTeams = (
  user: User & HasTeamInformation,
  teamNames: string[]
): boolean => {
  if (!user.teamMembers) {
    throw new Error(
      "Trying to use 'onlyInTeams' filter to data that is scarce user data!"
    );
  }
  return user.teamMembers.every(({ team: { name } }) =>
    teamNames.includes(name)
  );
};

export const dropByEmail =
  (emails: string[]) =>
  (user: User): boolean => {
    return !emails.includes(user.companyUserEmail);
  };

export const isActiveNow = (item: TimeSpan): boolean =>
  !item.startDate ||
  (moment(item.startDate).isBefore() &&
    (!item.endDate || moment(item.endDate).isAfter()));

export const assignmentInFuture = (assignment: Assignment) =>
  assignment.startDate && moment(assignment.startDate).isAfter();

export const hasActiveRole = (user: User & HasAssignments): boolean => {
  return user.assignments.assigned.some(
    (assignment) =>
      (!assignment.startDate ||
        moment(assignment.startDate).isBefore(moment().add(2, 'weeks'))) &&
      (!assignment.endDate || moment(assignment.endDate).isAfter())
  );
};

export const onlyActivePeople = (user: User & HasTeamInformation): boolean => {
  return employmentStarted(user) && !endingEmploymentInWeek(user);
};

export const isAway = (
  user: User & HasTeamInformation & HasAbsenceInformation
): boolean => {
  if (!user.absences) return false;
  if (user.absences.length === 0) return false;
  const now = moment.now();
  for (const absence of user.absences) {
    if (
      moment(absence.startDate).isBefore(now) &&
      moment(absence.endDate).isAfter(now)
    ) {
      return true;
    }
  }

  return false;
};

export const getOrderedSkills = (user: User & WithProfile) => {
  if (!user.profile?.skills) {
    return [];
  }
  return user.profile.skills
    .filter((skill) => skill.level >= 4 || skill.favourite)
    .sort(latelyChangedFirst)
    .sort(descendingBySkillLevel)
    .sort(favouriteFirst);
};

export const isActiveAssignment = (assignment: Assignment) =>
  isActiveNow(assignment) || assignmentInFuture(assignment);

export const getActiveAssignments = (assignments: Assignment[]) =>
  assignments.filter(isActiveAssignment);

export const getActiveAbsences = (absences: Absence[]) =>
  absences.filter(isActiveNow);

export const resolveSkillName = (skill: Skill) => {
  return resolveSkillTranslation('en', skill) || skill.keyword.masterSynonym;
};

export const formatProjectState = (project: Project) =>
  projectStateToHumanReadable(project.currentState);
export const formatProjectStage = (project: Project) =>
  projectStageToHumanReadable(project.currentStageId);
