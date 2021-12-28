export class StatsBase {
  private _tableName: string;
  readonly timestamp: string;

  constructor(tableName: string, timestamp?: string) {
    this._tableName = tableName;
    this.timestamp = timestamp || new Date().toISOString();
  }

  get tableName(): string {
    return this._tableName;
  }

  get columnNames(): string[] {
    return Object.getOwnPropertyNames(this).filter((f) => !f.startsWith('_'));
  }

  asRow(): { [header: string]: string | number | boolean } {
    return Object.assign(this);
  }
}

export class ProjectStats extends StatsBase {
  hasTags = 0;
  activeProjectsHasTags = 0;

  hasSalesManagers = 0;
  activeProjectsHasSalesManagers = 0;

  totalNumberOfProjects = 0;
  totalNumberOfActiveProjects = 0;

  constructor() {
    super('ProjectStats');
  }
}

export class CustomerStats extends StatsBase {
  hasCustomerResponsibles = 0;
  totalNubmerOfCustomers = 0;

  constructor() {
    super('CustomerStats');
  }
}

export class UserStats extends StatsBase {
  hasTags = 0;
  hasDesiredAssignment = 0;
  hasProfile = 0;
  hasSomeSkills = 0;
  averageNumberOfSkills = 0;
  totalNumberOfUsers = 0;

  constructor() {
    super('UserStats');
  }
}

export class SkillStats extends StatsBase {
  zeroSkills = 0;
  outdatedSkills = 0;
  totalCountOfSkills = 0;

  constructor() {
    super('SkillStats');
  }
}
