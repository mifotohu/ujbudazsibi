import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Downloads the official Pass as a real single-page A4 PDF file.
 * This saves an actual .pdf file into the user's Downloads folder.
 */
export async function downloadPassAsPdf(
  elementId: string = 'printable-pass',
  bookingRef: string = 'pass'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Pass element with id #${elementId} not found`);
    return false;
  }

  try {
    // Render element at high scale for crisp vector-like text & QR code
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    // Create A4 portrait document (210 mm x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const maxPrintWidth = pageWidth - margin * 2; // 180 mm

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = maxPrintWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    // Center vertically if it fits comfortably
    const yPos = imgHeight < pageHeight - margin * 2 ? margin + 5 : margin;

    // Header label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(26, 54, 38); // #1A3626
    pdf.text('ÚJBUDAZSIBI · HIVATALOS ÁRUSI BELÉPŐ ÉS ENGEDÉLY', margin, margin);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(110, 110, 110);
    pdf.text('www.ujbudazsibi.hu · ujbudazsibi@gmail.com', margin, margin + 4);

    // Draw the pass image
    pdf.addImage(imgData, 'PNG', margin, yPos + 6, imgWidth, imgHeight);

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      'Kérjük, hozd magaddal ezt a jegyet kinyomtatva vagy mutasd be okostelefonodon a helyszíni bejáratnál.',
      margin,
      pageHeight - 12
    );

    // Trigger immediate browser download
    const safeRef = bookingRef.replace(/[^a-zA-Z0-9_-]/g, '_');
    pdf.save(`ujbudazsibi-stand-${safeRef}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF letöltési hiba:', error);
    return false;
  }
}

/**
 * Robust single-page A4 printing.
 * Uses a real-dimension offscreen frame to avoid browser blank-page optimization.
 */
export async function printPassElement(elementId: string = 'printable-pass'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  try {
    // Render element with html2canvas to ensure all Tailwind styles, QR code & fonts are 100% baked
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgUrl = canvas.toDataURL('image/png');

    // Create an offscreen iframe with REAL A4 dimensions (not 0x0, not visibility:hidden)
    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.top = '0';
    frame.style.left = '-10000px';
    frame.style.width = '794px';
    frame.style.height = '1123px';
    frame.style.border = 'none';
    frame.style.opacity = '0.01';
    frame.style.pointerEvents = 'none';

    document.body.appendChild(frame);

    const frameDoc = frame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html lang="hu">
      <head>
        <meta charset="utf-8">
        <title>Újbudazsibi Hivatalos Árusi Engedély</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #ffffff !important;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 10px 0;
          }
          .header-brand {
            font-size: 11px;
            font-weight: bold;
            color: #1A3626;
            margin-bottom: 8px;
            text-align: center;
            letter-spacing: 0.5px;
          }
          .pass-image {
            width: 100%;
            max-width: 620px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          .footer-note {
            font-size: 10px;
            color: #666;
            margin-top: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header-brand">ÚJBUDAZSIBI · HIVATALOS ÁRUSI ENGEDÉLY (www.ujbudazsibi.hu)</div>
        <img class="pass-image" src="${imgUrl}" alt="Újbudazsibi Standjegy" />
        <div class="footer-note">Hozd magaddal kinyomtatva vagy mutasd be mobilon a rendezvény reggelén.</div>
      </body>
      </html>
    `);
    frameDoc.close();

    // Give iframe a moment to layout the image, then trigger print
    setTimeout(() => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      } catch (e) {
        console.warn('Iframe print failed, falling back:', e);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(frame)) {
            document.body.removeChild(frame);
          }
        }, 5000);
      }
    }, 400);
  } catch (err) {
    console.warn('html2canvas print fallback to window.print:', err);
    window.print();
  }
}
