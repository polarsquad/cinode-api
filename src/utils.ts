import moment from 'moment';

import {
  projectStageToHumanReadable,
  projectStateToHumanReadable,
} from './model';
import {
  AbsencePeriodDto,
  CompanyUser,
  CompanyUserBase,
  CompanyUserExtended,
  CompanyUserProfileSkill,
  CompanyUserProfileSkillHistory,
  CompanyUserSkill,
  HasAbsenceInformation,
  HasAssignments,
  HasTeamInformation,
  Project,
  ProjectAssignmentBase,
  ProjectPipelineStage,
  ProjectState,
  TimeSpan,
  WithProfile,
} from './types';

const latestChangeFirst = (
  a: CompanyUserProfileSkillHistory,
  b: CompanyUserProfileSkillHistory
): number => {
  return (
    new Date(b.changeDateTime ?? 0).getTime() -
    new Date(a.changeDateTime ?? 0).getTime()
  );
};

export const findLatestChangeDate = (
  skill: CompanyUserProfileSkill
): string | null => {
  if (!skill.changeHistory || !skill.changeHistory.length) {
    return null;
  }

  return skill.changeHistory.sort(latestChangeFirst)[0].changeDateTime ?? null;
};

const descendingBySkillLevel = (
  a: CompanyUserSkill,
  b: CompanyUserSkill
): number =>
  (b.level ?? Number.MIN_SAFE_INTEGER) - (a.level ?? Number.MIN_SAFE_INTEGER);

const latelyChangedFirst = (
  a: CompanyUserSkill,
  b: CompanyUserSkill
): number => {
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

const favouriteFirst = (a: CompanyUserSkill, b: CompanyUserSkill): number => {
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
const resolveSkillTranslation = (
  lang: string,
  skill: CompanyUserProfileSkill
): string | null => {
  if (!skill.translations || !skill.translations.length) {
    return null;
  }

  const translation = skill.translations.find(
    (t) => t.profileTranslation?.languageBranch?.language?.lang === lang
  );

  if (translation) {
    return translation.keywordSynonym?.name ?? null;
  }

  return null;
};

// Filter for project list to select only projects that are in specific state
const isInState =
  (...states: ProjectState[]) =>
  (project: Project) =>
    states.includes(project.currentState ?? Number.MIN_SAFE_INTEGER);

export const isInOpenState = isInState(ProjectState.Open);

export const isInWonState = isInState(ProjectState.Won);

// Filter for project list to select only projects that are in specific stage
export const isInStage =
  (...stages: number[]) =>
  (project: Project) =>
    stages.includes(project.currentStageId ?? Number.MIN_SAFE_INTEGER);

export const isActiveProject = (project: Project) =>
  isInWonState(project) && project.assignments?.some(isActiveNow);

// Filter for users to only users that are updated after specific date
export const notUpdatedSince =
  (since: moment.MomentInput) =>
  ({ updatedDateTime }: CompanyUserExtended) =>
    moment(updatedDateTime).isBefore(since);

export const employmentStarted = (user: CompanyUser) => {
  return (
    !user.employmentStartDate || moment(user.employmentStartDate).isBefore()
  );
};

export const endingEmploymentInWeek = (user: CompanyUser) => {
  return (
    !!user.employmentEndDate &&
    moment(user.employmentEndDate).isBefore(moment().add(1, 'week'))
  );
};

export const onlyInTeams = (
  user: CompanyUserBase & HasTeamInformation,
  teamNames: string[]
): boolean => {
  if (!user.teamMembers) {
    throw new Error(
      "Trying to use 'onlyInTeams' filter to data that is scarce user data!"
    );
  }
  return user.teamMembers.every(({ team }) =>
    team?.name ? teamNames.includes(team.name) : false
  );
};

export const dropByEmail =
  (emails: string[]) =>
  (user: CompanyUserExtended): boolean => {
    return user.companyUserEmail
      ? !emails.includes(user.companyUserEmail)
      : true;
  };

export const isActiveNow = (item: TimeSpan): boolean =>
  !item.startDate ||
  (moment(item.startDate).isBefore() &&
    (!item.endDate || moment(item.endDate).isAfter()));

export const assignmentInFuture = (assignment: ProjectAssignmentBase) =>
  assignment.startDate && moment(assignment.startDate).isAfter();

export const hasActiveRole = (user: HasAssignments): boolean => {
  return (
    user.assignments.assigned?.some(
      (assignment) =>
        (!assignment.startDate ||
          moment(assignment.startDate).isBefore(moment().add(2, 'weeks'))) &&
        (!assignment.endDate || moment(assignment.endDate).isAfter())
    ) ?? false
  );
};

export const onlyActivePeople = (user: HasTeamInformation): boolean => {
  return employmentStarted(user) && !endingEmploymentInWeek(user);
};

export const isAway = (
  user: HasTeamInformation & HasAbsenceInformation
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

export const getOrderedSkills = (user: WithProfile) => {
  if (!user.profile?.skills) {
    return [];
  }
  return user.profile.skills
    .filter(
      (skill) =>
        (skill.level ?? Number.MIN_SAFE_INTEGER) >= 4 || skill.favourite
    )
    .sort(latelyChangedFirst)
    .sort(descendingBySkillLevel)
    .sort(favouriteFirst);
};

export const isActiveAssignment = (assignment: ProjectAssignmentBase) =>
  isActiveNow(assignment) || assignmentInFuture(assignment);

export const getActiveAssignments = (assignments: ProjectAssignmentBase[]) =>
  assignments.filter(isActiveAssignment);

export const getActiveAbsences = (absences: AbsencePeriodDto[]) =>
  absences.filter(isActiveNow);

export const resolveSkillName = (skill: CompanyUserProfileSkill) => {
  return resolveSkillTranslation('en', skill) || skill.keyword?.masterSynonym;
};

export const formatProjectState = (project: Project) =>
  projectStateToHumanReadable(project.currentState);
export const formatProjectStage = (
  project: Project,
  stages: ProjectPipelineStage[]
) =>
  projectStageToHumanReadable(
    project.currentStageId ?? Number.MIN_SAFE_INTEGER,
    stages
  );
