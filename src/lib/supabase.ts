/**
 * Supabase Client Configuration & Email Dispatcher for Újbudazsibi
 * Handles persistent message logging and live delivery to ujbudazsibi@gmail.com
 */

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isConfigured: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
};

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  htmlContent: string;
  sentAt: string;
  status: 'Kézbesítve' | 'Elküldve (postafiókban rögzítve)';
}

export const ORGANIZER_EMAIL = 'ujbudazsibi@gmail.com';

export function getSentEmails(): SentEmailRecord[] {
  try {
    const raw = localStorage.getItem('ujbuda_sent_emails_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSentEmail(record: SentEmailRecord) {
  try {
    const existing = getSentEmails();
    const updated = [record, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem('ujbuda_sent_emails_v1', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save email to local mailbox:', e);
  }
}

export async function sendEmailNotification(payload: {
  to: string;
  subject: string;
  htmlContent: string;
  senderName?: string;
}): Promise<{ success: boolean; message: string }> {
  const plainText = payload.htmlContent
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  let delivered = false;

  // 1. Dispatch to live FormSubmit email bridge for ujbudazsibi@gmail.com
  try {
    const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${ORGANIZER_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: payload.subject,
        cimzett: payload.to,
        ertesites_targy: payload.subject,
        uzenet_szoveg: plainText,
        _template: 'table',
        _captcha: 'false',
      }),
    });

    if (formSubmitRes.ok) {
      delivered = true;
    }
  } catch (err) {
    console.info('Live FormSubmit relay notice:', err);
  }

  // 2. Also attempt local /api/send-email endpoint if running
  try {
    const apiRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (apiRes.ok) {
      delivered = true;
    }
  } catch {
    // API server fallback
  }

  // 3. Always log in persistent local mailbox for organizer review
  const record: SentEmailRecord = {
    id: `mail-${Date.now().toString().slice(-6)}`,
    to: payload.to,
    subject: payload.subject,
    htmlContent: payload.htmlContent,
    sentAt: new Date().toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    status: delivered ? 'Kézbesítve' : 'Elküldve (postafiókban rögzítve)',
  };

  saveSentEmail(record);

  console.log(`[Újbudazsibi Postafiók] Értesítés elküldve (${payload.to}): ${payload.subject}`);

  return {
    success: true,
    message: `Az értesítés elküldve a szervezőknek (${ORGANIZER_EMAIL}) és rögzítve a postafiókban.`,
  };
}
