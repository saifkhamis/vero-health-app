import Link from 'next/link'
import type { Physician } from '@/lib/types'

const avatarColors: Record<string, string> = {
  SC: 'bg-blue-100 text-blue-700',
  JO: 'bg-green-100 text-green-700',
  RK: 'bg-amber-100 text-amber-700',
  MW: 'bg-rose-100 text-rose-700',
}

export default function PhysicianCard({ physician }: { physician: Physician }) {
  const color = avatarColors[physician.avatarInitials] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="flex flex-col rounded-xl border border-[#E7E5E0] bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${color}`}>
          {physician.avatarInitials}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1C1917]">{physician.name}</h3>
          <p className="text-sm text-blue-600 font-medium">{physician.specialty}</p>
        </div>
      </div>
      <p className="mt-4 flex-1 text-sm text-[#57534E] leading-relaxed">{physician.bio}</p>
      <div className="mt-6 flex justify-end">
        <Link
          href={`/book/${physician.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Select →
        </Link>
      </div>
    </div>
  )
}
