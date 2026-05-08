'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import BookingTable from '@/components/BookingTable'
import StatusBadge from '@/components/StatusBadge'
import Footer from '@/components/Footer'
import type { Booking, BookingStatus, Physician } from '@/lib/types'

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
]

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function AdminPage() {
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [physicians, setPhysicians] = useState<Physician[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [physicianFilter, setPhysicianFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings')
      if (!res.ok) throw new Error('failed')
      setAllBookings(await res.json())
      setLastUpdated(new Date())
    } catch {
      setError('Unable to load bookings. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    async function loadPhysicians() {
      try {
        const res = await fetch('/api/physicians')
        if (!res.ok) return
        setPhysicians(await res.json())
      } catch {
        // physician list is display-only; fail silently
      }
    }
    loadPhysicians()
    loadBookings()
  }, [loadBookings])

  async function handleStatusChange(id: string, status: BookingStatus) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const data = await res.json() as { error?: string }
      throw new Error(data.error ?? 'Update failed')
    }
    const updated: Booking = await res.json()
    setAllBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    setLastUpdated(new Date())
  }

  const filtered = allBookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false
    if (physicianFilter && b.physicianId !== physicianFilter) return false
    return true
  })

  const counts = {
    total: allBookings.length,
    pending: allBookings.filter((b) => b.status === 'pending').length,
    confirmed: allBookings.filter((b) => b.status === 'confirmed').length,
    cancelled: allBookings.filter((b) => b.status === 'cancelled').length,
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <nav className="border-b border-[#E7E5E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-600">Vero Health</Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Home</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1C1917]">Appointment Dashboard</h1>
          {lastUpdated && (
            <p className="text-xs text-slate-400">Last updated: {formatTime(lastUpdated)}</p>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Bookings', value: counts.total, color: 'text-[#1C1917]', bg: 'bg-[#F5F4F1]', accent: 'border-l-blue-500' },
                { label: 'Pending', value: counts.pending, color: 'text-amber-700', bg: 'bg-amber-50', accent: 'border-l-yellow-400' },
                { label: 'Confirmed', value: counts.confirmed, color: 'text-emerald-700', bg: 'bg-emerald-50', accent: 'border-l-green-500' },
                { label: 'Cancelled', value: counts.cancelled, color: 'text-[#57534E]', bg: 'bg-stone-100', accent: 'border-l-gray-400' },
              ].map(({ label, value, color, bg, accent }) => (
                <div key={label} className={`rounded-xl border border-[#E7E5E0] border-l-4 ${accent} ${bg} p-5`}>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Status:
                </label>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        statusFilter === opt.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-4">
                <label htmlFor="physicianFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Physician:
                </label>
                <select
                  id="physicianFilter"
                  value={physicianFilter}
                  onChange={(e) => setPhysicianFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Physicians</option>
                  {physicians.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {(statusFilter || physicianFilter) && (
                <button
                  onClick={() => { setStatusFilter(''); setPhysicianFilter('') }}
                  className="text-xs text-blue-600 hover:underline sm:ml-2"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="mt-4">
              <BookingTable bookings={filtered} onStatusChange={handleStatusChange} />
            </div>
          </>
        )}

        {loading && (
          <div className="py-20 text-center text-sm text-gray-500">Loading bookings…</div>
        )}
      </div>
      <Footer />
    </main>
  )
}
