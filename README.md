# AtomStudio 原子工作室

> 一个对标 [Atoms（atoms.dev）](https://atoms.dev/) 的多智能体 AI 应用生成平台 Demo：用自然语言描述需求，一支由 5 个角色组成的 AI 开发团队按软件 SOP 协作，实时生成可运行的网页应用并在线预览，支持对话迭代、多设备预览、版本回滚与代码导出。

## 在线体验

**[https://4m4kf595npv3j.doubaoapps.com/app/app_17etupzu0f8](https://4m4kf595npv3j.doubaoapps.com/app/app_17etupzu0f8)**（建议使用桌面版 Chrome / Edge）

打开后注册任意账户即可使用，无需邮箱验证。

## 核心流程

```
落地页（想法输入） → 注册/登录 → 创建项目
  → 多智能体协作流水线（需求 → 设计 → 任务拆分 → 编码 → 交付）
  → iframe 实时预览（桌面/平板/手机）
  → 对话式迭代修改 → 版本管理 / 代码导出
```

| 顺序 | 角色 | 职责 | 产物 |
|---|---|---|---|
| ① | Mike 团队领队（橙） | 接单、概述目标、协调进度 | 任务概述 |
| ② | Emma 产品经理（粉紫） | 需求分析、功能清单 | 结构化需求要点 |
| ③ | Bob 架构师（蓝） | 页面结构设计、任务拆分 | 设计要点 + 任务清单 |
| ④ | Alex 工程师（深蓝） | 编码实现 | 完整单文件 HTML 应用 |
| ⑤ | Mike 团队领队（橙） | 总结交付、引导迭代 | 交付说明 |

## 功能特性

**基本流程**

- 深色科技风落地页，智能体头像呼吸浮动环绕输入框，快捷灵感 chips
- 邮箱注册 / 登录 / 退出，密码 SHA-256 哈希存储，会话保持，未登录拦截
- 五阶段真实 AI 流式协作（思考 → 进行中 → 已完成），任务清单同步翻转状态
- iframe 沙箱实时渲染生成的应用，对话式增量迭代（携带历史代码，避免丢功能）

**延展能力**

1. **多设备实时预览**：桌面 / 平板 / 手机三种设备边框一键切换
2. **版本历史与一键回滚**：时间线展示每次生成的版本与代码快照，可恢复任意版本
3. **模板库**：8 个精选模板（博客、作品集、电商落地页、待办清单、记账本、贪吃蛇、预约表单、数据看板）
4. **代码导出**：语法高亮 + 一键复制 + 下载 .html，支持新标签页打开
5. **@召唤机制**：@Mike/@Emma/@Bob/@Alex/@David 指定角色参与，数据类需求召唤数据分析师 David

**工程质量**

- TypeScript 类型检查 0 error，生产构建通过
- 空状态 / 加载状态 / 错误状态 / 重试机制完整，生成中防重复提交
- 规划阶段失败自动降级（跳过次要环节，保证主流程不中断）
- 响应式布局，窄屏侧栏可折叠

## 技术栈

- React 19 + TypeScript + Vite
- React Router v7、Tailwind CSS v4、Radix UI（shadcn/ui 风格组件库）
- framer-motion / GSAP 动效、recharts / ECharts 图表、sonner 通知、react-hook-form + zod
- AI 能力：平台运行时插件 `@official-plugins/ai-text-generate`
- 数据持久化：`@lark-apaas/client-toolkit-lite` 提供的 scopedStorage（键前缀 `atomstudio_`，按用户 ID 逻辑隔离）

## 本地运行

> **注意**：本工程为托管平台工程，依赖平台私有包（`@lark-apaas/*`）与平台运行时 AI 插件（`@official-plugins/ai-text-generate`）。这些包不在公共 npm registry，**脱离托管平台直接 `npm install` / `npm run dev` 无法完整运行**。完整体验请使用上方「在线体验」链接；本仓库源码用于代码审阅与在托管平台内二次开发。

如在具备平台私有源的环境中：

```bash
npm install        # 安装依赖（package-lock.json 未随仓库提交，可重新生成）
npm run dev        # 本地开发
npm run typecheck  # 类型检查
npm run build      # 生产构建（构建脚本依赖 bash）
```

## 目录结构

```
├─ index.html                  # HTML 入口
├─ shared/
│  ├─ capabilities/            # 5 个智能体的 AI 能力配置（系统提示词等）
│  └─ static/
├─ public/                     # favicon、图标
├─ scripts/                    # 开发 / 构建 / git hooks 脚本
└─ src/
   ├─ index.tsx / app.tsx      # 应用入口与路由
   ├─ pages/                   # 落地页、登录注册、仪表盘、模板库、工作台、404
   ├─ components/              # Layout / Header / Footer / AgentAvatar
   │  └─ ui/                   # 55 个基础 UI 组件
   ├─ lib/                     # 类型、智能体定义、存储、加密、鉴权、业务 hooks
   ├─ data/                    # 模板与灵感数据
   └─ hooks/
```

## 数据持久化说明

- 账户域：注册信息（密码 SHA-256 哈希）、登录会话
- 项目域：项目元数据
- 项目内域：完整对话记录、任务清单状态、每次生成的代码版本快照
- 工作台刷新后自动恢复项目、对话、预览代码与滚动位置
- 边界：基于浏览器本地存储，**换设备 / 换浏览器 / 清除站点数据后不互通**

## 局限与后续规划

- 单机本地存储，无云端同步；生成产物为单文件前端应用，不含真实后端
- 未实现 Race Mode（多模型赛马）、可视化点选编辑（Select to Chat）、App World 社区
- P0：后端账号体系 + 云同步、生成结果自动校验修复回路
- P1：Race Mode、点选编辑、图形化分支树
- P2：多文件工程产出与 GitHub 双向同步、作品广场

更详细的实现思路与取舍见仓库内《AtomStudio 说明文档.md》。

---

*本项目为全栈工程师岗位笔试 Demo，仅供个人作答与代码审阅使用。*
