import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Attach JWT if present
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any)['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Transaction API
export const transactionAPI = {
  // Get all transactions
  getTransactions: (params?: {
    start_date?: string
    end_date?: string
    categories?: string
  }) => api.get('/transactions', { params }),

  // Get transaction by ID
  getTransaction: (id: number) => api.get(`/transactions/${id}`),

  // Create transaction
  createTransaction: (data: {
    date: string
    category: string
    amount: number
    description?: string
  }) => api.post('/transactions', data),

  // Update transaction
  updateTransaction: (id: number, data: {
    date?: string
    category?: string
    amount?: number
    description?: string
  }) => api.put(`/transactions/${id}`, data),

  // Delete transaction
  deleteTransaction: (id: number) => api.delete(`/transactions/${id}`),

  // Get categories
  getCategories: () => api.get('/transactions/categories/list'),
}

// Analytics API
export const analyticsAPI = {
  // Get key metrics
  getMetrics: (params?: {
    start_date?: string
    end_date?: string
    categories?: string
  }) => api.get('/analytics/metrics', { params }),

  // Get monthly statistics
  getMonthlyStats: (params?: {
    start_date?: string
    end_date?: string
    categories?: string
  }) => api.get('/analytics/monthly-stats', { params }),

  // Get daily averages
  getDailyAverages: (params?: {
    start_date?: string
    end_date?: string
    categories?: string
  }) => api.get('/analytics/daily-averages', { params }),

  // Get percentage changes
  getPercentageChanges: (params?: {
    start_date?: string
    end_date?: string
    categories?: string
  }) => api.get('/analytics/percentage-changes', { params }),

  // Get trend analysis
  getTrends: (params?: {
    start_date?: string
    end_date?: string
    categories?: string
  }) => api.get('/analytics/trends', { params }),

  // Get chart data
  getChartData: (chartType: string, params?: {
    start_date?: string
    end_date?: string
    categories?: string
  }) => api.get('/analytics/chart-data', { 
    params: { 
      chart_type: chartType, 
      ...params 
    } 
  }),
}

export default api

// Plaid API
export const plaidAPI = {
  createLinkToken: () => api.post('/plaid/link-token'),
  exchangePublicToken: (public_token: string) => api.post('/plaid/exchange', { public_token }),
  syncTransactions: () => api.post('/plaid/sync'),
}

// Auth API
export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login-simple', { email, password }),
}

// Upload CSV API
export const uploadAPI = {
  uploadCsv: (file: File, userId?: number) => {
    const form = new FormData()
    form.append('file', file)
    if (userId !== undefined) form.append('user_id', String(userId))
    return api.post('/upload-csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
