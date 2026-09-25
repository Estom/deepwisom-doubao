// EXPORTS: default (TemplatesPage)
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProjects } from '@/lib/useProjects';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_TEMPLATES, type ITemplate } from '@/data/templates';

export default function TemplatesPage() {
  const { user } = useAuth();
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const handleUseTemplate = (template: ITemplate) => {
    if (!user) {
      toast.info('请先登录或注册账号');
      navigate('/auth');
      return;
    }
    try {
      const project = createProject(template.name, template.prompt);
      toast.success(`已基于「${template.name}」创建项目`);
      navigate(`/workspace/${project.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(230_35%_6%)] via-[hsl(240_30%_9%)] to-[hsl(230_35%_6%)] text-foreground flex flex-col">
      <Header />

      <main className="flex-1 w-full py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* 标题区 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/50 border border-border/50 text-sm text-muted-foreground mb-4">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>精选模板</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              从模板快速开始
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              选择一个模板，让 AI 团队基于它为你生成完整的应用，一键启动项目
            </p>
          </motion.div>

          {/* 模板网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MOCK_TEMPLATES.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group rounded-2xl p-[1px] bg-gradient-to-br from-border/60 to-transparent hover:from-violet-500/40 hover:via-fuchsia-500/30 hover:to-orange-500/20 transition-all"
              >
                <div className="rounded-2xl bg-card/90 backdrop-blur-sm h-full flex flex-col overflow-hidden">
                  {/* 预览区 */}
                  <div
                    className="h-40 flex items-center justify-center text-5xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${template.color}20, ${template.color}05)`,
                    }}
                  >
                    <motion.span
                      className="relative z-10"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {template.icon}
                    </motion.span>
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${template.color}40, transparent 60%)`,
                      }}
                    />
                  </div>

                  {/* 信息区 */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-violet-300 transition-colors">
                        {template.name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 flex-1 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-muted/50 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="w-full gap-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-sm"
                    >
                      使用此模板
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 底部提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-muted-foreground mb-3">
              没找到合适的模板？用一句话描述你的想法，AI 团队从零为你打造
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              返回首页自由创建
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
