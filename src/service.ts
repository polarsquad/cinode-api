import ExpiryMap from 'expiry-map';
import memoize from 'p-memoize';

import { Api } from './api.js';
import type {
  AllocationStatus,
  AssignmentMemberType,
  AssignmentStatus,
  Company,
  CompanyUser,
  CompanyUserBase,
  CompanyUserProfileSkill,
  HasAbsenceInformation,
  HasAssignments,
  HasImage,
  HasTeamInformation,
  Project,
  ProjectAssignment,
  ProjectBase,
  ProjectState,
  ProjectTeam,
  SearchProjectQuery,
  UserFilter,
  WithProfile,
} from './types.js';
import { getImageUrl } from './urls.js';
import {
  dropByEmail,
  hasActiveRole,
  isActiveProject,
  onlyActivePeople,
  onlyInTeams,
} from './utils.js';

const ignoreError = () => undefined;

const keywordMatch = (name: string) => (item: CompanyUserProfileSkill) => {
  return (
    item.keyword?.synonyms?.some(
      (syn) => syn.toLowerCase() === name.toLowerCase()
    ) ?? false
  );
};

// Note: this whole skill data model is pretty complex
// and hard to understand without proper docs.
// Somehow, managed to get updating skill work by finding
// the synonym ID from the translations, but here's big
// risk to come up some bugs.
const resolveSynonymId = (skill: CompanyUserProfileSkill, name: string) => {
  const translation = skill.translations?.find(keywordMatch(name));
  if (!translation?.keywordSynonymId) {
    throw new Error(`Could not find translation for name: ${name}`);
  }
  return translation.keywordSynonymId;
};

export class CinodeService {
  private readonly api: Api;
  private readonly ignoredEmails: string[];
  private readonly backofficeTeams: string[];

  constructor(
    api: any,
    ignoredEmails: string[] = [],
    backofficeTeams: string[] = []
  ) {
    this.api = api;
    this.ignoredEmails = ignoredEmails;
    this.backofficeTeams = backofficeTeams;
  }

  async getAllProjects(query: SearchProjectQuery = {}) {
    const projects = await this.api.listAllProjects(query);
    return Promise.all(
      projects.flatMap((p) => (p?.id ? [this.getProject(p.id)] : []))
    );
  }

  async getActiveProjects() {
    return (await this.getAllProjects()).filter(isActiveProject);
  }

  async getActiveCustomers() {
    const active = await this.getActiveProjects();
    const customerIds = [
      ...new Set(
        active.flatMap((p) => (p.customer?.id ? [p.customer.id] : []))
      ),
    ];
    return Promise.all(
      customerIds.map((customerId) => this.getCustomer(customerId))
    );
  }

  async getAllCustomers() {
    const customers = await this.api.listAllCustomers();
    return Promise.all(
      customers.flatMap(({ id }) => (id ? [this.api.getCustomer(id)] : []))
    );
  }

  getCompany(): Company {
    return this.api.company;
  }

  async getCustomer(id: number) {
    return await this.api.getCustomer(id);
  }

  async getProject(id: number) {
    return await this.api.getProject(id);
  }

  async getUserEmail(userId: number) {
    return await this.api.getUserEmail(userId);
  }

  async getUserByEmail(email: string) {
    return await this.api.getUserByEmail(email);
  }

  async listAssignments(options: {
    pipelines?: number[];
    projectAssignmentMemberTypes?: AssignmentMemberType[];
    projectAssignmentStatuses?: AssignmentStatus[];
    teams?: number[];
    projectStates?: ProjectState[];
    projectAssignmentAllocationStatuses?: AllocationStatus[];
  }) {
    return await this.api.listAssignments(options);
  }

  async getUserAssignments(userId: number) {
    return await this.api.getUserAssignments(userId);
  }

  async getUserProjects(userId: number) {
    const assignments = await this.getUserAssignments(userId);

    return [
      ...(assignments.assigned ?? []),
      ...(assignments.prospect ?? []),
    ].flatMap((a) => (a.project ? [a.project] : []));
  }

  async getUserSkills(userId: number) {
    return await this.api.getUserSkills(userId);
  }

  async getUserProfileSkill(userId: number, skillId: number) {
    return await this.api.getUserProfileSkill(userId, skillId);
  }

  getProjectsWithTeamMatesCache = new ExpiryMap(5 * 1000); // The project information doesn't get cached for that long time
  getProjectsWithTeamMates = memoize(
    async (userId: number): Promise<(ProjectBase & ProjectTeam)[]> => {
      const projects = await this.getUserProjects(userId);

      return Promise.all(
        projects.map(async (p) => {
          if (!p.id) throw new Error(`Project is missing an ID: ${p}`);
          return {
            ...p,
            ...(await this.getProjectTeamMates(p.id)),
          };
        })
      );
    },
    {
      cache: this.getProjectsWithTeamMatesCache,
    }
  );

  async getUserImage(userId: number) {
    const images = await this.api.getUserImages(userId);
    if (images.length === 0) return;
    return images.pop();
  }

  getUserImageUrlCache = new ExpiryMap(24 * 60 * 1000); // User images doesn't change too often, cache one day
  getUserImageUrl = memoize(
    async (userId: number): Promise<string | undefined> => {
      const images = await this.api.getUserImages(userId);
      const lastImage = images.pop();
      if (!lastImage) return;
      return getImageUrl(lastImage);
    },
    {
      cache: this.getUserImageUrlCache,
    }
  );

  async getUsers() {
    const users = await this.listUsers();
    return Promise.all(
      users.flatMap((u) =>
        u.companyUserId ? [this.getUser(u.companyUserId)] : []
      )
    );
  }

  async getUser(id: number) {
    return await this.api.getUser(id);
  }

  async getActiveConsultants(): Promise<
    (CompanyUser & HasTeamInformation & HasAbsenceInformation)[]
  > {
    return (await this.getActivePeople()).filter(
      (user) => !onlyInTeams(user, this.backofficeTeams)
    );
  }

  async getActivePeople(): Promise<(CompanyUser & HasAbsenceInformation)[]> {
    const users = (await this.getUsers())
      .filter(onlyActivePeople)
      .filter(dropByEmail(this.ignoredEmails));
    return Promise.all(
      users.map(async (user) => {
        if (!user.companyUserId)
          throw new Error(`User is missing companyUserId: ${user}`);
        return {
          ...user,
          absences: await this.getUserAbsences(user.companyUserId),
        };
      })
    );
  }

  async getAvailableConsultants(): Promise<
    (CompanyUser &
      HasTeamInformation &
      HasAssignments &
      WithProfile &
      HasAbsenceInformation)[]
  > {
    return await this.getFilteredConsultants((u) => !hasActiveRole(u));
  }

  async getBookedConsultants(): Promise<
    (CompanyUser &
      HasTeamInformation &
      HasAssignments &
      WithProfile &
      HasAbsenceInformation)[]
  > {
    return await this.getFilteredConsultants((u) => hasActiveRole(u));
  }

  async getFilteredConsultants(
    userFilter: UserFilter = (u) => u.seoId === u.seoId
  ): Promise<
    (CompanyUser &
      HasTeamInformation &
      HasAssignments &
      WithProfile &
      HasAbsenceInformation)[]
  > {
    const users = await this.getActiveConsultants();
    const usersWithAssignments = await Promise.all(
      users.map(async (user) => {
        if (!user.companyUserId)
          throw new Error(`User is missing companyUserId: ${user}`);
        return {
          ...user,
          assignments: await this.api.getUserAssignments(user.companyUserId),
        };
      })
    );

    // Enrich the data with full user information
    return Promise.all(
      usersWithAssignments.filter(userFilter).map(async (user) => {
        if (!user.companyUserId)
          throw new Error(`User is missing companyUserId: ${user}`);
        return {
          ...user,
          profile: await this.getProfile(user.companyUserId),
          absences: await this.getUserAbsences(user.companyUserId),
        };
      })
    );
  }

  private async populateWithUserImageUrl(
    u: CompanyUserBase
  ): Promise<CompanyUserBase & HasImage> {
    return {
      ...u,
      imageUrl: await this.getUserImageUrl(
        u.companyUserId ?? Number.MIN_SAFE_INTEGER
      ),
    };
  }

  async getProjectAssignment(projectId: number, assignmentId: number) {
    return await this.api.getProjectAssignment(projectId, assignmentId);
  }

  async getProjectAssignments(projectId: number) {
    return await this.api.getProjectAssignments(projectId);
  }

  async getProjectTeamMates(projectId: number): Promise<ProjectTeam> {
    const assignments = await this.getProjectAssignments(projectId);
    const assigned = await Promise.all(
      assignments
        .flatMap((a) => (a.assigned ? [a.assigned] : []))
        .map((member) => this.populateWithUserImageUrl(member))
    );

    const openRoles: number = assignments.filter(
      (a) => !a.assigned && !a.prospects?.length
    ).length;

    const prospects = await Promise.all(
      assignments
        .flatMap((assignment) => assignment.prospects ?? [])
        .map((member) => this.populateWithUserImageUrl(member))
    );

    return { assigned, prospects, openRoles };
  }

  async updateSkillByEmail(email: string, skillName: string, level: string) {
    const userId = await this.api.resolveUserIdByEmail(email);
    if (!userId) {
      throw new Error(`No user found with email: ${email}`);
    }

    const profile = await this.getProfile(userId);

    const existingSkill = profile
      ? profile.skills?.find(keywordMatch(skillName))
      : null;

    if (existingSkill?.id) {
      return this.api.updateSkill(
        userId,
        existingSkill.id,
        resolveSynonymId(existingSkill, skillName),
        level
      );
    }

    return this.api.addSkill(userId, skillName, level);
  }

  async removeSkillByEmail(email: string, skill: string) {
    const userId = await this.api.resolveUserIdByEmail(email);
    if (!userId) {
      console.warn(`No user found with email: ${email}`);
      return Promise.resolve(null);
    }

    const profile = await this.getProfile(userId);

    const existingSkill = profile
      ? profile.skills?.find(keywordMatch(skill))
      : null;

    if (existingSkill?.id) {
      return this.api
        .deleteSkill(userId, existingSkill.id)
        .then(() => existingSkill);
    }
    return Promise.resolve(null);
  }

  async getProfile(userId: number) {
    return this.api.getProfile(userId).catch(ignoreError);
  }

  async getProjectPipelines() {
    return this.api.getProjectPipelines();
  }

  async getProjectPipeline(id: number) {
    return (await this.api.getProjectPipelines()).find((p) => p.id === id);
  }

  async getProjectPipelineByTitle(title: string) {
    return (await this.getProjectPipelines()).find((p) => p.title === title);
  }

  async getProjectPipelineStageByTitles(
    pipelineTitle: string,
    stageTitle: string
  ) {
    return (await this.getProjectPipelineByTitle(pipelineTitle))?.stages?.find(
      (s) => s.title === stageTitle
    );
  }

  async getUserAbsences(userId: number) {
    return await this.api.getUserAbsences(userId);
  }

  async listUsers() {
    return this.api.listUsers();
  }

  async resolveUserIdByEmail(email: string) {
    return await this.api.resolveUserIdByEmail(email);
  }

  async searchUsers(term: string) {
    return await this.api.searchUsers(term);
  }

  async setProjectAssignmentDates(
    projectId: number,
    assignmentId: number,
    updatedFields: Pick<ProjectAssignment, 'startDate' | 'endDate'>
  ) {
    return await this.api.updateProjectAssignment(
      projectId,
      assignmentId,
      updatedFields
    );
  }

  async updateDesiredAssignment(userId: number, desiredAssignment: string) {
    return await this.api.updateDesiredAssignment(userId, desiredAssignment);
  }

  async updateProjectState(
    projectId: number,
    newState: Project['currentState']
  ) {
    return await this.api.updateProject(projectId, { projectState: newState });
  }

  async whoHasSkills(terms: string[], min = 0, max = 5) {
    return await this.api.whoHasSkills(terms, min, max);
  }

  async getTeam(teamId: number) {
    return this.api.getTeam(teamId);
  }

  async addProjectAssignmentSkill(
    projectId: number,
    roleId: number,
    skill: string,
    level: number,
    isMandatory: boolean
  ) {
    return await this.api.addProjectAssignmentSkill(
      projectId,
      roleId,
      skill,
      level,
      isMandatory
    );
  }

  async updateProjectAssignmentSkill(
    projectId: number,
    roleId: number,
    skillId: number,
    level: number,
    isMandatory: boolean
  ) {
    return await this.api.updateProjectAssignmentSkill(
      projectId,
      roleId,
      skillId,
      level,
      isMandatory
    );
  }

  async removeProjectAssignmentSkill(
    projectId: number,
    roleId: number,
    skillId: number
  ) {
    return await this.api.removeProjectAssignmentSkill(
      projectId,
      roleId,
      skillId
    );
  }
}
