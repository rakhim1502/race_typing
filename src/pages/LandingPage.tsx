import React, { useState, useEffect } from 'react';
import { Play, Trophy, Zap, Shield, Globe, Users, ArrowRight, Gauge, Sparkles, ChevronDown } from 'lucide-react';
import { CarModel } from '../components/arena/CarModel.tsx';
import { CAR_SKINS } from '../../shared/types.ts';

interface LandingPageProps {
  onPlayNow: () => void;
  onExploreLeaderboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlayNow,
  onExploreLeaderboard,
}) => {
  // Mini interactive demo state
  const [demoProgress, setDemoProgress] = useState(25);
  const [demoCarId, setDemoCarId] = useState('car-cyan');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Auto-animate cars in hero demo
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoProgress((prev) => (prev >= 90 ? 15 : prev + 1.5));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: 'O‘yin qanday ishlaydi?',
      a: 'Siz o‘yin xonasiga kirasiz. Barcha ishtirokchilar tayyor bo‘lganda 3-2-1-GO! sanog‘i boshlanadi. Matnni xatosiz va tez yozganingiz sari sizning giperkaringiz trassa bo‘ylab marra (finish) tomon ildamlaydi. Birinchi bo‘lib matnni tugatgan o‘yinchi g‘alaba qozonadi.',
    },
    {
      q: 'O‘zbek tilidagi maxsus belgilar qanday yoziladi?',
      a: 'TypeRacer Arena o‘zbek tilidagi apostroflar (o‘, g‘), sh, ch harflarini to‘liq qo‘llab-quvvatlaydi. Harflar kiritilishi real vaqtda tekshiriladi.',
    },
    {
      q: 'Ro‘yxatdan o‘tmasdan o‘ynash mumkinmi?',
      a: 'Ha! “Play Now” tugmasini bosib, mehmon (guest) sifatida darhol poygaga kirishingiz mumkin. Natijalaringiz, statistika va XP ni doimiy saqlab borish uchun esa ro‘yxatdan o‘tish kifoya.',
    },
    {
      q: 'Natijalar qanday hisoblanadi?',
      a: 'WPM (Words Per Minute) = (to‘g‘ri belgilar / 5) / o‘tgan daqiqalar formulasi asosida to‘liq server tomonidan tekshiriladi. Natijalarni soxtalashtirishga yo‘l qo‘yilmaydi.',
    },
  ];

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide mb-6 shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>REAL-TIME MULTIPLAYER TYPE RACING</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Type Faster. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
              Race Harder.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Real vaqt rejimida boshqa o‘yinchilar bilan tez yozish orqali bellashing.
            Har bir to‘g‘ri yozilgan so‘z mashinangizni marraga yaqinlashtiradi!
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onPlayNow}
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Hozir Poygani Boshlang (Play Now)</span>
            </button>

            <button
              onClick={onExploreLeaderboard}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Reytingni Ko‘rish</span>
            </button>
          </div>

          {/* INTERACTIVE RACE ARENA DEMO PREVIEW */}
          <div className="mt-14 max-w-4xl mx-auto bg-[#0a0f1a] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 text-xs text-slate-400">
              <span className="font-bold text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Jonli Poyga Demonstratsiyasi (Interactive Demo)
              </span>
              <span className="text-[11px] text-slate-500">
                120 WPM • 99% Aniqlik
              </span>
            </div>

            {/* Visual Track Demo */}
            <div className="relative h-24 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center px-4 overflow-hidden track-grid">
              {/* Checkered finish on right */}
              <div className="absolute right-0 top-0 bottom-0 w-8 checkered-pattern opacity-80 border-l border-amber-400" />

              {/* Moving Car */}
              <div
                className="relative transition-all duration-150 flex items-center"
                style={{ left: `${demoProgress}%` }}
              >
                <CarModel carId={demoCarId} isMoving={true} size="md" />
              </div>
            </div>

            {/* Quick Car Skin Selector */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="text-slate-400">Mashina rangini sinab ko‘ring:</span>
              <div className="flex items-center gap-1.5">
                {CAR_SKINS.slice(0, 5).map((skin) => (
                  <button
                    key={skin.id}
                    onClick={() => setDemoCarId(skin.id)}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      demoCarId === skin.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: skin.primaryColor }}
                    title={skin.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS COUNTER BAR */}
      <section className="border-y border-slate-850 bg-slate-900/40 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400">124</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Top Rekord WPM
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-purple-400">8 ta</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
              SVG Giperkarlar
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">3 ta Til</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
              O‘zbek, Ingliz, Rus
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">0.05s</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Real-Time Latency
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / FEATURES */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Nega TypeRacer Arena?
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Tez yozish ko‘nikmangizni qiziqarli avtomobil poygalari orqali yangi bosqichga olib chiqing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Haqiqiy Real-Time Poyga</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Socket.IO yordamida har bir o‘yinchining matn yozish sur’ati bevosita ekrandagi sportkarning tezligi va o‘rniga aylanadi.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">O‘zbek Tili Qo‘llab-quvvatlovi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apostroflar (o‘, g‘), sh, ch harflari va adabiy hikmatli matnlar orqali o‘zbek tilida bexato yozish malakangizni oshiring.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Server-Authoritative Anti-Cheat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Barcha WPM, aniqlik va progress serverda tekshiriladi. Natijalar adolatli va ishonchli reytingda saqlanadi.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-8">
          Ko‘p Beriladigan Savollar (FAQ)
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-400 border-t border-slate-800/60 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
