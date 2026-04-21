import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const login = async (email, password) => {
    const res = await apiLogin({ email, password })
    const data = res.data
    setToken(data.access_token)
    const userObj = { id: data.user_id, role: data.role, full_name: data.full_name }
    setUser(userObj)
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(userObj))
    return userObj
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() { return useContext(AuthContext) }
export default AuthContext
