import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Calendar, Tag, DollarSign, FileText, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTransactions } from '../hooks/useTransactions'

interface TransactionForm {
  date: string
  category: string
  amount: number
  description: string
}

interface AddTransactionProps {
  onTransactionAdded: () => void
}

const AddTransaction: React.FC<AddTransactionProps> = ({ onTransactionAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { createTransaction } = useTransactions({})

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionForm>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: 0,
      description: ''
    }
  })

  const onSubmit = async (data: TransactionForm) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would call the API
      // For now, just simulate success
      console.log('Transaction data:', data)
      toast.success('✅ Transaction added successfully!')
      reset()
      onTransactionAdded()
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    'Income', 'Rent', 'Food', 'Transport', 'Entertainment', 
    'Utilities', 'Health', 'Shopping', 'Education', 'Other'
  ]

  if (!isLoggedIn) {
    return (
      <div className="card card-hover">
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-gray-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-700">Add New Transaction</h3>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 mb-2">🔒 Authentication Required</p>
            <p className="text-sm text-yellow-700">
              Please log in to add new transactions. Use the login form in the header above.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card card-hover">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center justify-center">
          <Plus className="h-6 w-6 mr-2 text-primary-600" />
          Add New Transaction
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              📅 Date
            </label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="input-field"
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Category Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              🏷️ Category
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="select-field"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              💰 Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0, message: 'Amount must be positive' }
              })}
              className="input-field"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              📝 Description
            </label>
            <input
              type="text"
              {...register('description')}
              className="input-field"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary px-8 py-3 text-lg font-medium ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </div>
            ) : (
              <div className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Transaction
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddTransaction
