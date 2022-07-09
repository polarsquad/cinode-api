import Urlify from 'urlify';
import type {
  Company,
  CompanyCustomer,
  CompanyImage,
  CompanyUserBase,
  HasProject,
  ProjectAssignmentBase,
  ProjectBase,
} from './types';

// Warning: This was reverse engineered how they build the url
// so there might be cases where this produces invalid url
const urlify = Urlify.create({
  addEToUmlauts: false,
  szToSs: true,
  spaces: '-',
  nonPrintable: '',
  trim: true,
});

export const buildProjectUrl = (
  company: Company,
  project: ProjectBase
): string =>
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

export const buildCustomerUrl = (company: Company, customer: CompanyCustomer) =>
  `https://app.cinode.com/${company.name}/customers/${customer.id}/${
    customer.id
  }-${urlify(customer.name)}`;

export const buildProjectRoleUrl = (
  company: Company,
  project: ProjectBase,
  assignment: ProjectAssignmentBase
) =>
  `${buildProjectUrl(company, project)}/roles/${assignment.id}/${urlify(
    assignment.title
  )}`;

export const buildProjectPersonsUrl = (
  company: Company,
  project: ProjectBase
) => `${buildProjectUrl(company, project)}/persons`;

export const buildProjectRoleTabUrl = (
  company: Company,
  project: ProjectBase
) => `${buildProjectUrl(company, project)}/roles`;

export const buildProjectUrlFromAssignment = (
  company: Company,
  assignment: ProjectAssignmentBase & HasProject
) => buildProjectUrl(company, assignment.project);

export const buildUserUrl = (company: Company, user: CompanyUserBase) =>
  `https://app.cinode.com/${company.name}/organisation/employees/${user.companyUserId}/${user.seoId}`;

export const getUserDesiredAssignmentUrl = (
  company: Company,
  user: CompanyUserBase
) =>
  `https://app.cinode.com/${company.name}/organisation/employees/${user.companyUserId}/${user.seoId}/profile`;

export const getPersonalProfileUrl = (company: Company): string =>
  `https://app.cinode.com/${company.name}/profile`;

export const getImageUrl = (image: CompanyImage): string =>
  `https://p.cinodestatic.net/_images/${
    image.companyId
  }/${image.imageFileName?.slice(0, 2)}/${image.imageFileName?.slice(2, 4)}/${
    image.imageFileName
  }_200_200.${image.extension}`;
