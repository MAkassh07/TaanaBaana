'use client';

import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  min?: number;
  max?: number;
  size?: number;
  label?: string;
}

const tierColors: Record<string, { stroke: string; text: string; bg: string }> = {
  Excellent: { stroke: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  Good: { stroke: '#0ea5e9', text: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10' },
  Average: { stroke: '#f59e0b', text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  Risky: { stroke: '#ef4444', text: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
};

function getTier(score: number): string {
  if (score > 800) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 600) return 'Average';
  return 'Risky';
}

export function ScoreGauge({ score, min = 300, max = 900, size = 220, label }: ScoreGaugeProps) {
  const tier = getTier(score);
  const colors = tierColors[tier];
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-slate-100 dark:text-slate-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-5xl font-bold"
          style={{ color: colors.stroke }}
        >
          <AnimatedNumber value={score} />
        </motion.div>
        <div className={`mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
          {label || tier}
        </div>
      </div>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <CountUp end={value} />
    </motion.span>
  );
}

function CountUp({ end }: { end: number }) {
  // simple count-up using framer-motion
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <CountUpInner end={end} />
    </motion.span>
  );
}

function CountUpInner({ end }: { end: number }) {
  return (
    <motion.span
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      {end}
    </motion.span>
  );
}
