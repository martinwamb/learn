const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:3b";

export async function callOllama(prompt: string, numPredict = 700): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      think: false,
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
