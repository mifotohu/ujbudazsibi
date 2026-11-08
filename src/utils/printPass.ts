import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface PassPrintData {
  bookingId: string;
  tableId: number | string;
  sellerName: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  postalCode?: string;
  locationName: string;
  streetName: string;
  weekendDates: string;
  totalPaid: number | string;
  categories?: string[];
  itemsDescription?: string;
  qrPayloadUrl?: string;
}

/**
 * Builds the canonical QR verification URL containing all registration data.
 */
export function buildVerificationUrl(data: PassPrintData): string {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://www.ujbudazsibi.hu';

  const params = new URLSearchParams({
    id: String(data.bookingId || ''),
    stand: String(data.tableId || ''),
    nev: String(data.sellerName || ''),
    email: String(data.email || ''),
    tel: String(data.phone || ''),
    cim: String(data.streetAddress || ''),
    irsz: String(data.postalCode || ''),
    hely: String(data.locationName || ''),
    utca: String(data.streetName || ''),
    datum: String(data.weekendDates || ''),
    ar: String(data.totalPaid || ''),
    kat: Array.isArray(data.categories) ? data.categories.join(', ') : String(data.categories || ''),
    leiras: String(data.itemsDescription || ''),
  });

  return `${origin}/#verify?${params.toString()}`;
}

/**
 * Generates an off-screen DOM element, preloads all images (including the QR code),
 * and uses html2canvas to capture a clean high-resolution canvas.
 */
export async function captureOffscreenPassCanvas(data: PassPrintData): Promise<{
  canvas: HTMLCanvasElement;
  dataUrl: string;
}> {
  const verifyUrl = data.qrPayloadUrl || buildVerificationUrl(data);

  // 1. Generate QR Code image as high-res PNG
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 280,
    margin: 1,
    color: {
      dark: '#14261B',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });

  // 2. Create dedicated hidden off-screen container in DOM
  const offscreenContainer = document.createElement('div');
  offscreenContainer.id = 'offscreen-pass-capture-node';
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.left = '-10000px';
  offscreenContainer.style.top = '0';
  offscreenContainer.style.width = '760px';
  offscreenContainer.style.minHeight = '1020px';
  offscreenContainer.style.background = '#FFFFFF';
  offscreenContainer.style.zIndex = '-9999';
  offscreenContainer.style.opacity = '1';
  offscreenContainer.style.visibility = 'visible';
  offscreenContainer.style.pointerEvents = 'none';

  const catText = Array.isArray(data.categories) && data.categories.length > 0
    ? data.categories.join(' · ')
    : 'Lakossági használt cikkek és retró tárgyak';

  const descText = data.itemsDescription || 'Gondosan válogatott vintage és használt holmik';

  const addressText = data.postalCode || data.streetAddress
    ? `${data.postalCode || ''} Budapest, ${data.streetAddress || ''}`.trim()
    : 'Budapest Főváros XI. kerületi lakos';

  // 3. Render pure standalone HTML with inline standard CSS (no oklch or external Tailwind runtime)
  offscreenContainer.innerHTML = `
    <div style="width: 760px; background: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; box-sizing: border-box; padding: 24px;">
      
      <div style="border: 3px solid #15803D; border-radius: 20px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        
        <!-- Top Green Banner Header -->
        <div style="background: #1A3626; color: #E7C286; padding: 18px 24px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #E7C286; margin-bottom: 4px;">
            Budapest Főváros XI. Kerület Újbuda Önkormányzata
          </div>
          <h1 style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px; margin: 0; color: #FFFFFF; font-family: Georgia, serif;">
            ÚJBUDAZSIBI · HIVATALOS ÁRUSI ENGEDÉLY
          </h1>
          <div style="font-size: 12px; color: #D5E4D8; margin-top: 4px;">
            2026. Májusi Hétvégi Közösségi Bolhapiac és Zsibvásár
          </div>
        </div>

        <div style="padding: 26px 28px;">
          
          <!-- Stand & QR Code Hero Row -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 2px solid #EAE3D5; padding-bottom: 20px; margin-bottom: 20px;">
            <div style="flex: 1;">
              <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #15803D; display: block;">
                Lefoglalt Árusítóhely
              </span>
              <div style="font-size: 38px; font-weight: 900; color: #1A3626; line-height: 1.1; margin-top: 2px; font-family: Georgia, serif;">
                STAND #${data.tableId}
              </div>
              <div style="font-size: 17px; font-weight: 800; color: #262626; margin-top: 6px;">
                ${data.locationName}
              </div>
              <div style="font-size: 13px; color: #666666; margin-top: 3px;">
                ${data.streetName}
              </div>
            </div>

            <!-- Preloaded QR Code Block -->
            <div style="background: #FAF7F2; border: 1.5px solid #D5C7AF; border-radius: 14px; padding: 10px; text-align: center; flex-shrink: 0; width: 144px;">
              <img id="offscreen-qr-target" src="${qrDataUrl}" width="124" height="124" style="display: block; margin: 0 auto; border-radius: 8px; background: #ffffff;" alt="QR" />
              <div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #333333; margin-top: 6px; letter-spacing: 0.5px;">
                ${data.bookingId}
              </div>
            </div>
          </div>

          <!-- Registration Details Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; font-size: 13px;">
            
            <div style="background: #FAF8F5; border: 1px solid #EBE4D8; border-radius: 10px; padding: 10px 14px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #78716C; display: block; margin-bottom: 2px;">
                Árus Teljes Neve
              </span>
              <strong style="font-size: 15px; color: #1C1917; font-family: Georgia, serif;">
                ${data.sellerName}
              </strong>
            </div>

            <div style="background: #FAF8F5; border: 1px solid #EBE4D8; border-radius: 10px; padding: 10px 14px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #78716C; display: block; margin-bottom: 2px;">
                Vásári Időpont & Dátum
              </span>
              <strong style="font-size: 14px; color: #15803D;">
                ${data.weekendDates}
              </strong>
            </div>

            <div style="background: #FAF8F5; border: 1px solid #EBE4D8; border-radius: 10px; padding: 10px 14px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #78716C; display: block; margin-bottom: 2px;">
                Újbudai Lakcím
              </span>
              <div style="font-size: 12px; font-weight: 600; color: #292524;">
                ${addressText}
              </div>
            </div>

            <div style="background: #FAF8F5; border: 1px solid #EBE4D8; border-radius: 10px; padding: 10px 14px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #78716C; display: block; margin-bottom: 2px;">
                Kipakolási Idősáv & Zárás
              </span>
              <div style="font-size: 12px; font-weight: 700; color: #1C1917;">
                Kipakolás: 07:00 – 08:30 · Nyitva: 08:30 – 18:30
              </div>
            </div>

            <div style="grid-column: span 2; background: #FAF8F5; border: 1px solid #EBE4D8; border-radius: 10px; padding: 10px 14px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #78716C; display: block; margin-bottom: 2px;">
                Hasznos Standterület & Felszereltség
              </span>
              <div style="font-size: 12px; font-weight: 600; color: #292524;">
                <strong>250 × 100 cm hasznos terület:</strong> 120 × 80 cm fa sörpad-asztal biztosítva + mindkét oldalon 65-65 cm saját állvány/pakolóhely
              </div>
            </div>

            <div style="grid-column: span 2; background: #FAF8F5; border: 1px solid #EBE4D8; border-radius: 10px; padding: 10px 14px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #78716C; display: block; margin-bottom: 2px;">
                Kínált Kategóriák & Portékák
              </span>
              <div style="font-size: 12px; font-weight: 700; color: #1A3626;">
                ${catText}
              </div>
              <div style="font-size: 11px; color: #57534E; margin-top: 2px;">
                ${descText}
              </div>
            </div>

            <!-- Price & Payment Confirmation -->
            <div style="grid-column: span 2; background: #EAF5ED; border: 1.5px solid #A4C4AC; border-radius: 12px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #1E3A2B; display: block;">
                  Részvételi Standdíj Státusza
                </span>
                <span style="font-size: 13px; font-weight: 700; color: #15803D;">
                  Online bankkártyával sikeresen kiegyenlítve
                </span>
              </div>
              <div style="font-size: 22px; font-weight: 900; color: #15803D; font-family: monospace;">
                ${typeof data.totalPaid === 'number' ? data.totalPaid.toLocaleString('hu-HU') : data.totalPaid} Ft
              </div>
            </div>

          </div>

          <!-- Official Security & Verification Box -->
          <div style="margin-top: 18px; background: #FEF9EE; border: 1px solid #E7C286; border-radius: 12px; padding: 12px 16px; font-size: 11px; color: #5B3F11; line-height: 1.5;">
            <strong style="color: #8C581F; display: block; font-size: 12px; margin-bottom: 3px;">
              ⚠️ Helyszíni felmutatási tájékoztató:
            </strong>
            Kérjük, hozd magaddal ezt a kártyát kinyomtatva vagy mutasd be okostelefonodon a rendezvény reggelén a lezárt utcaszakasz bejáratánál. Az önkéntes szervezők a QR kód leolvasásával azonosítanak és mutatják meg a kijelölt asztalodat. Lemondási szabályzat: rendezvény előtt legkésőbb 8 nappal díjmentes az ujbudazsibi@gmail.com címen.
          </div>

          <!-- Footer seal -->
          <div style="margin-top: 16px; border-top: 1px dashed #D6CBB9; padding-top: 12px; text-align: center; font-size: 10px; color: #888888; line-height: 1.5;">
            <div>Újbudazsibi Hivatalos Bolhapiaci Rendszer · www.ujbudazsibi.hu · E-mail: ujbudazsibi@gmail.com</div>
            <div style="font-family: monospace; font-size: 9px; margin-top: 2px;">Hitelesítési azonosító: ${data.bookingId}</div>
          </div>

        </div>
      </div>
    </div>
  `;

  // 4. Attach to DOM
  document.body.appendChild(offscreenContainer);

  // 5. Explicitly guarantee image is decoded and ready
  const qrImgElement = offscreenContainer.querySelector('#offscreen-qr-target') as HTMLImageElement;
  if (qrImgElement) {
    if (!qrImgElement.complete) {
      await new Promise<void>((resolve) => {
        qrImgElement.onload = () => resolve();
        qrImgElement.onerror = () => resolve();
      });
    }
    if (qrImgElement.decode) {
      try {
        await qrImgElement.decode();
      } catch {
        // decode fallback
      }
    }
  }

  // Small delay for DOM layout reflow
  await new Promise<void>((resolve) => setTimeout(resolve, 60));

  // 6. Capture with html2canvas
  try {
    const canvas = await html2canvas(offscreenContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      width: 760,
      windowWidth: 760,
    });

    const dataUrl = canvas.toDataURL('image/png');
    return { canvas, dataUrl };
  } finally {
    // 7. Always clean up off-screen DOM element
    if (document.body.contains(offscreenContainer)) {
      document.body.removeChild(offscreenContainer);
    }
  }
}

/**
 * Downloads a high-quality A4 PDF file using off-screen DOM render + html2canvas + jsPDF.
 */
export async function downloadPassAsPdfDirect(data: PassPrintData): Promise<boolean> {
  try {
    const { canvas, dataUrl } = await captureOffscreenPassCanvas(data);

    // Create A4 portrait PDF document (210 mm x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 12;
    const printWidth = pageWidth - margin * 2; // 186 mm
    const printHeight = (canvas.height * printWidth) / canvas.width;

    // Center vertically if it fits comfortably
    const yPos = printHeight < pageHeight - margin * 2
      ? (pageHeight - printHeight) / 2
      : margin;

    pdf.addImage(dataUrl, 'PNG', margin, yPos, printWidth, printHeight);

    const safeRef = String(data.bookingId || 'stand').replace(/[^a-zA-Z0-9_-]/g, '_');
    pdf.save(`ujbudazsibi-stand-${safeRef}.pdf`);
    return true;
  } catch (err) {
    console.error('html2canvas + jsPDF letöltési hiba:', err);
    return false;
  }
}

/**
 * Robust 1-page A4 printing using off-screen capture image in an isolated print container.
 * Eliminates blank-page issues by printing the pre-rendered high-res image.
 */
export async function printPassDirect(data: PassPrintData): Promise<void> {
  try {
    const { dataUrl } = await captureOffscreenPassCanvas(data);

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '0';
    printFrame.style.left = '0';
    printFrame.style.width = '100vw';
    printFrame.style.height = '100vh';
    printFrame.style.border = 'none';
    printFrame.style.zIndex = '9999999';
    printFrame.style.backgroundColor = '#FFFFFF';

    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="hu">
      <head>
        <meta charset="utf-8">
        <title>Újbudazsibi Árusi Engedély - Stand #${data.tableId}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: #FFFFFF !important;
            width: 100%;
            height: 100%;
          }
          .wrapper {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 5mm;
          }
          img {
            width: 100%;
            max-width: 188mm;
            height: auto;
            display: block;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <img id="print-pass-img" src="${dataUrl}" alt="Újbudazsibi Standjegy" />
        </div>
      </body>
      </html>
    `);
    doc.close();

    const img = printFrame.contentWindow?.document.getElementById('print-pass-img') as HTMLImageElement;
    const triggerPrint = () => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (e) {
        console.warn('Iframe print hiba:', e);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 5000);
      }
    };

    if (img) {
      if (img.complete) {
        setTimeout(triggerPrint, 150);
      } else {
        img.onload = () => setTimeout(triggerPrint, 150);
        img.onerror = () => triggerPrint();
      }
    } else {
      setTimeout(triggerPrint, 300);
    }
  } catch (err) {
    console.warn('printPassDirect hiba, fallback window.print:', err);
    window.print();
  }
}

/**
 * Backward compatibility helpers.
 */
export async function downloadPassAsPdf(
  _elementId: string = 'printable-pass',
  bookingRef: string = 'pass',
  passData?: PassPrintData
): Promise<boolean> {
  if (passData) {
    return downloadPassAsPdfDirect(passData);
  }
  return false;
}

export async function printPassElement(
  _elementId: string = 'printable-pass',
  passData?: PassPrintData
): Promise<void> {
  if (passData) {
    return printPassDirect(passData);
  }
  window.print();
}
