import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function addDays(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

async function main() {
  await prisma.booking.deleteMany()
  await prisma.availabilitySlot.deleteMany()
  await prisma.physician.deleteMany()

  const today = new Date()

  const [sarah, james, rachel, marcus] = await Promise.all([
    prisma.physician.create({
      data: {
        name: 'Dr. Sarah Chen',
        specialty: 'Family Medicine',
        bio: 'Board-certified family physician with 12 years of experience in preventive care and chronic disease management.',
        avatarInitials: 'SC',
      },
    }),
    prisma.physician.create({
      data: {
        name: 'Dr. James Okafor',
        specialty: 'Internal Medicine',
        bio: 'Specialist in adult medicine with a focus on complex diagnoses and evidence-based treatment planning.',
        avatarInitials: 'JO',
      },
    }),
    prisma.physician.create({
      data: {
        name: 'Dr. Rachel Kim',
        specialty: 'Pediatrics',
        bio: 'Compassionate pediatrician dedicated to the health and development of children from newborns to adolescents.',
        avatarInitials: 'RK',
      },
    }),
    prisma.physician.create({
      data: {
        name: 'Dr. Marcus Webb',
        specialty: 'Cardiology',
        bio: 'Interventional cardiologist with expertise in heart disease prevention, diagnostics, and minimally invasive procedures.',
        avatarInitials: 'MW',
      },
    }),
  ])

  // Sarah Chen slots: 4 slots, 2 booked
  const sarahSlots = await Promise.all([
    prisma.availabilitySlot.create({ data: { physicianId: sarah.id, date: addDays(today, 1), time: '9:00 AM', isBooked: true } }),
    prisma.availabilitySlot.create({ data: { physicianId: sarah.id, date: addDays(today, 1), time: '11:00 AM', isBooked: false } }),
    prisma.availabilitySlot.create({ data: { physicianId: sarah.id, date: addDays(today, 3), time: '2:00 PM', isBooked: true } }),
    prisma.availabilitySlot.create({ data: { physicianId: sarah.id, date: addDays(today, 5), time: '3:30 PM', isBooked: false } }),
  ])

  // James Okafor slots: 4 slots, 2 booked
  const jamesSlots = await Promise.all([
    prisma.availabilitySlot.create({ data: { physicianId: james.id, date: addDays(today, 1), time: '10:30 AM', isBooked: true } }),
    prisma.availabilitySlot.create({ data: { physicianId: james.id, date: addDays(today, 2), time: '9:00 AM', isBooked: false } }),
    prisma.availabilitySlot.create({ data: { physicianId: james.id, date: addDays(today, 4), time: '4:00 PM', isBooked: false } }),
    prisma.availabilitySlot.create({ data: { physicianId: james.id, date: addDays(today, 6), time: '2:00 PM', isBooked: true } }),
  ])

  // Rachel Kim slots: 3 slots, 2 booked
  const rachelSlots = await Promise.all([
    prisma.availabilitySlot.create({ data: { physicianId: rachel.id, date: addDays(today, 1), time: '9:00 AM', isBooked: false } }),
    prisma.availabilitySlot.create({ data: { physicianId: rachel.id, date: addDays(today, 2), time: '10:30 AM', isBooked: true } }),
    prisma.availabilitySlot.create({ data: { physicianId: rachel.id, date: addDays(today, 4), time: '3:30 PM', isBooked: true } }),
    prisma.availabilitySlot.create({ data: { physicianId: rachel.id, date: addDays(today, 7), time: '11:00 AM', isBooked: false } }),
  ])

  // Marcus Webb slots: 4 slots, 2 booked
  const marcusSlots = await Promise.all([
    prisma.availabilitySlot.create({ data: { physicianId: marcus.id, date: addDays(today, 2), time: '9:00 AM', isBooked: true } }),
    prisma.availabilitySlot.create({ data: { physicianId: marcus.id, date: addDays(today, 3), time: '11:00 AM', isBooked: false } }),
    prisma.availabilitySlot.create({ data: { physicianId: marcus.id, date: addDays(today, 5), time: '2:00 PM', isBooked: false } }),
    prisma.availabilitySlot.create({ data: { physicianId: marcus.id, date: addDays(today, 7), time: '4:00 PM', isBooked: true } }),
  ])

  // 5 pre-existing bookings: 2 confirmed, 2 pending, 1 cancelled
  await prisma.booking.create({
    data: {
      physicianId: sarah.id,
      slotId: sarahSlots[0].id,
      patientName: 'Emily Rodriguez',
      patientEmail: 'emily.rodriguez@email.com',
      patientPhone: '555-201-4832',
      dateOfBirth: '1989-06-15',
      reasonForVisit: 'Annual Physical / Wellness Exam',
      notes: 'First visit in two years. Would like full bloodwork panel.',
      status: 'confirmed',
    },
  })

  await prisma.booking.create({
    data: {
      physicianId: james.id,
      slotId: jamesSlots[0].id,
      patientName: 'Michael Torres',
      patientEmail: 'michael.torres@email.com',
      patientPhone: '555-307-9124',
      dateOfBirth: '1975-11-03',
      reasonForVisit: 'Chronic Condition Management',
      notes: 'Follow-up on hypertension management.',
      status: 'confirmed',
    },
  })

  await prisma.booking.create({
    data: {
      physicianId: rachel.id,
      slotId: rachelSlots[1].id,
      patientName: 'Priya Sharma',
      patientEmail: 'priya.sharma@email.com',
      patientPhone: '555-418-6073',
      dateOfBirth: '2018-03-22',
      reasonForVisit: 'New Symptom / Illness',
      notes: 'Child has had a fever for three days.',
      status: 'pending',
    },
  })

  await prisma.booking.create({
    data: {
      physicianId: marcus.id,
      slotId: marcusSlots[0].id,
      patientName: 'David Nguyen',
      patientEmail: 'david.nguyen@email.com',
      patientPhone: '555-523-8841',
      dateOfBirth: '1962-08-09',
      reasonForVisit: 'Lab Results Review',
      notes: 'Echocardiogram results from last week.',
      status: 'pending',
    },
  })

  await prisma.booking.create({
    data: {
      physicianId: sarah.id,
      slotId: sarahSlots[2].id,
      patientName: 'Amanda Foster',
      patientEmail: 'amanda.foster@email.com',
      patientPhone: '555-634-2295',
      dateOfBirth: '1994-01-30',
      reasonForVisit: 'Prescription Refill',
      status: 'cancelled',
    },
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
