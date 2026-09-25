// EXPORTS: Footer
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/30 bg-card/30 py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 flex items-center justify-center font-bold text-white text-sm">
                ⚛
              </div>
              <span className="font-bold text-foreground">AtomStudio</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              你的 24/7 AI 开发团队，用一句话描述想法，多智能体协作在数分钟内生成可运行的网页应用。
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">产品</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/templates" className="hover:text-foreground transition-colors">模板库</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">工作台</Link></li>
              <li><span className="opacity-60 cursor-not-allowed">插件市场</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">团队</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>🧡 Mike · 团队领队</li>
              <li>💜 Emma · 产品经理</li>
              <li>💙 Bob · 架构师</li>
              <li>🔵 Alex · 工程师</li>
              <li>💚 David · 数据分析师</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">关于</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="opacity-60 cursor-not-allowed">使用条款</span></li>
              <li><span className="opacity-60 cursor-not-allowed">隐私政策</span></li>
              <li><span className="opacity-60 cursor-not-allowed">联系我们</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AtomStudio · 由多智能体 AI 技术驱动
        </div>
      </div>
    </footer>
  );
}
