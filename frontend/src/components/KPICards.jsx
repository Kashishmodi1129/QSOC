import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Target, ShieldCheck, Percent, TrendingUp } from 'lucide-react';

// Smooth number transition helper
function AnimatedValue({ value, suffix = '', decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (typeof value !== 'number' || isNaN(value)) {
      setDisplayValue(value);
      return;
    }

    const start = typeof displayValue === 'number' ? displayValue : 0;
    const end = value;
    const duration = 300;
    const startTime = performance.now();

    const updateNumber = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value]);

  if (typeof displayValue !== 'number' || isNaN(displayValue)) {
    return <span>{value}{suffix}</span>;
  }

  return <span>{displayValue.toFixed(decimals)}{suffix}</span>;
}

export default function KPICards({ analyticsData }) {
  if (!analyticsData) return null;

  const cm = analyticsData.classification_metrics || {};

  const cards = [
    {
      id: 'total_attempts',
      title: 'TOTAL ATTEMPTS',
      value: analyticsData.total_attempts,
      decimals: 0,
      suffix: '',
      valColor: 'text-slate-100',
      subtext: `SAFE: ${analyticsData.safe_count} | SUSP: ${analyticsData.suspicious_count}`,
      icon: Activity,
    },
    {
      id: 'attacks_detected',
      title: 'ATTACKS BLOCKED',
      value: analyticsData.attack_detected_count,
      decimals: 0,
      suffix: '',
      valColor: 'text-rose-400',
      subtext: `Detection Rate: ${(analyticsData.detection_rate * 100).toFixed(1)}%`,
      icon: ShieldAlert,
    },
    {
      id: 'precision',
      title: 'PRECISION',
      value: (cm.precision || 0) * 100,
      decimals: 1,
      suffix: '%',
      valColor: 'text-emerald-400',
      subtext: `TP: ${cm.true_positives || 0} / FP: ${cm.false_positives || 0}`,
      icon: Target,
    },
    {
      id: 'recall',
      title: 'RECALL',
      value: (cm.recall || 0) * 100,
      decimals: 1,
      suffix: '%',
      valColor: 'text-sky-400',
      subtext: `FN: ${cm.false_negatives || 0} / TN: ${cm.true_negatives || 0}`,
      icon: ShieldCheck,
    },
    {
      id: 'fpr',
      title: 'FALSE POSITIVE RATE',
      value: (cm.false_positive_rate || 0) * 100,
      decimals: 2,
      suffix: '%',
      valColor: 'text-slate-300',
      subtext: `FNR: ${((cm.false_negative_rate || 0) * 100).toFixed(2)}%`,
      icon: Percent,
    },
    {
      id: 'avg_qber',
      title: 'AVERAGE QBER',
      value: (analyticsData.average_qber || 0) * 100,
      decimals: 2,
      suffix: '%',
      valColor: 'text-slate-300',
      subtext: `Min: ${((analyticsData.min_qber || 0) * 100).toFixed(1)}% | Max: ${((analyticsData.max_qber || 0) * 100).toFixed(1)}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="p-3 rounded-lg bg-[#0E1219] border border-[#19202C] hover:border-[#222C3D] flex flex-col justify-between transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono tracking-wider font-semibold text-slate-500">
                {c.title}
              </span>
              <Icon className="w-3 h-3 text-slate-600" />
            </div>

            <div className="my-1">
              <div className={`text-xl font-mono font-bold tracking-tight ${c.valColor}`}>
                <AnimatedValue value={c.value} suffix={c.suffix} decimals={c.decimals} />
              </div>
            </div>

            <div className="text-[9px] font-mono text-slate-500 truncate pt-1 border-t border-[#141A24]">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
