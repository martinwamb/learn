import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

// Dedicated venv, separate from the `port` project's internal venv (which happens to
// have edge-tts installed too, but that's a different app's path and could move).
const EDGE_TTS_BIN = process.env.EDGE_TTS_BIN ?? "/home/admin/edge-tts-venv/bin/edge-tts";

export const DEFAULT_NARRATOR_VOICE = "en-KE-AsiliaNeural";

// Generates an MP3 file for the given text using the edge-tts CLI (network-based
// Microsoft neural TTS -- no local model, no CPU load, unlike Ollama/Kokoro).
export async function generateSpeech(text: string, voice: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = ["-t", text, "-v", voice, "--write-media", outputPath];
    const proc = spawn(EDGE_TTS_BIN, args);
    let stderr = "";
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`edge-tts failed (exit ${code}): ${stderr}`));
    });
    proc.on("error", reject);
  });
}

export async function textToMp3(text: string, voice: string = DEFAULT_NARRATOR_VOICE): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "learn-edge-tts-"));
  const outputPath = path.join(tmpDir, "speech.mp3");
  await generateSpeech(text, voice, outputPath);
  return outputPath;
}
