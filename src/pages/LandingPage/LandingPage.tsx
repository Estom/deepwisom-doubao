// EXPORTS: default (LandingPage)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Bot, Globe, Code2, History } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProjects } from '@/lib/useProjects';
import { AGENT_LIST } from '@/lib/agents';
import AgentAvatar from '@/components/AgentAvatar';
import { Button } from '@/components/ui/button';
import { MOCK_INSPIRATIONS } from '@/data/inspirations';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const { user } = useAuth();
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) {
      toast.info('请先描述你想创建的应用');
      return;
    }
    if (!user) {
      toast.info('请先登录或注册账号');
      navigate('/auth');
      return;
    }
    try {
      const project = createProject('新项目', trimmed);
      navigate(`/workspace/${project.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleInspirationClick = (text: string) => {
    setPrompt(text);
  };

  const features = [
    { icon: <Bot className="w-5 h-5" />, title: '多智能体协作', desc: '5 个专业角色智能体，按软件 SOP 流水线协作，从需求到交付一气呵成' },
    { icon: <Zap className="w-5 h-5" />, title: '即时预览', desc: '生成过程中实时预览效果，边做边看，不满意随时调整迭代' },
    { icon: <Code2 className="w-5 h-5" />, title: '代码开源', desc: '生成的代码完全可读、可下载，支持一键导出为 HTML 文件' },
    { icon: <History className="w-5 h-5" />, title: '版本管理', desc: '完整版本历史记录，支持一键回滚、基于历史版本分支开发' },
    { icon: <Globe className="w-5 h-5" />, title: '多设备预览', desc: '桌面、平板、手机三端设备预览，确保响应式体验完美' },
    { icon: <Sparkles className="w-5 h-5" />, title: '模板启动', desc: '内置精选模板库，点击即用，快速启动你的下一个项目' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(230_35%_6%)] via-[hsl(245_40%_10%)] to-[hsl(230_35%_6%)] text-foreground">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-28 overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            {/* 主标题 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center mb-12 md:mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/50 border border-border/50 text-sm text-muted-foreground mb-6"
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>全新多智能体 AI 开发平台</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-violet-200 to-fuchsia-300">
                  Dream, Chat, Create
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400">
                  你的 24/7 AI 开发团队
                </span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                用一句话描述你的想法，多智能体团队在数分钟内为你生成可运行的网页应用。
                <br className="hidden md:block" />
                需求分析、架构设计、代码实现，全流程自动化。
              </p>
            </motion.div>

            {/* 智能体环绕输入框 */}
            <div className="relative max-w-4xl mx-auto">
              {/* 左上方 Emma */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="absolute -top-6 left-0 md:left-4 flex flex-col items-center gap-2"
              >
                <AgentAvatar name="Emma" size="lg" isActive />
                <div className="text-xs text-center">
                  <div className="font-medium text-fuchsia-400">Emma</div>
                  <div className="text-muted-foreground text-[10px]">产品经理</div>
                </div>
              </motion.div>

              {/* 右上方 Mike */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -top-10 right-0 md:right-8 flex flex-col items-center gap-2"
              >
                <AgentAvatar name="Mike" size="lg" isActive />
                <div className="text-xs text-center">
                  <div className="font-medium text-orange-400">Mike</div>
                  <div className="text-muted-foreground text-[10px]">团队领队</div>
                </div>
              </motion.div>

              {/* 左侧 Alex */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2"
              >
                <AgentAvatar name="Alex" size="lg" isActive />
                <div className="text-xs text-center">
                  <div className="font-medium text-blue-400">Alex</div>
                  <div className="text-muted-foreground text-[10px]">工程师</div>
                </div>
              </motion.div>

              {/* 右侧 Bob */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2"
              >
                <AgentAvatar name="Bob" size="lg" isActive />
                <div className="text-xs text-center">
                  <div className="font-medium text-sky-400">Bob</div>
                  <div className="text-muted-foreground text-[10px]">架构师</div>
                </div>
              </motion.div>

              {/* 左下方 David */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute -bottom-16 left-8 md:left-16 flex flex-col items-center gap-2"
              >
                <AgentAvatar name="David" size="lg" isActive />
                <div className="text-xs text-center">
                  <div className="font-medium text-emerald-400">David</div>
                  <div className="text-muted-foreground text-[10px]">数据分析师</div>
                </div>
              </motion.div>

              {/* 中央输入框 */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mx-4 md:mx-20"
              >
                <form
                  onSubmit={handleSubmit}
                  className="relative rounded-2xl p-1 bg-gradient-to-br from-violet-500/40 via-fuchsia-500/30 to-orange-500/40 shadow-2xl shadow-violet-500/20"
                >
                  <div className="rounded-xl bg-card/90 backdrop-blur-xl p-4 md:p-6">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="描述你想创建的应用...例如：一个番茄钟时间管理工具"
                      className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 resize-none outline-none text-base md:text-lg min-h-[80px] md:min-h-[100px] font-sans"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        AI 团队准备就绪
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/30"
                      >
                        开始创建
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>

                {/* 快捷灵感 chips */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3">
                  <span className="text-xs text-muted-foreground mr-1">快捷灵感：</span>
                  {MOCK_INSPIRATIONS.map((item) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => handleInspirationClick(item.prompt)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-full bg-card/60 border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-violet-500/50 hover:bg-violet-500/10 transition-all"
                    >
                      <span className="mr-1">{item.icon}</span>
                      {item.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                为什么选择 <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">AtomStudio</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                全流程 AI 驱动的应用生成体验，从构想到上线只需几分钟
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-sm hover:border-violet-500/40 hover:bg-card/60 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Agents Intro Section */}
        <section className="w-full py-20 md:py-28 bg-card/20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">认识你的 AI 团队</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                五位专业智能体协同工作，覆盖从需求分析到代码交付的完整链路
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {AGENT_LIST.map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="p-5 rounded-2xl bg-card/50 border border-border/40 text-center hover:border-violet-500/40 transition-all"
                >
                  <div className="flex justify-center mb-3">
                    <AgentAvatar name={agent.name} size="lg" />
                  </div>
                  <div className="font-semibold text-foreground">{agent.name}</div>
                  <div
                    className="text-xs font-medium mb-2"
                    style={{ color: agent.themeColor }}
                  >
                    {agent.role}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative rounded-3xl p-8 md:p-14 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-fuchsia-600/30 to-orange-500/30 rounded-3xl" />
              <div className="absolute inset-0 bg-card/60 backdrop-blur-md border border-border/40 rounded-3xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  准备好开启你的 AI 开发之旅了吗？
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  免费注册，立即体验多智能体协作的强大能力
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate(user ? '/dashboard' : '/auth?mode=register')}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-xl shadow-violet-500/30"
                  >
                    {user ? '进入工作台' : '免费开始使用'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/templates')}
                    className="gap-2"
                  >
                    浏览模板
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
