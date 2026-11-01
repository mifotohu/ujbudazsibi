import React, { useState } from 'react';
import { MarketReview } from '../types/market';
import { sendEmailNotification } from '../lib/supabase';
import {
  X,
  MessageSquare,
  Star,
  CheckCircle2,
  Send,
  Lock,
  Sparkles,
} from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: MarketReview) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  if (!isOpen) return null;

  const [rating, setRating] = useState<number>(5);
  const [atmosphereRating, setAtmosphereRating] = useState<number>(5);
  const [organizationRating, setOrganizationRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [sellerFeedback, setSellerFeedback] = useState('');
  const [publicAllowed, setPublicAllowed] = useState<boolean>(true);
  const [authorName, setAuthorName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setErrorMsg('Kérjük, írj pár mondatot a tapasztalataidról!');
      return;
    }

    const newReview: MarketReview = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      rating,
      atmosphereRating,
      organizationRating,
      feedbackText,
      authorName: authorName.trim() || 'Látogató',
      sellerFeedback: sellerFeedback.trim() ? sellerFeedback : undefined,
      publicAllowed,
      status: 'pending', // Requires admin approval to show on frontend
      submittedAt: new Date().toLocaleDateString('hu-HU'),
    };

    const reviewSummary = `Értékelés: ${rating} / 5 csillag
Hangulat & Közösség: ${atmosphereRating} / 5
Szervezés & Tisztaság: ${organizationRating} / 5
Megjelenhet nyilvánosan a weboldalon: ${publicAllowed ? 'IGEN (Jóváhagyást követően kikerülhet a frontendre)' : 'NEM (Kizárólag belső szervezői észrevétel)'}
Beküldő megnevezése: ${authorName.trim() || 'Anonim látogató'}
Szöveges vélemény: ${feedbackText}
${sellerFeedback.trim() ? `Külön észrevétel konkrét árusról (belső): ${sellerFeedback}` : 'Nincs külön árus észrevétel'}
Státusz: Adminisztrátori jóváhagyásra vár`;

    await sendEmailNotification({
      to: 'ujbudazsibi@gmail.com',
      subject: `[Újbudazsibi Vélemény] Új lakossági értékelés érkezett: ${rating}★ (Jóváhagyásra vár)`,
      applicantName: authorName.trim() || 'Anonim Látogató',
      standText: 'Lakossági és vásárlói vélemény',
      locationText: 'Újbudazsibi közösségi visszajelzés',
      categoryText: `${rating} csillagos értékelés · ${publicAllowed ? 'Nyilvános jóváhagyásra vár' : 'Csak belső adminnak'}`,
      readableDetails: reviewSummary,
      htmlContent: `
        <h3 style="color: #1a3626; font-family: serif;">Új Lakossági Értékelés Érkezett</h3>
        <p><strong>Összértékelés:</strong> ${rating} / 5 csillag</p>
        <p><strong>Hangulat:</strong> ${atmosphereRating} / 5 | <strong>Szervezés:</strong> ${organizationRating} / 5</p>
        <p><strong>Megjelenhet nyilvánosan az oldalon:</strong> ${publicAllowed ? 'Igen (jóváhagyást követően)' : 'Nem (csak a szervezőknek szóló belső észrevétel)'}</p>
        <p><strong>Vélemény:</strong> ${feedbackText}</p>
        ${sellerFeedback ? `<p><strong>Belső árus észrevétel:</strong> ${sellerFeedback}</p>` : ''}
        <p><em>Státusz: Függőben az admin felületen (jóváhagyás szükséges a megjelenítéshez).</em></p>
      `,
    });

    onSubmitReview(newReview);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-lg w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-800 text-white">
              <MessageSquare className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                Anonim vélemény a bolhapiacról
              </h3>
              <p className="text-xs text-stone-600">
                Oszd meg velünk a meglátásaidat, hogy még jobbá tegyük a közösségi vásárt!
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
              Köszönjük a visszajelzésedet!
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
              Az anonim véleményed beérkezett a szervezői felületre. A visszajelzések segítenek nekünk a következő heti utcák még gondosabb szervezésében.
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
            
            {/* Rating Stars */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-300 space-y-2">
              <label className="block text-xs font-bold text-stone-800">
                Milyen volt az összkép? (1-5 csillag)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-stone-100 text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold font-mono text-stone-700 ml-2">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Atmosphere & Organization */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-300">
                <label className="font-bold text-stone-800 block mb-1">
                  Hangulat & Közösség:
                </label>
                <select
                  value={atmosphereRating}
                  onChange={(e) => setAtmosphereRating(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs bg-stone-50"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Kifejezetten barátságos</option>
                  <option value={4}>⭐⭐⭐⭐ Jó volt</option>
                  <option value={3}>⭐⭐⭐ Átlagos</option>
                  <option value={2}>⭐⭐ Javítható</option>
                </select>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-300">
                <label className="font-bold text-stone-800 block mb-1">
                  Szervezés & Tisztaság:
                </label>
                <select
                  value={organizationRating}
                  onChange={(e) => setOrganizationRating(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs bg-stone-50"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Nagyon rendezett</option>
                  <option value={4}>⭐⭐⭐⭐ Jó szervezés</option>
                  <option value={3}>⭐⭐⭐ Rendben volt</option>
                  <option value={2}>⭐⭐ Zsúfolt volt</option>
                </select>
              </div>
            </div>

            {/* General feedback */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Rövid szöveges vélemény a vásárról *
              </label>
              <textarea
                rows={3}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Mi tetszett a legjobban? Milyen holmikat találtál? Min változtatnál a következő hétvégén?"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>

            {/* Specific seller feedback (Admin only) */}
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-300 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span>Külön vélemény egy konkrét árusról (opcionális):</span>
              </div>
              <p className="text-[10px] text-stone-500">
                Ez kizárólag a szervezőség admin felületére kerül be, a nagyközönség számára láthatatlan.
              </p>
              <textarea
                rows={2}
                value={sellerFeedback}
                onChange={(e) => setSellerFeedback(e.target.value)}
                placeholder="pl. A 12-es asztalnál lévő fotós árus nagyon segítőkész volt... vagy észrevétel egy standról"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs mt-1"
              />
            </div>

            {/* Author nickname (optional) */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Megjelenő név vagy becenév (opcionális)
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="pl. Tamás, Anna vagy Helyi vásárló (üresen hagyva: Anonim látogató)"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>

            {/* Public vs Admin-only radio selection */}
            <div className="p-3.5 bg-white rounded-xl border border-stone-300 space-y-2">
              <label className="block text-xs font-bold text-stone-900">
                Megjelenhet a véleményed nyilvánosan az oldalon? *
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-start gap-2.5 p-2 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
                  <input
                    type="radio"
                    name="publicAllowed"
                    checked={publicAllowed === true}
                    onChange={() => setPublicAllowed(true)}
                    className="mt-0.5 text-[#1A3626] focus:ring-[#1A3626]"
                  />
                  <div>
                    <span className="font-bold text-stone-900 block">
                      Igen, megjelenhet a weboldalon
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Szervezői ellenőrzést és jóváhagyást követően kikerülhet a nyilvános lakossági értékelések közé.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
                  <input
                    type="radio"
                    name="publicAllowed"
                    checked={publicAllowed === false}
                    onChange={() => setPublicAllowed(false)}
                    className="mt-0.5 text-[#1A3626] focus:ring-[#1A3626]"
                  />
                  <div>
                    <span className="font-bold text-stone-900 block">
                      Nem, kizárólag a szervezőknek szóló belső észrevétel
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Soha nem jelenik meg a weboldalon, csak az adminisztrátori felületen olvashatják a szervezők.
                    </span>
                  </div>
                </label>
              </div>
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
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1A3626] hover:bg-[#254834] text-[#FDFBF7] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer border border-[#1A3626]"
              >
                <Send className="w-3.5 h-3.5 text-[#E7C286]" />
                <span>Anonim vélemény beküldése</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
