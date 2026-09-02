import React from 'react';
import { Activity, Percent, ShieldAlert, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { AnimatedNumber } from './ui.jsx';

export default function KPICards({ analyticsData }) {
  if (!analyticsData) return null;

  const cm = analyticsData.classification_metrics || {};
  const metrics = [
    {
      id: 'attempts',
      label: 'Total Attempts',
      value: analyticsData.total_attempts,
      decimals: 0,
      suffix: '',
      detail: `${analyticsData.safe_count} safe / ${analyticsData.suspicious_count} suspicious`,
      icon: Activity,
      tone: 'text-zinc-50',
    },
    {
      id: 'attacks',
      label: 'Attacks Detected',
      value: analyticsData.attack_detected_count,
      decimals: 0,
      suffix: '',
      detail: `${((analyticsData.detection_rate || 0) * 100).toFixed(1)}% detection rate`,
      icon: ShieldAlert,
      tone: 'text-rose-300',
    },
    {
      id: 'precision',
      label: 'Precision',
      value: (cm.precision || 0) * 100,
      decimals: 1,
      suffix: '%',
      detail: `${cm.true_positives || 0} TP / ${cm.false_positives || 0} FP`,
      icon: Target,
      tone: 'text-emerald-300',
    },
    {
      id: 'recall',
      label: 'Recall / Sensitivity',
      value: (cm.recall || 0) * 100,
      decimals: 1,
      suffix: '%',
      detail: `${cm.false_negatives || 0} FN / ${cm.true_negatives || 0} TN`,
      icon: ShieldCheck,
      tone: 'text-sky-200',
    },
    {
      id: 'fpr',
      label: 'False Positive Rate',
      value: (cm.false_positive_rate || 0) * 100,
      decimals: 2,
      suffix: '%',
      detail: `${((cm.false_negative_rate || 0) * 100).toFixed(2)}% FNR`,
      icon: Percent,
      tone: 'text-zinc-200',
    },
    {
      id: 'qber',
      label: 'Average QBER',
      value: (analyticsData.average_qber || 0) * 100,
      decimals: 2,
      suffix: '%',
      detail: `${((analyticsData.min_qber || 0) * 100).toFixed(1)} min / ${((analyticsData.max_qber || 0) * 100).toFixed(1)} max`,
      icon: TrendingUp,
      tone: 'text-zinc-200',
    },
  ];

  return (
    <section className="surface overflow-hidden rounded-3xl">
      <div className="grid grid-cols-1 divide-y divide-white/[0.06] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="min-h-[116px] p-4">
              <div className="mb-5 flex items-center justify-between">
                <div className="text-xs font-medium text-zinc-500">{metric.label}</div>
                <Icon className="h-3.5 w-3.5 text-zinc-600" />
              </div>
              <AnimatedNumber
                value={metric.value}
                decimals={metric.decimals}
                suffix={metric.suffix}
                className={`telemetry text-2xl font-semibold tracking-normal ${metric.tone}`}
              />
              <div className="mt-2 truncate text-xs text-zinc-600">{metric.detail}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
