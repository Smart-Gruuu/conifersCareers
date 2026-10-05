// Hero visual options — all in the Section-02 "Platform" language:
// dark-green chamfered FOUNDATION SLAB (the fabric) with woven accent-green
// texture, cream agent cards docked on top, and a glowing accent-green energy
// stream threading through. Exposes window.HeroOptions.{buildA,buildB,buildC}.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in (a || {})) e.setAttribute(k, a[k]); return e; };
  const chamfer = (x, y, w, h, c) => `M${x + c} ${y} H${x + w - c} L${x + w} ${y + c} V${y + h - c} L${x + w - c} ${y + h} H${x + c} L${x} ${y + h - c} V${y + c} Z`;
  // brand "ridge" cut — diagonal on top-right + bottom-left only (echoes the mark)
  const ridgeCut = (x, y, w, h, c) => `M${x} ${y} H${x + w - c} L${x + w} ${y + c} V${y + h} H${x + c} L${x} ${y + h - c} Z`;
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICONS = [
    '<circle cx="12" cy="12" r="2.2"/><path d="M12 4.5a7.5 7.5 0 0 1 7.5 7.5"/><path d="M12 8.2a3.8 3.8 0 0 1 3.8 3.8"/>',
    '<circle cx="12" cy="12" r="6"/><path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2"/>',
    '<path d="M9 7.5 4.5 12 9 16.5M15 7.5 19.5 12 15 16.5"/>',
    '<circle cx="10.5" cy="10.5" r="6"/><path d="M20 20l-5.2-5.2"/>',
    '<path d="M12 3 19 6v5c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6l7-3z"/><path d="M9 11.8l2.2 2.2 4-4.2"/>',
  ];
  const AG = [["Intel", "SENSE"], ["Hunting", "SEEK"], ["Detection", "CODIFY"], ["Investigate", "REASON"], ["Remediation", "ACT"]];

  // brand mark geometry (inline — avoids cross-svg <use> rendering quirks)
  const MARK_D = [
    "M2347.02,2055.19l2.16-1.15c-46.31.15,13.02.27-33.3.43-81.95.27-163.91.55-245.86.7-14.16.03-27.71-5.68-37.65-15.86-72.08-73.79-185.15-189.4-254.39-259.39-32.53-32.91-96.39-46.29-119.17-46.23l-423.22,1.19c-26.41.06-47.87,21.76-47.95,48.47l-.65,236.36c-.07,26.71,21.27,48.29,47.68,48.23l3.37-.03-3.37,1.82c72.34-.21,144.69-.46,217.04-.67,151.24-.49,302.49-.97,453.73-1.19,21.22-.03,41.56,8.54,56.47,23.8,45.45,46.5,106.13,108.5,145.11,147.92,20.82,21.06,61.7,29.63,76.29,29.6l165.28-.76c16.9-.06,30.64-13.95,30.69-31.06l.41-151.29c.05-17.11-13.62-30.94-30.52-30.88h-2.15Z",
    "M1219.72,2434.45l-2.16,1.12c46.31-.12-13.02-.27,33.3-.43,81.95-.24,163.91-.52,245.86-.67,14.16-.03,27.71,5.65,37.65,15.86,72.08,73.79,185.15,189.37,254.39,259.39,32.53,32.91,96.39,46.29,119.17,46.23l423.22-1.19c26.41-.09,47.87-21.79,47.95-48.47l.65-236.39c.07-26.68-21.27-48.29-47.68-48.2h-3.37l3.38-1.79c-72.35.21-144.69.43-217.04.67-151.24.49-302.49.97-453.73,1.19-21.22.03-41.56-8.54-56.47-23.8-45.45-46.53-106.13-108.5-145.11-147.92-20.83-21.06-61.71-29.63-76.29-29.6l-165.28.76c-16.9.06-30.64,13.95-30.69,31.03l-.41,151.32c-.05,17.11,13.62,30.91,30.52,30.88h2.16Z",
  ];
  // native bbox of the mark: x 1167..2400 (w 1233), y 1714..2776 (h 1062)
  function markInto(svg, tx, ty, tw, fill) {
    const th = tw * (1062 / 1233);
    const g = el("g", { transform: `translate(${tx} ${ty}) scale(${tw / 1233} ${th / 1062}) translate(${-1167} ${-1714})`, fill });
    MARK_D.forEach((d) => g.appendChild(el("path", { d })));
    svg.appendChild(g);
    return th;
  }

  function smoothPath(pts) {
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], dx = (b.x - a.x) / 2;
      d += ` C ${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`;
    }
    return d;
  }
  function weaveInto(svg, id, x, y, w, h, c, stepX, hFracs) {
    const defs = el("defs", {});
    const cp = el("clipPath", { id });
    cp.appendChild(el("path", { d: chamfer(x, y, w, h, c) }));
    defs.appendChild(cp); svg.appendChild(defs);
    const g = el("g", { class: "lf-weave", "clip-path": `url(#${id})` });
    for (let vx = x + stepX; vx < x + w - 8; vx += stepX) g.appendChild(el("line", { x1: vx, y1: y, x2: vx, y2: y + h }));
    (hFracs || []).forEach((f) => g.appendChild(el("line", { x1: x, y1: y + h * f, x2: x + w, y2: y + h * f })));
    svg.appendChild(g);
  }
  function card(svg, x, top, w, h, i, withName) {
    const g = el("g", { class: "lfnode" });
    g.appendChild(el("path", { class: "box", d: chamfer(x - w / 2, top, w, h, 11) }));
    const ico = el("svg", { class: "ico", x: x - 11, y: top + 13, width: 22, height: 22, viewBox: "0 0 24 24" });
    ico.innerHTML = ICONS[i]; g.appendChild(ico);
    if (withName) {
      const n = el("text", { class: "n", x: x, y: top + h - 26 }); n.textContent = AG[i][0]; g.appendChild(n);
      const r = el("text", { class: "r", x: x, y: top + h - 11 }); r.textContent = AG[i][1]; g.appendChild(r);
    } else {
      const r = el("text", { class: "r", x: x, y: top + h - 10 }); r.textContent = AG[i][1]; g.appendChild(r);
    }
    svg.appendChild(g);
  }

  // ── Option A — "Built on the fabric": faithful Section-02 translation ──────
  function buildA(svg) {
    const sX = 24, sY = 360, sW = 612, sH = 156, c = 22;
    svg.appendChild(el("path", { class: "lf-slab", d: chamfer(sX, sY, sW, sH, c) }));
    weaveInto(svg, "wA", sX, sY, sW, sH, c, 32, [0.42, 0.74]);
    const t = el("text", { class: "lf-title", x: sX + 30, y: sY + sH - 32 }); t.textContent = "THE FABRIC"; svg.appendChild(t);
    const s = el("text", { class: "lf-sub", x: sX + 30, y: sY + sH - 15 }); s.textContent = "Institutional knowledge embedded"; svg.appendChild(s);

    const centers = [96, 213, 330, 447, 564], ty = sY + 42;
    const pts = centers.map((x, i) => ({ x, y: ty + (i % 2 ? 11 : -11) }));
    const d = smoothPath(pts);
    pts.forEach((p) => svg.appendChild(el("line", { class: "lf-drop", x1: p.x, y1: 168, x2: p.x, y2: p.y })));
    svg.appendChild(el("path", { class: "lf-thread", d }));
    if (!reduce()) svg.appendChild(el("path", { class: "lf-stream", d, pathLength: 100 }));
    pts.forEach((p) => svg.appendChild(el("circle", { class: "lf-node2", cx: p.x, cy: p.y, r: 4.5 })));

    centers.forEach((x, i) => card(svg, x, 64, 104, 104, i, true));
  }

  // ── Option B — "Layered architecture": the Conifers stacked-slab cake ──────
  function buildB(svg) {
    const cap = (x, y, txt) => { const t = el("text", { class: "layer-cap", x, y }); t.textContent = txt; svg.appendChild(t); };
    // AGENTS cards floated with equal gaps at both ends AND between each card
    // (six equal gaps across the slab); columns below inherit the same centers.
    const agW = 96, agGap = (572 - 5 * agW) / 6;
    const centers = [0, 1, 2, 3, 4].map((i) => 44 + agGap + agW / 2 + i * (agW + agGap));

    // top layer — AGENTS (cream chips)
    const tX = 44, tY = 40, tW = 572, tH = 92, tc = 16;
    cap(tX + 2, tY - 9, "AGENTS");
    svg.appendChild(el("path", { class: "layer-top", d: chamfer(tX, tY, tW, tH, tc) }));
    centers.forEach((x, i) => card(svg, x, tY + (tH - 72) / 2, agW, 72, i, true));

    // middle layer — THE FABRIC (dark woven slab)
    const mX = 44, mY = 212, mW = 572, mH = 150, mc = 22;
    cap(mX + 2, mY - 9, "THE FABRIC");
    svg.appendChild(el("path", { class: "lf-slab", d: chamfer(mX, mY, mW, mH, mc) }));
    weaveInto(svg, "wB", mX, mY, mW, mH, mc, 30, [0.4, 0.72]);
    markInto(svg, mX + mW - 150, mY + 24, 132, "rgba(182,245,177,0.13)");
    const fy = mY + mH - 36;
    const fpts = centers.map((x, i) => ({ x, y: fy + (i % 2 ? 9 : -9) }));
    const fd = smoothPath(fpts);
    svg.appendChild(el("path", { class: "lf-thread", d: fd }));
    if (!reduce()) svg.appendChild(el("path", { class: "lf-stream", d: fd, pathLength: 100 }));
    fpts.forEach((p) => svg.appendChild(el("circle", { class: "lf-node2", cx: p.x, cy: p.y, r: 4 })));

    // connectors: agents -> fabric
    centers.forEach((x, i) => {
      svg.appendChild(el("line", { class: "lf-drop", x1: x, y1: tY + tH, x2: x, y2: fpts[i].y }));
    });
    // fabric label — drawn last so the connector lines sit behind the text
    const st = el("text", { class: "lf-title", x: mX + 28, y: mY + 54 }); st.textContent = "ONE FABRIC"; svg.appendChild(st);
    const ss = el("text", { class: "lf-sub", x: mX + 28, y: mY + 72 }); ss.textContent = "Institutional knowledge embedded"; svg.appendChild(ss);

    // bottom layer — YOUR ENVIRONMENT (data sources base)
    const bX = 44, bY = 438, bW = 572, bH = 66, bc = 16;
    cap(bX + 2, bY - 9, "YOUR ENVIRONMENT");
    svg.appendChild(el("path", { class: "env-slab", d: chamfer(bX, bY, bW, bH, bc) }));
    const SRC = ["SIEM", "EDR", "CLOUD", "IDENTITY", "NETWORK"];
    centers.forEach((x, i) => {
      svg.appendChild(el("circle", { class: "env-dot", cx: x, cy: bY + 24, r: 3.4 }));
      const t = el("text", { class: "env-cap", x: x, y: bY + 46 }); t.textContent = SRC[i]; svg.appendChild(t);
      // rising feed: environment -> fabric
      svg.appendChild(el("line", { class: "lf-feed", x1: x, y1: bY, x2: x, y2: mY + mH }));
      if (!reduce()) {
        const v = el("line", { class: "lf-vstream", x1: x, y1: bY, x2: x, y2: mY + mH });
        v.style.animationDelay = (-i * 0.5) + "s"; svg.appendChild(v);
      }
    });
  }

  // ── Option C — "Fabric panel": one calm dark slab, agents on the top rail ──
  function buildC(svg) {
    const sX = 40, sY = 96, sW = 580, sH = 372, c = 26;
    svg.appendChild(el("path", { class: "lf-slab", d: chamfer(sX, sY, sW, sH, c) }));
    weaveInto(svg, "wC", sX, sY, sW, sH, c, 30, [0.28, 0.5, 0.72]);
    // embossed brand mark, lower-center
    markInto(svg, sX + sW / 2 - 130, sY + sH / 2 - 100, 260, "rgba(182,245,177,0.09)");

    const centers = [120, 225, 330, 435, 540], ny = sY + 96;
    const pts = centers.map((x, i) => ({ x, y: ny + (i % 2 ? 12 : -12) }));
    const d = smoothPath(pts);
    // chips straddling the top rail
    centers.forEach((x, i) => svg.appendChild(el("line", { class: "lf-drop-d", x1: x, y1: sY + 26, x2: x, y2: pts[i].y })));
    svg.appendChild(el("path", { class: "lf-thread", d }));
    if (!reduce()) svg.appendChild(el("path", { class: "lf-stream", d, pathLength: 100 }));
    pts.forEach((p) => svg.appendChild(el("circle", { class: "lf-node2", cx: p.x, cy: p.y, r: 4.5 })));
    centers.forEach((x, i) => card(svg, x, sY - 26, 92, 52, i, false));

    // caption, bottom-left
    const t = el("text", { class: "lf-title", x: sX + 30, y: sY + sH - 34 }); t.textContent = "THE FABRIC"; svg.appendChild(t);
    const s = el("text", { class: "lf-sub", x: sX + 30, y: sY + sH - 16 }); s.textContent = "One agentic fabric, built for machine speed"; svg.appendChild(s);
  }

  // ── shared: numbered ridge-cut badge + layer label ───────────────────────
  function badge(svg, x, y, num, accent) {
    const w = 32, h = 22, c = 7;
    svg.appendChild(el("path", { class: accent ? "layer-badge layer-badge--a" : "layer-badge", d: ridgeCut(x, y, w, h, c) }));
    const t = el("text", { class: accent ? "layer-badge-t layer-badge-t--a" : "layer-badge-t", x: x + w / 2, y: y + 15 }); t.textContent = num; svg.appendChild(t);
  }
  function labelRow(svg, x, baseline, num, txt, accent) {
    badge(svg, x, baseline - 16, num, accent);
    const t = el("text", { class: "layer-cap", x: x + 42, y: baseline }); t.textContent = txt; svg.appendChild(t);
  }

  // ── Option B1 — "Ridge-cut": B with the brand's diagonal corner + badges ──
  function buildBridge(svg) {
    const centers = [110, 220, 330, 440, 550];

    // top — AGENTS
    const tX = 44, tY = 48, tW = 572, tH = 92, tc = 18;
    labelRow(svg, tX + 2, tY - 9, "01", "AGENTS");
    svg.appendChild(el("path", { class: "layer-top layer-top--ridge", d: ridgeCut(tX, tY, tW, tH, tc) }));
    centers.forEach((x, i) => ridgeCard(svg, x, tY + 14, 96, 72, i));

    // middle — THE FABRIC (hero, accent-lit)
    const mX = 44, mY = 214, mW = 572, mH = 150, mc = 26;
    labelRow(svg, mX + 2, mY - 9, "02", "THE FABRIC", true);
    svg.appendChild(el("path", { class: "lf-slab lf-slab--hero", d: ridgeCut(mX, mY, mW, mH, mc) }));
    weaveBy(svg, "wB1", ridgeCut(mX, mY, mW, mH, mc), mX, mY, mW, mH, 30, [0.4, 0.72]);
    markInto(svg, mX + mW - 152, mY + 24, 132, "rgba(182,245,177,0.14)");
    const fy = mY + mH - 36;
    const fpts = centers.map((x, i) => ({ x, y: fy + (i % 2 ? 9 : -9) }));
    const fd = smoothPath(fpts);
    svg.appendChild(el("path", { class: "lf-thread", d: fd }));
    if (!reduce()) svg.appendChild(el("path", { class: "lf-stream lf-stream--bold", d: fd, pathLength: 100 }));
    fpts.forEach((p) => svg.appendChild(el("circle", { class: "lf-node2", cx: p.x, cy: p.y, r: 4 })));

    centers.forEach((x, i) => svg.appendChild(el("line", { class: "lf-drop", x1: x, y1: tY + tH, x2: x, y2: fpts[i].y })));
    // fabric label — drawn last so the connector lines sit behind the text
    const st = el("text", { class: "lf-title", x: mX + 30, y: mY + 56 }); st.textContent = "ONE FABRIC"; svg.appendChild(st);
    const ss = el("text", { class: "lf-sub", x: mX + 30, y: mY + 74 }); ss.textContent = "Institutional knowledge embedded"; svg.appendChild(ss);

    // bottom — YOUR ENVIRONMENT
    const bX = 44, bY = 440, bW = 572, bH = 66, bc = 16;
    labelRow(svg, bX + 2, bY - 9, "03", "YOUR ENVIRONMENT");
    svg.appendChild(el("path", { class: "env-slab", d: ridgeCut(bX, bY, bW, bH, bc) }));
    const SRC = ["SIEM", "EDR", "CLOUD", "IDENTITY", "NETWORK"];
    centers.forEach((x, i) => {
      svg.appendChild(el("circle", { class: "env-dot", cx: x, cy: bY + 24, r: 3.4 }));
      const t = el("text", { class: "env-cap", x: x, y: bY + 46 }); t.textContent = SRC[i]; svg.appendChild(t);
      svg.appendChild(el("line", { class: "lf-feed", x1: x, y1: bY, x2: x, y2: mY + mH }));
      if (!reduce()) {
        const v = el("line", { class: "lf-vstream", x1: x, y1: bY, x2: x, y2: mY + mH });
        v.style.animationDelay = (-i * 0.5) + "s"; svg.appendChild(v);
      }
    });
  }

  // ── Option B2 — "Edge-lit": dominant fabric with an accent spine, crisp chips
  function buildBedge(svg) {
    const centers = [110, 220, 330, 440, 550];

    // top — AGENTS (crisp chips with an accent active-tab)
    const tX = 44, tY = 40, tW = 572, tH = 88, tc = 16;
    labelRow(svg, tX + 2, tY - 9, "01", "AGENTS");
    svg.appendChild(el("path", { class: "layer-top layer-top--ridge", d: ridgeCut(tX, tY, tW, tH, tc) }));
    centers.forEach((x, i) => { ridgeCard(svg, x, tY + 14, 96, 70, i); svg.appendChild(el("rect", { class: "chip-edge", x: x - 13, y: tY + 14, width: 26, height: 3 })); });

    // middle — THE FABRIC (dominant, accent spine + strong glow)
    const mX = 44, mY = 196, mW = 572, mH = 184, mc = 28;
    labelRow(svg, mX + 2, mY - 9, "02", "THE FABRIC", true);
    svg.appendChild(el("path", { class: "lf-slab lf-slab--hero", d: ridgeCut(mX, mY, mW, mH, mc) }));
    weaveBy(svg, "wB2", ridgeCut(mX, mY, mW, mH, mc), mX, mY, mW, mH, 26, [0.3, 0.52, 0.74]);
    // accent spine on the left edge (follows the bottom-left ridge)
    svg.appendChild(el("path", { class: "fab-spine", d: `M${mX} ${mY} h9 v${mH - mc - 9} l-9 9 v${mc} Z` }));
    markInto(svg, mX + mW - 170, mY + 30, 150, "rgba(182,245,177,0.13)");
    const fy = mY + mH - 44;
    const fpts = centers.map((x, i) => ({ x, y: fy + (i % 2 ? 12 : -12) }));
    const fd = smoothPath(fpts);
    svg.appendChild(el("path", { class: "lf-thread", d: fd }));
    if (!reduce()) svg.appendChild(el("path", { class: "lf-stream lf-stream--bold", d: fd, pathLength: 100 }));
    fpts.forEach((p) => svg.appendChild(el("circle", { class: "lf-node2 lf-node2--lg", cx: p.x, cy: p.y, r: 5 })));

    centers.forEach((x, i) => svg.appendChild(el("line", { class: "lf-drop", x1: x, y1: tY + tH, x2: x, y2: fpts[i].y })));
    // fabric label — drawn last so the connector lines sit behind the text
    const st = el("text", { class: "lf-title lf-title--lg", x: mX + 34, y: mY + 64 }); st.textContent = "ONE FABRIC"; svg.appendChild(st);
    const ss = el("text", { class: "lf-sub", x: mX + 34, y: mY + 84 }); ss.textContent = "Institutional knowledge embedded"; svg.appendChild(ss);

    // bottom — YOUR ENVIRONMENT (thin recessed rail)
    const bX = 90, bY = 446, bW = 480, bH = 50, bc = 14;
    labelRow(svg, bX + 2, bY - 9, "03", "YOUR ENVIRONMENT");
    svg.appendChild(el("path", { class: "env-rail", d: ridgeCut(bX, bY, bW, bH, bc) }));
    const SRC = ["SIEM", "EDR", "CLOUD", "IDENTITY", "NETWORK"];
    const railCenters = SRC.map((_, i) => bX + 60 + i * ((bW - 120) / 4));
    railCenters.forEach((x, i) => {
      svg.appendChild(el("circle", { class: "env-dot", cx: x, cy: bY + 18, r: 3 }));
      const t = el("text", { class: "env-cap", x: x, y: bY + 38 }); t.textContent = SRC[i]; svg.appendChild(t);
      svg.appendChild(el("line", { class: "lf-feed", x1: x, y1: bY, x2: centers[i], y2: mY + mH }));
      if (!reduce()) {
        const v = el("line", { class: "lf-vstream", x1: x, y1: bY, x2: centers[i], y2: mY + mH });
        v.style.animationDelay = (-i * 0.5) + "s"; svg.appendChild(v);
      }
    });
  }

  // ridge-cut agent chip
  function ridgeCard(svg, x, top, w, h, i) {
    const g = el("g", { class: "lfnode" });
    g.appendChild(el("path", { class: "box", d: ridgeCut(x - w / 2, top, w, h, 11) }));
    const ico = el("svg", { class: "ico", x: x - 11, y: top + 13, width: 22, height: 22, viewBox: "0 0 24 24" });
    ico.innerHTML = ICONS[i]; g.appendChild(ico);
    const n = el("text", { class: "n", x: x, y: top + h - 26 }); n.textContent = AG[i][0]; g.appendChild(n);
    const r = el("text", { class: "r", x: x, y: top + h - 11 }); r.textContent = AG[i][1]; g.appendChild(r);
    svg.appendChild(g);
  }
  // weave clipped to an arbitrary path d
  function weaveBy(svg, id, d, x, y, w, h, stepX, hFracs) {
    const defs = el("defs", {});
    const cp = el("clipPath", { id });
    cp.appendChild(el("path", { d }));
    defs.appendChild(cp); svg.appendChild(defs);
    const g = el("g", { class: "lf-weave", "clip-path": `url(#${id})` });
    for (let vx = x + stepX; vx < x + w - 8; vx += stepX) g.appendChild(el("line", { x1: vx, y1: y, x2: vx, y2: y + h }));
    (hFracs || []).forEach((f) => g.appendChild(el("line", { x1: x, y1: y + h * f, x2: x + w, y2: y + h * f })));
    svg.appendChild(g);
  }

  window.HeroOptions = { buildA, buildB, buildC, buildBridge, buildBedge };
})();
