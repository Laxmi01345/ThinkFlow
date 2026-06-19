import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthContext = createContext(null)

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('tf_token'))
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const verify = async () => {
      if (!token) {
        if (mountedRef.current) setLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Invalid token')
        const data = await res.json()
        if (!cancelled && mountedRef.current) {
          setUser(data.user)
        }
      } catch {
        localStorage.removeItem('tf_token')
        if (!cancelled && mountedRef.current) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false)
        }
      }
    }

    verify()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [token])

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Login failed')
    localStorage.setItem('tf_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const signup = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Signup failed')
    if (data.token) {
      localStorage.setItem('tf_token', data.token)
      setToken(data.token)
    }
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('tf_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
