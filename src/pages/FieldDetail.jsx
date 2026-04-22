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
    <div className="rounded-2xl bg-slate-900/90 p-6 shadow-sm ring-1 ring-slate-800">
      <h3 className="text-base font-semibold text-slate-100">Log Field Update</h3>
      <p className="mt-0.5 text-sm text-slate-400">Capture what changed and what you observed.</p>
      {error && (
        <div className="mb-3 mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">New Stage</label>
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Notes / Observations</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Add any notes or observations..."
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:bg-emerald-500/60"
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
          <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (error || !field) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-rose-300">{error || 'Field not found.'}</p>
          <button onClick={() => navigate('/fields')} className="mt-4 text-emerald-300 hover:underline text-sm">
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
        <Link to="/fields" className="inline-flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-slate-100">
          ← Back to Fields
        </Link>

        {/* Header */}
        <div className="rounded-2xl bg-slate-900/90 p-6 shadow-sm ring-1 ring-slate-800">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{field.name}</h1>
              <p className="mt-1 text-slate-300">{field.crop_type}</p>
            </div>
            <div className="flex items-center gap-2">
              <StageBadge stage={field.stage} />
              <StatusBadge status={field.computed_status} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Planting Date</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{field.planting_date}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Assigned Agent</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                {field.assigned_agent ? field.assigned_agent.username : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Created By</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                {field.created_by?.username || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Last Updated</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                {field.updated_at ? new Date(field.updated_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {/* Stage Progress */}
          <div className="mt-6 border-t border-slate-800 pt-6">
            <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Stage Progress</p>
            <div className="flex items-center gap-1">
              {STAGES.map((s, i) => {
                const currentIdx = STAGES.indexOf(field.stage)
                const isPast = i < currentIdx
                const isCurrent = i === currentIdx
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`flex-1 flex flex-col items-center gap-1`}>
                      <div className={`h-2 w-full rounded-full ${isPast || isCurrent ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className={`text-xs capitalize ${isCurrent ? 'text-emerald-300 font-semibold' : 'text-slate-500'}`}>
                        {s}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Updates timeline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Update History</h2>
                <p className="mt-0.5 text-sm text-slate-400">Chronological record of field activity</p>
              </div>
              <span className="text-sm text-slate-400">
                <span className="font-semibold text-slate-100">{updates.length}</span> updates
              </span>
            </div>
            {updates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/90 py-10 text-center">
                <p className="text-sm text-slate-400">No updates yet</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900/90 p-4 shadow-sm ring-1 ring-slate-800">
                <div className="space-y-3 border-l border-slate-700 pl-4">
                {updates.map((u) => (
                  <div key={u.id} className="relative rounded-xl bg-slate-900 p-4 ring-1 ring-inset ring-slate-700">
                    <div className="absolute -left-[21px] top-6 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StageBadge stage={u.stage} />
                        <span className="text-xs text-slate-400">
                          by {u.agent?.username || `Agent #${u.agent}`}
                        </span>
                        <span className="text-xs text-slate-600">·</span>
                        <span className="text-xs text-slate-400">
                          {new Date(u.created_at).toLocaleString()}
                        </span>
                      </div>
                      {u.notes && (
                        <p className="mt-2 text-sm text-slate-300">{u.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
                </div>
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
