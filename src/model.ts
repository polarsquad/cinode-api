import { ProjectPipelineStage, ProjectState } from './types';

const projectStateToHumanReadable = (
  value: ProjectState | undefined | null
): keyof typeof ProjectState | null => {
  switch (value) {
    case ProjectState.Open:
      return 'Open';
    case ProjectState.Won:
      return 'Won';
    case ProjectState.Lost:
      return 'Lost';
    case ProjectState.Abandoned:
      return 'Abandoned';
    case ProjectState.Suspended:
      return 'Suspended';
    default:
      return null;
  }
};

const projectStageToHumanReadable = (
  id: number,
  stages: ProjectPipelineStage[]
): string | null => stages.find((s) => s.id === id)?.title ?? null;

export { projectStateToHumanReadable, projectStageToHumanReadable };
