import { PrismaClient, Language, Difficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TEXT_BANK } from '../server/engine/TextBank.ts';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 TypeRacer Arena bazasiga dastlabki ma’lumotlarni yuklash boshlandi...');

  // 1. Matnlarni saqlash
  console.log('📝 Matnlar banki yuklanmoqda...');
  for (const item of TEXT_BANK) {
    const langEnum = item.language === 'uz' ? Language.UZ : item.language === 'en' ? Language.EN : Language.RU;
    const diffEnum = item.difficulty === 'easy' ? Difficulty.EASY : item.difficulty === 'hard' ? Difficulty.HARD : Difficulty.MEDIUM;

    await prisma.typingText.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        content: item.content,
        language: langEnum,
        difficulty: diffEnum,
        charCount: item.length,
        author: item.author || null,
      },
      create: {
        id: item.id,
        title: item.title,
        content: item.content,
        language: langEnum,
        difficulty: diffEnum,
        charCount: item.length,
        author: item.author || null,
      },
    });
  }
  console.log(`✅ ${TEXT_BANK.length} ta matn bazaga muvaffaqiyatli yuklandi.`);

  // 2. Legend foydalanuvchilar va ularning statistikasi
  console.log('🏎️ Peshqadam poygachilar yuklanmoqda...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('racer1234', salt);

  const legends = [
    { id: 'legend-1', username: 'TurboSpeedster', carId: 'car-cyan', bestWpm: 124, avgWpm: 112, wins: 48, races: 60, xp: 5400 },
    { id: 'legend-2', username: 'NavoiyTyper', carId: 'car-purple', bestWpm: 118, avgWpm: 104, wins: 39, races: 55, xp: 4200 },
    { id: 'legend-3', username: 'ApexCoder', carId: 'car-crimson', bestWpm: 108, avgWpm: 98, wins: 27, races: 40, xp: 3300 },
    { id: 'legend-4', username: 'NeonRider', carId: 'car-emerald', bestWpm: 99, avgWpm: 89, wins: 18, races: 32, xp: 2100 },
  ];

  for (const leg of legends) {
    const user = await prisma.user.upsert({
      where: { username: leg.username },
      update: {
        selectedCarId: leg.carId,
      },
      create: {
        id: leg.id,
        username: leg.username,
        passwordHash,
        isGuest: false,
        selectedCarId: leg.carId,
      },
    });

    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {
        totalRaces: leg.races,
        totalWins: leg.wins,
        avgWpm: leg.avgWpm,
        bestWpm: leg.bestWpm,
        avgAccuracy: 98.4,
        xpPoints: leg.xp,
      },
      create: {
        userId: user.id,
        totalRaces: leg.races,
        totalWins: leg.wins,
        avgWpm: leg.avgWpm,
        bestWpm: leg.bestWpm,
        avgAccuracy: 98.4,
        xpPoints: leg.xp,
      },
    });
  }

  console.log(`✅ ${legends.length} ta peshqadam foydalanuvchi bazaga saqlandi.`);
  console.log('🎉 Seed jarayoni muvaffaqiyatli yakunlandi!');
}

main()
  .catch((e) => {
    console.error('❌ Seed xatoligi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
