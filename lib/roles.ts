import sanitizeHtml from "sanitize-html";
import { getGreenhouseJob, getGreenhouseJobs } from "./greenhouse";
import { LOCAL_ROLES, getLocalRole, type LocalRole } from "./local-roles";

/**
 * One lookup for every open role, whichever system it came from.
 *
 * Both the detail page and the apply endpoint resolve through here, so a slug
 * that renders a page is exactly a slug that accepts an application — there is
 * no second list to keep in step.
 */
export type ResolvedRole = {
  slug: string;
  title: string;
  department: string;
  location: string;
  compensation?: string;
  employmentType?: string;
  badge?: string;
} & (
  | { source: "local"; local: LocalRole }
  | { source: "greenhouse"; bodyHtml: string }
);

/**
 * Greenhouse returns the posting body entity-escaped (`&lt;p&gt;…`), so the
 * markup has to be decoded before it can be sanitised — sanitising the escaped
 * string finds no tags and renders the angle brackets as visible text.
 *
 * Order matters: `&amp;` is decoded last, otherwise `&amp;lt;` would decode to
 * `&lt;` and then to a real `<`, letting an author smuggle markup through.
 * Decoding stops at this level, so entities inside the recovered HTML (`&nbsp;`,
 * `&rsquo;`) are left for the browser, which is what we want.
 */
function decodeOnce(escaped: string): string {
  return escaped
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Greenhouse posting bodies are authored in an ATS, so they are third-party
 * HTML as far as this app is concerned. Rendering them unsanitised would turn
 * any compromised recruiter account into stored XSS on the careers site.
 *
 * The allowlist covers what Greenhouse actually emits (p, strong, ul, li, h4,
 * span) plus the usual text-formatting tags, and permits only http(s) links.
 */
export function sanitizeJobBody(html: string): string {
  const clean = sanitizeHtml(decodeOnce(html), {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u",
      "ul", "ol", "li",
      "h2", "h3", "h4", "h5",
      "a", "span", "blockquote", "code", "pre", "hr", "table", "thead",
      "tbody", "tr", "th", "td",
    ],
    allowedAttributes: { a: ["href", "name", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      // Anything Greenhouse links out to is external.
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  });

  // Postings are pasted into the ATS from Word or Google Docs, which routinely
  // substitutes a non-breaking space for every space. NBSP offers no line-break
  // opportunity, so such a paragraph is one unbreakable run that overflows its
  // column and widens the whole page. In prose they carry no meaning worth
  // keeping, so normalise them back to ordinary spaces.
  return clean.replace(/\u00a0/g, " ");
}

export async function resolveRole(slug: string): Promise<ResolvedRole | null> {
  const local = getLocalRole(slug);
  if (local) {
    return {
      slug: local.slug,
      title: local.title,
      department: local.department,
      location: local.location,
      compensation: local.compensation,
      employmentType: local.employmentType,
      badge: local.badge,
      source: "local",
      local,
    };
  }

  const job = await getGreenhouseJob(slug);
  if (!job) return null;

  return {
    slug: job.slug,
    title: job.title,
    department: job.department,
    location: job.location,
    source: "greenhouse",
    bodyHtml: sanitizeJobBody(job.contentHtml),
  };
}

/** Slugs to prerender. Greenhouse postings change, so this is a build-time snapshot. */
export async function allRoleSlugs(): Promise<string[]> {
  const greenhouse = await getGreenhouseJobs();
  return [...LOCAL_ROLES.map((r) => r.slug), ...greenhouse.map((j) => j.slug)];
}
