// EXPORTS: Header
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogOut, User as UserIcon, Sparkles } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-xl border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
            ⚛
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-foreground">AtomStudio</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">原子工作室</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/templates"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'text-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`
            }
          >
            模板库
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="default" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                进入工作台
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-ring/20 hover:ring-violet-500/40 transition-all">
                    {user.email.charAt(0).toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <div className="text-sm font-medium text-foreground truncate">{user.email}</div>
                    <div className="text-xs text-muted-foreground">已登录</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    我的项目
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/templates')}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    模板库
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                登录
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/auth?mode=register')}>
                免费注册
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
