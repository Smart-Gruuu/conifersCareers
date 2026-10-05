import Script from "next/script";

/**
 * The homepage's two diagrams (the hero fabric and the platform foundation) are
 * drawn at runtime into empty <svg> shells by the theme's own scripts, so they
 * are vendored and run verbatim rather than reimplemented.
 *
 * Order matters: home.js reads window.HeroOptions, which hero-options.js sets.
 * `afterInteractive` runs them once the markup is in the DOM, which is what the
 * originals assume (they are footer-enqueued IIFEs with no DOMContentLoaded).
 */
export function ThemeScripts({ home = false }: { home?: boolean }) {
  return (
    <>
      <Script src="/theme/nav.js" strategy="afterInteractive" />
      <Script src="/theme/hellobar.js" strategy="afterInteractive" />
      {home && (
        <>
          <Script src="/theme/hero-options.js" strategy="afterInteractive" />
          <Script src="/theme/home.js" strategy="afterInteractive" />
        </>
      )}
    </>
  );
}
