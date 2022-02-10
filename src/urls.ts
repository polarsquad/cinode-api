import Urlify from 'urlify';
import { cinodeConfig } from './config';

// Warning: This was reverse engineered how they build the url
// so there might be cases where this produces invalid url
const urlify = Urlify.create({
  addEToUmlauts: false,
  szToSs: true,
  spaces: '-',
  nonPrintable: '',
  trim: true,
});

import type { User, Project, Assignment, CustomerBase, Image } from './types';

export const buildProjectUrl = (project: Project): string =>
  `https://app.cinode.com/${cinodeConfig.companyName}/projects/${
    project.id
  }/${urlify(project.title)}`;

const PROJECT_URL_REGEX =
  /https:\/\/app.cinode.com\/[\w-]+\/projects\/([0-9]+)\/.*/i;

export const isProjectUrl = (url: string): boolean =>
  PROJECT_URL_REGEX.test(url);

export const parseProjectUrl = (url: string): number => {
  const match = PROJECT_URL_REGEX.exec(url);
  if (match) {
    return +match[1];
  }
  console.log(match, url);
  throw new Error(`Invalid Cinode project url: ${url}`);
};

export const buildCustomerUrl = (customer: CustomerBase) =>
  `https://app.cinode.com/${cinodeConfig.companyName}/customers/${
    customer.id
  }/${customer.id}-${urlify(customer.name)}`;

export const buildProjectRoleUrl = (project: Project, assignment: Assignment) =>
  `${buildProjectUrl(project)}/roles/${assignment.id}/${urlify(
    assignment.title
  )}`;

export const buildProjectPersonsUrl = (project: Project) =>
  `${buildProjectUrl(project)}/persons`;

export const buildProjectRoleTabUrl = (project: Project) =>
  `${buildProjectUrl(project)}/roles`;

export const buildProjectUrlFromAssignment = (assignment: Assignment) =>
  buildProjectUrl(assignment.project);

export const buildUserUrl = (user: User) =>
  `https://app.cinode.com/${cinodeConfig.companyName}/organisation/employees/${user.companyUserId}/${user.seoId}`;

export const getUserDesiredAssignmentUrl = (user: User) =>
  `https://app.cinode.com/${cinodeConfig.companyName}/organisation/employees/${user.companyUserId}/${user.seoId}/profile`;

export const getPersonalProfileUrl = (): string =>
  `https://app.cinode.com/${cinodeConfig.companyName}/profile`;

export const getImageUrl = (image: Image): string =>
  `https://p.cinodestatic.net/profile_images/${image.imageFileName.slice(
    0,
    2
  )}/${image.imageFileName.slice(2, 4)}/${image.imageFileName}_200_200.${
    image.extension
  }`;
