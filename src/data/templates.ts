// EXPORTS: ITemplate, MOCK_TEMPLATES
export interface ITemplate {
  id: string
  name: string
  description: string
  category: 'website' | 'tool' | 'game'
  prompt: string
  icon: string
  color: string
  tags: string[]
}

export const MOCK_TEMPLATES: ITemplate[] = [
  {
    id: '1',
    name: '个人博客',
    description: '简洁优雅的个人博客网站',
    category: 'website',
    prompt: '创建一个简洁优雅的个人博客网站，包含文章列表、文章详情页、分类标签、搜索功能和关于页面。使用深色主题，现代排版，支持 Markdown 渲染。',
    icon: '📝',
    color: '#8b5cf6',
    tags: ['博客', 'Markdown', '深色主题'],
  },
  {
    id: '2',
    name: '作品集',
    description: '展示个人作品的创意作品集',
    category: 'website',
    prompt: '创建一个现代化的个人作品集网站，包含英雄区、作品展示网格、技能介绍、联系表单。设计要有创意，带平滑动画和过渡效果。',
    icon: '🎨',
    color: '#ec4899',
    tags: ['作品集', '动画', '创意'],
  },
  {
    id: '3',
    name: '电商落地页',
    description: '高转化率的产品营销落地页',
    category: 'website',
    prompt: '创建一个高转化率的电商产品落地页，包含产品展示、特性介绍、用户评价、定价方案、FAQ和CTA按钮。视觉要有冲击力。',
    icon: '🛒',
    color: '#f97316',
    tags: ['落地页', '电商', '营销'],
  },
  {
    id: '4',
    name: '待办清单',
    description: '高效的任务管理工具',
    category: 'tool',
    prompt: '创建一个功能完善的待办清单应用，支持添加/删除/编辑任务、任务分类、优先级标记、完成状态切换、数据本地存储。界面简洁高效。',
    icon: '✅',
    color: '#10b981',
    tags: ['任务管理', '效率', '本地存储'],
  },
  {
    id: '5',
    name: '记账本',
    description: '个人财务记录与统计',
    category: 'tool',
    prompt: '创建一个个人记账本应用，支持记录收入支出、分类管理、月度统计报表、预算设置。使用图表展示数据趋势，数据本地持久化。',
    icon: '💰',
    color: '#f59e0b',
    tags: ['财务', '图表', '统计'],
  },
  {
    id: '6',
    name: '贪吃蛇小游戏',
    description: '经典休闲贪吃蛇游戏',
    category: 'game',
    prompt: '创建一个经典贪吃蛇小游戏，支持键盘方向键控制、分数统计、难度递增、游戏结束重新开始。画面风格现代，有动画效果。',
    icon: '🐍',
    color: '#22c55e',
    tags: ['游戏', '休闲', '经典'],
  },
  {
    id: '7',
    name: '预约表单',
    description: '服务预约与日程管理',
    category: 'tool',
    prompt: '创建一个服务预约表单应用，包含日期选择、时间段选择、服务类型选择、用户信息填写、预约确认。支持查看已预约列表。',
    icon: '📅',
    color: '#3b82f6',
    tags: ['预约', '表单', '日程'],
  },
  {
    id: '8',
    name: '数据看板',
    description: '可视化数据仪表盘',
    category: 'tool',
    prompt: '创建一个数据可视化看板应用，包含多种图表类型（折线图、柱状图、饼图）、关键指标卡片、数据筛选功能。设计专业美观。',
    icon: '📊',
    color: '#06b6d4',
    tags: ['数据可视化', '图表', '仪表盘'],
  },
]
