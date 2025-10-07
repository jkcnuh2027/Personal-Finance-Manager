import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign } from 'lucide-react'
import { authAPI, uploadAPI } from '../services/api'

const Header: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const onRegister = async () => {
    try {
      setError('')
      // Simple local registration - just store user info
      const userData = {
        email,
        password, // In a real app, this would be hashed
        registeredAt: new Date().toISOString()
      }
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', 'demo-token-' + Date.now())
      setIsLoggedIn(true)
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setError('Registration failed')
    }
  }

  const onLogin = async () => {
    try {
      setError('')
      // Simple local login - check if user exists
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        if (userData.email === email && userData.password === password) {
          localStorage.setItem('token', 'demo-token-' + Date.now())
          setIsLoggedIn(true)
          setEmail('')
          setPassword('')
        } else {
          setError('Invalid credentials')
        }
      } else {
        setError('User not found. Please register first.')
      }
    } catch (err: any) {
      setError('Login failed')
    }
  }

  const onLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadAPI.uploadCsv(file)
      window.location.reload()
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <header className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8" />
              <TrendingUp className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">Personal Finance Tracker</h1>
          </div>

          {/* Right side - Auth or User actions */}
          {!isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className="px-3 py-2 rounded text-black text-sm"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="px-3 py-2 rounded text-black text-sm"
              />
              <button onClick={onRegister} className="bg-white/90 text-primary-700 px-4 py-2 rounded hover:bg-white transition-colors">Register</button>
              <button onClick={onLogin} className="bg-white/90 text-primary-700 px-4 py-2 rounded hover:bg-white transition-colors">Login</button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <label className="bg-white/90 text-primary-700 px-4 py-2 rounded cursor-pointer hover:bg-white transition-colors">
                {uploading ? 'Uploading...' : 'Upload CSV'}
                <input type="file" accept=".csv" onChange={onUpload} className="hidden" />
              </label>
              <button onClick={onLogout} className="bg-white/90 text-primary-700 px-4 py-2 rounded hover:bg-white transition-colors">Logout</button>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mt-4 text-center">
            <div className="text-red-200 text-sm">{error}</div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
