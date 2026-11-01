import React, { useState } from 'react';
import { LocationData, CommercialType, CommercialVendorBooking } from '../types/market';
import { sendEmailNotification } from '../lib/supabase';
import {
  X,
  Briefcase,
  CheckCircle2,
  Mail,
  Send,
  Building2,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Flame,
  Baby,
} from 'lucide-react';

interface CommercialVendorModalProps {
  isOpen: boolean;
  type: CommercialType;
  locations: LocationData[];
  selectedLocationId: string;
  onClose: () => void;
  onSubmitCommercial: (booking: CommercialVendorBooking) => void;
}

export const CommercialVendorModal: React.FC<CommercialVendorModalProps> = ({
  isOpen,
  type,
  locations,
  selectedLocationId,
  onClose,
  onSubmitCommercial,
}) => {
  if (!isOpen) return null;

  const isGrill = type === 'grill_corner';
  const title = isGrill ? 'Grillsarok és gasztro koncesszió' : 'Gyereksarok vállalkozói koncesszió';
  const suggestedFee = isGrill ? 35000 : 15000;

  const [locationId, setLocationId] = useState(selectedLocationId);
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [programOrMenu, setProgramOrMenu] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !taxNumber.trim() || !billingAddress.trim() || !contactPerson.trim() || !email.trim() || !phone.trim() || !programOrMenu.trim()) {
      setErrorMsg('Kérjük, tölts ki minden kötelező céges és számlázási mezőt!');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('A területbiztosítási és felelősségi feltételek elfogadása kötelező.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const loc = locations.find((l) => l.id === locationId) || locations[0];
    const newVendor: CommercialVendorBooking = {
      id: `comm-${Date.now().toString().slice(-4)}`,
      type,
      locationId: loc.id,
      locationName: loc.name,
      weekendDates: loc.weekendDates,
      companyName,
      taxNumber,
      billingAddress,
      contactPerson,
      email,
      phone,
      programOrMenuOffer: programOrMenu,
      feePaid: suggestedFee,
      status: 'approved',
      createdAt: new Date().toLocaleDateString('hu-HU'),
    };

    const standFrontendText = isGrill
      ? 'Grillsarok és street food kitelepülés (Gasztronómiai zóna, 35 000 Ft díj, áram- és területbiztosítással)'
      : 'Gyereksarok vállalkozói koncesszió (Arcfestés, játszóház, kézműves műhely, 15 000 Ft díj)';
    const locationFrontendText = `${loc.name} (${loc.streetName}) — ${loc.weekendDates}`;

    const readableSummary = `Koncesszió típusa: ${standFrontendText}
Helyszín: ${locationFrontendText}
Cégnév: ${companyName} (Adószám: ${taxNumber})
Számlázási cím: ${billingAddress}
Felelős kapcsolattartó: ${contactPerson}
Elérhetőség: ${email} | ${phone}
Ajánlat / Program / Menü: ${programOrMenu}
Részvételi hozzájárulás: ${suggestedFee.toLocaleString('hu-HU')} Ft
Státusz: Vállalkozói regisztráció befogadva, szervezői jóváhagyásra vár`;

    // Send email notification to ujbudazsibi@gmail.com and the vendor
    await sendEmailNotification({
      to: 'ujbudazsibi@gmail.com',
      subject: `[Újbudazsibi Koncesszió] Új vállalkozói jelentkezés: ${companyName} — ${isGrill ? 'Grillsarok' : 'Gyereksarok'} (${loc.name})`,
      applicantName: contactPerson,
      applicantEmail: email,
      applicantPhone: phone,
      standText: standFrontendText,
      locationText: locationFrontendText,
      categoryText: isGrill ? 'Gasztronómia, Melegétel és Ital' : 'Gyermekprogramok és Kézművesség',
      readableDetails: readableSummary,
      htmlContent: `
        <h3 style="color: #1a3626; font-family: serif;">Új Vállalkozói Koncessziós Jelentkezés</h3>
        <p><strong>Cégnév:</strong> ${companyName} (Adószám: ${taxNumber})</p>
        <p><strong>Számlázási cím:</strong> ${billingAddress}</p>
        <p><strong>Kapcsolattartó:</strong> ${contactPerson} (${phone}, ${email})</p>
        <p><strong>Kijelölt zóna:</strong> ${standFrontendText}</p>
        <p><strong>Helyszín:</strong> ${locationFrontendText}</p>
        <p><strong>Ajánlat / Kínálat:</strong> ${programOrMenu}</p>
        <p><strong>Hozzájárulási díj:</strong> ${suggestedFee.toLocaleString('hu-HU')} Ft</p>
      `,
    });

    onSubmitCommercial(newVendor);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-xl w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${isGrill ? 'bg-orange-700' : 'bg-indigo-700'}`}>
              {isGrill ? <Flame className="w-5 h-5" /> : <Baby className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                {title}
              </h3>
              <p className="text-xs text-stone-600">
                Kizárólag cégek és egyéni vállalkozók részére (8 × 8 méteres kijelölt terület)
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
              Vállalkozói jelentkezés rögzítve!
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Az adatokat továbbítottuk a szervezői postafiókba (<strong>ujbudazsibi@gmail.com</strong>). Hamarosan felvesszük a kapcsolatot a megadott elérhetőségen a számlázással és a helyszíni kitelepülés részleteivel kapcsolatban.
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
            
            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Választott helyszín és hétvége *
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} · {loc.weekendDates} ({loc.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            {/* Company & Billing info */}
            <div className="p-3.5 bg-white border border-stone-300 rounded-xl space-y-3">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-stone-600" />
                <span>Céges és számlázási adatok:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Cégnév vagy Egyéni vállalkozó neve *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="pl. Gasztro Mester Kft."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Adószám *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12345678-2-43"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Számlázási székhely cím *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Irányítószám, Város, Utca, Házszám"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Kapcsolattartó *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kovács Béla"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    E-mail cím *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="iroda@ceg.hu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Telefonszám *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+36 30 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Offer details */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {isGrill
                  ? 'Kínált ételek, italok és kitelepülési technológia (food truck / sátor) *'
                  : 'Kínált foglalkozások, arcfestés, programok listája *'}
              </label>
              <textarea
                rows={3}
                required
                value={programOrMenu}
                onChange={(e) => setProgramOrMenu(e.target.value)}
                placeholder={
                  isGrill
                    ? 'pl. Rostonsült grillkolbászok, vegán ételek, specialty kávé, saját hűtőkocsival települünk ki'
                    : 'pl. Ingyenes arcfestés, ugróiskola, kézműves foglalkozások, baba-mama kényelmi sarok'
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>

            {/* Explicit rules agreement */}
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-950">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-amber-700 focus:ring-amber-600 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold block">
                    Tudomásul veszem a vállalkozói kitelepülés feltételeit *
                  </span>
                  <ul className="list-disc pl-4 mt-1 text-[11px] space-y-1 text-amber-900 leading-normal">
                    <li>
                      A szervezők kb. <strong>8 × 8 méteres kijelölt területet</strong> biztosítanak a lezárt utcán, de <strong>asztalt és széket NEM adnak</strong>, a vállalkozó a kitelepülést és berendezést maga oldja meg.
                    </li>
                    <li>
                      <strong>Fizetéskezelés:</strong> a vállalkozó / grilles a vendégek fizetését (POS terminál, készpénz) önállóan oldja meg, arra a vásár szervezőjének nincs ráhatása és felelőssége.
                    </li>
                    <li>
                      <strong>Menetrend:</strong> kipakolás 08:00 – 09:00, nyitvatartás 09:00 – 17:00, elpakolás 17:00 – 18:00.
                    </li>
                    <li>
                      <strong>Hétvégi koncessziós díj:</strong> {suggestedFee.toLocaleString()} Ft / hétvége.
                    </li>
                  </ul>
                </div>
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
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer ${
                  isGrill ? 'bg-[#C88A36] hover:bg-[#A96E22]' : 'bg-[#1A3626] hover:bg-[#254834]'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Vállalkozói foglalás beküldése</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
