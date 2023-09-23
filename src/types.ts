//
// NOTE:
// This doesn't include all fields that are available through the API, only used.
// Feel free to add the fields you need.
// https://api.cinode.app/docs/index.html

// Get fetched with separate API call
export interface HasAbsenceInformation {
  absences?: AbsencePeriodDto[];
}

// Get fetched with separate API call
export interface HasAssignments {
  assignments: CompanyUserProjectAssignment;
}

export interface HasImage {
  imageUrl?: string;
}

export interface HasProject {
  project: ProjectBase;
}

// Get fetched with separate API call
export type HasTeamInformation = Pick<CompanyUser, 'teamMembers'>;

export interface ProjectTeam {
  assigned: (CompanyUserExtendedBase & HasImage)[];
  prospects: (CompanyUserExtendedBase & HasImage)[];
  openRoles: number;
}

export interface SearchResult<T> {
  pagedAndSortedBy: {
    itemsPerPage: number;
  };
  result?: T[] | null;
  hits: number;
  totalItems: number;
}

export interface SearchSkillResult {
  query?: {
    skills?: SearchSkill[] | null;
    filters?: FilterModel[] | null;
  } | null;
  hits?: CompanyUserSearchSkill[] | null;
}

export interface TimeSpan {
  startDate?: string | null;
  endDate?: string | null;
}

export type UserFilter = (
  u: CompanyUserExtendedBase & HasAssignments
) => boolean;

// Get fetched with separate API call
export interface WithProfile {
  profile?: CompanyUserProfileFull;
}

/*
 * Generated with: https://github.com/acacode/swagger-typescript-api
 * from: https://api.cinode.app/swagger/v0.1/swagger.json
 * at: 2022-07-09T13:40:00+03:00
 *
 * Cleaned up manually:
 *   - Remove "Model" suffixes
 *   - Remove request types
 *   - Remove duplicate comments
 *   - Define type relationships for base/extended types
 *   - Add some extra types for missing base types with likely inheritance
 */

// ENUMS

export enum AccessLevel {
  NoAccess = 0,
  Anonymous = 50,
  Read = 100,
  Subcontractor = 110,
  Candidate = 115,
  RestrictedCompanyUser = 150,
  CompanyApiUser = 180,
  CompanyUser = 200,
  PartnerManager = 240,
  CompanyRecruiter = 250,
  TeamManager = 270,
  CompanyManager = 300,
  CompanyAdmin = 400,
  Owner = 500,
}

export enum AddressType {
  Undefined = 0,
  StreetAddress = 1,
  InvoiceAddress = 2,
  LocationAddress = 3,
}

export enum AttachmentType {
  File = 0,
  Uri = 1,
}

export enum CompanyUserStatus {
  Disconnected = 0,
  PreActive = 2,
  Active = 3,
}

export enum CompanyUserType {
  Employee = 0,
  Candidate = 10,
  Subcontractor = 20,
  Api = 30,
  Bot = 40,
}

export enum ContractType {
  Hourly = 0,
  Fixed = 1,
}

export enum EventType {
  Meeting = 0,
  Note = 1,
  Task = 2,
  Call = 3,
}

export enum ExtentType {
  Percent = 0,
  Hours = 1,
}

export enum KeywordType {
  Uncategorized = 0,
  Industries = 1,
  Roles = 2,
  Tools = 3,
  Techniques = 4,
  MethodsProcesses = 5,
  Platforms = 6,
  Products = 7,
  Certifications = 10,
  Materials = 11,
  SpecificationsRegulations = 12,
  Hardware = 13,
  OperationalAreaAndFunction = 14,
  Construction = 15,
  ReportsInvestigations = 16,
  SpecialitiesMedicine = 17,
  StandardsRegulations = 18,
  Accreditation = 19,
}

export enum ProjectAssignmentMemberState {
  Allocated = 0,
  Offered = 10,
  Rejected = 20,
  Revoked = 30,
  Deferred = 40,
}

export enum ProjectPriority {
  Low = 3,
  Medium = 5,
  High = 8,
}

export enum ProjectState {
  Open = 0,
  Won = 30,
  Lost = 40,
  Abandoned = 50,
  Suspended = 60,
}

export enum Status {
  Inactive = 0,
  Active = 1,
}

export enum TrainingType {
  Course = 0,
  Certification = 1,
}

// INTERFACES

export interface AbsencePeriodDay {
  calendarDay?: CalendarDay | null;
}

export interface AbsencePeriod {
  companyId?: number;
  companyUserId?: number;

  absenceTypeId?: number;
  absenceTypeName?: string | null;

  id?: number;
  days?: AbsencePeriodDay[] | null;

  extentPercentage?: number;
}

export interface AbsencePeriodDto extends AbsencePeriod {
  absenceType?: AbsenceTypeDto | null;

  startDate?: string;

  endDate?: string;

  companyUserSeoId?: string | null;

  companySeoId?: string | null;
  links?: Link[] | null;
}

export interface AbsenceTypeDto {
  id?: number;
  name?: string | null;
}

export interface CalendarDay {
  date?: string;

  year?: number;

  month?: number;

  day?: number;

  weekday?: number;

  week?: number;

  quarter?: number;

  dayOfYear?: number;
}

export interface CompanyAddress {
  companyId?: number | null;

  id?: number | null;
  street1?: string | null;
  street2?: string | null;
  zipCode?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;

  addressType?: AddressType;
  comments?: string | null;
  links?: Link[] | null;
}

export interface CompanyBase {
  id: number; // NOTE: Does not match Swagger but does not make sense to be nullable
  name: string; // NOTE: Does not match Swagger but does not make sense to be nullable
  seoId?: string | null;
  description?: string | null;
  links?: Link[] | null;
}

export interface Company extends CompanyBase {
  corporateIdentityNumber?: string | null;
  vatNumber?: string | null;

  registrationYear?: number | null;
  isTaxRegistered?: boolean | null;
  addresses?: CompanyAddress[] | null;
  tags?: CompanyTag[] | null;

  countryId?: number | null;
  defaultCurrency?: Currency | null;
  currencies?: Currency[] | null;
}

export interface CompanyCustomerAddress {
  companyCustomerId?: number | null;

  companyId?: number | null;

  id?: number | null;
  street1?: string | null;
  street2?: string | null;
  zipCode?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;

  addressType?: AddressType;
  comments?: string | null;
  links?: Link[] | null;
}

export interface CompanyCustomerAttachment {
  customerId?: number;
  attachmentType?: AttachmentType;

  companyId?: number | null;

  id?: string | null;
  title?: string | null;
  description?: string | null;
  links?: Link[] | null;
}

export interface CompanyCustomerBase {
  id?: number;

  companyId?: number;
  name?: string | null;
  description?: string | null;
  identification?: string | null;
  seoId?: string | null;
  status?: Status;
  links?: Link[] | null;
}

export interface CompanyCustomer extends CompanyCustomerBase {
  email?: string | null;
  tags?: CompanyTag[] | null;
  managers?: CompanyCustomerManager[] | null;
  phone?: string | null;
  fax?: string | null;
  homepage?: string | null;
  corporateIdentityNumber?: string | null;
  vatNumber?: string | null;
  contacts?: CompanyCustomerContactBase[] | null;
  addresses?: CompanyCustomerAddress[] | null;
  projects?: ProjectBase[] | null;
  intermediator?: boolean | null;
  attachments?: CompanyCustomerAttachment[] | null;
}

export interface CompanyCustomerContactBase {
  id?: number;

  companyId?: number;

  customerId?: number;
  slug?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  links?: Link[] | null;
}

export interface CompanyCustomerManager {
  companyCustomerManagerId?: number | null;

  customerId?: number | null;
  customer?: CompanyCustomerBase | null;

  id?: number | null;

  companyUserId?: number | null;

  companyId?: number | null;
  seoId?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  companyUserType?: CompanyUserType | null;
  links?: Link[] | null;
}

export interface CompanyImage {
  id?: number;

  imageFileName?: string;
  extension?: string | null;

  companyId?: number;

  created?: string;
  assignedToCompanyUser?: CompanyUserBase | null;
  uploadedByCompanyUser?: CompanyUserBase | null;
  links?: Link[] | null;
}

export interface CompanyResumeTemplateBase {
  id?: number;
  title?: string | null;
}

export interface CompanySubcontractorGroupBase {
  id?: number;

  companyId?: number;
  name?: string | null;
  description?: string | null;
  links?: Link[] | null;
}

export interface CompanyTag {
  companyId?: number | null;

  id?: number | null;
  seoId?: string | null;
  name?: string | null;
}

export interface CompanyUserBase {
  companyUserId?: number | null;

  companyId?: number | null;
  seoId?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  companyUserType?: CompanyUserType | null;

  id?: number | null;
  links?: Link[] | null;
}

export interface CompanyUserSearchSkill extends CompanyUserBase {
  title?: string | null;

  addressId?: number | null;
  addressDisplayName?: string | null;
  teams?: TeamBase[] | null;
  skills?: SkillResult[] | null;
  status?: CompanyUserStatus | null;

  companyCandidateId?: number | null;
  groups?: CompanySubcontractorGroupBase[] | null;
}

// Custom type for mapping shared properties between CompanyUserExtended and CompanyUserSubcontractorBase
export interface CompanyUserExtendedBase extends CompanyUserBase {
  companyAddress?: CompanyAddress | null;
  homeAddress?: Location | null;
  image?: CompanyUserImage | null;
  desiredAssignment?: string | null;
  internalIdentifier?: string | null;
  twitter?: string | null;
  linkedIn?: string | null;
  homepage?: string | null;
  blog?: string | null;
  gitHub?: string | null;
}

export interface CompanyUserExtended extends CompanyUserExtendedBase {
  status?: CompanyUserStatus | null;
  title?: string | null;
  companyUserEmail?: string | null;
  createdDateTime?: string | null;
  updatedDateTime?: string | null;
}

export interface CompanyUser extends CompanyUserExtended {
  employmentStartDate?: string | null;

  employmentEndDate?: string | null;
  employmentNumber?: string | null;

  invoicingGoal?: number | null;

  availabilityPercent?: number | null;

  availableFromDate?: string | null;
  taxTable?: string | null;

  baseSalary?: number | null;

  provision?: number | null;

  hourlyTargetRate?: number | null;

  mobility?: number | null;

  selfCost?: number | null;
  locationName?: string | null;
  resumes?: CompanyUserResumeBase[] | null;
  roles?: Role[] | null;
  teamManagers?: TeamManager[] | null;
  teamMembers?: TeamMember[] | null;
  customerManagers?: CompanyCustomerManager[] | null;
  periods?: AbsencePeriod[] | null;
  defaultCurrency?: Currency | null;
  phone?: string | null;

  dateOfBirth?: string | null;
  tags?: CompanyTag[] | null;
}

export interface CompanyUserImage {
  imageId?: number;

  companyId?: number;
  url?: string | null;
  largeImageUrl?: string | null;

  uploadedWhen?: string;
  links?: Link[] | null;
}

export interface CompanyUserProfileFull {
  id?: number | null;

  companyId?: number | null;

  companyUserId?: number | null;

  createdWhen?: string | null;

  updatedWhen?: string | null;

  publishedWhen?: string | null;
  presentation?: CompanyUserProfilePresentation | null;

  profileTranslationId?: number;
  profileTranslation?: CompanyUserProfileTranslation | null;
  translations?: CompanyUserProfileTranslation[] | null;
  links?: Link[] | null;
  employers?: CompanyUserProfileEmployer[] | null;
  workExperience?: CompanyUserProfileWorkExperience[] | null;
  education?: CompanyUserProfileEducation[] | null;
  training?: CompanyUserProfileTraining[] | null;
  references?: CompanyUserProfileReference[] | null;
  skills?: CompanyUserProfileSkill[] | null;
  extSkills?: CompanyUserProfileExtSkill[] | null;
  commitments?: CompanyUserProfileCommitment[] | null;
  languages?: CompanyUserProfileLanguage[] | null;

  userId?: string | null;
}

export interface CompanyUserProfileCommitment {
  profileId?: number | null;

  startDate?: string | null;

  endDate?: string | null;
  translations?: CompanyUserProfileCommitmentTranslation[] | null;

  companyId?: number | null;

  companyUserId?: number | null;

  id?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfileCommitmentTranslation {
  profileCommitmentId?: number | null;
  title?: string | null;

  profileId?: number | null;

  profileTranslationId?: number | null;
  profileTranslation?: CompanyUserProfileTranslation | null;
}

export interface CompanyUserProfileEducation {
  profileId?: number | null;

  startDate?: string | null;

  endDate?: string | null;

  locationId?: number | null;
  translations?: CompanyUserProfileEducationTranslation[] | null;

  companyId?: number | null;

  companyUserId?: number | null;

  id?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfileEducationTranslation {
  profileEducationId?: number | null;
  schoolName?: string | null;
  programName?: string | null;
  degree?: string | null;
  description?: string | null;

  profileId?: number | null;

  profileTranslationId?: number | null;
  profileTranslation?: CompanyUserProfileTranslation | null;
}

export interface CompanyUserProfileEmployer {
  profileId?: number | null;

  startDate?: string | null;

  endDate?: string | null;
  isCurrent?: boolean;
  translations?: CompanyUserProfileEmployerTranslation[] | null;

  companyId?: number | null;

  companyUserId?: number | null;

  id?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfileEmployerTranslation {
  profileEmployerId?: number | null;
  name?: string | null;
  title?: string | null;
  description?: string | null;

  profileId?: number | null;

  profileTranslationId?: number | null;
  profileTranslation?: CompanyUserProfileTranslation | null;
}

export interface CompanyUserProfileExtSkill {
  profileId?: number | null;
  translations?: CompanyUserProfileExtSkillTranslation[] | null;

  companyId?: number | null;

  companyUserId?: number | null;

  id?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfileExtSkillTranslation
  extends CompanyUserProfileSkillTranslationBase {
  profileExtSkillId?: number | null;
  title?: string | null;
}

export interface CompanyUserProfileLanguageBranch {
  id?: number | null;

  languageId?: number | null;
  language?: ProfileLanguage | null;
  enabled?: boolean;
}

export interface CompanyUserProfileLanguage {
  profileId?: number | null;
  language?: ProfileLanguage | null;

  level?: number | null;

  companyId?: number | null;

  companyUserId?: number | null;

  id?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfilePresentation {
  translations?: CompanyUserProfilePresentationTranslation[] | null;

  companyId?: number | null;

  companyUserId?: number | null;

  id?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfilePresentationTranslation {
  title?: string | null;
  description?: string | null;
  personalDescription?: string | null;

  profileId?: number | null;

  profileTranslationId?: number | null;
  profileTranslation?: CompanyUserProfileTranslation | null;
}

export interface CompanyUserProfileReference {
  profileId?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  telephone?: string | null;

  profileWorkExperienceId?: number | null;
  translations?: CompanyUserProfileReferenceTranslation[] | null;

  companyId?: number | null;

  companyUserId?: number | null;

  id?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfileReferenceTranslation {
  profileReferenceId?: number | null;
  company?: string | null;
  position?: string | null;
  text?: string | null;

  profileId?: number | null;

  profileTranslationId?: number | null;
  profileTranslation?: CompanyUserProfileTranslation | null;
}

export interface CompanyUserProfileSkillHistory {
  id?: number | null;

  changeDateTime?: string | null;

  level?: number | null;

  profileId?: number | null;

  keywordId?: number | null;
  favourite?: boolean;
}

export interface CompanyUserProfileSkill extends CompanyUserSkill {
  profileId?: number | null;

  level?: number | null;

  levelGoal?: number | null;

  levelGoalDeadline?: string | null;
  keyword?: Keyword | null;
  changeHistory?: CompanyUserProfileSkillHistory[] | null;
  translations?: CompanyUserProfileSkillTranslation[] | null;
  favourite?: boolean;

  numberOfDaysWorkExperience?: number;

  companyId?: number | null;

  companyUserId?: number | null;

  id?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfileSkillTranslationBase {
  profileId?: number | null;

  profileTranslationId?: number | null;
  profileTranslation?: CompanyUserProfileTranslation | null;
}

export interface CompanyUserProfileSkillTranslation
  extends CompanyUserProfileSkillTranslationBase {
  keywordId?: number | null;

  keywordSynonymId?: number | null;
  keywordSynonym?: KeywordSynonym | null;
  keyword?: Keyword | null;
}

export interface CompanyUserProfileTraining {
  profileId?: number | null;

  id?: number | null;
  trainingType?: TrainingType | null;

  year?: number | null;
  code?: string | null;
  translations?: CompanyUserProfileTrainingTranslation[] | null;

  expireDate?: string | null;

  companyId?: number | null;

  companyUserId?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfileTrainingTranslation {
  profileTrainingId?: number;
  title?: string | null;
  description?: string | null;
  issuer?: string | null;
  supplier?: string | null;

  profileId?: number | null;

  profileTranslationId?: number | null;
  profileTranslation?: CompanyUserProfileTranslation | null;
}

export interface CompanyUserProfileTranslation {
  profileTranslationId?: number | null;

  profileId?: number | null;

  languageBranchId?: number | null;
  languageBranch?: CompanyUserProfileLanguageBranch | null;
}

export interface CompanyUserProfileWorkExperience {
  profileId?: number | null;

  id?: number | null;

  startDate?: string | null;

  endDate?: string | null;
  isCurrent?: boolean | null;
  translations?: CompanyUserProfileWorkExperienceTranslation[] | null;

  locationId?: number | null;
  skills?: CompanyUserProfileSkill[] | null;

  companyId?: number | null;

  companyUserId?: number | null;
  url?: string | null;
  links?: Link[] | null;
}

export interface CompanyUserProfileWorkExperienceTranslation {
  profileWorkExperienceId?: number | null;
  employer?: string | null;
  title?: string | null;
  description?: string | null;

  profileId?: number | null;

  profileTranslationId?: number | null;
  profileTranslation?: CompanyUserProfileTranslation | null;
}

export interface CompanyUserProjectAssignment {
  assigned?: ProjectAssignmentBase[] | null;
  prospect?: ProjectAssignmentBase[] | null;
}

export interface CompanyUserResumeBase {
  id?: number | null;

  companyUserId?: number | null;

  companyId?: number | null;
  title?: string | null;
  description?: string | null;
  slug?: string | null;
  language?: LanguageBlock | null;
  template?: CompanyResumeTemplateBase | null;
  isPublic?: boolean;
  links?: Link[] | null;
}

export interface CompanyUserSkill {
  companyId?: number | null;

  companyUserId?: number | null;

  numberOfDaysWorkExperience?: number;

  profileId?: number | null;

  id?: number | null;

  level?: number | null;

  levelGoal?: number | null;

  levelGoalDeadline?: string | null;
  keyword?: Keyword | null;
  favourite?: boolean;
  links?: Link[] | null;
}

export interface Currency {
  id?: number;
  currencyCode?: string | null;
  description?: string | null;
}

export interface FilterModel {
  name?: string | null;
  values?: number[] | null;
}

export interface Keyword {
  id?: number | null;

  type?: KeywordType;

  masterSynonymId?: number | null;
  masterSynonym?: string | null;
  synonyms?: string[] | null;
  universal?: boolean;
  verified?: boolean;
}

export interface KeywordSynonym {
  keywordId?: number | null;

  id?: number | null;
  keyword?: Keyword | null;
  name?: string | null;
  seoId?: string | null;
  description?: string | null;

  languageId?: number | null;
}

export interface LanguageBlock {
  data?: LanguageItemBlock[] | null;

  blockId?: string;

  updated?: string | null;
  heading?: string | null;
}

export interface LanguageItemBlock {
  culture?: string | null;
  lang?: string | null;
  country?: string | null;
  name?: string | null;

  level?: number;

  languageId?: number | null;

  parentBlockItemId?: number | null;
  parentBlockItemUpdated?: boolean | null;

  profileTranslationId?: number | null;

  updated?: string | null;

  discarded?: string | null;

  id?: string;
  disabled?: boolean;
}

export interface Link {
  href?: string | null;
  rel?: string | null;
  methods?: string[] | null;
}

export interface Location {
  locationId?: number;
  name?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  zipCode?: string | null;
  city?: string | null;
  country?: string | null;
  countryCode?: string | null;
  formattedAddress?: string | null;
  phoneNumber?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  webSiteUrl?: string | null;
  displayName?: string | null;
}

export interface ProfileLanguage {
  languageId?: number | null;
  name?: string | null;
  culture?: string | null;
  lang?: string | null;
  country?: string | null;
}

export interface ProjectAssignmentBase {
  companyId?: number;

  customerId?: number;

  projectId?: number;
  project?: ProjectBase | null;
  customer?: CompanyCustomerBase | null;

  id?: number;
  title?: string | null;
  description?: string | null;

  startDate?: string | null;

  endDate?: string | null;
  links?: Link[] | null;
}

export interface ProjectAssignmentWithStatus {
  pipelineId?: number;
  projectPipelineStageTitle?: string;
  customerId: number;
  projectId: number;
  projectState: ProjectState;

  probability: number;
  projectAssignmentId: number;

  projectAssignmentAllocationStatus: AllocationStatus;

  projectAssignmentMemberType: AssignmentMemberType;

  startDate?: string;
  endDate?: string;

  optionToDate?: string;
  oralAgreementToDate?: string;

  projectAssignmentExtent: number;
  projectAssignmentExtentType?: ExtentType;
  rate?: number;
  estimatedCloseDate?: string;

  assigned?: ProjectAssignmentMember;
}

export enum AllocationStatus {
  None = 0,
  Preliminary = 1,
  Assigned = 2,
}

export enum AssignmentStatus {
  NoDatesSelected = 0,
  Upcoming = 1,
  Ongoing = 2,
  Completed = 3,
}

export enum AssignmentMemberType {
  Unspecified = 0,
  Employee = 1,
  PartnerConsultant = 2,
  Subcontractor = 3,
}

export interface ProjectAssignment extends ProjectAssignmentBase {
  company?: CompanyBase | null;
  assigned?: ProjectAssignmentMember | null;
  prospects?: ProjectAssignmentMember[] | null;
  seoId?: string | null;
  skills?: ProjectAssignmentSkillBase[] | null;

  projectAssignmentMemberId?: number | null;

  rate?: number | null;

  oralAgreementToDate?: string | null;

  optionToDate?: string | null;
  contractType?: ContractType;
  extentType?: ExtentType;

  extent?: number | null;
  isAssigned?: boolean;
  currency?: Currency | null;
}

/**
 * NOTE: These edit types are _very_ weird but it feels better to at least
 * share a common base type instead of copy-pasting fields -- even if that
 * means omitting a lot of fields
 */
export interface ProjectAssignmentEdit
  extends Omit<
    ProjectAssignment,
    | 'assigned'
    | 'company'
    | 'companyId'
    | 'customer'
    | 'customerId'
    | 'id'
    | 'links'
    | 'project'
    | 'projectAssignmentMemberId'
    | 'projectId'
    | 'prospects'
    | 'seoId'
    | 'skills'
  > {
  projectAssignmentId: number;

  currencyId?: number | null;
}

export interface ProjectAssignmentMember extends CompanyUserBase {
  id?: number | null;

  status?: CompanyUserStatus | null;

  projectAssignmentMemberId?: number;
  projectAssignmentMemberState?: ProjectAssignmentMemberState | null;
}

export interface ProjectAssignmentSkillBase {
  companyId?: number;

  customerId?: number;

  projectId?: number;

  projectAssignmentId?: number;

  keywordId?: number;
  keyword?: Keyword | null;
  links?: Link[] | null;
}

export interface ProjectAttachment {
  projectId?: number;
  attachmentType?: AttachmentType;

  companyId?: number | null;

  id?: string | null;
  title?: string | null;
  description?: string | null;
  links?: Link[] | null;
}

export interface ProjectBase {
  companyId?: number;

  customerId?: number;

  id?: number;
  title?: string | null;
  description?: string | null;
  identifier?: string | null;
  customerIdentifier?: string | null;
  links?: Link[] | null;
}

export interface Project extends ProjectBase {
  company?: CompanyBase | null;
  customer?: CompanyCustomerBase | null;
  seoId?: string | null;

  locationId?: number | null;
  googleId?: string | null;

  probability?: number | null;

  estimatedValue?: number | null;

  estimatedCloseDate?: string | null;
  managers?: CompanyUserBase[] | null;
  salesManager?: CompanyUserBase | null;
  salesManagers?: CompanyUserBase[] | null;
  intermediator?: CompanyCustomerBase | null;
  events?: ProjectEventBase[] | null;
  customerContacts?: CompanyCustomerContactBase[] | null;
  intermediatorContacts?: CompanyCustomerContactBase[] | null;
  assignments?: ProjectAssignmentBase[] | null;
  attachments?: ProjectAttachment[] | null;
  tags?: CompanyTag[] | null;

  pipelineId?: number | null;

  currentStageId?: number | null;
  currency?: Currency | null;
  projectReferences?: ProjectReference[] | null;

  currentState?: ProjectState;
  createdBy?: CompanyUserBase | null;
  updatedBy?: CompanyUserBase | null;

  createdDateTime?: string;

  updatedDateTime?: string | null;

  stateHistory?: {
    state: ProjectState;
    updated: string;
    reason: {
      id: number;
      title: string;
      description: string;
    };
  }[];

  teamId?: number | null;

  stateReasonId?: number | null;

  salesManagerIds?: number[] | null;

  projectManagerIds?: number[] | null;
  priority?: ProjectPriority;
}

export interface ProjectEventBase {
  projectId?: number | null;

  type?: EventType;

  id?: string | null;

  companyId?: number | null;
  title?: string | null;
  description?: string | null;

  eventDate?: string;
  links?: Link[] | null;
}

export interface ProjectPipeline {
  id?: number;
  title?: string | null;
  description?: string | null;
  stages?: ProjectPipelineStage[] | null;
}

export interface ProjectPipelineStage {
  id?: number;
  title?: string | null;
  description?: string | null;

  order?: number;

  probability?: number | null;
}

export interface ProjectReference {
  id?: number;

  companyId?: number;

  projectId?: number;
  title?: string | null;
  text?: string | null;
  language?: string | null;
  links?: Link[] | null;
}

export interface Role {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  level?: AccessLevel | null;
}

export interface SearchSkill {
  keywordId?: number | null;
  min?: number | null;
  max?: number | null;
}

// NOTE: This doesn't really map to any other type, despite the name
export interface SkillResult {
  keywordId?: number | null;
  keywordSynonymId?: number | null;
  keywordSynonymName?: string | null;
  masterSynonymId?: number | null;
  masterSynonymName?: string | null;
  level?: number | null;
}

export interface TeamBase {
  id?: number;

  companyId?: number | null;
  name?: string | null;
  description?: string | null;
  links?: Link[] | null;
}

export interface TeamManager {
  teamId?: number | null;

  companyUserId?: number | null;
  companyUser?: CompanyUserBase | null;
  team?: TeamBase | null;
}

export interface TeamMember {
  teamId?: number | null;

  companyUserId?: number | null;
  companyUser?: CompanyUserBase | null;
  team?: TeamBase | null;

  availabilityPercent?: number | null;
}
