import React, { useState, useEffect } from 'react'
import MetricsCards from './MetricsCards'
import Filters from './Filters'
import ChartSection from './ChartSection'
import AddTransaction from './AddTransaction'
import { useTransactions } from '../hooks/useTransactions'
import { useAnalytics } from '../hooks/useAnalytics'
import { 
  getMockTransactions, 
  getMockMetrics, 
  getMockMonthlyStats, 
  getMockDailyAverages, 
  getMockPercentageChanges,
  getMockChartData,
  Transaction 
} from '../services/mockData'

const Dashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    categories: [] as string[],
    chart_type: 'area'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  // Use mock data instead of API calls
  const transactions = getMockTransactions(filters)
  const metrics = getMockMetrics()
  const monthlyStats = getMockMonthlyStats()
  const dailyAverages = getMockDailyAverages()
  const percentageChanges = getMockPercentageChanges()
  const chartData = getMockChartData(filters.chart_type)

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleTransactionAdded = () => {
    // In a real app, this would refetch data
    console.log('Transaction added (mock mode)')
  }

  return (
    <div className="space-y-8">
      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Demo Mode - Sample Data
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>This dashboard is displaying sample financial data from your transactions.csv file. The data includes income, expenses, and various categories like food, transport, entertainment, and more.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} loading={false} />

      {/* Trend Analysis - Now between metrics and filters */}
      <div className="card card-hover">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          📈 Trend Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Month-over-Month Changes */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Month-over-Month Changes</h4>
            <div className="space-y-2">
              {Object.entries(percentageChanges).map(([category, change]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category}:</span>
                  <span className={`text-sm font-bold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Averages */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Daily Averages</h4>
            <div className="space-y-2">
              {Object.entries(dailyAverages).map(([category, avg]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category}:</span>
                  <span className="text-sm font-bold text-blue-600">
                    ${avg.toFixed(2)}/day
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Filters 
        filters={filters} 
        onFiltersChange={handleFiltersChange}
        transactions={transactions}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chart Section - Now takes up 3/4 of the width */}
        <div className="lg:col-span-3">
          <ChartSection 
            filters={filters}
            transactions={transactions}
            loading={false}
          />
        </div>

        {/* Sidebar - Now takes up 1/4 of the width */}
        <div className="space-y-6">
          {/* Monthly Statistics */}
          <div className="card card-hover">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📊 Monthly Statistics
            </h3>
            <div className="space-y-3">
              {monthlyStats.map((stat, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{stat.month}</div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-600">Income:</span>
                      <span className="font-medium">${stat.income.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Expenses:</span>
                      <span className="font-medium">${stat.expenses.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-blue-600 font-medium">Net:</span>
                      <span className={`font-bold ${stat.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${stat.net.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Add Transaction */}
      <AddTransaction onTransactionAdded={handleTransactionAdded} />
    </div>
  )
}

export default Dashboard
