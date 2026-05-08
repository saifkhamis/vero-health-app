import Link from 'next/link'
import PhysicianCard from '@/components/PhysicianCard'
import ProgressIndicator from '@/components/ProgressIndicator'
import Footer from '@/components/Footer'
import type { Physician } from '@/lib/types'

async function getPhysicians(): Promise<Physician[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/physicians`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch physicians')
  return res.json()
}

export default async function BookPage() {
  let physicians: Physician[] = []
  let error = ''

  try {
    physicians = await getPhysicians()
  } catch {
    error = 'Unable to load physicians. Please try again later.'
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <nav className="border-b border-[#E7E5E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-600">Vero Health</Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Home</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <ProgressIndicator step={1} />
        </div>

        <h1 className="text-2xl font-bold text-[#1C1917]">Choose your physician</h1>
        <p className="mt-1 text-sm text-gray-500">Select a provider to see their available appointment times.</p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {physicians.map((physician) => (
              <PhysicianCard key={physician.id} physician={physician} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
