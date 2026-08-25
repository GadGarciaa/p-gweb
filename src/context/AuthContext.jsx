import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch-on-mount: intenta restaurar la sesion a partir del token guardado.
    const token = getToken()
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount inicial
      setLoading(false)
      return
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login({ email, password })
    setToken(token)
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (name, email, password, role) => {
    const { token, user } = await api.register({ name, email, password, role })
    setToken(token)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook companero del provider
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
