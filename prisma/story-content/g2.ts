import type { StoryMap } from "./types";

// G2 — "Story Reader": 12 pages, 3-4 sentences per page, at most 14 words each.
// Past tense, compound words, contractions and simple dialogue with speech marks.
// Stories at this level carry a real problem and a resolution, not just a sequence.

export const g2Stories: StoryMap = {
  "G2-english-1": {
    title: "Jina and the Lost Notebook",
    objective: "Follow a story from its problem to how it is solved.",
    readingLevel: "G2",
    pages: [
      {
        text: "Jina's notebook was missing. She had written her best story in it. She looked under her bed and found only dust.",
        imageQuery: "exercise notebook",
      },
      {
        text: "\"When did you last have it?\" asked her brother Kip. Jina thought hard. She could not remember at all.",
        imageQuery: "boy asking question",
      },
      {
        text: "\"Start at the beginning,\" said Kip. \"Where did you go yesterday?\" That was a good idea.",
        imageQuery: "children talking",
      },
      {
        text: "Jina listed the places out loud. School, then the shop, then the water tap, then home.",
        imageQuery: "village path",
      },
      {
        text: "They walked back to school first. Her desk was empty. The classroom floor was swept clean.",
        imageQuery: "empty classroom desk",
      },
      {
        text: "Next they tried the shop. The shopkeeper shook his head kindly. \"Nothing has been left here,\" he said.",
        imageQuery: "shopkeeper",
      },
      {
        text: "Jina's chest felt tight. That story had taken her three whole days to write.",
        imageQuery: "sad child",
      },
      {
        text: "\"One place left,\" said Kip. \"The water tap.\" They ran the whole way there.",
        imageQuery: "water tap village",
      },
      {
        text: "A woman was filling a jerrycan. Beside her, on the low wall, sat the notebook.",
        imageQuery: "jerrycan water",
      },
      {
        text: "\"I found it here yesterday,\" she said. \"I left it where the owner would look.\"",
        imageQuery: "kind woman",
      },
      {
        text: "Jina held it tight. Her story was still there, every single word of it.",
        imageQuery: "child holding notebook",
      },
      {
        text: "On the way home she told Kip her plan. Next time, she would write her name on the cover.",
        imageQuery: "writing name on book",
      },
    ],
    vocabulary: ["notebook", "missing", "remember", "search", "found"],
    activities: [
      {
        type: "multiple_choice",
        question: "Where was the notebook finally found?",
        options: ["At the water tap", "At the shop", "At school", "Under the bed"],
        answer: "At the water tap",
      },
      {
        type: "multiple_choice",
        question: "What did Kip tell Jina to do?",
        options: ["Start at the beginning", "Buy a new one", "Ask the teacher", "Give up looking"],
        answer: "Start at the beginning",
      },
      {
        type: "fill_blank",
        sentence: "Next time, Jina would write her ___ on the cover.",
        answer: "name",
      },
      {
        type: "reflection",
        prompt: "Jina retraced her steps in order. What would you do first if you lost something important?",
      },
    ],
    games: [
      {
        type: "pair-match",
        title: "Who said what?",
        pairs: [
          { left: "Kip", right: "Start at the beginning" },
          { left: "The shopkeeper", right: "Nothing has been left here" },
          { left: "The woman", right: "I found it here yesterday" },
          { left: "Jina", right: "I will write my name on it" },
        ],
      },
    ],
    funFact: "Retracing your steps really works — your memory stores places and events together.",
  },

  "G2-kiswahili-1": {
    title: "Wiki ya Jina",
    objective: "Kutaja siku saba za wiki kwa mpangilio sahihi.",
    readingLevel: "G2",
    pages: [
      {
        text: "Jina alikuwa na daftari dogo la rangi ya bluu. Ndani yake aliandika kila siku ya wiki. Alitaka kukumbuka kila kitu.",
        imageQuery: "blue notebook",
      },
      {
        text: "Jumatatu alienda shuleni mapema. Mwalimu aliwafundisha hesabu. Jina alipata majibu yote sahihi.",
        imageQuery: "school mathematics class",
      },
      {
        text: "Jumanne alicheza mpira na rafiki zake. Walicheza hadi jua lilipozama. Miguu yake ilikuwa na vumbi.",
        imageQuery: "children playing football",
      },
      {
        text: "Jumatano alimsaidia mama sokoni. Walipanga nyanya na mboga. Wateja wengi walikuja.",
        imageQuery: "market vegetables tomatoes",
      },
      {
        text: "Alhamisi alisoma hadithi darasani. Wanafunzi wote walimsikiliza kwa makini. Mwalimu alimpongeza.",
        imageQuery: "child reading aloud class",
      },
      {
        text: "Ijumaa alienda kwa bibi yake. Bibi alimpikia chapati tamu. Walizungumza hadi usiku.",
        imageQuery: "grandmother cooking chapati",
      },
      {
        text: "Jumamosi alifua nguo zake. Kisha alilala kidogo chini ya mti. Upepo ulikuwa mzuri.",
        imageQuery: "washing clothes outside",
      },
      {
        text: "Jumapili familia yote ilikutana. Walikula pamoja na kucheka sana. Ilikuwa siku ya raha.",
        imageQuery: "family meal together",
      },
      {
        text: "Usiku Jina alisoma daftari lake tena. Aliona siku saba zilizojaa mambo mengi.",
        imageQuery: "child reading diary",
      },
      {
        text: "Alihesabu kwa vidole. Jumatatu, Jumanne, Jumatano, Alhamisi.",
        imageQuery: "counting fingers",
      },
      {
        text: "Ijumaa, Jumamosi, Jumapili. Siku saba kamili!",
        imageQuery: "calendar week",
      },
      {
        text: "Wiki moja imekwisha, alisema Jina. Kesho tunaanza upya.",
        imageQuery: "sunrise new day",
      },
    ],
    vocabulary: ["Jumatatu", "Jumanne", "Alhamisi", "Ijumaa", "Jumapili"],
    activities: [
      {
        type: "multiple_choice",
        question: "Jina alienda sokoni na mama siku gani?",
        options: ["Jumatano", "Jumatatu", "Ijumaa", "Jumapili"],
        answer: "Jumatano",
      },
      {
        type: "multiple_choice",
        question: "Siku gani inafuata baada ya Alhamisi?",
        options: ["Ijumaa", "Jumanne", "Jumamosi", "Jumatatu"],
        answer: "Ijumaa",
      },
      {
        type: "fill_blank",
        sentence: "Wiki moja ina siku ___.",
        answer: "saba",
      },
    ],
    games: [
      {
        type: "pair-match",
        title: "Siku na tukio lake",
        pairs: [
          { left: "Jumatatu", right: "Shuleni mapema" },
          { left: "Jumanne", right: "Kucheza mpira" },
          { left: "Jumatano", right: "Sokoni na mama" },
          { left: "Ijumaa", right: "Kwa bibi" },
          { left: "Jumapili", right: "Familia yote" },
        ],
      },
    ],
    funFact: "Kwa Kiswahili, Jumatatu maana yake ni siku ya kwanza baada ya Jumapili.",
  },

  "G2-mathematics-1": {
    title: "The Market Day Puzzle",
    objective: "Add and subtract within twenty to solve a real problem.",
    readingLevel: "G2",
    pages: [
      {
        text: "Every Wednesday, Jina helped her mother at the market stall. Her job was the money tin. She took it very seriously.",
        imageQuery: "market stall kenya",
      },
      {
        text: "They started the morning with twelve tomatoes. Jina counted them twice to be sure.",
        imageQuery: "tomatoes basket",
      },
      {
        text: "A teacher bought five tomatoes. Jina counted what was left. Twelve take five is seven, she said.",
        imageQuery: "buying tomatoes",
      },
      {
        text: "Then her uncle arrived with a full sack. He added eight more tomatoes to the pile.",
        imageQuery: "sack of tomatoes",
      },
      {
        text: "Seven and eight, thought Jina. She counted on from seven. Fifteen tomatoes.",
        imageQuery: "counting on fingers",
      },
      {
        text: "A man in a blue coat bought four. Fifteen take four is eleven, said Jina quickly.",
        imageQuery: "man buying vegetables",
      },
      {
        text: "Her mother raised an eyebrow. \"Are you certain?\" she asked. Jina checked again.",
        imageQuery: "mother questioning",
      },
      {
        text: "Eleven was right. Her mother smiled. \"Always check. Money and numbers deserve care.\"",
        imageQuery: "smiling market woman",
      },
      {
        text: "By noon only three tomatoes were left. Jina wrote the numbers in the dust with a stick.",
        imageQuery: "writing in sand",
      },
      {
        text: "Twelve minus five, plus eight, minus four, minus eight more. It all worked out.",
        imageQuery: "arithmetic numbers",
      },
      {
        text: "\"You did the whole day's sums in your head,\" said her mother. Jina felt very tall.",
        imageQuery: "proud child",
      },
      {
        text: "They packed up the stall together. The money tin was heavy, and that was the best answer of all.",
        imageQuery: "money tin coins",
      },
    ],
    vocabulary: ["market", "count", "left", "added", "check"],
    activities: [
      {
        type: "multiple_choice",
        question: "They started with 12 tomatoes and sold 5. How many were left?",
        options: ["7", "8", "6", "17"],
        answer: "7",
      },
      {
        type: "multiple_choice",
        question: "Then 8 more were added to the 7. How many now?",
        options: ["15", "14", "16", "13"],
        answer: "15",
      },
      {
        type: "multiple_choice",
        question: "From 15, a man bought 4. How many were left?",
        options: ["11", "12", "10", "9"],
        answer: "11",
      },
    ],
    games: [
      {
        type: "number-pop",
        title: "Market maths",
        rounds: [
          { prompt: "12 - 5 = ?", answer: "7", distractors: ["8", "6", "17"] },
          { prompt: "7 + 8 = ?", answer: "15", distractors: ["14", "16", "13"] },
          { prompt: "15 - 4 = ?", answer: "11", distractors: ["12", "10", "19"] },
          { prompt: "11 + 6 = ?", answer: "17", distractors: ["16", "18", "15"] },
          { prompt: "20 - 8 = ?", answer: "12", distractors: ["11", "13", "14"] },
        ],
      },
    ],
    funFact: "Checking your answer a second time is what real shopkeepers and bankers do every day.",
  },

  "G2-ess-1": {
    title: "Jina's Neighbourhood Map",
    objective: "Describe the important places in your neighbourhood and where they are.",
    readingLevel: "G2",
    pages: [
      {
        text: "Jina's teacher gave the class a strange task. \"Draw a map of your neighbourhood,\" she said. \"Show me where everything is.\"",
        imageQuery: "teacher classroom map",
      },
      {
        text: "Jina had walked those roads a thousand times. But she had never really looked at them.",
        imageQuery: "village road",
      },
      {
        text: "On Saturday she took a pencil and a big sheet of paper. She started at her own front door.",
        imageQuery: "child drawing map",
      },
      {
        text: "She drew her house first, with its red roof. Then the path that ran past it.",
        imageQuery: "house with red roof",
      },
      {
        text: "To the left was the health clinic. A nurse in white was always outside in the morning.",
        imageQuery: "health clinic africa",
      },
      {
        text: "Straight ahead was the primary school, with its long blue gate and dusty field.",
        imageQuery: "primary school gate",
      },
      {
        text: "Behind the school was the market. On Wednesdays it filled with voices and colour.",
        imageQuery: "busy market",
      },
      {
        text: "To the right stood the water tap and the tall church with the tin roof.",
        imageQuery: "church tin roof",
      },
      {
        text: "Jina added the big fig tree where the old men sat and talked every afternoon.",
        imageQuery: "large fig tree",
      },
      {
        text: "She marked the bus stop last, where the matatus stopped and hooted.",
        imageQuery: "matatu bus stop",
      },
      {
        text: "When she finished, she stepped back. Her whole world fitted on one page.",
        imageQuery: "hand drawn map",
      },
      {
        text: "\"A neighbourhood is not just houses,\" she told the class. \"It is the places that take care of us.\"",
        imageQuery: "child presenting class",
      },
    ],
    vocabulary: ["neighbourhood", "clinic", "market", "church", "school"],
    activities: [
      {
        type: "multiple_choice",
        question: "What was to the left of Jina's house?",
        options: ["The health clinic", "The school", "The market", "The church"],
        answer: "The health clinic",
      },
      {
        type: "multiple_choice",
        question: "What was behind the school?",
        options: ["The market", "The clinic", "The bus stop", "The fig tree"],
        answer: "The market",
      },
      {
        type: "reflection",
        prompt: "Name three places in your own neighbourhood. What does each one do for people?",
      },
    ],
    games: [
      {
        type: "sort-bins",
        title: "What is each place for?",
        bins: [
          { label: "For learning", icon: "📚" },
          { label: "For health", icon: "🩺" },
          { label: "For buying", icon: "🛒" },
        ],
        items: [
          { label: "School", bin: "For learning" },
          { label: "Clinic", bin: "For health" },
          { label: "Market", bin: "For buying" },
          { label: "Library", bin: "For learning" },
          { label: "Chemist", bin: "For health" },
          { label: "Shop", bin: "For buying" },
        ],
      },
    ],
    funFact: "Mapmakers call the list explaining a map's symbols a legend or a key.",
  },

  "G2-creative-arts-1": {
    title: "The Bao Champion",
    objective: "Learn how a traditional game is played and why it is valued.",
    readingLevel: "G2",
    pages: [
      {
        text: "Under the fig tree, old Mzee Kimani played bao every afternoon. Nobody in the village had ever beaten him.",
        imageQuery: "bao board game",
      },
      {
        text: "The board had rows of small hollows. Smooth seeds sat inside them, waiting.",
        imageQuery: "mancala board seeds",
      },
      {
        text: "\"Teach me,\" said Jina one day. Mzee Kimani looked up slowly and smiled.",
        imageQuery: "elderly man smiling",
      },
      {
        text: "\"You pick up the seeds from one hollow,\" he said. \"Then you drop them one by one, going round.\"",
        imageQuery: "hands playing mancala",
      },
      {
        text: "Jina tried. She scattered her seeds far too quickly and lost them all.",
        imageQuery: "seeds scattered",
      },
      {
        text: "\"Bao is not a fast game,\" said Mzee Kimani. \"It is a thinking game.\"",
        imageQuery: "thinking man",
      },
      {
        text: "She played again the next day, and the next. Each time she lost, but by less.",
        imageQuery: "children playing board game",
      },
      {
        text: "She began to see three moves ahead. Then four. The board started to make sense.",
        imageQuery: "board game strategy",
      },
      {
        text: "On the ninth day, something changed. Jina counted, paused, and moved.",
        imageQuery: "child concentrating",
      },
      {
        text: "Mzee Kimani stared at the board for a long, long time. Then he laughed out loud.",
        imageQuery: "old man laughing",
      },
      {
        text: "\"You have beaten me,\" he said. \"Not with luck. With patience.\"",
        imageQuery: "handshake respect",
      },
      {
        text: "Children still play bao under that tree. Jina teaches them now, slowly.",
        imageQuery: "children learning game",
      },
    ],
    vocabulary: ["bao", "seeds", "board", "patient", "thinking"],
    activities: [
      {
        type: "multiple_choice",
        question: "What did Jina do wrong at first?",
        options: ["She played too fast", "She cheated", "She used too few seeds", "She refused to play"],
        answer: "She played too fast",
      },
      {
        type: "multiple_choice",
        question: "What did Mzee Kimani say beat him?",
        options: ["Patience", "Luck", "Speed", "Strength"],
        answer: "Patience",
      },
      {
        type: "fill_blank",
        sentence: "Bao is not a fast game, it is a ___ game.",
        answer: "thinking",
      },
    ],
    funFact: "Bao belongs to the mancala family — one of the oldest kinds of board game on Earth.",
  },

  "G2-religious-education-1": {
    title: "Jina and the Dry River",
    objective: "Understand why we must take care of the world we share.",
    readingLevel: "G2",
    pages: [
      {
        text: "The river behind Jina's village had always run clear. Children swam in it. Cattle drank from it.",
        imageQuery: "clear river africa",
      },
      {
        text: "But this year the water sank lower and lower. By August, only a thin brown thread was left.",
        imageQuery: "dry riverbed",
      },
      {
        text: "\"Where has our river gone?\" Jina asked her grandmother. Her grandmother pointed at the hills.",
        imageQuery: "bare hills",
      },
      {
        text: "The hills had once been thick with trees. Now they stood bare and pale in the sun.",
        imageQuery: "deforested hillside",
      },
      {
        text: "\"Trees hold the rain,\" said Grandmother. \"They let it down slowly, all year long.\"",
        imageQuery: "tree roots soil",
      },
      {
        text: "\"Without them, the rain runs off in one rush and takes the soil with it.\"",
        imageQuery: "soil erosion",
      },
      {
        text: "Jina thought about that for a long time. Then she went to see her teacher.",
        imageQuery: "child talking teacher",
      },
      {
        text: "The class planted forty seedlings on the lower slope that term. It was hot, hard work.",
        imageQuery: "planting tree seedlings",
      },
      {
        text: "They carried water to them every week. Some died. Most did not.",
        imageQuery: "watering seedlings",
      },
      {
        text: "Three years later, the slope was green again. The saplings were taller than Jina.",
        imageQuery: "young trees growing",
      },
      {
        text: "The river did not return all at once. But it came back, a little more each season.",
        imageQuery: "small stream flowing",
      },
      {
        text: "\"We were given this land to look after,\" said Grandmother. \"Not to use up.\"",
        imageQuery: "green landscape kenya",
      },
    ],
    vocabulary: ["river", "trees", "planted", "soil", "care"],
    activities: [
      {
        type: "multiple_choice",
        question: "Why did the river dry up?",
        options: ["The trees on the hills were gone", "Too many people drank it", "It moved somewhere else", "The cattle drank it"],
        answer: "The trees on the hills were gone",
      },
      {
        type: "multiple_choice",
        question: "What did Jina's class do about it?",
        options: ["Planted seedlings", "Dug a well", "Moved the village", "Built a dam"],
        answer: "Planted seedlings",
      },
      {
        type: "reflection",
        prompt: "What is one thing you could do this week to look after the place where you live?",
      },
    ],
    funFact: "Kenya's Wangari Maathai won the Nobel Peace Prize for a tree-planting movement much like Jina's.",
  },
};
