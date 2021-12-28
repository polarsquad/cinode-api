import moment from 'moment';

import { Customer, Project, User, WithProfile } from '../types';
import { findLatestChangeDate, isActiveProject } from '../utils';
import { CustomerStats, ProjectStats, SkillStats, UserStats } from './types';

const average = (nrs: number[]): number => {
  const sum = nrs.reduce((a, b) => a + b, 0);
  return sum / nrs.length || 0;
};

export const buildProjectStats = (projects: Project[]): ProjectStats => {
  return projects.reduce((result, project) => {
    if (project.tags?.length) result.hasTags++;
    if (project.salesManagers?.length) result.hasSalesManagers++;
    result.totalNumberOfProjects++;

    if (isActiveProject(project)) {
      if (project.tags?.length) result.activeProjectsHasTags++;
      if (project.salesManagers?.length)
        result.activeProjectsHasSalesManagers++;
      result.totalNumberOfActiveProjects++;
    }
    return result;
  }, new ProjectStats());
};

export const buildCustomerStats = (customers: Customer[]): CustomerStats => {
  return customers.reduce((result, customer) => {
    if (customer.managers?.length) result.hasCustomerResponsibles++;
    result.totalNubmerOfCustomers++;
    return result;
  }, new CustomerStats());
};

export const buildUserStats = (users: (User & WithProfile)[]): UserStats => {
  const stats = users.reduce((result, user) => {
    if (user.tags?.length) result.hasTags++;
    if (user.desiredAssignment) result.hasDesiredAssignment++;
    if (user.profile) {
      result.hasProfile++;
    }

    result.totalNumberOfUsers++;
    return result;
  }, new UserStats());

  const numberOfSkills = users.map((user) => user.profile?.skills.length || 0);
  stats.hasSomeSkills = numberOfSkills.filter((count) => count > 0).length;
  stats.averageNumberOfSkills = average(
    numberOfSkills.filter((count) => count > 0)
  );

  return stats;
};

export const buildSkillStats = (users: (User & WithProfile)[]): SkillStats => {
  return users.reduce((result, user) => {
    if (user.profile) {
      result.zeroSkills += user.profile.skills.filter(
        (skill) => skill.level === 0
      ).length;
      result.outdatedSkills += user.profile.skills.filter((skill) => {
        const changeDate = findLatestChangeDate(skill);
        if (
          !changeDate ||
          moment(changeDate).isBefore(moment().subtract(1, 'year'))
        ) {
          return true;
        }
        return false;
      }).length;
      result.totalCountOfSkills += user.profile.skills.length;
    }
    return result;
  }, new SkillStats());
};
