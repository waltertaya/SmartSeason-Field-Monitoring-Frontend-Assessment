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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {field ? 'Edit Field' : 'Create New Field'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. North Field A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <input
              name="crop_type"
              value={form.crop_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Maize, Wheat, Tomato"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
            <input
              type="date"
              name="planting_date"
              value={form.planting_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {STAGES.map((s) => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Agent</label>
            <select
              name="assigned_agent_id"
              value={form.assigned_agent_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fields</h1>
            <p className="text-gray-500 text-sm mt-0.5">{fields.length} total fields</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setModal('create')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span className="text-lg leading-none">+</span> New Field
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by name or crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-4xl mb-3">🌾</p>
            <p className="text-gray-500">No fields found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Field</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Crop</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Planted</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Stage</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Agent</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/fields/${field.id}`}
                        className="font-medium text-gray-800 hover:text-green-600"
                      >
                        {field.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{field.crop_type}</td>
                    <td className="px-4 py-3 text-gray-500">{field.planting_date}</td>
                    <td className="px-4 py-3"><StageBadge stage={field.stage} /></td>
                    <td className="px-4 py-3"><StatusBadge status={field.computed_status} /></td>
                    <td className="px-4 py-3 text-gray-500">
                      {field.assigned_agent?.username || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          to={`/fields/${field.id}`}
                          className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                        >
                          View
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setModal(field)}
                              className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(field)}
                              className="text-red-400 hover:text-red-600 text-xs font-medium"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Field</h3>
            <p className="text-gray-500 text-sm mb-5">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
