const states = {
  PROJECT_STATE_Open: 0,
  PROJECT_STATE_Won: 30,
  PROJECT_STATE_Lost: 40,
  PROJECT_STATE_Abandoned: 50,
  PROJECT_STATE_Suspended: 60,
};

const projectStateToHumanReadable = (value) => {
  switch (value) {
    case states.PROJECT_STATE_Open:
      return 'Open';
    case states.PROJECT_STATE_Won:
      return 'Won';
    case states.PROJECT_STATE_Lost:
      return 'Lost';
    case states.PROJECT_STATE_Abandoned:
      return 'Abandoned';
    case states.PROJECT_STATE_Suspended:
      return 'Suspended';
    default:
      return value;
  }
};

const stages = {
  // NOTE: these are project pipeline specific and might change if someone change the pipeline
  // Check the latest IDs from /v0.1/companies/{companyId}/projects/pipelines endpoint
  PROJECT_PIPELINE_STAGE_Opportunity: 4082,
  PROJECT_PIPELINE_STAGE_Prepare_Proposal: 4083,
  PROJECT_PIPELINE_STAGE_Proposal_Sent: 4300,
};

const projectStageToHumanReadable = (value) => {
  switch (value) {
    case stages.PROJECT_PIPELINE_STAGE_Opportunity:
      return 'Opportunity';
    case stages.PROJECT_PIPELINE_STAGE_Prepare_Proposal:
      return 'Prepare Proposal';
    case stages.PROJECT_PIPELINE_STAGE_Proposal_Sent:
      return 'Proposal Sent';
    default:
      return value;
  }
};

export {
  states,
  projectStateToHumanReadable,
  stages,
  projectStageToHumanReadable,
};
