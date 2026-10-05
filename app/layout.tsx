import type { Metadata } from "next";
import { HelloBar } from "@/components/site/HelloBar";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { LogoSprite } from "@/components/site/LogoSprite";
import "./conifers.css";

export const metadata: Metadata = {
  title:
    "AI SOC Platform | CognitiveSOC for Security Operations Excellence | Conifers AI®",
  description:
    "Conifers CognitiveSOC is the agentic AI SOC platform for resilient cyber defense at machine speed — threat intelligence, hunting, detection, investigation, and remediation on one fabric.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Body classes are the ones the live theme sets; some CSS keys off them. */}
      <body className="home wp-singular page-template-default page wp-embed-responsive wp-theme-conifers-v2">
        <HelloBar />
        <div className="scroll-progress" aria-hidden="true" />
        <a className="skip-link screen-reader-text" href="#wp--skip-link--target">
          Skip to content
        </a>

        <div className="wp-site-blocks">
          <Nav />
          <main className="wp-block-group is-layout-flow wp-block-group-is-layout-flow">
            <span id="wp--skip-link--target" />
            {children}
          </main>
          <Footer />
        </div>

        <LogoSprite />
      </body>
    </html>
  );
}
