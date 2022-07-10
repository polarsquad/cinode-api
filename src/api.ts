import ExpiryMap from 'expiry-map';
import { Got } from 'got/dist/source';
import memoize from 'p-memoize';

import {
  AbsencePeriodDto,
  CompanyBase,
  CompanyCustomer,
  CompanyCustomerBase,
  CompanyImage,
  CompanyUser,
  CompanyUserBase,
  CompanyUserProfileFull,
  CompanyUserProfileSkill,
  CompanyUserProjectAssignment,
  CompanyUserSkill,
  Project,
  ProjectAssignment,
  ProjectAssignmentEdit,
  ProjectBase,
  ProjectPipeline,
  SearchResult,
  SearchSkillResult,
} from './types';

/**
 * @deprecated
 * Prefer using the Service instead of this class directly
 */
export class Api {
  private readonly client: Got;
  readonly company: CompanyBase;

  constructor(company: CompanyBase, client: Got) {
    this.company = company;
    this.client = client;
  }

  listUsers() {
    return this.client
      .get(`v0.1/companies/${this.company.id}/users`)
      .json<CompanyUser[]>();
  }

  listAllCustomers() {
    return this.client
      .get(`v0.1/companies/${this.company.id}/customers`)
      .json<CompanyCustomerBase[]>();
  }

  getCustomer(id: number | string) {
    return this.client
      .get(`v0.1/companies/${this.company.id}/customers/${id}`)
      .json<CompanyCustomer>();
  }

  async listAllProjects(query = {}) {
    const {
      pagedAndSortedBy: { itemsPerPage },
      totalItems,
    } = await this.client
      .post(`v0.1/companies/${this.company.id}/projects/search`, {
        json: query,
      })
      .json<SearchResult<ProjectBase>>();

    const results = await Promise.all(
      [...Array(Math.ceil(totalItems / itemsPerPage)).keys()].map((pageIndex) =>
        this.client
          .post(`v0.1/companies/${this.company.id}/projects/search`, {
            json: { ...query, pageAndSortBy: { page: pageIndex + 1 } },
          })
          .json<SearchResult<ProjectBase>>()
      )
    );

    return results.map(({ result: result_2 }) => result_2 ?? []).flat();
  }

  getProject(id: number | string) {
    return this.client
      .get(`v0.1/companies/${this.company.id}/projects/${id}`)
      .json<Project>();
  }

  updateProjectState(projectId: number | string, newState) {
    return this.updateProject(projectId, { projectState: newState });
  }

  async updateProject(projectId: number | string, changes) {
    const project = await this.getProject(projectId);
    return await this.client
      .put(`v0.1/companies/${this.company.id}/projects/${projectId}`, {
        json: {
          title: project.title,
          customerId: project.customerId,
          description: project.description,
          identifier: project.identifier,
          customerIdentifier: project.customerIdentifier,
          intermediatorId: project.intermediator?.id ?? null,
          estimatedCloseDate: project.estimatedCloseDate,
          estimatedValue: project.estimatedValue,
          probability: project.probability,
          pipelineId: project.pipelineId,
          pipelineStageId: project.currentStageId,
          currencyId: project.currency?.id ?? null,
          projectState: project.currentState,
          teamId: project.teamId,

          ...changes,
        },
      })
      .json<Project>();
  }

  getUser(userId: number | string) {
    return this.client
      .get(`v0.1/companies/${this.company.id}/users/${userId}`)
      .json<CompanyUser>();
  }

  updateDesiredAssignment(userId: number | string, desiredAssignment: string) {
    return this.client
      .patch(`v0.1/companies/${this.company.id}/users/${userId}`, {
        json: [
          {
            path: 'desiredAssignment',
            op: 'replace',
            value: desiredAssignment,
          },
        ],
      })
      .json<CompanyUser>();
  }

  getUserAssignments(userId: number | string) {
    return this.client
      .get(`v0.1/companies/${this.company.id}/users/${userId}/roles`)
      .json<CompanyUserProjectAssignment>();
  }

  getUserAbsences(userId: number | string) {
    return this.client
      .get(`v0.1/companies/${this.company.id}/users/${userId}/absences`)
      .json<AbsencePeriodDto[]>();
  }

  getUserSkills(userId: number | string) {
    return this.client
      .get(`v0.1/companies/${this.company.id}/users/${userId}/skills`)
      .json<CompanyUserSkill[]>();
  }

  getUserProfileSkill(userId: number | string, skillId: number | string) {
    return this.client
      .get(
        `v0.1/companies/${this.company.id}/users/${userId}/profile/skills/${skillId}`
      )
      .json<CompanyUserProfileSkill>();
  }

  async getProjectAssignments(projectId: number | string) {
    const { assignments } = await this.getProject(projectId);
    return Promise.all(
      (assignments || []).flatMap(({ id: id_1 }) =>
        id_1 ? [this.getProjectAssignment(projectId, id_1)] : []
      )
    );
  }

  getProjectAssignment(
    projectId: number | string,
    assignmentId: number | string
  ) {
    return this.client
      .get(
        `v0.1/companies/${this.company.id}/projects/${projectId}/roles/${assignmentId}`
      )
      .json<ProjectAssignment>();
  }

  async updateProjectAssignment(
    projectId: number | string,
    assignmentId: number | string,
    updatedFields
  ) {
    const assignment = await this.getProjectAssignment(projectId, assignmentId);
    return await this.client
      .put(
        `v0.1/companies/${this.company.id}/projects/${projectId}/roles/${assignmentId}`,
        {
          json: {
            // Only following fields are modifiable
            projectAssignmentId: assignmentId,
            title: assignment.title,
            description: assignment.description,
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            rate: assignment.rate,
            extent: assignment.extent,
            oralAgreementToDate: assignment.oralAgreementToDate,
            optionToDate: assignment.optionToDate,
            contractType: assignment.contractType,
            extentType: assignment.extentType,
            currencyId: assignment.currency?.id ?? null,

            ...updatedFields,
          },
        }
      )
      .json<ProjectAssignmentEdit>();
  }

  private readonly cache = new ExpiryMap(7 * 24 * 60 * 1000); // Emails doesn't change too often, cache one week);
  getUserEmail = memoize(
    (userId: number | string): Promise<CompanyUser['companyUserEmail']> =>
      this.getUser(userId).then((u) => u.companyUserEmail),
    {
      cache: this.cache,
    }
  );

  resolveUserIdByEmail = memoize(
    (email: string): Promise<CompanyUserBase['companyUserId']> =>
      this.searchUsers(email).then((search) => {
        if (!search.hits || !search.result) {
          throw new Error('Not found');
        } else if (search.hits > 1) {
          throw new Error(`Found too many (hits ${search.hits})`);
        }

        return search.result[0].companyUserId;
      }),
    {
      cache: this.cache,
    }
  );

  whoHasSkills = (terms: string[], min = 0, max = 5) =>
    Promise.all(terms.map((term) => this.whoHasSkill(term, min, max, 0))).then(
      (results) => {
        const keywordIds = results.flatMap(
          ({ query }) =>
            query?.skills?.flatMap(({ keywordId }) =>
              keywordId ? [keywordId] : []
            ) ?? []
        );
        return this.client
          .post(`v0.1/companies/${this.company.id}/skills/search`, {
            json: {
              skills: keywordIds.map((keywordId) => ({
                keywordId,
                min,
                max,
              })),
            },
          })
          .json<SearchSkillResult>();
      }
    );

  whoHasSkill = (skill: string, min = 0, max = 5, limit = 100) =>
    this.client
      .post(`v0.1/companies/${this.company.id}/skills/search/term`, {
        json: {
          term: skill,
          min,
          max,
          limit,
        },
      })
      .json<SearchSkillResult>();

  getUserImages = (userId: number | string) =>
    this.client
      .get(`v0.1/companies/${this.company.id}/users/${userId}/images`)
      .json<CompanyImage[]>();

  async getUserByEmail(email: string) {
    const userId = await this.resolveUserIdByEmail(email);
    if (!userId) {
      throw new Error('Not found');
    }
    return this.getUser(userId);
  }

  searchUsers = (term: string) =>
    this.client
      .post(`v0.1/companies/${this.company.id}/users/search`, {
        json: {
          term: term,
        },
      })
      .json<SearchResult<CompanyUserBase>>();

  getProfile = (userId: number | string) =>
    this.client
      .get(`v0.1/companies/${this.company.id}/users/${userId}/profile`)
      .json<CompanyUserProfileFull>();

  addSkill = (userId: number | string, skill: string, level: number | string) =>
    this.client
      .post(
        `v0.1/companies/${this.company.id}/users/${userId}/profile/skills`,
        {
          headers: {
            'Content-type': 'application/json-patch+json',
          },
          json: {
            name: skill,
            level,
          },
        }
      )
      .json<CompanyUserProfileSkill | undefined>();

  updateSkill = (
    userId: number | string,
    skillId: number | string,
    keywordSynonymId: number | string,
    level: number | string
  ) =>
    this.client
      .put(
        `v0.1/companies/${this.company.id}/users/${userId}/profile/skills/${skillId}`,
        {
          json: {
            keywordSynonymId,
            level,
          },
        }
      )
      .json<CompanyUserProfileSkill>();

  deleteSkill = (userId: number | string, skillId: number | string) =>
    this.client
      .delete(
        `v0.1/companies/${this.company.id}/users/${userId}/profile/skills/${skillId}`
      )
      .json<void>();

  private readonly projectPipelineCache = new ExpiryMap(60 * 1000); // Cache pipelines for an hour
  getProjectPipelines = memoize(
    () =>
      this.client
        .get(`v0.1/companies/${this.company.id}/projects/pipelines`)
        .json<ProjectPipeline[]>(),
    {
      cache: this.projectPipelineCache,
    }
  );
}
