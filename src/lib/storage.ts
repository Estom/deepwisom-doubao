// EXPORTS: storage, STORAGE_KEYS
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';

// 统一的存储键前缀，避免与其他应用冲突
const PREFIX = 'atomstudio_';

export const STORAGE_KEYS = {
  SESSION: `${PREFIX}session`,
  USERS: `${PREFIX}users`,
  projects: (userId: string) => `${PREFIX}projects_${userId}`,
  messages: (projectId: string) => `${PREFIX}messages_${projectId}`,
  tasks: (projectId: string) => `${PREFIX}tasks_${projectId}`,
  versions: (projectId: string) => `${PREFIX}versions_${projectId}`,
  projectMeta: (projectId: string) => `${PREFIX}project_meta_${projectId}`,
} as const;

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const raw = scopedStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    try {
      scopedStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },

  remove(key: string): void {
    try {
      scopedStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
