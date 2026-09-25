// EXPORTS: useProjects
import { useState, useEffect, useCallback } from 'react';
import { storage, STORAGE_KEYS } from './storage';
import type { IProject } from './types';
import { useAuth } from './auth';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<IProject[]>([]);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      return;
    }
    const data = storage.get<IProject[]>(STORAGE_KEYS.projects(user.id), []);
    setProjects(data.sort((a, b) => b.updatedAt - a.updatedAt));
  }, [user]);

  const saveProjects = useCallback(
    (list: IProject[]) => {
      if (!user) return;
      storage.set(STORAGE_KEYS.projects(user.id), list);
      setProjects(list.sort((a, b) => b.updatedAt - a.updatedAt));
    },
    [user],
  );

  const createProject = useCallback(
    (name: string, prompt?: string): IProject => {
      if (!user) throw new Error('未登录');
      const now = Date.now();
      const newProject: IProject = {
        id: `proj_${now}_${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim() || '未命名项目',
        userId: user.id,
        summary: prompt || '还没有描述',
        updatedAt: now,
        versionCount: 0,
        currentVersionId: null,
        createdAt: now,
      };
      const list = storage.get<IProject[]>(STORAGE_KEYS.projects(user.id), []);
      list.push(newProject);
      saveProjects(list);
      return newProject;
    },
    [user, saveProjects],
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<IProject>) => {
      if (!user) return;
      const list = storage.get<IProject[]>(STORAGE_KEYS.projects(user.id), []);
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) return;
      list[idx] = { ...list[idx], ...updates, updatedAt: Date.now() };
      saveProjects(list);
    },
    [user, saveProjects],
  );

  const deleteProject = useCallback(
    (id: string) => {
      if (!user) return;
      const list = storage.get<IProject[]>(STORAGE_KEYS.projects(user.id), []);
      const filtered = list.filter((p) => p.id !== id);
      // 清除项目相关数据
      storage.remove(STORAGE_KEYS.messages(id));
      storage.remove(STORAGE_KEYS.tasks(id));
      storage.remove(STORAGE_KEYS.versions(id));
      saveProjects(filtered);
    },
    [user, saveProjects],
  );

  const getProject = useCallback(
    (id: string): IProject | null => {
      return projects.find((p) => p.id === id) || null;
    },
    [projects],
  );

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
  };
}
