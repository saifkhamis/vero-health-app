import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vero Health — Appointment Booking',
  description: 'Simple, fast appointment booking for patients and care teams.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">{children}</body>
    </html>
  )
}
