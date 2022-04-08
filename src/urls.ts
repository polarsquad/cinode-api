import Urlify from 'urlify';

// Warning: This was reverse engineered how they build the url
// so there might be cases where this produces invalid url
const urlify = Urlify.create({
  addEToUmlauts: false,
  szToSs: true,
  spaces: '-',
  nonPrintable: '',
  trim: true,
});

import type {
  User,
  Project,
  Assignment,
  CustomerBase,
  Image,
  Company,
} from './types';

export const buildProjectUrl = (company: Company, project: Project): string =>
  `https://app.cinode.com/${company.name}/projects/${project.id}/${urlify(
    project.title
  )}`;

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

export const buildCustomerUrl = (company: Company, customer: CustomerBase) =>
  `https://app.cinode.com/${company.name}/customers/${customer.id}/${
    customer.id
  }-${urlify(customer.name)}`;

export const buildProjectRoleUrl = (
  company: Company,
  project: Project,
  assignment: Assignment
) =>
  `${buildProjectUrl(company, project)}/roles/${assignment.id}/${urlify(
    assignment.title
  )}`;

export const buildProjectPersonsUrl = (company: Company, project: Project) =>
  `${buildProjectUrl(company, project)}/persons`;

export const buildProjectRoleTabUrl = (company: Company, project: Project) =>
  `${buildProjectUrl(company, project)}/roles`;

export const buildProjectUrlFromAssignment = (
  company: Company,
  assignment: Assignment
) => buildProjectUrl(company, assignment.project);

export const buildUserUrl = (company: Company, user: User) =>
  `https://app.cinode.com/${company.name}/organisation/employees/${user.companyUserId}/${user.seoId}`;

export const getUserDesiredAssignmentUrl = (company: Company, user: User) =>
  `https://app.cinode.com/${company.name}/organisation/employees/${user.companyUserId}/${user.seoId}/profile`;

export const getPersonalProfileUrl = (company: Company): string =>
  `https://app.cinode.com/${company.name}/profile`;

export const getImageUrl = (image: Image): string =>
  `https://p.cinodestatic.net/profile_images/${image.imageFileName.slice(
    0,
    2
  )}/${image.imageFileName.slice(2, 4)}/${image.imageFileName}_200_200.${
    image.extension
  }`;
