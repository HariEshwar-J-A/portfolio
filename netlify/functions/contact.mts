import { createHash } from 'node:crypto';
import { mailBodies, reviewContact } from '../../src/lib/contact/gate.ts';
import { allowContact } from '../../src/lib/contact/rateLimit.ts';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

const json = (status: number, ok: boolean) => ({
  statusCode: status,
  headers: JSON_HEADERS,
  body: JSON.stringify({ ok }),
});

const header = (headers: Record<string, string | undefined> | null | undefined, name: string) => {
  if (!headers) return null;
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === wanted) return value ?? null;
  }
  return null;
};

const clientKey = (ip: string) => createHash('sha256').update(ip).digest('hex').slice(0, 32);

const idempotencyKey = (email: string, subject: string, message: string, suffix: string) =>
  createHash('sha256').update(`${email}\n${subject}\n${message}\n${suffix}`).digest('hex');

async function sendMail(input: {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  idempotencyKey: string;
  apiKey: string;
}): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': input.idempotencyKey,
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });
  if (!response.ok) {
    console.error('contact send failed', response.status);
    return false;
  }
  return true;
}

export const handler = async (event: {
  httpMethod?: string;
  headers?: Record<string, string | undefined> | null;
  body?: string | null;
  isBase64Encoded?: boolean;
}) => {
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
    : (event.body ?? '');
  const requestHost = header(event.headers, 'x-forwarded-host') ?? header(event.headers, 'host');
  const decision = reviewContact({
    method: event.httpMethod ?? '',
    origin: header(event.headers, 'origin'),
    requestHost,
    rawBody,
    now: Date.now(),
  });

  if (decision.kind === 'error') return json(decision.status, false);

  // Drops (honeypot, too-fast) still take a slot so a burst cannot skip the limit.
  const ip = header(event.headers, 'x-nf-client-connection-ip') ?? 'unknown';
  const allowed = await allowContact(clientKey(ip));
  if (!allowed) return json(429, false);
  if (decision.kind === 'drop') return json(200, true);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.error('contact send failed', 'unconfigured');
    return json(503, false);
  }

  const { contact } = decision;
  const bodies = mailBodies(contact);
  const ownerSent = await sendMail({
    from,
    to,
    subject: contact.subject,
    text: bodies.ownerText,
    replyTo: contact.email,
    idempotencyKey: idempotencyKey(contact.email, contact.subject, contact.message, 'owner'),
    apiKey,
  });
  if (!ownerSent) return json(502, false);

  await sendMail({
    from,
    to: contact.email,
    subject: bodies.confirmSubject,
    text: bodies.confirmText,
    idempotencyKey: idempotencyKey(contact.email, contact.subject, contact.message, 'confirm'),
    apiKey,
  });

  return json(200, true);
};
