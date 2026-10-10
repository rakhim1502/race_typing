# 🏎️ TypeRacer Arena — Real-Time Multiplayer Web App

**TypeRacer Arena** — real vaqt rejimida (real-time) bir nechta foydalanuvchilar o‘rtasida matn yozish tezligi bo‘yicha poyga o‘tkaziladigan zamonaviy veb-platforma. Foydalanuvchilar matnni yozgan sari ularning sportkarlari interaktiv poyga trassasida startdan finish chizig‘i tomon jonli harakatlanadi.

---

## 🌟 Asosiy Xususiyatlar

* ⚡ **Haqiqiy Real-Time Multiplayer:** Socket.IO orqali bir necha soniya ichida o‘yinchilarni bog‘lash, 10–15Hz throttled koordinatalar yangilanishi va 60 FPS silliq avtomobil animatsiyasi.
* 🏎️ **8 ta SVG Giperkarlar:** Cyber Neon GT, Phantom Violet, Crimson Fury, Emerald Drift, Solar Flash, Cobalt Apex, Hyper Rose, Stealth Onyx — har biri neon yog‘du, kokpit va harakatlanganda nitro zarrachalari bilan.
* 🇺🇿 **Ko‘p Tilli Matnlar Banki:**
  * **O‘zbek tili:** Barcha apostroflar (`o‘`, `g‘`), `sh`, `ch` harflari va adabiy/IT matnlari.
  * **Ingliz tili:** Zamonaviy texnologik va poyga iqtiboslari.
  * **Rus tili:** Klassik va muhandislik matnlari.
  * Qiyinlik darajalari: `Easy`, `Medium`, `Hard`.
* 🛡️ **Server-Authoritative Anti-Cheat:**
  * Barcha WPM, aniqlik va progress hisob-kitoblari server tomonidan tekshiriladi.
  * Klaviaturada firibgarlik (impossible WPM > 280, matndan chiqib ketish) server darajasida to‘xtatiladi.
* 🏆 **XP Tiers & Leaderboard:**
  * Kunlik, haftalik va umumiy reytinglar.
  * Eng yuqori WPM va eng ko‘p g‘alabalar bo‘yicha saralash.
  * Darajalar: Rookie, Silver, Gold, Diamond, Apex Legend.
* 👤 **Shaxsiy Profil va Garaj:**
  * Ro‘yxatdan o‘tish (bcryptjs parollar xeshi), JWT sessiyalar yoki 1-klikli Mehmon (Guest) rejimi.
  * Avtomobillar garaji va poygalar tarixi.

---

## 📐 Hisoblash Formulalari (Typing Metrics)

Loyiha bo‘ylab quyidagi xalqaro typing standartlaridan foydalaniladi:

1. **Net WPM (Words Per Minute):**
   $$\text{WPM} = \frac{\text{To‘g‘ri kiritilgan belgilar}}{5 \times \text{O‘tgan daqiqalar}}$$
   *(Standart bo‘yicha 1 so‘z = 5 ta belgi deb olinadi)*

2. **Raw WPM:**
   $$\text{Raw WPM} = \frac{\text{Jami kiritilgan belgilar (xatolari bilan)}}{5 \times \text{O‘tgan daqiqalar}}$$

3. **Aniqlik (Accuracy %):**
   $$\text{Accuracy} = \frac{\text{To‘g‘ri belgilar}}{\text{To‘g‘ri belgilar} + \text{Xatolar soni}} \times 100$$

4. **Progress %:**
   $$\text{Progress} = \frac{\text{To‘g‘ri kiritilgan belgilar}}{\text{Asl matn uzunligi}} \times 100$$

5. **Finish sharti:**
   $$\text{Kiritilgan matn} \equiv \text{Asl matn} \quad \text{va} \quad \text{Progress} = 100\%$$

---

## 🔌 Socket.IO Event Shartnomasi

| Event | Yo‘nalish | Maqsadi |
| :--- | :--- | :--- |
| `room:create` | Client $\to$ Server | Xona ochish (`name, isPrivate, language, difficulty, maxPlayers, carId`) |
| `room:join` | Client $\to$ Server | Xonaga kirish (`codeOrId, carId, username?`) |
| `room:leave` | Client $\to$ Server | Xonadan chiqish |
| `room:state` | Server $\to$ Client | Xonaning to‘liq holati (`RoomState`) |
| `race:ready` | Client $\to$ Server | O‘yinchi tayyorligini yoqish/o‘chirish |
| `race:countdown` | Server $\to$ Client | 3, 2, 1 soniyalari |
| `race:start` | Server $\to$ Client | Barcha o‘yinchilarga start signali |
| `player:progress` | Client $\to$ Server | Yozilgan matn holati (12Hz throttled) |
| `players:progress` | Server $\to$ Client | Barcha mashinalar koordinatalari (10Hz broadcast) |
| `player:finished` | Server $\to$ Client | O‘yinchi finishga yetgani va egallagan o‘rni |
| `race:finished` | Server $\to$ Client | Poyga yakunlanishi va rasmiy natijalar jadvali |
| `race:rematch` | Client $\to$ Server | Yangi matn bilan qayta o‘yin so‘rovi |

---

## 🛠️ O‘rnatish va Ishga Tushirish

### 1. Talablar
* **Node.js:** v18.0.0 yoki undan yuqori
* **npm:** v9.0.0+
* **PostgreSQL:** (Ixtiyoriy, Docker talab qilinmaydi; ilova o‘rnatilgan xotira ombori bilan nol-konfiguratsiyada ham to‘liq ishlaydi)

### 2. Bog‘liqliklarni o‘rnatish
```bash
npm install
```

### 3. Muhit o‘zgaruvchilarini sozlash
`.env.example` dan `.env` fayl yarating:
```bash
cp .env.example .env
```
Fayl mazmuni:
```env
PORT=3000
JWT_SECRET="typeracer_arena_super_secret_jwt_key_2026"
DATABASE_URL="postgresql://postgres:password@localhost:5432/typeracer_arena?schema=public"
```

### 4. Prisma ma'lumotlar bazasini tayyorlash (PostgreSQL bilan ishlaganda)
```bash
npx prisma db push
# yoki
npx prisma migrate dev --name init
```

### 5. Development rejimida ishga tushirish
Ilova frontend (Vite) va backend (Express + Socket.IO)ni bitta **3000-portda** ishga tushiradi:
```bash
npm run dev
```
Brauzerda oching: `http://localhost:3000`

---

## 🧪 Testlarni Ishga Tushirish

Loyiha uchun to‘liq unit testlar va ko‘p mijozli integratsion testlar yozilgan:

```bash
npm run test
```

Ushbu buyruq quyidagilarni avtomatik sinovdan o‘tkazadi:
1. WPM, Raw WPM, Aniqlik va Progress matematik hisob-kitoblari.
2. Anti-cheat server cheklovlari.
3. Foydalanuvchini ro‘yxatdan o‘tkazish va parolni bcryptjs orqali tekshirish.
4. Tranzaksiya xavfsizligi va takroriy natija yozilishining oldini olish.
5. **Multiplayer Socket.IO testi:** 2 ta mustaqil klient bir-biri bilan xona kodi orqali bog‘lanishi, `3, 2, 1, GO!` sanog‘i, real progress uzatish va g‘olibni aniqlash.

---

## 👥 Bir Nechta Brauzerda Multiplayer Test Qilish

1. Birinchi tabda `http://localhost:3000` ga kiring. "Play Now" tugmasini bosing va "Xona Yaratish" bo‘limidan yangi xona oching (masalan, kodi `RACER8`).
2. Yangi Incognito (Maxfiy) tab yoki ikkinchi brauzerni oching.
3. "Kod Bilan Kirish" bo‘limiga xona kodini kiriting (`RACER8`).
4. Ikkala tabda ham "Tayyorman (Ready)" tugmasini bosing.
5. 3-2-1-GO! sanog‘idan so‘ng matnni yozishni boshlang va ikkala ekranda ham mashinalar real vaqtda bir-birini quvib o‘tayotganini kuzating!

---

## 🚀 Production Build va Deploy

1. **Production build yaratish:**
   ```bash
   npm run build
   ```

2. **Production serverni ishga tushirish:**
   ```bash
   npm start
   ```

3. **Deploy bo‘yicha tavsiyalar:**
   * Ilova stateless HTTP va WebSockets arxitekturasida tuzilgan.
   * Node.js Cloud Run, Render, Railway yoki VPS (Nginx reverse proxy orqali WebSocket upgrade bilan) platformalarida oson ishga tushadi.
   * Yuqori yuklamalarda bir nechta backend instance ishlatish uchun `@socket.io/redis-adapter` ulash mumkin.
