import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const handleLogout = () => { logout(); navigate('/login') }
  const isActive = (path) =>
    location.pathname === path
      ? 'text-green-600 font-semibold border-b-2 border-green-600'
      : 'text-gray-600 hover:text-gray-900'
  // …JSX: brand link, Dashboard + Fields nav, role badge, logout button
}
