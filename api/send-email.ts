import type { IncomingMessage, ServerResponse } from 'http';
import { Resend } from 'resend';

interface EmailPayload {
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
  autoResponse?: string;
}

export const ORGANIZER_EMAIL = process.env.ORGANIZER_EMAIL || 'ujbudazsibi@gmail.com';

function generateEmailHtml(data: EmailPayload, autoResponse: string, organizerTo: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1c1917; line-height: 1.6;">
      <div style="background-color: #1A3626; color: #E7C286; padding: 22px 26px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 22px; font-family: serif; color: #E7C286; font-weight: bold;">Újbudazsibi Közösségi Vásár</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #D1E5D8;">Hivatalos foglalási és jelentkezési értesítő</p>
      </div>
      
      <div style="background-color: #FAF8F5; padding: 26px; border: 1px solid #E7DFD3; border-top: none;">
        ${data.htmlContent}
        
        <div style="margin-top: 24px; padding: 18px; background-color: #FFFFFF; border-radius: 10px; border: 1px solid #D6D3D1;">
          <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 14px; font-weight: bold;">✉️ A jelentkezőnek küldött magyar nyelvű visszaigazolás:</h3>
          <pre style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #44403C; margin: 0; line-height: 1.55; background: #F5F5F4; padding: 14px; border-radius: 6px;">${autoResponse}</pre>
        </div>
      </div>

      <div style="padding: 18px 24px; font-size: 12px; color: #78716C; text-align: center; border: 1px solid #E7DFD3; border-top: none; border-radius: 0 0 12px 12px; background: #F5EFEB;">
        <strong>Újbudazsibi Szervezőség</strong> · E-mail: <a href="mailto:${organizerTo}" style="color: #166534; text-decoration: underline;">${organizerTo}</a> · Weboldal: <a href="https://www.ujbudazsibi.hu" style="color: #166534; text-decoration: underline;">www.ujbudazsibi.hu</a>
      </div>
    </div>
  `;
}

/**
 * Universal Serverless Email Dispatcher (Works on Vercel and Node.js environments)
 * Supports:
 * 1. Resend (https://resend.com) via RESEND_API_KEY
 * 2. SendGrid via SENDGRID_API_KEY
 * 3. FormSubmit Server-side Bridge (reliable, bypasses adblockers and CORS)
 */
export async function handleEmailDispatch(data: EmailPayload): Promise<{
  success: boolean;
  provider: string;
  message: string;
  details?: any;
}> {
  const applicantEmail = data.applicantEmail?.trim() || '';
  const applicantName = data.applicantName?.trim() || 'Jelentkező';
  const organizerTo = data.to || ORGANIZER_EMAIL;
  const autoResponse = data.autoResponse || data.readableDetails || data.htmlContent;

  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  // -------------------------------------------------------------
  // PROVIDER 1: RESEND (Recommended high-deliverability provider)
  // -------------------------------------------------------------
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Újbudazsibi <onboarding@resend.dev>';
      const emailHtml = generateEmailHtml(data, autoResponse, organizerTo);

      // 1. Send primary notification to organizer
      const primaryResult = await resend.emails.send({
        from: fromEmail,
        to: organizerTo,
        replyTo: applicantEmail || organizerTo,
        subject: data.subject,
        html: emailHtml,
      });

      // 2. Also send confirmation to applicant if different
      let applicantDelivered = false;
      if (applicantEmail && applicantEmail.includes('@') && applicantEmail !== organizerTo) {
        try {
          const applicantResult = await resend.emails.send({
            from: fromEmail,
            to: applicantEmail,
            replyTo: organizerTo,
            subject: `[Visszaigazolás] ${data.subject}`,
            html: emailHtml,
          });
          if (applicantResult.data) {
            applicantDelivered = true;
          }
        } catch (applicantErr) {
          console.warn('[Resend external recipient notice]', applicantErr);
        }
      }

      if (primaryResult.data) {
        return {
          success: true,
          provider: 'Resend',
          message: `E-mail sikeresen kézbesítve Resend-en keresztül (Szervező: ${organizerTo}${applicantDelivered ? `, Jelentkező: ${applicantEmail}` : ''})`,
          details: { primary: primaryResult.data, applicantDelivered },
        };
      }
    } catch (err: any) {
      console.error('[Resend Error]', err);
    }
  }

  // -------------------------------------------------------------
  // PROVIDER 2: SENDGRID
  // -------------------------------------------------------------
  if (sendgridApiKey) {
    try {
      const emailHtml = generateEmailHtml(data, autoResponse, organizerTo);
      const personalizations: any[] = [
        {
          to: [{ email: organizerTo }],
          subject: data.subject,
        },
      ];

      if (applicantEmail && applicantEmail !== organizerTo) {
        personalizations[0].to.push({ email: applicantEmail, name: applicantName });
      }

      const sendgridRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sendgridApiKey}`,
        },
        body: JSON.stringify({
          personalizations,
          from: { email: process.env.SENDGRID_FROM_EMAIL || 'ertesites@ujbudazsibi.hu', name: 'Újbudazsibi' },
          reply_to: { email: applicantEmail || organizerTo, name: applicantName },
          content: [
            {
              type: 'text/html',
              value: emailHtml,
            },
          ],
        }),
      });

      if (sendgridRes.ok) {
        return {
          success: true,
          provider: 'SendGrid',
          message: `E-mail sikeresen kézbesítve SendGriden keresztül (${organizerTo}).`,
        };
      }
    } catch (err) {
      console.error('[SendGrid Error]', err);
    }
  }

  // -------------------------------------------------------------
  // PROVIDER 3: FORMSUBMIT LIVE RELAY (No API key needed)
  // FIXED: Explicitly includes 'email' field required for autoresponse,
  // 'name', '_replyto', and '_cc' for carbon copying applicant.
  // -------------------------------------------------------------
  try {
    const formSubmitUrl = `https://formsubmit.co/ajax/${organizerTo}`;
    
    // Explicit FormSubmit parameters with correct email, name and cc keys
    const formPayload: Record<string, string> = {
      name: applicantName,
      email: applicantEmail || organizerTo, // REQUIRED by FormSubmit for autoresponse!
      _replyto: applicantEmail || organizerTo,
      _subject: data.subject,
      _template: 'box',
      _captcha: 'false',
      _autoresponse: autoResponse,
      ertesites_targy: data.subject,
      jelentkezo_neve: applicantName,
      jelentkezo_email: applicantEmail || 'Nem adott meg',
      jelentkezo_telefon: data.applicantPhone || 'Nem adott meg',
      helyszin_es_stand: `${data.locationText || ''} | ${data.standText || ''}`,
      kinalat: data.categoryText || 'Nincs külön kategória',
      uzenet_szoveg: data.readableDetails || autoResponse,
    };

    if (applicantEmail && applicantEmail.includes('@') && applicantEmail !== organizerTo) {
      formPayload._cc = applicantEmail;
    }

    const formSubmitRes = await fetch(formSubmitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(formPayload),
    });

    const resultJson = await formSubmitRes.json().catch(() => ({}));

    if (formSubmitRes.ok) {
      return {
        success: true,
        provider: 'FormSubmit',
        message: `Értesítés elküldve FormSubmit-en keresztül (${organizerTo}${applicantEmail ? ` + ${applicantEmail}` : ''})`,
        details: resultJson,
      };
    }
  } catch (err: any) {
    console.error('[FormSubmit Server Relay Error]', err);
  }

  return {
    success: false,
    provider: 'None',
    message: 'Nem sikerült az e-mail elküldése egyetlen szolgáltatón keresztül sem.',
  };
}

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body: EmailPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await handleEmailDispatch(body);
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    console.error('Serverless send-email handler failed:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
}
