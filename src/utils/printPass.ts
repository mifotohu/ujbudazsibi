/**
 * Prints strictly a single-page A4 pass using an isolated hidden iframe.
 * This completely avoids browser pagination over the 5000px background website.
 */
export function printPassElement(elementId: string = 'printable-pass') {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Create isolated hidden iframe
  const frame = document.createElement('iframe');
  frame.setAttribute('style', 'position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden;z-index:-999;');
  document.body.appendChild(frame);

  const frameDoc = frame.contentWindow?.document;
  if (!frameDoc) {
    window.print();
    return;
  }

  // Extract Tailwind or compute inline clone styles
  const clonedPass = element.cloneNode(true) as HTMLElement;

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html lang="hu">
    <head>
      <meta charset="utf-8">
      <title>Újbudazsibi Hivatalos Árusi Engedély</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Plus+Jakarta+Sans:wght@400..800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          background: #ffffff !important;
          color: #1A1A1A !important;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          height: auto !important;
          overflow: visible !important;
        }
        .page-container {
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .print-hide, .no-print, button {
          display: none !important;
        }
        /* Exact pass layout styles */
        #printable-pass {
          background: #ffffff !important;
          border: 2px solid #1A3626 !important;
          border-radius: 16px !important;
          padding: 24px 28px !important;
          box-shadow: none !important;
          margin: 0 auto !important;
          width: 100% !important;
        }
        .font-serif {
          font-family: 'Fraunces', Georgia, serif !important;
        }
        .font-mono {
          font-family: 'JetBrains Mono', monospace !important;
        }
      </style>
      <!-- Include compiled application stylesheets so Tailwind classes work inside the iframe -->
      ${Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((node) => node.outerHTML)
        .join('\n')}
    </head>
    <body style="padding-top: 10px;">
      <div class="page-container">
        ${clonedPass.outerHTML}
      </div>
    </body>
    </html>
  `);
  frameDoc.close();

  // Allow images and fonts to resolve, then trigger single-page print
  setTimeout(() => {
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print fallback to window.print:', err);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(frame)) {
          document.body.removeChild(frame);
        }
      }, 3000);
    }
  }, 400);
}
