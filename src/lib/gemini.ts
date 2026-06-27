/**
 * lib/gemini.ts
 *
 * Gemini streaming client for the Document Summariser app.
 * Uses the OpenAI-compatible endpoint so the streaming mechanics
 * are identical to what you built before — same SSE pattern,
 * same [DONE] end signal, same choices[0].delta.content token path.
 *
 * WHY OPENAI-COMPAT INSTEAD OF NATIVE GEMINI?
 * ─────────────────────────────────────────────
 * The native Gemini endpoint uses a different SSE format:
 *   candidates[0].content.parts[0].text
 * The OpenAI-compat endpoint uses the same format as GPT:
 *   choices[0].delta.content
 * Since you already understand the OpenAI SSE format from the
 * MultiAI chat app, using the compat endpoint means zero new
 * parsing logic.
 *
 * ENDPOINT:
 *   generativelanguage.googleapis.com/v1beta/openai/chat/completions
 * AUTH:
 *   Authorization: Bearer YOUR_GEMINI_KEY  (same as OpenAI Bearer pattern)
 */

const GEMINI_COMPAT_URL =
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

export interface StreamOptions {
    system: string
    userMessage: string
    onChunk: (token: string) => void
    onComplete: () => void
    onError: (error: string) => void
    maxTokens?: number
    model?: string
}

export async function streamFromGemini({
    system,
    userMessage,
    onChunk,
    onComplete,
    onError,
    maxTokens = 2048,
    model = "gemini-2.5-flash",
}: StreamOptions): Promise<() => void> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

    if (!apiKey) {
        onError("No Gemini API key found. Add VITE_GEMINI_API_KEY to your .env.local file.")
        return () => { }
    }

    const controller = new AbortController()

        ; (async () => {
            try {
                const response = await fetch(GEMINI_COMPAT_URL, {
                    method: "POST",
                    signal: controller.signal,
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model,
                        max_tokens: maxTokens,
                        messages: [
                            { role: "system", content: system },
                            { role: "user", content: userMessage },
                        ],
                        stream: true,
                    }),
                })

                if (!response.ok) {
                    const err = await response.json().catch(() => ({})) as { error?: { message?: string } }
                    onError(err.error?.message ?? `Gemini API error ${response.status}`)
                    return
                }

                const reader = response.body!.getReader()
                const decoder = new TextDecoder()
                let buffer = ""

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split("\n")
                    buffer = lines.pop() ?? ""

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue
                        const raw = line.slice(6).trim()
                        if (!raw) continue
                        // OpenAI-compat end signal — must check BEFORE JSON.parse
                        if (raw === "[DONE]") {
                            onComplete()
                            return
                        }
                        try {
                            const obj = JSON.parse(raw) as {
                                choices?: Array<{ delta?: { content?: string } }>
                            }
                            const token = obj.choices?.[0]?.delta?.content
                            if (token) onChunk(token)
                        } catch { /* skip malformed chunks */ }
                    }
                }
                onComplete()
            } catch (err) {
                if ((err as Error).name === "AbortError") return
                onError((err as Error).message)
            }
        })()

    return () => controller.abort()
}