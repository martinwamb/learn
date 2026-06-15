export type KokoroVoice =
  | "af_heart"    // warm narrator (primary)
  | "af_bella"    // female character
  | "af_sarah"    // secondary female
  | "am_michael"  // male character
  | "bm_george"   // deep / villain
  | "bf_emma";    // elder / wise character

export const NARRATOR_VOICE: KokoroVoice = "af_heart";

// Keywords that map a character name to a specific voice
const VILLAIN_KEYWORDS = ["wolf", "witch", "giant", "monster", "dragon", "ogre", "crocodile", "hyena", "devil"];
const ELDER_KEYWORDS   = ["grandmother", "grandma", "grandfather", "grandpa", "elder", "nyanya", "babu", "mzee", "teacher", "wise"];
const FEMALE_KEYWORDS  = ["girl", "sister", "mother", "mama", "queen", "princess", "woman", "lady", "daughter", "auntie", "shangazi"];
const MALE_KEYWORDS    = ["boy", "brother", "father", "baba", "king", "prince", "man", "son", "uncle", "mjomba"];

export function assignVoiceToCharacter(characterName: string): KokoroVoice {
  const lower = characterName.toLowerCase();

  if (VILLAIN_KEYWORDS.some((k) => lower.includes(k))) return "bm_george";
  if (ELDER_KEYWORDS.some((k) => lower.includes(k)))   return "bf_emma";
  if (FEMALE_KEYWORDS.some((k) => lower.includes(k)))  return "af_bella";
  if (MALE_KEYWORDS.some((k) => lower.includes(k)))    return "am_michael";

  // Default alternation so unnamed characters get variety
  const hash = [...characterName].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return hash % 2 === 0 ? "af_sarah" : "am_michael";
}

export type CharacterVoiceMap = Record<string, KokoroVoice>;

export function buildCharacterMap(characters: string[]): CharacterVoiceMap {
  const map: CharacterVoiceMap = { NARRATOR: NARRATOR_VOICE };
  for (const name of characters) {
    map[name] = assignVoiceToCharacter(name);
  }
  return map;
}
