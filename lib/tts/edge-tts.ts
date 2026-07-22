import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

// Dedicated venv, separate from the `port` project's internal venv (which happens to
// have edge-tts installed too, but that's a different app's path and could move).
const EDGE_TTS_BIN = process.env.EDGE_TTS_BIN ?? "/home/admin/edge-tts-venv/bin/edge-tts";

export const DEFAULT_NARRATOR_VOICE = "en-KE-AsiliaNeural";
// Microsoft's default speaking rate reads a bit fast for 4-6 year olds -- the old,
// removed browser speechSynthesis code explicitly used rate=0.88 (~12% slower).
export const DEFAULT_NARRATOR_RATE = "-10%";

// Generates an MP3 file for the given text using the edge-tts CLI (network-based
// Microsoft neural TTS -- no local model, no CPU load, unlike Ollama/Kokoro).
export async function generateSpeech(
  text: string,
  voice: string,
  outputPath: string,
  rate: string = DEFAULT_NARRATOR_RATE
): Promise<void> {
  return new Promise((resolve, reject) => {
    // --rate must be a single "--rate=-10%" token, not two separate argv entries --
    // argparse doesn't recognize "-10%" as a negative-number value (only "-10" would
    // match its negative-number heuristic) and instead errors as an unrecognized option.
    const args = ["-t", text, "-v", voice, `--rate=${rate}`, "--write-media", outputPath];
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

// Generate audio for one segment of a multi-segment narration (e.g. a story
// stitched together from several character/narrator lines), returns the path to
// the MP3 file in a fresh OS temp dir. Mirrors the old Kokoro textToWav(text,
// voice, index) shape so callers that loop over segments don't need to change.
export async function textToMp3Segment(text: string, voice: string, index: number): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "learn-tts-"));
  const outputPath = path.join(tmpDir, `seg_${index}.mp3`);
  await generateSpeech(text, voice, outputPath);
  return outputPath;
}
