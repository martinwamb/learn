import type { StoryMap } from "./types";

// G1 — "Reading On": 10 pages, 2 sentences per page, at most 10 words each.
// Adds consonant blends, plurals and simple -ing/-ed endings. Everyday Kenyan words
// (matatu, shamba, ugali) appear where the picture makes the meaning obvious.

export const g1Stories: StoryMap = {
  "G1-english-1": {
    title: "Jina Learns to Listen",
    objective: "Listen carefully to instructions, then say them back in your own words.",
    readingLevel: "G1",
    pages: [
      { text: "Jina was in a hurry. She did not listen well.", imageQuery: "giraffe running" },
      { text: "Mum said, bring me the green cup. Jina ran off fast.", imageQuery: "green cup" },
      { text: "She came back with a red plate. That was not right.", imageQuery: "red plate" },
      { text: "Mum smiled. Listen to all the words, she said.", imageQuery: "mother smiling" },
      { text: "Jina tried again. This time she stood still.", imageQuery: "giraffe standing still" },
      { text: "Bring me the green cup from the shelf, said Mum.", imageQuery: "kitchen shelf" },
      { text: "Jina said the words back. The green cup, from the shelf.", imageQuery: "child thinking" },
      { text: "She walked to the shelf. She picked the green cup.", imageQuery: "hand reaching shelf" },
      { text: "Mum clapped. You listened to every word, she said.", imageQuery: "clapping hands" },
      { text: "Now Jina always listens first, then acts.", imageQuery: "giraffe listening" },
    ],
    vocabulary: ["listen", "words", "green", "shelf", "still"],
    activities: [
      {
        type: "multiple_choice",
        question: "What did Jina bring back the first time?",
        options: ["A red plate", "A green cup", "A blue pot", "A white bowl"],
        answer: "A red plate",
      },
      {
        type: "fill_blank",
        sentence: "Jina said the words ___ before she went.",
        answer: "back",
      },
      {
        type: "multiple_choice",
        question: "What helped Jina get it right?",
        options: ["Standing still and listening", "Running faster", "Asking a friend", "Guessing"],
        answer: "Standing still and listening",
      },
    ],
    funFact: "Repeating an instruction back is called echoing — real pilots and doctors do it too.",
  },

  "G1-english-2": {
    title: "Jina Finds the Letters",
    objective: "Spot letters and their sounds in the world around you.",
    readingLevel: "G1",
    pages: [
      { text: "Jina walked to the market with her aunt. She had a new game.", imageQuery: "kenyan market" },
      { text: "Find a letter, said her aunt. Then say its sound.", imageQuery: "alphabet letters" },
      { text: "Jina saw a big S on a shop sign. Sss, said Jina.", imageQuery: "letter S sign" },
      { text: "She saw an M on a sack of maize. Mmm, said Jina.", imageQuery: "sack of maize" },
      { text: "A matatu drove past. It had a T on the door.", imageQuery: "matatu bus" },
      { text: "Tuh, said Jina. Her aunt laughed and clapped.", imageQuery: "aunt laughing" },
      { text: "Then Jina put the sounds together. Sss, mmm, tuh.", imageQuery: "child thinking letters" },
      { text: "Letters make sounds, and sounds make words, said her aunt.", imageQuery: "reading book" },
      { text: "Jina looked around again. Letters were everywhere!", imageQuery: "street signs" },
      { text: "The whole market was a book waiting to be read.", imageQuery: "open book" },
    ],
    vocabulary: ["letter", "sound", "sign", "market", "word"],
    activities: [
      {
        type: "multiple_choice",
        question: "Where did Jina see the letter S?",
        options: ["On a shop sign", "On a matatu", "On a sack", "On a book"],
        answer: "On a shop sign",
      },
      {
        type: "multiple_choice",
        question: "What sound does the letter M make?",
        options: ["Mmm", "Sss", "Tuh", "Ahh"],
        answer: "Mmm",
      },
      {
        type: "fill_blank",
        sentence: "Letters make sounds, and sounds make ___.",
        answer: "words",
      },
    ],
    games: [
      {
        type: "word-build",
        title: "Build what Jina saw",
        words: [
          { word: "shop", hint: "It had a big S on its sign.", picture: "small shop" },
          { word: "maize", hint: "It came in a big sack.", picture: "maize" },
          { word: "sign", hint: "Jina read the letters on it.", picture: "shop sign" },
        ],
      },
    ],
    funFact: "There are 26 letters in the English alphabet, but they make over 40 different sounds.",
  },

  "G1-mathematics-1": {
    title: "Ten Mangoes for Jina",
    objective: "Count objects up to ten and say how many there are.",
    readingLevel: "G1",
    pages: [
      { text: "Jina helped her uncle on the shamba. The mango tree was full.", imageQuery: "mango tree" },
      { text: "Pick ten mangoes, said her uncle. Count as you go.", imageQuery: "picking mangoes" },
      { text: "Jina picked one. Then two. Then three.", imageQuery: "three mangoes" },
      { text: "Four and five went into her basket. It was getting full.", imageQuery: "basket of mangoes" },
      { text: "Six, seven, eight, counted Jina. Her neck reached high.", imageQuery: "giraffe reaching tree" },
      { text: "Nine! One more to go, she said.", imageQuery: "single mango" },
      { text: "Ten! The basket was full of ripe mangoes.", imageQuery: "full basket mangoes" },
      { text: "Her uncle counted them too. One, two, three, four, five.", imageQuery: "counting fingers" },
      { text: "Six, seven, eight, nine, ten. You counted well, he said.", imageQuery: "uncle smiling" },
      { text: "Jina grinned. Ten was a very good number.", imageQuery: "number ten" },
    ],
    vocabulary: ["count", "ten", "basket", "ripe", "full"],
    activities: [
      {
        type: "multiple_choice",
        question: "How many mangoes did Jina pick?",
        options: ["10", "8", "5", "12"],
        answer: "10",
      },
      {
        type: "multiple_choice",
        question: "Which number comes after nine?",
        options: ["10", "8", "11", "7"],
        answer: "10",
      },
      {
        type: "fill_blank",
        sentence: "Jina picked the mangoes on the ___.",
        answer: "shamba",
      },
    ],
    games: [
      {
        type: "number-pop",
        title: "Which number comes next?",
        rounds: [
          { prompt: "What comes after 3?", answer: "4", distractors: ["2", "5", "6"] },
          { prompt: "What comes after 6?", answer: "7", distractors: ["5", "8", "9"] },
          { prompt: "What comes after 9?", answer: "10", distractors: ["8", "11", "7"] },
          { prompt: "What comes before 5?", answer: "4", distractors: ["6", "3", "7"] },
        ],
      },
    ],
    funFact: "We count in tens because people first counted on their ten fingers.",
  },

  "G1-mathematics-2": {
    title: "Jina Shares the Mangoes",
    objective: "Add two small numbers together to find how many in all.",
    readingLevel: "G1",
    pages: [
      { text: "Jina had six mangoes in her basket. Her friend Tumo had three.", imageQuery: "two baskets fruit" },
      { text: "Let us put them together, said Tumo. How many will there be?", imageQuery: "children sharing" },
      { text: "Jina counted her six first. One, two, three, four, five, six.", imageQuery: "six mangoes" },
      { text: "Then she counted on. Seven, eight, nine.", imageQuery: "counting on fingers" },
      { text: "Nine mangoes! said Jina. Six and three make nine.", imageQuery: "nine mangoes" },
      { text: "Then a bird took one away. Now there were eight.", imageQuery: "bird with fruit" },
      { text: "Tumo laughed. Nine take one is eight, he said.", imageQuery: "boy laughing" },
      { text: "They shared the eight mangoes. Four each, said Jina.", imageQuery: "sharing fruit" },
      { text: "Four and four make eight, said Tumo. That is fair.", imageQuery: "four mangoes" },
      { text: "Sharing tastes better than counting alone, said Jina.", imageQuery: "friends eating fruit" },
    ],
    vocabulary: ["add", "share", "make", "fair", "away"],
    activities: [
      {
        type: "multiple_choice",
        question: "What is 6 + 3?",
        options: ["9", "8", "10", "7"],
        answer: "9",
      },
      {
        type: "multiple_choice",
        question: "The bird took one away from nine. How many were left?",
        options: ["8", "9", "7", "10"],
        answer: "8",
      },
      {
        type: "multiple_choice",
        question: "What is 4 + 4?",
        options: ["8", "6", "9", "7"],
        answer: "8",
      },
    ],
    games: [
      {
        type: "number-pop",
        title: "Add with Jina",
        rounds: [
          { prompt: "6 + 3 = ?", answer: "9", distractors: ["8", "10", "7"] },
          { prompt: "4 + 4 = ?", answer: "8", distractors: ["6", "9", "7"] },
          { prompt: "5 + 2 = ?", answer: "7", distractors: ["6", "8", "9"] },
          { prompt: "3 + 3 = ?", answer: "6", distractors: ["5", "7", "9"] },
          { prompt: "7 + 2 = ?", answer: "9", distractors: ["8", "10", "6"] },
        ],
      },
    ],
    funFact: "Counting on from the bigger number is faster — start at 6 and count three more.",
  },

  "G1-kiswahili-1": {
    title: "Jina Anasalimia",
    objective: "Kutumia salamu za heshima kwa watu wa rika tofauti.",
    readingLevel: "G1",
    pages: [
      { text: "Ni asubuhi. Jina anaamka mapema.", imageQuery: "sunrise morning" },
      { text: "Anaona bibi yake jikoni. Anasema, shikamoo bibi.", imageQuery: "grandmother kitchen" },
      { text: "Bibi anajibu, marahaba mjukuu wangu. Anatabasamu.", imageQuery: "smiling grandmother" },
      { text: "Njiani Jina anaona rafiki yake Tumo.", imageQuery: "two friends path" },
      { text: "Anasema, habari yako Tumo? Tumo anajibu, nzuri sana.", imageQuery: "children greeting" },
      { text: "Wanakwenda shuleni pamoja. Wanacheka njiani.", imageQuery: "children walking school" },
      { text: "Darasani mwalimu anauliza, hamjambo wanafunzi?", imageQuery: "teacher classroom" },
      { text: "Wanafunzi wanajibu kwa sauti, hatujambo mwalimu.", imageQuery: "students answering" },
      { text: "Jina anajua salamu nyingi sasa. Anafurahi sana.", imageQuery: "happy child" },
      { text: "Salamu ni heshima. Heshima ni tabia njema.", imageQuery: "respect greeting" },
    ],
    vocabulary: ["shikamoo", "marahaba", "habari", "asante", "heshima"],
    activities: [
      {
        type: "multiple_choice",
        question: "Jina anamsalimia bibi yake vipi?",
        options: ["Shikamoo", "Kwaheri", "Samahani", "Tafadhali"],
        answer: "Shikamoo",
      },
      {
        type: "multiple_choice",
        question: "Bibi anajibu nini?",
        options: ["Marahaba", "Asante", "Kwaheri", "Pole"],
        answer: "Marahaba",
      },
      {
        type: "fill_blank",
        sentence: "Mwalimu anauliza, hamjambo wanafunzi? Wanafunzi wanajibu, ___ mwalimu.",
        answer: "hatujambo",
      },
    ],
    games: [
      {
        type: "pair-match",
        title: "Salamu na majibu yake",
        pairs: [
          { left: "Shikamoo", right: "Marahaba" },
          { left: "Hamjambo", right: "Hatujambo" },
          { left: "Habari yako", right: "Nzuri sana" },
          { left: "Asante", right: "Karibu" },
        ],
      },
    ],
    funFact: "Shikamoo ni salamu ya heshima kwa mtu mzima. Jibu lake sahihi ni marahaba.",
  },

  "G1-ess-1": {
    title: "Jina's Big Family",
    objective: "Name the people in your family and what each one does.",
    readingLevel: "G1",
    pages: [
      { text: "Jina lives in a house with a red roof. It is never quiet.", imageQuery: "house red roof" },
      { text: "Her mother sells vegetables at the market. She wakes up first.", imageQuery: "market vegetables" },
      { text: "Her father mends bicycles. His hands are always busy.", imageQuery: "bicycle repair" },
      { text: "Her big brother Kip goes to a school far away.", imageQuery: "boy school uniform" },
      { text: "Her little sister Neema is only two. She follows Jina everywhere.", imageQuery: "toddler girl" },
      { text: "Her grandmother tells stories at night. Everyone listens.", imageQuery: "grandmother storytelling" },
      { text: "On Saturday they all cook together. Ugali and greens.", imageQuery: "ugali food" },
      { text: "Jina helps wash the plates. Neema tries to help too.", imageQuery: "washing dishes" },
      { text: "Everyone in the family does something, said Grandmother.", imageQuery: "family together" },
      { text: "Jina looked around the room. That is what a family is.", imageQuery: "happy family home" },
    ],
    vocabulary: ["family", "mother", "father", "sister", "help"],
    activities: [
      {
        type: "multiple_choice",
        question: "What does Jina's father do?",
        options: ["Mends bicycles", "Sells vegetables", "Tells stories", "Teaches school"],
        answer: "Mends bicycles",
      },
      {
        type: "multiple_choice",
        question: "Who tells stories at night?",
        options: ["Grandmother", "Neema", "Kip", "Father"],
        answer: "Grandmother",
      },
      {
        type: "fill_blank",
        sentence: "Jina's little sister is called ___.",
        answer: "Neema",
      },
    ],
    games: [
      {
        type: "pair-match",
        title: "Who does what?",
        pairs: [
          { left: "Mother", right: "Sells vegetables" },
          { left: "Father", right: "Mends bicycles" },
          { left: "Grandmother", right: "Tells stories" },
          { left: "Jina", right: "Washes the plates" },
        ],
      },
    ],
    funFact: "In Kenya, many families live with grandparents, aunts and cousins all in one home.",
  },

  "G1-religious-education-1": {
    title: "Jina Tells the Truth",
    objective: "Tell the truth even when it is hard.",
    readingLevel: "G1",
    pages: [
      { text: "Jina was playing near the shelf. Her tail swung too fast.", imageQuery: "giraffe tail" },
      { text: "Crash! Grandmother's clay bowl fell and broke in two.", imageQuery: "broken clay bowl" },
      { text: "Jina's heart beat hard. Nobody had seen her.", imageQuery: "worried child" },
      { text: "She could hide the pieces. Nobody would ever know.", imageQuery: "hiding something" },
      { text: "But her chest felt heavy, like a stone was in it.", imageQuery: "sad child" },
      { text: "Grandmother came in. Who broke my bowl, she asked.", imageQuery: "grandmother asking" },
      { text: "Jina took a big breath. It was me, she said.", imageQuery: "child confessing" },
      { text: "Grandmother was quiet. Then she said, thank you for telling me.", imageQuery: "kind grandmother" },
      { text: "The bowl can be mended. Trust is harder to mend.", imageQuery: "mended pottery" },
      { text: "The stone in Jina's chest was gone. Truth felt light.", imageQuery: "relieved happy child" },
    ],
    vocabulary: ["truth", "broke", "hide", "trust", "told"],
    activities: [
      {
        type: "multiple_choice",
        question: "What did Jina break?",
        options: ["A clay bowl", "A window", "A cup", "A chair"],
        answer: "A clay bowl",
      },
      {
        type: "multiple_choice",
        question: "What did Jina do in the end?",
        options: ["She told the truth", "She hid the pieces", "She blamed her brother", "She ran away"],
        answer: "She told the truth",
      },
      {
        type: "reflection",
        prompt: "Think of a time telling the truth was hard. What happened after you told it?",
      },
    ],
    funFact: "Grandmother was right — a broken pot can be mended, and in Japan they mend them with gold.",
  },
};
