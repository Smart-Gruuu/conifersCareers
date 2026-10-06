import type { Metadata } from "next";
import { CAREERS_EMAIL } from "@/lib/company";
import { ThemeScripts } from "@/components/site/ThemeScripts";
import "../../careers.css";
import "../../roles.css";

export const metadata: Metadata = {
  title: "Application received | Careers at Conifers AI",
  description: "Thanks for applying to Conifers.",
  // Nothing to index, and it should never appear in search results.
  robots: { index: false, follow: false },
};

/**
 * The no-JavaScript fallback landing page.
 *
 * With JavaScript the form never leaves the role page — it posts by fetch and
 * shows its confirmation inline. This page only comes into play if the browser
 * posts the form natively, and exists so that path lands somewhere of ours
 * rather than on FormSubmit's own branded "thank you" page.
 */
export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  return (
    <div className="entry-content wp-block-post-content is-layout-constrained wp-block-post-content-is-layout-constrained">
      <section className="hero hero--trust" id="top">
        <div className="wrap hero-grid hero-grid--role">
          <div className="hero-copy">
            <p className="eyebrow on-light">Careers</p>
            <h1>Application submitted successfully.</h1>
            <p className="lead">
              {role ? (
                <>
                  Thanks for applying for <strong>{role}</strong>.
                </>
              ) : (
                <>Thanks for applying.</>
              )}{" "}
              Our team will review your application and contact you soon.
            </p>
            <div className="cta-row">
              <a href="/careers" className="btn btn-primary btn-lg chamfer">
                Back to open roles <span className="arrow">&rarr;</span>
              </a>
              <a
                href={`mailto:${CAREERS_EMAIL}`}
                className="btn btn-ghost btn-lg chamfer"
              >
                Email us
              </a>
            </div>
          </div>
        </div>
      </section>

      <ThemeScripts />
    </div>
  );
}
