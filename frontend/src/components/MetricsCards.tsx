import React from 'react'
import { DollarSign, TrendingDown, TrendingUp, Calendar } from 'lucide-react'
import { Metrics } from '../hooks/useAnalytics'

interface MetricsCardsProps {
  metrics: Metrics
  loading: boolean
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="metric-card animate-pulse">
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-8 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: '💰 Total Income',
      value: `$${metrics.total_income.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-100'
    },
    {
      title: '💸 Total Expenses',
      value: `$${metrics.total_expenses.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-100'
    },
    {
      title: '📊 Net Balance',
      value: `$${metrics.net_balance.toLocaleString()}`,
      icon: DollarSign,
      color: metrics.net_balance >= 0 ? 'text-green-100' : 'text-red-100'
    },
    {
      title: '📈 Daily Average',
      value: `$${metrics.daily_average.toFixed(2)}`,
      icon: Calendar,
      color: 'text-blue-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="metric-card card-hover animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">{card.title}</h3>
            <card.icon className="h-5 w-5 opacity-80" />
          </div>
          <div className="text-2xl font-bold">{card.value}</div>
        </div>
      ))}
    </div>
  )
}

export default MetricsCards
