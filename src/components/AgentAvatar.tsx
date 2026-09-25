// EXPORTS: AgentAvatar
import { motion } from 'framer-motion';
import { getAgent, type AgentName } from '@/lib/agents';

interface AgentAvatarProps {
  name: AgentName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isActive?: boolean;
  isThinking?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
};

export default function AgentAvatar({ name, size = 'md', isActive = false, isThinking = false }: AgentAvatarProps) {
  const agent = getAgent(name);
  const sizeClass = sizeMap[size];

  return (
    <motion.div
      className={`relative ${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-lg`}
      style={{
        backgroundColor: agent.themeColor,
        boxShadow: isActive ? `0 0 20px ${agent.glowColor}` : undefined,
      }}
      animate={
        isActive || isThinking
          ? {
              y: [0, -6, 0],
              scale: [1, 1.05, 1],
            }
          : {}
      }
      transition={
        isActive || isThinking
          ? {
              y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            }
          : {}
      }
    >
      <span>{agent.emoji}</span>
      {isThinking && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${agent.themeColor}`,
          }}
          animate={{
            scale: [1, 1.6],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.div>
  );
}
