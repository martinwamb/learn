import { createScriptDb } from "../lib/db-script";
import { topics as christianityTopics, type CurriculumTopic } from "./faith-curriculum/christianity";
import { topics as islamTopics } from "./faith-curriculum/islam";

type Db = ReturnType<typeof createScriptDb>;

const traditions = [
  { slug: "christianity", name: "Christian Stories", icon: "✝️", color: "#7C3AED" },
  { slug: "islam", name: "Islamic Stories", icon: "☪️", color: "#0D9488" },
];

// Topic-only curriculum outline (title + scriptureRef + teachingPoint, no lesson
// prose) that workers/faith-lesson-generator.ts expands into draft lessons. See
// prisma/faith-curriculum/*.ts for the full lists and authoring notes.
const curriculumByTradition: Record<string, CurriculumTopic[]> = {
  christianity: christianityTopics,
  islam: islamTopics,
};

interface FaithLesson {
  sequence: number;
  title: string;
  objective: string;
  content: unknown[];
  activities: unknown[];
  funFact?: string;
}

interface FaithUnit {
  sequence: number;
  title: string;
  ageMin: number;
  ageMax: number;
  scriptureRef?: string;
  teachingPoint: string;
  lessons: FaithLesson[];
}

const unitsByTradition: Record<string, FaithUnit[]> = {
  christianity: [
    // ── Early Years (4-6) ────────────────────────────────────────────────────
    {
      sequence: 1,
      title: "Creation",
      ageMin: 4,
      ageMax: 6,
      scriptureRef: "Genesis 1",
      teachingPoint: "God made everything in the world, and it is all good — we can be thankful for it.",
      lessons: [
        {
          sequence: 1,
          title: "God Makes a Wonderful World",
          objective: "By the end of this lesson, the learner should be able to name things God made and feel thankful for the world around them.",
          content: [
            { type: "introduction", text: "Long, long ago, before anything else existed, God made everything we see — the sky, the land, and every living thing!" },
            { type: "explanation", text: "God made light and dark, land and sea, plants and animals, and finally, people — all in six days. On the seventh day, God rested.", example: "God looked at everything He made and said it was very good!" },
            { type: "picture-match", instruction: "Point to the picture of each wonderful thing God made:", pictureItems: [
              { label: "Sun" },
              { label: "Ocean", sound: "splash" },
              { label: "Elephant", sound: "trumpeting" },
              { label: "Flower" },
            ] },
            { type: "memory-verse", text: "In the beginning, God created the heavens and the earth.", reference: "Genesis 1:1" },
          ],
          activities: [
            { type: "multiple_choice", question: "How many days did God take to make the world?", options: ["Three", "Six", "Ten", "One"], answer: "Six" },
            { type: "reflection", prompt: "What is your favourite thing that God made? Why do you like it?" },
          ],
          funFact: "The word 'create' in the Bible's first verse is used only for what God does — no one else!",
        },
      ],
    },
    {
      sequence: 2,
      title: "Noah's Ark",
      ageMin: 4,
      ageMax: 6,
      scriptureRef: "Genesis 6-9",
      teachingPoint: "God keeps his promises, even after a difficult time.",
      lessons: [
        {
          sequence: 1,
          title: "Noah Builds a Big Boat",
          objective: "By the end of this lesson, the learner should be able to retell the story of Noah's Ark and understand that God kept His promise.",
          content: [
            { type: "introduction", text: "God asked a kind man named Noah to build a very big boat, because a great rain was coming!" },
            { type: "explanation", text: "Noah listened to God and built the ark. He brought his family and two of every kind of animal inside to keep them safe.", example: "Lions, giraffes, birds, and even tiny ants all went into the ark, two by two!" },
            { type: "picture-match", instruction: "Which animals went into the ark? Point to each one:", pictureItems: [
              { label: "Giraffe" },
              { label: "Lion", sound: "roaring" },
              { label: "Dove", sound: "cooing" },
              { label: "Elephant", sound: "trumpeting" },
            ] },
            { type: "memory-verse", text: "I have set my rainbow in the clouds, and it will be the sign of the covenant between me and the earth.", reference: "Genesis 9:13" },
          ],
          activities: [
            { type: "multiple_choice", question: "What did God put in the sky as a promise?", options: ["A star", "A rainbow", "A cloud", "The sun"], answer: "A rainbow" },
            { type: "reflection", prompt: "Noah trusted God even when it was hard. Can you think of a time you trusted someone?" },
          ],
          funFact: "A rainbow has seven colours, and you can still see one in the sky after rain today!",
        },
      ],
    },
    {
      sequence: 3,
      title: "The Lost Sheep",
      ageMin: 4,
      ageMax: 6,
      scriptureRef: "Luke 15:3-7",
      teachingPoint: "God cares for and values every single person, no matter how small or lost they feel.",
      lessons: [
        {
          sequence: 1,
          title: "The Shepherd Who Never Gives Up",
          objective: "By the end of this lesson, the learner should be able to explain that God cares for each of us, just like a shepherd cares for every sheep.",
          content: [
            { type: "introduction", text: "A shepherd had 100 sheep that he loved and cared for every single day." },
            { type: "explanation", text: "One day, one little sheep wandered off and got lost. The shepherd left the other 99 to go find it, because every single sheep mattered to him.", example: "When he found the lost sheep, he was so happy he carried it home on his shoulders and threw a party!" },
            { type: "item", instruction: "Act it out — pretend to be the shepherd looking for the lost sheep:", items: ["Look behind the rocks", "Call out gently", "Walk over the hills", "Carry the sheep home happily"] },
            { type: "memory-verse", text: "I am the good shepherd. The good shepherd lays down his life for the sheep.", reference: "John 10:11" },
          ],
          activities: [
            { type: "multiple_choice", question: "How many sheep did the shepherd have in total?", options: ["10", "50", "100", "1"], answer: "100" },
            { type: "reflection", prompt: "How do you think the lost sheep felt when the shepherd found it?" },
          ],
          funFact: "Shepherds in Bible times often knew each of their sheep well enough to give them names!",
        },
      ],
    },
    // ── Junior (7-9) ─────────────────────────────────────────────────────────
    {
      sequence: 4,
      title: "David and Goliath",
      ageMin: 7,
      ageMax: 9,
      scriptureRef: "1 Samuel 17",
      teachingPoint: "With courage and faith in God, we can face things that feel too big for us.",
      lessons: [
        {
          sequence: 1,
          title: "A Small Shepherd Boy's Big Courage",
          objective: "By the end of this lesson, the learner should be able to retell the story of David and Goliath and describe how courage and faith helped David.",
          content: [
            { type: "introduction", text: "A giant soldier named Goliath was so tall and strong that every soldier in the army was afraid of him — except for a young shepherd boy named David." },
            { type: "explanation", text: "David wasn't a trained soldier. He was a shepherd who protected his sheep from lions and bears. He believed that with courage and faith, he could face the giant.", example: "David used only a sling and five smooth stones to face Goliath, who wore heavy armour and carried a huge sword." },
            { type: "item-group", instruction: "Put these parts of the story in order:", items: ["David brings food to his brothers at the battle camp", "Goliath challenges the army and no one dares to fight him", "David says he will fight Goliath with God's help", "David uses his sling to defeat the giant"] },
            { type: "memory-verse", text: "The battle is the Lord's, and he will give all of you into our hands.", reference: "1 Samuel 17:47" },
          ],
          activities: [
            { type: "multiple_choice", question: "What weapon did David use to defeat Goliath?", options: ["A sword", "A spear", "A sling and stone", "A shield"], answer: "A sling and stone" },
            { type: "multiple_choice", question: "What was David's job before he faced Goliath?", options: ["Soldier", "Shepherd", "King", "Farmer"], answer: "Shepherd" },
            { type: "reflection", prompt: "What is something big or scary that you have felt brave enough to try?" },
          ],
          funFact: "David later became one of the most famous kings in the Bible!",
        },
      ],
    },
    {
      sequence: 5,
      title: "Daniel and the Lions",
      ageMin: 7,
      ageMax: 9,
      scriptureRef: "Daniel 6",
      teachingPoint: "Staying faithful to what is right is worth it, even when it feels hard or risky.",
      lessons: [
        {
          sequence: 1,
          title: "Daniel Stays Faithful",
          objective: "By the end of this lesson, the learner should be able to explain how Daniel stayed faithful to God even when it was difficult, and that God kept him safe.",
          content: [
            { type: "introduction", text: "Daniel was a wise man who prayed to God every single day, even when a new law said he wasn't allowed to." },
            { type: "explanation", text: "Some jealous men tricked the king into making a law that no one could pray to anyone except the king. Daniel kept praying to God anyway, because his faith mattered more to him than staying out of trouble.", example: "Daniel was thrown into a den of lions as punishment, but God sent an angel to keep the lions' mouths closed, and Daniel was completely safe!" },
            { type: "item", instruction: "Talk about each part of the story:", items: ["Why did Daniel keep praying?", "What happened in the lions' den?", "How did the king feel the next morning?"] },
            { type: "memory-verse", text: "My God sent his angel, and he shut the mouths of the lions.", reference: "Daniel 6:22" },
          ],
          activities: [
            { type: "multiple_choice", question: "Why was Daniel thrown into the lions' den?", options: ["He stole food", "He kept praying to God", "He was late", "He broke a vase"], answer: "He kept praying to God" },
            { type: "fill_blank", sentence: "God sent an ___ to close the lions' mouths.", answer: "angel" },
            { type: "reflection", prompt: "Daniel stayed true to what he believed even when it was hard. When is it hard for you to do the right thing?" },
          ],
          funFact: "Daniel prayed facing a window three times a day — the same routine he kept his whole life!",
        },
      ],
    },
    {
      sequence: 6,
      title: "The Good Samaritan",
      ageMin: 7,
      ageMax: 9,
      scriptureRef: "Luke 10:25-37",
      teachingPoint: "Being a good neighbour means helping anyone in need, not just people like us.",
      lessons: [
        {
          sequence: 1,
          title: "Being a Good Neighbour",
          objective: "By the end of this lesson, the learner should be able to explain the story of the Good Samaritan and describe what it means to be a kind neighbour to everyone.",
          content: [
            { type: "introduction", text: "Jesus told a story about a traveller who was hurt on the road, and about who really helped him." },
            { type: "explanation", text: "A man was beaten and left hurt beside the road. Two important people walked past him without helping. But a Samaritan — someone from a group people usually looked down on — stopped, cared for his wounds, and paid for him to rest and heal.", example: "The Samaritan didn't ask 'is this person like me?' He just asked 'does this person need help?'" },
            { type: "item", instruction: "Think about each character in the story:", items: ["The hurt traveller on the road", "The two people who walked past", "The Samaritan who stopped to help"] },
            { type: "memory-verse", text: "Love your neighbor as yourself.", reference: "Mark 12:31" },
          ],
          activities: [
            { type: "multiple_choice", question: "Who stopped to help the hurt traveller?", options: ["A priest", "A Samaritan", "A king", "A soldier"], answer: "A Samaritan" },
            { type: "reflection", prompt: "Jesus taught that a neighbour is anyone who needs help, not just people who live near us. Who could you be a good neighbour to this week?" },
          ],
          funFact: "This story is so well known that helpful strangers are still called 'Good Samaritans' today, all around the world!",
        },
      ],
    },
    {
      sequence: 7,
      title: "Easter",
      ageMin: 7,
      ageMax: 9,
      scriptureRef: "Luke 24",
      teachingPoint: "Easter is a celebration of hope and new life for Christians.",
      lessons: [
        {
          sequence: 1,
          title: "The First Easter Morning",
          objective: "By the end of this lesson, the learner should be able to explain why Easter is a joyful celebration for Christians.",
          content: [
            { type: "introduction", text: "Easter is one of the most joyful days for Christians all around the world — it's a celebration of new life and hope." },
            { type: "explanation", text: "After Jesus died, his friends were very sad. But on the third day, when some women went to his tomb, they found it empty — Jesus had risen from the dead, just as he had promised!", example: "The women ran to tell the disciples the wonderful news: 'He is not here — he has risen!'" },
            { type: "item", instruction: "Talk through what happened that first Easter morning:", items: ["The women walked to the tomb early in the morning", "They found the stone rolled away", "An angel told them Jesus had risen", "They ran to share the joyful news"] },
            { type: "memory-verse", text: "He is not here; he has risen, just as he said.", reference: "Matthew 28:6" },
          ],
          activities: [
            { type: "multiple_choice", question: "What did the women find when they reached the tomb?", options: ["It was empty", "It was locked", "Nothing changed", "It was full of flowers"], answer: "It was empty" },
            { type: "reflection", prompt: "Easter is a celebration of hope and new beginnings. What is something new or hopeful in your own life right now?" },
          ],
          funFact: "Many families around the world celebrate Easter with special foods, new clothes, and time together with family!",
        },
      ],
    },
  ],
};

export async function seedFaith(db: Db) {
  console.log("\n🙏 Seeding Faith Stories...");

  for (const traditionData of traditions) {
    const tradition = await db.religiousTradition.upsert({
      where: { slug: traditionData.slug },
      update: { name: traditionData.name, icon: traditionData.icon, color: traditionData.color },
      create: traditionData,
    });
    console.log(`  ✓ Tradition: ${tradition.name}`);

    const units = unitsByTradition[traditionData.slug] ?? [];
    for (const unitData of units) {
      const unit = await db.religiousUnit.upsert({
        where: { traditionId_sequence: { traditionId: tradition.id, sequence: unitData.sequence } },
        update: {
          title: unitData.title,
          ageMin: unitData.ageMin,
          ageMax: unitData.ageMax,
          scriptureRef: unitData.scriptureRef,
          teachingPoint: unitData.teachingPoint,
          targetLessonCount: 1, // one story == one lesson, unlike CBC units -- keeps the AI
          // worker from treating these hand-authored units as under-stocked (schema default is 10)
        },
        create: {
          traditionId: tradition.id,
          sequence: unitData.sequence,
          title: unitData.title,
          ageMin: unitData.ageMin,
          ageMax: unitData.ageMax,
          scriptureRef: unitData.scriptureRef,
          teachingPoint: unitData.teachingPoint,
          targetLessonCount: 1,
        },
      });

      for (const lessonData of unitData.lessons) {
        await db.religiousLesson.upsert({
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

    // Topic-only curriculum entries -- unit-level metadata only, deliberately no
    // lesson upsert here. This leaves every one of these units under its
    // targetLessonCount default (10) with 0 lessons, so workers/faith-lesson-generator.ts
    // picks them up on its next run and writes a draft lesson for admin review.
    // Re-running this seed never touches the `lessons` relation, so it's always
    // safe to re-run after drafts/publishes exist.
    const curriculumTopics = curriculumByTradition[traditionData.slug] ?? [];
    for (const topic of curriculumTopics) {
      await db.religiousUnit.upsert({
        where: { traditionId_sequence: { traditionId: tradition.id, sequence: topic.sequence } },
        update: {
          title: topic.title,
          ageMin: topic.ageMin,
          ageMax: topic.ageMax,
          scriptureRef: topic.scriptureRef,
          teachingPoint: topic.teachingPoint,
          targetLessonCount: 1,
        },
        create: {
          traditionId: tradition.id,
          sequence: topic.sequence,
          title: topic.title,
          ageMin: topic.ageMin,
          ageMax: topic.ageMax,
          scriptureRef: topic.scriptureRef,
          teachingPoint: topic.teachingPoint,
          targetLessonCount: 1,
        },
      });
    }
    if (curriculumTopics.length > 0) {
      console.log(`    ✓ ${curriculumTopics.length} curriculum topics queued for AI generation`);
    }
  }

  console.log("✅ Faith Stories seed complete!");
}
