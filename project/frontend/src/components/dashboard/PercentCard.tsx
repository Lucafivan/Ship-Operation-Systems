import React from 'react';

interface Props {
  title: string;
  value?: number;
  desc?: string;
  subtitle?: string;
  loading?: boolean;
}

const fmtPct = (v?: number) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '-');

export const PercentCard: React.FC<Props> = ({ title, value, desc, subtitle, loading }) => {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="bg-white rounded-lg shadow p-4" title={desc}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <span className="text-sm text-slate-400">{subtitle ?? ''}</span>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-semibold text-slate-800">{loading ? '...' : fmtPct(value ?? 0)}</div>
        {desc && <p className="mt-1 text-xs text-slate-500">{desc}</p>}
      </div>
      <div className="mt-3">
        <div className="h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

export default PercentCard;
