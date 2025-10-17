import type { User } from "@/models/user"
import { createSampleWorkflow, type Workflow } from "@/models/workflow"
import { createSampleUser, sampleUser } from "@/models/user"

export type Request = {
  type: Workflow,
  initiator: User
  status: RequestStatus
  observers: User[]
  createdAt: string,
  logs: RequestLog[]
}

export enum RequestStatus {
  awaitingApproval = "Awaiting Approval",
  changesRequested = "Changes Requested",
  awaitingAction = "Awaiting Action",
  completed = "Completed",
  rejected = "Rejected",
  cancelled = "Cancelled"
}

export type RequestLog = {
  action: RequestAction,
  user: User,
  createdAt: string
}

export enum RequestAction {
  create, approve, requestChange, reject, cancel, complete, comment, update
}

export const sampleRequest: Request = {
  type: createSampleWorkflow(),
  initiator: sampleUser,
  status: RequestStatus.awaitingApproval,
  observers: [],
  createdAt: "2025-10-15T08:30:00.000000Z",
  logs: []
}

export function createSampleRequests(): Request {
  return {
    type: createSampleWorkflow(),
    initiator: createSampleUser(),
    status: RequestStatus.awaitingApproval,
    observers: [],
    createdAt: "2025-10-15T08:30:00.000000Z",
    logs: []
  }
}