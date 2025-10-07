import React from 'react'
import { Calendar, BarChart3, Tag } from 'lucide-react'
import { Transaction } from '../hooks/useTransactions'

interface Filters {
  start_date: string
  end_date: string
  categories: string[]
  chart_type: string
}

interface FiltersProps {
  filters: Filters
  onFiltersChange: (filters: Partial<Filters>) => void
  transactions: Transaction[]
}

const Filters: React.FC<FiltersProps> = ({ filters, onFiltersChange, transactions }) => {
  const uniqueCategories = [...new Set(transactions.map(t => t.category))].sort()

  const chartTypes = [
    { value: 'area', label: '📈 Area Chart' },
    { value: 'bar', label: '📊 Bar Chart' },
    { value: 'line', label: '📉 Line Chart' },
    { value: 'pie', label: '🥧 Pie Chart' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Date Range Filter */}
      <div className="card card-hover">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">📅 Time Range</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => onFiltersChange({ start_date: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => onFiltersChange({ end_date: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Chart Type Filter */}
      <div className="card card-hover">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">📊 Chart Type</h3>
        </div>
        <select
          value={filters.chart_type}
          onChange={(e) => onFiltersChange({ chart_type: e.target.value })}
          className="select-field"
        >
          {chartTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

    </div>
  )
}

export default Filters
