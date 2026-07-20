'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  icon?: React.ReactNode;
  delay?: number;
}

export function ScoreBar({ label, value, max = 100, color = '#0ea5e9', icon, delay = 0 }: ScoreBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {icon}
          {label}
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.4 }}
          className="text-sm font-bold text-slate-900 dark:text-white"
        >
          {value}
        </motion.span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full')}
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
}
