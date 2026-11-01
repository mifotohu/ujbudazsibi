import React, { useState, useRef } from 'react';
import { LocationData, TableData, CategoryItem, KidsFleaTable, formatGdprName } from '../types/market';
import { CATEGORIES } from '../data/mockData';
import {
  Sparkles,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Baby,
  Flame,
  ArrowRight,
  ShieldCheck,
  Tag,
  Music,
  Gift,
  Smile,
  Maximize2,
} from 'lucide-react';

interface StreetPlanViewProps {
  location: LocationData;
  selectedTableId: number | null;
  onSelectTable: (table: TableData) => void;
  onOpenCommunityZone: (zone: 'kids' | 'grill') => void;
  onOpenGuide: () => void;
  onOpenKidsFleaModal: (table: KidsFleaTable) => void;
  onOpenMusicianModal: () => void;
  onOpenGreenBoxInfo: () => void;
  onOpenCommercialModal: (type: 'kids_corner' | 'grill_corner') => void;
}

export const StreetPlanView: React.FC<StreetPlanViewProps> = ({
  location,
  selectedTableId,
  onSelectTable,
  onOpenCommunityZone,
  onOpenGuide,
  onOpenKidsFleaModal,
  onOpenMusicianModal,
  onOpenGreenBoxInfo,
  onOpenCommercialModal,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'fit' | 'scroll'>('fit');
  const [focusedTableId, setFocusedTableId] = useState<number | null>(null);

  const northTables = location.tables.filter((t) => t.side === 'north');
  const southTables = location.tables.filter((t) => t.side === 'south');

  const freeCount = location.tables.filter((t) => t.status === 'available').length;
  const reservedCount = location.tables.filter((t) => t.status === 'reserved').length;

  const isTableHighlighted = (table: TableData) => {
    if (filterCategory === 'all') return true;
    if (!table.reservedBy) return false;
    return table.reservedBy.categories.includes(filterCategory);
  };

  const handleTableClick = (table: TableData) => {
    setFocusedTableId(table.id);
    onSelectTable(table);
  };

  return (
    <section className="bg-[#F6F1E7] py-8 sm:py-10 border-b border-[#D8CEBD] relative overflow-hidden">
      {/* Subtle paper grain */}
      <div className="absolute inset-0 pointer-events-none grain-overlay opacity-35"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 relative z-10">
        
        {/* Street context & header */}
        <div className="bg-[#FCFAF6] rounded-2xl border border-[#D8CEBD] p-5 sm:p-6 shadow-xs mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#1A3626] font-serif">
                <span className="w-2 h-2 rounded-full bg-[#C88A36]"></span>
                <span>Közterületi autómentes sétálóövezet</span>
                <span className="text-[#C5B69F]">·</span>
                <span className="text-[#A96E22]">Éjféltől 21:00-ig lezárva</span>
                <span className="text-[#C5B69F]">·</span>
                <span className="text-[#3A352F]">{location.dateBadge}</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-[#1C2C20] font-serif mt-1 tracking-tight">
                {location.name} — interaktív utcaalaprajz
              </h2>
              
              <p className="text-xs sm:text-sm text-[#544C42] mt-1.5 max-w-2xl">
                Minden asztalhoz 250×100 cm teljes terület tartozik (120×80 cm biztosított fa asztal + 65-65 cm oldalsó pakolótér). Kattints a kiválasztott standra a foglaláshoz!
              </p>
            </div>

            {/* View controls */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              <button
                onClick={onOpenGuide}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1A3626] bg-[#EFE8DA] hover:bg-[#E2D7C3] rounded-xl border border-[#D5C7AF] transition-colors cursor-pointer font-serif"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#C88A36]" />
                <span>250×100 cm méretrajz</span>
              </button>

              {/* Fit-to-screen vs Panoramic mode toggle */}
              <div className="flex items-center bg-[#EFE8DA] rounded-xl p-1 border border-[#D5C7AF]">
                <button
                  onClick={() => setViewMode('fit')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer font-serif ${
                    viewMode === 'fit' ? 'bg-[#1A3626] text-[#E7C286] shadow-xs' : 'text-[#4A4036] hover:text-[#1C2C20]'
                  }`}
                >
                  Képernyőhöz illesztve
                </button>
                <button
                  onClick={() => setViewMode('scroll')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer font-serif ${
                    viewMode === 'scroll' ? 'bg-[#1A3626] text-[#E7C286] shadow-xs' : 'text-[#4A4036] hover:text-[#1C2C20]'
                  }`}
                >
                  Panoráma nézet
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter for buyers/visitors */}
          <div className="mt-5 pt-4 border-t border-[#E8DFCF]">
            <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-[#4A4036] font-serif">
              <Tag className="w-3.5 h-3.5 text-[#C88A36]" />
              <span>Keresés kategóriák szerint a standokon:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer font-serif ${
                  filterCategory === 'all'
                    ? 'bg-[#1A3626] text-[#E7C286] shadow-xs border border-[#2E543D]'
                    : 'bg-[#EFE8DA] text-[#4A4036] hover:bg-[#E2D7C3] border border-[#D5C7AF]'
                }`}
              >
                Összes asztal (36)
              </button>
              {CATEGORIES.map((cat) => {
                const count = location.tables.filter(
                  (t) => t.reservedBy && t.reservedBy.categories.includes(cat.id)
                ).length;
                const isActive = filterCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(isActive ? 'all' : cat.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#1A3626] text-[#E7C286] font-bold border-2 border-[#C88A36] ring-2 ring-[#C88A36]/30 shadow-xs'
                        : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#EAE2D2] border border-[#D5C7AF]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                        isActive
                          ? 'bg-[#C88A36] text-[#1B1916]'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Category Filter Feedback & Reset */}
            {filterCategory !== 'all' && (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 bg-[#FFF8ED] border border-[#C88A36] px-3.5 py-2 rounded-xl text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C88A36] animate-spin" />
                  <span className="font-bold text-[#1C2C20]">
                    Kategória szerinti kiemelés:{' '}
                    <span className="text-[#A96E22] font-black underline">
                      {CATEGORIES.find((c) => c.id === filterCategory)?.label}
                    </span>
                  </span>
                  <span className="text-stone-600 font-medium">
                    ({location.tables.filter((t) => t.reservedBy?.categories.includes(filterCategory)).length} stand jelölve a térképen arany kerettel)
                  </span>
                </div>
                <button
                  onClick={() => setFilterCategory('all')}
                  className="px-2.5 py-1 text-xs font-bold text-[#1A3626] bg-[#EFE8DA] hover:bg-[#E2D7C3] rounded-lg border border-[#D5C7AF] transition-colors cursor-pointer"
                >
                  Szűrés visszavonása ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Legend bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-700 mb-3 px-1">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 border-2 border-emerald-700 inline-block"></span>
              <span className="font-semibold text-stone-900">Szabad asztal ({freeCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#E4DCce] border border-stone-400 inline-block"></span>
              <span>Lefoglalt asztal ({reservedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-200 border-2 border-amber-600 inline-block"></span>
              <span className="font-bold text-amber-950">Kiválasztott asztalod</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-blue-100 border-2 border-blue-600 inline-block"></span>
              <span className="font-semibold text-blue-900">Gyerekzsibi (4 kis asztal)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-semibold">
            <button
              onClick={onOpenGreenBoxInfo}
              className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-emerald-700" />
              <span>Zöld Doboz (ingyen elvihető)</span>
            </button>
            <span className="text-stone-300">·</span>
            <button
              onClick={onOpenMusicianModal}
              className="flex items-center gap-1 text-amber-800 hover:text-amber-950 cursor-pointer"
            >
              <Music className="w-3.5 h-3.5 text-amber-700" />
              <span>Utcazenész szőnyeg</span>
            </button>
          </div>
        </div>

        {/* 2D ARCHITECTURAL STREET MAP CONTAINER */}
        <div
          className={`rounded-2xl border-2 border-stone-300 bg-[#E8E1D3] p-3 sm:p-5 shadow-inner ${
            viewMode === 'scroll' ? 'street-scroll overflow-x-auto' : 'overflow-visible'
          }`}
        >
          <div
            className={`relative select-none ${
              viewMode === 'scroll' ? 'min-w-[1380px]' : 'w-full'
            }`}
          >
            {/* Street Framework */}
            <div className="bg-[#DFD8C9] rounded-xl border border-stone-300 shadow-xs relative">
              
              {/* Header banner */}
              <div className="bg-stone-900 text-stone-200 px-4 py-2 flex items-center justify-between text-xs font-semibold rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded text-[10px] font-bold">
                    00:00 – 21:00 közterület lezárva
                  </span>
                  <span className="truncate">{location.streetName}</span>
                </div>
                <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] text-stone-400">
                  <span>← Nyugati bejárat (gyereksarok & gyerekzsibi)</span>
                  <span>Keleti kapu (grill & zöld doboz) →</span>
                </div>
              </div>

              {/* THREE MAIN ZONES: WEST, MAIN CORSO, EAST */}
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_180px] divide-y md:divide-y-0 md:divide-x divide-stone-300">
                
                {/* 1. WEST ZONE (Commercial Kids Corner & Kids Flea Tables) */}
                <div className="bg-[#EDE5D6] p-3 flex flex-col justify-between gap-3">
                  
                  {/* Commercial Kids Concession (8x8m) */}
                  <div className="border border-indigo-300 rounded-xl p-2.5 bg-white shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                        <Baby className="w-3.5 h-3.5 text-indigo-700" />
                        Gyereksarok
                      </span>
                      <span className="text-[9px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded">
                        8 × 8 m
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600 mt-1 leading-tight">
                      Vállalkozói terület: arcfestés, játszóház. Saját eszközzel települ ki!
                    </p>
                    <button
                      onClick={() => onOpenCommercialModal('kids_corner')}
                      className="mt-2 w-full text-center py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[10px] font-bold rounded border border-indigo-200 cursor-pointer transition-colors"
                    >
                      Céges foglalás (15 000 Ft) →
                    </button>
                  </div>

                  {/* GYEREKZSIBI: 4 FREE CHILDREN TABLES */}
                  <div className="border-2 border-dashed border-blue-400 rounded-xl p-2.5 bg-blue-50/70">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-blue-900 flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5 text-blue-700" />
                        Gyerekzsibi
                      </span>
                      <span className="text-[9px] font-bold bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded">
                        0 Ft (Ingyenes)
                      </span>
                    </div>
                    <p className="text-[9px] text-stone-600 mt-0.5">
                      4 kis asztal gyerekeknek, játékok eladására (szülő foglalhatja le):
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {location.kidsFleaTables.map((kt) => {
                        const isRes = kt.status === 'reserved';
                        const maskedChild = kt.reservedBy?.childName ? formatGdprName(kt.reservedBy.childName) : '';
                        return (
                          <button
                            key={kt.id}
                            onClick={() => onOpenKidsFleaModal(kt)}
                            className={`p-1.5 rounded text-left border text-[10px] cursor-pointer transition-colors ${
                              isRes
                                ? 'bg-stone-200 border-stone-300 text-stone-700'
                                : 'bg-white border-blue-300 text-blue-900 hover:bg-blue-100 font-bold'
                            }`}
                          >
                            <span className="font-bold block">{kt.id}</span>
                            <span className="text-[9px] text-stone-600 block truncate" title={isRes ? `Lefoglalva: ${maskedChild}` : 'Szabad'}>
                              {isRes ? (maskedChild ? `${maskedChild}` : 'Lefoglalva') : 'Szabad'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[10px] text-stone-600 bg-white/70 p-2 rounded border border-stone-300 text-center">
                    <span className="font-bold text-stone-800 block">Szervezői infópult</span>
                    <span>Nyugati kapu</span>
                  </div>
                </div>

                {/* 2. CENTRAL STREET: NORTH & SOUTH TABLE ROWS + PROMENADE */}
                <div className="flex flex-col">
                  
                  {/* NORTH SIDEWALK (Asztalok 1–18) - Highest z-index (z-40) so downwards tooltips never get covered */}
                  <div className="bg-[#FAF7F2] p-2.5 sm:p-3 border-b border-stone-300 relative z-40">
                    <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      <span>Északi utcafront (Járda észak · standok 1 – 18)</span>
                      <span className="text-[10px] text-stone-500 font-normal">250×100 cm hasznos standhely</span>
                    </div>

                    <div className={`grid gap-1.5 sm:gap-2 ${viewMode === 'fit' ? 'grid-cols-9 lg:grid-cols-18' : 'grid-cols-18'}`}>
                      {northTables.map((table) => (
                        <TableButton
                          key={table.id}
                          table={table}
                          isSelected={selectedTableId === table.id}
                          isHighlighted={isTableHighlighted(table)}
                          isCategoryActive={filterCategory !== 'all'}
                          onClick={() => handleTableClick(table)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* PEDESTRIAN CORSO / WALKWAY */}
                  <div className="bg-[#CFC4B2] py-3 px-4 border-b border-stone-300 relative z-20 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-[#FAF7F2] border border-amber-300/80 px-2.5 py-1 rounded-md text-[11px] font-medium text-stone-900 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      <span>Középső 4,5 m-es vásárlói folyosó: akadálymentes babakocsival is</span>
                    </div>

                    <div className="text-[10px] font-mono text-stone-700 bg-white/80 px-2 py-0.5 rounded border border-stone-300">
                      Előre pakolni szigorúan tilos!
                    </div>
                  </div>

                  {/* SOUTH SIDEWALK (Asztalok 19–36) */}
                  <div className="bg-[#FAF7F2] p-2.5 sm:p-3 pb-8 sm:pb-12 relative z-20">
                    <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      <span>Déli utcafront (Járda dél · standok 19 – 36)</span>
                      <span className="text-[10px] text-stone-500 font-normal">250×100 cm hasznos standhely</span>
                    </div>

                    <div className={`grid gap-1.5 sm:gap-2 ${viewMode === 'fit' ? 'grid-cols-9 lg:grid-cols-18' : 'grid-cols-18'}`}>
                      {southTables.map((table) => (
                        <TableButton
                          key={table.id}
                          table={table}
                          isSelected={selectedTableId === table.id}
                          isHighlighted={isTableHighlighted(table)}
                          isCategoryActive={filterCategory !== 'all'}
                          onClick={() => handleTableClick(table)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. EAST ZONE (Commercial Grill, Street Musician Rug, Green Box) */}
                <div className="bg-[#EDE5D6] p-3 flex flex-col justify-between gap-3">
                  
                  {/* Commercial Grill Concession (8x8m) */}
                  <div className="border border-orange-300 rounded-xl p-2.5 bg-white shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-orange-950 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-700" />
                        Grillsarok & Büfé
                      </span>
                      <span className="text-[9px] font-mono bg-orange-100 text-orange-900 px-1.5 py-0.2 rounded">
                        8 × 8 m
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600 mt-1 leading-tight">
                      Vállalkozói kitelepülés: saját terminállal, asztal nélkül.
                    </p>
                    <button
                      onClick={() => onOpenCommercialModal('grill_corner')}
                      className="mt-2 w-full text-center py-1 bg-orange-50 hover:bg-orange-100 text-orange-950 text-[10px] font-bold rounded border border-orange-200 cursor-pointer transition-colors"
                    >
                      Céges foglalás (35 000 Ft) →
                    </button>
                  </div>

                  {/* STREET MUSICIAN RUG (Utcazenész szőnyeg) */}
                  <div
                    onClick={onOpenMusicianModal}
                    className="border-2 border-amber-400 bg-amber-50/80 rounded-xl p-2.5 hover:bg-amber-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                        <Music className="w-3.5 h-3.5 text-amber-700" />
                        Utcazenész szőnyeg
                      </span>
                      <span className="text-[9px] font-bold text-amber-800">Jelentkezés</span>
                    </div>
                    <p className="text-[10px] text-stone-600 mt-1 leading-tight">
                      Szőnyeg + 2 szék akusztikus zenészeknek (30-40 perc vagy egész nap).
                    </p>
                  </div>

                  {/* GREEN BOX (Ingyen elvihető sarok) */}
                  <div
                    onClick={onOpenGreenBoxInfo}
                    className="border-2 border-emerald-500 bg-emerald-50/80 rounded-xl p-2.5 hover:bg-emerald-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-emerald-700" />
                        Zöld Doboz sarok
                      </span>
                      <span className="text-[9px] font-bold text-emerald-800">Ingyenes</span>
                    </div>
                    <p className="text-[10px] text-stone-600 mt-1 leading-tight">
                      Cserebere asztal a kijáratnál: megmaradt könyvek, virágpalánták.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

        {/* RESPONSIVE SELECTED/TOUCHED STAND PREVIEW CARD (Visible on Mobile Tap & Desktop Selection) */}
        {(() => {
          const activeTable = location.tables.find((t) => t.id === (focusedTableId || selectedTableId));
          if (!activeTable) return null;
          const isAvail = activeTable.status === 'available';
          const maskedName = activeTable.reservedBy ? formatGdprName(activeTable.reservedBy.name) : '';

          return (
            <div className="mt-4 bg-[#FCFAF6] border-2 border-[#C88A36] rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif font-black px-2 py-0.5 bg-[#1A3626] text-[#E7C286] rounded text-xs">
                    Stand #{activeTable.id}
                  </span>
                  <span className="font-bold text-stone-800">
                    {activeTable.side === 'north' ? 'Északi utcafront' : 'Déli utcafront'} · 250×100 cm
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isAvail ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isAvail ? 'Szabad asztal' : 'Foglalt stand'}
                  </span>
                </div>
                {activeTable.reservedBy ? (
                  <div className="text-stone-700">
                    <span className="font-bold text-stone-900">Árus: {maskedName}</span>
                    {activeTable.reservedBy.note && (
                      <span className="italic text-stone-600 block mt-0.5">"{activeTable.reservedBy.note}"</span>
                    )}
                  </div>
                ) : (
                  <p className="text-stone-600">
                    Szabad asztal! Részvételi hozzájárulás: <strong>4 050 Ft</strong> helyi lakosnak (-10%) / <strong>4 500 Ft</strong> kerületi lakosnak.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectTable(activeTable)}
                  className="px-4 py-2 bg-[#1A3626] hover:bg-[#254834] text-[#E7C286] font-serif font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isAvail ? 'Stand lefoglalása →' : 'Stand adatlap megtekintése →'}
                </button>
              </div>
            </div>
          );
        })()}

        {/* BOTTOM METRIC STRIP */}
        <div className="mt-4 bg-white rounded-xl border border-stone-300 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-stone-700">
            <div>
              <span className="text-stone-400 block text-[10px]">Stand méret</span>
              <span className="font-mono font-bold text-stone-900">250 × 100 cm</span>
            </div>
            <div className="h-6 w-px bg-stone-200"></div>
            <div>
              <span className="text-stone-400 block text-[10px]">Helyi lakos kedvezmény</span>
              <span className="font-mono font-bold text-emerald-800">4 050 Ft (-10%)</span>
            </div>
            <div className="h-6 w-px bg-stone-200"></div>
            <div>
              <span className="text-stone-400 block text-[10px]">Kerületi alapdíj</span>
              <span className="font-mono font-bold text-stone-900">4 500 Ft</span>
            </div>
            <div className="h-6 w-px bg-stone-200"></div>
            <div>
              <span className="text-stone-400 block text-[10px]">Gyerekzsibi</span>
              <span className="font-bold text-blue-900">0 Ft (4 asztal)</span>
            </div>
          </div>

          <div className="text-stone-600 text-[11px] text-center sm:text-right">
            Csak XI. kerületi lakosok bérelhetnek asztalt · 120×80 cm fa asztal biztosítva
          </div>
        </div>

      </div>
    </section>
  );
};

interface TableButtonProps {
  table: TableData;
  isSelected: boolean;
  isHighlighted: boolean;
  isCategoryActive: boolean;
  onClick: () => void;
}

const TableButton: React.FC<TableButtonProps> = ({
  table,
  isSelected,
  isHighlighted,
  isCategoryActive,
  onClick,
}) => {
  const isAvailable = table.status === 'available';
  const isMatch = isCategoryActive && isHighlighted && table.reservedBy !== undefined;

  let borderStyle = 'border-[#D8CEBD] bg-white hover:border-[#C88A36]';
  let badgeStyle = 'bg-[#EFE8DA] text-[#4A4036]';
  let opacityStyle = 'opacity-100';

  if (isSelected) {
    borderStyle = 'border-[#C88A36] bg-[#FDF8EE] ring-3 ring-[#C88A36] shadow-md scale-105 z-30';
    badgeStyle = 'bg-[#C88A36] text-[#1B1916] font-black';
  } else if (isMatch) {
    // CATEGORY FILTER MATCH: Highlight clearly with warm ochre and glow!
    borderStyle = 'border-[#C88A36] bg-[#FFF9EE] ring-3 ring-[#C88A36] shadow-xl scale-105 z-30 animate-pulse';
    badgeStyle = 'bg-[#C88A36] text-[#1B1916] font-black';
    opacityStyle = 'opacity-100';
  } else if (isCategoryActive && !isHighlighted) {
    // Dimmed out when another category is filtered
    opacityStyle = 'opacity-25 grayscale brightness-95 hover:grayscale-0 hover:opacity-85 transition-opacity';
    borderStyle = isAvailable
      ? 'border-[#426E53]/40 bg-[#EAF2ED]/40 cursor-pointer'
      : 'border-[#D8CEBD]/60 bg-[#EFE8DA]/40 text-[#4A4036]/60 cursor-pointer';
    badgeStyle = isAvailable ? 'bg-[#1A3626]/50 text-white/80' : 'bg-[#8C7E6D]/50 text-white/80';
  } else if (isAvailable) {
    borderStyle = 'border-[#426E53] bg-[#EAF2ED] hover:bg-[#DDEAE1] hover:border-[#1A3626] cursor-pointer shadow-2xs';
    badgeStyle = 'bg-[#1A3626] text-[#E7C286]';
  } else {
    // Reserved normal
    borderStyle = 'border-[#D8CEBD] bg-[#EFE8DA] text-[#4A4036] cursor-pointer hover:border-[#8C7E6D]';
    badgeStyle = 'bg-[#8C7E6D] text-white';
  }

  // GDPR anonymized display name: "K. Péter", "V. Zsuzsanna"
  const gdprDisplayName = table.reservedBy ? formatGdprName(table.reservedBy.name) : '';

  // TOOLTIP POSITIONING:
  // North row (1–18): opens UPWARD (bottom-full mb-2) above the table
  // South row (19–36): opens DOWNWARD (top-full mt-2) below the table ("déli sor lent jelenjen meg")
  // This completely eliminates any overlap between the two rows!
  const isNorth = table.side === 'north';
  const verticalPos = isNorth ? 'bottom-full mb-2' : 'top-full mt-2';

  // Prevent horizontal clipping at street edges (tables 1-3 on left, 16-18 on right)
  const colIndex = ((table.id - 1) % 18) + 1;
  let horizontalPos = 'left-1/2 -translate-x-1/2';
  let arrowHorizontal = 'left-1/2 -translate-x-1/2';
  if (colIndex <= 3) {
    horizontalPos = 'left-0 translate-x-0';
    arrowHorizontal = 'left-6';
  } else if (colIndex >= 16) {
    horizontalPos = 'right-0 left-auto translate-x-0';
    arrowHorizontal = 'right-6';
  }

  return (
    <button
      onClick={onClick}
      className={`relative p-1.5 sm:p-2 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-[90px] sm:h-[100px] cursor-pointer group hover:z-50 focus:z-50 ${borderStyle} ${opacityStyle}`}
      title={
        isAvailable
          ? `Stand #${table.id}: Szabad, kattints a lefoglaláshoz!`
          : `Stand #${table.id}: ${gdprDisplayName} (${table.reservedBy?.note})`
      }
    >
      <div className="flex items-center justify-between w-full">
        <span className={`text-[10px] sm:text-[11px] font-black px-1.5 py-0.2 rounded font-serif ${badgeStyle} tabular-nums`}>
          #{table.id}
        </span>
        {isAvailable ? (
          <span className="w-2 h-2 rounded-full bg-[#254834]" title="Szabad"></span>
        ) : (
          <span className="w-2 h-2 rounded-full bg-[#8C7E6D]" title="Foglalt"></span>
        )}
      </div>

      {isMatch ? (
        <div className="w-full my-0.5 py-0.5 px-1 bg-[#C88A36] text-[#1B1916] rounded text-center shadow-xs">
          <span className="text-[8px] font-black uppercase tracking-wider block font-serif flex items-center justify-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 shrink-0" /> Találat
          </span>
        </div>
      ) : (
        <div className="w-full my-0.5 py-0.5 px-1 bg-white/70 rounded border border-dashed border-[#D5C7AF] text-center">
          <span className="text-[8px] sm:text-[9px] font-mono font-semibold text-[#544C42] block">
            250×100
          </span>
        </div>
      )}

      <div className="w-full truncate text-[9px] sm:text-[10px]">
        {isAvailable ? (
          <span className="text-[#1A3626] font-bold block truncate font-serif">
            Szabad
          </span>
        ) : (
          <span className="text-[#2C2723] font-bold block truncate font-serif" title={gdprDisplayName}>
            {gdprDisplayName}
          </span>
        )}
      </div>

      {/* RICH RESPONSIVE HOVER TOOLTIP - UNCLIPPED & SMART POSITIONING */}
      <div
        className={`hidden group-hover:block absolute ${verticalPos} ${horizontalPos} w-64 p-3.5 bg-[#1A3626] text-[#FBF6EE] rounded-xl text-xs shadow-2xl z-50 pointer-events-none border border-[#426E53]`}
      >
        {/* Pointer Arrow */}
        <div
          className={`absolute ${
            isNorth
              ? '-bottom-1.5 border-b border-r border-[#426E53]'
              : '-top-1.5 border-t border-l border-[#426E53]'
          } ${arrowHorizontal} w-3 h-3 bg-[#1A3626] rotate-45 pointer-events-none`}
        ></div>

        <div className="flex items-center justify-between font-bold border-b border-[#2E543D] pb-1.5 mb-1.5 font-serif">
          <span className="text-[#E7C286] flex items-center gap-1">
            <span>Stand #{table.id}</span>
            {isMatch && <span className="text-[10px] bg-[#C88A36] text-[#1B1916] px-1 rounded">Keresett kategória</span>}
          </span>
          <span className="text-[10px] font-mono text-[#A4C4AC]">250×100 cm</span>
        </div>

        {table.reservedBy ? (
          <div className="space-y-1.5 text-[11px]">
            <div className="font-bold text-white font-serif flex items-center justify-between">
              <span>{gdprDisplayName}</span>
              <span className="text-[10px] text-[#A4C4AC] font-normal font-sans">Árus</span>
            </div>

            {/* What is sold */}
            <p className="text-[#D5E4D8] text-[10px] leading-snug italic bg-[#14261B] p-1.5 rounded border border-[#234632]">
              "{table.reservedBy.note}"
            </p>

            {/* Category badges */}
            {table.reservedBy.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-[#2E543D]">
                {table.reservedBy.categories.map((cId) => {
                  const cat = CATEGORIES.find((c) => c.id === cId);
                  return (
                    <span
                      key={cId}
                      className="text-[9px] font-medium px-1.5 py-0.2 bg-[#254834] rounded text-[#E7C286] border border-[#3E664D]"
                    >
                      {cat ? cat.label : cId}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-[#E7C286] font-semibold font-serif leading-snug">
            Szabad standhely! Kattints a lefoglaláshoz (4 050 Ft helyi lakos / 4 500 Ft kerületi díj).
          </div>
        )}
      </div>
    </button>
  );
};
