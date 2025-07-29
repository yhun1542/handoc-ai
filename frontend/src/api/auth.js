import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 401 에러 시 로그아웃
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  // 로그인
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // 회원가입
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // 현재 사용자 정보
  getCurrentUser: async (token) => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  // 토큰 검증
  verifyToken: async (token) => {
    const response = await api.get('/auth/verify-token', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/password-reset', { email })
    return response.data
  },

  // 비밀번호 재설정 확인
  confirmPasswordReset: async (token, newPassword, confirmPassword) => {
    const response = await api.post('/auth/password-reset/confirm', {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword
    })
    return response.data
  },

  // 로그아웃
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  }
}

export default api

