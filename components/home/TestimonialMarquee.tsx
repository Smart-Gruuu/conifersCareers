"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TESTIMONIALS, type Testimonial } from "./testimonials";

/**
 * The testimonials marquee.
 *
 * The theme ships this as a script that, at runtime, hoists each card's logo to
 * be the card's first child and clones the whole set to make the loop seamless,
 * then measures the clone's offset to drive the `tscroll` keyframes. Doing that
 * to React-owned nodes is fragile: the clones are wiped on any re-render, never
 * restored on a client-side navigation back to this page, and the measurement
 * runs in a `requestAnimationFrame` that never fires while the tab is hidden -
 * leaving `--t-scroll` unset and the track motionless.
 *
 * So the duplication is expressed in JSX (React owns every node) and the
 * measurement runs from a ResizeObserver, which fires regardless of tab
 * visibility. The rendered DOM and class names still match the theme's, so
 * app/conifers.css styles it unchanged.
 */
export function TestimonialMarquee({
  testimonials = TESTIMONIALS,
}: {
  testimonials?: Testimonial[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    // The first card of the duplicated set sits exactly one loop away.
    const firstClone = track.children[testimonials.length] as
      | HTMLElement
      | undefined;
    const distance = firstClone?.offsetLeft ?? 0;
    if (distance <= 0) return;

    track.style.setProperty("--t-scroll", `${distance}px`);
    // Same pacing as the theme: ~55px per second, never faster than 24s.
    track.style.setProperty(
      "--t-dur",
      `${Math.max(24, Math.round(distance / 55))}s`,
    );
    setReady(true);
  }, [testimonials.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    // Card widths are fixed, but fonts and logos load late and shift the total.
    for (const child of Array.from(track.children)) ro.observe(child);

    return () => ro.disconnect();
  }, [measure]);

  return (
    <div className="t-marquee" aria-label="What our customers are saying">
      <div
        className="t-track"
        ref={trackRef}
        // Hold the animation until a real distance is known, so the track never
        // jumps through a default 50% translate on first paint.
        style={{ animationPlayState: ready ? "running" : "paused" }}
      >
        {testimonials.map((t, i) => (
          <Card key={`a-${i}`} testimonial={t} />
        ))}
        {/* Duplicate pass - the seam the loop scrolls into. */}
        {testimonials.map((t, i) => (
          <Card key={`b-${i}`} testimonial={t} ariaHidden />
        ))}
      </div>
    </div>
  );
}

function Card({
  testimonial: t,
  ariaHidden,
}: {
  testimonial: Testimonial;
  ariaHidden?: boolean;
}) {
  return (
    <figure className="tcard" aria-hidden={ariaHidden || undefined}>
      {/* Direct child of .tcard - the `.tcard > .t-logo` rules depend on it. */}
      <Logo testimonial={t} />
      <div className="quote-mark">&ldquo;</div>
      <blockquote>{t.quote}</blockquote>
      <figcaption className="t-attr">
        {t.avatar && (
          <span className="t-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img decoding="async" src={t.avatar.src} alt={t.avatar.alt} />
          </span>
        )}
        <span className="t-who">
          <span className="t-name">{t.name}</span>
          <span className="t-role">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Logo({ testimonial: t }: { testimonial: Testimonial }) {
  if (t.logo.kind === "text") {
    return <span className="t-logo">{t.logo.text}</span>;
  }
  return (
    <span className="t-logo t-logo--img">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={t.logo.src}
        alt={t.logo.alt}
        width={t.logo.width}
        height={t.logo.height}
        style={t.logo.style ? { height: "42px" } : undefined}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
