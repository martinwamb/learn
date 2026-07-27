import type { StoryMap } from "./types";

// G3 — "Confident Reader": 14 pages, 4-5 sentences per page, at most 18 words each.
// Dialogue with speech marks, multi-clause sentences joined with because/although/while,
// and richer description. These carry a full arc with a turn the reader has to follow.

export const g3Stories: StoryMap = {
  "G3-english-1": {
    title: "Jina Writes a Letter",
    objective: "Organise your ideas into paragraphs that each hold one main point.",
    readingLevel: "G3",
    pages: [
      {
        text: "The old footbridge over the stream had a hole in it. Jina had nearly fallen through it twice. Everyone complained about it, but nobody did anything. \"Somebody should tell the council,\" people said.",
        imageQuery: "old wooden footbridge",
      },
      {
        text: "One evening Jina decided that somebody would be her. She found a clean sheet of paper and sat at the table. Then she stared at it for ten whole minutes.",
        imageQuery: "blank paper pencil",
      },
      {
        text: "Everything she wanted to say arrived at once, all jumbled together. The hole, the children, the rain, the danger, the rotten wood. She wrote three lines and crossed them all out.",
        imageQuery: "crossed out writing",
      },
      {
        text: "Her brother Kip looked over her shoulder. \"You are trying to say five things in one sentence,\" he said. \"Slow down.\"",
        imageQuery: "brother helping homework",
      },
      {
        text: "\"Put one idea in each paragraph,\" he told her. \"A paragraph is a box. One idea goes in each box, and the boxes go in order.\"",
        imageQuery: "notebook paragraphs",
      },
      {
        text: "Jina thought about it. She had three ideas, so she needed three boxes. She wrote each one at the top of a page.",
        imageQuery: "planning notes",
      },
      {
        text: "Her first box was the problem. The bridge has a hole in the third plank, and it is getting wider each month.",
        imageQuery: "broken plank bridge",
      },
      {
        text: "Her second box was why it mattered. Forty children cross that bridge to school every morning, and after rain the wood is slippery.",
        imageQuery: "children crossing bridge",
      },
      {
        text: "Her third box was what she wanted. Please send someone to replace the plank before the long rains begin.",
        imageQuery: "repairing wood",
      },
      {
        text: "Once the boxes were full, the letter almost wrote itself. Each paragraph knew exactly what its job was.",
        imageQuery: "writing a letter",
      },
      {
        text: "She read it aloud to Kip. He nodded slowly. \"Now anyone can follow it,\" he said. \"That is the whole point.\"",
        imageQuery: "reading aloud",
      },
      {
        text: "Jina copied it out neatly, signed her name, and walked it to the council office herself.",
        imageQuery: "posting a letter",
      },
      {
        text: "Nothing happened for three weeks. Jina began to think the letter had been thrown away.",
        imageQuery: "waiting patiently",
      },
      {
        text: "Then, on a Tuesday, two men arrived with fresh timber. The new plank was pale and strong. Jina crossed it on the way to school and smiled the whole way.",
        imageQuery: "new bridge plank",
      },
    ],
    vocabulary: ["paragraph", "letter", "problem", "council", "reason"],
    activities: [
      {
        type: "multiple_choice",
        question: "What advice did Kip give Jina?",
        options: [
          "Put one idea in each paragraph",
          "Write it all in one paragraph",
          "Ask an adult to write it",
          "Make the letter shorter",
        ],
        answer: "Put one idea in each paragraph",
      },
      {
        type: "multiple_choice",
        question: "What did Jina's second paragraph explain?",
        options: ["Why the problem mattered", "What the problem was", "What she wanted done", "Who she was"],
        answer: "Why the problem mattered",
      },
      {
        type: "fill_blank",
        sentence: "A paragraph is like a box, and one ___ goes in each box.",
        answer: "idea",
      },
      {
        type: "reflection",
        prompt: "Think of something you would like to change. What three paragraphs would your letter need?",
      },
    ],
    games: [
      {
        type: "sort-bins",
        title: "Which paragraph does it belong in?",
        bins: [
          { label: "The problem", icon: "❗" },
          { label: "Why it matters", icon: "💭" },
          { label: "What I want", icon: "✅" },
        ],
        items: [
          { label: "There is a hole in the plank", bin: "The problem" },
          { label: "Forty children cross daily", bin: "Why it matters" },
          { label: "Please replace the plank", bin: "What I want" },
          { label: "The wood is rotten", bin: "The problem" },
          { label: "It is slippery after rain", bin: "Why it matters" },
          { label: "Send someone before the rains", bin: "What I want" },
        ],
      },
    ],
    funFact: "The word paragraph comes from a Greek mark scribes drew beside a line to show a new idea began.",
  },

  "G3-kiswahili-1": {
    title: "Barua ya Jina",
    objective: "Kuandika sentensi kamili zenye mpangilio mzuri na maana wazi.",
    readingLevel: "G3",
    pages: [
      {
        text: "Jina alipokea barua kutoka kwa binamu yake Zawadi. Zawadi alikuwa amehamia mji wa Mombasa mwaka uliopita. Barua ilikuwa ndefu na yenye habari nyingi.",
        imageQuery: "letter envelope",
      },
      {
        text: "Zawadi aliandika kuhusu bahari. Alisema maji yake ni ya buluu na yana chumvi. Aliandika pia kuhusu upepo wa jioni.",
        imageQuery: "ocean coast mombasa",
      },
      {
        text: "Jina alisoma barua mara tatu. Kila mara aliona kitu kipya ambacho hakukiona awali.",
        imageQuery: "child reading letter",
      },
      {
        text: "Aliamua kumjibu binamu yake siku hiyo hiyo. Alichukua kalamu na karatasi safi.",
        imageQuery: "pen and paper",
      },
      {
        text: "Lakini alipoanza kuandika, sentensi zake zilikuwa fupi mno. \"Nimefurahi. Asante. Kwaheri.\" Hiyo haikutosha.",
        imageQuery: "short writing",
      },
      {
        text: "Mwalimu wake alikuwa amemfundisha kitu muhimu. Sentensi kamili ina kiima na kiarifu.",
        imageQuery: "teacher explaining",
      },
      {
        text: "Kiima ni mtendaji, yaani anayefanya kitendo. Kiarifu ni kitendo chenyewe pamoja na maelezo yake.",
        imageQuery: "grammar lesson",
      },
      {
        text: "Jina alijaribu tena. \"Mimi ninafurahi sana kupokea barua yako.\" Sasa sentensi ilikuwa kamili.",
        imageQuery: "writing sentence",
      },
      {
        text: "Aliendelea kuandika. Alimweleza kuhusu shamba la mahindi lililokuwa nyuma ya nyumba yao.",
        imageQuery: "maize farm",
      },
      {
        text: "Alimweleza kuhusu mvua iliyonyesha wiki iliyopita. Ardhi ilikuwa nyekundu na laini baada ya mvua.",
        imageQuery: "rain on red soil",
      },
      {
        text: "Alimweleza kuhusu mbuzi wa jirani aliyekula nguo zilizoanikwa. Jambo hilo lilimchekesha sana.",
        imageQuery: "goat eating",
      },
      {
        text: "Alipomaliza, barua yake ilikuwa na kurasa mbili kamili. Kila sentensi ilikuwa na maana wazi.",
        imageQuery: "two page letter",
      },
      {
        text: "Alisoma barua yake kwa sauti. Alisikia kwamba sasa ilikuwa kama mazungumzo, si orodha ya maneno.",
        imageQuery: "reading aloud child",
      },
      {
        text: "Aliipeleka posta asubuhi iliyofuata. Alijua kwamba Zawadi angeisoma mara tatu, kama yeye alivyofanya.",
        imageQuery: "post office",
      },
    ],
    vocabulary: ["barua", "sentensi", "kiima", "kiarifu", "maana"],
    activities: [
      {
        type: "multiple_choice",
        question: "Sentensi kamili ina vitu gani viwili?",
        options: ["Kiima na kiarifu", "Herufi na maneno", "Jina na tarehe", "Swali na jibu"],
        answer: "Kiima na kiarifu",
      },
      {
        type: "multiple_choice",
        question: "Zawadi aliandika kuhusu nini?",
        options: ["Bahari ya Mombasa", "Shamba la mahindi", "Mbuzi wa jirani", "Mvua ya wiki iliyopita"],
        answer: "Bahari ya Mombasa",
      },
      {
        type: "fill_blank",
        sentence: "Kiima ni ___, yaani anayefanya kitendo.",
        answer: "mtendaji",
      },
    ],
    funFact: "Neno barua limetokana na Kiarabu, kama maneno mengi ya Kiswahili yanayohusu biashara na safari.",
  },

  "G3-mathematics-1": {
    title: "The Tea Farm Rows",
    objective: "Use multiplication to count things arranged in equal rows.",
    readingLevel: "G3",
    pages: [
      {
        text: "Jina's aunt managed a small tea farm on the slopes above the town. The bushes grew in neat green rows. From above, they looked like lines ruled on a page.",
        imageQuery: "tea plantation rows",
      },
      {
        text: "\"I need to know how many bushes we have,\" said her aunt. \"The buyer is asking.\" Jina offered to count them all.",
        imageQuery: "tea bushes kenya",
      },
      {
        text: "She started at the first row and counted one bush at a time. By the third row her voice was tired and she had lost her place.",
        imageQuery: "tired counting",
      },
      {
        text: "Her aunt watched, amused. \"You are counting like someone with all day,\" she said. \"Look at the shape of the field.\"",
        imageQuery: "farm field aerial",
      },
      {
        text: "Jina looked properly for the first time. Every single row held exactly five bushes. Not one row was different.",
        imageQuery: "five plants row",
      },
      {
        text: "\"If each row has five,\" said her aunt, \"then two rows have?\" Jina answered at once. \"Ten.\"",
        imageQuery: "two rows plants",
      },
      {
        text: "\"And three rows?\" \"Fifteen.\" \"Four?\" \"Twenty.\" Jina was speaking faster now, feeling the pattern arrive.",
        imageQuery: "counting pattern",
      },
      {
        text: "\"That is multiplication,\" said her aunt. \"You are not counting bushes any more. You are counting rows.\"",
        imageQuery: "teaching maths outdoors",
      },
      {
        text: "They walked to the top of the slope together and counted the rows instead. There were nine of them.",
        imageQuery: "hillside farm",
      },
      {
        text: "Nine rows of five. Jina worked it through in her head, five at a time, and reached forty-five.",
        imageQuery: "mental arithmetic",
      },
      {
        text: "Her aunt checked it on paper. Nine times five is forty-five. Jina had it exactly right.",
        imageQuery: "checking calculation",
      },
      {
        text: "\"It took me eleven minutes the slow way,\" said Jina, \"and about eleven seconds this way.\"",
        imageQuery: "stopwatch time",
      },
      {
        text: "Her aunt laughed. \"That is why multiplication exists. It is counting, made short.\"",
        imageQuery: "aunt laughing farm",
      },
      {
        text: "Walking home, Jina saw rows everywhere. Roof tiles, market stalls, desks in the classroom. All of them waiting to be multiplied.",
        imageQuery: "roof tiles pattern",
      },
    ],
    vocabulary: ["multiply", "rows", "equal", "pattern", "total"],
    activities: [
      {
        type: "multiple_choice",
        question: "How many bushes were in each row?",
        options: ["5", "9", "4", "10"],
        answer: "5",
      },
      {
        type: "multiple_choice",
        question: "There were 9 rows of 5. How many bushes in all?",
        options: ["45", "40", "50", "35"],
        answer: "45",
      },
      {
        type: "fill_blank",
        sentence: "Her aunt said multiplication is counting, made ___.",
        answer: "short",
      },
    ],
    games: [
      {
        type: "number-pop",
        title: "Times tables on the farm",
        rounds: [
          { prompt: "3 rows of 5 bushes = ?", answer: "15", distractors: ["10", "20", "8"] },
          { prompt: "4 x 5 = ?", answer: "20", distractors: ["15", "25", "9"] },
          { prompt: "9 x 5 = ?", answer: "45", distractors: ["40", "50", "35"] },
          { prompt: "4 x 4 = ?", answer: "16", distractors: ["12", "20", "8"] },
          { prompt: "3 x 3 = ?", answer: "9", distractors: ["6", "12", "3"] },
          { prompt: "5 x 5 = ?", answer: "25", distractors: ["20", "30", "10"] },
        ],
      },
    ],
    funFact: "Kenya is one of the world's largest tea exporters, and most of it is still picked by hand.",
  },

  "G3-ess-1": {
    title: "Jina's Journey Across Kenya",
    objective: "Name Kenyan counties and describe what makes each one different.",
    readingLevel: "G3",
    pages: [
      {
        text: "When her uncle offered to take her on his lorry route, Jina said yes before he finished the sentence. He drove goods from the coast to the lake. It would take four days.",
        imageQuery: "lorry truck road kenya",
      },
      {
        text: "They set off from Mombasa before dawn. The air was thick and salty, and the palms leaned over the road. Mombasa County sat right on the Indian Ocean.",
        imageQuery: "mombasa coast palms",
      },
      {
        text: "\"Everything that comes into this country by sea comes through here,\" said her uncle. Jina watched the cranes lifting containers at the port.",
        imageQuery: "mombasa port cranes",
      },
      {
        text: "By afternoon the land had changed completely. Taita Taveta was dry and rocky, with hills standing alone on flat ground like islands.",
        imageQuery: "taita hills kenya",
      },
      {
        text: "They passed through Tsavo, where the earth was red and the elephants that rolled in it turned red too.",
        imageQuery: "tsavo red elephants",
      },
      {
        text: "On the second morning they reached Nairobi County. Jina had never seen so many buildings crowded together.",
        imageQuery: "nairobi city skyline",
      },
      {
        text: "\"This is the capital,\" her uncle said, \"and the smallest county by land, but the biggest by people.\" Traffic swallowed them for two hours.",
        imageQuery: "nairobi traffic",
      },
      {
        text: "North of the city they climbed into Kiambu, where tea and coffee grew in rows on cool green hills.",
        imageQuery: "kiambu tea farms",
      },
      {
        text: "Then the road tipped over an edge and the whole Rift Valley opened below them. Jina actually gasped.",
        imageQuery: "great rift valley viewpoint",
      },
      {
        text: "In Nakuru County they stopped beside a lake rimmed with pink. \"Flamingoes,\" said her uncle. \"Thousands of them.\"",
        imageQuery: "lake nakuru flamingoes",
      },
      {
        text: "Kericho came next, all tea, the air smelling green and wet because it rains there nearly every afternoon.",
        imageQuery: "kericho tea",
      },
      {
        text: "On the fourth day they reached Kisumu, on the shore of Lake Victoria. Fishermen were bringing in tilapia in long wooden boats.",
        imageQuery: "lake victoria fishing boats",
      },
      {
        text: "Jina sat on the shore and thought about it. Salt water on Monday, fresh water on Thursday, and one country in between.",
        imageQuery: "lake victoria shore",
      },
      {
        text: "\"Forty-seven counties,\" said her uncle, \"and no two the same.\" Jina decided she would see every one of them.",
        imageQuery: "map of kenya",
      },
    ],
    vocabulary: ["county", "capital", "valley", "coast", "border"],
    activities: [
      {
        type: "multiple_choice",
        question: "Which county is Kenya's capital in?",
        options: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
        answer: "Nairobi",
      },
      {
        type: "multiple_choice",
        question: "Which lake did they reach at the end of the journey?",
        options: ["Lake Victoria", "Lake Nakuru", "Lake Turkana", "Lake Naivasha"],
        answer: "Lake Victoria",
      },
      {
        type: "fill_blank",
        sentence: "Kenya is divided into ___ counties.",
        answer: "47",
      },
      {
        type: "reflection",
        prompt: "Which county do you live in? Name one thing about it that another county would not have.",
      },
    ],
    games: [
      {
        type: "pair-match",
        title: "County and landmark",
        pairs: [
          { left: "Mombasa", right: "The sea port" },
          { left: "Nairobi", right: "The capital city" },
          { left: "Nakuru", right: "Flamingo lake" },
          { left: "Kisumu", right: "Lake Victoria" },
          { left: "Kericho", right: "Tea fields" },
        ],
      },
    ],
    funFact: "Kenya has had 47 counties since 2013, when the new constitution replaced the old provinces.",
  },

  "G3-creative-arts-1": {
    title: "The Drum That Would Not Sleep",
    objective: "Hear how a steady beat and a repeating pattern build a rhythm.",
    readingLevel: "G3",
    pages: [
      {
        text: "The drum in the corner of the school hall was older than any teacher there. Its skin was worn pale in the middle where a thousand hands had struck it. Nobody knew who had made it.",
        imageQuery: "old african drum",
      },
      {
        text: "Jina's music teacher, Mr Odera, rested his palm flat on it. \"Before you can play a rhythm,\" he said, \"you must find the pulse.\"",
        imageQuery: "hand on drum",
      },
      {
        text: "He struck it four times, evenly spaced, like footsteps. One, two, three, four. Then again. The room seemed to settle around the sound.",
        imageQuery: "drumming rhythm",
      },
      {
        text: "\"That is the heartbeat,\" he said. \"It never changes. Everything else is built on top of it.\"",
        imageQuery: "heartbeat pulse",
      },
      {
        text: "Jina tried. Her first four beats wandered, some fast and some slow, and the class giggled.",
        imageQuery: "child playing drum",
      },
      {
        text: "\"Do not listen to your hands,\" said Mr Odera. \"Listen to the space between the hits. That is where rhythm actually lives.\"",
        imageQuery: "listening carefully",
      },
      {
        text: "She closed her eyes and tried again. This time the gaps were even, and the beat held steady.",
        imageQuery: "eyes closed music",
      },
      {
        text: "Then he showed her a pattern to lay over the top. Loud, soft, soft, loud. Repeat.",
        imageQuery: "drum pattern",
      },
      {
        text: "Two hands, doing two different things at once. Jina's brain refused for a while, and then suddenly it did not.",
        imageQuery: "two hands drumming",
      },
      {
        text: "Something clicked. The pulse ran underneath while the pattern danced on top, and the two fitted together.",
        imageQuery: "rhythm music",
      },
      {
        text: "One by one, the other children joined in with claps and shakers. Nobody had to be told when to come in.",
        imageQuery: "children clapping music",
      },
      {
        text: "The hall filled with one sound made by twenty people, and it did not fall apart.",
        imageQuery: "school music group",
      },
      {
        text: "That evening, walking home, Jina caught herself tapping the pattern on her leg. Loud, soft, soft, loud.",
        imageQuery: "walking home evening",
      },
      {
        text: "The drum, she decided, had not stopped playing at all. It had simply moved into her hands.",
        imageQuery: "drum silhouette",
      },
    ],
    vocabulary: ["rhythm", "pulse", "beat", "pattern", "steady"],
    activities: [
      {
        type: "multiple_choice",
        question: "What did Mr Odera call the steady, unchanging beat?",
        options: ["The pulse", "The pattern", "The tune", "The chorus"],
        answer: "The pulse",
      },
      {
        type: "multiple_choice",
        question: "Where did Mr Odera say rhythm actually lives?",
        options: ["In the space between the hits", "In the loudest hit", "In the drum skin", "In the hands"],
        answer: "In the space between the hits",
      },
      {
        type: "fill_blank",
        sentence: "The pattern Mr Odera taught was loud, soft, soft, ___.",
        answer: "loud",
      },
      {
        type: "reflection",
        prompt: "Clap a steady pulse, then add a pattern on top. What made it hard, and what made it click?",
      },
    ],
    funFact: "Many East African rhythms layer several patterns at once — it is called polyrhythm.",
  },

  "G3-religious-education-1": {
    title: "Three Friends, Three Prayers",
    objective: "Show respect for people whose beliefs are different from your own.",
    readingLevel: "G3",
    pages: [
      {
        text: "Jina, Amina and Ravi had shared a desk since Class One. They walked home the same way every afternoon, arguing cheerfully about football. They had never once talked about religion.",
        imageQuery: "three school friends",
      },
      {
        text: "One Friday, Amina left school an hour early. \"Jumaa prayers,\" she said, and hurried off with her scarf tied.",
        imageQuery: "girl headscarf school",
      },
      {
        text: "\"Where does she go?\" Ravi asked. Jina realised she had never actually asked in three whole years.",
        imageQuery: "children curious",
      },
      {
        text: "So on Monday she did ask. Amina explained about the mosque, and Friday prayers, and washing before you pray.",
        imageQuery: "mosque minaret",
      },
      {
        text: "\"We pray five times a day,\" Amina said. \"Dawn, midday, afternoon, sunset and night. It divides up the day.\"",
        imageQuery: "prayer mat",
      },
      {
        text: "Ravi listened, then said his family lit a lamp at their shrine each evening and rang a small bell.",
        imageQuery: "oil lamp diya",
      },
      {
        text: "\"My grandmother says the light is for remembering,\" he explained. \"You cannot be angry while you are lighting it.\"",
        imageQuery: "hindu temple lamp",
      },
      {
        text: "Jina told them about church on Sunday, and the singing, and how the whole congregation stood up together.",
        imageQuery: "church congregation singing",
      },
      {
        text: "\"My grandmother says the songs are for thanking,\" she said. \"She sings very loudly and completely out of tune.\"",
        imageQuery: "grandmother singing church",
      },
      {
        text: "They walked in silence for a while, thinking. Three houses on the same road, three different evenings.",
        imageQuery: "three houses road",
      },
      {
        text: "\"They are not the same,\" Ravi said carefully. \"I do not think we should pretend they are.\"",
        imageQuery: "thoughtful boy",
      },
      {
        text: "\"No,\" agreed Amina. \"But every one of them stops the day and says thank you. That part is the same.\"",
        imageQuery: "friends talking sunset",
      },
      {
        text: "Jina thought that was exactly right. You do not have to share a belief to respect the person holding it.",
        imageQuery: "friends holding hands",
      },
      {
        text: "They went back to arguing about football. But Jina noticed, from then on, that nobody teased Amina for leaving early on Fridays.",
        imageQuery: "children playing football",
      },
    ],
    vocabulary: ["respect", "belief", "prayer", "different", "friend"],
    activities: [
      {
        type: "multiple_choice",
        question: "Why did Amina leave school early on Friday?",
        options: ["For Jumaa prayers", "She was unwell", "For a football match", "To help at home"],
        answer: "For Jumaa prayers",
      },
      {
        type: "multiple_choice",
        question: "What did the three friends agree was the same about all three?",
        options: [
          "Each one stops the day to say thank you",
          "They all happen on Friday",
          "They all use a bell",
          "They all involve singing",
        ],
        answer: "Each one stops the day to say thank you",
      },
      {
        type: "fill_blank",
        sentence: "You do not have to share a belief to ___ the person holding it.",
        answer: "respect",
      },
      {
        type: "reflection",
        prompt: "Think of someone who believes something different from you. What is one question you could ask them kindly?",
      },
    ],
    funFact: "Kenya's constitution guarantees freedom of religion, which is why all three friends can worship openly.",
  },
};
