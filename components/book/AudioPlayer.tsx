"use client";

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  audioPath: string;
  title: string;
}

export default function AudioPlayer({ audioPath, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Number(e.target.value);
    setProgress(Number(e.target.value));
  }

  function changeSpeed(s: number) {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
      <audio ref={audioRef} src={audioPath} preload="metadata" />

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={togglePlay}
          className="bg-white text-purple-600 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶️"}
        </button>
        <div>
          <p className="font-bold text-lg leading-tight">{title}</p>
          <p className="text-purple-200 text-sm">Read Aloud Story</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.5}
          value={progress}
          onChange={handleSeek}
          className="w-full accent-white"
          aria-label="Audio progress"
        />
        <div className="flex justify-between text-xs text-purple-200 mt-1">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Speed controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-purple-200">Speed:</span>
        {[0.75, 1, 1.25, 1.5].map((s) => (
          <button
            key={s}
            onClick={() => changeSpeed(s)}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              speed === s ? "bg-white text-purple-700 font-bold" : "bg-purple-500 text-white hover:bg-purple-400"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
