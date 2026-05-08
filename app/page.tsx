import Link from 'next/link'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <nav className="border-b border-[#E7E5E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-bold text-blue-600">Vero Health</span>
        </div>
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-[#F5F4F1] to-white px-6 py-28 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            Patient Booking Portal
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Vero Health
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Simple, fast appointment booking for patients and care teams.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/book"
              className="w-full rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Book an Appointment
            </Link>
            <Link
              href="/admin"
              className="w-full rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 sm:w-auto"
            >
              Admin View
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E7E5E0] bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-0 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Choose a physician',
                desc: 'Browse our network of board-certified providers and select the right fit for your needs.',
              },
              {
                step: '2',
                title: 'Pick a time',
                desc: 'View real-time availability and select a slot that works with your schedule.',
              },
              {
                step: '3',
                title: 'Confirm your details',
                desc: 'Fill out a brief intake form and submit — your care team will confirm within 24 hours.',
              },
            ].map(({ step, title, desc }, i) => (
              <div
                key={step}
                className={`flex flex-col items-center px-8 py-8 text-center ${i < 2 ? 'sm:border-r sm:border-[#E7E5E0]' : ''}`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="font-semibold text-[#1C1917]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
