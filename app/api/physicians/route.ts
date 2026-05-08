import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const physicians = await prisma.physician.findMany({
      select: {
        id: true,
        name: true,
        specialty: true,
        bio: true,
        avatarInitials: true,
      },
    })
    return NextResponse.json(physicians)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch physicians' }, { status: 500 })
  }
}
