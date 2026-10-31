import React from 'react';
import { TableData, LocationData, formatGdprName } from '../types/market';
import { CATEGORIES } from '../data/mockData';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TableDetailModalProps {
  table: TableData | null;
  location: LocationData;
  isOpen: boolean;
  onClose: () => void;
  onStartBookingForTable: (table: TableData) => void;
}

export const TableDetailModal: React.FC<TableDetailModalProps> = ({
  table,
  location,
  isOpen,
  onClose,
  onStartBookingForTable,
}) => {
  if (!isOpen || !table) return null;

  const isAvailable = table.status === 'available';
  const sideLabel = table.side === 'north' ? 'Északi utcafront (Járda észak)' : 'Déli utcafront (Járda dél)';
  const gdprName = table.reservedBy ? formatGdprName(table.reservedBy.name) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-2xl w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#F4EFE6]">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold px-3 py-1 bg-emerald-800 text-white rounded-lg tabular-nums">
              Stand #{table.id}
            </span>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                Stand részletei és méretezési rajz
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {location.name} · {sideLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Status banner */}
          {isAvailable ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    Ez az asztal jelenleg szabad
                  </span>
                  <span className="text-xs text-emerald-800">
                    Kizárólag XI. kerületi (újbudai) lakosok számára foglalható!
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-emerald-900">4 050 / 4 500 Ft</span>
                <span className="text-[10px] text-stone-500 block">lakcím szerint</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white border border-stone-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stone-500"></span>
                  Foglalt stand
                </span>
                <span className="text-[11px] font-mono text-stone-500">
                  {table.reservedBy?.bookingRef}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-stone-900 block">
                  Árus: {gdprName}
                </span>
                <p className="text-xs text-stone-600 mt-1 italic">
                  "{table.reservedBy?.note}"
                </p>
              </div>
              {table.reservedBy?.categories && table.reservedBy.categories.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {table.reservedBy.categories.map((catId) => {
                    const catObj = CATEGORIES.find((c) => c.id === catId);
                    return (
                      <span
                        key={catId}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-800"
                      >
                        {catObj ? catObj.label : catId}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Blueprint: 250 x 100 cm */}
          <div className="border border-stone-300 rounded-xl p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <Layers className="w-4 h-4 text-emerald-800" />
                <span>Helyszíni méretarányos standalaprajz: 250 × 100 cm</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Összes terület: 250 × 100 cm (2.5 m²)
              </span>
            </div>

            {/* Visual Canvas */}
            <div className="bg-[#FAF7F2] rounded-lg border border-stone-300 p-4 space-y-2.5">
              
              <div className="bg-stone-200/80 border border-stone-300 rounded p-2 text-center text-xs text-stone-700">
                <span className="font-bold text-stone-900">Mögöttes eladói sáv (a járdán)</span>
                <span className="block text-[11px] text-stone-600 mt-0.5">
                  1 db biztosított szék az eladónak + személyes holmik tárolása a házfal felől
                </span>
              </div>

              {/* 3 columns: 65cm left + 120cm table + 65cm right = 250 cm total */}
              <div className="grid grid-cols-[1fr_1.8fr_1fr] gap-2 items-stretch text-center">
                <div className="bg-emerald-50/80 border-2 border-dashed border-emerald-500 rounded-lg p-2.5 flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-emerald-900 block">
                    +65 cm pakolózóna
                  </span>
                  <span className="text-[10px] text-emerald-700 mt-0.5">
                    Bal oldal: ruhaállvány, ládák
                  </span>
                </div>

                <div className="bg-[#F0E6D2] border-2 border-[#8C6D46] rounded-lg p-3.5 shadow-xs flex flex-col justify-center items-center">
                  <div className="bg-[#E4D4BB] px-2 py-0.5 rounded text-[10px] font-mono font-bold text-stone-900 uppercase">
                    Biztosított fa asztal
                  </div>
                  <span className="text-base font-extrabold text-stone-950 mt-1 font-mono">
                    120 cm × 80 cm
                  </span>
                  <span className="text-[11px] text-stone-700 mt-0.5">
                    Magasság: 75 cm
                  </span>
                </div>

                <div className="bg-emerald-50/80 border-2 border-dashed border-emerald-500 rounded-lg p-2.5 flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-emerald-900 block">
                    +65 cm pakolózóna
                  </span>
                  <span className="text-[10px] text-emerald-700 mt-0.5">
                    Jobb oldal: dobozok, polc
                  </span>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-dashed border-red-300 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-700 uppercase">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Előre a sétányba pakolni szigorúan tilos!</span>
                </div>
                <p className="text-[11px] text-red-800 mt-0.5">
                  A 4,5 méteres vásárlói gyalogos folyosóba babakocsik és kerekesszék miatt semmi nem lóghat be!
                </p>
              </div>
            </div>

            {/* Quick schedule notes */}
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-stone-600">
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <strong className="text-stone-900 block">Menetrend:</strong>
                <span>Kipakolás 08:00–09:00, vásár 09:00–17:00, elpakolás 17:00–18:00.</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <strong className="text-stone-900 block">Lemondási határidő:</strong>
                <span>Legkésőbb 8 nappal a vásár előtt mondható le.</span>
              </div>
            </div>
          </div>

          {/* Pricing based on neighborhood vs district */}
          <div className="bg-[#F4EFE6] rounded-xl p-4 border border-stone-200 text-xs space-y-1">
            <span className="font-bold text-stone-900 block">
              Lakcím alapú díjszabás (csak XI. kerületi lakosoknak):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-stone-700">
              <div className="p-2 bg-white rounded border border-stone-200">
                <strong className="text-emerald-900 block">4 050 Ft (-10% kedvezmény)</strong>
                <span>Ha az adott kerületrészben laksz (pl. {location.neighborhood}).</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200">
                <strong className="text-stone-900 block">4 500 Ft (alapdíj)</strong>
                <span>Ha egyéb XI. kerületi (újbudai) lakcímmel rendelkezel.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F4EFE6] border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            Bezárás
          </button>
          
          {isAvailable && (
            <button
              onClick={() => {
                onClose();
                onStartBookingForTable(table);
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-[#1B1916] bg-[#C88A36] hover:bg-[#B77726] rounded-xl shadow-xs border border-[#A96E22] transition-colors cursor-pointer font-serif"
            >
              <span>#{table.id} asztal lefoglalása</span>
              <ArrowRight className="w-4 h-4 text-[#1B1916]" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
