// EXPORTS: IInspiration, MOCK_INSPIRATIONS
export interface IInspiration {
  id: string
  label: string
  prompt: string
  icon: string
}

export const MOCK_INSPIRATIONS: IInspiration[] = [
  {
    id: '1',
    label: '个人博客',
    prompt: '创建一个简洁优雅的个人博客网站，包含文章列表、文章详情页、关于我页面，支持深色模式切换，响应式设计。',
    icon: '📝',
  },
  {
    id: '2',
    label: '待办清单',
    prompt: '做一个功能完整的待办清单应用，支持添加、删除、标记完成、分类筛选、优先级设置，数据本地保存。',
    icon: '✅',
  },
  {
    id: '3',
    label: '贪吃蛇游戏',
    prompt: '开发一个经典贪吃蛇小游戏，支持键盘控制、分数统计、最高分记录、游戏暂停/继续、速度递增机制。',
    icon: '🐍',
  },
  {
    id: '4',
    label: '产品落地页',
    prompt: '设计一个现代化的 SaaS 产品落地页，包含 Hero 区、功能特性、定价方案、客户评价、FAQ、页脚导航。',
    icon: '🚀',
  },
  {
    id: '5',
    label: '记账应用',
    prompt: '做一个个人记账应用，支持收入/支出记录、分类管理、月度统计图表、数据导出，本地持久化存储。',
    icon: '💰',
  },
  {
    id: '6',
    label: '天气预报',
    prompt: '创建一个天气预报小工具，支持城市搜索、实时天气、未来7天预报、温度趋势图、天气图标展示。',
    icon: '🌤️',
  },
]
