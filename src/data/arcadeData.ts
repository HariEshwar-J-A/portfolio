/**
 * Content for the HARI.AI Playground (/ai): an endless quiz pool,
 * scramble words, and memory pairs. Every quiz question unlocks a
 * "memory fragment" — a real fact about Harieshwar — so playing longer
 * always reveals more of the person behind the portfolio.
 */

export type FragmentCategory =
  | 'competitive'
  | 'craft'
  | 'career'
  | 'culture'
  | 'creative'
  | 'ambition';

export interface QuizQuestion {
  id: string;
  category: FragmentCategory;
  question: string;
  options: string[];
  correctIndex: number;
  /** The memory fragment revealed by this question (right or wrong). */
  fragment: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'valorant-apex',
    category: 'competitive',
    question: 'Hari grinds competitive shooters. What peak rank did he reach in BOTH Valorant and Apex Legends?',
    options: ['Gold', 'Platinum', 'Diamond', 'Radiant'],
    correctIndex: 2,
    fragment: 'Diamond in both Valorant and Apex Legends — competition is not a mood, it is a default setting.',
  },
  {
    id: 'chess-lifestyle',
    category: 'competitive',
    question: 'Which game does Hari describe as "not just a hobby, but a lifestyle"?',
    options: ['Cricket', 'Chess', 'Valorant', 'Table tennis'],
    correctIndex: 1,
    fragment: 'Chess is his lifestyle: college team captain, 3 consecutive years of zonal podiums, and he grew a 4-man team into a 50-player program.',
  },
  {
    id: 'cricket-idol',
    category: 'competitive',
    question: 'Hari is a huge cricket fan. Whose poster is on the wall?',
    options: ['Virat Kohli', 'Sachin Tendulkar', 'MS Dhoni', 'Rohit Sharma'],
    correctIndex: 2,
    fragment: 'Massive MS Dhoni fan — calm under pressure, finishes the game. A leadership blueprint he actually follows.',
  },
  {
    id: 'football-idol',
    category: 'competitive',
    question: 'And on the football side, who is his GOAT?',
    options: ['Cristiano Ronaldo', 'Lionel Messi', 'Neymar', 'Mbappé'],
    correctIndex: 1,
    fragment: 'Lionel Messi fan — vision, patience, and letting the work speak.',
  },
  {
    id: 'sports-mix',
    category: 'competitive',
    question: 'Beyond chess, which set of sports does Hari actually play?',
    options: [
      'Table tennis, football, cricket, athletics',
      'Basketball, hockey, swimming',
      'Golf, tennis, badminton',
      'Only esports — touch grass is a myth',
    ],
    correctIndex: 0,
    fragment: 'Table tennis, football, cricket, and athletics — if it has a scoreboard, he is in.',
  },
  {
    id: 'tamil',
    category: 'culture',
    question: 'Which language does Hari love for being one of the oldest living languages in the world?',
    options: ['Sanskrit', 'Tamil', 'Greek', 'Latin'],
    correctIndex: 1,
    fragment: 'Tamil is his mother tongue — he loves it for its history as one of the oldest and purest living languages.',
  },
  {
    id: 'astrology',
    category: 'culture',
    question: 'Hari has a surprising analytical hobby. Friends and clients say his readings are "100% true". What is it?',
    options: ['Palmistry', 'Tarot', 'Astrology', 'Numerology'],
    correctIndex: 2,
    fragment: 'He practices astrology as a hobby — friends and clients swear his predictions land every time. Pattern recognition, everywhere.',
  },
  {
    id: 'drone',
    category: 'creative',
    question: 'What flying hardware does Hari own (and hire out his skills with, for events)?',
    options: ['A paraglider', 'A drone', 'A model rocket', 'A microlight'],
    correctIndex: 1,
    fragment: 'He owns a drone and does drone + gimbal videography — you can actually hire him to shoot your event.',
  },
  {
    id: 'moon',
    category: 'creative',
    question: 'His favorite subject to photograph in the night sky?',
    options: ['The Milky Way', 'Mars', 'The Moon', 'Satellites'],
    correctIndex: 2,
    fragment: 'Astrophotography lover — and the Moon is his muse.',
  },
  {
    id: 'movies',
    category: 'creative',
    question: 'What is Hari\'s long-term creative ambition?',
    options: ['Write a novel', 'Make movies himself', 'Release an album', 'Open a gallery'],
    correctIndex: 1,
    fragment: 'Long-term goal: make movies himself — directing, shooting, the whole frame.',
  },
  {
    id: 'ice-cream',
    category: 'culture',
    question: 'Pick Hari\'s ice-cream order.',
    options: ['Strawberry & mango', 'Chocolate & vanilla', 'Pistachio & coffee', 'Mint & bubblegum'],
    correctIndex: 1,
    fragment: 'Chocolate and vanilla — the classics, executed perfectly. Like good engineering.',
  },
  {
    id: 'chicken',
    category: 'culture',
    question: 'His comfort food across every cuisine?',
    options: ['Paneer', 'Chicken — all flavours and spices', 'Sushi', 'Pizza only'],
    correctIndex: 1,
    fragment: 'Chicken across every cuisine and spice level — a man of distributed taste.',
  },
  {
    id: 'business',
    category: 'ambition',
    question: 'What is on Hari\'s 5–10 year roadmap?',
    options: [
      'Becoming a staff engineer somewhere quiet',
      'Starting his own business (then several)',
      'Early retirement',
      'Professional esports',
    ],
    correctIndex: 1,
    fragment: 'The roadmap: start his own business within 5–10 years, then build several — entrepreneurship is the endgame.',
  },
  {
    id: 'robotics',
    category: 'ambition',
    question: 'Beyond software, which frontier fields is Hari drawn to?',
    options: ['Biotech & pharma', 'Robotics & aeronautics', 'Mining & geology', 'Fashion tech'],
    correctIndex: 1,
    fragment: 'Robotics and aeronautics call to him — hardware that moves is the next playground.',
  },
  {
    id: 'first-company',
    category: 'career',
    question: 'Where did Hari\'s industry story begin, as a backend intern writing core Java?',
    options: ['Infosys', 'Zoho', 'TCS', 'Freshworks'],
    correctIndex: 1,
    fragment: 'First industry stop: Zoho, as a backend intern — recognized for rapid learning on core Java modules.',
  },
  {
    id: 'soliton-awards',
    category: 'career',
    question: 'At Soliton Technologies, Hari won a company honor — twice. Which one?',
    options: ['Star Soliton award', 'Hackathon gold', 'Patent of the year', 'Culture champion'],
    correctIndex: 0,
    fragment: 'Two "Star Soliton" awards — plus a shark-tank runner-up product and $100k+ engagements he helped secure.',
  },
  {
    id: 'infosentry',
    category: 'career',
    question: 'What is InfoSentry, the flagship product Hari designs, builds, and runs?',
    options: [
      'A password manager',
      'A personal AI intelligence layer',
      'A crypto tracker',
      'A CI/CD dashboard',
    ],
    correctIndex: 1,
    fragment: 'InfoSentry: his self-hosted personal AI intelligence layer — 50+ sources, LLM relevance scoring, zero ads, real uptime.',
  },
  {
    id: 'mcmaster',
    category: 'career',
    question: 'Hari\'s M.Eng in Systems & Technology (3.9 GPA) is from…',
    options: ['University of Toronto', 'McMaster University', 'Waterloo', 'UBC'],
    correctIndex: 1,
    fragment: 'M.Eng in Systems & Technology from McMaster University, 3.9/4.0 — automation and smart systems focus.',
  },
  {
    id: 'big-data',
    category: 'career',
    question: 'His Big Data proof-of-concept at Soliton ingested how many semiconductor logs per day?',
    options: ['50k+', '500k+', '5M+', '5B+'],
    correctIndex: 2,
    fragment: '5M+ logs a day through an Elastic/AWS pipeline for anomaly detection — scale is a comfort zone.',
  },
  {
    id: 'mentoring',
    category: 'ambition',
    question: 'Hari\'s CSR mentoring program for college students ended with what placement rate?',
    options: ['60%', '80%', '90%', '100%'],
    correctIndex: 3,
    fragment: '100% placement for the students he coached — he was also named Best Alumni for training students and faculty.',
  },
  {
    id: 'family',
    category: 'ambition',
    question: 'Who does Hari want alongside him in his future ventures?',
    options: [
      'Venture capitalists only',
      'His family and friends',
      'Strictly solo',
      'Whoever bids highest',
    ],
    correctIndex: 1,
    fragment: 'Family and friends first — he wants the people he loves collaborating in everything he builds.',
  },
  {
    id: 'edu-collab',
    category: 'ambition',
    question: 'What kind of collaborations excite Hari the most right now?',
    options: [
      'Educational — AI and tech knowledge sharing',
      'Real estate',
      'Merch drops',
      'Reality TV',
    ],
    correctIndex: 0,
    fragment: 'He is actively looking for educational collaborations around AI and tech — teaching is in his DNA.',
  },
];

export interface ScrambleWord {
  word: string;
  hint: string;
}

export const scrambleWords: ScrambleWord[] = [
  { word: 'VALORANT', hint: 'Diamond rank, tactical FPS' },
  { word: 'INFOSENTRY', hint: 'His personal AI intelligence layer' },
  { word: 'GRANDMASTER', hint: 'The gold theme persona — chess energy' },
  { word: 'MCMASTER', hint: 'Where the M.Eng happened' },
  { word: 'TYPESCRIPT', hint: 'His strongly-typed daily driver' },
  { word: 'DHONI', hint: 'Captain cool, his cricket idol' },
  { word: 'MESSI', hint: 'The football GOAT in his book' },
  { word: 'ASTROLOGY', hint: 'The hobby with "100% true" predictions' },
  { word: 'TAMIL', hint: 'One of the oldest languages — his mother tongue' },
  { word: 'DRONE', hint: 'He flies one for event videography' },
  { word: 'ROBOTICS', hint: 'A frontier he aspires to build in' },
  { word: 'CHOCOLATE', hint: 'Half of his ice-cream order' },
  { word: 'CRICKET', hint: 'A sport he plays and worships' },
  { word: 'AERONAUTICS', hint: 'Flight-obsessed frontier field' },
  { word: 'CHESS', hint: 'Not a hobby — a lifestyle' },
  { word: 'MOON', hint: 'His astrophotography muse' },
];

export interface MemoryPair {
  id: string;
  label: string;
  /** lucide icon key resolved in the module */
  icon: 'gamepad' | 'crown' | 'camera' | 'moon' | 'trophy' | 'rocket';
}

export const memoryPairs: MemoryPair[] = [
  { id: 'esports', label: 'Esports', icon: 'gamepad' },
  { id: 'chess', label: 'Chess', icon: 'crown' },
  { id: 'drone', label: 'Drone shots', icon: 'camera' },
  { id: 'moon', label: 'Moon', icon: 'moon' },
  { id: 'cricket', label: 'Cricket', icon: 'trophy' },
  { id: 'aero', label: 'Aeronautics', icon: 'rocket' },
];

export const FRAGMENT_CATEGORY_LABELS: Record<FragmentCategory, string> = {
  competitive: 'Competitive core',
  craft: 'Craft',
  career: 'Career telemetry',
  culture: 'Culture & roots',
  creative: 'Creative lens',
  ambition: 'Ambition engine',
};
