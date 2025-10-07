// Mock data service to display sample data from transactions.csv
export interface Transaction {
  id: number
  date: string
  category: string
  amount: number
  description: string
  created_at: string
}

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

// Sample data from transactions.csv
const sampleTransactions: Transaction[] = [
  { id: 1, date: "2025-05-01", category: "Rent", amount: 1200, description: "Monthly", created_at: "2025-05-01T00:00:00Z" },
  { id: 2, date: "2025-05-01", category: "Income", amount: 2500, description: "Salary", created_at: "2025-05-01T00:00:00Z" },
  { id: 3, date: "2025-05-02", category: "Transport", amount: 2.75, description: "Bus", created_at: "2025-05-02T00:00:00Z" },
  { id: 4, date: "2025-05-03", category: "Food", amount: 12.5, description: "Lunch", created_at: "2025-05-03T00:00:00Z" },
  { id: 5, date: "2025-05-04", category: "Entertainment", amount: 20, description: "Movie", created_at: "2025-05-04T00:00:00Z" },
  { id: 6, date: "2025-05-08", category: "Income", amount: 2500, description: "Salary", created_at: "2025-05-08T00:00:00Z" },
  { id: 7, date: "2025-05-09", category: "Food", amount: 4.5, description: "Coffee", created_at: "2025-05-09T00:00:00Z" },
  { id: 8, date: "2025-05-10", category: "Transport", amount: 14, description: "Taxi", created_at: "2025-05-10T00:00:00Z" },
  { id: 9, date: "2025-05-11", category: "Food", amount: 19.3, description: "Dinner", created_at: "2025-05-11T00:00:00Z" },
  { id: 10, date: "2025-05-12", category: "Utilities", amount: 60.4, description: "Electricity", created_at: "2025-05-12T00:00:00Z" },
  { id: 11, date: "2025-05-15", category: "Food", amount: 11.2, description: "Lunch", created_at: "2025-05-15T00:00:00Z" },
  { id: 12, date: "2025-05-16", category: "Entertainment", amount: 50, description: "Concert", created_at: "2025-05-16T00:00:00Z" },
  { id: 13, date: "2025-05-17", category: "Health", amount: 25, description: "Pharmacy", created_at: "2025-05-17T00:00:00Z" },
  { id: 14, date: "2025-05-18", category: "Transport", amount: 3, description: "Subway", created_at: "2025-05-18T00:00:00Z" },
  { id: 15, date: "2025-05-19", category: "Food", amount: 5.7, description: "Snacks", created_at: "2025-05-19T00:00:00Z" },
  { id: 16, date: "2025-05-22", category: "Income", amount: 2500, description: "Salary", created_at: "2025-05-22T00:00:00Z" },
  { id: 17, date: "2025-05-23", category: "Food", amount: 13.5, description: "Lunch", created_at: "2025-05-23T00:00:00Z" },
  { id: 18, date: "2025-05-24", category: "Transport", amount: 2.75, description: "Bus", created_at: "2025-05-24T00:00:00Z" },
  { id: 19, date: "2025-05-25", category: "Entertainment", amount: 22, description: "Cinema", created_at: "2025-05-25T00:00:00Z" },
  { id: 20, date: "2025-05-26", category: "Food", amount: 18.4, description: "Dinner", created_at: "2025-05-26T00:00:00Z" },
  { id: 21, date: "2025-06-01", category: "Rent", amount: 1200, description: "Monthly", created_at: "2025-06-01T00:00:00Z" },
  { id: 22, date: "2025-06-05", category: "Income", amount: 2500, description: "Salary", created_at: "2025-06-05T00:00:00Z" },
  { id: 23, date: "2025-06-02", category: "Food", amount: 3.8, description: "Coffee", created_at: "2025-06-02T00:00:00Z" },
  { id: 24, date: "2025-06-03", category: "Transport", amount: 15, description: "Taxi", created_at: "2025-06-03T00:00:00Z" },
  { id: 25, date: "2025-06-04", category: "Food", amount: 12, description: "Lunch", created_at: "2025-06-04T00:00:00Z" },
  { id: 26, date: "2025-06-06", category: "Entertainment", amount: 20, description: "Movie", created_at: "2025-06-06T00:00:00Z" },
  { id: 27, date: "2025-06-09", category: "Food", amount: 19, description: "Dinner", created_at: "2025-06-09T00:00:00Z" },
  { id: 28, date: "2025-06-10", category: "Utilities", amount: 35, description: "Water", created_at: "2025-06-10T00:00:00Z" },
  { id: 29, date: "2025-06-12", category: "Income", amount: 2500, description: "Salary", created_at: "2025-06-12T00:00:00Z" },
  { id: 30, date: "2025-06-13", category: "Transport", amount: 2.75, description: "Bus", created_at: "2025-06-13T00:00:00Z" },
  { id: 31, date: "2025-06-14", category: "Food", amount: 11.8, description: "Lunch", created_at: "2025-06-14T00:00:00Z" },
  { id: 32, date: "2025-06-15", category: "Health", amount: 27, description: "Pharmacy", created_at: "2025-06-15T00:00:00Z" },
  { id: 33, date: "2025-06-16", category: "Entertainment", amount: 45, description: "Theater", created_at: "2025-06-16T00:00:00Z" },
  { id: 34, date: "2025-06-17", category: "Food", amount: 4, description: "Coffee", created_at: "2025-06-17T00:00:00Z" },
  { id: 35, date: "2025-06-19", category: "Transport", amount: 3, description: "Subway", created_at: "2025-06-19T00:00:00Z" },
  { id: 36, date: "2025-06-20", category: "Food", amount: 18, description: "Dinner", created_at: "2025-06-20T00:00:00Z" },
  { id: 37, date: "2025-06-23", category: "Income", amount: 2500, description: "Salary", created_at: "2025-06-23T00:00:00Z" },
  { id: 38, date: "2025-06-24", category: "Food", amount: 13.2, description: "Lunch", created_at: "2025-06-24T00:00:00Z" },
  { id: 39, date: "2025-06-25", category: "Transport", amount: 14, description: "Taxi", created_at: "2025-06-25T00:00:00Z" },
  { id: 40, date: "2025-06-26", category: "Entertainment", amount: 23, description: "Cinema", created_at: "2025-06-26T00:00:00Z" },
  { id: 41, date: "2025-06-27", category: "Food", amount: 20, description: "Dinner", created_at: "2025-06-27T00:00:00Z" },
  { id: 42, date: "2025-07-01", category: "Rent", amount: 1200, description: "Monthly", created_at: "2025-07-01T00:00:00Z" },
  { id: 43, date: "2025-07-03", category: "Income", amount: 2500, description: "Salary", created_at: "2025-07-03T00:00:00Z" },
  { id: 44, date: "2025-07-02", category: "Food", amount: 4.2, description: "Coffee", created_at: "2025-07-02T00:00:00Z" },
  { id: 45, date: "2025-07-04", category: "Transport", amount: 2.75, description: "Bus", created_at: "2025-07-04T00:00:00Z" },
  { id: 46, date: "2025-07-05", category: "Food", amount: 12.3, description: "Lunch", created_at: "2025-07-05T00:00:00Z" },
  { id: 47, date: "2025-07-06", category: "Entertainment", amount: 18, description: "Movie", created_at: "2025-07-06T00:00:00Z" },
  { id: 48, date: "2025-07-08", category: "Food", amount: 19, description: "Dinner", created_at: "2025-07-08T00:00:00Z" },
  { id: 49, date: "2025-07-09", category: "Utilities", amount: 65, description: "Electricity", created_at: "2025-07-09T00:00:00Z" },
  { id: 50, date: "2025-07-10", category: "Income", amount: 2500, description: "Salary", created_at: "2025-07-10T00:00:00Z" },
  { id: 51, date: "2025-07-11", category: "Transport", amount: 15, description: "Taxi", created_at: "2025-07-11T00:00:00Z" },
  { id: 52, date: "2025-07-12", category: "Food", amount: 12.5, description: "Lunch", created_at: "2025-07-12T00:00:00Z" },
  { id: 53, date: "2025-07-13", category: "Health", amount: 26, description: "Pharmacy", created_at: "2025-07-13T00:00:00Z" },
  { id: 54, date: "2025-07-14", category: "Entertainment", amount: 50, description: "Concert", created_at: "2025-07-14T00:00:00Z" },
  { id: 55, date: "2025-07-15", category: "Food", amount: 3.9, description: "Coffee", created_at: "2025-07-15T00:00:00Z" },
  { id: 56, date: "2025-07-17", category: "Transport", amount: 3, description: "Subway", created_at: "2025-07-17T00:00:00Z" },
  { id: 57, date: "2025-07-18", category: "Food", amount: 18.7, description: "Dinner", created_at: "2025-07-18T00:00:00Z" },
  { id: 58, date: "2025-07-20", category: "Income", amount: 2500, description: "Salary", created_at: "2025-07-20T00:00:00Z" },
  { id: 59, date: "2025-07-21", category: "Food", amount: 13.4, description: "Lunch", created_at: "2025-07-21T00:00:00Z" },
  { id: 60, date: "2025-07-22", category: "Transport", amount: 2.75, description: "Bus", created_at: "2025-07-22T00:00:00Z" },
  { id: 61, date: "2025-07-23", category: "Entertainment", amount: 42, description: "Theater", created_at: "2025-07-23T00:00:00Z" },
  { id: 62, date: "2025-07-24", category: "Food", amount: 19, description: "Dinner", created_at: "2025-07-24T00:00:00Z" },
  { id: 63, date: "2025-08-01", category: "Rent", amount: 1200, description: "Monthly", created_at: "2025-08-01T00:00:00Z" },
  { id: 64, date: "2025-08-07", category: "Income", amount: 2500, description: "Salary", created_at: "2025-08-07T00:00:00Z" },
  { id: 65, date: "2025-08-02", category: "Food", amount: 4, description: "Coffee", created_at: "2025-08-02T00:00:00Z" },
  { id: 66, date: "2025-08-03", category: "Transport", amount: 14, description: "Taxi", created_at: "2025-08-03T00:00:00Z" },
  { id: 67, date: "2025-08-04", category: "Food", amount: 12.6, description: "Lunch", created_at: "2025-08-04T00:00:00Z" },
  { id: 68, date: "2025-08-05", category: "Entertainment", amount: 20, description: "Movie", created_at: "2025-08-05T00:00:00Z" },
  { id: 69, date: "2025-08-06", category: "Food", amount: 18.9, description: "Dinner", created_at: "2025-08-06T00:00:00Z" },
  { id: 70, date: "2025-08-08", category: "Utilities", amount: 35, description: "Water", created_at: "2025-08-08T00:00:00Z" },
  { id: 71, date: "2025-08-09", category: "Income", amount: 2500, description: "Salary", created_at: "2025-08-09T00:00:00Z" },
  { id: 72, date: "2025-08-10", category: "Transport", amount: 2.75, description: "Bus", created_at: "2025-08-10T00:00:00Z" },
  { id: 73, date: "2025-08-11", category: "Food", amount: 13.1, description: "Lunch", created_at: "2025-08-11T00:00:00Z" },
  { id: 74, date: "2025-08-12", category: "Health", amount: 25, description: "Pharmacy", created_at: "2025-08-12T00:00:00Z" },
  { id: 75, date: "2025-08-13", category: "Entertainment", amount: 22, description: "Cinema", created_at: "2025-08-13T00:00:00Z" },
  { id: 76, date: "2025-08-14", category: "Food", amount: 4.5, description: "Coffee", created_at: "2025-08-14T00:00:00Z" },
  { id: 77, date: "2025-08-16", category: "Transport", amount: 3, description: "Subway", created_at: "2025-08-16T00:00:00Z" },
  { id: 78, date: "2025-08-17", category: "Food", amount: 19.2, description: "Dinner", created_at: "2025-08-17T00:00:00Z" },
  { id: 79, date: "2025-08-19", category: "Income", amount: 2500, description: "Salary", created_at: "2025-08-19T00:00:00Z" },
  { id: 80, date: "2025-08-20", category: "Food", amount: 12.9, description: "Lunch", created_at: "2025-08-20T00:00:00Z" },
  { id: 81, date: "2025-08-21", category: "Transport", amount: 14, description: "Taxi", created_at: "2025-08-21T00:00:00Z" },
  { id: 82, date: "2025-08-22", category: "Entertainment", amount: 45, description: "Theater", created_at: "2025-08-22T00:00:00Z" },
  { id: 83, date: "2025-08-23", category: "Food", amount: 18.6, description: "Dinner", created_at: "2025-08-23T00:00:00Z" },
  { id: 84, date: "2025-09-01", category: "Rent", amount: 1200, description: "Monthly", created_at: "2025-09-01T00:00:00Z" },
  { id: 85, date: "2025-09-04", category: "Income", amount: 2500, description: "Salary", created_at: "2025-09-04T00:00:00Z" },
  { id: 86, date: "2025-09-02", category: "Food", amount: 4, description: "Coffee", created_at: "2025-09-02T00:00:00Z" },
  { id: 87, date: "2025-09-03", category: "Transport", amount: 2.75, description: "Bus", created_at: "2025-09-03T00:00:00Z" },
  { id: 88, date: "2025-09-05", category: "Food", amount: 12.8, description: "Lunch", created_at: "2025-09-05T00:00:00Z" },
  { id: 89, date: "2025-09-06", category: "Entertainment", amount: 21, description: "Movie", created_at: "2025-09-06T00:00:00Z" },
  { id: 90, date: "2025-09-07", category: "Food", amount: 18.7, description: "Dinner", created_at: "2025-09-07T00:00:00Z" },
  { id: 91, date: "2025-09-08", category: "Utilities", amount: 60, description: "Electricity", created_at: "2025-09-08T00:00:00Z" },
  { id: 92, date: "2025-09-10", category: "Income", amount: 2500, description: "Salary", created_at: "2025-09-10T00:00:00Z" },
  { id: 93, date: "2025-09-09", category: "Transport", amount: 15, description: "Taxi", created_at: "2025-09-09T00:00:00Z" },
  { id: 94, date: "2025-09-10", category: "Food", amount: 13, description: "Lunch", created_at: "2025-09-10T00:00:00Z" }
]

// Calculate metrics from sample data
export const getMockMetrics = (): Metrics => {
  const income = sampleTransactions
    .filter(t => t.category === 'Income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expenses = sampleTransactions
    .filter(t => t.category !== 'Income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const netBalance = income - expenses
  const days = Math.max(1, Math.ceil((new Date('2025-09-10').getTime() - new Date('2025-05-01').getTime()) / (1000 * 60 * 60 * 24)))
  const dailyAverage = expenses / days
  
  return {
    total_income: income,
    total_expenses: expenses,
    net_balance: netBalance,
    daily_average: dailyAverage
  }
}

// Calculate monthly stats
export const getMockMonthlyStats = (): MonthlyStat[] => {
  const monthlyData: { [key: string]: { income: number, expenses: number } } = {}
  
  sampleTransactions.forEach(transaction => {
    const month = transaction.date.substring(0, 7) // YYYY-MM format
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 }
    }
    
    if (transaction.category === 'Income') {
      monthlyData[month].income += transaction.amount
    } else {
      monthlyData[month].expenses += transaction.amount
    }
  })
  
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    net: data.income - data.expenses
  }))
}

// Get daily averages by category
export const getMockDailyAverages = () => {
  const categoryTotals: { [key: string]: { total: number, count: number } } = {}
  
  sampleTransactions.forEach(transaction => {
    if (transaction.category !== 'Income') {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = { total: 0, count: 0 }
      }
      categoryTotals[transaction.category].total += transaction.amount
      categoryTotals[transaction.category].count += 1
    }
  })
  
  const averages: { [key: string]: number } = {}
  Object.entries(categoryTotals).forEach(([category, data]) => {
    averages[category] = data.total / data.count
  })
  
  return averages
}

// Get percentage changes (simplified)
export const getMockPercentageChanges = () => {
  return {
    'Food': 5.2,
    'Transport': -2.1,
    'Entertainment': 8.7,
    'Utilities': 0.0,
    'Health': 12.3,
    'Rent': 0.0
  }
}

// Get chart data for different chart types
export const getMockChartData = (chartType: string) => {
  switch (chartType) {
    case 'area':
      return getMockMonthlyStats().map(stat => ({
        month: stat.month,
        income: stat.income,
        expenses: stat.expenses,
        net: stat.net
      }))
    case 'pie':
      const categoryTotals: { [key: string]: number } = {}
      sampleTransactions.forEach(transaction => {
        if (transaction.category !== 'Income') {
          categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount
        }
      })
      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount
      }))
    case 'bar':
      const barData = getMockMonthlyStats()
      return {
        labels: barData.map(stat => stat.month),
        datasets: [
          {
            label: 'Income',
            data: barData.map(stat => stat.income),
            backgroundColor: '#10B981'
          },
          {
            label: 'Expenses',
            data: barData.map(stat => stat.expenses),
            backgroundColor: '#EF4444'
          }
        ]
      }
    case 'line':
      const lineData = getMockMonthlyStats()
      return {
        labels: lineData.map(stat => stat.month),
        datasets: [
          {
            label: 'Income',
            data: lineData.map(stat => stat.income),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: lineData.map(stat => stat.expenses),
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: false,
            tension: 0.4
          }
        ]
      }
    default:
      return []
  }
}

export const getMockTransactions = (filters?: {
  start_date?: string
  end_date?: string
  categories?: string[]
}): Transaction[] => {
  let filtered = [...sampleTransactions]
  
  if (filters?.start_date) {
    filtered = filtered.filter(t => t.date >= filters.start_date!)
  }
  
  if (filters?.end_date) {
    filtered = filtered.filter(t => t.date <= filters.end_date!)
  }
  
  if (filters?.categories && filters.categories.length > 0) {
    filtered = filtered.filter(t => filters.categories!.includes(t.category))
  }
  
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}