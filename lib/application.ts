/**
 * Shape and validation for a job application submitted through this site.
 *
 * The rules here run on the server (app/api/apply/route.ts). The form does its
 * own lightweight checks for responsiveness, but nothing client-side is
 * trusted — every submission is re-validated here before an email is sent.
 */

/**
 * Standard EEOC self-identification categories. Kept verbatim so the data maps
 * onto the categories an ATS or EEO-1 report expects.
 */
export const RACE_OPTIONS = [
  "Hispanic or Latino",
  "White (Not Hispanic or Latino)",
  "Black or African American (Not Hispanic or Latino)",
  "Asian (Not Hispanic or Latino)",
  "Native Hawaiian or Other Pacific Islander (Not Hispanic or Latino)",
  "American Indian or Alaska Native (Not Hispanic or Latino)",
  "Two or More Races (Not Hispanic or Latino)",
  "Decline to self-identify",
] as const;

/** ILR-derived scale, the one most candidates recognise from LinkedIn. */
export const ENGLISH_LEVEL_OPTIONS = [
  "Native or bilingual proficiency",
  "Full professional proficiency",
  "Professional working proficiency",
  "Limited working proficiency",
  "Elementary proficiency",
] as const;

export const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Non-binary",
  "Self-describe",
  "Prefer not to say",
] as const;

/** Resumes and cover letters only — no archives or executables. */
export const ACCEPTED_DOC_EXTENSIONS = [".pdf", ".doc", ".docx", ".rtf", ".txt"];

export const ACCEPTED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/rtf",
  "text/plain",
];

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file

/**
 * FormSubmit rejects submissions whose attachments exceed 10MB in total, so
 * cap below that — two files at the per-file limit would otherwise land exactly
 * on the ceiling.
 */
export const MAX_TOTAL_BYTES = 9 * 1024 * 1024;

/** Youngest plausible applicant; also rejects obviously bogus dates. */
const MIN_AGE_YEARS = 16;
const MAX_AGE_YEARS = 100;

export type ApplicationFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  dateOfBirth: string;
  gender: string;
  raceEthnicity: string;
  englishLevel: string;
  city: string;
  state: string;
  country: string;
};

export type ApplicationErrors = Partial<
  Record<keyof ApplicationFields | "resume" | "coverLetter" | "form", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Deliberately permissive: international numbers vary wildly in format.
const PHONE_RE = /^[+()\d][\d\s().-]{6,24}$/;

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function yearsSince(date: Date): number {
  const ms = Date.now() - date.getTime();
  return ms / (365.2425 * 24 * 60 * 60 * 1000);
}

export type FileLike = { name: string; size: number; type: string };

export function validateFile(
  file: FileLike | null,
  label: string,
  required: boolean,
): string | undefined {
  if (!file || file.size === 0) {
    return required ? `${label} is required.` : undefined;
  }
  if (file.size > MAX_FILE_BYTES) {
    return `${label} must be ${MAX_FILE_BYTES / 1024 / 1024}MB or smaller.`;
  }

  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const okExt = ACCEPTED_DOC_EXTENSIONS.includes(ext);
  // Browsers are inconsistent about type for .doc/.rtf, so accept on either.
  const okType = ACCEPTED_DOC_TYPES.includes(file.type);
  if (!okExt && !okType) {
    return `${label} must be a PDF, Word, RTF or text document.`;
  }
  return undefined;
}

export function validateApplication(
  fields: ApplicationFields,
  files: { resume: FileLike | null; coverLetter: FileLike | null },
): ApplicationErrors {
  const errors: ApplicationErrors = {};
  const required: [keyof ApplicationFields, string][] = [
    ["firstName", "First name"],
    ["lastName", "Last name"],
    ["email", "Email"],
    ["phone", "Phone number"],
    ["dateOfBirth", "Date of birth"],
    ["gender", "Gender"],
    ["raceEthnicity", "Race or ethnicity"],
    ["englishLevel", "English level"],
    ["city", "City"],
    ["state", "State or region"],
    ["country", "Country"],
  ];

  for (const [key, label] of required) {
    if (!fields[key]?.trim()) errors[key] = `${label} is required.`;
  }

  if (!errors.email && !EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!errors.phone && !PHONE_RE.test(fields.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (fields.linkedin.trim() && !isHttpUrl(fields.linkedin.trim())) {
    errors.linkedin = "Enter a full URL, including https://";
  }
  if (fields.website.trim() && !isHttpUrl(fields.website.trim())) {
    errors.website = "Enter a full URL, including https://";
  }

  if (!errors.dateOfBirth) {
    const dob = new Date(fields.dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      errors.dateOfBirth = "Enter a valid date.";
    } else {
      const age = yearsSince(dob);
      if (age < MIN_AGE_YEARS) {
        errors.dateOfBirth = `You must be at least ${MIN_AGE_YEARS} to apply.`;
      } else if (age > MAX_AGE_YEARS) {
        errors.dateOfBirth = "Enter a valid date.";
      }
    }
  }

  if (
    !errors.gender &&
    !GENDER_OPTIONS.includes(fields.gender as (typeof GENDER_OPTIONS)[number])
  ) {
    errors.gender = "Choose one of the listed options.";
  }

  if (
    !errors.raceEthnicity &&
    !RACE_OPTIONS.includes(fields.raceEthnicity as (typeof RACE_OPTIONS)[number])
  ) {
    errors.raceEthnicity = "Choose one of the listed options.";
  }

  if (
    !errors.englishLevel &&
    !ENGLISH_LEVEL_OPTIONS.includes(
      fields.englishLevel as (typeof ENGLISH_LEVEL_OPTIONS)[number],
    )
  ) {
    errors.englishLevel = "Choose one of the listed options.";
  }

  const resumeError = validateFile(files.resume, "Resume", true);
  if (resumeError) errors.resume = resumeError;

  const coverError = validateFile(files.coverLetter, "Cover letter", false);
  if (coverError) errors.coverLetter = coverError;

  const totalBytes = (files.resume?.size ?? 0) + (files.coverLetter?.size ?? 0);
  if (!errors.resume && !errors.coverLetter && totalBytes > MAX_TOTAL_BYTES) {
    errors.form = `Your attachments come to ${(totalBytes / 1024 / 1024).toFixed(1)}MB. Keep the total under ${MAX_TOTAL_BYTES / 1024 / 1024}MB.`;
  }

  return errors;
}

export const EMPTY_FIELDS: ApplicationFields = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  linkedin: "",
  website: "",
  dateOfBirth: "",
  gender: "",
  raceEthnicity: "",
  englishLevel: "",
  city: "",
  state: "",
  country: "",
};

/**
 * The `name` attribute used for each field in the submitted form.
 *
 * FormSubmit labels each row of the notification email with the field's name,
 * so these are written for a human reading the email rather than for code. The
 * email field keeps the literal name "email" because that is what FormSubmit
 * looks for to populate Reply-To.
 */
export const FIELD_NAMES: Record<keyof ApplicationFields, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "email",
  phone: "Phone",
  linkedin: "LinkedIn",
  website: "Website",
  dateOfBirth: "Date of birth",
  gender: "Gender",
  raceEthnicity: "Race / ethnicity",
  englishLevel: "English level",
  city: "City",
  state: "State or region",
  country: "Country",
};

export const RESUME_FIELD = "Resume";
export const COVER_LETTER_FIELD = "Cover letter";

/** Rebuilds the validation object from a submitted form. */
export function fieldsFromForm(form: FormData): ApplicationFields {
  const out = { ...EMPTY_FIELDS };
  for (const key of Object.keys(out) as (keyof ApplicationFields)[]) {
    const v = form.get(FIELD_NAMES[key]);
    out[key] = typeof v === "string" ? v.trim() : "";
  }
  return out;
}
