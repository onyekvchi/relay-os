import type { User } from "@/models/user"
import type { Workflow } from "@/models/workflow"

export type Request = {
  id: string,
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