import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

// Takes an ordered list of WAV file paths, concatenates them into a single MP3
// using ffmpeg, saves to outputPath, cleans up temp WAV files.
export async function stitchToMp3(wavFiles: string[], outputPath: string): Promise<void> {
  if (wavFiles.length === 0) throw new Error("No WAV segments to stitch");

  // Write ffmpeg concat list
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "learn-stitch-"));
  const listPath = path.join(tmpDir, "concat.txt");
  const listContent = wavFiles.map((f) => `file '${f.replace(/'/g, "\\'")}'`).join("\n");
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
  for (const wav of wavFiles) {
    await fs.rm(path.dirname(wav), { recursive: true, force: true }).catch(() => {});
  }
}
