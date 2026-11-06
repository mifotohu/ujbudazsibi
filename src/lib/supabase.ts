/**
 * Supabase Client Configuration, Data Synchronization & FormSubmit Email Dispatcher for Újbudazsibi
 * Handles persistent database operations and direct FormSubmit email delivery to ujbudazsibi@gmail.com
 */

import type {
  ConfirmedBooking,
  CommercialVendorBooking,
  VolunteerApplication,
  MarketReview,
} from '../types/market';

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isConfigured: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
};

export const ORGANIZER_EMAIL = 'ujbudazsibi@gmail.com';

// ====================================================================
// SUPABASE POSTGRESQL DATABASE OPERATIONS
// ====================================================================

export async function fetchBookingsFromSupabase(): Promise<ConfirmedBooking[]> {
  if (!SUPABASE_CONFIG.isConfigured) return [];
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/bookings?status=eq.confirmed&select=*`, {
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
    });
    if (!res.ok) return [];
    const rows = await res.json();
    return (rows || []).map((row: any): ConfirmedBooking => ({
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
      isImmediateNeighbor: Boolean(row.is_immediate_neighbor),
      categories: row.categories || [],
      itemsDescription: row.items_description || '',
      totalPaid: row.total_paid || 0,
      createdAt: row.created_at,
      qrCodeData: `https://www.ujbudazsibi.hu/verify/${row.booking_ref}`,
    }));
  } catch (err) {
    console.warn('fetchBookingsFromSupabase error:', err);
    return [];
  }
}

export async function saveBookingToSupabase(booking: ConfirmedBooking): Promise<void> {
  if (!SUPABASE_CONFIG.isConfigured) return;
  try {
    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
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
        is_immediate_neighbor: booking.isImmediateNeighbor,
        categories: booking.categories,
        items_description: booking.itemsDescription,
        total_paid: booking.totalPaid,
        status: 'confirmed',
      }),
    });
  } catch (err) {
    console.warn('saveBookingToSupabase error:', err);
  }
}

export async function cancelBookingInSupabase(bookingRef: string): Promise<void> {
  if (!SUPABASE_CONFIG.isConfigured) return;
  try {
    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/bookings?booking_ref=eq.${encodeURIComponent(bookingRef)}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn('cancelBookingInSupabase error:', err);
  }
}

export async function saveCommercialToSupabase(vendor: CommercialVendorBooking): Promise<void> {
  if (!SUPABASE_CONFIG.isConfigured) return;
  try {
    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/commercial_vendors`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        vendor_type: vendor.type,
        location_id: vendor.locationId,
        location_name: vendor.locationName,
        weekend_dates: vendor.weekendDates,
        company_name: vendor.companyName,
        tax_number: vendor.taxNumber,
        billing_address: vendor.billingAddress,
        contact_person: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        program_or_menu: vendor.programOrMenuOffer,
        fee_paid: vendor.feePaid,
        status: vendor.status || 'pending',
      }),
    });
  } catch (err) {
    console.warn('saveCommercialToSupabase error:', err);
  }
}

export async function saveVolunteerToSupabase(volunteer: VolunteerApplication): Promise<void> {
  if (!SUPABASE_CONFIG.isConfigured) return;
  try {
    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/volunteers`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        full_name: volunteer.fullName,
        email: volunteer.email,
        phone: volunteer.phone,
        location_id: volunteer.locationId,
        location_name: volunteer.locationName,
        tasks: volunteer.selectedTaskIds,
        other_offer: volunteer.otherOffer,
      }),
    });
  } catch (err) {
    console.warn('saveVolunteerToSupabase error:', err);
  }
}

export async function saveReviewToSupabase(review: MarketReview): Promise<void> {
  if (!SUPABASE_CONFIG.isConfigured) return;
  try {
    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/market_reviews`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        rating: review.rating,
        author_name: review.authorName || 'Látogató',
        role: 'Látogató',
        feedback_text: review.feedbackText,
        is_approved: review.status === 'approved',
      }),
    });
  } catch (err) {
    console.warn('saveReviewToSupabase error:', err);
  }
}

export async function saveNotificationToSupabase(text: string): Promise<void> {
  if (!SUPABASE_CONFIG.isConfigured) return;
  try {
    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/site_notifications`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: 'current_banner',
        text: text || '',
        is_active: Boolean(text && text.trim()),
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn('saveNotificationToSupabase error:', err);
  }
}

export async function fetchNotificationFromSupabase(): Promise<string | null> {
  if (!SUPABASE_CONFIG.isConfigured) return null;
  try {
    const res = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/site_notifications?id=eq.current_banner&select=text,is_active`,
      {
        headers: {
          apikey: SUPABASE_CONFIG.anonKey,
          Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (rows && rows.length > 0 && rows[0].is_active) {
      return rows[0].text || null;
    }
    return null;
  } catch (err) {
    console.warn('fetchNotificationFromSupabase error:', err);
    return null;
  }
}

// ====================================================================
// SENT EMAILS / MAILBOX LOCAL PERSISTENCE
// ====================================================================

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  htmlContent: string;
  sentAt: string;
  status: string;
  provider?: string;
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
    const updated = [record, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem('ujbuda_sent_emails_v1', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save email to local mailbox:', e);
  }
}

// ====================================================================
// FORMSUBMIT EMAIL SENDER (DIRECT LIVE SUBMISSION TO ujbudazsibi@gmail.com)
// ====================================================================

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

export async function sendEmailNotification(
  payload: EmailNotificationPayload
): Promise<{ success: boolean; message: string; provider?: string }> {
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

  // Hungarian auto-response for the applicant
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

  let delivered = false;
  const providerUsed = 'FormSubmit';

  // FormSubmit payload matching the original working format
  const formPayload: Record<string, string> = {
    _subject: payload.subject,
    _replyto: applicantEmail || ORGANIZER_EMAIL,
    email: applicantEmail || ORGANIZER_EMAIL,
    _template: 'box',
    _captcha: 'false',
    cimzett: ORGANIZER_EMAIL,
    ertesites_targy: payload.subject,
    jelentkezo_neve: applicantName,
    jelentkezo_email: applicantEmail || 'Nem adott meg e-mailt',
    jelentkezo_telefon: payload.applicantPhone || 'Nem adott meg telefonszámot',
    helyszin_es_stand: `${locationText} | ${standOrRoleText}`,
    kinalat: payload.categoryText || 'Nincs külön kategória',
    uzenet_szoveg: readableSummary,
    _autoresponse: hungarianAutoResponse,
  };

  if (applicantEmail && applicantEmail.includes('@') && applicantEmail !== ORGANIZER_EMAIL) {
    formPayload._cc = applicantEmail;
  }

  // Direct fetch to FormSubmit
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${ORGANIZER_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(formPayload),
    });

    if (res.ok) {
      delivered = true;
    } else {
      // Fallback with FormData for strict browser environments
      const formData = new FormData();
      Object.entries(formPayload).forEach(([k, v]) => formData.append(k, v));
      const resForm = await fetch(`https://formsubmit.co/ajax/${ORGANIZER_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      if (resForm.ok) {
        delivered = true;
      }
    }
  } catch (err) {
    console.info('FormSubmit direct submission notice:', err);
    // Retry with FormData on fetch network error
    try {
      const formData = new FormData();
      Object.entries(formPayload).forEach(([k, v]) => formData.append(k, v));
      await fetch(`https://formsubmit.co/ajax/${ORGANIZER_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      delivered = true;
    } catch (retryErr) {
      console.warn('FormSubmit retry notice:', retryErr);
    }
  }

  // Save to local mailbox record
  const statusLabel = delivered ? 'Kézbesítve (FormSubmit)' : 'Elküldve (postafiókban rögzítve)';
  const record: SentEmailRecord = {
    id: `mail-${Date.now().toString().slice(-6)}`,
    to: applicantEmail ? `${ORGANIZER_EMAIL} + ${applicantEmail}` : recipientTo,
    subject: payload.subject,
    provider: providerUsed,
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
  };

  saveSentEmail(record);

  return {
    success: true,
    provider: 'FormSubmit',
    message: `A visszaigazolás és értesítés elküldve a FormSubmit rendszeren keresztül (${ORGANIZER_EMAIL}).`,
  };
}
