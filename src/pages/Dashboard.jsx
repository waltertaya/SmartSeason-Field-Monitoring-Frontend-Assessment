import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/fields'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { StatusBadge, StageBadge } from '../components/StatusBadge'

function StatCard({ label, value, color = 'green' }) {
  const colors = {
    green: { top: 'text-emerald-300', dot: 'bg-emerald-400', ring: 'ring-emerald-500/30' },
    red: { top: 'text-rose-300', dot: 'bg-rose-400', ring: 'ring-rose-500/30' },
    blue: { top: 'text-sky-300', dot: 'bg-sky-400', ring: 'ring-sky-500/30' },
    gray: { top: 'text-slate-200', dot: 'bg-slate-400', ring: 'ring-slate-700' },
  }
  const c = colors[color] || colors.gray
  return (
    <div className={`rounded-2xl bg-slate-900/90 p-5 shadow-sm ring-1 ${c.ring}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden="true" />
      </div>
      <p className={`mt-2 text-3xl font-bold ${c.top}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-slate-900/90 p-6 shadow-sm ring-1 ring-slate-800">
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome back, {user?.first_name || user?.username}
          </h1>
          <p className="mt-1 text-slate-300">
            {user?.role === 'admin'
              ? 'Overview of all fields across all agents'
              : 'Overview of your assigned fields'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/40">
              {user?.role === 'admin' ? 'Admin view' : 'Agent view'}
            </span>
            <span className="text-xs text-slate-400">
              Updated as new field activity is logged
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Total Fields" value={stats.total_fields} color="blue" />
              <StatCard label="Active" value={stats.status_breakdown?.active ?? 0} color="green" />
              <StatCard label="At Risk" value={stats.status_breakdown?.at_risk ?? 0} color="red" />
              <StatCard label="Completed" value={stats.status_breakdown?.completed ?? 0} color="gray" />
            </div>

            {/* Stage Breakdown */}
            <div className="rounded-2xl bg-slate-900/90 p-6 shadow-sm ring-1 ring-slate-800">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Fields by Stage</h2>
                  <p className="mt-0.5 text-sm text-slate-400">Progress snapshot across the season</p>
                </div>
                <Link to="/fields" className="text-sm font-medium text-emerald-300 hover:text-emerald-200">
                  View fields →
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.entries(stats.stage_breakdown || {}).map(([stage, count]) => (
                  <div key={stage} className="rounded-xl bg-slate-900 p-4 ring-1 ring-inset ring-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <StageBadge stage={stage} />
                      <span className="text-xs text-slate-400">Fields</span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-100">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Updates (admin only) */}
            {user?.role === 'admin' && stats.recent_updates?.length > 0 && (
              <div className="rounded-2xl bg-slate-900/90 p-6 shadow-sm ring-1 ring-slate-800">
                <h2 className="text-lg font-semibold text-slate-100">Recent Updates</h2>
                <p className="mt-0.5 text-sm text-slate-400">Latest activity across all agents</p>
                <div className="mt-4 space-y-3">
                  {stats.recent_updates.map((update) => (
                    <div key={update.id} className="flex items-start gap-3 rounded-xl bg-slate-900 p-4 ring-1 ring-inset ring-slate-700">
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/fields/${update.field?.id || update.field}`}
                            className="text-sm font-semibold text-slate-100 hover:text-emerald-300"
                          >
                            Field #{update.field?.id || update.field}
                          </Link>
                          <StageBadge stage={update.stage} />
                          <span className="text-xs text-slate-400">
                            by {update.agent?.username || `Agent #${update.agent}`}
                          </span>
                        </div>
                        {update.notes && (
                          <p className="mt-1 text-sm text-slate-300 line-clamp-2">{update.notes}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(update.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.total_fields === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/90 py-16 text-center">
                <p className="mb-3 text-4xl">🌾</p>
                <p className="font-medium text-slate-200">No fields yet</p>
                <p className="mt-1 text-sm text-slate-400">Once fields are created, activity will appear here.</p>
                {user?.role === 'admin' && (
                  <Link
                    to="/fields"
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Create your first field
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
