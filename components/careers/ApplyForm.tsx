"use client";

import { cloneElement, useEffect, useRef, useState } from "react";
import {
  ACCEPTED_DOC_EXTENSIONS,
  COVER_LETTER_FIELD,
  ENGLISH_LEVEL_OPTIONS,
  FIELD_NAMES,
  GENDER_OPTIONS,
  MAX_FILE_BYTES,
  RACE_OPTIONS,
  RESUME_FIELD,
  fieldsFromForm,
  validateApplication,
  type ApplicationErrors,
} from "@/lib/application";
import { CAREERS_EMAIL } from "@/lib/company";

const ACCEPT = ACCEPTED_DOC_EXTENSIONS.join(",");
const MAX_MB = MAX_FILE_BYTES / 1024 / 1024;

/**
 * The form is submitted to FormSubmit by `fetch` from the browser, and the
 * candidate never leaves this page — on success they see the confirmation
 * below, and FormSubmit is never surfaced to them.
 *
 * Two details make that possible:
 *  - The request originates in the browser. FormSubmit is built around real
 *    browser submissions; the same payload sent server-side is not reliably
 *    processed, which is why an earlier server-relayed version never delivered.
 *  - FormSubmit's file-capable endpoint answers with
 *    `Access-Control-Allow-Origin: *`, so the response can be read and a
 *    failure told apart from a success. (Its JSON `/ajax/` endpoint would be
 *    tidier but accepts no file uploads, and a resume is required.)
 *
 * The `action`/`method`/`encType` attributes remain as a no-JavaScript
 * fallback: the markup is server-rendered, so without JS the browser can still
 * post the form natively, and `_next` returns it to our own thank-you page.
 *
 * Validation here is the only validation — there is no server route in front of
 * FormSubmit. Spam control is FormSubmit's own filtering plus the `_honey`
 * honeypot below.
 */
export function ApplyForm({ slug, title }: { slug: string; title: string }) {
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // `_next` needs an absolute URL, which is only known in the browser, so it is
  // filled in after mount — that also keeps the server and client markup
  // identical on first render. It has to live in state rather than be written
  // onto the input imperatively: React resets an uncontrolled input to its
  // defaultValue on re-render, which silently blanked this field as soon as a
  // failed validation attempt re-rendered the form.
  const [nextUrl, setNextUrl] = useState("");
  useEffect(() => {
    setNextUrl(
      `${window.location.origin}/careers/thanks?role=${encodeURIComponent(title)}`,
    );
  }, [title]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Always handled here; the native post is only the no-JavaScript path.
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    const data = new FormData(form);

    const fileOf = (name: string) => {
      const v = data.get(name);
      return v instanceof File && v.size > 0 ? v : null;
    };

    const found = validateApplication(fieldsFromForm(data), {
      resume: fileOf(RESUME_FIELD),
      coverLetter: fileOf(COVER_LETTER_FIELD),
    });

    if (Object.keys(found).length > 0) {
      setErrors(found);
      formRef.current
        ?.querySelector<HTMLElement>("[aria-invalid='true']")
        ?.scrollIntoView({ block: "center" });
      return;
    }

    setErrors({});
    setSubmitting(true);

    // Only meaningful for the no-JS path; nothing should redirect here.
    data.delete("_next");

    try {
      const res = await fetch(`https://formsubmit.co/${CAREERS_EMAIL}`, {
        method: "POST",
        body: data,
      });
      const text = await res.text().catch(() => "");

      if (!res.ok) {
        throw new Error(`FormSubmit responded ${res.status}`);
      }

      // Before the destination address is activated, FormSubmit accepts the
      // request but delivers nothing. Treat that as a failure rather than
      // telling the candidate their application is on its way.
      if (/confirm your email|activat/i.test(text) && !/thank/i.test(text)) {
        throw new Error("FormSubmit address is not activated yet");
      }

      setSent(true);
    } catch (err) {
      console.error("Application submission failed", err);
      setErrors({
        form: "Sorry — we couldn't submit your application just now. Please try again, or email us directly.",
      });
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="af-done" role="status">
        <h3>Application submitted successfully.</h3>
        <p>
          Thanks for applying for <strong>{title}</strong>. Our team will review
          your application and contact you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="af-form"
      action={`https://formsubmit.co/${CAREERS_EMAIL}`}
      method="POST"
      encType="multipart/form-data"
      onSubmit={onSubmit}
      noValidate
    >
      {/* FormSubmit controls. */}
      <input type="hidden" name="_subject" value={`Application — ${title}`} />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_next" value={nextUrl} readOnly />
      <input type="hidden" name="Role" value={title} />
      <input type="hidden" name="Role ID" value={slug} />

      {/* FormSubmit's own honeypot: a filled value is silently discarded. */}
      <div className="af-hp" aria-hidden="true">
        <label htmlFor="af-honey">Leave this empty</label>
        <input id="af-honey" type="text" name="_honey" tabIndex={-1} autoComplete="off" />
      </div>

      {errors.form && (
        <p className="af-form-error" role="alert">
          {errors.form}
        </p>
      )}

      <div className="af-row">
        <Field name={FIELD_NAMES.firstName} label="First name" error={errors.firstName} required>
          <input type="text" autoComplete="given-name" />
        </Field>
        <Field name={FIELD_NAMES.lastName} label="Last name" error={errors.lastName} required>
          <input type="text" autoComplete="family-name" />
        </Field>
      </div>

      <div className="af-row">
        <Field name={FIELD_NAMES.email} label="Email" error={errors.email} required>
          <input type="email" autoComplete="email" />
        </Field>
        <Field name={FIELD_NAMES.phone} label="Phone number" error={errors.phone} required>
          <input type="tel" autoComplete="tel" />
        </Field>
      </div>

      <Field
        name={RESUME_FIELD}
        label="Resume"
        error={errors.resume}
        required
        hint={`PDF, Word, RTF or text. Up to ${MAX_MB}MB.`}
      >
        <input type="file" accept={ACCEPT} />
      </Field>

      <Field
        name={COVER_LETTER_FIELD}
        label="Cover letter"
        error={errors.coverLetter}
        hint={`Optional. Up to ${MAX_MB}MB.`}
      >
        <input type="file" accept={ACCEPT} />
      </Field>

      <div className="af-row">
        <Field
          name={FIELD_NAMES.linkedin}
          label="LinkedIn profile"
          error={errors.linkedin}
          hint="Optional."
        >
          <input type="url" inputMode="url" placeholder="https://linkedin.com/in/…" />
        </Field>
        <Field name={FIELD_NAMES.website} label="Website" error={errors.website} hint="Optional.">
          <input type="url" inputMode="url" placeholder="https://…" />
        </Field>
      </div>

      <div className="af-row">
        <Field
          name={FIELD_NAMES.dateOfBirth}
          label="Date of birth"
          error={errors.dateOfBirth}
          required
        >
          <input type="date" autoComplete="bday" />
        </Field>
        <Field name={FIELD_NAMES.gender} label="Gender" error={errors.gender} required>
          <select defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="af-row">
        <Field
          name={FIELD_NAMES.raceEthnicity}
          label="Race or ethnicity"
          error={errors.raceEthnicity}
          required
        >
          <select defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {RACE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field
          name={FIELD_NAMES.englishLevel}
          label="English level"
          error={errors.englishLevel}
          required
        >
          <select defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {ENGLISH_LEVEL_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="af-row af-row--three">
        <Field name={FIELD_NAMES.city} label="City" error={errors.city} required>
          <input type="text" autoComplete="address-level2" />
        </Field>
        <Field name={FIELD_NAMES.state} label="State or region" error={errors.state} required>
          <input type="text" autoComplete="address-level1" />
        </Field>
        <Field name={FIELD_NAMES.country} label="Country" error={errors.country} required>
          <input type="text" autoComplete="country-name" />
        </Field>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg chamfer af-submit"
        disabled={submitting}
      >
        {submitting ? "Sending…" : "Submit application"}
        {!submitting && <span className="arrow">&rarr;</span>}
      </button>

      <p className="af-fine">
        By submitting this form you agree that the details and documents you
        provide will be used to assess your application.
      </p>
    </form>
  );
}

/**
 * Wires label, hint, error and `name`/`id` onto whichever control the caller
 * passes, so each field's markup stays in one place.
 */
function Field({
  name,
  label,
  error,
  hint,
  required,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement<Record<string, unknown>>;
}) {
  // The field name doubles as the email's row label, so it may contain spaces
  // and slashes; derive a DOM-safe id from it.
  const id = `af-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="af-field">
      <label htmlFor={id}>
        {label}
        {!required && <span className="af-optional"> (optional)</span>}
      </label>
      {cloneElement(children, {
        id,
        name,
        required,
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint && (
        <span className="af-hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="af-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
