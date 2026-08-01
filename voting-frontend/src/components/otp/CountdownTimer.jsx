import { useEffect, useState } from 'react';
import { formatCountdown } from '../../utils/helpers';

export default function CountdownTimer({ initialSeconds = 300, onExpire }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) { onExpire?.(); return; }
    const id = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, onExpire]);

  const pct = (seconds / initialSeconds) * 100;
  const isLow = seconds <= 60;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke={isLow ? '#ef4444' : '#3b82f6'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-sm
          ${isLow ? 'text-red-400' : 'text-blue-400'}`}>
          {formatCountdown(seconds)}
        </span>
      </div>
      <p className={`text-xs font-mono ${isLow ? 'text-red-400' : 'text-slate-400'}`}>
        {seconds <= 0 ? 'OTP expired' : 'OTP expires in'}
      </p>
    </div>
  );
}
