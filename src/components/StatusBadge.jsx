const STATUS_STYLES = {
  active:    'bg-green-100 text-green-700',
  at_risk:   'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
}

const STAGE_STYLES = {
  planted:   'bg-yellow-100 text-yellow-700',
  growing:   'bg-blue-100 text-blue-700',
  ready:     'bg-green-100 text-green-700',
  harvested: 'bg-gray-100 text-gray-600',
}

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'
  const label = status?.replace('_', ' ') || 'unknown'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  )
}

export function StageBadge({ stage }) {
  const style = STAGE_STYLES[stage] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {stage || 'unknown'}
    </span>
  )
}
