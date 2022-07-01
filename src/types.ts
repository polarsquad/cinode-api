//
// NOTE:
// This doesn't include all fields that are available through the API, only used.
// Feel free to add the fields you need.
// https://api.cinode.app/docs/index.html

export type Company = {
  id: number;
  name: string;
};

export type CustomerBase = {
  id: number;
  name: string;
};

export type Customer = {
  managers: {
    companyUserId: number;
  }[];
} & CustomerBase;

export type Project = {
  companyId: number;
  customerId: number;
  id: number;
  title: string | null;
  description: string | null;

  identifier: string | null;
  customerIdentifier: string | null;

  intermediator: CustomerBase;

  estimatedCloseDate: string | null;
  estimatedValue: number | null;
  probability: number | null;
  pipelineId: number | null;
  currency: Currency;

  currentState: number;
  currentStageId: number;

  customer: CustomerBase;

  assignments: Assignment[];
  salesManagers: User[];

  teamId: number | null;

  tags: Tag[];
};

export type ProjectTeam = {
  assigned: (User & HasImage)[];
  prospects: (User & HasImage)[];
  openRoles: number;
};

export type User = {
  companyUserId: number;
  seoId: string;
  title: string;

  firstName: string;
  lastName: string;
  companyUserEmail: string;
  roles: Role[];
  desiredAssignment: string;
  tags: Tag[];
} & MutableEntity;

export type UserFilter = (u: User & HasAssignments) => boolean;

export type Role = {
  id: number;
  name: string;
  description: string;
  level: number;
};
// Get fetched with separate API call
export type WithProfile = {
  profile?: Profile;
};

export type Profile = {
  skills: Skill[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  employers: {}[];
};

export enum ContractType {
  Hourly = 0,
  Fixed = 1,
}

export enum ExtentType {
  Percent = 0,
  Hours = 1,
}

// Get fetched with separate API call
export type HasAssignments = {
  assignments: {
    assigned: Assignment[];
    prospect: Assignment[];
  };
};

export type Assignment = {
  id: number;
  title: string | null;
  description: string | null;
  project: Project;
  customer: CustomerBase;

  rate: number | null;
  extent: number | null;
  extentType: ExtentType;
  oralAgreementToDate: string | null;
  optionToDate: string | null;
  contractType: ContractType;
  currency: Currency;

  assigned: User;
  prospects: User[];
} & TimeSpan;

// Get fetched with separate API call
export type HasTeamInformation = {
  teamMembers: { team: { name: string } }[];
};

// Get fetched with separate API call
export type HasAbsenceInformation = {
  absences?: Absence[];
};

export type Absence = {
  absenceType: { name: string };
} & TimeSpan;

export type TimeSpan = {
  startDate?: string;
  endDate?: string;
};

export type HasImage = {
  imageUrl?: string;
};

export type Skill = {
  id: number;
  level: number;
  favourite: boolean;

  keywordId: number;
  keyword: {
    id: number;
    masterSynonym: string;
    synonyms: string[];
  };

  translations: {
    keywordSynonym: { name: string };
    profileTranslation: {
      languageBranch: {
        language: {
          lang: string;
        };
      };
    };
  }[];

  changeHistory: {
    level: number;
    keywordId: number;
    changeDateTime: string;
  }[];
};

export type Tag = {
  id: number;
  name: string;
};

export type Image = {
  id: number;
  companyId: number;
  imageFileName: string;
  extension: string;
};

export type MutableEntity = {
  createdDateTime?: string;
  updatedDateTime?: string;
};

export type Currency = {
  id: number;
  currencyCode: string | null;
  description: string | null;
};
