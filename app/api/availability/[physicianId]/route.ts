import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { GroupedSlots } from '@/lib/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: { physicianId: string } }
) {
  try {
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        physicianId: params.physicianId,
        isBooked: false,
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      select: { id: true, date: true, time: true },
    })

    const grouped: GroupedSlots[] = []
    for (const slot of slots) {
      const existing = grouped.find((g) => g.date === slot.date)
      if (existing) {
        existing.slots.push({ id: slot.id, time: slot.time })
      } else {
        grouped.push({ date: slot.date, slots: [{ id: slot.id, time: slot.time }] })
      }
    }

    return NextResponse.json(grouped)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
