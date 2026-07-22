export type NarratorVoice =
  | "en-KE-AsiliaNeural"   // warm narrator (primary) -- same voice used by the live lesson narrator
  | "en-NG-EzinneNeural"   // female character
  | "en-ZA-LeahNeural"     // secondary female
  | "en-KE-ChilembaNeural" // male character
  | "en-ZA-LukeNeural"     // deep / villain
  | "en-TZ-ImaniNeural";   // elder / wise character

export const NARRATOR_VOICE: NarratorVoice = "en-KE-AsiliaNeural";

// Keywords that map a character name to a specific voice
const VILLAIN_KEYWORDS = ["wolf", "witch", "giant", "monster", "dragon", "ogre", "crocodile", "hyena", "devil"];
const ELDER_KEYWORDS   = ["grandmother", "grandma", "grandfather", "grandpa", "elder", "nyanya", "babu", "mzee", "teacher", "wise"];
const FEMALE_KEYWORDS  = ["girl", "sister", "mother", "mama", "queen", "princess", "woman", "lady", "daughter", "auntie", "shangazi"];
const MALE_KEYWORDS    = ["boy", "brother", "father", "baba", "king", "prince", "man", "son", "uncle", "mjomba"];

export function assignVoiceToCharacter(characterName: string): NarratorVoice {
  const lower = characterName.toLowerCase();

  if (VILLAIN_KEYWORDS.some((k) => lower.includes(k))) return "en-ZA-LukeNeural";
  if (ELDER_KEYWORDS.some((k) => lower.includes(k)))   return "en-TZ-ImaniNeural";
  if (FEMALE_KEYWORDS.some((k) => lower.includes(k)))  return "en-NG-EzinneNeural";
  if (MALE_KEYWORDS.some((k) => lower.includes(k)))    return "en-KE-ChilembaNeural";

  // Default alternation so unnamed characters get variety
  const hash = [...characterName].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return hash % 2 === 0 ? "en-ZA-LeahNeural" : "en-KE-ChilembaNeural";
}

export type CharacterVoiceMap = Record<string, NarratorVoice>;

export function buildCharacterMap(characters: string[]): CharacterVoiceMap {
  const map: CharacterVoiceMap = { NARRATOR: NARRATOR_VOICE };
  for (const name of characters) {
    map[name] = assignVoiceToCharacter(name);
  }
  return map;
}
