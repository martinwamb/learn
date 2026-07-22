// Topic-only curriculum outline for Christian Faith Stories -- NOT full lesson
// content. Each entry fixes what a lesson must cover (title + scripture
// reference + one non-negotiable teaching point); workers/faith-lesson-generator.ts
// uses Ollama to write the actual retelling/activities text against these fixed
// facts, and saves the result as status:"draft" for admin review before publish.
//
// Sequence numbers are unique per-tradition (schema: @@unique([traditionId, sequence])),
// NOT per age bracket -- these continue from the 7 already hand-authored, fully-
// written lessons in seed-faith.ts's `unitsByTradition.christianity` (sequences 1-7:
// Creation, Noah's Ark, The Lost Sheep, David and Goliath, Daniel and the Lions,
// The Good Samaritan, Easter). Do not reuse 1-7 here.
//
// Target: 52 lessons per age bracket once every topic below has a published
// lesson (49 new early-years + 3 existing = 52; 48 new junior + 4 existing = 52).

export interface CurriculumTopic {
  sequence: number;
  title: string;
  ageMin: number;
  ageMax: number;
  scriptureRef?: string;
  teachingPoint: string;
}

export const topics: CurriculumTopic[] = [
  // ── Early Years (4-6) -- sequences 8-56 ───────────────────────────────────
  { sequence: 8, title: "Adam and Eve in the Garden", ageMin: 4, ageMax: 6, scriptureRef: "Genesis 2-3", teachingPoint: "God wants us to obey Him because He knows what is best for us." },
  { sequence: 9, title: "Cain and Abel", ageMin: 4, ageMax: 6, scriptureRef: "Genesis 4", teachingPoint: "God wants us to be kind to our brothers and sisters, not jealous." },
  { sequence: 10, title: "Abraham's Big Family Promise", ageMin: 4, ageMax: 6, scriptureRef: "Genesis 12, 15", teachingPoint: "God keeps His promises, even when we have to wait." },
  { sequence: 11, title: "Isaac Is Born", ageMin: 4, ageMax: 6, scriptureRef: "Genesis 21", teachingPoint: "God can do things that seem impossible." },
  { sequence: 12, title: "Rebekah at the Well", ageMin: 4, ageMax: 6, scriptureRef: "Genesis 24", teachingPoint: "Being kind and helpful pleases God." },
  { sequence: 13, title: "Jacob and Esau", ageMin: 4, ageMax: 6, scriptureRef: "Genesis 25, 27", teachingPoint: "Treating our family fairly matters to God." },
  { sequence: 14, title: "Jacob's Ladder Dream", ageMin: 4, ageMax: 6, scriptureRef: "Genesis 28", teachingPoint: "God is with us wherever we go." },
  { sequence: 15, title: "Joseph's Colourful Coat", ageMin: 4, ageMax: 6, scriptureRef: "Genesis 37", teachingPoint: "God can turn hard times into good, even when others are unkind to us." },
  { sequence: 16, title: "Joseph Forgives His Brothers", ageMin: 4, ageMax: 6, scriptureRef: "Genesis 45", teachingPoint: "Forgiving others, even when they hurt us, is what God wants." },
  { sequence: 17, title: "Baby Moses in the Basket", ageMin: 4, ageMax: 6, scriptureRef: "Exodus 2", teachingPoint: "God watches over and protects children." },
  { sequence: 18, title: "Moses and the Burning Bush", ageMin: 4, ageMax: 6, scriptureRef: "Exodus 3", teachingPoint: "God calls ordinary people to do important things." },
  { sequence: 19, title: "Crossing the Red Sea", ageMin: 4, ageMax: 6, scriptureRef: "Exodus 14", teachingPoint: "God makes a way for us even when things look impossible." },
  { sequence: 20, title: "Manna from Heaven", ageMin: 4, ageMax: 6, scriptureRef: "Exodus 16", teachingPoint: "God provides what we need every day." },
  { sequence: 21, title: "The Ten Commandments", ageMin: 4, ageMax: 6, scriptureRef: "Exodus 20", teachingPoint: "God gives us rules because He loves us and wants to keep us safe." },
  { sequence: 22, title: "Joshua and the Walls of Jericho", ageMin: 4, ageMax: 6, scriptureRef: "Joshua 6", teachingPoint: "When we trust and obey God, He helps us succeed." },
  { sequence: 23, title: "Gideon's Small Army", ageMin: 4, ageMax: 6, scriptureRef: "Judges 6-7", teachingPoint: "God can do big things through people who feel small." },
  { sequence: 24, title: "Samson's Strength", ageMin: 4, ageMax: 6, scriptureRef: "Judges 16", teachingPoint: "God gives us gifts, and we should use them wisely." },
  { sequence: 25, title: "Ruth's Loyalty", ageMin: 4, ageMax: 6, scriptureRef: "Ruth 1", teachingPoint: "Being loyal and kind to our family is precious to God." },
  { sequence: 26, title: "Samuel Hears God's Voice", ageMin: 4, ageMax: 6, scriptureRef: "1 Samuel 3", teachingPoint: "God speaks to us, and we should listen for Him." },
  { sequence: 27, title: "David the Shepherd Boy", ageMin: 4, ageMax: 6, scriptureRef: "1 Samuel 16", teachingPoint: "God looks at our hearts, not how big or important we seem." },
  { sequence: 28, title: "David Plays for the King", ageMin: 4, ageMax: 6, scriptureRef: "1 Samuel 16", teachingPoint: "Our gifts and talents can comfort and help others." },
  { sequence: 29, title: "Elijah Fed by Ravens", ageMin: 4, ageMax: 6, scriptureRef: "1 Kings 17", teachingPoint: "God takes care of us in surprising ways." },
  { sequence: 30, title: "Elijah and the Widow's Oil", ageMin: 4, ageMax: 6, scriptureRef: "1 Kings 17", teachingPoint: "Sharing what little we have can bring a big blessing." },
  { sequence: 31, title: "Naaman Is Healed", ageMin: 4, ageMax: 6, scriptureRef: "2 Kings 5", teachingPoint: "God can use a small, simple act of obedience to bring healing." },
  { sequence: 32, title: "Jonah and the Big Fish", ageMin: 4, ageMax: 6, scriptureRef: "Jonah 1-2", teachingPoint: "God gives us second chances when we run from what's right." },
  { sequence: 33, title: "Jonah in Nineveh", ageMin: 4, ageMax: 6, scriptureRef: "Jonah 3-4", teachingPoint: "God loves and forgives everyone who says sorry, even people we don't expect." },
  { sequence: 34, title: "Daniel Won't Eat the King's Food", ageMin: 4, ageMax: 6, scriptureRef: "Daniel 1", teachingPoint: "Standing up for what's right, even when it's different, pleases God." },
  { sequence: 35, title: "The Angel Gabriel Visits Mary", ageMin: 4, ageMax: 6, scriptureRef: "Luke 1", teachingPoint: "God chooses ordinary people for wonderful plans." },
  { sequence: 36, title: "Baby Jesus Is Born", ageMin: 4, ageMax: 6, scriptureRef: "Luke 2", teachingPoint: "Jesus came into the world humbly, as a gift for everyone." },
  { sequence: 37, title: "The Shepherds and the Angels", ageMin: 4, ageMax: 6, scriptureRef: "Luke 2", teachingPoint: "Good news of great joy is for everyone to hear and share." },
  { sequence: 38, title: "The Wise Men Follow the Star", ageMin: 4, ageMax: 6, scriptureRef: "Matthew 2", teachingPoint: "It's worth seeking out and honouring Jesus." },
  { sequence: 39, title: "Jesus in the Temple as a Boy", ageMin: 4, ageMax: 6, scriptureRef: "Luke 2:41-52", teachingPoint: "Jesus loved learning about God even as a child." },
  { sequence: 40, title: "Jesus Is Baptised", ageMin: 4, ageMax: 6, scriptureRef: "Matthew 3", teachingPoint: "Jesus showed us the right way to start doing God's work." },
  { sequence: 41, title: "Jesus Calls His Friends", ageMin: 4, ageMax: 6, scriptureRef: "Matthew 4", teachingPoint: "Jesus invites ordinary people to follow and help Him." },
  { sequence: 42, title: "Jesus Calms the Storm", ageMin: 4, ageMax: 6, scriptureRef: "Mark 4:35-41", teachingPoint: "Jesus is powerful, and we can trust Him when we're afraid." },
  { sequence: 43, title: "Jesus Feeds Five Thousand", ageMin: 4, ageMax: 6, scriptureRef: "John 6", teachingPoint: "Jesus can take a little and make it more than enough." },
  { sequence: 44, title: "Jesus Walks on Water", ageMin: 4, ageMax: 6, scriptureRef: "Matthew 14", teachingPoint: "When we feel like we're sinking, we can call out to Jesus." },
  { sequence: 45, title: "Jesus Heals a Blind Man", ageMin: 4, ageMax: 6, scriptureRef: "Mark 10:46-52", teachingPoint: "Jesus cares about our needs and wants to help us." },
  { sequence: 46, title: "Jesus Loves the Little Children", ageMin: 4, ageMax: 6, scriptureRef: "Mark 10:13-16", teachingPoint: "Jesus welcomes and delights in children, just as they are." },
  { sequence: 47, title: "The Man Let Down Through the Roof", ageMin: 4, ageMax: 6, scriptureRef: "Mark 2:1-12", teachingPoint: "Good friends help each other reach Jesus." },
  { sequence: 48, title: "The Ten Lepers Say Thank You", ageMin: 4, ageMax: 6, scriptureRef: "Luke 17:11-19", teachingPoint: "Remembering to say thank you matters, especially to God." },
  { sequence: 49, title: "Zacchaeus Climbs a Tree", ageMin: 4, ageMax: 6, scriptureRef: "Luke 19:1-10", teachingPoint: "Jesus looks for and welcomes everyone, even people others look down on." },
  { sequence: 50, title: "The Last Supper", ageMin: 4, ageMax: 6, scriptureRef: "Luke 22", teachingPoint: "Jesus shared a special meal to show His love before He died." },
  { sequence: 51, title: "Jesus Is Alive!", ageMin: 4, ageMax: 6, scriptureRef: "Matthew 28", teachingPoint: "Jesus rose from the dead, and that gives us hope and joy." },
  { sequence: 52, title: "Jesus Goes to Heaven", ageMin: 4, ageMax: 6, scriptureRef: "Acts 1", teachingPoint: "Jesus promised to always be with us, even though we can't see Him." },
  { sequence: 53, title: "The Widow's Two Coins", ageMin: 4, ageMax: 6, scriptureRef: "Mark 12:41-44", teachingPoint: "God values the heart behind our giving, not the amount." },
  { sequence: 54, title: "Peter Walks on Water", ageMin: 4, ageMax: 6, scriptureRef: "Matthew 14:28-31", teachingPoint: "When we take our eyes off Jesus we can be afraid, but He reaches out to catch us." },
  { sequence: 55, title: "Love God and Love Others", ageMin: 4, ageMax: 6, scriptureRef: "Matthew 22:37-39", teachingPoint: "The most important thing is to love God and love the people around us." },
  { sequence: 56, title: "The Holy Spirit Comes at Pentecost", ageMin: 4, ageMax: 6, scriptureRef: "Acts 2", teachingPoint: "God gives His Spirit to help and guide us." },

  // ── Junior (7-9) -- sequences 57-104 ──────────────────────────────────────
  { sequence: 57, title: "The Tower of Babel", ageMin: 7, ageMax: 9, scriptureRef: "Genesis 11", teachingPoint: "Pride can divide us; humility keeps us united." },
  { sequence: 58, title: "Abraham and Isaac: A Test of Faith", ageMin: 7, ageMax: 9, scriptureRef: "Genesis 22", teachingPoint: "God tests and strengthens our faith, and He always provides." },
  { sequence: 59, title: "Jacob Wrestles Through the Night", ageMin: 7, ageMax: 9, scriptureRef: "Genesis 32", teachingPoint: "Wrestling with hard things can leave us changed and blessed." },
  { sequence: 60, title: "Joseph Rises in Egypt", ageMin: 7, ageMax: 9, scriptureRef: "Genesis 41", teachingPoint: "God can use even our darkest seasons to prepare us for something good." },
  { sequence: 61, title: "The Ten Plagues of Egypt", ageMin: 7, ageMax: 9, scriptureRef: "Exodus 7-12", teachingPoint: "God is more powerful than anything that opposes Him." },
  { sequence: 62, title: "The First Passover", ageMin: 7, ageMax: 9, scriptureRef: "Exodus 12", teachingPoint: "God protects His people and remembers His promises." },
  { sequence: 63, title: "The Golden Calf", ageMin: 7, ageMax: 9, scriptureRef: "Exodus 32", teachingPoint: "Waiting on God is better than rushing to false substitutes." },
  { sequence: 64, title: "The Twelve Spies", ageMin: 7, ageMax: 9, scriptureRef: "Numbers 13-14", teachingPoint: "Faith sees possibility where fear sees only obstacles." },
  { sequence: 65, title: "Balaam's Donkey", ageMin: 7, ageMax: 9, scriptureRef: "Numbers 22", teachingPoint: "God can speak through the most unexpected means to get our attention." },
  { sequence: 66, title: "Rahab and the Spies", ageMin: 7, ageMax: 9, scriptureRef: "Joshua 2", teachingPoint: "God can use anyone, even someone with a difficult past, for His purposes." },
  { sequence: 67, title: "Deborah the Judge", ageMin: 7, ageMax: 9, scriptureRef: "Judges 4", teachingPoint: "God raises up wise and courageous leaders, women and men alike." },
  { sequence: 68, title: "Gideon's Fleece", ageMin: 7, ageMax: 9, scriptureRef: "Judges 6", teachingPoint: "It's okay to seek confirmation when we're unsure, but God is patient with us." },
  { sequence: 69, title: "Samson and Delilah", ageMin: 7, ageMax: 9, scriptureRef: "Judges 16", teachingPoint: "Our choices about who we trust can protect or cost us dearly." },
  { sequence: 70, title: "Hannah's Prayer for a Son", ageMin: 7, ageMax: 9, scriptureRef: "1 Samuel 1", teachingPoint: "God hears our heartfelt prayers, even when we wait a long time for an answer." },
  { sequence: 71, title: "Samuel Anoints David", ageMin: 7, ageMax: 9, scriptureRef: "1 Samuel 16", teachingPoint: "God chooses leaders by their heart, not their appearance." },
  { sequence: 72, title: "David and Jonathan's Friendship", ageMin: 7, ageMax: 9, scriptureRef: "1 Samuel 18-20", teachingPoint: "True friendship stands loyal even when it costs us something." },
  { sequence: 73, title: "David Spares Saul's Life", ageMin: 7, ageMax: 9, scriptureRef: "1 Samuel 24", teachingPoint: "Choosing mercy over revenge honours God, even toward those who wrong us." },
  { sequence: 74, title: "David Says Sorry to God", ageMin: 7, ageMax: 9, scriptureRef: "2 Samuel 12", teachingPoint: "Even when we make serious mistakes, honest repentance matters to God." },
  { sequence: 75, title: "Solomon Asks for Wisdom", ageMin: 7, ageMax: 9, scriptureRef: "1 Kings 3", teachingPoint: "Asking God for wisdom is more valuable than asking for riches." },
  { sequence: 76, title: "The Queen of Sheba Visits Solomon", ageMin: 7, ageMax: 9, scriptureRef: "1 Kings 10", teachingPoint: "God's wisdom and blessing are worth seeking out, wherever we must travel." },
  { sequence: 77, title: "Elijah on Mount Carmel", ageMin: 7, ageMax: 9, scriptureRef: "1 Kings 18", teachingPoint: "Standing firm for truth, even alone, matters to God." },
  { sequence: 78, title: "Elijah and the Still Small Voice", ageMin: 7, ageMax: 9, scriptureRef: "1 Kings 19", teachingPoint: "God often speaks gently, not only in dramatic ways." },
  { sequence: 79, title: "Elisha and the Widow's Oil", ageMin: 7, ageMax: 9, scriptureRef: "2 Kings 4", teachingPoint: "God multiplies what we offer Him in faith." },
  { sequence: 80, title: "Elisha and the Shunammite's Son", ageMin: 7, ageMax: 9, scriptureRef: "2 Kings 4", teachingPoint: "God is powerful over even the hardest situations." },
  { sequence: 81, title: "Josiah the Boy King", ageMin: 7, ageMax: 9, scriptureRef: "2 Kings 22-23", teachingPoint: "It's never too young to lead others back to what's right." },
  { sequence: 82, title: "Esther Becomes Queen", ageMin: 7, ageMax: 9, scriptureRef: "Esther 2", teachingPoint: "God can position us in unexpected places for a bigger purpose." },
  { sequence: 83, title: "Esther Saves Her People", ageMin: 7, ageMax: 9, scriptureRef: "Esther 4-7", teachingPoint: "Courage to speak up, even when it's risky, can save others." },
  { sequence: 84, title: "Nehemiah Rebuilds the Wall", ageMin: 7, ageMax: 9, scriptureRef: "Nehemiah 2-6", teachingPoint: "With God's help and teamwork, we can rebuild what's broken." },
  { sequence: 85, title: "Job's Trust in Hard Times", ageMin: 7, ageMax: 9, scriptureRef: "Job 1-2, 42", teachingPoint: "Even when life is unfair and painful, we can still trust God." },
  { sequence: 86, title: "Daniel Interprets the King's Dream", ageMin: 7, ageMax: 9, scriptureRef: "Daniel 2", teachingPoint: "God gives wisdom and understanding beyond our own." },
  { sequence: 87, title: "The Fiery Furnace", ageMin: 7, ageMax: 9, scriptureRef: "Daniel 3", teachingPoint: "God is with us even in the hottest, hardest trials, and He can rescue us." },
  { sequence: 88, title: "The Birth of John the Baptist", ageMin: 7, ageMax: 9, scriptureRef: "Luke 1", teachingPoint: "God prepares the way for His plans, often before we can see it." },
  { sequence: 89, title: "Jesus' Temptation in the Wilderness", ageMin: 7, ageMax: 9, scriptureRef: "Matthew 4", teachingPoint: "God's Word helps us stand strong against temptation." },
  { sequence: 90, title: "The Sermon on the Mount: The Beatitudes", ageMin: 7, ageMax: 9, scriptureRef: "Matthew 5", teachingPoint: "God blesses humility, mercy, and hunger for what's right, not just strength or status." },
  { sequence: 91, title: "The Parable of the Sower", ageMin: 7, ageMax: 9, scriptureRef: "Matthew 13", teachingPoint: "How we receive God's Word affects how much it grows in our life." },
  { sequence: 92, title: "The Parable of the Mustard Seed", ageMin: 7, ageMax: 9, scriptureRef: "Matthew 13", teachingPoint: "Small acts of faith can grow into something much bigger than we imagine." },
  { sequence: 93, title: "The Parable of the Lost Coin", ageMin: 7, ageMax: 9, scriptureRef: "Luke 15", teachingPoint: "God rejoices over every single person who is found." },
  { sequence: 94, title: "The Prodigal Son", ageMin: 7, ageMax: 9, scriptureRef: "Luke 15", teachingPoint: "God's love and forgiveness welcome us home no matter how far we've gone." },
  { sequence: 95, title: "The Parable of the Talents", ageMin: 7, ageMax: 9, scriptureRef: "Matthew 25", teachingPoint: "God wants us to make good use of whatever gifts and opportunities we've been given." },
  { sequence: 96, title: "The Wise and Foolish Builders", ageMin: 7, ageMax: 9, scriptureRef: "Matthew 7:24-27", teachingPoint: "Building our lives on Jesus' teaching keeps us strong through hard times." },
  { sequence: 97, title: "The Transfiguration", ageMin: 7, ageMax: 9, scriptureRef: "Matthew 17", teachingPoint: "Jesus revealed His glory to strengthen His disciples' faith." },
  { sequence: 98, title: "Jesus Raises Lazarus", ageMin: 7, ageMax: 9, scriptureRef: "John 11", teachingPoint: "Jesus has power over death, and He shares in our grief." },
  { sequence: 99, title: "The Last Supper and the New Commandment", ageMin: 7, ageMax: 9, scriptureRef: "John 13", teachingPoint: "Jesus calls us to love and serve one another humbly, as He did." },
  { sequence: 100, title: "Jesus Prays in Gethsemane", ageMin: 7, ageMax: 9, scriptureRef: "Matthew 26", teachingPoint: "Even Jesus faced fear and prayed honestly to God before doing something hard." },
  { sequence: 101, title: "Peter Denies Jesus", ageMin: 7, ageMax: 9, scriptureRef: "Luke 22:54-62", teachingPoint: "Even after failing badly, we can be forgiven and restored." },
  { sequence: 102, title: "The Crucifixion", ageMin: 7, ageMax: 9, scriptureRef: "Luke 23", teachingPoint: "Jesus gave His life out of love, taking our place." },
  { sequence: 103, title: "The Road to Emmaus", ageMin: 7, ageMax: 9, scriptureRef: "Luke 24:13-35", teachingPoint: "Jesus meets us in ordinary moments, even when we don't recognise Him at first." },
  { sequence: 104, title: "Saul's Conversion on the Road to Damascus", ageMin: 7, ageMax: 9, scriptureRef: "Acts 9", teachingPoint: "God can transform anyone's life completely, no matter their past." },
];
