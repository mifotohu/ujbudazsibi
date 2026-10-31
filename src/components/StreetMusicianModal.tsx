import React, { useState } from 'react';
import { LocationData, StreetMusicianApplication } from '../types/market';
import { sendEmailNotification } from '../lib/supabase';
import {
  X,
  Music,
  CheckCircle2,
  Send,
  Clock,
  Sparkles,
  Guitar,
} from 'lucide-react';

interface StreetMusicianModalProps {
  locations: LocationData[];
  selectedLocationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitMusician: (app: StreetMusicianApplication) => void;
}

export const StreetMusicianModal: React.FC<StreetMusicianModalProps> = ({
  locations,
  selectedLocationId,
  isOpen,
  onClose,
  onSubmitMusician,
}) => {
  if (!isOpen) return null;

  const [locationId, setLocationId] = useState(selectedLocationId);
  const [musicianOrBandName, setMusicianOrBandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [genre, setGenre] = useState('');
  const [instruments, setInstruments] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('11:00 – 12:30');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicianOrBandName.trim() || !contactName.trim() || !email.trim() || !phone.trim() || !genre.trim()) {
      setErrorMsg('Kérjük, add meg a zenész/zenekar nevét, elérhetőségedet és a műfajt!');
      return;
    }

    const loc = locations.find((l) => l.id === locationId) || locations[0];
    const newMusician: StreetMusicianApplication = {
      id: `mus-${Date.now().toString().slice(-4)}`,
      musicianOrBandName,
      contactName,
      email,
      phone,
      genre,
      instruments,
      locationId: loc.id,
      locationName: loc.name,
      preferredTimeSlot,
      note,
      createdAt: new Date().toLocaleDateString('hu-HU'),
    };

    await sendEmailNotification({
      to: 'ujbudazsibi@gmail.com',
      subject: `[Újbudazsibi Utcazenész] Jelentkezés: ${musicianOrBandName} (${genre})`,
      htmlContent: `
        <h3>Új Utcazenész Jelentkezés</h3>
        <p><strong>Zenész / Zenekar:</strong> ${musicianOrBandName}</p>
        <p><strong>Kapcsolattartó:</strong> ${contactName} (${phone}, ${email})</p>
        <p><strong>Műfaj:</strong> ${genre}</p>
        <p><strong>Hangszerek:</strong> ${instruments}</p>
        <p><strong>Helyszín & Idősáv:</strong> ${loc.name} · ${preferredTimeSlot}</p>
        <p><strong>Megjegyzés:</strong> ${note}</p>
      `,
    });

    onSubmitMusician(newMusician);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-lg w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-700 text-white">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                Utcazenész szőnyeg — fellépői jelentkezés
              </h3>
              <p className="text-xs text-stone-600">
                Akusztikus zenei háttér a kávézó és grillsarok melletti szőnyegen
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

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-stone-900 font-serif">
              Köszönjük a zenei jelentkezést!
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
              Jelentkezésed megérkezett a szervezői címre (<strong>ujbudazsibi@gmail.com</strong>). Hamarosan egyeztetünk veled a fellépési idősávról és a helyszínről!
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Vissza a bolhapiachoz
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
              <span className="font-bold block">Mi a koncepció?</span>
              <p className="text-[11px] text-amber-900 leading-normal">
                Egy szép perzsa stílusú szőnyeg 2 székkel a kávézó és grillsarok mellett. Helyi zeneiskolások, akusztikus duók, harmonikások vagy gitárosok 30-40 perces unplugged játékát várjuk, de 1 zenekar / 1 zenész akár az egész napra is berendezkedhet!
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Helyszín *
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} · {loc.weekendDates}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Zenész / Zenekar neve *
                </label>
                <input
                  type="text"
                  required
                  placeholder="pl. Bartók Akusztik"
                  value={musicianOrBandName}
                  onChange={(e) => setMusicianOrBandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Kapcsolattartó neve *
                </label>
                <input
                  type="text"
                  required
                  placeholder="pl. Varga Bálint"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  E-mail cím *
                </label>
                <input
                  type="email"
                  required
                  placeholder="balint@zene.hu"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Zenei stílus / műfaj *
                </label>
                <input
                  type="text"
                  required
                  placeholder="pl. Békebeli jazz, sanzonok, népzene"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Hangszerek
                </label>
                <input
                  type="text"
                  placeholder="pl. 1 akusztikus gitár, hegedű"
                  value={instruments}
                  onChange={(e) => setInstruments(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Kívánt idősáv
              </label>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium"
              >
                <option value="10:30 – 11:30 (Délelőtti korzó)">10:30 – 11:30 (Délelőtti korzó)</option>
                <option value="11:30 – 12:30 (Ebédidő a grillnél)">11:30 – 12:30 (Ebédidő a grillnél)</option>
                <option value="14:00 – 15:00 (Délutáni kávéidő)">14:00 – 15:00 (Délutáni kávéidő)</option>
                <option value="15:30 – 16:30 (Kora esti levezetés)">15:30 – 16:30 (Kora esti levezetés)</option>
                <option value="Egész napos jelenlét (fél-egy órás blokkokban)">Egész napos jelenlét (fél-egy órás blokkokban)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Megjegyzés vagy bemutatkozás
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Rövid leírás a zenekarról vagy link a felvételekről..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              />
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
                <span>Zenész jelentkezés beküldése</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
