import axios from 'axios'
import router from '../router'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 处理认证错误
    if (error.response && error.response.status === 401 || error.response && error.response.status === 403) {
      console.warn('API认证失败:', error.response.status)
      
      // 清除本地token
      localStorage.removeItem('token')
      
      // 如果不是登录页面，重定向到登录页
      if (router.currentRoute.value.name !== 'login') {
        router.push('/login')
      }
    }
    
    return Promise.reject(error)
  }
)

// API服务
export default {
  // 用户认证
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data)
  },
  
  // AI 服务
  ai: {
    chat: (message) => api.post('/ai/chat', { message })
  },
  
  // 交易记录
  transactions: {
    getAll: () => api.get('/transactions'),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (transaction) => api.post('/transactions', transaction),
    update: (id, transaction) => api.put(`/transactions/${id}`, transaction),
    delete: (id) => api.delete(`/transactions/${id}`)
  },
  
  // 预算管理
  budgets: {
    getAll: () => api.get('/budgets'),
    getByCategory: (category) => api.get(`/budgets/category/${category}`),
    create: (budget) => api.post('/budgets', budget),
    update: (category, budget) => api.put(`/budgets/category/${category}`, budget),
    delete: (category) => api.delete(`/budgets/category/${category}`)
  },
  
  // 用户设置
  settings: {
    get: () => api.get('/settings'),
    update: (settings) => api.put('/settings', settings)
  },
  
  // 通用请求方法
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete
} 