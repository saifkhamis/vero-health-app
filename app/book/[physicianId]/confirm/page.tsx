'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ProgressIndicator from '@/components/ProgressIndicator'
import Footer from '@/components/Footer'
import { REASONS_FOR_VISIT } from '@/lib/types'
import type { Physician } from '@/lib/types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1))
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => String(CURRENT_YEAR - i))

interface FormData {
  patientName: string
  patientEmail: string
  patientPhone: string
  dobDay: string
  dobMonth: string
  dobYear: string
  reasonForVisit: string
  notes: string
}

interface FormErrors {
  patientName?: string
  patientEmail?: string
  patientPhone?: string
  dob?: string
  reasonForVisit?: string
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function ConfirmContent() {
  const params = useParams<{ physicianId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const slotId = searchParams.get('slotId') ?? ''
  const date = searchParams.get('date') ?? ''
  const time = searchParams.get('time') ?? ''

  const [physician, setPhysician] = useState<Physician | null>(null)
  const [form, setForm] = useState<FormData>({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    reasonForVisit: '',
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    async function loadPhysician() {
      try {
        const res = await fetch('/api/physicians')
        if (!res.ok) return
        const physicians: Physician[] = await res.json()
        const found = physicians.find((p) => p.id === params.physicianId)
        if (found) setPhysician(found)
      } catch {
        // handled silently; physician info is display-only
      }
    }
    loadPhysician()
  }, [params.physicianId])

  function validate(): boolean {
    const next: FormErrors = {}
    if (!form.patientName.trim()) next.patientName = 'Full name is required.'
    if (!form.patientEmail.trim()) {
      next.patientEmail = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.patientEmail)) {
      next.patientEmail = 'Please enter a valid email address.'
    }
    if (!form.patientPhone.trim()) next.patientPhone = 'Phone number is required.'
    if (!form.dobDay || !form.dobMonth || !form.dobYear) next.dob = 'Date of birth is required.'
    if (!form.reasonForVisit) next.reasonForVisit = 'Please select a reason for your visit.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setApiError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          physicianId: params.physicianId,
          slotId,
          patientName: form.patientName.trim(),
          patientEmail: form.patientEmail.trim(),
          patientPhone: form.patientPhone.trim(),
          dateOfBirth: `${form.dobYear}-${form.dobMonth.padStart(2, '0')}-${form.dobDay.padStart(2, '0')}`,
          reasonForVisit: form.reasonForVisit,
          notes: form.notes.trim() || undefined,
        }),
      })
      const data = await res.json() as { id?: string; error?: string }
      if (!res.ok) {
        setApiError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      router.push(`/confirmation?bookingId=${data.id}`)
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function field(
    id: keyof FormData,
    label: string,
    type: string = 'text',
    required = true,
    extra?: React.InputHTMLAttributes<HTMLInputElement>
  ) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={id}
          type={type}
          value={form[id]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [id]: e.target.value }))
            if (errors[id as keyof FormErrors]) {
              setErrors((err) => ({ ...err, [id]: undefined }))
            }
          }}
          className={`mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors[id as keyof FormErrors] ? 'border-red-400' : 'border-gray-300'
          }`}
          {...extra}
        />
        {errors[id as keyof FormErrors] && (
          <p className="mt-1 text-xs text-red-600">{errors[id as keyof FormErrors]}</p>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <nav className="border-b border-[#E7E5E0] bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-600">Vero Health</Link>
          <Link
            href={`/book/${params.physicianId}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to slots
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <ProgressIndicator step={3} />
        </div>

        <h1 className="text-2xl font-bold text-[#1C1917]">Your information</h1>
        <p className="mt-1 text-sm text-gray-500">Please fill out the fields below to complete your booking.</p>

        {physician && date && time && (
          <div className="mt-6 rounded-xl border border-[#E7E5E0] bg-[#F5F4F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your appointment</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{physician.name}</p>
            <p className="text-sm text-gray-500">{physician.specialty}</p>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
              <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDisplayDate(date)} at {time}
            </div>
          </div>
        )}

        {apiError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          {field('patientName', 'Full Name')}
          {field('patientEmail', 'Email Address', 'email')}
          {field('patientPhone', 'Phone Number', 'tel')}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <select
                value={form.dobMonth}
                onChange={(e) => {
                  setForm((f) => ({ ...f, dobMonth: e.target.value }))
                  if (errors.dob) setErrors((err) => ({ ...err, dob: undefined }))
                }}
                className={`rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dob ? 'border-red-400' : 'border-gray-300'}`}
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i + 1)}>{m}</option>
                ))}
              </select>
              <select
                value={form.dobDay}
                onChange={(e) => {
                  setForm((f) => ({ ...f, dobDay: e.target.value }))
                  if (errors.dob) setErrors((err) => ({ ...err, dob: undefined }))
                }}
                className={`rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dob ? 'border-red-400' : 'border-gray-300'}`}
              >
                <option value="">Day</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={form.dobYear}
                onChange={(e) => {
                  setForm((f) => ({ ...f, dobYear: e.target.value }))
                  if (errors.dob) setErrors((err) => ({ ...err, dob: undefined }))
                }}
                className={`rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dob ? 'border-red-400' : 'border-gray-300'}`}
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {errors.dob && (
              <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
            )}
          </div>

          <div>
            <label htmlFor="reasonForVisit" className="block text-sm font-medium text-gray-700">
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            <select
              id="reasonForVisit"
              value={form.reasonForVisit}
              onChange={(e) => {
                setForm((f) => ({ ...f, reasonForVisit: e.target.value }))
                if (errors.reasonForVisit) setErrors((err) => ({ ...err, reasonForVisit: undefined }))
              }}
              className={`mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reasonForVisit ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">Select a reason…</option>
              {REASONS_FOR_VISIT.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.reasonForVisit && (
              <p className="mt-1 text-xs text-red-600">{errors.reasonForVisit}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={form.notes}
              maxLength={500}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe any symptoms, concerns, or relevant history…"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{form.notes.length}/500</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-blue-600 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {submitting ? 'Submitting…' : 'Confirm Booking'}
          </button>
        </form>
      </div>
      <Footer />
    </main>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading…</div>}>
      <ConfirmContent />
    </Suspense>
  )
}
