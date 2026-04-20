import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface Props {
  endTimestamp: number;
  compact?: boolean;
}

function toMs(ts: number) {
  return ts < 1e12 ? ts * 1000 : ts;
}

function getTimeLeft(end: number) {
  const now = Date.now();
  const diff = toMs(end) - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export default function DiscountCountdown({ endTimestamp, compact = false }: Props) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endTimestamp));

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft(endTimestamp);
      setTimeLeft(t);
      if (!t) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTimestamp]);

  if (!timeLeft) return null;

  if (compact) {
    const parts: string[] = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}j`);
    parts.push(`${String(timeLeft.hours).padStart(2, '0')}h`);
    parts.push(`${String(timeLeft.minutes).padStart(2, '0')}m`);
    if (timeLeft.days === 0) parts.push(`${String(timeLeft.seconds).padStart(2, '0')}s`);

    return (
      <div className="flex items-center gap-1 text-[10px] font-semibold text-red-400">
        <Timer className="w-3 h-3" />
        <span>{parts.join(' ')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
      <Timer className="w-4 h-4 text-red-400 shrink-0" />
      <div className="flex items-center gap-1.5 text-sm font-medium text-red-400">
        <span className="text-red-300/80 text-xs">Offre expire dans</span>
        <div className="flex items-center gap-1">
          {timeLeft.days > 0 && (
            <Unit value={timeLeft.days} label="j" />
          )}
          <Unit value={timeLeft.hours} label="h" />
          <Unit value={timeLeft.minutes} label="m" />
          <Unit value={timeLeft.seconds} label="s" />
        </div>
      </div>
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline">
      <span className="tabular-nums font-bold text-red-400">{String(value).padStart(2, '0')}</span>
      <span className="text-red-400/60 text-xs">{label}</span>
    </span>
  );
}
