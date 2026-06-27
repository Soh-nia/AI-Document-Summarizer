/**
 * Summ — AI Document Summariser & Comparison Tool
 *
 * Design direction: Crisp, editorial. Teal accent on white.
 * Two modes: Single (summarise one doc) and Compare (two docs side by side).
 * Signature element: the live word-count reduction bar showing % compression.
 */

import { useState, useRef, useCallback } from "react"
import { FileText, GitCompare, RotateCcw, AlertCircle, ArrowRight, Layers } from "lucide-react"
import Header from "./components/Header"
import { streamFromGemini } from "./lib/gemini"
import SummaryPanel from "./components/SummaryPanel"
import CopyButton from "./components/CopyButton"

type Mode = "single" | "compare"
type Status = "idle" | "streaming" | "streaming-a" | "streaming-b" | "done" | "error"

interface DocState {
  text: string
  summary: string
}

const SUMMARY_SYSTEM = `You are an expert at extracting signal from text. You produce clear, structured summaries that save readers time without losing important meaning.

Format every summary exactly like this:

## TL;DR
One sentence. The single most important thing in this document.

## Key Points
- Point one
- Point two  
- Point three (3–6 bullets, each under 15 words)

## Details
2–3 short paragraphs covering the substance. Be specific — names, numbers, dates matter.

## Action Items (if any)
- Any clear next steps or decisions mentioned in the document

Never hallucinate. If something isn't in the document, don't include it. Keep the TL;DR to one sentence.`

const COMPARE_SYSTEM = `You are an expert analyst comparing two documents. You identify meaningful similarities and differences — not surface-level ones.

Structure your comparison exactly like this:

## What They Agree On
- Point of agreement 1
- Point of agreement 2

## Key Differences
| Topic | Document A | Document B |
|-------|-----------|-----------|
| Topic 1 | Position A | Position B |
| Topic 2 | Position A | Position B |

## Which Is More [Complete / Recent / Detailed]
A short paragraph assessing the documents' relative strengths.

## Bottom Line
One paragraph: what does someone reading both documents need to know?

Be analytical. Your job is to save the reader from reading both documents.`





export default function App() {
  const [mode, setMode] = useState<Mode>("single")
  const [docA, setDocA] = useState<DocState>({ text: "", summary: "" })
  const [docB, setDocB] = useState<DocState>({ text: "", summary: "" })
  const [comparison, setComparison] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")
  const stopRef = useRef<(() => void) | null>(null)

  const handleSingle = useCallback(async () => {
    if (!docA.text.trim()) return
    setDocA((p) => ({ ...p, summary: "" }))
    setError("")
    setStatus("streaming")
    const stop = await streamFromGemini({
      system: SUMMARY_SYSTEM,
      userMessage: `Please summarise this document:\n\n${docA.text}`,
      onChunk: (t) => setDocA((p) => ({ ...p, summary: p.summary + t })),
      onComplete: () => setStatus("done"),
      onError: (msg) => { setError(msg); setStatus("error") },
      maxTokens: 1500,
    })
    stopRef.current = stop
  }, [docA.text])

  const handleCompare = useCallback(async () => {
    if (!docA.text.trim() || !docB.text.trim()) return
    setDocA((p) => ({ ...p, summary: "" }))
    setDocB((p) => ({ ...p, summary: "" }))
    setComparison("")
    setError("")
    setStatus("streaming-a")

    const userA = `Please summarise this document:\n\n${docA.text}`
    const userB = `Please summarise this document:\n\n${docB.text}`

    // Summarise A
    const stopA = await streamFromGemini({
      system: SUMMARY_SYSTEM,
      userMessage: userA,
      onChunk: (t) => setDocA((p) => ({ ...p, summary: p.summary + t })),
      onComplete: async () => {
        setStatus("streaming-b")
        // Summarise B
        const stopB = await streamFromGemini({
          system: SUMMARY_SYSTEM,
          userMessage: userB,
          onChunk: (t) => setDocB((p) => ({ ...p, summary: p.summary + t })),
          onComplete: async () => {
            setStatus("streaming")
            // Compare both
            const stopC = await streamFromGemini({
              system: COMPARE_SYSTEM,
              userMessage: `Document A:\n${docA.text}\n\n---\n\nDocument B:\n${docB.text}`,
              onChunk: (t) => setComparison((p) => p + t),
              onComplete: () => setStatus("done"),
              onError: (msg) => { setError(msg); setStatus("error") },
              maxTokens: 1500,
            })
            stopRef.current = stopC
          },
          onError: (msg) => { setError(msg); setStatus("error") },
          maxTokens: 1500,
        })
        stopRef.current = stopB
      },
      onError: (msg) => { setError(msg); setStatus("error") },
      maxTokens: 1500,
    })
    stopRef.current = stopA
  }, [docA.text, docB.text])

  const reset = () => {
    stopRef.current?.()
    setDocA({ text: "", summary: "" })
    setDocB({ text: "", summary: "" })
    setComparison("")
    setStatus("idle")
    setError("")
  }

  const isStreaming = status === "streaming" || status === "streaming-a" || status === "streaming-b"
  const canRun = mode === "single" ? docA.text.trim().length > 50 : docA.text.trim().length > 50 && docB.text.trim().length > 50

  return (
    <div className="min-h-screen bg-slate-25">
      {/* Header */}
      <Header />

      {/* Hero */}
      <div className="px-4 bg-green inverted overflow-hidden">
        <div className="container d-flex flex-column py-8 py-xl-12 min-vh-100 level-1">
          <div className="row my-auto justify-content-center align-items-center">
            <div className="col-md-8 col-lg-5 d-none d-md-block position-relative order-lg-2 mb-5 mb-lg-0" data-aos="fade-up">
              <figure className="equal-1-1 rounded-circle" 
              style={{ backgroundImage: "url('./src/assets/images/course-1.jpg')" }}
              >
              </figure>
              <img className="position-absolute bottom-0 end-0 rotate" src="./src/assets/images/svg/featured-light.svg" alt="" />
            </div>
            <div className="col-lg-7 text-center text-lg-start">
              <h1 className="display-2" style={{ fontFamily: "'Transforma Mix', 'Playfair Display', Georgia, serif" }}>
                {mode === "single" ? (
                  <><span className="fw-bold">Read Less</span> &mdash; Understand More.</>
                ) : (
                  <><span className="fw-bold">Compare two documents.</span> &mdash; Get the difference.</>
                )}
              </h1>
              <span className="px-1 eyebrow text-muted my-2">
                {mode === "single"
              ? "Paste any text — articles, reports, contracts, research papers. Get a structured summary in seconds."
              : "Paste two documents. Get individual summaries plus a head-to-head comparison of what's similar, different, and what matters."}
              </span>

              <div className="row justify-content-center justify-content-lg-start g-1">
                {(["single", "compare"] as Mode[]).map((m) => (
                  <div key={m} className="col-auto">
                  <button
                    onClick={() => { reset(); setMode(m) }}
                    className={`d-flex gap-1 btn rounded-pill ${mode === m ? "btn-white" : "btn-outline-white"}`}
                  >
                    {m === "single" ? <FileText size={16} /> : <GitCompare size={16} />}
                    {m === "single" ? "Summarise" : "Compare"}
                  </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <figure className="background">
          <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle data-aos="fade-up" data-aos-delay="150" cx="125%" cy="-25%" r="35%" fill="white" fillOpacity=".05"
              data-top-top="@cy: -25%; @cx: 115%;" data-top-bottom="@cy: 0%; @cx: 105%;" />
            <circle data-aos="fade-up" data-aos-delay="300" cx="90%" cy="125%" r="75%" fill="black" fillOpacity=".1"
              data-center-top="@r: 75%;" data-top-bottom="@r: 85%;" />
            <circle data-aos="fade-up" data-aos-delay="450" cx="5%" cy="125%" r="50%" stroke="black" strokeOpacity=".2"
              data-center-top="@r: 50%;" data-center-bottom="@r: 70%;" />
          </svg>
        </figure>
      </div>

      <main id="main" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Input area */}
        <div className={`row g-3 g-xl-5`}>
          {/* Doc A */}
          <div className={`${mode === "compare" ? "col-lg-6" : "col-lg-12"}`}>
            <div className="card bg-opaque-white" data-aos="fade-up">
              <div className="card-body bg-white">
                <h3 className="fs-5 mt-3" style={{ fontFamily: "'Transforma Mix', 'Playfair Display', Georgia, serif" }}>
                  {mode === "compare" ? "Document A" : "Your Document"}
                </h3>
                <p className="text-secondary my-2">
                  {docA.text.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words
                </p>
                <textarea
                  value={docA.text}
                  onChange={(e) => setDocA((p) => ({ ...p, text: e.target.value }))}
                  placeholder="Paste your document here…"
                  className="border rounded-xl w-full px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none resize-none min-h-[200px]"
                  disabled={isStreaming}
                />
              </div>
            </div>
          </div>

          {/* Doc B */}
          {mode === "compare" && (
            <div className={`col-lg-6`}>
              <div className="card bg-opaque-white" data-aos="fade-up">
                <div className="card-body bg-white">
                  <h3 className="fs-5 mt-3 mb-1" style={{ fontFamily: "'Transforma Mix', 'Playfair Display', Georgia, serif" }}>Document B</h3>
                  <p className="text-secondary mb-2">{docB.text.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words</p>
                  <textarea
                    value={docB.text}
                    onChange={(e) => setDocB((p) => ({ ...p, text: e.target.value }))}
                    placeholder="Paste second document here…"
                    className="border rounded-xl w-full px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none resize-none min-h-[200px]"
                    disabled={isStreaming}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={mode === "single" ? handleSingle : handleCompare}
            disabled={!canRun || isStreaming}
            className="disabled:opacity-40 disabled:cursor-not-allowed btn btn-outline-green rounded-pill"
          >
            {isStreaming ? (
              status === "streaming-a" ? "Summarising A…" : status === "streaming-b" ? "Summarising B…" : "Comparing…"
            ) : mode === "single" ? "Summarise" : "Summarise & Compare"}
          </button>
          {(docA.summary || docB.summary || comparison) && (
            <button onClick={reset} className="flex items-center gap-1.5 btn btn-outline-green rounded-pill">
              <RotateCcw size={14} />
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Summaries */}
        {(docA.summary || status === "streaming" || status === "streaming-a") && (
          <div className={`flex gap-5 animate-fade-in ${mode === "compare" ? "flex-col sm:flex-row" : ""}`}>
            <SummaryPanel
              label={mode === "compare" ? "Summary A" : undefined}
              docText={docA.text}
              summary={docA.summary}
              isStreaming={status === "streaming" || status === "streaming-a"}
            />
            {mode === "compare" && (docB.summary || status === "streaming-b") && (
              <SummaryPanel
                label="Summary B"
                docText={docB.text}
                summary={docB.summary}
                isStreaming={status === "streaming-b"}
              />
            )}
          </div>
        )}

        {/* Comparison */}
        {comparison && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-teal-500" />
                <span className="text-sm font-semibold text-slate-800">Comparison Analysis</span>
                {status === "streaming" && !docA.summary.includes("Action Items") && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-teal-600">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                    Comparing…
                  </span>
                )}
              </div>
              {status === "done" && <CopyButton text={comparison} />}
            </div>
            <div className="p-4">
              <SummaryPanel
                docText=""
                summary={comparison}
                isStreaming={status === "streaming" && !docA.summary}
              />
            </div>
          </div>
        )}

        {status === "done" && mode === "compare" && (
          <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 animate-slide-up">
            <ArrowRight size={14} />
            All done — individual summaries and comparison analysis are ready.
          </div>
        )}
      </main>
    </div>
  )
}
