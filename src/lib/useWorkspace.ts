// EXPORTS: useWorkspace
import { useState, useEffect, useCallback, useRef } from 'react';
import { capabilityClient, logger } from '@lark-apaas/client-toolkit-lite';
import { storage, STORAGE_KEYS } from './storage';
import type { IMessage, ITask, IVersion } from './types';
import { AGENTS, type AgentName } from './agents';
import { toast } from 'sonner';

// 从 AI 流式输出中剥离 markdown 代码块包裹
function stripCodeBlocks(text: string): string {
  // 匹配 ```html ... ``` 或 ``` ... ```
  const codeBlockRegex = /```(?:html)?\s*\n([\s\S]*?)\n?```/i;
  const match = text.match(codeBlockRegex);
  if (match) return match[1].trim();
  return text.trim();
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface UseWorkspaceReturn {
  messages: IMessage[];
  tasks: ITask[];
  versions: IVersion[];
  currentVersion: IVersion | null;
  currentCode: string;
  isGenerating: boolean;
  currentAgent: AgentName | null;
  sendMessage: (text: string) => Promise<void>;
  rollbackToVersion: (versionId: string) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setPreviewDevice: (d: 'desktop' | 'tablet' | 'mobile') => void;
  retryLastGeneration: () => Promise<void>;
}

export function useWorkspace(projectId: string): UseWorkspaceReturn {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [versions, setVersions] = useState<IVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<IVersion | null>(null);
  const [currentCode, setCurrentCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentName | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const lastPromptRef = useRef<string>('');

  // 加载本地存储的数据
  useEffect(() => {
    if (!projectId) return;
    const msgs = storage.get<IMessage[]>(STORAGE_KEYS.messages(projectId), []);
    const tsks = storage.get<ITask[]>(STORAGE_KEYS.tasks(projectId), []);
    const vsns = storage.get<IVersion[]>(STORAGE_KEYS.versions(projectId), []);
    setMessages(msgs);
    setTasks(tsks);
    setVersions(vsns.sort((a, b) => a.createdAt - b.createdAt));
    if (vsns.length > 0) {
      const latest = vsns[vsns.length - 1];
      setCurrentVersion(latest);
      setCurrentCode(latest.code);
    }
  }, [projectId]);

  // 持久化消息
  const saveMessages = useCallback(
    (list: IMessage[]) => {
      storage.set(STORAGE_KEYS.messages(projectId), list);
    },
    [projectId],
  );

  const saveTasks = useCallback(
    (list: ITask[]) => {
      storage.set(STORAGE_KEYS.tasks(projectId), list);
    },
    [projectId],
  );

  const saveVersions = useCallback(
    (list: IVersion[]) => {
      storage.set(STORAGE_KEYS.versions(projectId), list);
    },
    [projectId],
  );

  // 添加智能体消息
  const addAgentMessage = useCallback(
    (agentName: AgentName, status: IMessage['status'] = 'thinking'): string => {
      const id = generateId('msg');
      const msg: IMessage = {
        id,
        role: 'agent',
        agentName,
        content: '',
        timestamp: Date.now(),
        status,
      };
      setMessages((prev) => {
        const next = [...prev, msg];
        saveMessages(next);
        return next;
      });
      return id;
    },
    [saveMessages],
  );

  // 更新消息内容
  const updateMessageContent = useCallback(
    (id: string, content: string, status?: IMessage['status']) => {
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === id ? { ...m, content, status: status ?? m.status } : m,
        );
        saveMessages(next);
        return next;
      });
    },
    [saveMessages],
  );

  // 流式调用 AI
  const streamAgentResponse = useCallback(
    async (
      pluginId: string,
      input: Record<string, string>,
      onChunk: (piece: string) => void,
    ): Promise<string> => {
      let fullText = '';
      try {
        const executor = (capabilityClient as any).load(pluginId);
        const stream = (executor as any).callStream('textGenerate', input);
        for await (const chunk of stream) {
          const piece: string = chunk.content ?? chunk.response ?? '';
          if (piece) {
            fullText += piece;
            onChunk(piece);
          }
        }
      } catch (err) {
        logger.error('AI stream error:', String(err));
        throw err;
      }
      return fullText;
    },
    [],
  );

  // 添加任务
  const addTask = useCallback(
    (task: Omit<ITask, 'id' | 'createdAt'>) => {
      const newTask: ITask = {
        ...task,
        id: generateId('task'),
        createdAt: Date.now(),
      };
      setTasks((prev) => {
        const next = [...prev, newTask];
        saveTasks(next);
        return next;
      });
      return newTask.id;
    },
    [saveTasks],
  );

  // 更新任务状态
  const updateTaskStatus = useCallback(
    (taskId: string, status: ITask['status']) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === taskId ? { ...t, status } : t));
        saveTasks(next);
        return next;
      });
    },
    [saveTasks],
  );

  // 添加版本
  const addVersion = useCallback(
    (code: string, prompt: string, parentVersionId: string | null = null): IVersion => {
      const major = versions.length === 0 ? 1 : 1;
      const minor = versions.length;
      const newVersion: IVersion = {
        id: generateId('ver'),
        version: `v${major}.${minor}`,
        projectId,
        code,
        prompt,
        parentVersionId,
        createdAt: Date.now(),
      };
      setVersions((prev) => {
        const next = [...prev, newVersion].sort((a, b) => a.createdAt - b.createdAt);
        saveVersions(next);
        return next;
      });
      setCurrentVersion(newVersion);
      setCurrentCode(code);
      return newVersion;
    },
    [projectId, versions.length, saveVersions],
  );

  // 运行多智能体流水线
  const runPipeline = useCallback(
    async (prompt: string, isIteration: boolean = false) => {
      if (isGenerating) return;
      setIsGenerating(true);
      lastPromptRef.current = prompt;

      try {
        // 用户消息已在 sendMessage 中添加

        // ========== 阶段 1: Mike 接单概述 ==========
        setCurrentAgent('Mike');
        const mikeMsgId = addAgentMessage('Mike', 'thinking');

        try {
          await streamAgentResponse(
            AGENTS.Mike.pluginId,
            {
              user_demand: prompt,
              work_progress: isIteration ? '迭代修改阶段，已有上一版本代码' : '新项目，首次生成',
              delivery_content: '',
            },
            (piece) => {
              setMessages((prev) =>
                prev.map((m) => (m.id === mikeMsgId ? { ...m, content: m.content + piece } : m)),
              );
            },
          );
          updateMessageContent(mikeMsgId, '', 'done');
          // 重新设置内容（因为上面是 setMessages 实时累加，最后更新状态）
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === mikeMsgId ? { ...m, status: 'done' as const } : m,
            );
            saveMessages(next);
            return next;
          });
        } catch {
          // Mike 失败不阻断，跳过
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === mikeMsgId
                ? { ...m, content: '（团队领队响应异常，继续推进项目）', status: 'error' as const }
                : m,
            );
            saveMessages(next);
            return next;
          });
        }

        // 如果不是迭代，添加任务清单
        if (!isIteration) {
          const taskReqId = addTask({
            title: '需求分析',
            description: '拆解用户需求为产品功能列表与用户流程',
            assignee: 'Emma',
            status: 'in-progress',
          });
          const taskArchId = addTask({
            title: '架构设计',
            description: '设计页面结构、技术方案与任务拆分',
            assignee: 'Bob',
            status: 'pending',
          });
          const taskDevId = addTask({
            title: '代码实现',
            description: '编写完整可运行的单文件 HTML 应用代码',
            assignee: 'Alex',
            status: 'pending',
          });
          const taskSummaryId = addTask({
            title: '交付总结',
            description: '汇总交付成果，说明使用方法',
            assignee: 'Mike',
            status: 'pending',
          });

          // ========== 阶段 2: Emma 需求分析 ==========
          setCurrentAgent('Emma');
          const emmaMsgId = addAgentMessage('Emma', 'thinking');

          try {
            await streamAgentResponse(
              AGENTS.Emma.pluginId,
              { user_requirement: prompt },
              (piece) => {
                setMessages((prev) =>
                  prev.map((m) => (m.id === emmaMsgId ? { ...m, content: m.content + piece } : m)),
                );
              },
            );
            updateTaskStatus(taskReqId, 'completed');
            updateTaskStatus(taskArchId, 'in-progress');
            setMessages((prev) => {
              const next = prev.map((m) =>
                m.id === emmaMsgId ? { ...m, status: 'done' as const } : m,
              );
              saveMessages(next);
              return next;
            });
          } catch {
            // 规划失败自动跳过
            updateTaskStatus(taskReqId, 'completed');
            updateTaskStatus(taskArchId, 'in-progress');
            setMessages((prev) => {
              const next = prev.map((m) =>
                m.id === emmaMsgId
                  ? { ...m, content: '（需求分析异常，已自动跳过，直接进入设计阶段）', status: 'error' as const }
                  : m,
              );
              saveMessages(next);
              return next;
            });
          }

          // ========== 阶段 3: Bob 架构设计 ==========
          setCurrentAgent('Bob');
          const bobMsgId = addAgentMessage('Bob', 'thinking');

          try {
            await streamAgentResponse(
              AGENTS.Bob.pluginId,
              { project_requirement: prompt },
              (piece) => {
                setMessages((prev) =>
                  prev.map((m) => (m.id === bobMsgId ? { ...m, content: m.content + piece } : m)),
                );
              },
            );
            updateTaskStatus(taskArchId, 'completed');
            updateTaskStatus(taskDevId, 'in-progress');
            setMessages((prev) => {
              const next = prev.map((m) =>
                m.id === bobMsgId ? { ...m, status: 'done' as const } : m,
              );
              saveMessages(next);
              return next;
            });
          } catch {
            updateTaskStatus(taskArchId, 'completed');
            updateTaskStatus(taskDevId, 'in-progress');
            setMessages((prev) => {
              const next = prev.map((m) =>
                m.id === bobMsgId
                  ? { ...m, content: '（架构设计异常，已自动跳过，直接进入代码生成）', status: 'error' as const }
                  : m,
              );
              saveMessages(next);
              return next;
            });
          }
        } else {
          // 迭代模式：直接进入代码修改
          const taskDevId = addTask({
            title: '迭代修改',
            description: `基于用户指令修改应用：${prompt.slice(0, 50)}`,
            assignee: 'Alex',
            status: 'in-progress',
          });
          const taskSummaryId = addTask({
            title: '交付总结',
            description: '汇总本次迭代更新内容',
            assignee: 'Mike',
            status: 'pending',
          });

          // 存 taskId 引用
          (useWorkspace as any)._taskDevId = taskDevId;
          (useWorkspace as any)._taskSummaryId = taskSummaryId;
        }

        // ========== 阶段 4: Alex 代码生成 ==========
        setCurrentAgent('Alex');
        const alexMsgId = addAgentMessage('Alex', 'thinking');
        let generatedCode = '';

        try {
          const alexInput = isIteration
            ? {
                application_requirement: `当前应用代码如下：\n\n${currentCode}\n\n请在此代码基础上进行修改，满足以下新需求：${prompt}\n\n请输出修改后的完整 HTML 代码，保持原有功能的同时增加新功能。`,
              }
            : { application_requirement: prompt };

          await streamAgentResponse(AGENTS.Alex.pluginId, alexInput, (piece) => {
            generatedCode += piece;
            // 实时更新消息，但不渲染全部以性能考虑
            setMessages((prev) =>
              prev.map((m) => (m.id === alexMsgId ? { ...m, content: generatedCode.slice(0, 500) + (generatedCode.length > 500 ? '\n... (代码生成中)' : '') } : m)),
            );
          });

          // 剥离 markdown 代码块
          const cleanCode = stripCodeBlocks(generatedCode);
          generatedCode = cleanCode;

          // 更新最终消息
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === alexMsgId
                ? { ...m, content: `已生成 ${cleanCode.length} 字符的完整代码，点击「代码」标签页查看。`, status: 'done' as const }
                : m,
            );
            saveMessages(next);
            return next;
          });

          // 保存版本
          const parentId = currentVersion ? currentVersion.id : null;
          addVersion(cleanCode, prompt, parentId);

          // 更新任务状态
          if (!isIteration) {
            // 查找并更新开发任务
            setTasks((prev) => {
              const devTask = prev.find((t) => t.assignee === 'Alex' && t.status === 'in-progress');
              const summaryTask = prev.find((t) => t.assignee === 'Mike' && t.title === '交付总结');
              const next = prev.map((t) => {
                if (devTask && t.id === devTask.id) return { ...t, status: 'completed' as const };
                if (summaryTask && t.id === summaryTask.id) return { ...t, status: 'in-progress' as const };
                return t;
              });
              saveTasks(next);
              return next;
            });
          } else {
            const taskDevId = (useWorkspace as any)._taskDevId;
            const taskSummaryId = (useWorkspace as any)._taskSummaryId;
            if (taskDevId) updateTaskStatus(taskDevId, 'completed');
            if (taskSummaryId) updateTaskStatus(taskSummaryId, 'in-progress');
          }
        } catch (err) {
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === alexMsgId
                ? { ...m, content: `代码生成失败：${(err as Error).message}\n\n请点击下方「重试」按钮重新生成。`, status: 'error' as const }
                : m,
            );
            saveMessages(next);
            return next;
          });
          toast.error('代码生成失败，请重试');
          setIsGenerating(false);
          setCurrentAgent(null);
          return;
        }

        // ========== 阶段 5: Mike 总结交付 ==========
        setCurrentAgent('Mike');
        const summaryMsgId = addAgentMessage('Mike', 'thinking');

        try {
          await streamAgentResponse(
            AGENTS.Mike.pluginId,
            {
              user_demand: prompt,
              work_progress: isIteration ? '迭代修改已完成' : '需求分析、架构设计、代码实现均已完成',
              delivery_content: `已生成${isIteration ? '迭代版本' : '首个版本'}应用，包含完整的 HTML/CSS/JS 代码，可直接在预览中查看和使用。代码长度约 ${generatedCode.length} 字符。`,
            },
            (piece) => {
              setMessages((prev) =>
                prev.map((m) => (m.id === summaryMsgId ? { ...m, content: m.content + piece } : m)),
              );
            },
          );
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === summaryMsgId ? { ...m, status: 'done' as const } : m,
            );
            saveMessages(next);
            return next;
          });

          // 更新交付任务
          setTasks((prev) => {
            const summaryTask = prev.find((t) => t.assignee === 'Mike' && t.status === 'in-progress');
            if (!summaryTask) return prev;
            const next = prev.map((t) => (t.id === summaryTask.id ? { ...t, status: 'completed' as const } : t));
            saveTasks(next);
            return next;
          });
        } catch {
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === summaryMsgId
                ? { ...m, content: '（交付总结生成异常，但代码已可正常使用）', status: 'error' as const }
                : m,
            );
            saveMessages(next);
            return next;
          });
        }

        toast.success(isIteration ? '迭代更新完成' : '项目生成完成！');
      } catch (err) {
        logger.error('Pipeline error:', String(err));
        toast.error('生成过程中出现错误');
      } finally {
        setIsGenerating(false);
        setCurrentAgent(null);
      }
    },
    [
      isGenerating,
      addAgentMessage,
      streamAgentResponse,
      addTask,
      updateTaskStatus,
      addVersion,
      currentCode,
      currentVersion,
      updateMessageContent,
      saveMessages,
      saveTasks,
    ],
  );

  // 发送消息
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isGenerating) return;

      // 添加用户消息
      const userMsg: IMessage = {
        id: generateId('msg'),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
        status: 'done',
      };
      setMessages((prev) => {
        const next = [...prev, userMsg];
        saveMessages(next);
        return next;
      });

      const isIteration = versions.length > 0;
      await runPipeline(trimmed, isIteration);
    },
    [isGenerating, versions.length, runPipeline, saveMessages],
  );

  // 回滚到指定版本
  const rollbackToVersion = useCallback(
    (versionId: string) => {
      const version = versions.find((v) => v.id === versionId);
      if (!version) return;
      setCurrentVersion(version);
      setCurrentCode(version.code);
      toast.info(`已回滚到 ${version.version}`);
    },
    [versions],
  );

  // 重试
  const retryLastGeneration = useCallback(async () => {
    if (!lastPromptRef.current || isGenerating) return;
    await runPipeline(lastPromptRef.current, versions.length > 0);
  }, [isGenerating, runPipeline, versions.length]);

  return {
    messages,
    tasks,
    versions,
    currentVersion,
    currentCode,
    isGenerating,
    currentAgent,
    sendMessage,
    rollbackToVersion,
    previewDevice,
    setPreviewDevice,
    retryLastGeneration,
  };
}
