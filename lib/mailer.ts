import { CAREERS_EMAIL } from "./company";

/**
 * Application delivery through Brevo's transactional email API.
 *
 * Why this and not a form-to-email service: the previous attempt used
 * FormSubmit, which turned out to be unworkable here. It requires a manual
 * "activate this address" click before it will deliver anything, and — worse —
 * when the request comes from localhost it answers "the form was submitted
 * successfully" while delivering nothing at all. Silent success in development
 * is the one failure mode you cannot debug.
 *
 * Brevo is a real email API: the call is server-to-server, behaves identically
 * on localhost and in production, returns a proper status code, and takes
 * attachments natively (25MB per message). The free tier is 300 emails a day,
 * which is far more than a careers page needs.
 *
 * Nothing here throws on import — an unconfigured deployment fails at send time
 * with a clear message rather than crashing the route.
 */

const ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const { BREVO_API_KEY, APPLICATIONS_TO, APPLICATIONS_FROM } = process.env;

/** Where applications are delivered. APPLICATIONS_TO overrides for staging. */
export const RECIPIENT = APPLICATIONS_TO?.trim() || CAREERS_EMAIL;

/**
 * The envelope sender. Brevo requires this to be a sender you have verified in
 * their dashboard — either a single verified address or any address on a
 * verified domain. It is not the reply address; that is set per-application to
 * the candidate.
 */
const SENDER = APPLICATIONS_FROM?.trim() || CAREERS_EMAIL;

export function isMailConfigured(): boolean {
  return Boolean(BREVO_API_KEY);
}

export type MailAttachment = {
  filename: string;
  bytes: ArrayBuffer;
};

export class DeliveryError extends Error {
  constructor(
    message: string,
    /** Safe to show a developer in dev; never shown to a candidate. */
    readonly detail?: string,
  ) {
    super(message);
    this.name = "DeliveryError";
  }
}

export async function sendApplicationEmail(opts: {
  subject: string;
  html: string;
  text: string;
  /** Candidate's address, so replying from the inbox reaches them. */
  replyTo: string;
  replyToName: string;
  attachments: MailAttachment[];
}): Promise<void> {
  if (!BREVO_API_KEY) {
    throw new DeliveryError(
      "Email is not configured.",
      "BREVO_API_KEY is not set. Copy .env.example to .env.local and add it.",
    );
  }

  const body = {
    sender: { email: SENDER, name: "Conifers Careers" },
    to: [{ email: RECIPIENT }],
    replyTo: { email: opts.replyTo, name: opts.replyToName },
    subject: opts.subject,
    htmlContent: opts.html,
    textContent: opts.text,
    attachment: opts.attachments.map((a) => ({
      name: a.filename,
      content: Buffer.from(a.bytes).toString("base64"),
    })),
  };

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new DeliveryError(
      "Could not reach the email service.",
      (err as Error).message,
    );
  }

  if (!res.ok) {
    // Brevo returns { code, message } — useful in dev, never shown to a candidate.
    const detail = await res.text().catch(() => "");
    throw new DeliveryError(
      `Email service responded ${res.status}.`,
      `${detail.slice(0, 400)}${hintFor(detail)}`,
    );
  }
}

/**
 * Turns Brevo's terser 401s into something actionable. Its IP security is the
 * usual stumbling block: after a learning period it starts rejecting calls from
 * addresses it has not seen, which bites both a developer on a changing home IP
 * and any serverless host, where the outbound address is dynamic.
 */
function hintFor(detail: string): string {
  const d = detail.toLowerCase();

  if (d.includes("ip") && d.includes("not authorized")) {
    return (
      " — Brevo is blocking this IP. In Brevo: your name (top right) → Security" +
      " → Authorised IPs, and turn off 'Block unknown IP addresses'."
    );
  }
  if (d.includes("not verified")) {
    return (
      " — Brevo emailed a verification link for this IP; approve it, or turn off" +
      " 'Block unknown IP addresses' under Security → Authorised IPs."
    );
  }
  if (d.includes("sender") || d.includes("unrecognised") || d.includes("unrecognized")) {
    return (
      ` — the sender address must be verified in Brevo (Senders & IPs).` +
      ` Currently sending as ${SENDER}.`
    );
  }
  if (d.includes("key not found") || d.includes("unauthorized")) {
    return " — check BREVO_API_KEY in .env.local, and restart the dev server.";
  }
  return "";
}
