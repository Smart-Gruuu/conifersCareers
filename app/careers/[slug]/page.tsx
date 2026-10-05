import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/careers/ApplyForm";
import { ThemeScripts } from "@/components/site/ThemeScripts";
import { CAREERS_EMAIL } from "@/lib/company";
import type { LocalRole } from "@/lib/local-roles";
import { allRoleSlugs, resolveRole } from "@/lib/roles";
import "../../careers.css";
import "../../roles.css";

type Params = { params: Promise<{ slug: string }> };

/**
 * Greenhouse postings come and go, so this is a build-time snapshot. A slug
 * added after the build still renders on demand — see dynamicParams.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await allRoleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const role = await resolveRole(slug);
  if (!role) return { title: "Role not found" };

  const description =
    role.source === "local"
      ? role.local.intro[0]
      : `${role.title} — ${role.location}. Apply to join the Conifers team.`;

  return { title: `${role.title} | Careers at Conifers AI`, description };
}

export default async function RolePage({ params }: Params) {
  const { slug } = await params;
  const role = await resolveRole(slug);
  if (!role) notFound();

  return (
    <div className="entry-content wp-block-post-content is-layout-constrained wp-block-post-content-is-layout-constrained">
      <section className="hero hero--trust" id="top">
        <div className="wrap hero-grid hero-grid--role">
          <div className="hero-copy">
            <div className="role-eyebrow-row">
              <p className="eyebrow on-light">{role.department}</p>
              {role.badge && <span className="role-badge">{role.badge}</span>}
            </div>
            <h1>{role.title}</h1>
            <dl className="job-meta-list">
              <div>
                <dt>Location</dt>
                <dd>{role.location}</dd>
              </div>
              {role.employmentType && (
                <div>
                  <dt>Type</dt>
                  <dd>{role.employmentType}</dd>
                </div>
              )}
              {role.compensation && (
                <div>
                  <dt>Compensation</dt>
                  <dd>{role.compensation}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      <section className="section section--cream" id="role">
        <div className="wrap">
          <div className="job-detail">
            <article className="job-body">
              {role.source === "local" ? (
                <LocalBody role={role.local} />
              ) : (
                // Sanitised in lib/roles.ts before it ever reaches here.
                <div
                  className="job-body-html"
                  dangerouslySetInnerHTML={{ __html: role.bodyHtml }}
                />
              )}

              <p>
                Questions before applying? Email us at{" "}
                <a href={`mailto:${CAREERS_EMAIL}`}>{CAREERS_EMAIL}</a>.
              </p>
            </article>

            <aside className="apply-panel" id="apply">
              <h2>Apply for this role</h2>
              <p>Fields marked optional can be left blank.</p>
              <ApplyForm slug={role.slug} title={role.title} />
            </aside>
          </div>
        </div>
      </section>

      <ThemeScripts />
    </div>
  );
}

function LocalBody({ role }: { role: LocalRole }) {
  return (
    <>
      {role.intro.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      {role.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.body?.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.bullets && (
            <ul>
              {s.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
