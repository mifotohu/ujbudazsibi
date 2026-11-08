import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  User,
  CreditCard,
  Mail,
  Phone,
  Home,
  Tag,
  FileText,
  Printer,
  FileDown,
  ArrowLeft,
  Store,
  ExternalLink,
  Info,
  BadgeCheck,
} from 'lucide-react';
import { LocationData, ConfirmedBooking } from '../types/market';
import { downloadPassAsPdfDirect, printPassDirect, PassPrintData } from '../utils/printPass';
import { QrCodeDisplay } from './QrCodeDisplay';

export interface VerificationPageData {
  bookingId: string;
  tableId: number | string;
  sellerName: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  postalCode?: string;
  locationName: string;
  streetName?: string;
  weekendDates?: string;
  totalPaid?: number | string;
  categories?: string[];
  itemsDescription?: string;
  isImmediateNeighbor?: boolean;
}

interface VerificationPageViewProps {
  data: VerificationPageData;
  locations: LocationData[];
  onBackToHome: () => void;
  onLocateTable: (locationId: string, tableId: number) => void;
}

export const VerificationPageView: React.FC<VerificationPageViewProps> = ({
  data,
  locations,
  onBackToHome,
  onLocateTable,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Attempt to match location
  const matchedLoc =
    locations.find(
      (l) =>
        l.name.toLowerCase().includes((data.locationName || '').toLowerCase()) ||
        l.streetName.toLowerCase().includes((data.streetName || data.locationName || '').toLowerCase())
    ) || locations[0];

  const tableNum = parseInt(String(data.tableId), 10) || 1;

  const datesText =
    data.weekendDates ||
    matchedLoc?.dateBadge ||
    '2026. májusi hétvége';

  const streetText =
    data.streetName ||
    matchedLoc?.streetName ||
    'Budapest XI. Kerület Újbuda';

  const numericPaid =
    typeof data.totalPaid === 'number'
      ? data.totalPaid
      : parseInt(String(data.totalPaid).replace(/\D/g, ''), 10) || 4050;

  const passPrintPayload: PassPrintData = {
    bookingId: data.bookingId,
    tableId: data.tableId,
    sellerName: data.sellerName || 'Újbudai Regisztrált Árus',
    email: data.email,
    phone: data.phone,
    streetAddress: data.streetAddress,
    postalCode: data.postalCode,
    locationName: data.locationName || matchedLoc.name,
    streetName: streetText,
    weekendDates: datesText,
    totalPaid: numericPaid,
    categories: data.categories,
    itemsDescription: data.itemsDescription,
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadPassAsPdfDirect(passPrintPayload);
    setIsDownloading(false);
  };

  const handlePrint = () => {
    printPassDirect(passPrintPayload);
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#1A1A1A] font-sans pb-16 selection:bg-[#E8D4B8]">
      
      {/* Top Navigation Bar of the Dedicated Verification Portal */}
      <header className="sticky top-0 z-40 bg-[#1A3626] text-white border-b border-[#2A4D38] shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#254834] border border-[#426E53] flex items-center justify-center text-[#E7C286] shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#E7C286]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#FBF6EE] font-serif">
                  Újbudazsibi
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#254834] text-[#E7C286] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#426E53]">
                  Hitelesítő Rendszer
                </span>
              </div>
              <p className="text-[11px] text-[#D5E4D8] font-normal hidden sm:block">
                Budapest Főváros XI. Kerület Újbuda Önkormányzata
              </p>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white rounded-xl transition-all cursor-pointer border border-white/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Vissza a főoldalra</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* Verification Status Hero Badge */}
        <div className="bg-[#EAF5ED] border-2 border-[#15803D] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#15803D] text-white flex items-center justify-center shrink-0 shadow-xs">
              <BadgeCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#15803D] font-mono">
                HIVATALOS ÁLLAPOT: ÉRVÉNYES ÉS HITELESÍTETT
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1A3626] font-serif tracking-tight mt-0.5">
                Árusi engedély sikeresen ellenőrizve
              </h1>
              <p className="text-xs sm:text-sm text-[#2E543D] mt-1 leading-relaxed">
                Ez az asztalfoglalás érvényesen rögzítve van az Újbudazsibi nyilvántartásában. A standdíj rendezve, a helyszíni elfoglalás jóváhagyott.
              </p>
            </div>
          </div>

          <div className="bg-white px-3.5 py-2 rounded-2xl border border-[#A4C4AC] text-center shrink-0 self-stretch sm:self-auto flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
              Engedélyszám
            </span>
            <span className="text-xs font-mono font-black text-stone-900 block mt-0.5">
              {data.bookingId}
            </span>
          </div>
        </div>

        {/* The Stand Official Card */}
        <div className="bg-white border-2 border-[#1A3626] rounded-3xl shadow-sm overflow-hidden">
          
          {/* Card Top Title Ribbon */}
          <div className="bg-[#1A3626] text-white p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2E543D]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E7C286] font-bold block">
                ÚJBUDAZSIBI · 2026. MÁJUSI BOLHAPIAC
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#FAF7F2] font-serif tracking-tight mt-1">
                STAND #{data.tableId}
              </h2>
              <div className="text-sm font-semibold text-[#E7C286] mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C88A36] shrink-0" />
                <span>{data.locationName} · {streetText}</span>
              </div>
            </div>

            <div className="bg-[#254834] border border-[#426E53] p-2.5 rounded-2xl flex items-center gap-3 shrink-0">
              <QrCodeDisplay
                bookingId={data.bookingId}
                tableId={data.tableId}
                sellerName={data.sellerName}
                locationName={data.locationName}
                size={76}
              />
              <div className="text-left text-xs">
                <span className="text-[10px] text-[#A4C4AC] block font-mono">Dátum:</span>
                <span className="text-xs font-bold text-white block">{datesText}</span>
                <span className="text-[10px] text-[#E7C286] font-mono mt-1 block">Rendezve (Online)</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Section 1: Regisztrációkor megadott személyes & kapcsolattartási adatok */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-800" />
                <span>Regisztrációkor megadott árus adatok</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                    Árus teljes neve
                  </span>
                  <div className="text-base font-extrabold text-stone-900 font-serif">
                    {data.sellerName || 'Újbudai Regisztrált Lakos'}
                  </div>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-stone-400" />
                    <span>E-mail cím</span>
                  </span>
                  <div className="text-sm font-semibold text-stone-900">
                    {data.email || 'Hivatalos visszaigazolás kiküldve'}
                  </div>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>Telefonszám</span>
                  </span>
                  <div className="text-sm font-semibold text-stone-900 font-mono">
                    {data.phone || 'Regisztrált elérhetőség'}
                  </div>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                    <Home className="w-3 h-3 text-stone-400" />
                    <span>Újbudai lakcím & státusz</span>
                  </span>
                  <div className="text-sm font-semibold text-stone-900">
                    {data.postalCode || data.streetAddress
                      ? `${data.postalCode || ''} Budapest, ${data.streetAddress || ''}`
                      : 'Budapest XI. Kerület Újbuda'}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold mt-0.5">
                    {data.isImmediateNeighbor ? 'Közvetlen szomszéd kedvezmény (-10%)' : 'XI. kerületi lakossági stand'}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Stand felszereltség & Időbeosztás */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-800" />
                <span>Stand méretek, helyszín & időbeosztás</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>Kipakolási idősáv</span>
                  </span>
                  <div className="text-sm font-bold text-stone-900">
                    Reggel 07:00 – 08:30
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Zsibvásár nyitva: 08:30 – 18:30
                  </div>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    <span>Vásári hétvége</span>
                  </span>
                  <div className="text-sm font-bold text-emerald-900">
                    {datesText}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {data.locationName}
                  </div>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                    Hasznos terület & asztal
                  </span>
                  <div className="text-sm font-bold text-stone-900">
                    250 × 100 cm árusítóhely
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    120×80 cm fa asztal + 65-65 cm oldalsó hely
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Kínálat és Portékák */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-800" />
                <span>Kínált kategóriák és portékák leírása</span>
              </h3>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200 space-y-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Kategóriák
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.categories && data.categories.length > 0 ? (
                      data.categories.map((cat, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800 shadow-2xs"
                        >
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-700 font-semibold">
                        Általános lakossági bolhapiaci holmik, könyvek, retró cikkek
                      </span>
                    )}
                  </div>
                </div>

                {data.itemsDescription && (
                  <div className="pt-2 border-t border-stone-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Árusított cikkek részletes leírása
                    </span>
                    <p className="text-xs text-stone-800 leading-relaxed italic bg-white p-2.5 rounded-xl border border-stone-200">
                      „{data.itemsDescription}”
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Pénzügyi rendezettség */}
            <div className="bg-[#EAF5ED] border-2 border-[#A4C4AC] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#1E3A2B] block">
                  Részvételi Standdíj Státusza
                </span>
                <div className="text-sm font-bold text-[#15803D] mt-0.5">
                  ✅ Online bankkártyával sikeresen kiegyenlítve
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  Nyugtaszám / Ref: {data.bookingId} · Lemondás: vásár előtt legkésőbb 8 nappal
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black font-mono text-[#15803D] bg-white px-4 py-2 rounded-xl border border-[#A4C4AC] shadow-2xs">
                {numericPaid.toLocaleString('hu-HU')} Ft
              </div>
            </div>

            {/* Action Buttons for the User/Organizer on this Dedicated Page */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownload}
                className="w-full sm:flex-1 py-3.5 bg-[#1A3626] hover:bg-[#254834] text-[#FAF7F2] font-bold rounded-2xl text-xs sm:text-sm border border-[#2E543D] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <FileDown className="w-4 h-4 text-[#E7C286]" />
                <span>{isDownloading ? 'PDF generálása...' : 'Hivatalos jegy letöltése PDF-ben'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:flex-1 py-3.5 bg-[#EFE8DA] hover:bg-[#E5DAC6] text-stone-900 font-bold rounded-2xl text-xs sm:text-sm border border-[#D5C7AF] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 text-stone-700" />
                <span>Jegy kinyomtatása (1 oldal)</span>
              </button>

              <button
                type="button"
                onClick={() => onLocateTable(matchedLoc.id, tableNum)}
                className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-2xl text-xs sm:text-sm border border-stone-300 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <Store className="w-4 h-4 text-emerald-800" />
                <span>Megtekintés az utcatérképen</span>
              </button>
            </div>

          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-stone-500 space-y-1 pt-4">
          <p>
            Újbudazsibi · Budapest Főváros XI. Kerület Újbuda Önkormányzata Közösségi Bolhapiac
          </p>
          <p className="text-[11px] text-stone-400">
            Hivatalos ügyfélszolgálat és lemondás: <strong className="text-stone-600">ujbudazsibi@gmail.com</strong>
          </p>
        </div>

      </main>
    </div>
  );
};
