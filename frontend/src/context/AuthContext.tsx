import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface User {
  id: string
  email: string
  name: string
  picture: string
  credits: number
}

export interface AuthContextType {
  isAuthenticated: boolean
  currentUser: User | null
  login: (user: User, token: string) => void
  logout: () => void
  updateCredits: (credits: number) => void
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY_TOKEN = 'postcard_auth_token'
const STORAGE_KEY_USER = 'postcard_auth_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN)
    const userJson = localStorage.getItem(STORAGE_KEY_USER)
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        setCurrentUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem(STORAGE_KEY_TOKEN)
        localStorage.removeItem(STORAGE_KEY_USER)
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((user: User, token: string) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
    setCurrentUser(user)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_USER)
    setCurrentUser(null)
    setIsAuthenticated(false)
  }, [])

  const updateCredits = useCallback((credits: number) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, credits }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)
    }
  }, [currentUser])

  const getToken = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY_TOKEN)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-500" />
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        updateCredits,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
