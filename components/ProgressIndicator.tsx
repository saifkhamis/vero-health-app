export default function ProgressIndicator({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              s === step
                ? 'bg-blue-600 text-white'
                : s < step
                ? 'bg-blue-100 text-blue-600'
                : 'bg-[#F5F4F1] text-gray-400'
            }`}
          >
            {s < step ? '✓' : s}
          </div>
          {s < total && (
            <div className={`h-0.5 w-8 ${s < step ? 'bg-blue-300' : 'bg-[#E7E5E0]'}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm text-gray-500">
        Step {step} of {total}
      </span>
    </div>
  )
}
