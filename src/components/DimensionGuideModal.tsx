import React from 'react';
import { X, Layers, AlertTriangle, ShieldCheck, Check, Clock, Users, Package } from 'lucide-react';

interface DimensionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBooking: () => void;
}

export const DimensionGuideModal: React.FC<DimensionGuideModalProps> = ({
  isOpen,
  onClose,
  onStartBooking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-2xl max-w-2xl w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                Standméretezési és pakolási útmutató
              </h3>
              <p className="text-xs text-stone-600">
                A teljes elfoglalt terület mérete: 250 × 100 cm
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="text-center">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Felülnézeti standalaprajz: 250 cm széles × 100 cm mély
              </span>
              <span className="text-xs text-stone-500">
                1 db masszív 120×80 cm fa sörpad-asztalt és 1 széket adunk minden árusnak
              </span>
            </div>

            {/* Blueprint diagram */}
            <div className="bg-[#FAF7F2] rounded-xl border border-stone-300 p-4 space-y-3">
              
              <div className="bg-stone-200/80 border border-stone-300 rounded p-2 text-center text-xs text-stone-700">
                <span className="font-bold text-stone-900">Mögöttes eladói sáv (a járdán)</span>
                <span className="block text-[11px] text-stone-600 mt-0.5">
                  1 db biztosított szék az eladónak + személyes kabát és táskák tárolása.
                </span>
              </div>

              {/* 65 + 120 + 65 = 250 cm */}
              <div className="grid grid-cols-[1fr_1.8fr_1fr] gap-2 text-center">
                <div className="bg-emerald-50 border-2 border-dashed border-emerald-500 rounded-lg p-3 flex flex-col justify-center">
                  <span className="text-xs font-bold text-emerald-900 block">65 cm</span>
                  <span className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    Bal oldali pakolózóna (ruhaállvány, tárolóláda)
                  </span>
                </div>

                <div className="bg-[#F0E6D2] border-2 border-[#8C6D46] rounded-lg p-4 shadow-xs flex flex-col justify-center items-center">
                  <span className="text-xs font-mono font-bold text-stone-900 bg-[#E4D4BB] px-2 py-0.5 rounded">
                    Biztosított fa asztal
                  </span>
                  <span className="text-lg font-black text-stone-950 font-mono mt-1">
                    120 cm × 80 cm
                  </span>
                  <span className="text-[11px] text-stone-700 mt-0.5">
                    Asztallap magassága: 75 cm
                  </span>
                </div>

                <div className="bg-emerald-50 border-2 border-dashed border-emerald-500 rounded-lg p-3 flex flex-col justify-center">
                  <span className="text-xs font-bold text-emerald-900 block">65 cm</span>
                  <span className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    Jobb oldali pakolózóna (dobozok, polcos állvány)
                  </span>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-dashed border-red-300 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-700 uppercase">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Előre pakolni szigorúan tilos!</span>
                </div>
                <p className="text-[11px] text-red-800 mt-1">
                  A 4,5 méteres vásárlói gyalogos folyosóba babakocsik és mentési útvonal miatt semmi nem lóghat be.
                </p>
              </div>

            </div>

            <div className="text-center font-mono text-xs font-bold text-stone-800 bg-[#ECE6DB] py-1.5 rounded">
              Teljes hasznos standméret: 65 cm + 120 cm + 65 cm = 250 cm szélesség × 100 cm mélység
            </div>
          </div>

          {/* Key rules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 mb-1">
                <Package className="w-4 h-4 text-emerald-800" />
                <span>Kizárólag kerületi árusok</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Csak újbudai lakosok jelentkezhetnek. Helyi lakosoknak 4 050 Ft (-10%), egyéb kerületi lakosoknak 4 500 Ft.
              </p>
            </div>

            <div className="p-3 bg-white border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 mb-1">
                <Clock className="w-4 h-4 text-emerald-800" />
                <span>Időpontok</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Lezárás: 00:00 – 21:00. Kipakolás: 08:00 – 09:00. Vásár: 09:00 – 17:00. Elpakolás: 17:00 – 18:00.
              </p>
            </div>

            <div className="p-3 bg-white border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>8 napos lemondás</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Legkésőbb a vásár előtt 8 nappal mondható le. 8 napon belül a rendszer zárolja a lemondást.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F4EFE6] border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
          >
            Értem, köszönöm
          </button>
          <button
            onClick={() => {
              onClose();
              onStartBooking();
            }}
            className="px-5 py-2.5 text-xs font-bold text-[#14261B] bg-[#C88A36] hover:bg-[#A96E22] hover:text-white rounded-xl transition-colors cursor-pointer border border-[#A96E22]"
          >
            Szabad asztal kiválasztása
          </button>
        </div>

      </div>
    </div>
  );
};
