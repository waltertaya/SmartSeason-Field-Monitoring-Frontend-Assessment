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
      ? 'text-green-600 font-semibold border-b-2 border-green-600'
      : 'text-gray-600 hover:text-gray-900'

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-green-700 text-lg">
          <span className="text-2xl">🌱</span>
          SmartSeason
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className={`text-sm pb-1 ${isActive('/dashboard')}`}>
            Dashboard
          </Link>
          <Link to="/fields" className={`text-sm pb-1 ${isActive('/fields')}`}>
            Fields
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role === 'admin' ? 'Admin' : 'Field Agent'}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {user?.role === 'admin' ? 'Admin' : 'Agent'}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
