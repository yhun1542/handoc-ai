import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '@/api/auth'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          // 토큰 유효성 검증
          const response = await authAPI.verifyToken(savedToken)
          if (response.valid) {
            setToken(savedToken)
            // 사용자 정보 가져오기
            const userInfo = await authAPI.getCurrentUser(savedToken)
            setUser(userInfo)
          } else {
            // 유효하지 않은 토큰 제거
            localStorage.removeItem('token')
            setToken(null)
          }
        } catch (error) {
          console.error('토큰 검증 실패:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { access_token, user: userData } = response
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser(userData)
      
      return { success: true }
    } catch (error) {
      console.error('로그인 실패:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || '로그인에 실패했습니다' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      return { success: true, user: response }
    } catch (error) {
      console.error('회원가입 실패:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || '회원가입에 실패했습니다' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

