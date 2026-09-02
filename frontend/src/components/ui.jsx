import React, { useEffect, useRef, useState } from 'react';

export function AnimatedNumber({ value, suffix = '', decimals = 0, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      setDisplayValue(value);
      previous.current = value;
      return undefined;
    }

    const start = typeof previous.current === 'number' ? previous.current : 0;
    const end = value;
    const startTime = performance.now();
    const duration = 420;
    let frame;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + (end - start) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previous.current = end;
        setDisplayValue(end);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  if (typeof displayValue !== 'number' || Number.isNaN(displayValue)) {
    return <span className={className}>{value}{suffix}</span>;
  }

  return <span className={className}>{displayValue.toFixed(decimals)}{suffix}</span>;
}

export function StatusBadge({ value }) {
  const normalized = String(value || '').toUpperCase();
  const tone = normalized.includes('ATTACK') || normalized.includes('REJECT') || normalized.includes('CRITICAL') || normalized.includes('SPOOF') || normalized.includes('REVOKED')
    ? 'status-danger'
    : normalized.includes('SUSPICIOUS') || normalized.includes('FLAG') || normalized.includes('FALLBACK') || normalized.includes('DEGRADED')
      ? 'status-warn'
      : 'status-safe';

  return (
    <span className={`pill ${tone}`}>
      <span className="status-dot bg-current" />
      {value || 'UNKNOWN'}
    </span>
  );
}

export function SectionHeader({ kicker, title, children }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {kicker && <div className="section-kicker mb-2">{kicker}</div>}
        <h2 className="text-xl font-semibold tracking-normal text-zinc-50 md:text-2xl">{title}</h2>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
