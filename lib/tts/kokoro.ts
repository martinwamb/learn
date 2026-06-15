import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import type { KokoroVoice } from "./voice-map";

const KOKORO_SCRIPT = process.env.KOKORO_SCRIPT_PATH ?? "kokoro";

// Generates a WAV file for the given text using the Kokoro Python CLI.
// Returns the path to the WAV file, or throws on failure.
export async function generateSegment(
  text: string,
  voice: KokoroVoice,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Kokoro CLI: python -m kokoro --text "..." --voice af_heart --output /tmp/seg.wav
    // Or if kokoro is installed as a script: kokoro --text "..." ...
    const args = [
      "-m", "kokoro",
      "--text", text,
      "--voice", voice,
      "--output", outputPath,
    ];
    const proc = spawn("python3", args);
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

export { KOKORO_SCRIPT };
