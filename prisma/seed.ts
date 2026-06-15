import { createScriptDb } from "../lib/db-script";

const db = createScriptDb();

const grades = [
  { code: "PP1", name: "Pre-Primary 1", ageRange: "4-5", order: 1 },
  { code: "PP2", name: "Pre-Primary 2", ageRange: "5-6", order: 2 },
  { code: "G1",  name: "Grade 1",       ageRange: "6-7", order: 3 },
  { code: "G2",  name: "Grade 2",       ageRange: "7-8", order: 4 },
  { code: "G3",  name: "Grade 3",       ageRange: "8-9", order: 5 },
];

const subjectsByGrade: Record<string, { name: string; slug: string; icon: string; color: string }[]> = {
  PP1: [
    { name: "Language Activities", slug: "language", icon: "🗣️", color: "#7C3AED" },
    { name: "Mathematical Activities", slug: "mathematics", icon: "🔢", color: "#2563EB" },
    { name: "Environmental Activities", slug: "environment", icon: "🌿", color: "#16A34A" },
    { name: "Creative Activities", slug: "creative", icon: "🎨", color: "#DB2777" },
    { name: "Religious Education", slug: "religious-education", icon: "🌟", color: "#D97706" },
  ],
  PP2: [
    { name: "Language Activities", slug: "language", icon: "🗣️", color: "#7C3AED" },
    { name: "Mathematical Activities", slug: "mathematics", icon: "🔢", color: "#2563EB" },
    { name: "Environmental Activities", slug: "environment", icon: "🌿", color: "#16A34A" },
    { name: "Creative Activities", slug: "creative", icon: "🎨", color: "#DB2777" },
    { name: "Religious Education", slug: "religious-education", icon: "🌟", color: "#D97706" },
  ],
  G1: [
    { name: "English Language", slug: "english", icon: "📖", color: "#7C3AED" },
    { name: "Kiswahili Language", slug: "kiswahili", icon: "🇰🇪", color: "#059669" },
    { name: "Mathematics", slug: "mathematics", icon: "🔢", color: "#2563EB" },
    { name: "Environmental & Social Studies", slug: "ess", icon: "🌍", color: "#16A34A" },
    { name: "Creative Arts & Sports", slug: "creative-arts", icon: "🎨", color: "#DB2777" },
    { name: "Religious Education", slug: "religious-education", icon: "🌟", color: "#D97706" },
  ],
  G2: [
    { name: "English Language", slug: "english", icon: "📖", color: "#7C3AED" },
    { name: "Kiswahili Language", slug: "kiswahili", icon: "🇰🇪", color: "#059669" },
    { name: "Mathematics", slug: "mathematics", icon: "🔢", color: "#2563EB" },
    { name: "Environmental & Social Studies", slug: "ess", icon: "🌍", color: "#16A34A" },
    { name: "Creative Arts & Sports", slug: "creative-arts", icon: "🎨", color: "#DB2777" },
    { name: "Religious Education", slug: "religious-education", icon: "🌟", color: "#D97706" },
  ],
  G3: [
    { name: "English Language", slug: "english", icon: "📖", color: "#7C3AED" },
    { name: "Kiswahili Language", slug: "kiswahili", icon: "🇰🇪", color: "#059669" },
    { name: "Mathematics", slug: "mathematics", icon: "🔢", color: "#2563EB" },
    { name: "Environmental & Social Studies", slug: "ess", icon: "🌍", color: "#16A34A" },
    { name: "Creative Arts & Sports", slug: "creative-arts", icon: "🎨", color: "#DB2777" },
    { name: "Religious Education", slug: "religious-education", icon: "🌟", color: "#D97706" },
  ],
};

// Sample units and lessons per grade/subject (AI worker will expand these nightly)
const seedUnits: Record<string, { sequence: number; title: string; outcomes: string[]; lessons: SeedLesson[] }[]> = {
  // ── Grade 1 English ────────────────────────────────────────────────────────
  "G1-english": [
    {
      sequence: 1,
      title: "Listening and Speaking",
      outcomes: [
        "Follow simple instructions",
        "Recite nursery rhymes and songs",
        "Describe people, animals and objects using simple sentences",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Following Instructions",
          objective: "By the end of this lesson, the learner should be able to follow two-step spoken instructions.",
          content: [
            { type: "introduction", text: "Every day we hear instructions at home and school. Let us learn to listen carefully and follow them!" },
            { type: "explanation", text: "An instruction tells us what to do. When someone speaks, we listen, then we act.", example: "Teacher says: 'Stand up and clap your hands.' You stand up and clap!" },
            { type: "activity", instruction: "Listen to each instruction and do it!", items: ["Touch your nose", "Jump twice", "Sit down slowly", "Wave to a friend"] },
          ],
          activities: [
            { type: "multiple_choice", question: "What do you do first when you hear an instruction?", options: ["Start talking", "Listen carefully", "Run away", "Close your eyes"], answer: "Listen carefully" },
            { type: "fill_blank", sentence: "We must ___ before we follow an instruction.", answer: "listen" },
          ],
          funFact: "Our ears can hear sounds from very far away — up to one mile in quiet conditions!",
        },
        {
          sequence: 2,
          title: "Nursery Rhymes",
          objective: "By the end of this lesson, the learner should be able to recite at least two nursery rhymes with correct rhythm.",
          content: [
            { type: "introduction", text: "Rhymes are fun! They have words that sound the same at the end." },
            { type: "explanation", text: "A nursery rhyme is a short poem or song. The words often rhyme — they end with the same sound.", example: "Twinkle twinkle little STAR, how I wonder what you ARE." },
            { type: "activity", instruction: "Repeat after me — line by line:", items: ["Twinkle, twinkle, little star,", "How I wonder what you are!", "Up above the world so high,", "Like a diamond in the sky."] },
          ],
          activities: [
            { type: "fill_blank", sentence: "Twinkle twinkle little ___, how I wonder what you are.", answer: "star" },
            { type: "multiple_choice", question: "Which words rhyme in 'star' and 'are'?", options: ["They look the same", "They end with the same sound", "They mean the same thing", "They start the same"], answer: "They end with the same sound" },
          ],
          funFact: "Nursery rhymes have been sung by children for over 400 years!",
        },
      ],
    },
    {
      sequence: 2,
      title: "Reading Readiness",
      outcomes: [
        "Identify letters of the alphabet",
        "Recognise the sounds letters make",
        "Read simple CVC words (cat, dog, sun)",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Letters A to E",
          objective: "By the end of this lesson, the learner should be able to identify and write letters A, B, C, D, E.",
          content: [
            { type: "introduction", text: "The alphabet is like a family of 26 letters. Today we meet the first five!" },
            { type: "explanation", text: "Each letter has a big (capital) and small form, and makes its own sound.", example: "A a — sounds like 'aah' as in Apple\nB b — sounds like 'buh' as in Ball\nC c — sounds like 'kuh' as in Cat" },
            { type: "activity", instruction: "Trace each letter in the air with your finger:", items: ["A — start at the top, go left down, go right down, draw a middle line", "B — go down, then two bumps to the right", "C — big curve like a banana", "D — go down, then one big bump to the right", "E — go down, then three lines to the right"] },
          ],
          activities: [
            { type: "matching", pairs: [{ left: "A", right: "Apple" }, { left: "B", right: "Ball" }, { left: "C", right: "Cat" }, { left: "D", right: "Dog" }, { left: "E", right: "Egg" }] },
            { type: "multiple_choice", question: "Which letter sounds like 'buh'?", options: ["A", "B", "C", "D"], answer: "B" },
          ],
          funFact: "The letter 'E' is the most used letter in the English language!",
        },
      ],
    },
  ],
  // ── Grade 1 Mathematics ────────────────────────────────────────────────────
  "G1-mathematics": [
    {
      sequence: 1,
      title: "Numbers 1 to 10",
      outcomes: [
        "Count objects from 1 to 10",
        "Write numerals 1 to 10",
        "Order numbers from smallest to largest",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Counting 1 to 5",
          objective: "By the end of this lesson, the learner should be able to count and write numbers 1 to 5.",
          content: [
            { type: "introduction", text: "Numbers are everywhere! On pages, on doors, on prices. Let us learn our first five numbers." },
            { type: "explanation", text: "We count one by one. Each number is one more than the one before.", example: "1 mango, 2 mangoes, 3 mangoes, 4 mangoes, 5 mangoes!" },
            { type: "activity", instruction: "Count the objects and say the number out loud:", items: ["🍎 🍎 → ?", "🐘 🐘 🐘 → ?", "⭐ ⭐ ⭐ ⭐ → ?", "🌸 🌸 🌸 🌸 🌸 → ?"] },
          ],
          activities: [
            { type: "multiple_choice", question: "How many stars are here: ⭐⭐⭐?", options: ["1", "2", "3", "4"], answer: "3" },
            { type: "fill_blank", sentence: "After 4 comes ___.", answer: "5" },
            { type: "matching", pairs: [{ left: "1", right: "one" }, { left: "2", right: "two" }, { left: "3", right: "three" }, { left: "4", right: "four" }, { left: "5", right: "five" }] },
          ],
          funFact: "Ancient Egyptians counted using pictures called hieroglyphs — one vertical line for 1!",
        },
        {
          sequence: 2,
          title: "Counting 6 to 10",
          objective: "By the end of this lesson, the learner should be able to count and write numbers 6 to 10.",
          content: [
            { type: "introduction", text: "We already know 1 to 5. Now let us go further — all the way to 10!" },
            { type: "explanation", text: "Numbers 6, 7, 8, 9, 10 come right after 5. We use both hands to count all 10 fingers!", example: "Hold up 6 fingers. Now 7. Keep going until you reach 10." },
            { type: "activity", instruction: "Count on from 5 — say each number as you add one finger:", items: ["5 + 1 = 6", "6 + 1 = 7", "7 + 1 = 8", "8 + 1 = 9", "9 + 1 = 10"] },
          ],
          activities: [
            { type: "multiple_choice", question: "Which number comes after 8?", options: ["6", "7", "9", "10"], answer: "9" },
            { type: "fill_blank", sentence: "10 is ___ more than 9.", answer: "1" },
          ],
          funFact: "We use 10 as our main number system because humans have 10 fingers!",
        },
      ],
    },
    {
      sequence: 2,
      title: "Addition Within 10",
      outcomes: [
        "Add two single-digit numbers",
        "Understand the + and = symbols",
        "Solve simple word problems involving addition",
      ],
      lessons: [
        {
          sequence: 1,
          title: "What is Addition?",
          objective: "By the end of this lesson, the learner should be able to add two numbers to get a sum up to 10.",
          content: [
            { type: "introduction", text: "Addition means putting things together to find a total. When we add, we always get more!" },
            { type: "explanation", text: "We use the '+' sign to add and '=' sign to show the answer.", example: "2 mangoes + 3 mangoes = 5 mangoes altogether. We write: 2 + 3 = 5" },
            { type: "activity", instruction: "Draw dots and add them together:", items: ["○○ + ○ = ?", "○ + ○○○ = ?", "○○○ + ○○ = ?"] },
          ],
          activities: [
            { type: "multiple_choice", question: "What is 3 + 4?", options: ["5", "6", "7", "8"], answer: "7" },
            { type: "fill_blank", sentence: "2 + 5 = ___.", answer: "7" },
          ],
          funFact: "The '+' sign was first used in Germany in 1489!",
        },
      ],
    },
  ],
  // ── Grade 1 Kiswahili ──────────────────────────────────────────────────────
  "G1-kiswahili": [
    {
      sequence: 1,
      title: "Salamu na Mazungumzo (Greetings)",
      outcomes: [
        "Greet people at different times of day",
        "Respond to greetings correctly",
        "Introduce themselves in Kiswahili",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Habari za Asubuhi (Good Morning)",
          objective: "By the end of this lesson, the learner should be able to greet and respond to morning greetings in Kiswahili.",
          content: [
            { type: "introduction", text: "Kiswahili ni lugha ya Kenya na Afrika Mashariki. Siku nzuri ya kujifunza kuanza na salamu!" },
            { type: "explanation", text: "We greet differently at different times of day. In the morning we say 'Habari za asubuhi' (What news this morning?).", example: "A: Habari za asubuhi?\nB: Nzuri, asante! (Good, thank you!)" },
            { type: "activity", instruction: "Practise with a partner — one says the greeting, one responds:", items: ["Habari za asubuhi? → Nzuri, asante!", "Habari yako? → Nzuri sana!", "Karibu! → Asante!"] },
          ],
          activities: [
            { type: "matching", pairs: [{ left: "Habari za asubuhi", right: "Morning greeting" }, { left: "Nzuri", right: "Good" }, { left: "Asante", right: "Thank you" }, { left: "Karibu", right: "Welcome" }] },
            { type: "fill_blank", sentence: "A: Habari za asubuhi? B: ___, asante!", answer: "Nzuri" },
          ],
          funFact: "Kiswahili is spoken by over 200 million people across Africa!",
        },
      ],
    },
  ],
  // ── Grade 1 ESS ───────────────────────────────────────────────────────────
  "G1-ess": [
    {
      sequence: 1,
      title: "My Family",
      outcomes: [
        "Identify members of a family",
        "Describe roles of family members",
        "Show respect for family members",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Who is in My Family?",
          objective: "By the end of this lesson, the learner should be able to identify and name different family members.",
          content: [
            { type: "introduction", text: "A family is a group of people who live together and love each other. Let us learn about family members!" },
            { type: "explanation", text: "A family can be big or small. The main family members are: father (baba), mother (mama), brother (kaka), sister (dada), grandfather (babu), grandmother (nyanya).", example: "In Amina's family: Baba goes to work, Mama cooks, Kaka goes to school, Dada plays." },
            { type: "activity", instruction: "Draw your family and write the name of each person:", items: ["Draw a house", "Draw each family member", "Write their names: Baba, Mama, Kaka, Dada..."] },
          ],
          activities: [
            { type: "matching", pairs: [{ left: "Baba", right: "Father" }, { left: "Mama", right: "Mother" }, { left: "Kaka", right: "Brother" }, { left: "Dada", right: "Sister" }] },
            { type: "multiple_choice", question: "What do we call our father's mother?", options: ["Mama", "Dada", "Nyanya", "Shangazi"], answer: "Nyanya" },
          ],
          funFact: "The largest recorded family in the world had 39 wives, 94 children, and 33 grandchildren — all in one household!",
        },
      ],
    },
  ],
  // ── PP1 Language ──────────────────────────────────────────────────────────
  "PP1-language": [
    {
      sequence: 1,
      title: "Sounds Around Us",
      outcomes: [
        "Identify sounds in the environment",
        "Distinguish between loud and soft sounds",
        "Link sounds to the objects that make them",
      ],
      lessons: [
        {
          sequence: 1,
          title: "What Makes That Sound?",
          objective: "By the end of this lesson, the learner should be able to identify at least 4 sounds from the environment.",
          content: [
            { type: "introduction", text: "Close your eyes and listen... What do you hear? Sounds are all around us!" },
            { type: "explanation", text: "Everything that moves makes a sound. Animals, vehicles, instruments — they all have their own sounds.", example: "A dog says 'woof!', a cat says 'meow!', rain goes 'pitter-patter'." },
            { type: "activity", instruction: "Point to the picture when you hear its sound:", items: ["Drum — boom boom!", "Bell — ring ring!", "Rain — pitter patter!", "Clap — clap clap!"] },
          ],
          activities: [
            { type: "matching", pairs: [{ left: "Dog", right: "Woof" }, { left: "Cat", right: "Meow" }, { left: "Cow", right: "Moo" }, { left: "Bird", right: "Tweet" }] },
          ],
          funFact: "Elephants can hear sounds from up to 10 kilometres away!",
        },
      ],
    },
  ],
  // ── PP1 Mathematics ───────────────────────────────────────────────────────
  "PP1-mathematics": [
    {
      sequence: 1,
      title: "Sorting and Matching",
      outcomes: [
        "Sort objects by colour, shape, and size",
        "Match objects that are the same",
        "Describe objects using words like big, small, same, different",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Same and Different",
          objective: "By the end of this lesson, the learner should be able to sort objects into groups of same and different.",
          content: [
            { type: "introduction", text: "Look around the classroom. Can you find two things that look the same?" },
            { type: "explanation", text: "Same means they look exactly alike. Different means they are not the same.", example: "A red ball and a red apple are the SAME colour. A red ball and a blue ball are DIFFERENT colours." },
            { type: "activity", instruction: "Sort these into same-colour groups:", items: ["🔴🔵🔴🟡🔵🟡", "Put all red ones together, blue ones together, yellow ones together"] },
          ],
          activities: [
            { type: "multiple_choice", question: "Which shape is different? ○ ○ ○ □", options: ["First ○", "Second ○", "Third ○", "The □"], answer: "The □" },
          ],
          funFact: "Sorting is one of the earliest math skills humans ever developed — ancient people sorted shells and stones!",
        },
      ],
    },
  ],
};

interface SeedLesson {
  sequence: number;
  title: string;
  objective: string;
  content: unknown[];
  activities: unknown[];
  funFact?: string;
}

async function main() {
  console.log("🌱 Seeding CBC curriculum...");

  for (const gradeData of grades) {
    const grade = await db.grade.upsert({
      where: { code: gradeData.code },
      update: {},
      create: gradeData,
    });
    console.log(`  ✓ Grade: ${grade.name}`);

    const subjects = subjectsByGrade[gradeData.code] ?? [];
    for (const subjectData of subjects) {
      const subject = await db.subject.upsert({
        where: { gradeId_slug: { gradeId: grade.id, slug: subjectData.slug } },
        update: {},
        create: { ...subjectData, gradeId: grade.id },
      });

      const unitKey = `${gradeData.code}-${subjectData.slug}`;
      const units = seedUnits[unitKey] ?? [];

      for (const unitData of units) {
        const unit = await db.unit.upsert({
          where: { subjectId_sequence: { subjectId: subject.id, sequence: unitData.sequence } },
          update: {},
          create: {
            subjectId: subject.id,
            sequence: unitData.sequence,
            title: unitData.title,
            outcomes: unitData.outcomes,
          },
        });

        for (const lessonData of unitData.lessons) {
          await db.lesson.upsert({
            where: { unitId_sequence: { unitId: unit.id, sequence: lessonData.sequence } },
            update: {},
            create: {
              unitId: unit.id,
              sequence: lessonData.sequence,
              title: lessonData.title,
              objective: lessonData.objective,
              content: lessonData.content as never,
              activities: lessonData.activities as never,
              funFact: lessonData.funFact,
              source: "seed",
            },
          });
        }
        console.log(`    ✓ Unit ${unitData.sequence}: ${unitData.title} (${unitData.lessons.length} lessons)`);
      }
    }
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
