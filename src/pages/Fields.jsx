import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFields, createField, updateField, deleteField } from '../api/fields'
import { getAgents } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { StatusBadge, StageBadge } from '../components/StatusBadge'

const STAGES = ['planted', 'growing', 'ready', 'harvested']
const EMPTY_FORM = { name: '', crop_type: '', planting_date: '', stage: 'planted', assigned_agent_id: '' }

function FieldModal({ field, agents, onClose, onSaved }) {
  const [form, setForm] = useState(
    field
      ? {
          name: field.name,
          crop_type: field.crop_type,
          planting_date: field.planting_date,
          stage: field.stage,
          assigned_agent_id: field.assigned_agent?.id || '',
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = { ...form }
    if (!payload.assigned_agent_id) delete payload.assigned_agent_id
    try {
      if (field) {
        await updateField(field.id, payload)
      } else {
        await createField(payload)
      }
      onSaved()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to save field.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-slate-700">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-100">
            {field ? 'Edit Field' : 'Create New Field'}
          </h2>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-200" aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Field Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. North Field A"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Crop Type</label>
            <input
              name="crop_type"
              value={form.crop_type}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Maize, Wheat, Tomato"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Planting Date</label>
            <input
              type="date"
              name="planting_date"
              value={form.planting_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Stage</label>
            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {STAGES.map((s) => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Assign Agent</label>
            <select
              name="assigned_agent_id"
              value={form.assigned_agent_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Unassigned —</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.username} ({a.first_name} {a.last_name})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:bg-emerald-500/60"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : field ? 'Save Changes' : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Fields() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [fields, setFields] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | field object
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')

  const fetchFields = () =>
    getFields()
      .then(({ data }) => setFields(data))
      .finally(() => setLoading(false))

  useEffect(() => {
    fetchFields()
    if (isAdmin) getAgents().then(({ data }) => setAgents(data))
  }, [isAdmin])

  const handleDelete = async (id) => {
    await deleteField(id)
    setDeleteConfirm(null)
    fetchFields()
  }

  const filtered = fields.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.crop_type.toLowerCase().includes(search.toLowerCase())
    const matchStage = stageFilter ? f.stage === stageFilter : true
    return matchSearch && matchStage
  })

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Fields</h1>
            <p className="mt-0.5 text-sm text-slate-300">
              {isAdmin ? 'Manage fields across your team' : 'View your assigned fields'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setModal('create')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              <span className="text-lg leading-none">+</span> New Field
            </button>
          )}
        </div>

        <div className="rounded-2xl bg-slate-900/90 p-4 shadow-sm ring-1 ring-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search by name or crop…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-72"
            />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-56"
            >
              <option value="">All Stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <div className="ml-auto text-sm text-slate-400">
              <span className="font-medium text-slate-100">{filtered.length}</span> results
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/90 py-16 text-center">
            <p className="mb-3 text-4xl">🌾</p>
            <p className="text-slate-200">No fields found</p>
            <p className="mt-1 text-sm text-slate-400">Try clearing filters or adjusting your search.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-slate-900/90 shadow-sm ring-1 ring-slate-800">
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-sm">
                <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-300">Field</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-300">Crop</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-300">Planted</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-300">Stage</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-300">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-300">Agent</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((field) => (
                  <tr key={field.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/fields/${field.id}`}
                        className="font-semibold text-slate-100 hover:text-emerald-300"
                      >
                        {field.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{field.crop_type}</td>
                    <td className="px-4 py-3 text-slate-400">{field.planting_date}</td>
                    <td className="px-4 py-3"><StageBadge stage={field.stage} /></td>
                    <td className="px-4 py-3"><StatusBadge status={field.computed_status} /></td>
                    <td className="px-4 py-3 text-slate-400">
                      {field.assigned_agent?.username || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          to={`/fields/${field.id}`}
                          className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                        >
                          View
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setModal(field)}
                              className="text-xs font-semibold text-slate-300 hover:text-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(field)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <FieldModal
          field={modal === 'create' ? null : modal}
          agents={agents}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchFields() }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 shadow-2xl ring-1 ring-slate-700">
            <h3 className="mb-2 text-lg font-semibold text-slate-100">Delete Field</h3>
            <p className="mb-5 text-sm text-slate-300">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
