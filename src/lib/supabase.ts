/**
 * Supabase Client Configuration, Database Operations & Multi-Gateway Email Dispatcher
 * For Újbudazsibi (www.ujbudazsibi.hu)
 * Live notifications target: ujbudazsibi@gmail.com
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ConfirmedBooking,
  VolunteerApplication,
  CommercialVendorBooking,
  StreetMusicianApplication,
  MarketReview,
} from '../types/market';

export const ORGANIZER_EMAIL = 'ujbudazsibi@gmail.com';

// -----------------------------------------------------------------------------
// 1. SUPABASE CLIENT & CONFIGURATION
// -----------------------------------------------------------------------------

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isConfigured: Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ),
};

export const supabase: SupabaseClient | null = SUPABASE_CONFIG.isConfigured
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;

// -----------------------------------------------------------------------------
// 2. SUPABASE DATABASE OPERATIONS (Real persistence & Real-time sync)
// -----------------------------------------------------------------------------

/**
 * Persists an confirmed table booking to Supabase
 */
export async function saveBookingToSupabase(booking: ConfirmedBooking): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('bookings').upsert(
      {
        booking_ref: booking.bookingId,
        table_id: booking.tableId,
        location_id: booking.locationId,
        location_name: booking.locationName,
        street_name: booking.streetName,
        weekend_dates: booking.weekendDates,
        event_date: booking.eventDateIso || new Date().toISOString().split('T')[0],
        seller_name: booking.sellerName,
        email: booking.email,
        phone: booking.phone,
        postal_code: booking.postalCode,
        street_address: booking.streetAddress,
        is_immediate_neighbor: booking.isImmediateNeighbor || false,
        categories: booking.categories || [],
        items_description: booking.itemsDescription || '',
        total_paid: booking.totalPaid,
        status: 'confirmed',
      },
      { onConflict: 'booking_ref' }
    );

    if (error) {
      console.warn('[Supabase] Hiba az asztalfoglalás mentésekor:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Nem sikerült elérni az adatbázist:', err);
    return false;
  }
}

/**
 * Fetches all confirmed bookings from Supabase
 */
export async function fetchBookingsFromSupabase(): Promise<ConfirmedBooking[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed');

    if (error || !data) return [];

    return data.map((row: any) => ({
      bookingId: row.booking_ref,
      tableId: row.table_id,
      locationId: row.location_id,
      locationName: row.location_name,
      streetName: row.street_name,
      weekendDates: row.weekend_dates,
      eventDateIso: row.event_date,
      sellerName: row.seller_name,
      email: row.email,
      phone: row.phone,
      postalCode: row.postal_code,
      streetAddress: row.street_address,
      isImmediateNeighbor: row.is_immediate_neighbor,
      categories: row.categories || [],
      itemsDescription: row.items_description || '',
      totalPaid: row.total_paid,
      createdAt: new Date(row.created_at).toLocaleDateString('hu-HU'),
      qrCodeData: `https://www.ujbudazsibi.hu/verify/${row.booking_ref}`,
    }));
  } catch {
    return [];
  }
}

/**
 * Cancels a booking in Supabase (frees the table up for new sellers)
 */
export async function cancelBookingInSupabase(bookingRef: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('booking_ref', bookingRef);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Saves volunteer registration to Supabase
 */
export async function saveVolunteerToSupabase(v: VolunteerApplication): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('volunteers').insert({
      full_name: v.fullName,
      email: v.email,
      phone: v.phone,
      location_id: v.locationId,
      location_name: v.locationName,
      tasks: v.selectedTaskIds || [],
      other_offer: v.otherOffer || '',
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Saves commercial vendor booking to Supabase
 */
export async function saveCommercialToSupabase(c: CommercialVendorBooking): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('commercial_vendors').insert({
      vendor_type: c.type,
      location_id: c.locationId,
      location_name: c.locationName,
      weekend_dates: c.weekendDates,
      company_name: c.companyName,
      tax_number: c.taxNumber,
      billing_address: c.billingAddress,
      contact_person: c.contactPerson,
      email: c.email,
      phone: c.phone,
      program_or_menu: c.programOrMenuOffer,
      fee_paid: c.feePaid,
      status: 'approved',
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Saves market review to Supabase
 */
export async function saveReviewToSupabase(r: MarketReview): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('market_reviews').insert({
      rating: r.rating,
      author_name: r.authorName || 'Anonim látogató',
      role: r.publicAllowed ? 'Publikus visszajelzés' : 'Belső visszajelzés',
      feedback_text: r.feedbackText,
      is_approved: r.status === 'approved',
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Saves site notification to Supabase
 */
export async function saveNotificationToSupabase(text: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('site_notifications').upsert({
      id: 'current_banner',
      text: text,
      is_active: Boolean(text.trim()),
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetches site notification from Supabase
 */
export async function fetchNotificationFromSupabase(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('site_notifications')
      .select('text, is_active')
      .eq('id', 'current_banner')
      .single();

    if (error || !data) return null;
    return data.is_active ? data.text : '';
  } catch {
    return null;
  }
}

/**
 * Tests live connection to Supabase database
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  url?: string;
  tablesFound?: boolean;
}> {
  if (!SUPABASE_CONFIG.isConfigured) {
    return {
      connected: false,
      message: 'A VITE_SUPABASE_URL és VITE_SUPABASE_ANON_KEY környezeti változók nincsenek beállítva.',
    };
  }

  if (!supabase) {
    return {
      connected: false,
      message: 'A Supabase kliens inicializálása sikertelen volt.',
    };
  }

  try {
    const { error } = await supabase.from('bookings').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          connected: true,
          tablesFound: false,
          message:
            'A Supabase kapcsolat él, de az adatbázis táblák még nincsenek létrehozva! Futtasd le a supabase-schema.sql fájlt a Supabase SQL Editorban!',
          url: SUPABASE_CONFIG.url,
        };
      }
      return {
        connected: false,
        message: `Supabase hibaüzenet: ${error.message} (Kód: ${error.code})`,
        url: SUPABASE_CONFIG.url,
      };
    }

    return {
      connected: true,
      tablesFound: true,
      message: 'Sikeres kapcsolat! A Supabase PostgreSQL adatbázis aktív és készen áll.',
      url: SUPABASE_CONFIG.url,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Hálózati hiba a Supabase elérésekor: ${err?.message || err}`,
      url: SUPABASE_CONFIG.url,
    };
  }
}

// -----------------------------------------------------------------------------
// 3. SENT EMAILS LOGGING (LocalStorage + Supabase)
// -----------------------------------------------------------------------------

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  htmlContent: string;
  sentAt: string;
  status: 'Kézbesítve' | 'Elküldve (postafiókban rögzítve)' | 'Aktiváció szükséges (Gmail)';
  responseDetails?: string;
}

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
    const updated = [record, ...existing].slice(0, 50);
    localStorage.setItem('ujbuda_sent_emails_v1', JSON.stringify(updated));

    // Also persist to Supabase if available
    if (supabase) {
      void Promise.resolve(
        supabase.from('sent_emails').insert({
          recipient: record.to,
          subject: record.subject,
          html_preview: record.htmlContent.slice(0, 2000),
          status: record.status,
        })
      ).catch(() => {});
    }
  } catch (e) {
    console.error('Failed to save email to mailbox:', e);
  }
}

// -----------------------------------------------------------------------------
// 4. MULTI-GATEWAY EMAIL DISPATCHER (FormSubmit + Native Fallback + Diagnostic)
// -----------------------------------------------------------------------------

export interface EmailNotificationPayload {
  to?: string;
  subject: string;
  htmlContent: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  locationText?: string;
  standText?: string;
  categoryText?: string;
  readableDetails?: string;
  senderName?: string;
}

/**
 * Triggers hidden native HTML form submission to FormSubmit as fallback.
 * Native form submission bypasses browser fetch/CORS blocks and adblockers.
 */
function submitViaHiddenForm(fields: Record<string, string>) {
  try {
    let iframe = document.getElementById('ujbuda_mail_frame') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'ujbuda_mail_frame';
      iframe.name = 'ujbuda_mail_frame';
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0';
      document.body.appendChild(iframe);
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${ORGANIZER_EMAIL}`;
    form.target = 'ujbuda_mail_frame';
    form.style.display = 'none';

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    }, 3000);
  } catch (err) {
    console.warn('Hidden form dispatch notice:', err);
  }
}

/**
 * Sends live email notification to ujbudazsibi@gmail.com and the applicant
 */
export async function sendEmailNotification(
  payload: EmailNotificationPayload
): Promise<{ success: boolean; message: string; requiresActivation?: boolean }> {
  const plainText = payload.htmlContent
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  const recipientTo = payload.to || ORGANIZER_EMAIL;
  const applicantEmail = payload.applicantEmail?.trim() || '';
  const applicantName = payload.applicantName?.trim() || 'Jelentkező';
  const standOrRoleText = payload.standText || 'Közösségi jelentkezés';
  const locationText = payload.locationText || 'Újbudazsibi Helyszín';
  const readableSummary = payload.readableDetails || plainText;

  // Hungarian automated confirmation message
  const hungarianAutoResponse = `Kedves ${applicantName}!

Köszönjük szépen a jelentkezésedet az Újbudazsibi közösségi zsibvásárra!
A regisztrációd és választásod sikeresen rögzítésre került a szervezői rendszerben.

AZ ÁLTALAD KIVÁLASZTOTT RÉSZLETEK:
======================================================================
• Esemény / Helyszín: ${locationText}
• Kiválasztott hely / Szerepkör: ${standOrRoleText}
${payload.categoryText ? `• Kínálati kategóriák: ${payload.categoryText}\n` : ''}
RÉSZLETES JELENTKEZÉSI ADATOK:
----------------------------------------------------------------------
${readableSummary}

FONTOS SZERVEZŐI TUDNIVALÓK:
• Helyszínre érkezés: A vásár napján reggel 07:00 és 08:30 között várjuk az eladókat a helyszínen a standok elfoglalásához.
• Lemondási szabályzat: A vásár napja előtt legkésőbb 8 nappal mondható le díjmentesen az ujbudazsibi@gmail.com e-mail címen. 8 napon belül a stand már nem lemondható.
• Parkolás és kipakolás: A lezárt utcaszakasz bejáratainál az önkéntes segítők fogadják a résztvevőket és mutatják meg a kijelölt asztalt.

Amennyiben bármilyen kérdésed vagy észrevételed van, fordulj hozzánk bizalommal az ujbudazsibi@gmail.com címen.

Találkozunk az Újbudazsibin!

Baráti üdvözlettel:
Az Újbudazsibi Szervezőcsapata
E-mail: ujbudazsibi@gmail.com
Web: https://www.ujbudazsibi.hu`;

  const formFields: Record<string, string> = {
    _subject: payload.subject,
    _replyto: applicantEmail || ORGANIZER_EMAIL,
    _autoresponse: hungarianAutoResponse,
    _template: 'box',
    _captcha: 'false',
    'Jelentkezés tárgya': payload.subject,
    'Helyszín és időpont': locationText,
    'Választott stand vagy szerepkör': standOrRoleText,
    'Jelentkező teljes neve': applicantName,
    'Jelentkező e-mail címe': applicantEmail || 'Nem adott meg e-mail címet',
    'Jelentkező telefonszáma': payload.applicantPhone || 'Nem adott meg telefonszámot',
    'Kínálat és kategóriák': payload.categoryText || 'Nincs külön kategória',
    'Jelentkezés szöveges részletei': readableSummary,
  };

  let delivered = false;
  let requiresActivation = false;
  let responseNote = '';

  // 1. PRIMARY DISPATCH: FormSubmit AJAX endpoint
  try {
    const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${ORGANIZER_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(formFields),
    });

    const data = await formSubmitRes.json().catch(() => null);

    if (formSubmitRes.ok && (data?.success === 'true' || data?.success === true)) {
      delivered = true;
      responseNote = 'FormSubmit: Sikeresen kézbesítve a beérkező levelek közé.';
    } else if (data?.message && data.message.toLowerCase().includes('activate')) {
      requiresActivation = true;
      responseNote = `FormSubmit aktiválás szükséges: ${data.message}`;
    } else {
      responseNote = `FormSubmit válasz: ${data?.message || formSubmitRes.statusText || 'Feldolgozva'}`;
    }
  } catch (err: any) {
    responseNote = `Hálózati értesítés: ${err?.message || err}`;
  }

  // 2. SECONDARY FALLBACK: Hidden Native Form Dispatch (Bypasses fetch/adblocker/CORS blocks)
  submitViaHiddenForm(formFields);

  // 3. LOG IN MAILBOX RECORD
  const statusLabel = requiresActivation
    ? 'Aktiváció szükséges (Gmail)'
    : delivered
    ? 'Kézbesítve'
    : 'Elküldve (postafiókban rögzítve)';

  const record: SentEmailRecord = {
    id: `mail-${Date.now().toString().slice(-6)}`,
    to: applicantEmail ? `${ORGANIZER_EMAIL} + ${applicantEmail}` : recipientTo,
    subject: payload.subject,
    htmlContent: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #1c1917;">
        ${payload.htmlContent}
        <div style="margin-top: 20px; padding: 14px; background: #f5f5f4; border-radius: 8px; border: 1px solid #d6d3d1;">
          <strong style="color: #166534; display: block; margin-bottom: 6px;">
            ✉️ A jelentkezőnek kiküldött magyar nyelvű visszaigazoló levél szövege:
          </strong>
          <pre style="white-space: pre-wrap; font-family: inherit; font-size: 13px; color: #44403c; margin: 0;">${hungarianAutoResponse}</pre>
        </div>
      </div>
    `,
    sentAt: new Date().toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    status: statusLabel,
    responseDetails: responseNote,
  };

  saveSentEmail(record);

  return {
    success: true,
    requiresActivation,
    message: requiresActivation
      ? 'A megerősítő aktiváló levél elküldve a Gmail fiókodba! Nyisd meg a Gmailt és kattints az Activate Form gombra!'
      : `Értesítés elküldve (${ORGANIZER_EMAIL}).`,
  };
}

/**
 * Sends a live test email directly to ujbudazsibi@gmail.com with instant diagnostic output
 */
export async function testSendEmailNotification(): Promise<{
  success: boolean;
  message: string;
  requiresActivation?: boolean;
}> {
  return await sendEmailNotification({
    to: ORGANIZER_EMAIL,
    subject: `[Újbudazsibi Teszt] Éles e-mail kézbesítési teszt — ${new Date().toLocaleTimeString('hu-HU')}`,
    applicantName: 'Újbudazsibi Rendszerteszt',
    applicantEmail: 'ujbudazsibi@gmail.com',
    applicantPhone: '+36 30 123 4567',
    locationText: 'Gellérthegy panoráma sétány (Teszt)',
    standText: 'Stand #1 Teszt stand',
    readableDetails: `Ez egy automatikus tesztüzenet az ujbudazsibi@gmail.com e-mail kézbesítési rendszerének ellenőrzésére.
Időpont: ${new Date().toLocaleString('hu-HU')}
Cél: Megbizonyosodni arról, hogy az asztalfoglalási és önkéntes értesítések megbízhatóan megérkeznek a Gmail beérkező levelei közé.`,
    htmlContent: `
      <div style="font-family: sans-serif; padding: 20px; background: #FAF7F2; border: 2px solid #1A3626; border-radius: 12px;">
        <h2 style="color: #1A3626; margin-top: 0;">✅ Újbudazsibi Éles E-mail Kézbesítési Teszt</h2>
        <p>Ez az e-mail megerősíti, hogy az <strong>Újbudazsibi</strong> weboldal értesítési rendszere sikeresen kommunikál a(z) <strong>ujbudazsibi@gmail.com</strong> címmel.</p>
        <p><strong>Teszt időpontja:</strong> ${new Date().toLocaleString('hu-HU')}</p>
        <p style="color: #166534; font-weight: bold;">Minden új standfoglalás, lemondás és önkéntes jelentkezés erre a címre fog érkezni.</p>
      </div>
    `,
  });
}
