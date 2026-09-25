# AtomStudio 原子工作室 - 需求拆解文档

## 产品概述

- **产品类型**: 多智能体 AI 应用生成平台（Atoms Demo）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 有快速应用开发需求的创作者、开发者、产品经理、创业者
- **核心价值**: 通过自然语言对话驱动多智能体团队协作，在数分钟内将想法变成可运行的网页应用
- **界面语言**: 中文（zh-CN）
- **主题偏好**: 深色科技风（用户明确要求深色背景 + 紫蓝渐变高亮 + 柔和发光）
- **导航模式**: 路径导航（多页面系统，含落地页、仪表盘、工作台、模板库等）
- **导航布局**: Topbar（落地页、模板库）+ 工作台专用三栏布局（非 Sidebar 导航）

---

## 页面结构总览

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 落地页（首页） | `LandingPage.tsx` | `/` | 一级 | 导航 / 直接访问 |
| 注册/登录页 | `AuthPage.tsx` | `/auth` | 二级 | 落地页 → 点击"登录/注册" |
| 项目仪表盘 | `DashboardPage.tsx` | `/dashboard` | 一级 | 导航 / 登录后跳转 |
| 核心工作台 | `WorkspacePage.tsx` | `/workspace/:projectId` | 二级 | 仪表盘 → 点击项目卡片 |
| 模板库 | `TemplatesPage.tsx` | `/templates` | 一级 | 导航 |

---

## 插件规划

| 插件实例名称 | 基于官方插件 | 业务用途 | 输出模式 | 所属页面 |
|------------|-----------|---------|---------|---------|
| 需求分析智能体 | `ai-text-generate` | 产品经理 Emma 接收用户需求，产出结构化需求要点与功能清单 | stream | 工作台 |
| 架构设计智能体 | `ai-text-generate` | 架构师 Bob 基于需求，输出页面结构设计与任务拆分 | stream | 工作台 |
| 代码生成智能体 | `ai-text-generate` | 工程师 Alex 基于任务拆分，生成完整单文件 HTML 应用代码 | stream | 工作台 |
| 团队领队智能体 | `ai-text-generate` | 团队领队 Mike 进行需求概述与交付总结 | stream | 工作台 |
| 数据分析智能体 | `ai-text-generate` | 数据分析师 David 对数据类应用提供数据结构与指标建议（可选） | stream | 工作台 |

> **协作流水线**: 用户发送消息后，按顺序触发 Mike(接单概述) → Emma(需求分析) → Bob(架构设计) → Alex(代码生成) → Mike(总结交付)，David 根据需求类型可选参与。

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 用户账户与登录会话 | local-persist | localStorage 键前缀 `__atomstudio_user_`，密码用 SHA-256 哈希存储，会话 token 存 `__atomstudio_session` | 无 |
| 项目元数据 | local-persist | localStorage 键 `__atomstudio_projects_{userId}`，按用户隔离 | 新用户空状态引导 |
| 对话记录 | local-persist | localStorage 键 `__atomstudio_messages_{projectId}`，按项目存储 | 初始欢迎消息（Mike 开场白） |
| 任务清单 | local-persist | localStorage 键 `__atomstudio_tasks_{projectId}` | 初始空数组 |
| 代码版本历史 | local-persist | localStorage 键 `__atomstudio_versions_{projectId}`，每个版本含代码快照 | 初始空数组 |
| 多智能体 AI 生成 | real-plugin | capabilityClient 调用 5 个 ai-text-generate 实例，按流水线顺序流式输出 | 失败提示 + 一键重试；规划阶段失败自动跳过直接进入代码生成 |
| 代码复制 | import-export | `navigator.clipboard.writeText` | 无 |
| 代码下载导出 | import-export | `Blob` + `URL.createObjectURL` + `a.click` 下载为 .html | 无 |
| 模板库预置数据 | demo-mock | `src/data/templates.ts` 中定义 8 个模板卡片 | 本身就是 mock |
| 快捷灵感 chips | demo-mock | `src/data/inspirations.ts` 中定义 6 个快捷提示词 | 本身就是 mock |

> **插件铁律**: 多智能体 AI 生成功能 MUST 走 real-plugin，严禁用 mock 代码冒充 AI 生成结果。

---

## 智能体角色定义（系统提示词基线）

| 智能体 | 角色 | 主题色 | 职责 | 输出格式要求 |
|-------|------|--------|------|-------------|
| **Mike** | 团队领队 | 暖橙色 | 接单概述需求、协调流程、总结交付成果 | 简短要点式总结，3-5 条 |
| **Emma** | 产品经理 | 粉紫色 | 拆解需求为功能列表、用户流程 | 结构化要点：核心功能 + 用户流程 + 设计要点 |
| **Bob** | 架构师 | 蓝白色 | 设计页面结构、技术方案、拆分任务 | 页面结构 + 任务清单（每项含负责人） |
| **Alex** | 工程师 | 蓝色 | 编写完整单文件 HTML 应用代码 | **只输出纯 HTML 代码**，无 markdown 包裹，内联 CSS/JS，不依赖外部 CDN |
| **David** | 数据分析师 | 绿色 | 数据类应用的数据结构与指标建议（可选） | 数据模型 + 核心指标定义 |

**代码生成硬性约束**（写入 Alex 的系统提示词）：
- 输出完整、自包含的单个 HTML 文件
- 内联 CSS/JS，原生实现，不依赖任何外部 CDN 或网络资源
- 应用自身如需保存数据，使用 localStorage
- 应用必须真正可交互，UI 现代美观、响应式
- 输出只包含 HTML 代码本身，不要带 ```html 代码块标记和解释文字
- 平台侧需兼容并自动剥离响应中可能出现的 markdown 代码包裹
