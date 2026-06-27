export default function WordCount({ original, summary }: { original: string; summary: string }) {
  const origWords = original.trim().split(/\s+/).filter(Boolean).length
  const sumWords = summary.trim().split(/\s+/).filter(Boolean).length
  if (!origWords || !sumWords) return null
  const reduction = Math.round((1 - sumWords / origWords) * 100)
  const pct = Math.min(100, Math.max(0, reduction))

  return (
    <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-500">{origWords.toLocaleString()} words → {sumWords.toLocaleString()} words</span>
        <span className="font-semibold text-teal-700">{pct}% shorter</span>
      </div>
      <div className="h-1.5 bg-teal-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-700"
          style={{ width: `${100 - pct}%` }}
        />
      </div>
    </div>
  )
}