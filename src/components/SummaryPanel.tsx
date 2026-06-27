import CopyButton from './CopyButton'
import WordCount from './WordCount'

const SummaryPanel = ({
  label,
  docText,
  summary,
  isStreaming,
}: {
  label?: string
  docText: string
  summary: string
  isStreaming: boolean
}) => {
    const formatted = summary
    .split("\n")
    .map((line, m) => {
      if (line.startsWith("## ")) return `<h2 key="${m}" class="font-display font-bold text-slate-900 text-xs mt-4 mb-1.5 first:mt-0 uppercase tracking-widest">${line.slice(3)}</h2>`
      if (line.startsWith("- ")) return `<div key="${m}" class="text-sm text-slate-600 pl-3 relative mb-1 leading-relaxed"><span class="absolute left-0 text-teal-400 font-bold">·</span>${line.slice(2)}</div>`
      if (line.startsWith("|")) return `<div key="${m}" class="font-mono text-xs text-slate-600 leading-relaxed">${line}</div>`
      if (line.trim() === "") return `<div key="${m}" class="h-2"></div>`
      return `<p key="${m}" class="text-sm text-slate-600 leading-relaxed mb-1.5">${line}</p>`
    })
    .join("")


  return (
    <div className={`flex-1 border rounded-xl bg-white overflow-hidden transition-all ${isStreaming ? "border-teal-200 shadow-lg shadow-teal-50/50" : summary ? "border-slate-200 shadow-sm" : "border-dashed border-slate-200"}`}>
      {label && (
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
          {isStreaming && <span className="flex items-center gap-1 text-[11px] font-medium text-teal-600"><span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />Summarising…</span>}
          {summary && !isStreaming && <CopyButton text={summary} />}
        </div>
      )}
      <div className="p-4 min-h-[100px]">
        {summary ? (
          <>
            <div className={isStreaming ? "cursor-blink" : ""} dangerouslySetInnerHTML={{ __html: formatted }} />
            {!isStreaming && docText && <WordCount original={docText} summary={summary} />}
          </>
        ) : (
          <p className="text-sm text-slate-300 italic">{isStreaming ? "" : "Summary will appear here…"}</p>
        )}
      </div>
    </div>
  )
}

export default SummaryPanel
