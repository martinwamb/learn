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
const seedUnits: Record<string, { sequence: number; title: string; outcomes: string[]; targetLessonCount?: number; lessons: SeedLesson[] }[]> = {
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
      targetLessonCount: 15,
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
      targetLessonCount: 15,
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
      targetLessonCount: 15,
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
      targetLessonCount: 15,
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
      targetLessonCount: 15,
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
      targetLessonCount: 15,
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
      targetLessonCount: 15,
      lessons: [
        {
          sequence: 1,
          title: "What Makes That Sound?",
          objective: "By the end of this lesson, the learner should be able to identify at least 4 sounds from the environment.",
          content: [
            { type: "introduction", text: "Close your eyes and listen... What do you hear? Sounds are all around us!" },
            { type: "explanation", text: "Everything that moves makes a sound. Animals, vehicles, instruments — they all have their own sounds.", example: "A dog says 'woof!', a cat says 'meow!', rain goes 'pitter-patter'." },
            { type: "picture-match", instruction: "Point to the picture when you hear its sound:", pictureItems: [{ label: "Drum", sound: "boom boom" }, { label: "Bell", sound: "ring ring" }, { label: "Rain", sound: "pitter patter" }, { label: "Clap", sound: "clap clap" }] },
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
      targetLessonCount: 15,
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
  // ── PP2 Language ──────────────────────────────────────────────────────────
  "PP2-language": [
    {
      sequence: 1,
      title: "Rhyming Words",
      outcomes: [
        "Identify words that rhyme",
        "Produce simple rhyming pairs",
        "Enjoy rhymes through songs and play",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Words That Sound Alike",
          objective: "By the end of this lesson, the learner should be able to identify pairs of rhyming words.",
          content: [
            { type: "introduction", text: "Some words are best friends — they end with the same sound! Let's find them." },
            { type: "explanation", text: "Rhyming words end with the same sound, even if they start differently.", example: "Cat and hat rhyme. Sun and fun rhyme too!" },
            { type: "activity", instruction: "Say each pair out loud and clap if they rhyme:", items: ["Cat — Hat", "Dog — Log", "Ball — Spoon", "Sun — Fun"] },
          ],
          activities: [
            { type: "multiple_choice", question: "Which word rhymes with 'cat'?", options: ["Dog", "Hat", "Sun", "Cup"], answer: "Hat" },
            { type: "matching", pairs: [{ left: "Cat", right: "Hat" }, { left: "Dog", right: "Log" }, { left: "Sun", right: "Fun" }] },
          ],
          funFact: "Many favourite children's songs are built entirely from rhyming words!",
        },
      ],
    },
  ],
  // ── PP2 Mathematics ───────────────────────────────────────────────────────
  "PP2-mathematics": [
    {
      sequence: 1,
      title: "Numbers 1 to 5",
      outcomes: [
        "Count objects up to 5",
        "Recognise numerals 1 to 5",
        "Match a numeral to the correct quantity",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Counting My Fingers",
          objective: "By the end of this lesson, the learner should be able to count and recognise numbers 1 to 5.",
          content: [
            { type: "introduction", text: "Hold up one hand. Did you know it can help you count to 5?" },
            { type: "explanation", text: "Each finger stands for one number. Count them one at a time.", example: "Thumb is 1, next finger is 2, middle finger is 3, next is 4, smallest finger is 5!" },
            { type: "activity", instruction: "Count the pictures and say the number:", items: ["🍌 → ?", "🍌🍌🍌 → ?", "🍌🍌🍌🍌🍌 → ?"] },
          ],
          activities: [
            { type: "multiple_choice", question: "How many bananas: 🍌🍌🍌?", options: ["2", "3", "4", "5"], answer: "3" },
            { type: "matching", pairs: [{ left: "1", right: "one" }, { left: "3", right: "three" }, { left: "5", right: "five" }] },
          ],
          funFact: "Humans learned to count using their fingers thousands of years ago!",
        },
      ],
    },
  ],
  // ── PP2 Environmental Activities ──────────────────────────────────────────
  "PP2-environment": [
    {
      sequence: 1,
      title: "My Home and School",
      outcomes: [
        "Name people found at home and school",
        "Describe the roles of people who help us",
        "Show care for the home and school environment",
      ],
      lessons: [
        {
          sequence: 1,
          title: "People Who Help Me",
          objective: "By the end of this lesson, the learner should be able to name people who help them at home and school.",
          content: [
            { type: "introduction", text: "Many people help us every day! Let's think about who helps us at home and at school." },
            { type: "explanation", text: "At home, our parents and family help us. At school, our teacher and the cook help us.", example: "Mama cooks food at home. Teacher helps us learn at school." },
            { type: "activity", instruction: "Name someone who helps you and say how:", items: ["Who cooks for you?", "Who teaches you?", "Who keeps you safe?"] },
          ],
          activities: [
            { type: "multiple_choice", question: "Who helps us learn at school?", options: ["The cook", "The teacher", "The driver", "The doctor"], answer: "The teacher" },
          ],
          funFact: "A school has many helpers you might not see every day — like the people who keep it clean and safe!",
        },
      ],
    },
  ],
  // ── PP2 Creative Activities ───────────────────────────────────────────────
  "PP2-creative": [
    {
      sequence: 1,
      title: "Colours and Shapes",
      outcomes: [
        "Name primary colours",
        "Identify basic shapes",
        "Create simple drawings using shapes and colours",
      ],
      lessons: [
        {
          sequence: 1,
          title: "My Favourite Colours",
          objective: "By the end of this lesson, the learner should be able to name and identify primary colours.",
          content: [
            { type: "introduction", text: "Look around you — colours are everywhere! Red, blue, yellow, and so many more." },
            { type: "explanation", text: "Red, blue, and yellow are called primary colours. We can mix them to make new colours!", example: "Blue and yellow mixed together make green." },
            { type: "activity", instruction: "Point to something in this colour:", items: ["Something red 🔴", "Something blue 🔵", "Something yellow 🟡"] },
          ],
          activities: [
            { type: "multiple_choice", question: "Which two colours mix to make green?", options: ["Red and blue", "Blue and yellow", "Red and yellow", "Blue and white"], answer: "Blue and yellow" },
          ],
          funFact: "Rainbows always show their colours in the very same order!",
        },
      ],
    },
  ],
  // ── PP2 Religious Education ───────────────────────────────────────────────
  "PP2-religious-education": [
    {
      sequence: 1,
      title: "Being Kind to Others",
      outcomes: [
        "Explain what it means to be kind",
        "Give examples of kind actions",
        "Practise kindness towards classmates",
      ],
      lessons: [
        {
          sequence: 1,
          title: "A Kind Heart",
          objective: "By the end of this lesson, the learner should be able to describe simple ways to be kind to others.",
          content: [
            { type: "introduction", text: "Being kind makes everyone feel happy — including you!" },
            { type: "explanation", text: "Kindness means helping and caring for others without expecting anything back.", example: "Sharing your pencil with a friend who has none is a kind act." },
            { type: "activity", instruction: "Think of one kind thing you can do today:", items: ["Share something", "Say a kind word", "Help a friend"] },
          ],
          activities: [
            { type: "multiple_choice", question: "Which of these is a kind action?", options: ["Sharing your snack", "Ignoring a friend", "Taking without asking", "Shouting"], answer: "Sharing your snack" },
          ],
          funFact: "Scientists have found that being kind can make the person doing it feel happier too!",
        },
      ],
    },
  ],
  // ── G2 English ─────────────────────────────────────────────────────────────
  "G2-english": [
    {
      sequence: 1,
      title: "Reading Short Stories",
      outcomes: [
        "Read a short story with understanding",
        "Answer simple comprehension questions",
        "Retell a story in their own words",
      ],
      lessons: [
        {
          sequence: 1,
          title: "The Thirsty Crow",
          objective: "By the end of this lesson, the learner should be able to read a short story and answer questions about it.",
          content: [
            { type: "introduction", text: "Today we read about a clever crow who solved a big problem!" },
            { type: "explanation", text: "A crow was very thirsty. It found a jug with a little water at the bottom, too low to reach. The crow dropped pebbles into the jug one by one until the water rose high enough to drink.", example: "The crow used its brain, not just its beak, to solve the problem." },
            { type: "activity", instruction: "Answer these questions about the story:", items: ["Why was the crow thirsty?", "What problem did the crow have?", "How did the crow solve it?"] },
          ],
          activities: [
            { type: "multiple_choice", question: "How did the crow reach the water?", options: ["It tipped the jug over", "It dropped in pebbles", "It flew away", "It broke the jug"], answer: "It dropped in pebbles" },
            { type: "fill_blank", sentence: "The crow used ___ to raise the water level.", answer: "pebbles" },
          ],
          funFact: "This story has been told for over 2,000 years — it comes from Aesop's Fables!",
        },
      ],
    },
  ],
  // ── G2 Kiswahili ───────────────────────────────────────────────────────────
  "G2-kiswahili": [
    {
      sequence: 1,
      title: "Siku za Wiki (Days of the Week)",
      outcomes: [
        "Taja siku saba za wiki",
        "Tumia siku za wiki katika sentensi",
        "Panga siku za wiki kwa mpangilio",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Wiki Ina Siku Saba",
          objective: "By the end of this lesson, the learner should be able to name the seven days of the week in Kiswahili in order.",
          content: [
            { type: "introduction", text: "Wiki moja ina siku saba. Leo tutajifunza majina yake yote!" },
            { type: "explanation", text: "Siku za wiki ni: Jumatatu, Jumanne, Jumatano, Alhamisi, Ijumaa, Jumamosi, na Jumapili.", example: "Shuleni tunaenda Jumatatu mpaka Ijumaa. Tunapumzika Jumamosi na Jumapili." },
            { type: "activity", instruction: "Sema siku hizi kwa mpangilio:", items: ["Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi", "Jumapili"] },
          ],
          activities: [
            { type: "multiple_choice", question: "Siku ya kwanza ya wiki ni ipi?", options: ["Jumapili", "Jumatatu", "Ijumaa", "Jumamosi"], answer: "Jumatatu" },
            { type: "fill_blank", sentence: "Baada ya Jumatano huja ___.", answer: "Alhamisi" },
          ],
          funFact: "Kiswahili week names borrow from Arabic — 'Ijumaa' relates to the word for gathering, like Friday prayers!",
        },
      ],
    },
  ],
  // ── G2 Mathematics ─────────────────────────────────────────────────────────
  "G2-mathematics": [
    {
      sequence: 1,
      title: "Addition and Subtraction Within 20",
      outcomes: [
        "Add two numbers with a sum up to 20",
        "Subtract numbers within 20",
        "Solve simple word problems",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Adding Past 10",
          objective: "By the end of this lesson, the learner should be able to add two numbers with a total up to 20.",
          content: [
            { type: "introduction", text: "We already know numbers to 10. Now let's go further and add all the way to 20!" },
            { type: "explanation", text: "When numbers add up to more than 10, we count on carefully, one step at a time.", example: "8 + 5: start at 8, count on 5 more — 9, 10, 11, 12, 13. So 8 + 5 = 13." },
            { type: "activity", instruction: "Solve these by counting on:", items: ["9 + 4 = ?", "7 + 8 = ?", "12 + 6 = ?"] },
          ],
          activities: [
            { type: "multiple_choice", question: "What is 9 + 6?", options: ["14", "15", "16", "17"], answer: "15" },
            { type: "fill_blank", sentence: "12 + 5 = ___.", answer: "17" },
          ],
          funFact: "The '=' sign was invented by a Welsh mathematician who was tired of writing 'is equal to' over and over!",
        },
      ],
    },
  ],
  // ── G2 Environmental & Social Studies ─────────────────────────────────────
  "G2-ess": [
    {
      sequence: 1,
      title: "My Community and Neighbourhood",
      outcomes: [
        "Identify people and places in the local community",
        "Describe the role of community helpers",
        "Show respect for community members",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Helpers in My Community",
          objective: "By the end of this lesson, the learner should be able to name community helpers and describe their work.",
          content: [
            { type: "introduction", text: "Beyond our family, many people in our community help us too!" },
            { type: "explanation", text: "A community has helpers like doctors, police officers, and shopkeepers who each play an important role.", example: "A doctor helps sick people get well. A police officer keeps us safe." },
            { type: "activity", instruction: "Match each helper to their job:", items: ["Doctor — heals the sick", "Police officer — keeps order", "Shopkeeper — sells goods"] },
          ],
          activities: [
            { type: "matching", pairs: [{ left: "Doctor", right: "Heals the sick" }, { left: "Police officer", right: "Keeps order" }, { left: "Shopkeeper", right: "Sells goods" }] },
            { type: "multiple_choice", question: "Who helps keep our community safe?", options: ["Shopkeeper", "Police officer", "Farmer", "Driver"], answer: "Police officer" },
          ],
          funFact: "Some Kenyan communities have their own local chiefs (machifu) who help solve problems together!",
        },
      ],
    },
  ],
  // ── G2 Creative Arts & Sports ──────────────────────────────────────────────
  "G2-creative-arts": [
    {
      sequence: 1,
      title: "Kenyan Traditional Games",
      outcomes: [
        "Name traditional Kenyan games",
        "Explain the rules of a simple traditional game",
        "Play a traditional game safely with others",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Let's Play Bao",
          objective: "By the end of this lesson, the learner should be able to describe how a traditional Kenyan game is played.",
          content: [
            { type: "introduction", text: "Long before phones and screens, children played fun games using seeds and boards!" },
            { type: "explanation", text: "Bao is a traditional board game played by moving seeds between small pits, trying to capture your opponent's seeds.", example: "Two players take turns moving seeds around the board to collect the most." },
            { type: "activity", instruction: "Talk about games you play with friends:", items: ["What game do you play most?", "Does it use a ball, seeds, or something else?", "How many players does it need?"] },
          ],
          activities: [
            { type: "multiple_choice", question: "What is used to play Bao?", options: ["A ball", "Seeds and a board", "A rope", "Cards"], answer: "Seeds and a board" },
          ],
          funFact: "Bao-style games are played across many African countries, each with slightly different rules!",
        },
      ],
    },
  ],
  // ── G2 Religious Education ─────────────────────────────────────────────────
  "G2-religious-education": [
    {
      sequence: 1,
      title: "Caring for Creation",
      outcomes: [
        "Explain why the environment should be cared for",
        "Describe simple ways to protect nature",
        "Practise caring for plants and animals",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Looking After Our World",
          objective: "By the end of this lesson, the learner should be able to describe simple ways to care for the environment.",
          content: [
            { type: "introduction", text: "Our world is a gift — trees, animals, rivers, and mountains. How can we take care of it?" },
            { type: "explanation", text: "We care for creation by not littering, planting trees, and being gentle with animals.", example: "Picking up litter and putting it in a bin helps keep our environment clean." },
            { type: "activity", instruction: "Think of one way you can care for nature today:", items: ["Plant a seed", "Pick up litter", "Give water to a plant"] },
          ],
          activities: [
            { type: "multiple_choice", question: "Which action helps care for the environment?", options: ["Littering", "Planting a tree", "Cutting trees for fun", "Wasting water"], answer: "Planting a tree" },
          ],
          funFact: "One mature tree can absorb about 22 kilograms of carbon dioxide from the air each year!",
        },
      ],
    },
  ],
  // ── G3 English ─────────────────────────────────────────────────────────────
  "G3-english": [
    {
      sequence: 1,
      title: "Writing Simple Paragraphs",
      outcomes: [
        "Write a paragraph with a clear main idea",
        "Use correct punctuation in sentences",
        "Organise ideas in a logical order",
      ],
      lessons: [
        {
          sequence: 1,
          title: "My First Paragraph",
          objective: "By the end of this lesson, the learner should be able to write a short paragraph of 3-4 related sentences.",
          content: [
            { type: "introduction", text: "A paragraph is a group of sentences that all talk about one idea." },
            { type: "explanation", text: "Start with a main sentence, then add sentences that give more details about it.", example: "My dog is called Simba. He is brown and white. He loves to run in the garden. I feed him every morning." },
            { type: "activity", instruction: "Plan a paragraph about your favourite animal:", items: ["Write a main sentence", "Add two detail sentences", "Add an ending sentence"] },
          ],
          activities: [
            { type: "multiple_choice", question: "What should a paragraph's sentences all share?", options: ["The same length", "One main idea", "Rhyming words", "Capital letters only"], answer: "One main idea" },
            { type: "fill_blank", sentence: "A group of related sentences is called a ___.", answer: "paragraph" },
          ],
          funFact: "The longest sentence in a published novel has over 13,000 words — but good paragraphs for beginners stay short!",
        },
      ],
    },
  ],
  // ── G3 Kiswahili ───────────────────────────────────────────────────────────
  "G3-kiswahili": [
    {
      sequence: 1,
      title: "Kusoma na Kuandika Sentensi",
      outcomes: [
        "Kusoma sentensi fupi kwa ufasaha",
        "Kuandika sentensi sahihi",
        "Kutumia alama za uandishi ipasavyo",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Sentensi Yangu ya Kwanza",
          objective: "By the end of this lesson, the learner should be able to write a simple, correctly punctuated Kiswahili sentence.",
          content: [
            { type: "introduction", text: "Sentensi ni maneno yaliyopangwa vizuri ili kutoa maana kamili." },
            { type: "explanation", text: "Sentensi huanza na herufi kubwa na huishia na alama ya kuishia, kama nukta.", example: "Mama anapika chakula. Watoto wanacheza nje." },
            { type: "activity", instruction: "Tunga sentensi kuhusu picha hizi:", items: ["Mvulana anasoma kitabu.", "Msichana anaimba wimbo.", "Mbwa anakimbia shambani."] },
          ],
          activities: [
            { type: "multiple_choice", question: "Sentensi huanza na herufi gani?", options: ["Ndogo", "Kubwa", "Namba", "Alama"], answer: "Kubwa" },
            { type: "fill_blank", sentence: "Mama ___ chakula.", answer: "anapika" },
          ],
          funFact: "Kiswahili is one of the official languages of the African Union!",
        },
      ],
    },
  ],
  // ── G3 Mathematics ─────────────────────────────────────────────────────────
  "G3-mathematics": [
    {
      sequence: 1,
      title: "Multiplication Tables 1 to 5",
      outcomes: [
        "Recite multiplication tables for 1 to 5",
        "Solve simple multiplication problems",
        "Relate multiplication to repeated addition",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Multiplying by 2",
          objective: "By the end of this lesson, the learner should be able to multiply single-digit numbers by 2.",
          content: [
            { type: "introduction", text: "Multiplication is a fast way to add the same number many times!" },
            { type: "explanation", text: "Multiplying by 2 means adding a number to itself.", example: "3 x 2 means 3 + 3 = 6. So 3 x 2 = 6." },
            { type: "activity", instruction: "Work these out using repeated addition:", items: ["4 x 2 = 4 + 4 = ?", "5 x 2 = 5 + 5 = ?", "6 x 2 = 6 + 6 = ?"] },
          ],
          activities: [
            { type: "multiple_choice", question: "What is 7 x 2?", options: ["12", "14", "16", "9"], answer: "14" },
            { type: "fill_blank", sentence: "5 x 2 = ___.", answer: "10" },
          ],
          funFact: "The multiplication sign '×' was first used in a math book printed in 1631!",
        },
      ],
    },
  ],
  // ── G3 Environmental & Social Studies ─────────────────────────────────────
  "G3-ess": [
    {
      sequence: 1,
      title: "Counties of Kenya",
      outcomes: [
        "Name several counties of Kenya",
        "Locate their own county on a simple map",
        "Describe one feature of their county",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Kenya Has 47 Counties",
          objective: "By the end of this lesson, the learner should be able to name at least five Kenyan counties.",
          content: [
            { type: "introduction", text: "Kenya is divided into 47 counties, each with its own special features!" },
            { type: "explanation", text: "A county is a region of Kenya with its own local government. Examples include Nairobi, Mombasa, Kisumu, Nakuru, and Kiambu.", example: "Mombasa County is known for its beaches. Nakuru County is known for its lakes." },
            { type: "activity", instruction: "Name a county and one thing it is known for:", items: ["Which county do you live in?", "What is your county known for?"] },
          ],
          activities: [
            { type: "multiple_choice", question: "How many counties does Kenya have?", options: ["25", "36", "47", "52"], answer: "47" },
            { type: "fill_blank", sentence: "Mombasa County is known for its ___.", answer: "beaches" },
          ],
          funFact: "Kenya's counties were created under the 2010 Constitution to bring government services closer to the people!",
        },
      ],
    },
  ],
  // ── G3 Creative Arts & Sports ──────────────────────────────────────────────
  "G3-creative-arts": [
    {
      sequence: 1,
      title: "Music and Rhythm",
      outcomes: [
        "Identify simple musical instruments",
        "Keep a steady beat using clapping or drumming",
        "Sing a song as part of a group",
      ],
      lessons: [
        {
          sequence: 1,
          title: "Finding the Beat",
          objective: "By the end of this lesson, the learner should be able to keep a steady beat while singing a simple song.",
          content: [
            { type: "introduction", text: "Music has a heartbeat too — we call it rhythm! Let's find it together." },
            { type: "explanation", text: "Rhythm is a repeated pattern of sound. You can make rhythm by clapping, tapping, or drumming.", example: "Clap: 1-2-3-4, 1-2-3-4 — that steady pattern is a rhythm." },
            { type: "activity", instruction: "Clap along to this pattern:", items: ["Clap, clap, pause, clap", "Clap, pause, clap, clap", "Repeat it faster!"] },
          ],
          activities: [
            { type: "multiple_choice", question: "What do we call a repeated pattern of sound?", options: ["Melody", "Rhythm", "Silence", "Pitch"], answer: "Rhythm" },
          ],
          funFact: "The traditional Kenyan drum, the 'ngoma', has been used for both music and communication for centuries!",
        },
      ],
    },
  ],
  // ── G3 Religious Education ─────────────────────────────────────────────────
  "G3-religious-education": [
    {
      sequence: 1,
      title: "Respecting Different Beliefs",
      outcomes: [
        "Explain that people hold different beliefs",
        "Show respect for people of other faiths",
        "Describe one value shared across many beliefs",
      ],
      lessons: [
        {
          sequence: 1,
          title: "We Are Different, We Are Friends",
          objective: "By the end of this lesson, the learner should be able to explain why we should respect people of different beliefs.",
          content: [
            { type: "introduction", text: "In Kenya, families follow many different beliefs — and that is something to celebrate!" },
            { type: "explanation", text: "Even when people believe different things, most beliefs teach kindness, honesty, and caring for others.", example: "A classmate may pray differently from you, but you can still be great friends." },
            { type: "activity", instruction: "Think about a value most beliefs share:", items: ["Being honest", "Being kind", "Helping others"] },
          ],
          activities: [
            { type: "multiple_choice", question: "How should we treat classmates with different beliefs?", options: ["Ignore them", "With respect", "Avoid them", "Make fun of them"], answer: "With respect" },
          ],
          funFact: "Kenya's constitution protects the freedom of every person to follow their own religion!",
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
    // NOTE: all four upserts below actually update on conflict (not `update: {}`).
    // Seeding runs on every deploy -- a no-op update silently discards any future
    // edit to already-seeded data, which is exactly how a `mediaKind` content fix
    // never reached production last session (the lesson row already existed).
    const grade = await db.grade.upsert({
      where: { code: gradeData.code },
      update: { name: gradeData.name, ageRange: gradeData.ageRange, order: gradeData.order },
      create: gradeData,
    });
    console.log(`  ✓ Grade: ${grade.name}`);

    const subjects = subjectsByGrade[gradeData.code] ?? [];
    for (const subjectData of subjects) {
      const subject = await db.subject.upsert({
        where: { gradeId_slug: { gradeId: grade.id, slug: subjectData.slug } },
        update: { name: subjectData.name, icon: subjectData.icon, color: subjectData.color },
        create: { ...subjectData, gradeId: grade.id },
      });

      const unitKey = `${gradeData.code}-${subjectData.slug}`;
      const units = seedUnits[unitKey] ?? [];

      for (const unitData of units) {
        const unit = await db.unit.upsert({
          where: { subjectId_sequence: { subjectId: subject.id, sequence: unitData.sequence } },
          update: {
            title: unitData.title,
            outcomes: unitData.outcomes,
            ...(unitData.targetLessonCount != null ? { targetLessonCount: unitData.targetLessonCount } : {}),
          },
          create: {
            subjectId: subject.id,
            sequence: unitData.sequence,
            title: unitData.title,
            outcomes: unitData.outcomes,
            ...(unitData.targetLessonCount != null ? { targetLessonCount: unitData.targetLessonCount } : {}),
          },
        });

        for (const lessonData of unitData.lessons) {
          // Keyed on unitId+sequence, which only this seed script ever defines --
          // ai-generated lessons get sequence numbers beyond what's listed here, so
          // this can never clobber those.
          await db.lesson.upsert({
            where: { unitId_sequence: { unitId: unit.id, sequence: lessonData.sequence } },
            update: {
              title: lessonData.title,
              objective: lessonData.objective,
              content: lessonData.content as never,
              activities: lessonData.activities as never,
              funFact: lessonData.funFact,
              source: "seed",
            },
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
