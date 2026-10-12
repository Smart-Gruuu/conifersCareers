"use client";

import { cloneElement, useRef, useState } from "react";
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

const ACCEPT = ACCEPTED_DOC_EXTENSIONS.join(",");
const MAX_MB = MAX_FILE_BYTES / 1024 / 1024;

/**
 * The form posts to our own `/api/apply` route, which validates again on the
 * server and sends the application through Brevo's transactional email API.
 *
 * This replaced a FormSubmit integration that could not be made to work: it
 * requires a manual activation click before delivering anything, and on
 * localhost it reports "submitted successfully" while sending nothing — so
 * development looked fine and no email ever arrived. Going through our own
 * route means the same code path on localhost and in production, real status
 * codes, and genuine errors instead of a false success.
 *
 * The candidate never leaves the page: on success the form is replaced by the
 * confirmation below.
 */
export function ApplyForm({ slug, title }: { slug: string; title: string }) {
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const data = new FormData(e.currentTarget);

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

    try {
      const res = await fetch("/api/apply", { method: "POST", body: data });
      const payload = (await res.json()) as {
        ok: boolean;
        errors?: ApplicationErrors;
        warning?: string;
      };

      if (!payload.ok) {
        // Shown only in development, to name the actual cause.
        if (payload.warning) console.warn("Application not sent:", payload.warning);
        setErrors(payload.errors ?? { form: "Something went wrong. Please try again." });
        setSubmitting(false);
        formRef.current
          ?.querySelector<HTMLElement>("[aria-invalid='true'], .af-form-error")
          ?.scrollIntoView({ block: "center" });
        return;
      }

      setSent(true);
    } catch {
      setErrors({
        form: "Network error. Please check your connection and try again.",
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
    <form ref={formRef} className="af-form" onSubmit={onSubmit} noValidate>
      <input type="hidden" name="role" value={slug} />

      {/* Honeypot: hidden from people, attractive to bots. The server treats a
          filled value as spam and silently discards the submission. */}
      <div className="af-hp" aria-hidden="true">
        <label htmlFor="af-company">Company</label>
        <input id="af-company" type="text" name="company" tabIndex={-1} autoComplete="off" />
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
