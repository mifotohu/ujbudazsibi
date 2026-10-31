import React from 'react';
import {
  X,
  Gift,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Users,
  Sparkles,
  Leaf,
} from 'lucide-react';

interface GreenBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVolunteer: () => void;
}

export const GreenBoxModal: React.FC<GreenBoxModalProps> = ({
  isOpen,
  onClose,
  onOpenVolunteer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-lg w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-800 text-white">
              <Gift className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                Zöld Doboz — ingyen elvihető sarok
              </h3>
              <p className="text-xs text-stone-600">
                Közösségi cserebere asztal a piac keleti kijáratánál
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
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs text-emerald-950">
            <span className="font-bold text-sm block font-serif">
              Hogyan működik a Zöld Doboz?
            </span>
            <p className="text-[11px] leading-relaxed text-emerald-900">
              A vásár zárásakor (vagy akár napközben is) a lakók és az árusok kitehetik ide azokat a feleslegessé vált, de jó állapotú tárgyaikat, amelyeket már nem vinnének haza. A környékbeli szomszédok és a sétálók ezeket <strong>teljesen ingyen elvihetik</strong>.
            </p>
          </div>

          {/* Rules: NOT TRASH */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Fontos szabály: NEM kacatleadás!</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              Kérünk mindenkit, hogy <strong>kizárólag tiszta, ép és azonnal használható holmikat</strong> hozzon:
            </p>
            <ul className="list-disc pl-4 text-[11px] space-y-1 text-amber-900">
              <li>Szobanövények, fűszernövények és virágpalánták</li>
              <li>Jó állapotú olvasott könyvek, folyóiratok és képregények</li>
              <li>Hiánytalan játékok és plüssök</li>
              <li>Tiszta bögrék, vázák és konyhai dísztárgyak</li>
            </ul>
          </div>

          <div className="p-3 bg-white border border-stone-300 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <Users className="w-4 h-4 text-emerald-800" />
              <span>Önkéntes felügyelet:</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-normal">
              A Zöld Doboz asztalt 1-2 dedikált önkéntes felügyeli és rendezi a nap folyamán, hogy mindig szép és méltó maradjon a környékhez.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onOpenVolunteer();
              }}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Szívesen felügyelnéd? Jelentkezz önkéntesnek →
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Értem
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
