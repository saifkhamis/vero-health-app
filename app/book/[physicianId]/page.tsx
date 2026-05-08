'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import SlotPicker from '@/components/SlotPicker'
import ProgressIndicator from '@/components/ProgressIndicator'
import Footer from '@/components/Footer'
import type { Physician, GroupedSlots } from '@/lib/types'

export default function ChooseSlotPage() {
  const params = useParams<{ physicianId: string }>()
  const router = useRouter()

  const [physician, setPhysician] = useState<Physician | null>(null)
  const [groups, setGroups] = useState<GroupedSlots[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [physRes, slotsRes] = await Promise.all([
          fetch('/api/physicians'),
          fetch(`/api/availability/${params.physicianId}`),
        ])
        if (!physRes.ok || !slotsRes.ok) throw new Error('fetch failed')
        const physicians: Physician[] = await physRes.json()
        const found = physicians.find((p) => p.id === params.physicianId)
        if (!found) throw new Error('not found')
        setPhysician(found)
        setGroups(await slotsRes.json())
      } catch {
        setError('Unable to load availability. Please go back and try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.physicianId])

  function handleSelect(slotId: string, date: string, time: string) {
    setSelectedSlotId(slotId)
    setSelectedDate(date)
    setSelectedTime(time)
  }

  function handleContinue() {
    if (!selectedSlotId) return
    const qs = new URLSearchParams({
      slotId: selectedSlotId,
      date: selectedDate,
      time: selectedTime,
    })
    router.push(`/book/${params.physicianId}/confirm?${qs.toString()}`)
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <nav className="border-b border-[#E7E5E0] bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-600">Vero Health</Link>
          <Link href="/book" className="text-sm text-gray-500 hover:text-gray-700">← All Physicians</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <ProgressIndicator step={2} />
        </div>

        {loading && (
          <div className="py-20 text-center text-sm text-gray-500">Loading availability…</div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && physician && (
          <>
            <div className="mb-8 rounded-xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-blue-600">{physician.specialty}</p>
              <h1 className="mt-1 text-2xl font-bold text-[#1C1917]">{physician.name}</h1>
            </div>

            <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">Select a time slot</h2>
            <SlotPicker groups={groups} selectedSlotId={selectedSlotId} onSelect={handleSelect} />

            <div className="mt-8">
              <button
                onClick={handleContinue}
                disabled={!selectedSlotId}
                className="w-full rounded-xl bg-blue-600 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  )
}
