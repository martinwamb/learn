import type { StoryMap } from "./types";

// PP1 — "First Words": 6 pages, exactly one sentence per page, at most 6 words.
// Vocabulary is CVC words plus the most common sight words. Every sentence here should
// be decodable by a child who has only just met letter sounds, which is why nothing is
// longer than two syllables except Jina's own name.

export const pp1Stories: StoryMap = {
  "PP1-language-1": {
    title: "Jina Hears a Sound",
    objective: "Listen for sounds around you and name what makes them.",
    readingLevel: "PP1",
    pages: [
      { text: "Jina the giraffe wakes up.", imageQuery: "giraffe waking up" },
      { text: "She hears a big drum.", imageQuery: "african drum" },
      { text: "Boom, boom, boom!", imageQuery: "drum beating" },
      { text: "She hears a small bird.", imageQuery: "small bird singing" },
      { text: "Tweet, tweet, tweet!", imageQuery: "bird chirping" },
      { text: "Jina can hear it all!", imageQuery: "giraffe listening ears" },
    ],
    vocabulary: ["hear", "big", "small", "bird", "drum"],
    activities: [
      {
        type: "multiple_choice",
        question: "What did Jina hear first?",
        options: ["A drum", "A bird", "A cat", "A bus"],
        answer: "A drum",
        image: "african drum",
      },
      {
        type: "multiple_choice",
        question: "What sound does the bird make?",
        options: ["Tweet", "Boom", "Moo", "Beep"],
        answer: "Tweet",
      },
    ],
    games: [
      {
        type: "pair-match",
        title: "Who makes that sound?",
        pairs: [
          { left: "Drum", right: "Boom" },
          { left: "Bird", right: "Tweet" },
          { left: "Cow", right: "Moo" },
          { left: "Car", right: "Beep" },
        ],
      },
    ],
    funFact: "A giraffe's ears can turn to catch a sound coming from behind it.",
  },

  "PP1-mathematics-1": {
    title: "Jina Sorts Her Fruit",
    objective: "Sort things into groups by their colour.",
    readingLevel: "PP1",
    pages: [
      { text: "Jina has a big bag.", imageQuery: "woven bag" },
      { text: "She sees red plums.", imageQuery: "red plums" },
      { text: "She sees yellow mangoes.", imageQuery: "yellow mango" },
      { text: "Red plums go in one pot.", imageQuery: "clay pot with plums" },
      { text: "Yellow mangoes go in the next.", imageQuery: "clay pot with mangoes" },
      { text: "Jina sorted them all!", imageQuery: "giraffe smiling" },
    ],
    vocabulary: ["red", "sort", "bag", "pot", "big"],
    activities: [
      {
        type: "multiple_choice",
        question: "What colour are the plums?",
        options: ["Red", "Blue", "Green", "Black"],
        answer: "Red",
      },
      {
        type: "multiple_choice",
        question: "Which fruit is yellow?",
        options: ["Mango", "Plum", "Nut", "Egg"],
        answer: "Mango",
        image: "yellow mango",
      },
    ],
    games: [
      {
        type: "sort-bins",
        title: "Put the fruit away",
        bins: [
          { label: "Red pot", icon: "🔴" },
          { label: "Yellow pot", icon: "🟡" },
        ],
        items: [
          { label: "Plum", bin: "Red pot" },
          { label: "Mango", bin: "Yellow pot" },
          { label: "Tomato", bin: "Red pot" },
          { label: "Banana", bin: "Yellow pot" },
          { label: "Chilli", bin: "Red pot" },
          { label: "Maize", bin: "Yellow pot" },
        ],
      },
    ],
    funFact: "Sorting is the first step in counting — group things, then count each group.",
  },

  "PP1-religious-education-1": {
    title: "Jina Says Thank You",
    objective: "Say thank you when someone is good to you.",
    readingLevel: "PP1",
    pages: [
      { text: "Mum gives Jina a bun.", imageQuery: "bread bun" },
      { text: "Jina says, thank you!", imageQuery: "happy giraffe" },
      { text: "Dad gives Jina a cup.", imageQuery: "cup of milk" },
      { text: "Jina says, thank you!", imageQuery: "giraffe smiling" },
      { text: "It is good to be kind.", imageQuery: "children being kind" },
      { text: "Thank you makes us glad.", imageQuery: "happy family" },
    ],
    vocabulary: ["thank", "kind", "glad", "cup", "bun"],
    activities: [
      {
        type: "multiple_choice",
        question: "What did Mum give Jina?",
        options: ["A bun", "A cup", "A hat", "A pen"],
        answer: "A bun",
        image: "bread bun",
      },
      {
        type: "multiple_choice",
        question: "What does Jina say?",
        options: ["Thank you", "Go away", "Not now", "Stop it"],
        answer: "Thank you",
      },
    ],
    funFact: "In Kenya you can say thank you as asante — and asante sana means thank you very much.",
  },
};
