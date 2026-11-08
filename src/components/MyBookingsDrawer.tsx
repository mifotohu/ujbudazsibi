import React, { useState } from 'react';
import { ConfirmedBooking } from '../types/market';
import { CATEGORIES } from '../data/mockData';
import {
  X,
  Ticket,
  QrCode,
  Printer,
  FileDown,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

import { QrCodeDisplay } from './QrCodeDisplay';
import { printPassElement, downloadPassAsPdf } from '../utils/printPass';

interface MyBookingsDrawerProps {
  isOpen: boolean;
  bookings: ConfirmedBooking[];
  onClose: () => void;
  onStartNewBooking: () => void;
}

export const MyBookingsDrawer: React.FC<MyBookingsDrawerProps> = ({
  isOpen,
  bookings,
  onClose,
  onStartNewBooking,
}) => {
  if (!isOpen) return null;

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadSinglePdf = async (bookingId: string) => {
    setDownloadingId(bookingId);
    await downloadPassAsPdf(`my-pass-${bookingId}`, bookingId);
    setDownloadingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-stone-950/65 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header - Sentence Case */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#F4EFE6]">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-800" />
            <h3 className="font-extrabold text-stone-900 text-base">
              Saját standjegyeim ({bookings.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of bookings */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Cache warning alert */}
          {bookings.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-900 block">
                  Fontos: A jegyek a böngésződ helyi gyorsítótárában (cache) tárolódnak!
                </span>
                <p className="text-[11px] text-amber-900/90 leading-tight">
                  Amennyiben üríted a böngészési előzményeket vagy a gyorsítótárat (cache), a visszajelzés eltűnhet.
                </p>
                <p className="text-[11px] font-semibold text-amber-950">
                  👉 <strong>Kérjük, mentsd le a PDF jegyedet vagy nyomtasd ki</strong>, mert a helyszínen ezt kell majd bemutatnod!
                </p>
              </div>
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                <Ticket className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-800 text-sm">
                Még nincs lefoglalt asztalod
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Válassz egy szabad zöld asztalt az utcatérképen, és foglald le mindössze 2 perc alatt!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onStartNewBooking();
                }}
                className="mt-2 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer transition-colors"
              >
                Szabad asztalok megtekintése
              </button>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.bookingId}
                id={`my-pass-${b.bookingId}`}
                className="border-2 border-emerald-800 rounded-2xl p-4 bg-white space-y-3 shadow-2xs relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Érvényes árusi engedély
                    </span>
                    <h4 className="text-xl font-black text-stone-900">
                      STAND #{b.tableId}
                    </h4>
                    <p className="text-xs font-semibold text-stone-700 mt-0.5 truncate">
                      {b.locationName}
                    </p>
                  </div>
                  <div className="bg-[#FAF7F2] p-1.5 rounded-xl border border-stone-200 flex flex-col items-center shrink-0">
                    <QrCodeDisplay
                      bookingId={b.bookingId}
                      tableId={b.tableId}
                      sellerName={b.sellerName}
                      locationName={b.locationName}
                      size={72}
                    />
                    <span className="text-[9px] font-mono font-bold text-stone-600 mt-1">
                      {b.bookingId}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-stone-600 space-y-1 pt-2 border-t border-stone-200">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{b.weekendDates}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Kipakolás: 07:30 – 08:45 · Zárás: 18:30</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span className="truncate">{b.streetName}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    Árus: <strong className="text-stone-900">{b.sellerName}</strong>
                  </span>
                  <span className="font-mono font-bold text-emerald-900 tabular-nums">
                    {b.totalPaid.toLocaleString()} Ft (Fizetve)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={downloadingId === b.bookingId}
                    onClick={() => handleDownloadSinglePdf(b.bookingId)}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-[#FAF7F2] hover:bg-[#EAE4D7] border border-stone-300 rounded-xl text-xs font-bold text-stone-800 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-800" />
                    <span>{downloadingId === b.bookingId ? 'Mentés...' : 'PDF mentése'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => printPassElement(`my-pass-${b.bookingId}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-[#FAF7F2] hover:bg-[#EAE4D7] border border-stone-300 rounded-xl text-xs font-bold text-stone-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Nyomtatás</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4EFE6] border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-600">
            A standjegyet a helyszíni bejáratnál kell felmutatni
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer"
          >
            Bezárás
          </button>
        </div>

      </div>
    </div>
  );
};
