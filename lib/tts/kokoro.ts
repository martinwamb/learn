import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import type { KokoroVoice } from "./voice-map";

// Use venv python when available (server), fall back to system python3
const PYTHON_BIN = process.env.KOKORO_PYTHON ?? "/home/admin/kokoro-venv/bin/python3";

// Generates a WAV file for the given text using the Kokoro Python CLI.
// Returns the path to the WAV file, or throws on failure.
export async function generateSegment(
  text: string,
  voice: KokoroVoice,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Kokoro 0.9.x CLI flags: -t text, -m voice, -o output_file
    const args = [
      "-m", "kokoro",
      "-t", text,
      "-m", voice,
      "-o", outputPath,
    ];
    const proc = spawn(PYTHON_BIN, args);
    let stderr = "";
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Kokoro failed (exit ${code}): ${stderr}`));
    });
    proc.on("error", reject);
  });
}

// Generate audio for a single text block, returns path to WAV file in OS temp dir
export async function textToWav(text: string, voice: KokoroVoice, index: number): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "learn-tts-"));
  const outputPath = path.join(tmpDir, `seg_${index}.wav`);
  await generateSegment(text, voice, outputPath);
  return outputPath;
}

export { PYTHON_BIN };
