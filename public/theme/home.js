/* Conifers v2 — homepage behaviour.
 * Depends on hero-options.js (window.HeroOptions). Enqueued in the footer on the
 * front page only. Each block is guarded so unbuilt sections are simply skipped. */
(function () {
	// ---- Hero fabric — layered architecture (AGENTS / THE FABRIC / YOUR ENVIRONMENT) ----
	var fab = document.getElementById('fab-hero');
	if (fab && window.HeroOptions && typeof window.HeroOptions.buildB === 'function') {
		window.HeroOptions.buildB(fab);
	}

	// ---- Testimonials marquee ----
	// Removed from this vendored copy: the marquee is owned by React in
	// components/home/TestimonialMarquee.tsx. Leaving the original block here
	// would clone the cards a second time on top of the JSX duplicates.

	// ---- Platform — foundation fabric with agents built on top ----
	(function () {
		const NS = 'http://www.w3.org/2000/svg';
		const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in (a || {})) e.setAttribute(k, a[k]); return e; };
		const chamfer = (x, y, w, h, c) => `M${x + c} ${y} H${x + w - c} L${x + w} ${y + c} V${y + h - c} L${x + w - c} ${y + h} H${x + c} L${x} ${y + h - c} V${y + c} Z`;
		const svg = document.getElementById('lfab');
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const ICONS = [
			'<circle cx="12" cy="12" r="2.2"/><path d="M12 4.5a7.5 7.5 0 0 1 7.5 7.5"/><path d="M12 8.2a3.8 3.8 0 0 1 3.8 3.8"/>',
			'<circle cx="12" cy="12" r="6"/><path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2"/>',
			'<path d="M9 7.5 4.5 12 9 16.5M15 7.5 19.5 12 15 16.5"/>',
			'<circle cx="10.5" cy="10.5" r="6"/><path d="M20 20l-5.2-5.2"/>',
			'<path d="M12 3 19 6v5c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6l7-3z"/><path d="M9 11.8l2.2 2.2 4-4.2"/>',
		];
		const AG = [['Intelligence', 'SENSE'], ['Hunting', 'SEEK'], ['Detection', 'CODIFY'], ['Investigation', 'REASON'], ['Remediation', 'ACT']];
		let nodeEls = [];
		if (svg) {
			const cx = [140, 350, 560, 770, 980], cyTop = 56, CW = 170, CH = 84, chipBottom = 98;
			const slabX = 40, slabY = 126, slabW = 1040, slabH = 124;
			const found = el('g', { class: 'lf-foundation' });
			found.appendChild(el('path', { class: 'lf-slab', d: chamfer(slabX, slabY, slabW, slabH, 22) }));
			svg.appendChild(found);
			const defs = el('defs', {});
			const cp = el('clipPath', { id: 'lf-slabclip' });
			cp.appendChild(el('path', { d: chamfer(slabX, slabY, slabW, slabH, 22) }));
			defs.appendChild(cp); svg.appendChild(defs);
			const weave = el('g', { class: 'lf-weave', 'clip-path': 'url(#lf-slabclip)' });
			for (let x = slabX + 34; x < slabX + slabW - 14; x += 38) weave.appendChild(el('line', { x1: x, y1: slabY, x2: x, y2: slabY + slabH }));
			[0.36, 0.64].forEach((f) => weave.appendChild(el('line', { x1: slabX, y1: slabY + slabH * f, x2: slabX + slabW, y2: slabY + slabH * f })));
			found.appendChild(weave);
			const lt = el('text', { class: 'lf-title', x: 64, y: 189 }); lt.textContent = 'THE FABRIC'; svg.appendChild(lt);
			const ls = el('text', { class: 'lf-sub', x: 64, y: 205 }); ls.textContent = 'Institutional knowledge embedded'; svg.appendChild(ls);
			const ty = slabY + 42;
			const pts = cx.map((x, i) => ({ x, y: ty + (i % 2 ? 12 : -12) }));
			let dThread = `M${pts[0].x} ${pts[0].y}`;
			for (let i = 1; i < pts.length; i++) {
				const a = pts[i - 1], b = pts[i], dx = (b.x - a.x) / 2;
				dThread += ` C ${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`;
			}
			pts.forEach((p) => {
				svg.appendChild(el('line', { class: 'lf-drop', x1: p.x, y1: chipBottom, x2: p.x, y2: p.y }));
				svg.appendChild(el('circle', { class: 'lf-node2', cx: p.x, cy: p.y, r: 4 }));
			});
			svg.appendChild(el('path', { class: 'lf-thread', d: dThread }));
			if (!reduce) svg.appendChild(el('path', { class: 'lf-stream', d: dThread, pathLength: 100 }));
			cx.forEach((x, i) => {
				const g = el('g', { class: 'lfnode', 'data-i': i });
				g.appendChild(el('path', { class: 'box', d: chamfer(x - CW / 2, cyTop - CH / 2, CW, CH, 12) }));
				const ico = el('svg', { class: 'ico', x: x - 11, y: cyTop - CH / 2 + 14, width: 22, height: 22, viewBox: '0 0 24 24' });
				ico.innerHTML = ICONS[i]; g.appendChild(ico);
				const t = el('text', { class: 'n', x: x, y: cyTop + 12 }); t.textContent = AG[i][0]; g.appendChild(t);
				const r = el('text', { class: 'r', x: x, y: cyTop + 27 }); r.textContent = AG[i][1]; g.appendChild(r);
				svg.appendChild(g); nodeEls.push(g);
			});
		}
		document.querySelectorAll('#platform .pcard').forEach((card) => {
			const n = card.getAttribute('data-node');
			const lit = (on) => {
				if (n === 'core') { const f = svg && svg.querySelector('.lf-foundation'); if (f) f.classList.toggle('lit', on); return; }
				const node = nodeEls[parseInt(n, 10)]; if (node) node.classList.toggle('lit', on);
			};
			card.addEventListener('mouseenter', () => lit(true));
			card.addEventListener('mouseleave', () => lit(false));
		});
	})();

	// ---- Scroll reveal: Problem broken-chain ----
	(function () {
		const targets = document.querySelectorAll('.broken, .bk-close');
		if (!targets.length || !('IntersectionObserver' in window)) {
			targets.forEach((t) => t.classList.add('in'));
			return;
		}
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
			});
		}, { threshold: 0.2 });
		targets.forEach((t) => io.observe(t));
	})();

	// ---- Scroll reveal: Why-it-matters boxes (staggered) ----
	(function () {
		const grid = document.querySelector('#why .why-grid');
		if (!grid) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
		const cols = [...grid.querySelectorAll('.why-col')];
		grid.classList.add('reveal-ready');
		cols.forEach((c, i) => { c.style.transitionDelay = (i * 55) + 'ms'; });
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
			});
		}, { rootMargin: '0px 0px -10% 0px', threshold: 0.18 });
		cols.forEach((c) => io.observe(c));
	})();

	// ---- Hero email capture (stand-in until the HubSpot embed is wired) ----
	(function () {
		var form = document.getElementById('hero-capture');
		if (!form) return;
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var email = document.getElementById('hc-email');
			if (!email.checkValidity()) { email.reportValidity(); return; }
			form.querySelector('.hc-bar').style.display = 'none';
			form.querySelector('.hc-fine').hidden = true;
			form.querySelector('.hc-done').hidden = false;
		});
	})();

	// ---- Scroll effects: progress meter, nav condense, reveal-on-enter, stat count-up ----
	(function () {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const bar = document.querySelector('.scroll-progress');
		const nav = document.querySelector('.nav');
		let ticking = false;
		function onScroll() {
			if (ticking) return; ticking = true;
			requestAnimationFrame(() => {
				const st = window.scrollY || document.documentElement.scrollTop;
				const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
				if (bar) bar.style.transform = 'scaleX(' + Math.min(1, st / max) + ')';
				if (nav) {
					if (st > 90) nav.classList.add('scrolled');
					else if (st < 20) nav.classList.remove('scrolled');
				}
				ticking = false;
			});
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		if (!reduce && 'IntersectionObserver' in window) {
			document.documentElement.classList.add('reveal-on');
			const mark = (el, mode, delay) => {
				if (!el) return;
				el.setAttribute('data-reveal', mode || '');
				if (delay) el.style.setProperty('--d', delay);
			};
			['#problem .sec-head', '#platform .sec-head', '#why .sec-head',
				'#customers .sec-head', '#recognition .sec-head',
				'.cards-grid', '.platform-close', '.why-body', '.why-close',
				'.rec-feature', '.cta-banner .sec-title', '.cta-banner .sec-sub', '.cta-banner .cta-row'
			].forEach((s) => document.querySelectorAll(s).forEach((el) => mark(el, '')));
			['.lfab', '.t-marquee'].forEach((s) => document.querySelectorAll(s).forEach((el) => mark(el, 'fade')));
			document.querySelectorAll('#proof .proof-stat').forEach((el, i) => mark(el, '', (i * 90) + 'ms'));
			document.querySelectorAll('#recognition .rec-item').forEach((el, i) => mark(el, '', (i * 65) + 'ms'));

			const rio = new IntersectionObserver((entries) => {
				entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
			}, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
			document.querySelectorAll('[data-reveal]').forEach((el) => rio.observe(el));
		}

		const stats = document.querySelectorAll('#proof .ps-num');
		if (stats.length && 'IntersectionObserver' in window) {
			const animateNum = (el) => {
				const m = el.textContent.trim().match(/^(\d+)([%+]*)$/);
				if (!m || reduce) return;
				const target = parseInt(m[1], 10), suffix = m[2], dur = 1100, t0 = performance.now();
				const tick = (now) => {
					const p = Math.min(1, (now - t0) / dur);
					el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
					if (p < 1) requestAnimationFrame(tick);
				};
				el.textContent = '0' + suffix;
				requestAnimationFrame(tick);
			};
			const sio = new IntersectionObserver((entries) => {
				entries.forEach((e) => { if (e.isIntersecting) { animateNum(e.target); sio.unobserve(e.target); } });
			}, { threshold: 0.5 });
			stats.forEach((s) => sio.observe(s));
		}
	})();
})();
