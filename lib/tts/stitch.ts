import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

// Takes an ordered list of audio segment file paths (any format ffmpeg can decode
// -- MP3 segments from edge-tts, previously WAV from Kokoro), concatenates them
// into a single MP3 using ffmpeg, saves to outputPath, cleans up temp files.
export async function stitchToMp3(segmentFiles: string[], outputPath: string): Promise<void> {
  if (segmentFiles.length === 0) throw new Error("No audio segments to stitch");

  // Write ffmpeg concat list
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "learn-stitch-"));
  const listPath = path.join(tmpDir, "concat.txt");
  const listContent = segmentFiles.map((f) => `file '${f.replace(/'/g, "\\'")}'`).join("\n");
  await fs.writeFile(listPath, listContent, "utf8");

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-y",           // overwrite output
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-q:a", "2",    // VBR quality (0 best, 9 worst)
      "-ar", "22050", // sample rate appropriate for speech
      outputPath,
    ]);
    let stderr = "";
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg stitch failed (exit ${code}): ${stderr.slice(-500)}`));
    });
    proc.on("error", reject);
  });

  // Clean up temp files
  await fs.rm(tmpDir, { recursive: true, force: true });
  for (const segment of segmentFiles) {
    await fs.rm(path.dirname(segment), { recursive: true, force: true }).catch(() => {});
  }
}
