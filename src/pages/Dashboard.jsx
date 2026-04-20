import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/fields'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { StatusBadge, StageBadge } from '../components/StatusBadge'

function StatCard({ label, value, color = 'green' }) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }
  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
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
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name || user?.username} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.role === 'admin'
              ? 'Overview of all fields across all agents'
              : 'Overview of your assigned fields'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Fields" value={stats.total_fields} color="blue" />
              <StatCard label="Active" value={stats.status_breakdown?.active ?? 0} color="green" />
              <StatCard label="At Risk" value={stats.status_breakdown?.at_risk ?? 0} color="red" />
              <StatCard label="Completed" value={stats.status_breakdown?.completed ?? 0} color="gray" />
            </div>

            {/* Stage Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Fields by Stage</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.stage_breakdown || {}).map(([stage, count]) => (
                  <div key={stage} className="text-center p-4 bg-gray-50 rounded-lg">
                    <StageBadge stage={stage} />
                    <p className="text-2xl font-bold text-gray-800 mt-2">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Updates (admin only) */}
            {user?.role === 'admin' && stats.recent_updates?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Updates</h2>
                <div className="space-y-3">
                  {stats.recent_updates.map((update) => (
                    <div key={update.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/fields/${update.field?.id || update.field}`}
                            className="font-medium text-gray-800 hover:text-green-600 text-sm"
                          >
                            Field #{update.field?.id || update.field}
                          </Link>
                          <StageBadge stage={update.stage} />
                          <span className="text-xs text-gray-400">
                            by {update.agent?.username || `Agent #${update.agent}`}
                          </span>
                        </div>
                        {update.notes && (
                          <p className="text-sm text-gray-500 mt-0.5 truncate">{update.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(update.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.total_fields === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-4xl mb-3">🌾</p>
                <p className="text-gray-500 font-medium">No fields yet</p>
                {user?.role === 'admin' && (
                  <Link
                    to="/fields"
                    className="mt-3 inline-block text-green-600 hover:underline text-sm"
                  >
                    Create your first field →
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
