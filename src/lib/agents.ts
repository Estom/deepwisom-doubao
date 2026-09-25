// EXPORTS: AGENTS, AgentName, AgentConfig, PLUGIN_IDS
import type { ReactNode } from 'react';

export type AgentName = 'Mike' | 'Emma' | 'Bob' | 'Alex' | 'David';

export interface AgentConfig {
  name: AgentName;
  role: string;
  themeColor: string;
  glowColor: string;
  bgColor: string;
  description: string;
  pluginId: string;
  emoji: string;
}

export const PLUGIN_IDS = {
  Mike: 'team_leader_mike_text_generate_1',
  Emma: 'pm_emm_product_requirement_generate_1',
  Bob: 'architect_bob_text_generate_1',
  Alex: 'alex_eng_html_code_generator_1',
  David: 'data_analyst_david_text_generate_1',
} as const;

export const AGENTS: Record<AgentName, AgentConfig> = {
  Mike: {
    name: 'Mike',
    role: '团队领队',
    themeColor: '#FF8A3D',
    glowColor: 'rgba(255, 138, 61, 0.5)',
    bgColor: 'bg-orange-500/20',
    description: '统筹全局、协调各智能体、总结交付',
    pluginId: PLUGIN_IDS.Mike,
    emoji: '🧡',
  },
  Emma: {
    name: 'Emma',
    role: '产品经理',
    themeColor: '#E879F9',
    glowColor: 'rgba(232, 121, 249, 0.5)',
    bgColor: 'bg-fuchsia-500/20',
    description: '拆解需求为功能列表与用户流程',
    pluginId: PLUGIN_IDS.Emma,
    emoji: '💜',
  },
  Bob: {
    name: 'Bob',
    role: '架构师',
    themeColor: '#60A5FA',
    glowColor: 'rgba(96, 165, 250, 0.5)',
    bgColor: 'bg-blue-400/20',
    description: '设计页面结构与技术方案、拆分任务',
    pluginId: PLUGIN_IDS.Bob,
    emoji: '💙',
  },
  Alex: {
    name: 'Alex',
    role: '工程师',
    themeColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    bgColor: 'bg-blue-500/20',
    description: '编写完整可运行的应用代码',
    pluginId: PLUGIN_IDS.Alex,
    emoji: '🔵',
  },
  David: {
    name: 'David',
    role: '数据分析师',
    themeColor: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.5)',
    bgColor: 'bg-emerald-400/20',
    description: '数据结构设计与指标建议',
    pluginId: PLUGIN_IDS.David,
    emoji: '💚',
  },
};

export const AGENT_LIST: AgentConfig[] = [
  AGENTS.Mike,
  AGENTS.Emma,
  AGENTS.Bob,
  AGENTS.Alex,
  AGENTS.David,
];

export function getAgent(name: AgentName): AgentConfig {
  return AGENTS[name];
}
