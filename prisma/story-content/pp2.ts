import type { StoryMap } from "./types";

// PP2 — "Building Words": 8 pages, 1-2 short sentences per page, at most 8 words each.
// Adds the digraphs sh/ch/th/ck and simple -s plurals on top of PP1's CVC base.

export const pp2Stories: StoryMap = {
  "PP2-language-1": {
    title: "Jina and the Rhyming Song",
    objective: "Hear when two words end with the same sound.",
    readingLevel: "PP2",
    pages: [
      { text: "Jina sat on a mat.", imageQuery: "woven mat" },
      { text: "A cat came and sat too.", imageQuery: "cat sitting" },
      { text: "Mat and cat! They rhyme.", imageQuery: "cat on mat" },
      { text: "Jina saw a bug on a rug.", imageQuery: "bug on rug" },
      { text: "Bug and rug! They rhyme.", imageQuery: "small bug" },
      { text: "A hen ran past the pen.", imageQuery: "hen running" },
      { text: "Hen and pen! They rhyme.", imageQuery: "hen and pen" },
      { text: "Jina sang her rhyming song.", imageQuery: "giraffe singing" },
    ],
    vocabulary: ["mat", "cat", "bug", "rug", "hen", "pen"],
    activities: [
      {
        type: "multiple_choice",
        question: "Which word rhymes with cat?",
        options: ["Mat", "Dog", "Cup", "Sun"],
        answer: "Mat",
      },
      {
        type: "multiple_choice",
        question: "Which word rhymes with bug?",
        options: ["Rug", "Hen", "Pot", "Fan"],
        answer: "Rug",
      },
    ],
    games: [
      {
        type: "pair-match",
        title: "Find the rhyme",
        pairs: [
          { left: "Cat", right: "Mat" },
          { left: "Bug", right: "Rug" },
          { left: "Hen", right: "Pen" },
          { left: "Sun", right: "Bun" },
        ],
      },
      {
        type: "word-build",
        title: "Build the rhyming words",
        words: [
          { word: "cat", hint: "It says meow and sat on the mat.", picture: "cat" },
          { word: "rug", hint: "The bug walked across this.", picture: "rug" },
          { word: "hen", hint: "It ran past the pen.", picture: "hen" },
        ],
      },
    ],
    funFact: "Rhyming words help you guess new words — if you can read cat, you can read hat and bat.",
  },

  "PP2-mathematics-1": {
    title: "Five Little Weaver Birds",
    objective: "Count from one to five and say how many.",
    readingLevel: "PP2",
    pages: [
      { text: "One weaver bird sits in the tree.", imageQuery: "weaver bird" },
      { text: "Two weaver birds sing a song.", imageQuery: "two birds singing" },
      { text: "Three weaver birds build a nest.", imageQuery: "weaver bird nest" },
      { text: "Four weaver birds flap and fly.", imageQuery: "birds flying" },
      { text: "Five weaver birds land on a branch.", imageQuery: "birds on branch" },
      { text: "Jina counts them. One, two, three.", imageQuery: "giraffe counting" },
      { text: "Four, five! Jina counts five birds.", imageQuery: "number five" },
      { text: "Five little weaver birds say goodnight.", imageQuery: "birds at sunset" },
    ],
    vocabulary: ["one", "two", "three", "four", "five"],
    activities: [
      {
        type: "multiple_choice",
        question: "How many birds build a nest?",
        options: ["3", "1", "5", "2"],
        answer: "3",
      },
      {
        type: "multiple_choice",
        question: "How many birds are there at the end?",
        options: ["5", "4", "2", "3"],
        answer: "5",
      },
    ],
    games: [
      {
        type: "number-pop",
        title: "Count with Jina",
        rounds: [
          { prompt: "How many birds sing a song?", answer: "2", distractors: ["1", "4", "5"] },
          { prompt: "How many birds build a nest?", answer: "3", distractors: ["2", "5", "1"] },
          { prompt: "How many birds flap and fly?", answer: "4", distractors: ["3", "1", "5"] },
          { prompt: "How many birds land on the branch?", answer: "5", distractors: ["4", "2", "3"] },
        ],
      },
    ],
    funFact: "Weaver birds tie real knots with grass to hang their nests from a branch.",
  },

  "PP2-environment-1": {
    title: "Jina Walks to School",
    objective: "Name the places you pass between home and school.",
    readingLevel: "PP2",
    pages: [
      { text: "Jina leaves her home at dawn.", imageQuery: "sunrise village" },
      { text: "She waves to Mum at the gate.", imageQuery: "waving goodbye" },
      { text: "She walks past the tall shop.", imageQuery: "small village shop" },
      { text: "She walks past the water tap.", imageQuery: "water tap" },
      { text: "She sees her school gate. It is red.", imageQuery: "school gate" },
      { text: "Her class has a big chalkboard.", imageQuery: "classroom chalkboard" },
      { text: "Her friends wave. Jina waves back.", imageQuery: "children waving" },
      { text: "Home and school. Jina loves both.", imageQuery: "happy giraffe school" },
    ],
    vocabulary: ["home", "school", "gate", "shop", "class"],
    activities: [
      {
        type: "multiple_choice",
        question: "What colour is the school gate?",
        options: ["Red", "Blue", "Green", "Black"],
        answer: "Red",
      },
      {
        type: "multiple_choice",
        question: "What does Jina walk past?",
        options: ["The shop", "The sea", "The bus", "The farm"],
        answer: "The shop",
      },
    ],
    funFact: "Drawing a map of your walk to school is a real map — it shows places in order.",
  },

  "PP2-creative-1": {
    title: "Jina Paints a Rainbow",
    objective: "Name colours and shapes and put them together.",
    readingLevel: "PP2",
    pages: [
      { text: "Jina has a box of paint.", imageQuery: "paint box" },
      { text: "She paints a red circle.", imageQuery: "red circle" },
      { text: "She paints a blue square.", imageQuery: "blue square" },
      { text: "She paints a green triangle.", imageQuery: "green triangle" },
      { text: "She paints a yellow star.", imageQuery: "yellow star" },
      { text: "She joins them in a long arch.", imageQuery: "rainbow arch" },
      { text: "It is a rainbow of shapes!", imageQuery: "colourful rainbow" },
      { text: "Jina hangs it on the wall.", imageQuery: "painting on wall" },
    ],
    vocabulary: ["red", "blue", "circle", "square", "star"],
    activities: [
      {
        type: "multiple_choice",
        question: "What shape is red?",
        options: ["Circle", "Square", "Star", "Triangle"],
        answer: "Circle",
        image: "red circle",
      },
      {
        type: "multiple_choice",
        question: "What shape is blue?",
        options: ["Square", "Circle", "Star", "Arch"],
        answer: "Square",
        image: "blue square",
      },
    ],
    games: [
      {
        type: "pair-match",
        title: "Match colour to shape",
        pairs: [
          { left: "Circle", right: "Red" },
          { left: "Square", right: "Blue" },
          { left: "Triangle", right: "Green" },
          { left: "Star", right: "Yellow" },
        ],
      },
    ],
    funFact: "A real rainbow always keeps its colours in the same order, from red to violet.",
  },

  "PP2-religious-education-1": {
    title: "Jina Helps a Small Friend",
    objective: "Notice when someone needs help, and help them.",
    readingLevel: "PP2",
    pages: [
      { text: "Jina sees a small hare by the path.", imageQuery: "hare on path" },
      { text: "The hare has dropped his maize.", imageQuery: "maize cobs" },
      { text: "The cobs have rolled in the dust.", imageQuery: "maize on ground" },
      { text: "Jina bends her long neck down.", imageQuery: "giraffe bending neck" },
      { text: "She helps him pick up each cob.", imageQuery: "helping hands" },
      { text: "Thank you, says the small hare.", imageQuery: "happy hare" },
      { text: "Jina smiles. Helping feels good.", imageQuery: "smiling giraffe" },
      { text: "A kind act is a small gift.", imageQuery: "gift" },
    ],
    vocabulary: ["kind", "help", "small", "path", "gift"],
    activities: [
      {
        type: "multiple_choice",
        question: "Who did Jina help?",
        options: ["A hare", "A cat", "A bird", "A dog"],
        answer: "A hare",
        image: "hare",
      },
      {
        type: "multiple_choice",
        question: "What did the hare drop?",
        options: ["His maize", "His hat", "His cup", "His shoe"],
        answer: "His maize",
      },
    ],
    funFact: "In Kiswahili, a kind act done for someone is called wema.",
  },
};
