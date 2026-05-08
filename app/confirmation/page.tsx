'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import Footer from '@/components/Footer'
import type { Booking } from '@/lib/types'

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId') ?? ''

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/bookings')
        if (!res.ok) throw new Error('failed')
        const bookings: Booking[] = await res.json()
        const found = bookings.find((b) => b.id === bookingId)
        if (!found) throw new Error('not found')
        setBooking(found)
      } catch {
        setError('We could not load your booking details. Please check back shortly.')
      } finally {
        setLoading(false)
      }
    }
    if (bookingId) load()
    else setLoading(false)
  }, [bookingId])

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <nav className="border-b border-[#E7E5E0] bg-white px-6 py-4">
        <Link href="/" className="text-lg font-bold text-blue-600">Vero Health</Link>
      </nav>

      <div className="mx-auto max-w-xl px-6 py-16">
        {loading && (
          <div className="py-20 text-center text-sm text-gray-500">Loading your confirmation…</div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-2xl border border-[#E7E5E0] bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-[#1C1917]">Appointment Requested</h1>
            <p className="mt-3 text-sm text-[#57534E] leading-relaxed">
              Your appointment request has been submitted. You will receive confirmation within 24 hours.
            </p>

            <div className="mt-2">
              <StatusBadge status="pending" />
            </div>

            {booking && (
              <div className="mt-6 space-y-3 rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] p-5 text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Booking ID</p>
                  <p className="mt-0.5 font-mono text-sm text-gray-700">{booking.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Patient</p>
                  <p className="mt-0.5 text-sm text-gray-700">{booking.patientName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Physician</p>
                  <p className="mt-0.5 text-sm text-gray-700">{booking.physician.name}</p>
                  <p className="text-xs text-gray-500">{booking.physician.specialty}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Appointment</p>
                  <p className="mt-0.5 text-sm text-gray-700">
                    {formatDisplayDate(booking.slot.date)} at {booking.slot.time}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Book Another Appointment
              </Link>
              <Link
                href="/"
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading…</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
