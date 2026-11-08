import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { TableData, LocationData, BookingFormState, ConfirmedBooking } from '../types/market';
import { CATEGORIES } from '../data/mockData';
import { sendEmailNotification } from '../lib/supabase';
import { QrCodeDisplay } from './QrCodeDisplay';
import { printPassDirect, downloadPassAsPdfDirect, buildVerificationUrl } from '../utils/printPass';
import {
  X,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  QrCode,
  Printer,
  FileDown,
  Ticket,
  Sparkles,
  ShieldCheck,
  Tag,
  Mail,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  table: TableData | null;
  location: LocationData;
  onClose: () => void;
  onConfirmBooking: (booking: ConfirmedBooking) => void;
  onOpenMyBookings?: () => void;
}

const DISTRICT_XI_POSTAL_CODES = ['1111', '1112', '1113', '1114', '1115', '1116', '1117', '1118', '1119'];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  table,
  location,
  onClose,
  onConfirmBooking,
  onOpenMyBookings,
}) => {
  if (!isOpen || !table) return null;

  const [step, setStep] = useState<'details' | 'categories' | 'payment' | 'success'>('details');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [formData, setFormData] = useState<BookingFormState>({
    fullName: '',
    email: '',
    phone: '',
    postalCode: location.postalCodes[0] || '1111',
    streetAddress: '',
    isDistrictResident: true,
    categories: [],
    itemsDescription: '',
    agreedRules: false,
    agreedGdpr: false,
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '08/28',
    cardCvc: '123',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedData, setConfirmedData] = useState<ConfirmedBooking | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check neighborhood vs general district XI residence
  const isDistrictXi = DISTRICT_XI_POSTAL_CODES.includes(formData.postalCode.trim());
  const isLocalNeighborhood = isDistrictXi && location.postalCodes.includes(formData.postalCode.trim());

  // Pricing:
  // 4 050 Ft for local neighborhood residents (-10%)
  // 4 500 Ft for other XI. district residents
  const finalPrice = isLocalNeighborhood ? 4050 : 4500;

  const handleCategoryToggle = (catId: string) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(catId);
      if (exists) {
        return { ...prev, categories: prev.categories.filter((c) => c !== catId) };
      } else {
        return { ...prev, categories: [...prev.categories, catId] };
      }
    });
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Kérjük, add meg a teljes neved!';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Kérjük, érvényes e-mail címet adj meg!';
    }
    if (!formData.phone.trim()) errs.phone = 'Kérjük, add meg a telefonszámod!';
    if (!formData.postalCode.trim() || !isDistrictXi) {
      errs.postalCode = 'Csak XI. kerületi (1111–1119) lakosok jelentkezhetnek árusként!';
    }
    if (!formData.streetAddress.trim()) {
      errs.streetAddress = 'Kérjük, add meg az újbudai lakcímed (utca, házszám)!';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (formData.categories.length === 0) {
      errs.categories = 'Kérjük, válassz legalább egy árusítási kategóriát!';
    }
    if (!formData.itemsDescription.trim()) {
      errs.itemsDescription = 'Írj pár szót arról, milyen holmikat hozol!';
    }
    if (!formData.agreedRules) {
      errs.agreedRules = 'A 250×100 cm méretezési szabályzat és a 8 napos lemondási határidő elfogadása kötelező.';
    }
    if (!formData.agreedGdpr) {
      errs.agreedGdpr = 'A harmadik feleknek történő adatátadási és adatkezelési nyilatkozat elfogadása kötelező.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateStep2()) {
      setStep('payment');
    }
  };

  const handlePayNow = async () => {
    setIsProcessing(true);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const bookingCode = `UJB-${location.id.toUpperCase()}-${table.id < 10 ? '0' + table.id : table.id}-${randomSuffix}`;
    
    const newBooking: ConfirmedBooking = {
      bookingId: bookingCode,
      tableId: table.id,
      locationId: location.id,
      locationName: location.name,
      streetName: location.streetName,
      weekendDates: location.weekendDates,
      eventDateIso: location.eventDateIso,
      sellerName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      postalCode: formData.postalCode,
      streetAddress: formData.streetAddress,
      isImmediateNeighbor: isLocalNeighborhood,
      categories: formData.categories,
      itemsDescription: formData.itemsDescription,
      totalPaid: finalPrice,
      createdAt: new Date().toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      qrCodeData: `https://www.ujbudazsibi.hu/verify/${bookingCode}`,
    };

    // Detailed front-end visible descriptions
    const standFrontendText = `Stand #${table.id} (${table.side === 'north' ? 'Északi utcafront' : 'Déli utcafront'} · 250×100 cm asztalfelület és pakolótér)`;
    const locationFrontendText = `${location.name} (${location.streetName}) — ${location.weekendDates} (${location.dateBadge})`;
    const categoryNames = formData.categories
      .map((cId) => CATEGORIES.find((c) => c.id === cId)?.label || cId)
      .join(', ');
    const priceFrontendText = `${finalPrice.toLocaleString('hu-HU')} Ft (${isLocalNeighborhood ? '10% Helyi kerületrészi lakossági kedvezménnyel' : 'XI. kerületi lakossági alapár'})`;

    const readableSummary = `Stand száma & elhelyezkedése: ${standFrontendText}
Helyszín: ${locationFrontendText}
Árus neve: ${formData.fullName}
E-mail cím: ${formData.email}
Telefonszám: ${formData.phone}
Újbudai lakcím: ${formData.postalCode} Budapest, ${formData.streetAddress}
Kínált kategóriák: ${categoryNames}
Árusított portékák leírása: ${formData.itemsDescription}
Részvételi díj: ${priceFrontendText} — Online bankkártyával sikeresen kiegyenlítve
Foglalási kód: ${bookingCode}
Lemondási szabályzat: Vásár előtt legkésőbb 8 nappal mondható le díjmentesen az ujbudazsibi@gmail.com címen.`;

    // Dispatch notification to ujbudazsibi@gmail.com and the applicant
    await sendEmailNotification({
      to: 'ujbudazsibi@gmail.com',
      subject: `[Újbudazsibi] Új asztalfoglalás: Stand #${table.id} — ${formData.fullName} (${location.name})`,
      applicantName: formData.fullName,
      applicantEmail: formData.email,
      applicantPhone: formData.phone,
      standText: standFrontendText,
      locationText: locationFrontendText,
      categoryText: categoryNames,
      readableDetails: readableSummary,
      htmlContent: `
        <h2 style="color: #1a3626; font-family: serif;">Újbudazsibi Lakossági Standfoglalás Értesítés</h2>
        <p><strong>Stand megnevezése:</strong> ${standFrontendText}</p>
        <p><strong>Helyszín:</strong> ${locationFrontendText}</p>
        <p><strong>Árus neve:</strong> ${formData.fullName}</p>
        <p><strong>Elérhetőség:</strong> ${formData.email} | ${formData.phone}</p>
        <p><strong>Újbudai lakcím:</strong> ${formData.postalCode} Budapest, ${formData.streetAddress}</p>
        <p><strong>Kategóriák:</strong> ${categoryNames}</p>
        <p><strong>Árusított cikkek:</strong> ${formData.itemsDescription}</p>
        <p><strong>Befizetett összeg:</strong> ${priceFrontendText}</p>
        <p><strong>Foglalási azonosító:</strong> ${bookingCode}</p>
        <p style="color: #854d0e; font-size: 13px;"><em>Lemondási szabály: vásár előtt legkésőbb 8 nappal mondható le.</em></p>
      `,
    });

    setConfirmedData(newBooking);
    onConfirmBooking(newBooking);
    setIsProcessing(false);
    setStep('success');
  };

  // Generate genuine high-contrast QR code readable by any smartphone camera
  useEffect(() => {
    if (step === 'success' && confirmedData) {
      const qrPayload = buildVerificationUrl({
        bookingId: confirmedData.bookingId,
        tableId: confirmedData.tableId,
        sellerName: confirmedData.sellerName,
        email: confirmedData.email,
        phone: confirmedData.phone,
        streetAddress: confirmedData.streetAddress,
        postalCode: confirmedData.postalCode,
        locationName: confirmedData.locationName,
        streetName: confirmedData.streetName,
        weekendDates: confirmedData.weekendDates,
        totalPaid: confirmedData.totalPaid,
        categories: confirmedData.categories,
        itemsDescription: confirmedData.itemsDescription,
      });

      QRCode.toDataURL(qrPayload, {
        width: 280,
        margin: 1,
        color: {
          dark: '#14261B',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error('QR kód generálási hiba:', err);
        });
    }
  }, [step, confirmedData]);

  const handleDownloadPdf = async () => {
    if (!confirmedData) return;
    setIsDownloadingPdf(true);
    await downloadPassAsPdfDirect({
      bookingId: confirmedData.bookingId,
      tableId: confirmedData.tableId,
      sellerName: confirmedData.sellerName,
      email: confirmedData.email,
      phone: confirmedData.phone,
      streetAddress: confirmedData.streetAddress,
      postalCode: confirmedData.postalCode,
      locationName: confirmedData.locationName,
      streetName: confirmedData.streetName,
      weekendDates: confirmedData.weekendDates,
      totalPaid: confirmedData.totalPaid,
      categories: confirmedData.categories,
      itemsDescription: confirmedData.itemsDescription,
    });
    setIsDownloadingPdf(false);
  };

  const handlePrint = () => {
    if (!confirmedData) return;
    printPassDirect({
      bookingId: confirmedData.bookingId,
      tableId: confirmedData.tableId,
      sellerName: confirmedData.sellerName,
      email: confirmedData.email,
      phone: confirmedData.phone,
      streetAddress: confirmedData.streetAddress,
      postalCode: confirmedData.postalCode,
      locationName: confirmedData.locationName,
      streetName: confirmedData.streetName,
      weekendDates: confirmedData.weekendDates,
      totalPaid: confirmedData.totalPaid,
      categories: confirmedData.categories,
      itemsDescription: confirmedData.itemsDescription,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-xl w-full border border-stone-300 shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#D8CEBD] bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-2.5 py-1 bg-[#1A3626] text-[#E7C286] font-serif rounded tabular-nums border border-[#C88A36]/30">
              Stand #{table.id}
            </span>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight font-serif">
                {step === 'success' ? 'Sikeres standfoglalás' : 'Újbudazsibi asztalfoglalás'}
              </h3>
              <p className="text-xs text-stone-600">
                {location.name} · {location.dateBadge}
              </p>
            </div>
          </div>
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="px-5 sm:px-6 pt-3 pb-2 bg-[#F4EFE6] border-b border-[#D8CEBD] flex items-center justify-between text-xs text-stone-600">
            <div className={`flex items-center gap-1.5 ${step === 'details' ? 'font-bold text-[#1A3626]' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 'details' ? 'bg-[#1A3626] text-[#E7C286] font-serif font-bold' : 'bg-stone-200 text-stone-600'}`}>
                1
              </span>
              <span>Lakcím & kapcsolat</span>
            </div>
            <div className="h-px w-6 sm:w-8 bg-stone-300"></div>
            <div className={`flex items-center gap-1.5 ${step === 'categories' ? 'font-bold text-[#1A3626]' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 'categories' ? 'bg-[#1A3626] text-[#E7C286] font-serif font-bold' : 'bg-stone-200 text-stone-600'}`}>
                2
              </span>
              <span>Kínálat & szabályzat</span>
            </div>
            <div className="h-px w-6 sm:w-8 bg-stone-300"></div>
            <div className={`flex items-center gap-1.5 ${step === 'payment' ? 'font-bold text-[#1A3626]' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 'payment' ? 'bg-[#1A3626] text-[#E7C286] font-serif font-bold' : 'bg-stone-200 text-stone-600'}`}>
                3
              </span>
              <span>Fizetés</span>
            </div>
          </div>
        )}

        {/* Step 1: Contact & Automated Address Check */}
        {step === 'details' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Teljes név *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="pl. Kovács Katalin"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm text-stone-900"
              />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  E-mail cím *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="pelda@email.hu"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm text-stone-900"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Telefonszám *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+36 30 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm text-stone-900"
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* AUTOMATED DISTRICT XI RESIDENCY VERIFICATION */}
            <div className="p-3.5 bg-white border border-stone-300 rounded-xl space-y-3">
              <span className="text-xs font-bold text-stone-900 block">
                Újbudai lakcím megadása (kizárólag kerületi lakosoknak):
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Irányítószám *
                  </label>
                  <select
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-stone-50 font-mono text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {DISTRICT_XI_POSTAL_CODES.map((code) => (
                      <option key={code} value={code}>
                        {code} (XI. kerület)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Utca, házszám, emelet/ajtó *
                  </label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    placeholder="pl. Bartók Béla út 32. 2/4."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {errors.postalCode && <p className="text-xs text-red-600">{errors.postalCode}</p>}
              {errors.streetAddress && <p className="text-xs text-red-600">{errors.streetAddress}</p>}

              {/* AUTOMATED PRICE FEEDBACK */}
              <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                isLocalNeighborhood ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}>
                <div>
                  <span className="font-bold block">
                    {isLocalNeighborhood
                      ? `Helyi lakos kedvezmény érvényesítve (${location.neighborhood})!`
                      : `XI. kerületi lakos alapdíj`}
                  </span>
                  <span className="text-[11px] text-stone-600">
                    {isLocalNeighborhood
                      ? 'Az esemény közvetlen környékén élsz, így megkapod a 10% kedvezményt.'
                      : 'Kerületi lakosként az alapdíj érvényes.'}
                  </span>
                </div>
                <div className="text-right font-mono font-bold text-sm">
                  {finalPrice.toLocaleString()} Ft
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
              >
                Mégse
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep('categories');
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#14261B] bg-[#C88A36] hover:bg-[#A96E22] hover:text-white rounded-xl shadow-xs transition-colors cursor-pointer border border-[#A96E22]"
              >
                <span>Tovább a kínálat megadásához</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Categories, 250x100cm rules & GDPR agreement */}
        {step === 'categories' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Milyen kategóriájú holmikat fogsz árulni? *
                </label>
                <span className="text-[11px] text-stone-500">Több is választható</span>
              </div>
              <p className="text-xs text-stone-600 mb-2">
                A vásárlók az utcatérképen látni fogják, milyen kategóriákat jelöltél be.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const isChecked = formData.categories.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={`text-left p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-700 ring-1 ring-emerald-700'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${isChecked ? 'bg-emerald-800 border-emerald-800 text-white' : 'border-stone-300 bg-white'}`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-900 block leading-tight">
                          {cat.label}
                        </span>
                        <span className="text-[10px] text-stone-500 block mt-0.5 line-clamp-1">
                          {cat.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.categories && <p className="text-xs text-red-600 mt-1">{errors.categories}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Rövid leírás a portékádról *
              </label>
              <textarea
                rows={2}
                value={formData.itemsDescription}
                onChange={(e) => setFormData({ ...formData, itemsDescription: e.target.value })}
                placeholder="pl. Gyerekruhák és fa játékok, régi bakelitlemezek, könyvek, kerámia kaspók"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs"
              />
              {errors.itemsDescription && <p className="text-xs text-red-600 mt-1">{errors.itemsDescription}</p>}
            </div>

            {/* Rules agreement: 250x100cm area & 8-day cancellation */}
            <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedRules}
                  onChange={(e) => setFormData({ ...formData, agreedRules: e.target.checked })}
                  className="mt-0.5 rounded text-amber-700 focus:ring-amber-600 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs text-amber-950">
                  <span className="font-bold block">
                    Tudomásul veszem a 250×100 cm-es standméretet és a 8 napos lemondási határidőt *
                  </span>
                  <span className="block mt-0.5 text-[11px] leading-relaxed text-amber-900">
                    • 120×80 cm biztosított fa asztal + 65-65 cm oldalsó pakolótér. <strong>A vásárlói sétányba előre pakolni tilos!</strong><br />
                    • <strong>Lemondás:</strong> legkésőbb a vásár előtt 8 nappal lehetséges, utána a rendszer nem engedi törölni.
                  </span>
                </div>
              </label>
              {errors.agreedRules && <p className="text-xs text-red-600">{errors.agreedRules}</p>}
            </div>

            {/* MANDATORY GDPR & 3RD PARTY TRANSFER CHECKBOX */}
            <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedGdpr}
                  onChange={(e) => setFormData({ ...formData, agreedGdpr: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs text-stone-800">
                  <span className="font-bold block">
                    Adatkezelési nyilatkozat és harmadik feleknek történő adattovábbítás elfogadása *
                  </span>
                  <span className="block mt-0.5 text-[10px] leading-relaxed text-stone-600">
                    Tudomásul veszem, hogy a regisztráció és fizetés során megadott adataim a hatályos számviteli törvény és a GDPR (EU 2016/679) szerint továbbításra kerülnek a fizetési szolgáltató (Stripe), a számlázó rendszer és a könyvelő részére.
                  </span>
                </div>
              </label>
              {errors.agreedGdpr && <p className="text-xs text-red-600">{errors.agreedGdpr}</p>}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Vissza</span>
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#14261B] bg-[#C88A36] hover:bg-[#A96E22] hover:text-white rounded-xl shadow-xs transition-colors cursor-pointer border border-[#A96E22]"
              >
                <span>Tovább a fizetéshez</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Card payment */}
        {step === 'payment' && (
          <div className="p-5 sm:p-6 space-y-4">
            
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Stand bérlet (#{table.id} asztal · 250×100 cm)</span>
                <span className="font-mono tabular-nums font-semibold">{finalPrice.toLocaleString()} Ft</span>
              </div>
              <div className="flex items-center justify-between text-emerald-800 font-semibold">
                <span>{isLocalNeighborhood ? 'Helyi lakos kedvezmény (-10%)' : 'XI. kerületi lakossági alapdíj'}</span>
                <span className="font-mono tabular-nums">{formData.postalCode} Budapest</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm font-bold text-stone-900">
                <span>Fizetendő összeg:</span>
                <span className="font-mono text-base text-emerald-900 tabular-nums font-bold">
                  {finalPrice.toLocaleString()} Ft
                </span>
              </div>
            </div>

            {/* Email dispatch notice to ujbudazsibi@gmail.com */}
            <div className="p-3 bg-[#F4EFE6] rounded-xl text-[11px] text-stone-700 flex items-center gap-2 border border-stone-200">
              <Mail className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>
                A foglalásról automatikus visszaigazolást kap az árus (<strong>{formData.email}</strong>) és a szervezőség (<strong>ujbudazsibi@gmail.com</strong>).
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Bankkártyaszám
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-stone-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Lejárat
                  </label>
                  <input
                    type="text"
                    value={formData.cardExpiry}
                    onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-mono text-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    CVC
                  </label>
                  <input
                    type="password"
                    maxLength={3}
                    value={formData.cardCvc}
                    onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-mono text-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('categories')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Vissza</span>
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePayNow}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-[#14261B] bg-[#C88A36] hover:bg-[#A96E22] hover:text-white disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer border border-[#A96E22]"
              >
                {isProcessing ? (
                  <span>Fizetés feldolgozása...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-[#14261B]" />
                    <span>Fizetés és lefoglalás ({finalPrice.toLocaleString()} Ft)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Digital Pass (Exact UX from Screenshot) */}
        {step === 'success' && confirmedData && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="text-center no-print pt-1">
              <div className="w-14 h-14 bg-[#D1FAE5] text-[#059669] rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-[#059669]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
                Sikeres asztalfoglalás és fizetés!
              </h3>
            </div>

            {/* Official Pass - Exact Card UX with emerald rounded border */}
            <div
              id="printable-pass"
              className="bg-white border-2 border-[#15803D] rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-sm relative"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[#15803D] font-extrabold text-[11px] tracking-wider uppercase font-sans leading-tight">
                    ÚJBUDAZSIBI · HIVATALOS ÁRUSI
                    <span className="block">ENGEDÉLY</span>
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif tracking-tight mt-1">
                    STAND #{confirmedData.tableId}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-stone-700 mt-0.5">
                    {confirmedData.locationName}
                  </p>
                </div>

                {/* Genuine Scannable QR Code */}
                <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-stone-200 flex flex-col items-center shrink-0">
                  <QrCodeDisplay
                    bookingId={confirmedData.bookingId}
                    tableId={confirmedData.tableId}
                    sellerName={confirmedData.sellerName}
                    locationName={confirmedData.locationName}
                    email={confirmedData.email}
                    phone={confirmedData.phone}
                    streetAddress={confirmedData.streetAddress}
                    postalCode={confirmedData.postalCode}
                    weekendDates={confirmedData.weekendDates}
                    totalPaid={confirmedData.totalPaid}
                    categories={confirmedData.categories}
                    itemsDescription={confirmedData.itemsDescription}
                    size={84}
                  />
                  <span className="text-[9px] font-mono font-semibold text-stone-500 mt-1 tracking-tight">
                    {confirmedData.bookingId}
                  </span>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs pt-3 border-t border-stone-200">
                <div>
                  <span className="text-[11px] text-stone-400 block">Árus neve:</span>
                  <span className="font-bold text-stone-900 text-sm font-sans block">{confirmedData.sellerName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">Időpont:</span>
                  <span className="font-semibold text-stone-900 text-xs sm:text-sm block">{confirmedData.weekendDates}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] text-stone-400 block">Helyszín:</span>
                  <span className="text-stone-800 text-xs font-medium block">{confirmedData.streetName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] text-stone-400 block">Stand terület:</span>
                  <span className="text-stone-900 text-xs font-bold block">250 × 100 cm (120×80 cm asztal + 65–65 cm oldalsó pakolás)</span>
                </div>
              </div>

              {/* Price & Status */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="text-stone-600 text-xs font-medium">Kifizetett díj:</span>
                <span className="font-mono text-[#15803D] font-bold text-base sm:text-lg tabular-nums">
                  {confirmedData.totalPaid.toLocaleString('hu-HU')} Ft (Rendezve)
                </span>
              </div>
            </div>

            {/* Cache warning & print notice */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs no-print text-left">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-snug space-y-1">
                <span className="font-bold text-amber-900 block">
                  Fontos tudnivaló a böngésző gyorsítótárról (cache):
                </span>
                <p className="text-[11px] sm:text-xs text-amber-900/90 font-normal">
                  A foglalási kártyád a böngésződ helyi memóriájában tárolódik. Amennyiben törlöd a böngészési előzményeket vagy a gyorsítótárat (cache), a visszajelzés eltűnhet.
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-amber-950">
                  👉 <strong>Kérjük, nyomtasd ki vagy mentsd le a PDF jegyet most</strong>, mert ezt a belépőkártyát (a rajta lévő QR kóddal) a helyszínen a stand elfoglalásakor fel kell majd mutatnod!
                </p>
              </div>
            </div>

            {/* Actions: Full-width stacked buttons exactly as in screenshot + dedicated PDF file save */}
            <div className="space-y-2.5 pt-1 no-print">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isDownloadingPdf}
                  onClick={handleDownloadPdf}
                  className="w-full py-3 bg-[#EFE8DA] hover:bg-[#E5DAC6] text-stone-900 font-bold rounded-2xl text-xs sm:text-sm border border-[#D5C7AF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs font-sans disabled:opacity-50"
                  title="Valódi letölthető PDF jegy mentése a készülékedre"
                >
                  <FileDown className="w-4 h-4 text-stone-700" />
                  <span>{isDownloadingPdf ? 'Mentés...' : 'PDF mentése'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-3 bg-[#EFE8DA] hover:bg-[#E5DAC6] text-stone-900 font-bold rounded-2xl text-xs sm:text-sm border border-[#D5C7AF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs font-sans"
                  title="1 oldalas szigorú A4-es nyomtatás"
                >
                  <Printer className="w-4 h-4 text-stone-700" />
                  <span>Nyomtatás</span>
                </button>
              </div>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs font-sans"
              >
                Vissza a vásártérképhez
              </button>

              {onOpenMyBookings && (
                <button
                  type="button"
                  onClick={onOpenMyBookings}
                  className="w-full py-2 text-stone-700 hover:text-[#1A3626] font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5 text-[#C88A36]" />
                  <span>Standjegy megtekintése a jobb felső Foglalásaim fiókban →</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
