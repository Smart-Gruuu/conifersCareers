import { NextResponse } from "next/server";
import {
  EMPTY_FIELDS,
  FIELD_NAMES,
  MAX_TOTAL_BYTES,
  validateApplication,
  type ApplicationErrors,
  type ApplicationFields,
} from "@/lib/application";
import { resolveRole } from "@/lib/roles";
import {
  DeliveryError,
  isMailConfigured,
  sendApplicationEmail,
  type MailAttachment,
} from "@/lib/mailer";

// Reads uploaded files into memory, so it needs the Node runtime.
export const runtime = "nodejs";

/**
 * Best-effort throttle. In-memory, so it resets on redeploy and is per-instance
 * on a scaled deployment — enough to blunt casual abuse, not a real rate limit.
 * Put a WAF or edge rate limit in front for anything stronger.
 */
const RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 5 };
const recent = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear(); // crude guard against unbounded growth
  return hits.length > RATE_LIMIT.max;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function file(form: FormData, key: string): File | null {
  const v = form.get(key);
  return v instanceof File && v.size > 0 ? v : null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shown to the candidate on any delivery failure; never leaks internals. */
const GENERIC_FAILURE =
  "Sorry — we couldn't submit your application just now. Please try again, or email us directly.";

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, errors: { form: "Too many applications from this address. Try again later." } },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { form: "Could not read the submission." } },
      { status: 400 },
    );
  }

  // Hidden field no human sees; bots fill it in.
  if (str(form, "company")) {
    // Look successful so the bot doesn't retry with a different shape.
    return NextResponse.json({ ok: true });
  }

  const role = await resolveRole(str(form, "role"));
  if (!role) {
    return NextResponse.json(
      { ok: false, errors: { form: "Unknown role." } },
      { status: 400 },
    );
  }

  const fields = { ...EMPTY_FIELDS } as ApplicationFields;
  for (const key of Object.keys(fields) as (keyof ApplicationFields)[]) {
    fields[key] = str(form, FIELD_NAMES[key]);
  }

  const resume = file(form, "Resume");
  const coverLetter = file(form, "Cover letter");

  const errors: ApplicationErrors = validateApplication(fields, { resume, coverLetter });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  if ((resume?.size ?? 0) + (coverLetter?.size ?? 0) > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { ok: false, errors: { form: "Attachments are too large." } },
      { status: 413 },
    );
  }

  const fullName = `${fields.firstName} ${fields.lastName}`;
  const safeName = fullName.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

  const attachments: MailAttachment[] = [];
  for (const [f, label] of [
    [resume, "Resume"],
    [coverLetter, "Cover-Letter"],
  ] as const) {
    if (!f) continue;
    const ext = f.name.slice(f.name.lastIndexOf(".")) || "";
    attachments.push({
      filename: `${label}-${safeName}${ext}`,
      bytes: await f.arrayBuffer(),
    });
  }

  const rows: [string, string][] = [
    ["Role", role.title],
    ["Name", fullName],
    ["Email", fields.email],
    ["Phone", fields.phone],
    ["Location", [fields.city, fields.state, fields.country].filter(Boolean).join(", ")],
    ["Date of birth", fields.dateOfBirth],
    ["Gender", fields.gender],
    ["Race / ethnicity", fields.raceEthnicity],
    ["English level", fields.englishLevel],
    ["LinkedIn", fields.linkedin || "—"],
    ["Website", fields.website || "—"],
    ["Cover letter", coverLetter ? "Attached" : "Not provided"],
    ["Submitted", new Date().toISOString()],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<h2 style="font-family:system-ui,sans-serif;color:#1a2c19">New application — ${escapeHtml(role.title)}</h2>
<table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:5px 16px 5px 0;color:#625d50;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:5px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
  )
  .join("\n")}
</table>`;

  if (!isMailConfigured()) {
    console.error("Application could not be sent: BREVO_API_KEY is not set");
    return NextResponse.json(
      {
        ok: false,
        errors: { form: GENERIC_FAILURE },
        ...(process.env.NODE_ENV !== "production"
          ? { warning: "BREVO_API_KEY is not set. Copy .env.example to .env.local and add it." }
          : {}),
      },
      { status: 503 },
    );
  }

  try {
    await sendApplicationEmail({
      subject: `Application — ${role.title} — ${fullName}`,
      html,
      text,
      replyTo: fields.email,
      replyToName: fullName,
      attachments,
    });
  } catch (err) {
    // Never log the application body; it is personal data.
    const detail = err instanceof DeliveryError ? err.detail : undefined;
    console.error("Failed to send application email", (err as Error).message, detail ?? "");

    return NextResponse.json(
      {
        ok: false,
        errors: { form: GENERIC_FAILURE },
        // Diagnostics in development only.
        ...(process.env.NODE_ENV !== "production"
          ? { warning: `${(err as Error).message} ${detail ?? ""}`.trim() }
          : {}),
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
