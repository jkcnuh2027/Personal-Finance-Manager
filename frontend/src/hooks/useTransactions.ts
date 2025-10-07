import { useState, useEffect } from 'react'
import { transactionAPI } from '../services/api'

export interface Transaction {
  id: number
  date: string
  category: string
  amount: number
  description: string
  created_at: string
  updated_at?: string
}

interface TransactionFilters {
  start_date?: string
  end_date?: string
  categories?: string[]
}

export const useTransactions = (filters: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {}
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      if (filters.categories && filters.categories.length > 0) {
        params.categories = filters.categories.join(',')
      }

      const response = await transactionAPI.getTransactions(params)
      setTransactions(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred')
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filters.start_date, filters.end_date, filters.categories])

  const createTransaction = async (data: {
    date: string
    category: string
    amount: number
    description?: string
  }) => {
    try {
      const response = await transactionAPI.createTransaction(data)
      await fetchTransactions() // Refresh the list
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || err.message || 'Failed to create transaction')
    }
  }

  const updateTransaction = async (id: number, data: {
    date?: string
    category?: string
    amount?: number
    description?: string
  }) => {
    try {
      const response = await transactionAPI.updateTransaction(id, data)
      await fetchTransactions() // Refresh the list
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || err.message || 'Failed to update transaction')
    }
  }

  const deleteTransaction = async (id: number) => {
    try {
      await transactionAPI.deleteTransaction(id)
      await fetchTransactions() // Refresh the list
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || err.message || 'Failed to delete transaction')
    }
  }

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
  }
}
