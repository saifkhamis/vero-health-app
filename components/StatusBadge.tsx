import type { BookingStatus } from '@/lib/types'

const styles: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-700',
}

export default function StatusBadge({ status }: { status: string }) {
  const normalized = status as BookingStatus
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[normalized] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}
