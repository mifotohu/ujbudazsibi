import React from 'react';
import { CommercialType } from '../types/market';
import {
  Baby,
  Flame,
  Palette,
  Smile,
  Puzzle,
  HeartHandshake,
  Salad,
  Coffee,
  Armchair,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

interface CommunityZonesViewProps {
  onStartBooking: () => void;
  onOpenVolunteer: () => void;
  onOpenCommercialVendor: (type: CommercialType) => void;
}

export const CommunityZonesView: React.FC<CommunityZonesViewProps> = ({
  onStartBooking,
  onOpenVolunteer,
  onOpenCommercialVendor,
}) => {
  return (
    <section className="py-16 bg-[#FAF6EE] border-t border-[#D8CEBD] relative overflow-hidden">
      {/* Subtle paper grain */}
      <div className="absolute inset-0 pointer-events-none grain-overlay opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section title - Fraunces & Ochre */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A96E22] mb-1.5 font-serif">
            <Sparkles className="w-4 h-4 text-[#C88A36]" />
            <span>Közösségi élet és vállalkozói szigetek</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1C2C20] tracking-tight font-serif">
            Nemcsak piac: találkozóhely a helyi közösségnek
          </h2>
          <p className="text-sm text-[#544C42] mt-2 leading-relaxed">
            A lezárt utcák két végén két dedikált, 8 × 8 méteres szigetet alakítunk ki. Vállalkozók és vendéglátók külön koncessziós regisztrációval települhetnek ki, hogy az egész család órákon át élvezhesse a vásári forgatagot.
          </p>
        </div>

        {/* 2 Big Cards: Kids Zone & Grill Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. GYEREKSAROK & CSALÁDI ZÓNA */}
          <div className="bg-[#FCFAF6] border border-[#C5B69F] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#A4C4AC] pointer-events-none opacity-40"></div>
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1A3626] text-[#E7C286] flex items-center justify-center shadow-xs border border-[#2E543D]">
                    <Baby className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#1C2C20] leading-tight font-serif">
                      Gyereksarok és családi zóna
                    </h3>
                    <span className="text-xs text-[#2E543D] font-bold font-serif">
                      Nyugati utcakapu mellett · 8 × 8 méteres terület
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-[#EAF2ED] text-[#1A3626] px-3 py-1 rounded-lg border border-[#A4C4AC]">
                  09:00 – 17:00
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-5">
                Amíg a szülők kincsek után kutatnak a standok között, a kicsiket arcfestés, ügyességi játékok és felügyelt kreatív sarok várja. Cégek és egyéni vállalkozók jelentkezhetnek a programok megvalósítására.
              </p>

              {/* 4 Feature Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="bg-white border border-indigo-100 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 mb-1">
                    <Palette className="w-4 h-4 text-indigo-700" />
                    <span>Ingyenes arcfestés</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-normal">
                    Bőrbarát festékekkel: pillangó, szuperhős, tigris vagy virágminta.
                  </p>
                </div>

                <div className="bg-white border border-indigo-100 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 mb-1">
                    <Smile className="w-4 h-4 text-indigo-700" />
                    <span>Felügyelt játszószőnyeg</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-normal">
                    Árnyékolt puha szőnyeg, mesekönyvek és rajzeszközök.
                  </p>
                </div>

                <div className="bg-white border border-indigo-100 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 mb-1">
                    <Puzzle className="w-4 h-4 text-indigo-700" />
                    <span>Fa kirakók és társasok</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-normal">
                    Közösségi óriás fa társasjátékok, ugróiskola és buborékfújás.
                  </p>
                </div>

                <div className="bg-white border border-indigo-100 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 mb-1">
                    <HeartHandshake className="w-4 h-4 text-indigo-700" />
                    <span>Baba-mama pihenőpont</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-normal">
                    Pelenkázó, csendes etetőfotel és tiszta kézmosó pont.
                  </p>
                </div>
              </div>

              {/* Vendor info alert */}
              <div className="p-3 bg-indigo-100/70 border border-indigo-200 rounded-xl text-[11px] text-indigo-950 space-y-1 mb-5">
                <div className="font-bold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-800" />
                  <span>Vállalkozói kitelepülés feltételei:</span>
                </div>
                <p>
                  Kizárólag adószámmal rendelkező cégek/EV-k részére. A 8 × 8 m területhez asztalt és széket <strong>nem adunk</strong>, a berendezést a vállalkozó oldja meg. Koncessziós díj: <strong>15 000 Ft / hétvége</strong>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                onClick={onOpenVolunteer}
                className="text-xs font-semibold text-indigo-900 hover:underline cursor-pointer"
              >
                Segítenél a gyereksarokban? Önkéntes jelentkezés →
              </button>
              <button
                onClick={() => onOpenCommercialVendor('kids_corner')}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1A3626] hover:bg-[#254834] text-[#E7C286] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 font-serif border border-[#2E543D]"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#C88A36]" />
                <span>Gyereksarok regisztráció (15 000 Ft)</span>
              </button>
            </div>
          </div>

          {/* 2. GRILLSAROK & GASZTRO TERASZ - Warm Ochre & Rustic Bronze */}
          <div className="bg-[#FCFAF6] border border-[#C5B69F] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#E7C286] pointer-events-none opacity-40"></div>
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#C88A36] text-[#1B1916] flex items-center justify-center shadow-xs border border-[#A96E22]">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#1C2C20] leading-tight font-serif">
                      Grillsarok és gasztro korzó
                    </h3>
                    <span className="text-xs text-[#8C581F] font-bold font-serif">
                      Keleti utcakapu mellett · 8 × 8 méteres terület
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-[#FDF8EE] text-[#8C581F] px-3 py-1 rounded-lg border border-[#E7C286]">
                  09:00 – 17:00
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#544C42] leading-relaxed mb-6">
                A kincskeresés közben sem kell éhesen maradni: faszenes grillkolbászok, házi szörpök, vegán lepények és specialty kávé várja a vendégeket a gasztro teraszon.
              </p>

              {/* 4 Feature Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                <div className="bg-[#F6F1E7] border border-[#D8CEBD] p-3.5 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8C581F] mb-1 font-serif">
                    <Flame className="w-4 h-4 text-[#C88A36]" />
                    <span>Faszenes rostonsültek</span>
                  </div>
                  <p className="text-[11px] text-[#544C42] leading-normal">
                    Kézműves grillkolbászok, kovászos kenyérrel és házi savanyúsággal.
                  </p>
                </div>

                <div className="bg-[#F6F1E7] border border-[#D8CEBD] p-3.5 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8C581F] mb-1 font-serif">
                    <Salad className="w-4 h-4 text-[#C88A36]" />
                    <span>Vegán és sajtos finomságok</span>
                  </div>
                  <p className="text-[11px] text-[#544C42] leading-normal">
                    Grillezett gomolya, fűszeres sült zöldségek és friss lepény.
                  </p>
                </div>

                <div className="bg-[#F6F1E7] border border-[#D8CEBD] p-3.5 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8C581F] mb-1 font-serif">
                    <Coffee className="w-4 h-4 text-[#C88A36]" />
                    <span>Specialty kávé és szörpök</span>
                  </div>
                  <p className="text-[11px] text-[#544C42] leading-normal">
                    Frissen pörkölt újbudai kávé, hideg házi málna- és bodzaszörp.
                  </p>
                </div>

                <div className="bg-[#F6F1E7] border border-[#D8CEBD] p-3.5 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8C581F] mb-1 font-serif">
                    <Armchair className="w-4 h-4 text-[#C88A36]" />
                    <span>Piknikpadok & Akusztika</span>
                  </div>
                  <p className="text-[11px] text-[#544C42] leading-normal">
                    Árnyékolt sörpadok a szomszédos utcazenész szőnyeg hangulatával.
                  </p>
                </div>
              </div>

              {/* Vendor info alert */}
              <div className="p-3.5 bg-[#FDF8EE] border border-[#E7C286] rounded-xl text-[11px] text-[#8C581F] space-y-1 mb-5">
                <div className="font-bold flex items-center gap-1.5 font-serif">
                  <Briefcase className="w-3.5 h-3.5 text-[#C88A36]" />
                  <span>Vendéglátói kitelepülés feltételei:</span>
                </div>
                <p>
                  Kizárólag vendéglátó vállalkozások részére (8 × 8 m terület, sátor/food truck). <strong>A vendégek fizetését (POS terminál, készpénz) a vendéglátó maga oldja meg</strong>, arra a szervezőknek ráhatása és felelőssége nincs. Koncessziós díj: <strong>35 000 Ft / hétvége</strong>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DFCF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-[#6B6154] font-mono">
                Kipakolás: 08:00 – 09:00 · Elpakolás: 17:00 – 18:00
              </span>
              <button
                onClick={() => onOpenCommercialVendor('grill_corner')}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#C88A36] hover:bg-[#B77726] text-[#1B1916] font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 font-serif border border-[#A96E22]"
              >
                <Flame className="w-3.5 h-3.5 text-[#1B1916]" />
                <span>Grillsarok regisztráció (35 000 Ft)</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
