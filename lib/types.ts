export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export const REASONS_FOR_VISIT = [
  'Annual Physical / Wellness Exam',
  'Follow-up Appointment',
  'New Symptom / Illness',
  'Chronic Condition Management',
  'Prescription Refill',
  'Lab Results Review',
  'Mental Health Consultation',
  'Referral / Second Opinion',
  'Other',
] as const

export type ReasonForVisit = (typeof REASONS_FOR_VISIT)[number]

export interface Physician {
  id: string
  name: string
  specialty: string
  bio: string
  avatarInitials: string
}

export interface AvailabilitySlot {
  id: string
  physicianId: string
  date: string
  time: string
  isBooked: boolean
}

export interface Booking {
  id: string
  physicianId: string
  slotId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  dateOfBirth: string
  reasonForVisit: string
  notes: string | null
  status: BookingStatus
  createdAt: string
  physician: Physician
  slot: AvailabilitySlot
}

export interface GroupedSlots {
  date: string
  slots: { id: string; time: string }[]
}
