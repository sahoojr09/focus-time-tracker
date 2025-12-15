'use client'

import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider as AzureMsalProvider } from '@azure/msal-react'
import { msalConfig } from '@/lib/msalConfig'
import { useEffect, useState } from 'react'

const msalInstance = new PublicClientApplication(msalConfig)

export function MsalProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    msalInstance.initialize().then(() => {
      setIsInitialized(true)
    })
  }, [])

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Loading...</div>
    </div>
  }

  return (
    <AzureMsalProvider instance={msalInstance}>
      {children}
    </AzureMsalProvider>
  )
}