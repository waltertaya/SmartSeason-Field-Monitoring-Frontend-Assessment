import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path
      ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-emerald-300">
          <span className="text-xl">🌱</span>
          SmartSeason
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <Link to="/dashboard" className={`rounded-lg px-3 py-1.5 text-sm transition ${isActive('/dashboard')}`}>
            Dashboard
          </Link>
          <Link to="/fields" className={`rounded-lg px-3 py-1.5 text-sm transition ${isActive('/fields')}`}>
            Fields
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-100">{user?.username}</p>
            <p className="text-xs capitalize text-slate-400">{user?.role === 'admin' ? 'Admin' : 'Field Agent'}</p>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${user?.role === 'admin' ? 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/40' : 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'}`}>
            {user?.role === 'admin' ? 'Admin' : 'Agent'}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-sm text-rose-300 transition-colors hover:border-rose-400 hover:bg-rose-500/15 hover:text-rose-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
