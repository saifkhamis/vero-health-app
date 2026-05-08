import type { GroupedSlots } from '@/lib/types'

function formatDateHeader(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

interface SlotPickerProps {
  groups: GroupedSlots[]
  selectedSlotId: string | null
  onSelect: (slotId: string, date: string, time: string) => void
}

export default function SlotPicker({ groups, selectedSlotId, onSelect }: SlotPickerProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] p-10 text-center">
        <p className="text-lg font-medium text-gray-700">No availability</p>
        <p className="mt-1 text-sm text-gray-500">This physician has no open slots in the next 7 days.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {formatDateHeader(group.date)}
          </h3>
          <div className="flex flex-wrap gap-3">
            {group.slots.map((slot) => {
              const isSelected = slot.id === selectedSlotId
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelect(slot.id, group.date, slot.time)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-[#E7E5E0] bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {slot.time}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
