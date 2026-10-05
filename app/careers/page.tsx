import type { Metadata } from "next";
import { RolesBoard } from "@/components/careers/RolesBoard";
import { ThemeScripts } from "@/components/site/ThemeScripts";
import { getDepartments } from "@/lib/greenhouse";
import { CAREERS_EMAIL } from "@/lib/company";
import "../careers.css";
import "../roles.css";

export const metadata: Metadata = {
  title: "Join the Conifers Team",
  description:
    "Conifers is redefining the modern SOC with AI-driven detection, investigation, and response. See open roles across engineering, product, and go-to-market.",
};

export default async function CareersPage() {
  const departments = await getDepartments();

  return (
    <div className="entry-content wp-block-post-content is-layout-constrained wp-block-post-content-is-layout-constrained">
      <section
        className="wp-block-group alignfull hero hero--trust is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow"
        id="top"
      >
        <div className="wp-block-group wrap hero-grid hero-grid--careers is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
          <div className="wp-block-group hero-copy is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
            <p className="eyebrow on-light wp-block-paragraph">Careers</p>

            <h1 className="wp-block-heading">
              Join the Conifers <span className="hl">team.</span>
            </h1>

            <p className="lead wp-block-paragraph">
              Conifers is redefining the modern SOC with AI-driven detection,
              investigation, and response that actually works, at scale, and in
              real life. We&#8217;re a fast-moving cybersecurity startup backed
              by deep expertise in data science, detection engineering, and
              enterprise security operations, as well as by SYN Ventures, PICUS
              Capital and others. Our CognitiveSOC&#8482; AI SOC agents platform
              isn&#8217;t just smart, it&#8217;s operationally proven for
              enterprise and MSSP SOCs.
            </p>

            <p className="lead wp-block-paragraph">
              If you believe that AI should actually make things better (not
              noisier), especially when it comes to SecOps, and want to work
              with smart, driven people who move fast and build boldly. Come
              join us!
            </p>
          </div>

          <div className="team-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              decoding="async"
              src="https://www.conifers.ai/wp-content/themes/conifers-v2/assets/img/careers/team-office.avif"
              alt="The Conifers team gathered in the office"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section
        className="wp-block-group alignfull section section--cream is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow"
        id="roles"
      >
        <div className="wp-block-group wrap is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
          <div className="wp-block-group sec-head is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
            <div className="wp-block-group sec-meta is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
              <p className="eyebrow on-light wp-block-paragraph">Open roles</p>
            </div>
            <h2 className="wp-block-heading sec-title">
              We&#8217;re hiring across engineering, product, and go-to-market.
            </h2>
          </div>

          <RolesBoard departments={departments} />
        </div>
      </section>

      <section className="wp-block-group alignfull section section--deep cta-banner is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
        <div className="wp-block-group wrap is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
          <span className="eyebrow on-dark" style={{ justifyContent: "center" }}>
            Careers
          </span>
          <h2 className="wp-block-heading sec-title">Move fast. Build boldly.</h2>
          <p className="sec-sub wp-block-paragraph">
            Don&#8217;t see your role listed? We still want to hear from you.
          </p>
          <div className="cta-row">
            <a
              href={`mailto:${CAREERS_EMAIL}`}
              className="btn btn-primary btn-lg chamfer"
            >
              Email us about an open role <span className="arrow">&rarr;</span>
            </a>
            <a
              href="https://www.conifers.ai/about/"
              className="btn btn-ghost btn-lg chamfer"
            >
              Meet the team
            </a>
          </div>
        </div>
      </section>

      <ThemeScripts />
    </div>
  );
}
