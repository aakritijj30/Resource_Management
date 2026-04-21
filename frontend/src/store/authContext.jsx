import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, signup as apiSignup, getMe } from '../api/authApi'

const AuthContext = createContext(null)

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON('user'))
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null)
  const [bootstrapping, setBootstrapping] = useState(true)

  const persistSession = (accessToken, userData) => {
    setToken(accessToken)
    setUser(userData)
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const hydrateUser = async () => {
    const tokenValue = localStorage.getItem('access_token')
    if (!tokenValue) {
      setBootstrapping(false)
      return
    }

    try {
      const res = await getMe()
      setUser(res.data)
      setToken(tokenValue)
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    } finally {
      setBootstrapping(false)
    }
  }

  useEffect(() => {
    hydrateUser()
  }, [])

  const login = async (email, password) => {
    const res = await apiLogin({ email, password })
    const { access_token } = res.data
    localStorage.setItem('access_token', access_token)
    const profile = await getMe()
    persistSession(access_token, profile.data)
    return profile.data
  }

  const signup = async ({ email, full_name, password, department_id }) => {
    const res = await apiSignup({ email, full_name, password, department_id })
    const { access_token } = res.data
    localStorage.setItem('access_token', access_token)
    const profile = await getMe()
    persistSession(access_token, profile.data)
    return profile.data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const refreshUser = hydrateUser

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      signup,
      logout,
      refreshUser,
      isAuthenticated: !!token,
      bootstrapping,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}

export default AuthContext
