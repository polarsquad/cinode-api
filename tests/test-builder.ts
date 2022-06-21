import { Skill, User, Project, Assignment, Company } from '../src/types';
import { states, stages } from '../src/model';

export const company = (props?: Partial<Company>): Company => ({
  id: 0,
  name: '',
  ...props,
});

export const skill = (props?): Skill => ({
  keywordId: 1,
  changeDateTime: new Date().toString(),
  ...props,
});

export const user = (props?): User => ({
  changeDateTime: new Date().toString(),
  ...props,
});

export const project = (props?): Project => ({
  id: 0,
  title: '',
  currentState: states.PROJECT_STATE_Open,
  currentStageId: stages.PROJECT_PIPELINE_STAGE_Opportunity,
  ...props,
});

export const assignment = (props?): Assignment => ({
  ...props,
});
