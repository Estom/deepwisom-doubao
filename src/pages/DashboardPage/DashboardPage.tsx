// EXPORTS: default (DashboardPage)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  FolderOpen,
  MoreVertical,
  Pencil,
  Trash2,
  Sparkles,
  Clock,
  Code,
  FileText,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '@/lib/auth';
import { useProjects } from '@/lib/useProjects';
import type { IProject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const navigate = useNavigate();
  const [newProjectName, setNewProjectName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.info('请输入项目名称');
      return;
    }
    setIsCreating(true);
    try {
      const project = createProject(newProjectName);
      toast.success('项目创建成功');
      setCreateDialogOpen(false);
      setNewProjectName('');
      navigate(`/workspace/${project.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRename = (project: IProject) => {
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const saveRename = (id: string) => {
    if (!editingName.trim()) return;
    updateProject(id, { name: editingName.trim() });
    setEditingId(null);
    toast.success('项目已重命名');
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjectToDelete(null);
    toast.success('项目已删除');
  };

  const handleTemplateStart = (prompt: string, name: string) => {
    const project = createProject(name, prompt);
    navigate(`/workspace/${project.id}`);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(230_35%_6%)] via-[hsl(240_30%_9%)] to-[hsl(230_35%_6%)] text-foreground flex flex-col">
      <Header />

      <main className="flex-1 w-full py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* 顶部标题区 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">我的项目</h1>
              <p className="text-sm text-muted-foreground">
                共 {projects.length} 个项目 · 数据本地保存，刷新不丢失
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/templates')} className="gap-2">
                <Sparkles className="w-4 h-4" />
                从模板开始
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20">
                    <Plus className="w-4 h-4" />
                    新建项目
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建新项目</DialogTitle>
                    <DialogDescription>
                      给你的项目起个名字，进入工作台后可以用自然语言描述需求。
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="例如：番茄钟应用"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                    autoFocus
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      disabled={isCreating || !newProjectName.trim()}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                    >
                      {isCreating ? '创建中...' : '创建项目'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 项目网格或空状态 */}
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-12 md:p-16 text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
                <FolderOpen className="w-10 h-10 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">还没有项目</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                创建你的第一个项目，让多智能体 AI 团队为你生成可运行的网页应用
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20"
                >
                  <Plus className="w-4 h-4" />
                  创建第一个项目
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/templates')}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  从模板开始
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <AnimatePresence>
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-border/50 to-transparent hover:from-violet-500/40 hover:via-fuchsia-500/30 hover:to-orange-500/20 transition-all"
                  >
                    <div className="rounded-2xl bg-card/90 backdrop-blur-sm p-5 h-full flex flex-col cursor-pointer"
                      onClick={() => navigate(`/workspace/${project.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-violet-400" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRename(project); }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              重命名
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => { e.stopPropagation(); setProjectToDelete(project.id); }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {editingId === project.id ? (
                        <input
                          className="text-lg font-semibold bg-transparent border-b border-violet-500 outline-none mb-2 px-0"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(project.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onBlur={() => saveRename(project.id)}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-violet-300 transition-colors line-clamp-1">
                          {project.name}
                        </h3>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {project.summary}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: zhCN })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          <span>{project.versionCount} 个版本</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* 删除确认对话框 */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除项目？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该项目及其所有对话记录、代码版本和任务数据，删除后无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => projectToDelete && handleDelete(projectToDelete)}
            >
              删除项目
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
