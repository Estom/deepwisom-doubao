// EXPORTS: default (WorkspacePage)
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Monitor,
  TabletSmartphone,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Copy,
  Download,
  ListTodo,
  History,
  Eye,
  Code2,
  Save,
  Pencil,
  X,
  Check,
  Sparkles,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  RotateCcw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth';
import { useWorkspace } from '@/lib/useWorkspace';
import { useProjects } from '@/lib/useProjects';
import type { ITask, IVersion, TaskStatus } from '@/lib/types';
import { AGENT_LIST, getAgent, type AgentName } from '@/lib/agents';
import AgentAvatar from '@/components/AgentAvatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type WorkspaceTab = 'preview' | 'code' | 'tasks' | 'versions';

const deviceWidths: Record<DeviceType, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const deviceHeights: Record<DeviceType, string> = {
  desktop: '100%',
  tablet: '1024px',
  mobile: '667px',
};

export default function WorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { getProject, updateProject } = useProjects();
  const project = projectId ? getProject(projectId) : null;
  const workspace = useWorkspace(projectId || '');
  const {
    messages,
    tasks,
    versions,
    currentCode,
    isGenerating,
    currentAgent,
    sendMessage,
    rollbackToVersion,
    retryLastGeneration,
  } = workspace;

  const renameProject = (newName: string) => {
    if (projectId) {
      updateProject(projectId, { name: newName });
    }
  };

  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('preview');
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<IVersion | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 未登录跳转
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // 项目不存在跳转
  useEffect(() => {
    if (!authLoading && user && project && !project) {
      // project 可能为 null（useWorkspace 初始化时），交给 workspace 处理
    }
  }, [project, user, authLoading, navigate]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 有新消息自动切到预览/任务
  useEffect(() => {
    if (messages.length > 0 && isGenerating) {
      // 生成中自动切到任务列表看进度
    }
  }, [messages, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isGenerating) return;

    setInputValue('');
    await sendMessage(trimmed);
  };

  const handleMention = (name: string) => {
    setInputValue((prev) => prev + `@${name} `);
    inputRef.current?.focus();
  };

  const handleCopyCode = async () => {
    if (!currentCode) return;
    try {
      await navigator.clipboard.writeText(currentCode);
      toast.success('代码已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  const handleDownload = () => {
    if (!currentCode) return;
    const blob = new Blob([currentCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'app'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已下载为 HTML 文件');
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      // 重新写入内容触发刷新
      iframe.srcdoc = currentCode || '';
    }
  };

  const handleOpenNewTab = () => {
    if (!currentCode) return;
    const blob = new Blob([currentCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleStartRename = () => {
    if (project) {
      setEditName(project.name);
      setIsRenaming(true);
    }
  };

  const handleSaveRename = () => {
    if (editName.trim() && project) {
      renameProject(editName.trim());
      toast.success('项目名称已更新');
    }
    setIsRenaming(false);
  };

  const handleRollback = (version: IVersion) => {
    rollbackToVersion(version.id);
    setSelectedVersion(null);
    toast.success(`已回滚到版本 ${version.version}`);
  };

  const statusColor: Record<TaskStatus, string> = {
    pending: 'bg-muted text-muted-foreground',
    'in-progress': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const statusText: Record<TaskStatus, string> = {
    pending: '待处理',
    'in-progress': '进行中',
    completed: '已完成',
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">项目不存在或已被删除</p>
        <Button onClick={() => navigate('/dashboard')}>返回仪表盘</Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[hsl(230_35%_6%)] to-[hsl(245_30%_8%)] text-foreground flex flex-col overflow-hidden">
      {/* 顶部工具栏 */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-border/40 bg-card/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2">
            {isRenaming ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                  onBlur={handleSaveRename}
                  className="h-8 w-48 text-sm"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400" onClick={handleSaveRename}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setIsRenaming(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={handleStartRename}>
                <h1 className="text-sm font-semibold">{project.name}</h1>
                <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/40 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-muted-foreground">自动保存</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!currentCode} className="gap-1.5 hidden sm:flex">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">导出代码</span>
          </Button>
        </div>
      </header>

      {/* 主体三栏 */}
      <div className="flex-1 flex min-h-0">
        {/* 左栏：对话区 */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-14' : 'w-full md:w-[380px] lg:w-[420px]'
          } border-r border-border/40 flex flex-col bg-card/20 transition-all duration-300 shrink-0 relative`}
        >
          {/* 折叠按钮 */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground shadow-md"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>

          {!sidebarCollapsed && (
            <>
              {/* 智能体头像组 */}
              <div className="px-4 py-3 border-b border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">AI 团队</span>
                  {isGenerating && currentAgent && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                      {currentAgent} 工作中
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {AGENT_LIST.map((agent) => (
                    <TooltipProvider key={agent.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleMention(agent.name)}
                            className="transition-transform hover:scale-110"
                          >
                            <AgentAvatar
                              name={agent.name as AgentName}
                              size="sm"
                              isActive={isGenerating && currentAgent === agent.name}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="text-xs">{agent.name} · {agent.role}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>

              {/* 消息流 */}
              <ScrollArea className="flex-1 px-3">
                <div className="py-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-violet-400" />
                      </div>
                      <p className="text-sm font-medium mb-1">开始你的项目</p>
                      <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                        描述你想创建的应用，多智能体团队会为你分析需求、设计方案并生成代码
                      </p>
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isUser = msg.role === 'user';
                      const agent = msg.agentName ? getAgent(msg.agentName as AgentName) : null;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
                        >
                          {!isUser && agent ? (
                            <AgentAvatar name={agent.name as AgentName} size="sm" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {user?.email.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
                            {!isUser && agent && (
                              <div
                                className="text-xs font-medium mb-1 flex items-center gap-1"
                                style={{ color: agent.themeColor }}
                              >
                                {agent.name}
                                <span className="text-muted-foreground text-[10px]">· {agent.role}</span>
                              </div>
                            )}
                            <div
                              className={`inline-block px-3 py-2 rounded-2xl text-sm leading-relaxed max-w-full ${
                                isUser
                                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-tr-sm'
                                  : 'bg-card/80 border border-border/40 rounded-tl-sm'
                              }`}
                            >
                              {msg.status === 'thinking' || msg.status === 'sending' ? (
                                <div className="flex items-center gap-1.5 py-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                                </div>
                              ) : msg.role === 'user' ? (
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/40 prose-pre:rounded-lg prose-code:text-xs">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* 输入框 */}
              <div className="p-3 border-t border-border/30">
                <form onSubmit={handleSubmit} className="relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={isGenerating ? 'AI 团队正在工作中...' : '描述你的需求，或 @ 指定智能体'}
                    disabled={isGenerating}
                    rows={2}
                    className="w-full bg-card/60 border border-border/40 rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-muted-foreground/50 disabled:opacity-50"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      {AGENT_LIST.slice(0, 3).map((agent) => (
                        <button
                          key={agent.name}
                          type="button"
                          onClick={() => handleMention(agent.name)}
                          disabled={isGenerating}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-violet-500/20 hover:text-violet-300 transition-colors disabled:opacity-50"
                        >
                          @{agent.name}
                        </button>
                      ))}
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isGenerating || !inputValue.trim()}
                      className="gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 h-8"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      发送
                    </Button>
                  </div>
                </form>
                {isGenerating && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={retryLastGeneration}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      遇到问题？点击重试
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        {/* 右栏：工作区 */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* 标签页 */}
          <div className="h-12 flex items-center justify-between px-4 border-b border-border/40 bg-card/20">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as WorkspaceTab)} className="h-full">
              <TabsList className="h-8 bg-transparent gap-1">
                <TabsTrigger value="preview" className="h-8 gap-1.5 data-[state=active]:bg-card">
                  <Eye className="w-3.5 h-3.5" />
                  预览
                </TabsTrigger>
                <TabsTrigger value="code" className="h-8 gap-1.5 data-[state=active]:bg-card">
                  <Code2 className="w-3.5 h-3.5" />
                  代码
                </TabsTrigger>
                <TabsTrigger value="tasks" className="h-8 gap-1.5 data-[state=active]:bg-card">
                  <ListTodo className="w-3.5 h-3.5" />
                  任务清单
                </TabsTrigger>
                <TabsTrigger value="versions" className="h-8 gap-1.5 data-[state=active]:bg-card">
                  <History className="w-3.5 h-3.5" />
                  版本历史
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 标签特定操作 */}
            <div className="flex items-center gap-1">
              {activeTab === 'preview' && (
                <>
                  <div className="flex items-center bg-muted/40 rounded-lg p-0.5 mr-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setDevice('desktop')}
                            className={`p-1.5 rounded-md transition-colors ${
                              device === 'desktop' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Monitor className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">桌面</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setDevice('tablet')}
                            className={`p-1.5 rounded-md transition-colors ${
                              device === 'tablet' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <TabletSmartphone className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">平板</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setDevice('mobile')}
                            className={`p-1.5 rounded-md transition-colors ${
                              device === 'mobile' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">手机</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={!currentCode}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenNewTab} disabled={!currentCode}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </>
              )}
              {activeTab === 'code' && (
                <>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={handleCopyCode} disabled={!currentCode}>
                    <Copy className="w-3.5 h-3.5" />
                    复制
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={handleDownload} disabled={!currentCode}>
                    <Download className="w-3.5 h-3.5" />
                    下载
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 标签内容 */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {/* 预览 */}
            <div className={`h-full ${activeTab === 'preview' ? '' : 'hidden'}`}>
              {currentCode ? (
                <div className="h-full w-full flex items-center justify-center p-4 md:p-6 bg-[hsl(230_25%_8%)] overflow-auto">
                  <motion.div
                    key={device}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                    style={{
                      width: device === 'desktop' ? '100%' : deviceWidths[device],
                      height: device === 'desktop' ? '100%' : deviceHeights[device],
                      maxWidth: '100%',
                    }}
                  >
                    {device !== 'desktop' && (
                      <div
                        className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-border/40 to-muted/30 shadow-2xl"
                        style={{ padding: device === 'mobile' ? '12px' : '14px' }}
                      >
                        <div className="w-full h-full rounded-[2rem] bg-background overflow-hidden">
                          <iframe
                            ref={iframeRef}
                            srcDoc={currentCode}
                            title="preview"
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                          />
                        </div>
                      </div>
                    )}
                    {device === 'desktop' && (
                      <div className="w-full h-full rounded-xl border border-border/40 shadow-2xl overflow-hidden bg-white">
                        <iframe
                          ref={iframeRef}
                          srcDoc={currentCode}
                          title="preview"
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                        />
                      </div>
                    )}
                  </motion.div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
                    <Play className="w-10 h-10 text-violet-400 ml-1" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">实时预览区</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-6">
                    在左侧输入需求，AI 团队生成代码后将在此处实时预览运行效果
                  </p>
                  {isGenerating ? (
                    <Badge variant="outline" className="gap-2 px-3 py-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      正在生成应用...
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      等待生成
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* 代码 */}
            <div className={`h-full ${activeTab === 'code' ? '' : 'hidden'}`}>
              {currentCode ? (
                <ScrollArea className="h-full">
                  <pre className="p-4 text-xs font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap break-all">
                    <code>{currentCode}</code>
                  </pre>
                </ScrollArea>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                    <Code2 className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">暂无代码</h3>
                  <p className="text-sm text-muted-foreground">
                    发送需求后，AI 工程师会生成完整代码
                  </p>
                </div>
              )}
            </div>

            {/* 任务清单 */}
            <div className={`h-full ${activeTab === 'tasks' ? '' : 'hidden'}`}>
              <ScrollArea className="h-full">
                <div className="p-4 md:p-6 max-w-3xl mx-auto">
                  {tasks.length === 0 ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                        <ListTodo className="w-8 h-8 text-violet-400" />
                      </div>
                      <h3 className="text-base font-semibold mb-1">任务清单为空</h3>
                      <p className="text-sm text-muted-foreground">
                        发送需求后，架构师会拆分任务并分配给各个智能体
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task: ITask) => {
                        const agent = task.assignee ? getAgent(task.assignee as AgentName) : null;
                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-card/40 border border-border/40 hover:border-border/60 transition-colors"
                          >
                             <div className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center ${
                               task.status === 'completed' ? 'bg-emerald-500' :
                               task.status === 'in-progress' ? 'bg-violet-500' : 'bg-muted'
                             }`}>
                               {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                               {task.status === 'in-progress' && (
                                 <motion.div
                                   animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                                   transition={{ duration: 1.5, repeat: Infinity }}
                                   className="w-2 h-2 rounded-full bg-white"
                                 />
                               )}
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center justify-between gap-2 mb-1">
                                 <h4 className={`text-sm font-medium ${
                                   task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                                 }`}>
                                   {task.title}
                                 </h4>
                                 <Badge
                                   variant="outline"
                                   className={`text-[10px] shrink-0 ${statusColor[task.status]}`}
                                 >
                                   {statusText[task.status]}
                                 </Badge>
                               </div>
                               {task.description && (
                                 <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                               )}
                               {agent && (
                                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                   <div
                                     className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                                     style={{ backgroundColor: agent.themeColor }}
                                   >
                                     {agent.emoji}
                                   </div>
                                   <span>{agent.name}</span>
                                 </div>
                               )}
                             </div>
                           </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* 版本历史 */}
            <div className={`h-full ${activeTab === 'versions' ? '' : 'hidden'}`}>
              <ScrollArea className="h-full">
                <div className="p-4 md:p-6 max-w-3xl mx-auto">
                  {versions.length === 0 ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                        <History className="w-8 h-8 text-violet-400" />
                      </div>
                      <h3 className="text-base font-semibold mb-1">暂无版本</h3>
                      <p className="text-sm text-muted-foreground">
                        每次生成或迭代都会产生一个新版本
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* 时间线 */}
                      <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border/50" />
                      <div className="space-y-3">
                        {versions.map((v: IVersion, idx: number) => (
                          <motion.div
                            key={v.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative pl-10"
                          >
                            <div
                              className={`absolute left-0 top-3 w-[14px] h-[14px] rounded-full border-2 ${
                                idx === 0
                                  ? 'bg-violet-500 border-violet-400'
                                  : 'bg-card border-border'
                              }`}
                            />
                            <div
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                selectedVersion?.id === v.id
                                  ? 'bg-violet-500/10 border-violet-500/40'
                                  : 'bg-card/40 border-border/40 hover:border-border/60'
                              }`}
                              onClick={() => setSelectedVersion(selectedVersion?.id === v.id ? null : v)}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">
                                       版本 {v.version}
                                    </span>
                                    {idx === 0 && (
                                      <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/30">
                                        当前
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {format(v.createdAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                                  </div>
                                </div>
                                {idx !== 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRollback(v);
                                    }}
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    回滚
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {v.prompt || '初始版本'}
                              </p>

                              {selectedVersion?.id === v.id && v.code && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  className="mt-3 pt-3 border-t border-border/40"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <GitBranch className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">代码快照预览</span>
                                  </div>
                                  <pre className="p-3 rounded-lg bg-muted/30 text-[10px] font-mono text-muted-foreground/70 max-h-48 overflow-auto whitespace-pre-wrap break-all">
                                    {v.code.slice(0, 2000)}
                                    {v.code.length > 2000 && '\n...'}
                                  </pre>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
