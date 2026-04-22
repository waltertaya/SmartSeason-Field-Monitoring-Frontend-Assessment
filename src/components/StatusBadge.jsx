const STATUS_STYLES = {
  active: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/40',
  at_risk: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/40',
  completed: 'bg-slate-700/40 text-slate-300 ring-1 ring-inset ring-slate-600',
}

const STAGE_STYLES = {
  planted: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/40',
  growing: 'bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/40',
  ready: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/40',
  harvested: 'bg-slate-700/40 text-slate-300 ring-1 ring-inset ring-slate-600',
}

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-700/40 text-slate-300 ring-1 ring-inset ring-slate-600'
  const label = status?.replace('_', ' ') || 'unknown'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  )
}

export function StageBadge({ stage }) {
  const style = STAGE_STYLES[stage] || 'bg-slate-700/40 text-slate-300 ring-1 ring-inset ring-slate-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {stage || 'unknown'}
    </span>
  )
}
