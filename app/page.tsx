'use client'

import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import Dashboard from '@/components/Dashboard'
import LoginPage from '@/components/LoginPage'

export default function Home() {
  const { instance, accounts } = useMsal()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(accounts.length > 0)
  }, [accounts])

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <Dashboard />
}