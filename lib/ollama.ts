const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:3b";

interface CallOllamaOptions {
  model?: string; // defaults to OLLAMA_MODEL (qwen2.5:3b) -- override for callers needing a different model
  think?: boolean; // defaults to false. Thinking models (e.g. qwen3) reason before answering,
  // which costs real latency but reliably completes multi-step narrative tasks that
  // qwen2.5:3b was confirmed (live, on two different Bible stories) to cut short.
}

export async function callOllama(prompt: string, numPredict = 700, opts: CallOllamaOptions = {}): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model ?? OLLAMA_MODEL,
      prompt,
      stream: false,
      think: opts.think ?? false,
      options: { temperature: 0.7, num_predict: numPredict },
    }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  return data.response as string;
}

// Find first { or [ and matching last } or ] to extract JSON even if the model adds
// extra text around it -- small models don't reliably respond with ONLY the JSON
// despite being asked to.
export function extractJson<T>(raw: string): T | null {
  const objStart = raw.indexOf("{");
  const arrStart = raw.indexOf("[");
  const starts = [objStart, arrStart].filter((i) => i !== -1);
  if (starts.length === 0) return null;
  const start = Math.min(...starts);
  const closer = raw[start] === "[" ? "]" : "}";
  const end = raw.lastIndexOf(closer);
  if (end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
