import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'

export interface Metrics {
  total_income: number
  total_expenses: number
  net_balance: number
  daily_average: number
}

export interface MonthlyStat {
  month: string
  income: number
  expenses: number
  net: number
}

interface AnalyticsFilters {
  start_date?: string
  end_date?: string
  categories?: string[]
}

export const useAnalytics = (filters: AnalyticsFilters) => {
  const [metrics, setMetrics] = useState<Metrics>({
    total_income: 0,
    total_expenses: 0,
    net_balance: 0,
    daily_average: 0
  })
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([])
  const [dailyAverages, setDailyAverages] = useState<{ [key: string]: number }>({})
  const [percentageChanges, setPercentageChanges] = useState<{ [key: string]: number }>({})
  const [trends, setTrends] = useState<{ [key: string]: { direction: string; percentage: number } }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {}
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      if (filters.categories && filters.categories.length > 0) {
        params.categories = filters.categories.join(',')
      }

      // Fetch all analytics data in parallel
      const [metricsRes, monthlyRes, dailyRes, changesRes, trendsRes] = await Promise.all([
        analyticsAPI.getMetrics(params),
        analyticsAPI.getMonthlyStats(params),
        analyticsAPI.getDailyAverages(params),
        analyticsAPI.getPercentageChanges(params),
        analyticsAPI.getTrends(params)
      ])

      setMetrics(metricsRes.data)
      setMonthlyStats(monthlyRes.data)
      setDailyAverages(dailyRes.data)
      setPercentageChanges(changesRes.data)
      setTrends(trendsRes.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [filters.start_date, filters.end_date, filters.categories])

  return {
    metrics,
    monthlyStats,
    dailyAverages,
    percentageChanges,
    trends,
    loading,
    error,
    refetch: fetchAnalytics
  }
}
