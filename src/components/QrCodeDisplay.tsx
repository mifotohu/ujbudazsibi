import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon } from 'lucide-react';

interface QrCodeDisplayProps {
  bookingId: string;
  tableId: number | string;
  sellerName?: string;
  locationName?: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  postalCode?: string;
  weekendDates?: string;
  totalPaid?: number | string;
  categories?: string[];
  itemsDescription?: string;
  size?: number; // rendered size in pixels, e.g. 100, 112, 128
  className?: string;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  bookingId,
  tableId,
  sellerName = '',
  locationName = '',
  email = '',
  phone = '',
  streetAddress = '',
  postalCode = '',
  weekendDates = '',
  totalPaid = '',
  categories = [],
  itemsDescription = '',
  size = 112,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  // Standard web verification URL that any phone camera (iOS, Android, Brave, Google Lens) instantly opens
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://www.ujbudazsibi.hu';

  const params = new URLSearchParams({
    id: String(bookingId || ''),
    stand: String(tableId || ''),
    nev: String(sellerName || ''),
    email: String(email || ''),
    tel: String(phone || ''),
    cim: String(streetAddress || ''),
    irsz: String(postalCode || ''),
    hely: String(locationName || ''),
    datum: String(weekendDates || ''),
    ar: String(totalPaid || ''),
    kat: Array.isArray(categories) ? categories.join(', ') : String(categories || ''),
    leiras: String(itemsDescription || ''),
  });

  const verificationUrl = `${origin}/#verify?${params.toString()}`;

  useEffect(() => {
    let isMounted = true;

    // Generate crisp 2x resolution for retina and mobile displays
    QRCode.toDataURL(verificationUrl, {
      width: Math.max(size * 2, 240),
      margin: 1,
      color: {
        dark: '#14261B', // Deep vintage forest green / black
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setHasError(false);
        }
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
        if (isMounted) setHasError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [verificationUrl, size]);

  if (hasError || (!dataUrl && !bookingId)) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex flex-col items-center justify-center bg-stone-100 rounded-lg text-stone-400 p-2 ${className}`}
      >
        <QrIcon className="w-8 h-8 text-stone-500" />
        <span className="text-[9px] font-mono mt-1 text-center font-bold text-stone-600">
          #{tableId}
        </span>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex flex-col items-center justify-center bg-white rounded-lg p-2 border border-stone-200 animate-pulse ${className}`}
      >
        <QrIcon className="w-8 h-8 text-emerald-800 animate-spin" />
        <span className="text-[9px] font-mono text-stone-400 mt-1">QR...</span>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <img
        src={dataUrl}
        alt={`Hivatalos QR kód - Stand #${tableId} (${bookingId})`}
        style={{ width: size, height: size }}
        className="object-contain rounded-md bg-white p-1 border border-stone-300 shadow-2xs"
        loading="eager"
      />
    </div>
  );
};
