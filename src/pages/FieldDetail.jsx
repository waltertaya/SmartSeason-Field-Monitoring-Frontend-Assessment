import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getField, getFieldUpdates, createFieldUpdate } from '../api/fields'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { StatusBadge, StageBadge } from '../components/StatusBadge'

const STAGES = ['planted', 'growing', 'ready', 'harvested']

function UpdateForm({ fieldId, onSaved }) {
  const [form, setForm] = useState({ stage: 'growing', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createFieldUpdate(fieldId, form)
      setForm({ stage: 'growing', notes: '' })
      onSaved()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to submit update.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Log Field Update</h3>
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Stage</label>
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Observations</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Add any notes or observations..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : 'Submit Update'}
        </button>
      </form>
    </div>
  )
}

export default function FieldDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [field, setField] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'admin'
  const isAssignedAgent = field?.assigned_agent?.id === user?.id

  const fetchData = async () => {
    try {
      const [fieldRes, updatesRes] = await Promise.all([
        getField(id),
        getFieldUpdates(id),
      ])
      setField(fieldRes.data)
      setUpdates(updatesRes.data)
    } catch {
      setError('Failed to load field details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (error || !field) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-red-500">{error || 'Field not found.'}</p>
          <button onClick={() => navigate('/fields')} className="mt-4 text-green-600 hover:underline text-sm">
            ← Back to Fields
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back */}
        <Link to="/fields" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          ← Back to Fields
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{field.name}</h1>
              <p className="text-gray-500 mt-1">{field.crop_type}</p>
            </div>
            <div className="flex items-center gap-2">
              <StageBadge stage={field.stage} />
              <StatusBadge status={field.computed_status} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Planting Date</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{field.planting_date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Assigned Agent</p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {field.assigned_agent ? field.assigned_agent.username : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Created By</p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {field.created_by?.username || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Last Updated</p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {field.updated_at ? new Date(field.updated_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {/* Stage Progress */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Stage Progress</p>
            <div className="flex items-center gap-1">
              {STAGES.map((s, i) => {
                const currentIdx = STAGES.indexOf(field.stage)
                const isPast = i < currentIdx
                const isCurrent = i === currentIdx
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`flex-1 flex flex-col items-center gap-1`}>
                      <div className={`w-full h-2 rounded-full ${isPast || isCurrent ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <span className={`text-xs capitalize ${isCurrent ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                        {s}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Updates timeline */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Update History</h2>
            {updates.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">No updates yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {updates.map((u) => (
                  <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StageBadge stage={u.stage} />
                        <span className="text-xs text-gray-400">
                          by {u.agent?.username || `Agent #${u.agent}`}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(u.created_at).toLocaleString()}
                        </span>
                      </div>
                      {u.notes && (
                        <p className="text-sm text-gray-600 mt-1.5">{u.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Update form (agent or admin) */}
          {(isAdmin || isAssignedAgent) && (
            <div>
              <UpdateForm fieldId={id} onSaved={fetchData} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
