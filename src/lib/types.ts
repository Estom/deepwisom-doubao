// EXPORTS: IUser, IProject, IMessage, ITask, IVersion, MessageStatus, TaskStatus
import type { AgentName } from './agents';

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface IProject {
  id: string;
  name: string;
  userId: string;
  summary: string;
  updatedAt: number;
  versionCount: number;
  currentVersionId: string | null;
  createdAt: number;
}

export type MessageStatus = 'sending' | 'thinking' | 'done' | 'error';

export interface IMessage {
  id: string;
  role: 'user' | 'agent';
  agentName?: AgentName;
  content: string;
  timestamp: number;
  status: MessageStatus;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface ITask {
  id: string;
  title: string;
  description: string;
  assignee: AgentName;
  status: TaskStatus;
  createdAt: number;
}

export interface IVersion {
  id: string;
  version: string;
  projectId: string;
  code: string;
  prompt: string;
  parentVersionId: string | null;
  createdAt: number;
}
