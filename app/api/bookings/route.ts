import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { REASONS_FOR_VISIT } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const bookings = await prisma.booking.findMany({
      where: status ? { status } : undefined,
      include: {
        physician: {
          select: { id: true, name: true, specialty: true, bio: true, avatarInitials: true },
        },
        slot: true,
      },
      orderBy: [{ slot: { date: 'asc' } }, { slot: { time: 'asc' } }],
    })

    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const {
      physicianId,
      slotId,
      patientName,
      patientEmail,
      patientPhone,
      dateOfBirth,
      reasonForVisit,
      notes,
    } = body

    if (
      !physicianId || !slotId || !patientName || !patientEmail ||
      !patientPhone || !dateOfBirth || !reasonForVisit
    ) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    if (typeof patientEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (!REASONS_FOR_VISIT.includes(reasonForVisit as typeof REASONS_FOR_VISIT[number])) {
      return NextResponse.json({ error: 'Invalid reason for visit' }, { status: 400 })
    }

    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId as string },
      })

      if (!slot) {
        throw new Error('NOT_FOUND')
      }

      if (slot.isBooked) {
        throw new Error('SLOT_TAKEN')
      }

      await tx.availabilitySlot.update({
        where: { id: slotId as string },
        data: { isBooked: true },
      })

      return tx.booking.create({
        data: {
          physicianId: physicianId as string,
          slotId: slotId as string,
          patientName: patientName as string,
          patientEmail: patientEmail as string,
          patientPhone: patientPhone as string,
          dateOfBirth: dateOfBirth as string,
          reasonForVisit: reasonForVisit as string,
          notes: notes as string | undefined,
          status: 'pending',
        },
        include: {
          physician: {
            select: { id: true, name: true, specialty: true, bio: true, avatarInitials: true },
          },
          slot: true,
        },
      })
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'SLOT_TAKEN') {
        return NextResponse.json(
          { error: 'This time slot has already been booked. Please choose another.' },
          { status: 400 }
        )
      }
      if (err.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
      }
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
