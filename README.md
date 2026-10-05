# Conifers

Next.js app carrying exact copies of the [conifers.ai](https://www.conifers.ai)
homepage and careers page, with open roles pulled live from Greenhouse.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run typecheck
```

| Route | What it is |
| --- | --- |
| `/` | Replica of the conifers.ai homepage |
| `/careers` | Replica of conifers.ai/careers, roles live from Greenhouse |
| `/careers/<slug>` | Detail page + application form for every open role |
| `/api/apply` | Receives an application and emails it to the company |

Applications are emailed to `hello@conifers.work` via FormSubmit. There is no
configuration and no `.env` file — the only setup is a one-time activation
click on the destination address; see below.

## How the replicas work

Neither page is an approximation. Everything is vendored verbatim from the live
site, so both render from the same source of truth:

- **[app/conifers.css](app/conifers.css)** — *every* stylesheet the live
  homepage inlines, concatenated in document order so the cascade matches the
  original. Order matters: the WordPress core blocks carry resets the theme
  depends on. `wp-block-library`'s `:where(figure){margin:0 0 1em}` is the one
  to know about — without it the testimonial cards inherit the browser's
  default `figure` margin of 40px a side, and the marquee lays out 80px wider
  per card.
- **[app/careers.css](app/careers.css)** — `pages/trust.min.css` and
  `pages/careers.min.css`, the two external stylesheets the careers route loads
  and the homepage does not. These carry the job board (`.gh-*`, `.job-*`) and
  careers hero styles.
- **[components/home/](components/home)**, **[components/site/](components/site)** —
  the real markup, mechanically converted to JSX rather than retyped. Class
  names are unchanged so the vendored stylesheets apply as-is.
- **[public/theme/](public/theme)** — the theme's own scripts. The hero fabric
  (`#fab-hero`) and platform foundation (`#lfab`) are empty `<svg>` shells these
  scripts draw into at runtime, so they are run rather than reimplemented. Load
  order matters: `home.js` reads `window.HeroOptions`, which `hero-options.js`
  defines. See [ThemeScripts.tsx](components/site/ThemeScripts.tsx).

Both pages were verified by diffing a structural fingerprint against the live
site: section ids, headings, eyebrows and component counts all match, and the
two homepage diagrams build identical node counts (48 and 21).

Do not hand-edit the vendored CSS or `public/theme/*.js`. They are a snapshot;
re-extract from the live pages if the theme changes.

### The one edit to the vendored CSS

`.footer-nav` shipped `align-content:start` on a flex container. Autoprefixer
warns on that value, webpack cannot serialize a module carrying a warning, and
the poisoned dev cache made `/_next/static/css/app/layout.css` 404 — which
silently renders *every* page with no styling at all. It is now
`align-content:flex-start`, the equivalent well-supported value for a flex
container. If you re-extract the theme CSS, reapply this.

## The testimonials marquee is owned by React

This is the one piece of the homepage deliberately *not* driven by the theme
script. The original block in `home.js` hoisted each card's logo to be the
card's first child, cloned the whole set for a seamless loop, and measured the
clone's offset inside a `requestAnimationFrame`. Done to React-owned nodes that
is fragile three ways: the clones are wiped by any re-render, never restored
after a navigation back to the page, and the `rAF` never fires while the tab is
hidden — leaving `--t-scroll` unset and the track motionless.

So [TestimonialMarquee.tsx](components/home/TestimonialMarquee.tsx) expresses
the duplication in JSX and measures from a `ResizeObserver`, which fires
regardless of tab visibility. Content lives in
[testimonials.ts](components/home/testimonials.ts). The rendered DOM and class
names still match the theme's, so the vendored CSS styles it unchanged, and the
marquee block is removed from `public/theme/home.js` so it cannot clone a
second time on top of the JSX duplicates.

### Known difference: scroll reveal

`home.js` fades sections in by tagging them `data-reveal` and adding an `in`
class from an IntersectionObserver. `className` is a React-controlled prop, so
React resets it on re-render and the `in` class does not reliably survive on
React-owned nodes. The practical effect is that those sections are simply
always visible rather than fading in — content is never hidden, so this
degrades safely, but it is not identical to the live page. Fixing it properly
means owning the reveal in React the way the marquee now is.

## Roles and applications

Roles come from two places and behave identically for a candidate: every one
gets a detail page at `/careers/<slug>` and is applied for in place. Nothing
links out to Greenhouse any more.

- **Greenhouse postings** are fetched from the public board API. The posting
  body is the description written in the ATS.
- **Roles posted here** are entries in [lib/local-roles.ts](lib/local-roles.ts),
  merged into the board by `mergeLocalRoles` in
  [lib/greenhouse.ts](lib/greenhouse.ts). If `department` matches a Greenhouse
  department the role joins it, otherwise the department is created. They get
  negative ids so they can never collide with a Greenhouse id, and they still
  render if the Greenhouse fetch fails.

[lib/roles.ts](lib/roles.ts) is the single lookup over both. The detail page and
the apply endpoint resolve through it, so a slug that renders a page is exactly
a slug that accepts an application — there is no second list to keep in step.

### Slugs carry the Greenhouse job id

A Greenhouse slug is `<title-slug>-<job-id>`, and resolution reads the trailing
id rather than matching the title. Greenhouse titles are edited in place —
"Security Sales Engineer" became "Sales Engineer" during this project — and a
slug derived from the title alone would 404 every existing link on a rename.

### ATS content is decoded, then sanitised

Greenhouse returns the posting body entity-escaped (`&lt;p&gt;…`). It is decoded
before sanitising, because sanitising the escaped string finds no tags and
renders angle brackets as visible text. `&amp;` is decoded **last**: decoding it
first would turn `&amp;lt;` into `&lt;` and then into a real `<`, letting an
author smuggle markup past the sanitiser.

The decoded HTML then goes through `sanitize-html` with a tag allowlist, because
a posting body is third-party HTML from an ATS account. Verified to strip
`<script>`, `onerror=`, `javascript:` hrefs, `style`, and `<iframe>`, to keep
`https` links with `rel="noopener"`, and to leave double-escaped markup as
visible text.

### The application form

[ApplyForm.tsx](components/careers/ApplyForm.tsx) posts `multipart/form-data` to
[app/api/apply/route.ts](app/api/apply/route.ts), which validates, builds the
email and sends it. Fields: first and last name, email, phone, resume, cover
letter (optional), LinkedIn (optional), website (optional), date of birth,
gender, race/ethnicity, English level, and city / state / country.

Race/ethnicity uses the standard EEOC categories and English level the ILR
scale, so the values map onto what an ATS or EEO-1 report expects.

Validation lives in [lib/application.ts](lib/application.ts) and runs **on the
server** — the form's own checks are only for responsiveness, and nothing
client-side is trusted. Resume is required; uploads are capped at 5MB each and
restricted to PDF / Word / RTF / text by both extension and MIME type.

Abuse controls: an off-screen honeypot field (a filled one gets a fake success
so the bot doesn't retry), and a per-IP throttle of 5 submissions an hour. That
throttle is in-memory, so it resets on redeploy and is per-instance when scaled
— put an edge rate limit in front of it if you need something real.

The application body is never logged; only failures are, without field values.

### Delivery

The application form posts **directly to FormSubmit from the browser** — a plain
`action` / `method` / `encType` form submission, no `fetch`, no API route.

That shape is load-bearing. An earlier version of this form validated and
relayed the submission server-side, which looked tidier and never delivered:
FormSubmit is built around real form posts from a browser, and the same payload
sent server-to-server is not reliably processed. If you are tempted to move this
back behind a route, that is the reason not to.

The destination is `CAREERS_EMAIL` in [lib/company.ts](lib/company.ts), the same
constant used for the mailto links on the site.

What the form sends, beyond the fields themselves:

| Field | Purpose |
| --- | --- |
| `_subject` | Email subject, including the role title |
| `_template` | `table`, so the email is readable |
| `_next` | Returns the candidate to `/careers/thanks` instead of FormSubmit's page |
| `_honey` | Honeypot; a filled value is discarded silently |
| `Role`, `Role ID` | Which posting the application is for |

Field `name` attributes are human-readable ("First name", "Race / ethnicity")
because FormSubmit uses them as the row labels of the email. The email field is
named literally `email`, which is what FormSubmit looks for to set Reply-To, so
replying to the notification reaches the candidate.

`_next` is held in React state rather than written onto the input through a ref:
React resets an uncontrolled input to its `defaultValue` on re-render, which
silently blanked the field as soon as a failed validation attempt re-rendered
the form, sending candidates to FormSubmit's page instead of ours.

#### What posting from the browser costs

Validation in [lib/application.ts](lib/application.ts) now runs **in the browser
only** — there is no server in front of FormSubmit to re-check it. Spam control
is FormSubmit's reCAPTCHA plus the honeypot. FormSubmit caps attachments at 10MB
combined, so the form rejects anything over 9MB total on top of the 5MB
per-file limit.

#### One-time activation

The first application sent to a given address makes FormSubmit email that
address a confirmation; **nothing is delivered until its link is clicked**, and
the submitter lands on a FormSubmit "confirm your email" page instead of the
thank-you page. This is the most likely reason for an application appearing to
vanish.

#### Applications pass through a third party

Resumes and the personal details on the form transit FormSubmit's servers, which
retain submission data for 30 days (uploaded files are not retained). That is
the trade-off for having no credentials to manage, and worth a deliberate
decision given the data involved.

## Open roles

Roles come from the Conifers Greenhouse board (token `conifersaicareers`) via
the public, keyless board API — no CMS step, no list to keep in sync. See
[lib/greenhouse.ts](lib/greenhouse.ts). Departments with no live postings are
dropped, as on the live board. The page is statically prerendered and
revalidates hourly; if the board is unreachable the list degrades to a link
rather than failing the render.

The live page fills its board client-side from a third-party Greenhouse widget.
Here it is server-rendered into the same markup — including the widget's `gw-*`
hook attributes — so the vendored CSS applies and the roles are in the HTML.

## Deliberate differences from the live site

- **Navigation.** The primary link list (Platform, Integrations, Resources,
  Trust Center, Company) is removed, and every "Request a Demo" call to action —
  header, compact header, drawer, hero, and the closing banner — is now
  **"Go to Careers"** pointing at `/careers`.
- **Hero form.** The live hero embeds a HubSpot form (portal `47640878`, form
  `c91894b6-f9ae-435f-9f43-0e3295a6e311`) that writes real leads. It is replaced
  by the "Go to Careers" button, so nothing here can submit to production.
- **Announcement bar tracking.** The `data-track` attribute pointing at the live
  `wp-json/conifers/v1/hellobar/track` endpoint is stripped, so a local replica
  does not beacon production analytics.
- **Images and fonts** load from `www.conifers.ai` rather than being copied into
  `public/`. Nothing renders if that host is unreachable or the paths move.
- **Analytics and consent** (GTM, CookieYes) are not included.
- **Outbound links** point back to `conifers.ai`, since the rest of the site is
  still WordPress. `/careers` is the exception and is served here.
