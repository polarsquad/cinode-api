import memoize from 'p-memoize';
import ExpiryMap from 'expiry-map';
import { cinodeConfig } from './config';
import clientBuilder from './client';

/**
 * @deprecated
 * In the past this was Cinode API wrapper.
 * We should not use this directly anymore because it's untyped, but rather use the Service.
 */
export class Api {
  private readonly client;
  private companyId;

  constructor(companyId, client) {
    this.companyId = companyId;
    this.client = client;
  }

  listUsers() {
    return this.client.get(`v0.1/companies/${this.companyId}/users`).json();
  }

  listAllCustomers() {
    return this.client.get(`v0.1/companies/${this.companyId}/customers`).json();
  }

  getCustomer(id) {
    return this.client
      .get(`v0.1/companies/${this.companyId}/customers/${id}`)
      .json();
  }

  listAllProjects(query = {}) {
    return this.client
      .post(`v0.1/companies/${this.companyId}/projects/search`, {
        json: query,
      })
      .json()
      .then(({ pagedAndSortedBy: { itemsPerPage }, totalItems }) =>
        Promise.all(
          [...Array(Math.ceil(totalItems / itemsPerPage)).keys()].map(
            (pageIndex) =>
              this.client
                .post(`v0.1/companies/${this.companyId}/projects/search`, {
                  json: { ...query, pageAndSortBy: { page: pageIndex + 1 } },
                })
                .json()
          )
        ).then((results) => results.map(({ result }) => result).flat())
      );
  }

  getProject(id) {
    return this.client
      .get(`v0.1/companies/${this.companyId}/projects/${id}`)
      .json();
  }

  updateProjectState(projectId, newState) {
    return this.updateProject(projectId, { projectState: newState });
  }

  updateProject(projectId, changes) {
    return this.getProject(projectId).then((project) =>
      this.client
        .put(`v0.1/companies/${this.companyId}/projects/${projectId}`, {
          json: {
            title: project.title,
            customerId: project.customerId,
            description: project.description,
            identifier: project.identifier,
            customerIdentifier: project.customerIdentifier,
            intermediatorId: project.intermediator
              ? project.intermediatorId
              : null,
            estimatedCloseDate: project.estimatedCloseDate,
            estimatedValue: project.estimatedValue,
            probability: project.probability,
            pipelineId: project.pipelineId,
            pipelineStageId: project.currentStageId,
            currencyId: project.currency ? project.currencyId : null,
            projectState: project.currentState,
            teamId: project.teamId,

            ...changes,
          },
        })
        .json()
    );
  }

  getUser(userId) {
    return this.client
      .get(`v0.1/companies/${this.companyId}/users/${userId}`)
      .json();
  }

  updateDesiredAssignment(userId, desiredAssignment) {
    return this.client
      .patch(`v0.1/companies/${this.companyId}/users/${userId}`, {
        json: [
          {
            path: 'desiredAssignment',
            op: 'replace',
            value: desiredAssignment,
          },
        ],
      })
      .json();
  }

  getUserAssignments(userId) {
    return this.client
      .get(`v0.1/companies/${this.companyId}/users/${userId}/roles`)
      .json();
  }

  getUserAbsences(userId) {
    return this.client
      .get(`v0.1/companies/${this.companyId}/users/${userId}/absences`)
      .json();
  }

  getUserSkills(userId) {
    return this.client
      .get(`v0.1/companies/${this.companyId}/users/${userId}/skills`)
      .json();
  }

  getUserProfileSkill(userId, skillId) {
    return this.client
      .get(
        `v0.1/companies/${this.companyId}/users/${userId}/profile/skills/${skillId}`
      )
      .json();
  }

  getProjectAssignments(projectId) {
    return this.getProject(projectId).then(({ assignments }) =>
      Promise.all(
        assignments.map(async ({ id }) =>
          this.getProjectAssignment(projectId, id)
        )
      )
    );
  }

  getProjectAssignment(projectId, assignmentId) {
    return this.client
      .get(
        `v0.1/companies/${this.companyId}/projects/${projectId}/roles/${assignmentId}`
      )
      .json();
  }

  updateProjectAssignment(projectId, assignmentId, updatedFields) {
    return this.getProjectAssignment(projectId, assignmentId).then(
      (assignment) =>
        this.client
          .put(
            `v0.1/companies/${this.companyId}/projects/${projectId}/roles/${assignmentId}`,
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
                currencyId: assignment.currencyId,

                ...updatedFields,
              },
            }
          )
          .json()
    );
  }

  cache = new ExpiryMap(7 * 24 * 60 * 1000); // Emails doesn't change too often, cache one week);
  getUserEmail = memoize(
    (userId) => this.getUser(userId).then((u) => u.companyUserEmail),
    {
      cache: this.cache,
    }
  );

  resolveUserIdByEmail = memoize(
    (email) =>
      this.searchUsers(email).then((search) => {
        if (!search.hits) {
          return Promise.reject(new Error('Not found'));
        } else if (search.hits > 1) {
          return Promise.reject(
            new Error(`Found too many (hits ${search.hits})`)
          );
        }

        return search.result[0].companyUserId;
      }),
    {
      cache: this.cache,
    }
  );

  whoHasSkills = (terms, min = 0, max = 5) =>
    Promise.all(terms.map((term) => this.whoHasSkill(term, min, max, 0))).then(
      (results) => {
        const keywordIds = results
          .map(({ query: { skills } }) =>
            skills.map(({ keywordId }) => keywordId)
          )
          .flat();
        return this.client
          .post(`v0.1/companies/${this.companyId}/skills/search`, {
            json: {
              skills: keywordIds.map((keywordId) => ({
                keywordId,
                min,
                max,
              })),
            },
          })
          .json();
      }
    );

  whoHasSkill = (skill, min = 0, max = 5, limit = 100) =>
    this.client
      .post(`v0.1/companies/${this.companyId}/skills/search/term`, {
        json: {
          term: skill,
          min,
          max,
          limit,
        },
      })
      .json();

  getUserImages = (userId) =>
    this.client
      .get(`v0.1/companies/${this.companyId}/users/${userId}/images`)
      .json();

  async getUserByEmail(email) {
    const userId = await this.resolveUserIdByEmail(email);
    return this.client
      .get(`v0.1/companies/${this.companyId}/users/${userId}`)
      .json();
  }

  searchUsers = (term) =>
    this.client
      .post(`v0.1/companies/${this.companyId}/users/search`, {
        json: {
          term: term,
        },
      })
      .json();

  getProfile = (userId) =>
    this.client
      .get(`v0.1/companies/${this.companyId}/users/${userId}/profile`)
      .json();

  addSkill = (userId, skill, level) =>
    this.client
      .post(`v0.1/companies/${this.companyId}/users/${userId}/profile/skills`, {
        headers: {
          'Content-type': 'application/json-patch+json',
        },
        json: {
          name: skill,
          level,
        },
      })
      .json();

  updateSkill = (userId, skillId, keywordSynonymId, level) =>
    this.client
      .put(
        `v0.1/companies/${this.companyId}/users/${userId}/profile/skills/${skillId}`,
        {
          json: {
            keywordSynonymId,
            level,
          },
        }
      )
      .json();

  deleteSkill = (userId, skillId) =>
    this.client
      .delete(
        `v0.1/companies/${this.companyId}/users/${userId}/profile/skills/${skillId}`
      )
      .json();
}

/**
 * @deprecated Start using the constructor
 */
export default new Api(
  cinodeConfig.companyId,
  clientBuilder(cinodeConfig.accessId, cinodeConfig.accessSecret)
);
