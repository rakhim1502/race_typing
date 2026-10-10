import { SupportedLanguage, RaceDifficulty, TypingTextItem } from '../../shared/types.ts';

export const TEXT_BANK: TypingTextItem[] = [
  // --- UZBEK TEXTS (O'ZBEK TILI) ---
  {
    id: 'uz-easy-1',
    title: 'Harakat va Muvaffaqiyat',
    author: 'O‘zbek maqoli',
    language: 'uz',
    difficulty: 'easy',
    content: 'Harakatda baraka bor. Har bir urinish insonni o‘z orzulari tomon bir qadam yaqinlashtiradi.',
    length: 93,
  },
  {
    id: 'uz-easy-2',
    title: 'Tezlik va Diqqat',
    author: 'TypeRacer Arena',
    language: 'uz',
    difficulty: 'easy',
    content: 'Klaviatura tugmalarini to‘g‘ri va tez bosish orqali poygada g‘alaba qozonish mumkin.',
    length: 83,
  },
  {
    id: 'uz-med-1',
    title: 'Dasturlash va Kelajak',
    author: 'Zamonaviy IT',
    language: 'uz',
    difficulty: 'medium',
    content: 'Axborot texnologiyalari asrida tez yozish va aniq fikrlash har bir mutaxassis uchun eng muhim ko‘nikmalardan biridir. O‘z ustingda tinimsiz ishla va doimo yangi bilimlarni egalla.',
    length: 181,
  },
  {
    id: 'uz-med-2',
    title: 'Alisher Navoiy Hikmati',
    author: 'Alisher Navoiy',
    language: 'uz',
    difficulty: 'medium',
    content: 'Tilga ixtiyorsiz — elga e’tiborsiz. Har bir aytilgan so‘z kishi aql-zakovatining oynasidir. Bilim o‘rganish yo‘lidagi har bir mashaqqat kelajakdagi katta yutuqlarga poydevor bo‘ladi.',
    length: 184,
  },
  {
    id: 'uz-hard-1',
    title: 'Kompyuter Arxitekturasi va Algoritmlar',
    author: 'IT Qo‘llanma',
    language: 'uz',
    difficulty: 'hard',
    content: 'Zamonaviy mikroprotsessorlar sekundiga milliardlab operatsiyalarni bajaradi. Kesh xotira, quvurli hisoblash hamda ko‘p yadroli arxitektura ma’lumotlarni qayta ishlash samaradorligini mislsiz darajada oshirgan.',
    length: 215,
  },
  {
    id: 'uz-hard-2',
    title: 'Yulduzli Tunlar',
    author: 'Pirimqul Qodirov',
    language: 'uz',
    difficulty: 'hard',
    content: 'Bobur Mirzo tog‘-toshlar osha olis safarlarga otlanar ekan, uning qalbida doimo vatan sog‘inchi va ulug‘ maqsadlar jo‘sh urardi. Qat’iyat va sabr har qanday to‘siqni yengishga qodir eng buyuk kuchdir.',
    length: 199,
  },

  // --- ENGLISH TEXTS ---
  {
    id: 'en-easy-1',
    title: 'Fast Lanes',
    author: 'Racing Lore',
    language: 'en',
    difficulty: 'easy',
    content: 'Speed is good, but precision wins championships. Keep your eyes on the road and fingers ready.',
    length: 96,
  },
  {
    id: 'en-easy-2',
    title: 'The Great Sprint',
    author: 'TypeRacer Arena',
    language: 'en',
    difficulty: 'easy',
    content: 'Every key press accelerates your race car toward the checkered finish line. Never look back.',
    length: 93,
  },
  {
    id: 'en-med-1',
    title: 'The Essence of Code',
    author: 'Software Philosophy',
    language: 'en',
    difficulty: 'medium',
    content: 'Clean code always looks like it was written by someone who cares. Simple logic and modular design make software resilient and maintainable across generations of engineers.',
    length: 174,
  },
  {
    id: 'en-med-2',
    title: 'Velocity and Focus',
    author: 'Tech Innovator',
    language: 'en',
    difficulty: 'medium',
    content: 'Real-time applications demand low latency, robust state synchronization, and rock-solid event architectures. When milliseconds matter, optimization becomes an art form.',
    length: 177,
  },
  {
    id: 'en-hard-1',
    title: 'Distributed Systems',
    author: 'Architectural Digest',
    language: 'en',
    difficulty: 'hard',
    content: 'Building scalable distributed systems requires a deep understanding of consensus protocols, network partitions, and data eventual consistency. Fault tolerance is not an afterthought but a foundational design requirement.',
    length: 231,
  },

  // --- RUSSIAN TEXTS ---
  {
    id: 'ru-easy-1',
    title: 'Путь к победе',
    author: 'Спортивная мудрость',
    language: 'ru',
    difficulty: 'easy',
    content: 'Победа достается тому, кто не боится скорости и сохраняет полное спокойствие на каждом вираже.',
    length: 96,
  },
  {
    id: 'ru-med-1',
    title: 'Искусство программирования',
    author: 'Архитектура систем',
    language: 'ru',
    difficulty: 'medium',
    content: 'Настоящее мастерство разработки заключается в умении создавать простые решения для самых сложных задач. Чистый код приносит радость как создателю, так и пользователям.',
    length: 173,
  },
  {
    id: 'ru-hard-1',
    title: 'Глубины технологий',
    author: 'Инженерная мысль',
    language: 'ru',
    difficulty: 'hard',
    content: 'Оптимизация высоконагруженных сетевых протоколов требует безупречного понимания очередей событий, асинхронного ввода-вывода и надежной синхронизации состояния между независимыми узлами.',
    length: 187,
  },
];

export function getRandomText(language: SupportedLanguage = 'uz', difficulty?: RaceDifficulty): TypingTextItem {
  let filtered = TEXT_BANK.filter(t => t.language === language);
  if (difficulty) {
    const byDiff = filtered.filter(t => t.difficulty === difficulty);
    if (byDiff.length > 0) filtered = byDiff;
  }
  if (filtered.length === 0) {
    filtered = TEXT_BANK.filter(t => t.language === language);
  }
  if (filtered.length === 0) {
    filtered = TEXT_BANK;
  }
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
}
