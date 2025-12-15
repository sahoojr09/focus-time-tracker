import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MsalProvider } from '@/components/providers/MsalProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Focus Time Tracker',
  description: 'Track your focus time with Microsoft To Do integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MsalProvider>
          {children}
        </MsalProvider>
      </body>
    </html>
  )
}