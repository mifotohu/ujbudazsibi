import React, { useState } from 'react';
import { KidsFleaTable, LocationData, formatGdprName } from '../types/market';
import { sendEmailNotification } from '../lib/supabase';
import {
  X,
  Smile,
  CheckCircle2,
  Send,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface KidsFleaModalProps {
  table: KidsFleaTable | null;
  location: LocationData;
  isOpen: boolean;
  onClose: () => void;
  onBookKidsTable: (tableId: string, bookingData: {
    parentName: string;
    childName: string;
    childAge: number;
    email: string;
    phone: string;
    itemsDescription: string;
  }) => void;
}

export const KidsFleaModal: React.FC<KidsFleaModalProps> = ({
  table,
  location,
  isOpen,
  onClose,
  onBookKidsTable,
}) => {
  if (!isOpen || !table) return null;

  const isReserved = table.status === 'reserved';

  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number>(8);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [itemsDescription, setItemsDescription] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !childName.trim() || !email.trim() || !phone.trim() || !itemsDescription.trim()) {
      setErrorMsg('Kérjük, töltsd ki az összes mezőt!');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('Kérjük, fogadd el a házirendet és a 8 napos lemondási határidőt!');
      return;
    }

    setErrorMsg('');

    await sendEmailNotification({
      to: 'ujbudazsibi@gmail.com',
      subject: `[Újbudazsibi Gyerekzsibi] Új foglalás: ${table.name} (${childName} - ${parentName})`,
      htmlContent: `
        <h3>Új Gyerekzsibi Asztalfoglalás (Díjmentes)</h3>
        <p><strong>Stand:</strong> ${table.name} - ${location.name}</p>
        <p><strong>Gyermek:</strong> ${childName} (${childAge} éves)</p>
        <p><strong>Szülő:</strong> ${parentName} (${phone}, ${email})</p>
        <p><strong>Árusított holmik:</strong> ${itemsDescription}</p>
      `,
    });

    onBookKidsTable(table.id, {
      parentName,
      childName,
      childAge,
      email,
      phone,
      itemsDescription,
    });

    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-lg w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1A3626] text-[#E7C286] border border-[#C88A36]/30">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                {table.name} — Gyerekzsibi stand
              </h3>
              <p className="text-xs text-stone-600">
                {location.name} · Díjmentes stand gyermekeknek, szülői felügyelettel
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

        {isReserved ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-stone-100 rounded-xl border border-stone-300 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                Ez az asztal már le van foglalva
              </span>
              <p className="text-sm font-bold text-stone-900">
                Kisárus: {table.reservedBy?.childName ? formatGdprName(table.reservedBy.childName) : ''} ({table.reservedBy?.childAge} éves)
              </p>
              <p className="text-xs text-stone-600 italic">
                "{table.reservedBy?.itemsDescription}"
              </p>
              <span className="text-[11px] text-stone-500 block pt-1 border-t border-stone-200">
                Kísérő szülő: {table.reservedBy?.parentName ? formatGdprName(table.reservedBy.parentName) : ''}
              </span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Bezárás
              </button>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-stone-900 font-serif">
              Gyerekzsibi asztal sikeresen lefoglalva!
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
              Az asztal 0 Ft-os foglalását rögzítettük és elküldtük az értesítést (<strong>ujbudazsibi@gmail.com</strong>). Szeretettel várunk benneteket!
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Vissza az oldalhoz
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
              <span className="font-bold block">Mi az a Gyerekzsibi?</span>
              <p className="text-[11px] text-blue-900 leading-normal">
                Kifejezetten gyermekeknek biztosított 4 db kis asztal, ahol kinőtt játékaikat, könyveiket vagy saját rajzaikat árulhatják féláron, játékos pénzügyi tudatosságot tanulva, felnőtt kísérettel. <strong>A foglalás teljesen díjmentes!</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Kísérő szülő neve *
                </label>
                <input
                  type="text"
                  required
                  placeholder="pl. Kiss Judit"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Kisárus (gyermek) neve *
                </label>
                <input
                  type="text"
                  required
                  placeholder="pl. Kiss Marci"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Gyermek életkora
                </label>
                <input
                  type="number"
                  min={4}
                  max={16}
                  value={childAge}
                  onChange={(e) => setChildAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Szülő e-mail címe *
                </label>
                <input
                  type="email"
                  required
                  placeholder="szulo@email.hu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Telefonszám *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+36 30 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Miket fog árulni a gyerkőc? *
              </label>
              <textarea
                rows={2}
                required
                value={itemsDescription}
                onChange={(e) => setItemsDescription(e.target.value)}
                placeholder="pl. Kinőtt LEGO és Duplo, társasjátékok, plüssök, mesekönyvek, saját készítésű karkötők"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1 text-xs text-amber-950">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-amber-700 w-4 h-4"
                />
                <span className="text-[11px] leading-relaxed">
                  Tudomásul veszem, hogy a stand <strong>díjmentes</strong>, nem mondható vissza indoklás nélkül. Ha mégsem tudunk jönni, azt <strong>legkésőbb 8 nappal a vásár előtt jelezzük</strong>, hogy más gyerkőc megkaphassa az asztalt!
                </span>
              </label>
            </div>

            {errorMsg && <p className="text-xs text-red-600 font-bold">{errorMsg}</p>}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
              >
                Mégse
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#C88A36] hover:bg-[#A96E22] text-[#14261B] hover:text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer border border-[#A96E22]"
              >
                <Send className="w-3.5 h-3.5 text-[#14261B]" />
                <span>Gyerekzsibi asztal lefoglalása (0 Ft)</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
