/**
 * Checks that every authored story key resolves to a real unit, and that every unit has
 * an authored story -- without needing a database.
 *
 * The keys in prisma/story-content/* are strings parsed by splitting on "-", and both
 * the subject slug ("religious-education") and the story key contain hyphens. A parsing
 * slip there fails silently: prisma/seed-stories.ts warns and skips, the deploy stays
 * green, and the story simply never appears. This makes that failure loud and local.
 *
 * The expected unit list is a snapshot of production. Update it when units change.
 *
 * Run: npx tsx scripts/check-story-units.ts
 */

import { pp1Stories } from "../prisma/story-content/pp1";
import { pp2Stories } from "../prisma/story-content/pp2";
import { g1Stories } from "../prisma/story-content/g1";
import { g2Stories } from "../prisma/story-content/g2";
import { g3Stories } from "../prisma/story-content/g3";

// grade|subjectSlug|unitSequence, as queried from production.
const PRODUCTION_UNITS = [
  "PP1|language|1",
  "PP1|mathematics|1",
  "PP1|religious-education|1",
  "PP2|creative|1",
  "PP2|environment|1",
  "PP2|language|1",
  "PP2|mathematics|1",
  "PP2|religious-education|1",
  "G1|english|1",
  "G1|english|2",
  "G1|ess|1",
  "G1|kiswahili|1",
  "G1|mathematics|1",
  "G1|mathematics|2",
  "G1|religious-education|1",
  "G2|creative-arts|1",
  "G2|english|1",
  "G2|ess|1",
  "G2|kiswahili|1",
  "G2|mathematics|1",
  "G2|religious-education|1",
  "G3|creative-arts|1",
  "G3|english|1",
  "G3|ess|1",
  "G3|kiswahili|1",
  "G3|mathematics|1",
  "G3|religious-education|1",
];

const all = Object.assign({}, pp1Stories, pp2Stories, g1Stories, g2Stories, g3Stories);

// Must match the parsing in prisma/seed-stories.ts exactly.
function parseKey(key: string): string {
  const parts = key.split("-");
  return [parts[0], parts.slice(1, -1).join("-"), Number(parts[parts.length - 1])].join("|");
}

const parsed = Object.keys(all).map(parseKey);
const prodSet = new Set(PRODUCTION_UNITS);
const parsedSet = new Set(parsed);

const orphaned = parsed.filter((p) => !prodSet.has(p));
const uncovered = PRODUCTION_UNITS.filter((p) => !parsedSet.has(p));
const duplicates = parsed.filter((p, i) => parsed.indexOf(p) !== i);

console.log(`${parsed.length} authored stories, ${PRODUCTION_UNITS.length} known units`);
if (orphaned.length) console.error(`✗ story keys with no matching unit: ${orphaned.join(", ")}`);
if (uncovered.length) console.error(`✗ units with no authored story: ${uncovered.join(", ")}`);
if (duplicates.length) console.error(`✗ two stories claim the same unit: ${duplicates.join(", ")}`);

if (orphaned.length || uncovered.length || duplicates.length) process.exit(1);
console.log("✓ every unit has exactly one authored story, and every story has a unit.");
