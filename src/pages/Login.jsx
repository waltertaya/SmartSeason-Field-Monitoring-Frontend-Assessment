import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { login as loginApi, getMe } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data: tokens } = await loginApi(form)
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      const { data: me } = await getMe()
      login(tokens, me)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 py-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <p className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
            SmartSeason Platform
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight">
            Field intelligence for modern farm operations.
          </h1>
          <p className="mt-5 max-w-lg text-slate-300">
            Centralize crop monitoring, field updates, and team coordination in one reliable workflow.
          </p>
        </div>

        <div className="w-full max-w-md justify-self-center rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="mb-7 text-center">
            <div className="mb-3 text-4xl">🌱</div>
            <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="mt-1 text-sm text-slate-400">Sign in to your SmartSeason account</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-300/40 bg-rose-400/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 pr-16 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto h-9 rounded-md px-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700/60 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-slate-900 transition-colors hover:bg-emerald-400 disabled:bg-emerald-500/60 disabled:text-slate-800"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
