import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, AlertCircle, FileText, Clock, Users, Scale, CreditCard } from 'lucide-react';

const FAQS = [
  {
    q: 'Milyen pontos időpontok és menetrend érvényes a vásárnapokon?',
    a: 'A hatósági közterület-lezárás aznap éjféltől (00:00) este 21:00 óráig tart. A közterület-felügyelet éjféltől ellenőrzi az utcát: a lezárt szakaszon hagyott gépjárműveket elszállítják. A vásár pontos menetrendje: 08:00 – 09:00 reggeli kipakolás, 09:00 – 17:00 vásár nyitvatartás a nagyközönség előtt, 17:00 – 18:00 elpakolás és utcatisztítás. Ugyanez az időrend vonatkozik a gyereksarokra és a grilles partnerre is.',
  },
  {
    q: 'Hogyan és meddig mondható le a standfoglalás?',
    a: 'A standfoglalás a vásár napja előtt legkésőbb 8 nappal mondható le az adminisztráción keresztül vagy e-mailben (ujbudazsibi@gmail.com). Lemondás esetén az asztal azonnal automatikusan felszabadul a térképen más érdeklődők számára. A vásár előtt 8 nappal a rendszer a logisztikai és biztonsági zárás miatt már nem engedi törölni a foglalást.',
  },
  {
    q: 'Kik árusíthatnak és mekkora a lakossági kedvezmény?',
    a: 'A vásáron kizárólag Budapest XI. kerületi (újbudai, 1111–1119 irányítószámú) lakosok árusíthatnak. A rendszer a megadott lakcím és irányítószám alapján automatikusan számolja az árat: az adott vásárhelyszín közvetlen környékbeli lakosainak 4 050 Ft (10% helyi kedvezmény), más újbudai kerületrészek lakóinak 4 500 Ft. Kerületen kívüli magánszemélyek nem regisztrálhatnak asztalt.',
  },
  {
    q: 'Mekkora az asztal és a teljes elfoglalt terület mérete?',
    a: 'A teljes elfoglalt árusítóhely mérete 250 × 100 cm. Ebből a biztosított fa sörpad-asztal mérete 120 × 80 cm (+ 1 db biztosított székkel). Az asztal két oldalán 65-65 cm szabad pakolózóna áll rendelkezésre ruhaállványnak vagy dobozoknak. A mélység 100 cm. Az asztal elé, a gyalogos utcába pakolni SZIGORÚAN TILOS az akadálymentes közlekedés érdekében!',
  },
  {
    q: 'Hogyan kezelik és kinek továbbítják a regisztrációkor megadott adatokat?',
    a: 'A regisztráció és fizetés során megadott adatokat a szervezőség a hatályos európai adatvédelmi rendelet (GDPR - EU 2016/679) és a magyar számviteli törvény (2000. évi C. törvény 169. § — 8 éves kötelező bizonylatmegőrzés) alapján kezeli. Az adatok harmadik feleknek is továbbításra kerülnek: a bankkártyás fizetést végző Stripe szolgáltatónak, az elektronikus számlát kiállító számlázó rendszernek (Billingo / Számlázz.hu), valamint a szervezőség hivatalos, szerződött könyvelőjének. A látogatói felületen a neveket GDPR-konform módon kizárólag monogrammal és keresztnévvel jelenítjük meg (pl. K. Miklós).',
  },
  {
    q: 'Milyen feltételekkel jelentkezhet a gyereksarok és a grilles partner?',
    a: 'A gyereksarokba és a grillsarokba kizárólag adószámmal rendelkező cégek vagy egyéni vállalkozók jelentkezhetnek, számlázási adataik megadásával. A szervezők egy kb. 8 × 8 méteres kijelölt területet biztosítanak, de asztalt és széket NEM adnak, azt a vállalkozó maga oldja meg. A grilles a fizetést (bankkártyás POS terminál, készpénz) önállóan kezeli, arra a szervezőknek semmilyen ráhatása és felelőssége nincs.',
  },
  {
    q: 'Mi az a Zöld Doboz és a Gyerekzsibi?',
    a: 'A Zöld Doboz egy ingyen elvihető közösségi cserebere asztal a piac kijáratánál, ahova tiszta könyveket, növényeket, épségben maradt játékokat tehet ki bárki mások örömére (nem szemét- és kacatleadás!). A Gyerekzsibi pedig 4 db külön kijelölt kis asztal, amit kerületi gyermekek és kísérő szüleik 0 Ft-ért foglalhatnak le, hogy kinőtt játékaikat jelképes összegért eladják.',
  },
];

export const RulesAndFaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-[#F6F1E7] border-t border-[#D8CEBD] relative overflow-hidden">
      {/* Subtle paper grain */}
      <div className="absolute inset-0 pointer-events-none grain-overlay opacity-35"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Title - Fraunces & Ochre */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A96E22] bg-[#EFE8DA] border border-[#D5C7AF] px-3.5 py-1 rounded-md mb-2.5 font-serif">
            <HelpCircle className="w-3.5 h-3.5 text-[#C88A36]" />
            <span>Kérdések és házirend</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1C2C20] tracking-tight font-serif">
            Gyakran ismételt kérdések és árusítási szabályzat
          </h2>
          <p className="text-sm text-[#544C42] mt-2 max-w-xl mx-auto">
            Minden fontos tudnivaló egyszerűen, érthetően, a hatályos szabályoknak megfelelően.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#FCFAF6] rounded-2xl border border-[#D8CEBD] overflow-hidden shadow-2xs transition-all hover:border-[#C88A36]"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-[#1C2C20] text-sm hover:text-[#C88A36] transition-colors cursor-pointer font-serif"
                >
                  <span className="leading-snug text-base">{faq.q}</span>
                  <div className="text-[#A96E22] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#C88A36]" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#4E473F] leading-relaxed border-t border-[#E8DFCF] pt-3.5 bg-[#FBF8F2]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legal & Environmental Commitment Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#EAF2ED] border border-[#A4C4AC] rounded-2xl p-5 flex items-start gap-3.5 shadow-2xs">
            <ShieldCheck className="w-7 h-7 text-[#254834] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-[#1A3626] font-serif">
                Környezetbarát közösségi vásár
              </h4>
              <p className="text-xs text-[#2E543D] mt-1 leading-normal">
                Kérünk minden árust és látogatót, hogy a megmaradt tárgyakat vigye magával vagy helyezze a kijárati Zöld Dobozba. Vigyázzunk a tiszta utcákra!
              </p>
            </div>
          </div>

          <div className="bg-[#FDF8EE] border border-[#E7C286] rounded-2xl p-5 flex items-start gap-3.5 shadow-2xs">
            <Scale className="w-7 h-7 text-[#A96E22] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-[#6B4610] font-serif">
                Jogszabályi megfelelőség (GDPR & Számv. tv.)
              </h4>
              <p className="text-xs text-[#8C581F] mt-1 leading-normal">
                A regisztrációs adatokat a 2000. évi C. törvény és a GDPR szerint Stripe, számlázó és könyvelő partnereinknek bocsátjuk rendelkezésre.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

