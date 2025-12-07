import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../utils/api'
import { decodeToken } from '../utils/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = decodeToken(token)
        setUser(decoded)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      const decoded = decodeToken(token)
      setUser(decoded)
      
      // Return path for navigation
      const rolePath = {
        student: '/student/dashboard',
        supervisor: '/supervisor/dashboard',
        coordinator: '/coordinator/dashboard',
        panel: '/panel/dashboard',
        hod: '/coordinator/dashboard'
      }
      
      toast.success('Login successful!')
      
      return { success: true, path: rolePath[decoded.role] || '/login' }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return { success: false, error: error.response?.data }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.info('Logged out successfully')
    // Navigation will be handled by ProtectedRoute redirect
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

