import { buildCharacterMap, type CharacterVoiceMap, type KokoroVoice, NARRATOR_VOICE } from "./voice-map";

export interface TextSegment {
  type: "narration" | "dialogue";
  text: string;
  character?: string;
  voice: KokoroVoice;
}

// Patterns to identify dialogue and its speaker
const DIALOGUE_PATTERNS = [
  // "text," said Character  OR  "text," Character said
  /[""]([^""]+)[""][,.]?\s+(?:said|asked|cried|shouted|whispered|replied|called|exclaimed|muttered|growled|laughed)\s+([A-Z][a-zA-Z\s]+?)(?=[.,!?]|$)/g,
  // Character said "text"
  /([A-Z][a-zA-Z\s]+?)\s+(?:said|asked|cried|shouted|whispered|replied|called|exclaimed|muttered|growled|laughed)[,:]?\s+[""]([^""]+)[""]/g,
];

function extractCharacters(text: string): string[] {
  const chars = new Set<string>();

  // Pattern 1: "text" said Character
  const p1 = /[""][^""]+[""][,.]?\s+(?:said|asked|cried|shouted|whispered|replied|called|exclaimed|muttered|growled|laughed)\s+([A-Z][a-zA-Z\s]{1,20}?)(?=[.,!?\n]|$)/g;
  let m: RegExpExecArray | null;
  while ((m = p1.exec(text)) !== null) {
    const name = m[1].trim().replace(/\s+/g, " ");
    if (name && name.length > 1) chars.add(name);
  }

  // Pattern 2: Character said "text"
  const p2 = /([A-Z][a-zA-Z\s]{1,20}?)\s+(?:said|asked|cried|shouted|whispered|replied|called|exclaimed|muttered|growled|laughed)[,:]/g;
  while ((m = p2.exec(text)) !== null) {
    const name = m[1].trim().replace(/\s+/g, " ");
    if (name && name.length > 1 && !["The", "A", "An", "She", "He", "It", "They"].includes(name)) {
      chars.add(name);
    }
  }

  return [...chars];
}

export function parseStoryText(text: string): { segments: TextSegment[]; voiceMap: CharacterVoiceMap } {
  const characters = extractCharacters(text);
  const voiceMap = buildCharacterMap(characters);

  const segments: TextSegment[] = [];

  // Split text into lines, then process each line for dialogue/narration
  const lines = text.split(/\n+/).filter((l) => l.trim());

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this line contains dialogue using the simpler quote detection
    const quoteMatch = trimmed.match(/[""]([^""]+)[""]/);

    if (quoteMatch) {
      // Find the speaker for this line
      let speaker: string | null = null;
      for (const char of characters) {
        if (trimmed.includes(char)) {
          speaker = char;
          break;
        }
      }

      // Split the line: narration before/after dialogue, and the dialogue itself
      const parts = trimmed.split(/[""]([^""]+)[""]/);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;
        if (i % 2 === 0) {
          // Narration (outside quotes)
          segments.push({ type: "narration", text: part, voice: NARRATOR_VOICE });
        } else {
          // Dialogue (inside quotes)
          const voice = speaker ? (voiceMap[speaker] ?? NARRATOR_VOICE) : NARRATOR_VOICE;
          segments.push({ type: "dialogue", text: part, character: speaker ?? undefined, voice });
        }
      }
    } else {
      // Pure narration
      segments.push({ type: "narration", text: trimmed, voice: NARRATOR_VOICE });
    }
  }

  // Merge consecutive narration segments to reduce subprocess calls
  const merged: TextSegment[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && last.type === "narration" && seg.type === "narration") {
      last.text += " " + seg.text;
    } else {
      merged.push({ ...seg });
    }
  }

  return { segments: merged, voiceMap };
}
