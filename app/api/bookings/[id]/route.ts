import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { BookingStatus } from '@/lib/types'

const VALID_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'cancelled']

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['cancelled'],
  cancelled: [],
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json() as { status?: string }
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status as BookingStatus)) {
      return NextResponse.json(
        { error: 'status must be one of: confirmed, cancelled' },
        { status: 400 }
      )
    }

    const existing = await prisma.booking.findUnique({ where: { id: params.id } })

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const allowed = VALID_TRANSITIONS[existing.status as BookingStatus]
    if (!allowed.includes(status as BookingStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${existing.status} to ${status}` },
        { status: 400 }
      )
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        physician: {
          select: { id: true, name: true, specialty: true, bio: true, avatarInitials: true },
        },
        slot: true,
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
