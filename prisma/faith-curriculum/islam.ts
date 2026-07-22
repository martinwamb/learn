// Topic-only curriculum outline for Islamic Faith Stories -- NOT full lesson
// content. Each entry fixes what a lesson must cover (title + reference +
// one non-negotiable teaching point); workers/faith-lesson-generator.ts uses
// Ollama to write the actual retelling/activities text against these fixed
// facts, and saves the result as status:"draft" for admin review before publish.
//
// IMPORTANT: unlike christianity.ts, this is a brand-new tradition with no
// existing hand-authored content to build on or check against. Per the plan,
// this topic list (titles + references + teaching points -- not yet any
// generated lesson prose) should get a human sanity-check for doctrinal
// framing before the AI worker is pointed at it. `scriptureRef` values here are
// deliberately kept at the chapter/topic level (not specific ayah numbers) to
// avoid asserting a precise citation that hasn't been verified against a
// mushaf -- treat every scriptureRef as a starting pointer for the reviewer,
// not a citation to trust as-is.
//
// Sequence numbers are unique per-tradition (schema: @@unique([traditionId, sequence]));
// unlike Christianity this tradition starts fresh at 1.
//
// Target: 52 lessons per age bracket (52 early-years + 52 junior = 104 total).

export interface CurriculumTopic {
  sequence: number;
  title: string;
  ageMin: number;
  ageMax: number;
  scriptureRef?: string;
  teachingPoint: string;
}

export const topics: CurriculumTopic[] = [
  // ── Early Years (4-6) -- sequences 1-52 ───────────────────────────────────
  { sequence: 1, title: "Allah Made Everything", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Al-An'am (creation)", teachingPoint: "Allah created everything in the world, and we should be thankful." },
  { sequence: 2, title: "Saying Bismillah", ageMin: 4, ageMax: 6, scriptureRef: "Islamic practice -- said before starting anything", teachingPoint: "We start good things by saying 'Bismillah' and remembering Allah." },
  { sequence: 3, title: "Learning the Shahada", ageMin: 4, ageMax: 6, scriptureRef: "The Shahada (declaration of faith)", teachingPoint: "The Shahada is our simple statement that there is no god but Allah, and Muhammad (peace be upon him) is His messenger." },
  { sequence: 4, title: "Prophet Adam, the First Man", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Al-Baqarah (story of Adam)", teachingPoint: "Allah created the first human, Prophet Adam (peace be upon him), and taught him to say sorry when he made a mistake." },
  { sequence: 5, title: "Prophet Nuh and the Great Flood", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Nuh", teachingPoint: "Prophet Nuh (peace be upon him) obeyed Allah patiently, even when others didn't listen." },
  { sequence: 6, title: "Prophet Ibrahim Searches for Allah", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Al-An'am (Ibrahim's search)", teachingPoint: "Prophet Ibrahim (peace be upon him) used his mind to realise that only Allah deserves to be worshipped." },
  { sequence: 7, title: "Prophet Ibrahim Builds the Kaaba", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Al-Baqarah (raising the House)", teachingPoint: "Prophet Ibrahim (peace be upon him) and his son Ismail (peace be upon him) built the Kaaba to worship Allah." },
  { sequence: 8, title: "Prophet Ismail's Trust", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah As-Saffat (Ismail's story)", teachingPoint: "Prophet Ismail (peace be upon him) trusted and obeyed Allah, just like his father." },
  { sequence: 9, title: "Prophet Yusuf and His Dream", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Yusuf", teachingPoint: "Allah has a good plan for us, even when others treat us unfairly." },
  { sequence: 10, title: "Prophet Yusuf Forgives His Brothers", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Yusuf", teachingPoint: "Forgiving people who hurt us is something Allah loves." },
  { sequence: 11, title: "Prophet Musa in the Basket", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Al-Qasas (baby Musa)", teachingPoint: "Allah protects and watches over every child." },
  { sequence: 12, title: "Prophet Musa and Prophet Harun", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Ta-Ha (Musa and Harun)", teachingPoint: "Allah helps us when we ask Him, and helpers make hard tasks easier." },
  { sequence: 13, title: "Prophet Dawud's Beautiful Voice", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Saba (Dawud's blessings)", teachingPoint: "Allah gave Prophet Dawud (peace be upon him) a beautiful voice to praise Him." },
  { sequence: 14, title: "Prophet Sulayman and the Animals", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah An-Naml (Sulayman and the ants)", teachingPoint: "Allah gave Prophet Sulayman (peace be upon him) wisdom and kindness toward all creatures." },
  { sequence: 15, title: "Prophet Yunus and the Big Fish", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah As-Saffat (Yunus and the whale)", teachingPoint: "Allah forgives us when we turn back to Him and say sorry." },
  { sequence: 16, title: "Prophet Isa's Birth", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Maryam", teachingPoint: "Allah's power can do wonderful, surprising things." },
  { sequence: 17, title: "The Five Pillars: An Introduction", ageMin: 4, ageMax: 6, scriptureRef: "The Five Pillars of Islam", teachingPoint: "Muslims follow five special acts of worship called the Five Pillars of Islam." },
  { sequence: 18, title: "Shahada: Our Belief", ageMin: 4, ageMax: 6, scriptureRef: "The Shahada", teachingPoint: "Believing in Allah and His messenger is the foundation of being Muslim." },
  { sequence: 19, title: "Salah: Talking to Allah", ageMin: 4, ageMax: 6, scriptureRef: "Salah (the five daily prayers)", teachingPoint: "We pray five times a day to stay close to Allah." },
  { sequence: 20, title: "Learning Wudu", ageMin: 4, ageMax: 6, scriptureRef: "Wudu (ritual washing before prayer)", teachingPoint: "We clean ourselves before we pray, to show respect to Allah." },
  { sequence: 21, title: "Going to the Mosque", ageMin: 4, ageMax: 6, scriptureRef: "The mosque (masjid)", teachingPoint: "The mosque is a special, peaceful place where we worship Allah together." },
  { sequence: 22, title: "Zakat: Sharing with Others", ageMin: 4, ageMax: 6, scriptureRef: "Zakat (obligatory charity)", teachingPoint: "Muslims share some of what they have with people who need help." },
  { sequence: 23, title: "Sawm: Fasting in Ramadan", ageMin: 4, ageMax: 6, scriptureRef: "Sawm (fasting)", teachingPoint: "During Ramadan, Muslims fast to grow closer to Allah and remember those who are hungry." },
  { sequence: 24, title: "Eid al-Fitr: A Joyful Celebration", ageMin: 4, ageMax: 6, scriptureRef: "Eid al-Fitr", teachingPoint: "Eid al-Fitr is a happy day of thanks after the month of Ramadan." },
  { sequence: 25, title: "Hajj: The Special Journey", ageMin: 4, ageMax: 6, scriptureRef: "Hajj (pilgrimage to Makkah)", teachingPoint: "Muslims who are able travel to Makkah to worship Allah together as one big family." },
  { sequence: 26, title: "Eid al-Adha and Sharing", ageMin: 4, ageMax: 6, scriptureRef: "Eid al-Adha", teachingPoint: "Eid al-Adha reminds us of Prophet Ibrahim's obedience and teaches us to share with others." },
  { sequence: 27, title: "Being Kind to Parents", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Al-Isra (kindness to parents)", teachingPoint: "Allah asks us to be gentle, respectful, and kind to our parents." },
  { sequence: 28, title: "Being Honest", ageMin: 4, ageMax: 6, scriptureRef: "Hadith on truthfulness", teachingPoint: "Allah loves those who always tell the truth." },
  { sequence: 29, title: "Being Kind to Animals", ageMin: 4, ageMax: 6, scriptureRef: "Hadith on kindness to animals", teachingPoint: "Prophet Muhammad (peace be upon him) taught us to be gentle and caring toward animals." },
  { sequence: 30, title: "Sharing with Friends", ageMin: 4, ageMax: 6, scriptureRef: "Hadith on generosity", teachingPoint: "Sharing what we have brings blessings and joy." },
  { sequence: 31, title: "Saying Thank You (Alhamdulillah)", ageMin: 4, ageMax: 6, scriptureRef: "Alhamdulillah (praise and thanks to Allah)", teachingPoint: "We say 'Alhamdulillah' to thank Allah for our blessings." },
  { sequence: 32, title: "Being Patient", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an on sabr (patience)", teachingPoint: "Allah loves those who stay patient, even when things are hard." },
  { sequence: 33, title: "Helping Others", ageMin: 4, ageMax: 6, scriptureRef: "Hadith on helping others", teachingPoint: "Helping people in need is something Allah loves for us to do." },
  { sequence: 34, title: "Keeping Clean", ageMin: 4, ageMax: 6, scriptureRef: "Hadith on cleanliness", teachingPoint: "Islam teaches us that cleanliness is an important part of our faith." },
  { sequence: 35, title: "Respecting Elders", ageMin: 4, ageMax: 6, scriptureRef: "Hadith on respecting elders", teachingPoint: "Allah wants us to be respectful and gentle toward older people." },
  { sequence: 36, title: "The Prophet's Kindness to a Neighbour", ageMin: 4, ageMax: 6, scriptureRef: "Seerah -- the Prophet's character", teachingPoint: "Prophet Muhammad (peace be upon him) was patient and kind, even to people who were unkind to him." },
  { sequence: 37, title: "The Prophet's Love for Children", ageMin: 4, ageMax: 6, scriptureRef: "Seerah -- the Prophet and children", teachingPoint: "Prophet Muhammad (peace be upon him) was gentle and loving toward children." },
  { sequence: 38, title: "Learning Simple Duas", ageMin: 4, ageMax: 6, scriptureRef: "Everyday duas (supplications)", teachingPoint: "We can talk to Allah anytime using simple duas." },
  { sequence: 39, title: "Dua Before Eating", ageMin: 4, ageMax: 6, scriptureRef: "Dua before meals", teachingPoint: "We remember Allah and say a dua before we eat." },
  { sequence: 40, title: "Dua Before Sleeping", ageMin: 4, ageMax: 6, scriptureRef: "Dua before sleeping", teachingPoint: "We ask Allah to protect us before we go to sleep." },
  { sequence: 41, title: "The Beauty of the Qur'an", ageMin: 4, ageMax: 6, scriptureRef: "The Qur'an as Allah's book", teachingPoint: "The Qur'an is Allah's special book, and we treat it with care and respect." },
  { sequence: 42, title: "Learning Short Surahs", ageMin: 4, ageMax: 6, scriptureRef: "Surah Al-Ikhlas and other short surahs", teachingPoint: "Learning short surahs helps us remember and love Allah's words." },
  { sequence: 43, title: "Allah's Beautiful Names", ageMin: 4, ageMax: 6, scriptureRef: "Asma-ul-Husna (the 99 Names of Allah)", teachingPoint: "Allah has many beautiful names that describe His love and kindness." },
  { sequence: 44, title: "Allah Is Ar-Rahman, the Most Merciful", ageMin: 4, ageMax: 6, scriptureRef: "Asma-ul-Husna -- Ar-Rahman, Ar-Raheem", teachingPoint: "Allah's mercy is bigger than anything, and He loves to forgive us." },
  { sequence: 45, title: "Angels All Around", ageMin: 4, ageMax: 6, scriptureRef: "Belief in the angels", teachingPoint: "Allah created angels who worship Him and watch over us." },
  { sequence: 46, title: "Being Grateful for Food", ageMin: 4, ageMax: 6, scriptureRef: "Hadith on not wasting food", teachingPoint: "We should never waste food and always be thankful for it." },
  { sequence: 47, title: "Caring for the Environment", ageMin: 4, ageMax: 6, scriptureRef: "Hadith on caring for the earth", teachingPoint: "Allah asks us to take good care of the earth He created." },
  { sequence: 48, title: "Friday: A Special Day", ageMin: 4, ageMax: 6, scriptureRef: "Jumu'ah (Friday)", teachingPoint: "Friday (Jumu'ah) is a special, blessed day for Muslims." },
  { sequence: 49, title: "The Story of the Elephant", ageMin: 4, ageMax: 6, scriptureRef: "Qur'an, Surah Al-Fil", teachingPoint: "Allah protects His sacred places in ways beyond our understanding." },
  { sequence: 50, title: "Prophet Muhammad as a Kind Shepherd Boy", ageMin: 4, ageMax: 6, scriptureRef: "Seerah -- the Prophet's youth", teachingPoint: "Even as a young boy, Prophet Muhammad (peace be upon him) was known for his honesty and gentle heart." },
  { sequence: 51, title: "The Cave of Hira", ageMin: 4, ageMax: 6, scriptureRef: "Seerah -- the first revelation", teachingPoint: "Prophet Muhammad (peace be upon him) received Allah's first message while quietly reflecting in a cave." },
  { sequence: 52, title: "Sharing Salaam (Peace Greetings)", ageMin: 4, ageMax: 6, scriptureRef: "Hadith on spreading salaam", teachingPoint: "Saying 'Assalamu Alaikum' spreads peace and kindness between people." },

  // ── Junior (7-9) -- sequences 53-104 ──────────────────────────────────────
  { sequence: 53, title: "Prophet Adam and Repentance", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Baqarah (Adam's repentance)", teachingPoint: "Allah accepts our repentance when we are truly sorry and turn back to Him." },
  { sequence: 54, title: "Prophet Idris, the Wise Teacher", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Maryam (mention of Idris)", teachingPoint: "Seeking knowledge and wisdom is valued highly in Islam." },
  { sequence: 55, title: "Prophet Nuh's Long Years of Patience", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Ankabut (Nuh's 950 years)", teachingPoint: "True patience means continuing to do right even when results take a very long time." },
  { sequence: 56, title: "Prophet Hud and His People", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Hud", teachingPoint: "Warnings from Allah are a mercy, meant to guide us before hardship comes." },
  { sequence: 57, title: "Prophet Salih and the She-Camel", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Ash-Shams (Salih's she-camel)", teachingPoint: "Respecting the signs and trusts Allah gives us matters greatly." },
  { sequence: 58, title: "Prophet Ibrahim's Trial", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah As-Saffat (the great sacrifice)", teachingPoint: "Complete trust and obedience to Allah brings great reward, and Allah is merciful in how He tests us." },
  { sequence: 59, title: "Prophet Ibrahim Debates the King", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Baqarah (Ibrahim and the king)", teachingPoint: "Standing firm in truth, even before powerful people, is something Allah honours." },
  { sequence: 60, title: "Prophet Lut and Standing for What's Right", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Hud (story of Lut)", teachingPoint: "Calling people gently toward what is right takes courage." },
  { sequence: 61, title: "Prophet Ya'qub's Patience and Grief", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Yusuf (Ya'qub's grief)", teachingPoint: "Allah is with us through our sadness, and patience brings comfort in time." },
  { sequence: 62, title: "Prophet Yusuf's Journey from Well to Palace", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Yusuf", teachingPoint: "Allah can turn our hardest trials into the means of something great." },
  { sequence: 63, title: "Prophet Ayyub's Patience in Illness", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Anbiya (Ayyub's patience)", teachingPoint: "Even in prolonged suffering, Prophet Ayyub (peace be upon him) never stopped trusting Allah." },
  { sequence: 64, title: "Prophet Shu'ayb and Honest Trade", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Hud (Shu'ayb and fair trade)", teachingPoint: "Being fair and honest in business is a duty Allah takes seriously." },
  { sequence: 65, title: "Prophet Musa and Pharaoh", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Ta-Ha (Musa confronts Pharaoh)", teachingPoint: "Allah supports those who stand for justice, no matter how powerful their opponent." },
  { sequence: 66, title: "Prophet Musa and the Parting of the Sea", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Ash-Shu'ara", teachingPoint: "Allah's help can arrive in the most impossible-seeming moments." },
  { sequence: 67, title: "Prophet Musa Receives the Tawrah", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-A'raf (the Tawrah)", teachingPoint: "Allah sent guidance through His prophets to help people live rightly." },
  { sequence: 68, title: "Prophet Dawud and Jalut", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Baqarah (Dawud and Jalut)", teachingPoint: "Courage and faith in Allah can overcome forces that look far stronger than us." },
  { sequence: 69, title: "Prophet Sulayman and the Queen of Sheba", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah An-Naml (Sulayman and Bilqis)", teachingPoint: "Wisdom, given by Allah, helps us solve problems and build understanding between people." },
  { sequence: 70, title: "Prophet Sulayman's Justice", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Sad (Sulayman's judgement)", teachingPoint: "True wisdom cares about fairness for everyone, including the vulnerable." },
  { sequence: 71, title: "Prophet Ilyas and Steadfast Faith", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah As-Saffat (mention of Ilyas)", teachingPoint: "Holding firmly to worshipping Allah alone matters, even when few others do." },
  { sequence: 72, title: "Prophet Yunus and Learning Patience", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Qalam (lesson of Yunus)", teachingPoint: "Allah teaches us patience and forgiveness even when we make mistakes." },
  { sequence: 73, title: "Prophet Zakariya's Prayer for a Child", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Maryam (Zakariya's prayer)", teachingPoint: "Allah answers sincere prayers in His perfect timing." },
  { sequence: 74, title: "Prophet Yahya's Devotion", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Maryam (Yahya's devotion)", teachingPoint: "A life devoted to worship and good character honours Allah." },
  { sequence: 75, title: "Prophet Isa's Miracles by Allah's Permission", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Ma'idah (Isa's miracles)", teachingPoint: "All miracles happen only by Allah's permission and power." },
  { sequence: 76, title: "Prophet Isa's Message of Compassion", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Maryam (Isa's message)", teachingPoint: "Prophet Isa (peace be upon him) taught kindness, compassion, and worship of Allah alone." },
  { sequence: 77, title: "The Birth of Prophet Muhammad", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- early life", teachingPoint: "Prophet Muhammad (peace be upon him) was born into a family known for honesty." },
  { sequence: 78, title: "The Prophet's Childhood and Youth", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- 'Al-Amin'", teachingPoint: "From a young age, Prophet Muhammad (peace be upon him) was known as 'Al-Amin,' the trustworthy one." },
  { sequence: 79, title: "The First Revelation in the Cave of Hira", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- the first revelation", teachingPoint: "Allah chose the Prophet to deliver His final message to humanity." },
  { sequence: 80, title: "The Early Believers and Their Courage", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- early Makkah", teachingPoint: "The first Muslims showed great courage in holding onto their faith despite hardship." },
  { sequence: 81, title: "The Hijrah: Migration to Madinah", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- the Hijrah", teachingPoint: "Sometimes following what's right means making a difficult, faithful journey." },
  { sequence: 82, title: "Building the Community in Madinah", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- early Madinah", teachingPoint: "The Prophet built a community based on brotherhood, fairness, and mutual support." },
  { sequence: 83, title: "The Battle of Badr", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- the Battle of Badr", teachingPoint: "Allah supports the believers who remain patient and rely on Him, even against difficult odds." },
  { sequence: 84, title: "The Treaty of Hudaybiyyah", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- the treaty", teachingPoint: "Choosing peace and patience, even when it seems like a setback, can lead to a greater good." },
  { sequence: 85, title: "The Conquest of Makkah", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- the conquest of Makkah", teachingPoint: "The Prophet returned to Makkah with mercy and forgiveness, not revenge." },
  { sequence: 86, title: "The Farewell Sermon", ageMin: 7, ageMax: 9, scriptureRef: "Seerah -- the Farewell Sermon", teachingPoint: "The Prophet taught equality, kindness, and justice for all people in his final sermon." },
  { sequence: 87, title: "The Five Pillars in Depth: Salah", ageMin: 7, ageMax: 9, scriptureRef: "Salah (the five daily prayers)", teachingPoint: "Prayer keeps our connection with Allah strong throughout each day." },
  { sequence: 88, title: "The Five Pillars in Depth: Zakat", ageMin: 7, ageMax: 9, scriptureRef: "Zakat", teachingPoint: "Zakat purifies our wealth and helps balance fairness in the community." },
  { sequence: 89, title: "The Five Pillars in Depth: Sawm", ageMin: 7, ageMax: 9, scriptureRef: "Sawm", teachingPoint: "Fasting builds self-control and empathy for those who have less." },
  { sequence: 90, title: "The Five Pillars in Depth: Hajj", ageMin: 7, ageMax: 9, scriptureRef: "Hajj", teachingPoint: "Hajj unites Muslims from every nation in equal worship before Allah." },
  { sequence: 91, title: "The Night Journey (Isra and Mi'raj)", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Isra", teachingPoint: "Allah's power reaches beyond what we can imagine or measure." },
  { sequence: 92, title: "The Angels: Jibril, Mika'il, and Israfil", ageMin: 7, ageMax: 9, scriptureRef: "Belief in the angels", teachingPoint: "Angels are Allah's obedient creation, carrying out His commands." },
  { sequence: 93, title: "Belief in the Holy Books", ageMin: 7, ageMax: 9, scriptureRef: "Belief in the revealed books", teachingPoint: "Allah sent guidance through many messengers and books throughout history." },
  { sequence: 94, title: "Belief in the Day of Judgment", ageMin: 7, ageMax: 9, scriptureRef: "Belief in the Day of Judgment", teachingPoint: "Our good and bad actions matter, and Allah is always just." },
  { sequence: 95, title: "Qadr: Trusting Allah's Plan", ageMin: 7, ageMax: 9, scriptureRef: "Belief in Qadr (divine decree)", teachingPoint: "Trusting that Allah's plan is wise helps us stay calm through life's ups and downs." },
  { sequence: 96, title: "Akhlaq: Good Character in Islam", ageMin: 7, ageMax: 9, scriptureRef: "Hadith on good character", teachingPoint: "The Prophet said he was sent to perfect good character." },
  { sequence: 97, title: "Honesty in Trade and Speech", ageMin: 7, ageMax: 9, scriptureRef: "Hadith on honesty", teachingPoint: "Islam asks for complete honesty in our words and our dealings with others." },
  { sequence: 98, title: "Kindness to Neighbours", ageMin: 7, ageMax: 9, scriptureRef: "Hadith on neighbours", teachingPoint: "The Prophet taught that a true believer takes care of their neighbours." },
  { sequence: 99, title: "Respecting People of Other Faiths", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Mumtahina (fair dealing)", teachingPoint: "Islam teaches respect and fair treatment toward people of other beliefs." },
  { sequence: 100, title: "Seeking Knowledge", ageMin: 7, ageMax: 9, scriptureRef: "Hadith on seeking knowledge", teachingPoint: "The Prophet encouraged every Muslim to seek knowledge throughout their life." },
  { sequence: 101, title: "Gratitude in Hard Times", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an on shukr (gratitude)", teachingPoint: "Being thankful to Allah, even during difficulty, strengthens our faith." },
  { sequence: 102, title: "Sabr: The Meaning of Patience", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an on sabr (patience)", teachingPoint: "Sabr means staying steady and trusting Allah through both hardship and blessings." },
  { sequence: 103, title: "Forgiveness and Letting Go of Anger", ageMin: 7, ageMax: 9, scriptureRef: "Hadith on forgiveness", teachingPoint: "The Prophet showed that forgiving others is a sign of real strength." },
  { sequence: 104, title: "Caring for the Poor and Orphans", ageMin: 7, ageMax: 9, scriptureRef: "Qur'an, Surah Al-Ma'un (caring for orphans)", teachingPoint: "The Prophet taught special kindness and responsibility toward orphans and the poor." },
];
