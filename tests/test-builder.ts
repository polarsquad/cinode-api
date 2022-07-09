import {
  Company,
  CompanyUserExtended,
  CompanyUserProfileSkill,
  Project,
  ProjectAssignmentBase,
  ProjectState,
} from '../src/types';

export const company = (props?: Partial<Company>): Company => ({
  id: 0,
  name: '',
  ...props,
});

export const skill = (
  props?: Partial<CompanyUserProfileSkill>
): CompanyUserProfileSkill => ({
  ...props,
});

export const user = (
  props?: Partial<CompanyUserExtended>
): CompanyUserExtended => ({
  ...props,
});

export const project = (props?: Partial<Project>): Project => ({
  id: 0,
  title: '',
  currentState: ProjectState.Open,
  currentStageId: 0,
  ...props,
});

export const assignment = (
  props?: Partial<ProjectAssignmentBase>
): ProjectAssignmentBase => ({
  ...props,
});
