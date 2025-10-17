import type { User } from "@/models/user"
import type { Workflow } from "@/models/workflow"
import { sampleWorkflow } from "@/models/workflow"
import { sampleUser } from "@/models/user"

export type Request = {
  type: Workflow,
  initiator: User
  status: RequestStatus
  observers: User[]
  createdAt: string,
  logs: RequestLog[]
}

export enum RequestStatus {
  awaitingApproval,
  changesRequested,
  awaitingAction,
  completed,
  rejected,
  cancelled
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
  type: sampleWorkflow,
  initiator: sampleUser,
  status: RequestStatus.awaitingApproval,
  observers: [],
  createdAt: "2025-10-15T08:30:00.000000Z",
  logs: []
}