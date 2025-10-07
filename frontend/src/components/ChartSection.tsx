import React, { useState, useEffect } from 'react'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { getMockChartData } from '../services/mockData'
import { Transaction } from '../hooks/useTransactions'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface Filters {
  start_date: string
  end_date: string
  categories: string[]
  chart_type: string
}

interface ChartSectionProps {
  filters: Filters
  transactions: Transaction[]
  loading: boolean
}

const ChartSection: React.FC<ChartSectionProps> = ({ filters, transactions, loading }) => {
  const [chartData, setChartData] = useState<any>(null)
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    const fetchChartData = () => {
      if (transactions.length === 0) {
        setChartData(null)
        return
      }

      setChartLoading(true)
      try {
        // Use mock data instead of API call
        const mockData = getMockChartData(filters.chart_type)
        
        // Transform mock data to chart.js format
        let chartData: any = null
        
        if (filters.chart_type === 'pie') {
          chartData = {
            labels: mockData.map((item: any) => item.category),
            datasets: [{
              data: mockData.map((item: any) => item.amount),
              backgroundColor: [
                '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'
              ],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          }
        } else if (filters.chart_type === 'bar') {
          // For bar charts, use the bar chart data format
          chartData = mockData
        } else if (filters.chart_type === 'line') {
          // For line charts, use the line chart data format
          chartData = mockData
        } else {
          // For area charts, use monthly data
          const monthlyData = mockData
          chartData = {
            labels: monthlyData.map((item: any) => item.month),
            datasets: [
              {
                label: 'Income',
                data: monthlyData.map((item: any) => item.income),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Expenses',
                data: monthlyData.map((item: any) => item.expenses),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
          }
        }
        
        setChartData(chartData)
      } catch (error) {
        console.error('Error processing chart data:', error)
        setChartData(null)
      } finally {
        setChartLoading(false)
      }
    }

    fetchChartData()
  }, [filters, transactions])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: getChartTitle(),
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: filters.chart_type !== 'pie' ? {
      x: {
        grid: {
          color: '#f3f4f6'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString()
          }
        }
      }
    } : {}
  }

  function getChartTitle() {
    const titles: { [key: string]: string } = {
      'area': '📈 Financial Trends Over Time',
      'bar': '📊 Expense Breakdown',
      'line': '📉 Financial Trends',
      'pie': '🥧 Expense Distribution'
    }
    return titles[filters.chart_type] || '📈 Financial Data'
  }

  const renderChart = () => {
    if (loading || chartLoading) {
      return (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )
    }

    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-lg">No data available</div>
            <div className="text-sm">Try adjusting your filters or add some transactions</div>
          </div>
        </div>
      )
    }

    switch (filters.chart_type) {
      case 'pie':
        return <Doughnut data={chartData} options={chartOptions} />
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />
      case 'line':
        return <Line data={chartData} options={chartOptions} />
      default:
        return <Line data={chartData} options={chartOptions} />
    }
  }

  return (
    <div className="card card-hover">
      <div className="h-[600px]">
        {renderChart()}
      </div>
    </div>
  )
}

export default ChartSection
