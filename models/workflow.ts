export type Workflow = {
  name: string,
  fields: WorkflowField[],
  steps: WorkflowStep[]
}

export type WorkflowField = {
  label: string,
  type: WorkflowFieldType
  description: string
  // TODO: figure out how to add constraints to fields
}

export enum WorkflowFieldType {
  string, text, amount, integer, decimal, list, user, entity, 
}

export type WorkflowStep = {
  type: WorkflowStepType,
  actors: String[]
}

export enum WorkflowStepType {
  approval, action
}

export const sampleWorkflow: Workflow = {
  name: "Pricing Change Request",
  fields: [{
    label: "Merchant name",
    type: WorkflowFieldType.string,
    description: "Whose pricing do you want to change?"
  }, {
    label: "Old price",
    type: WorkflowFieldType.amount,
    description: "How much were they paying before?"
  }, {
    label: "New price",
    type: WorkflowFieldType.amount,
    description: "How much do we want to change it to?"
  }, {
    label: "Reason for the change",
    type: WorkflowFieldType.text,
    description: "How are we justifying this change?"
  }],
  steps: [{
    type: WorkflowStepType.approval,
    actors: ["Isma'il Shomala", "Kehinde Salaam"]
  }, {
    type: WorkflowStepType.action,
    actors: ["Onyekachi Mbaike"]
  }]
}