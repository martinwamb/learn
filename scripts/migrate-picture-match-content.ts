/**
 * One-off migration: fixes lesson content blocks discovered during the Phase 1.5
 * content-pipeline investigation to have inconsistent/crash-risk `items` shapes
 * (objects instead of strings) or to be untagged "point to the picture" exercises
 * that should be `picture-match` blocks. Each transform below was decided by reading
 * the actual content, not a blind regex -- some lessons' items don't cleanly fit
 * picture-match at all and are left alone or just shape-normalized.
 *
 * Run once: npx tsx scripts/migrate-picture-match-content.ts
 * Idempotent: re-running is safe, each lesson's content block is fully replaced by
 * id, not incrementally patched.
 */
import "dotenv/config";
import { createScriptDb } from "../lib/db-script";

const db = createScriptDb();

interface ContentBlock {
  type: string;
  [key: string]: unknown;
}

// For each lesson id: replace the FIRST "activity" block containing an `items` key
// with the given replacement block, or remove it entirely if replacement is null.
const migrations: { id: string; title: string; replacement: ContentBlock | null }[] = [
  {
    id: "cmqhhhzwd0000ht7x76rye1bo",
    title: "Sound Safari",
    replacement: {
      type: "picture-match",
      instruction: "Listen carefully to the sound and guess which animal it is.",
      pictureItems: [
        { label: "Elephant", sound: "trumpeting" },
        { label: "Lion", sound: "roaring" },
      ],
    },
  },
  {
    id: "cmqiwx2el0000lw7x9mivbpen",
    title: "Listen and Learn",
    replacement: {
      type: "picture-match",
      instruction: "Listen to these sounds and guess what's making them!",
      pictureItems: [
        { label: "Cow", sound: "Moo" },
        { label: "Cat", sound: "Meow" },
      ],
    },
  },
  {
    id: "cmqjygnxj0000pd7xdw4ixnlz",
    title: "Animal Sounds",
    replacement: {
      type: "picture-match",
      instruction: "Listen carefully to the sound and guess which animal it is.",
      pictureItems: [
        { label: "Cat", sound: "meow" },
        { label: "Dog", sound: "woof" },
        { label: "Sheep", sound: "baa" },
      ],
    },
  },
  {
    id: "cmqkcecl80000347xnp33xrld",
    title: "Nature Sounds",
    replacement: {
      type: "picture-match",
      instruction: "Let's play a game where we find out which objects make these fun sounds.",
      pictureItems: [
        { label: "Wind blowing leaves", sound: "whoosh" },
        { label: "Ocean waves", sound: "splash" },
      ],
    },
  },
  {
    id: "cmqlrw8x70000cm7xunclxonf",
    title: "Sounds in Our Home",
    replacement: null, // already plain strings, no crash risk -- leave content block untouched
  },
  {
    id: "cmqn7czsk0000797x9h23divy",
    title: "Nature Sounds in Our Garden",
    replacement: {
      type: "picture-match",
      instruction: "Let's play 'Nature Sound Hunt'! Try to guess what makes each sound.",
      pictureItems: [
        { label: "Bees", sound: "buzzing" },
        { label: "Crickets", sound: "chirping" },
      ],
    },
  },
  {
    id: "cmqomu4vc0000wo7xrhw6nev4",
    title: "Sounds of Our Kenyan Home",
    // Items were too generic ("a picture of a toy") to map to a specific real photo --
    // normalize back to plain strings instead of forcing picture-match.
    replacement: {
      type: "activity",
      instruction: "Let's have a fun listening game. Think about sounds you hear at home.",
      items: ["A toy sound", "Someone in your family talking"],
    },
  },
  {
    id: "cmqox7mk00000qf7xahk22t18",
    title: "Sound Safari in Our Village",
    replacement: {
      type: "picture-match",
      instruction: "Listen carefully to this sound around our village, then find what made it.",
      pictureItems: [{ label: "Cow", sound: "mooing in the field" }],
    },
  },
  {
    id: "cmqsx7a7b00008s7xzqdpb088",
    title: "Our Village and Its Birds",
    replacement: {
      type: "picture-match",
      instruction: "Let's practice hearing different birds found in Kenya.",
      pictureItems: [
        { label: "Rooster", sound: "cock-a-doodle-doo" },
        { label: "Pigeon", sound: "cooing" },
        { label: "Parrot", sound: "squawking" },
        { label: "Owl", sound: "hooting" },
      ],
    },
  },
  {
    id: "cmqucpagl0000yq7xwo2dbrj0",
    title: "Lesson on Kenya's Amazing Birds",
    // This block had an "answer" key -- it's a mis-shaped graded phonics question, not
    // a content item list, and there's no distractor-option data to reconstruct a
    // proper multiple_choice from. Remove the block; the lesson's other content and
    // its real activities[] are untouched.
    replacement: null,
    // handled by `removeInsteadOfReplace` below
  },
  {
    id: "cmrhb9bal0002wy7xxpb8wzu8",
    title: "Rhyming Sounds with Animals",
    replacement: {
      type: "picture-match",
      instruction: "Listen to these animal sounds and point to the picture when you hear it.",
      pictureItems: [
        { label: "Cow", sound: "Moo" },
        { label: "Cat", sound: "Meow" },
      ],
    },
  },
  {
    id: "cmriqrjo60003k97xolx0dkv4",
    title: "Gardening with Mama and Papa",
    replacement: {
      type: "picture-match",
      instruction: "Let's play a game where you point to the picture when you hear its sound!",
      pictureItems: [
        { label: "Drum", sound: "boom" },
        { label: "Watering Can", sound: "splash" },
      ],
    },
  },
  {
    id: "cmrirahw60007k97xps90d4ce",
    title: "The Clever Rabbit",
    replacement: {
      type: "picture-match",
      instruction: "Point to the picture when you hear its sound!",
      pictureItems: [
        { label: "Drum", sound: "boom boom" },
        { label: "Banana Tree", sound: "rustle rustle" },
      ],
    },
  },
];

// Lessons whose activity-with-items block should be REMOVED entirely (mis-shaped
// graded question, not ungraded content -- see comment above).
const removeBlockLessonIds = new Set(["cmqucpagl0000yq7xwo2dbrj0"]);

async function main() {
  console.log("🔧 Migrating legacy picture/sound content blocks...\n");

  for (const m of migrations) {
    const lesson = await db.lesson.findUnique({ where: { id: m.id } });
    if (!lesson) {
      console.warn(`  ⚠️  Lesson not found, skipping: ${m.title} (${m.id})`);
      continue;
    }

    const content = lesson.content as ContentBlock[];
    const blockIdx = content.findIndex((b) => b.type === "activity" && "items" in b);
    if (blockIdx === -1) {
      console.log(`  · No matching block in "${m.title}" (already migrated?), skipping`);
      continue;
    }

    let newContent: ContentBlock[];
    if (removeBlockLessonIds.has(m.id)) {
      newContent = content.filter((_, i) => i !== blockIdx);
      console.log(`  ✓ Removed malformed content block from "${m.title}"`);
    } else if (m.replacement) {
      newContent = [...content];
      newContent[blockIdx] = m.replacement;
      console.log(`  ✓ Converted "${m.title}" to ${m.replacement.type}`);
    } else {
      console.log(`  · Left "${m.title}" as-is (already a valid shape)`);
      continue;
    }

    await db.lesson.update({
      where: { id: m.id },
      data: { content: newContent as never },
    });
  }

  console.log("\n✅ Migration complete!");
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error("Migration failed:", err);
  await db.$disconnect();
  process.exit(1);
});
