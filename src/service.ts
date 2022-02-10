import memoize from 'p-memoize';
import ExpiryMap from 'expiry-map';
import type {
  Absence,
  Assignment,
  CustomerBase,
  Customer,
  HasAbsenceInformation,
  HasAssignments,
  HasImage,
  WithProfile,
  HasTeamInformation,
  Image,
  Profile,
  Project,
  ProjectTeam,
  Skill,
  User,
  UserFilter,
} from './types';
import { getImageUrl } from './urls';
import {
  hasActiveRole,
  onlyActivePeople,
  isActiveProject,
  dropByEmail,
  onlyInTeams,
} from './utils';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const ignoreError = () => {};

const keywordMatch =
  (name: string) =>
  (item: Skill): boolean => {
    return item.keyword.synonyms.some(
      (syn) => syn.toLowerCase() === name.toLowerCase()
    );
  };

// Note: this whole skill data model is pretty complex
// and hard to understand without proper docs.
// Somehow, managed to get updating skill work by finding
// the synonym ID from the translations, but here's big
// risk to come up some bugs.
const resolveSynonymId = (skill, name) => {
  const translation = skill.translations.find(keywordMatch(name));
  return translation.keywordSynonymId;
};

export class CinodeService {
  api: any;
  ignoredEmails: string[];
  backofficeTeams: string[];

  constructor(api: any, ignoredEmails: string[], backofficeTeams: string[]) {
    this.api = api;
    this.ignoredEmails = ignoredEmails;
    this.backofficeTeams = backofficeTeams;
  }

  async getAllProjects(): Promise<Project[]> {
    return this.api
      .listAllProjects()
      .then((p: Project[]) =>
        Promise.all(p.map(({ id }) => this.api.getProject(id)))
      );
  }

  async getActiveProjects(): Promise<Project[]> {
    return (await this.getAllProjects()).filter(isActiveProject);
  }

  async getActiveCustomers(): Promise<Customer[]> {
    const active = await this.getActiveProjects();
    const customerIds = [...new Set(active.map((p) => p.customer.id))];
    return Promise.all(
      customerIds.map((customerId) => this.getCustomer(customerId))
    );
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.api
      .listAllCustomers()
      .then((c: CustomerBase[]) =>
        Promise.all(c.map(({ id }) => this.api.getCustomer(id)))
      );
  }

  async getCustomer(id: number): Promise<Customer> {
    return (await this.api.getCustomer(id)) as Customer;
  }

  async getUserProjects(userId: number): Promise<Project[]> {
    const assignments = (await this.api.getUserAssignments(userId)) as {
      assigned: Assignment[];
      prospect: Assignment[];
    };

    return [...assignments.assigned, ...assignments.prospect].map(
      (a) => a.project
    );
  }

  async getUserSkills(userId: number) {
    return await this.api.getUserSkills(userId);
  }

  async getUserProfileSkill(userId: number, skillId: number) {
    return await this.api.getUserProfileSkill(userId, skillId);
  }
  getProjectsWithTeamMatesCache = new ExpiryMap(5 * 1000); // The project information doesn't get cached for that long time
  getProjectsWithTeamMates = memoize(
    async (userId: number): Promise<(Project & ProjectTeam)[]> => {
      const projects = await this.getUserProjects(userId);

      return Promise.all(
        projects.map(async (p) => ({
          ...p,
          ...(await this.getProjectTeamMates(p.id)),
        }))
      );
    },
    {
      cache: this.getProjectsWithTeamMatesCache,
    }
  );

  async getUserImage(userId: number): Promise<Image | undefined> {
    const images = (await this.api.getUserImages(userId)) as Image[];
    if (images.length) {
      return images.pop();
    }
  }

  getUserImageUrlCache = new ExpiryMap(24 * 60 * 1000); // User images doesn't change too often, cache one day
  getUserImageUrl = memoize(
    async (userId: number): Promise<string | undefined> => {
      const images = (await this.api.getUserImages(userId)) as Image[];
      if (images.length) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return getImageUrl(images.pop()!);
      }
    },
    {
      cache: this.getUserImageUrlCache,
    }
  );

  async listUsers(): Promise<User[]> {
    return this.api.listUsers() as User[];
  }

  async getUsers(): Promise<(User & HasTeamInformation)[]> {
    const users = await this.listUsers();
    return Promise.all(users.map((u) => this.getUser(u.companyUserId)));
  }

  async getUser(id: number): Promise<User & HasTeamInformation> {
    return (await this.api.getUser(id)) as User & HasTeamInformation;
  }

  async getActiveConsultants(): Promise<
    (User & HasTeamInformation & HasAbsenceInformation)[]
  > {
    return (await this.getActivePeople()).filter(
      (user) => !onlyInTeams(user, this.backofficeTeams)
    );
  }

  async getActivePeople(): Promise<
    (User & HasTeamInformation & HasAbsenceInformation)[]
  > {
    const users = await this.getUsers();
    return Promise.all(
      users
        .filter(onlyActivePeople)
        .filter(dropByEmail(this.ignoredEmails))
        .map(
          async (
            user: any
          ): Promise<User & HasTeamInformation & HasAbsenceInformation> => ({
            ...user,
            absences: (await this.api.getUserAbsences(
              user.companyUserId
            )) as Absence[],
          })
        )
    );
  }

  async getAvailableConsultants(): Promise<
    (User &
      HasTeamInformation &
      HasAssignments &
      WithProfile &
      HasAbsenceInformation)[]
  > {
    return await this.getFilteredConsultants((u) => !hasActiveRole(u));
  }

  async getFilteredConsultants(
    userFilter: UserFilter = (u: User & HasAssignments) => u.seoId === u.seoId
  ): Promise<
    (User &
      HasTeamInformation &
      HasAssignments &
      WithProfile &
      HasAbsenceInformation)[]
  > {
    const users = await this.getActiveConsultants();
    const usersWithAssignments = await Promise.all(
      users.map(async (user) => ({
        ...user,
        assignments: await this.api.getUserAssignments(user.companyUserId),
      }))
    );

    // Enrich the data with full user information
    return Promise.all(
      usersWithAssignments.filter(userFilter).map(async (user) => ({
        ...user,
        profile: await this.getProfile(user.companyUserId),
        absences: (await this.api.getUserAbsences(
          user.companyUserId
        )) as Absence[],
      }))
    );
  }

  async getProjectTeamMates(projectId: number): Promise<ProjectTeam> {
    const populateWithUserImageUrl = async (
      u: User
    ): Promise<User & HasImage> => ({
      ...u,
      imageUrl: await this.getUserImageUrl(u.companyUserId),
    });

    const assignments: Assignment[] = await this.api.getProjectAssignments(
      projectId
    );
    const assigned: (User & HasImage)[] = await Promise.all(
      assignments
        .map((a) => a.assigned)
        .filter((a) => a)
        .map(populateWithUserImageUrl)
    );

    const openRoles: number = assignments.filter(
      (a) => !a.assigned && !a.prospects.length
    ).length;

    const prospects: (User & HasImage)[] = await Promise.all(
      assignments
        .map((a) => a.prospects)
        .flat()
        .map(populateWithUserImageUrl)
    );

    return { assigned, prospects, openRoles };
  }

  async updateSkillByEmail(email: string, skill: string, level: string) {
    const userId: number = await this.api.resolveUserIdByEmail(email);
    const profile = await this.getProfile(userId);

    const existingSkill = profile
      ? profile.skills.find(keywordMatch(skill))
      : null;

    if (existingSkill) {
      return this.api.updateSkill(
        userId,
        existingSkill.id,
        resolveSynonymId(existingSkill, skill),
        level
      );
    }

    return this.api.updateProfileSkill(userId, skill, level);
  }

  async removeSkillByEmail(
    email: string,
    skill: string
  ): Promise<Skill | null> {
    const userId = await this.api.resolveUserIdByEmail(email);
    const profile = await this.getProfile(userId);

    const existingSkill = profile
      ? profile.skills.find(keywordMatch(skill))
      : null;

    if (existingSkill) {
      return this.api
        .deleteSkill(userId, existingSkill.id)
        .then(() => existingSkill);
    }
    return Promise.resolve(null);
  }

  async getProfile(userId: number): Promise<Profile | undefined> {
    return this.api.getProfile(userId).catch(ignoreError);
  }
}
