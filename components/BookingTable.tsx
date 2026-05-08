'use client'

import { useState } from 'react'
import StatusBadge from './StatusBadge'
import type { Booking, BookingStatus } from '@/lib/types'

function formatDateTime(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${dateStr} at ${time}`
}

interface BookingTableProps {
  bookings: Booking[]
  onStatusChange: (id: string, status: BookingStatus) => Promise<void>
}

export default function BookingTable({ bookings, onStatusChange }: BookingTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleAction(id: string, status: BookingStatus) {
    setLoadingId(id)
    try {
      await onStatusChange(id, status)
    } finally {
      setLoadingId(null)
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] p-12 text-center">
        <p className="text-lg font-medium text-gray-700">No bookings found</p>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to see more results.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E7E5E0]">
      <table className="min-w-full divide-y divide-[#E7E5E0] bg-white">
        <thead className="bg-[#FAFAF8]">
          <tr>
            {['Patient Name', 'Physician', 'Specialty', 'Date & Time', 'Reason', 'Status', 'Actions'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E7E5E0]">
          {bookings.map((booking) => {
            const isLoading = loadingId === booking.id
            return (
              <tr key={booking.id} className="hover:bg-[#F5F4F1] transition">
                <td className="px-4 py-4 text-sm font-medium text-[#1C1917] whitespace-nowrap">
                  {booking.patientName}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {booking.physician.name}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {booking.physician.specialty}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {formatDateTime(booking.slot.date, booking.slot.time)}
                </td>
                <td className="px-4 py-4 text-sm text-[#57534E] max-w-xs">
                  {booking.reasonForVisit}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(booking.id, 'confirmed')}
                          disabled={isLoading}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {isLoading ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => handleAction(booking.id, 'cancelled')}
                          disabled={isLoading}
                          className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                        >
                          {isLoading ? '...' : 'Cancel'}
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleAction(booking.id, 'cancelled')}
                        disabled={isLoading}
                        className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                      >
                        {isLoading ? '...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
