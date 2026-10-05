/* Conifers v2 — mobile nav drawer. Always loaded; no-ops on desktop where the
 * burger/drawer are display:none. Toggles the off-canvas drawer with scroll lock,
 * Esc-to-close, scrim/close-button/link close, and a simple focus trap. */
(function () {
	var burger = document.querySelector('.nav-burger');
	var drawer = document.getElementById('cf-drawer');
	if (!burger || !drawer) return;

	var panel = drawer.querySelector('.nav-drawer-panel');
	var root = document.documentElement;
	var lastFocus = null;

	function focusables() {
		return panel.querySelectorAll('a[href], button:not([disabled])');
	}

	function onKey(e) {
		if (e.key === 'Escape') { close(); return; }
		if (e.key !== 'Tab') return;
		var f = focusables();
		if (!f.length) return;
		var first = f[0], last = f[f.length - 1];
		if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
		else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
	}

	function open() {
		if (drawer.classList.contains('is-open')) return;
		lastFocus = document.activeElement;
		drawer.classList.add('is-open');
		burger.setAttribute('aria-expanded', 'true');
		root.classList.add('cf-noscroll');
		document.addEventListener('keydown', onKey);
		// Focus the close button (not the logo link) so the drawer never draws a
		// focus ring around the logo; falls back to the first focusable.
		var closeBtn = panel.querySelector('.nav-drawer-close');
		var f = focusables();
		if (closeBtn) closeBtn.focus();
		else if (f.length) f[0].focus();
	}

	function close() {
		if (!drawer.classList.contains('is-open')) return;
		drawer.classList.remove('is-open');
		burger.setAttribute('aria-expanded', 'false');
		root.classList.remove('cf-noscroll');
		document.removeEventListener('keydown', onKey);
		if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
	}

	burger.addEventListener('click', function () {
		drawer.classList.contains('is-open') ? close() : open();
	});

	drawer.querySelectorAll('.nav-drawer-scrim, .nav-drawer-close').forEach(function (el) {
		el.addEventListener('click', close);
	});

	// Follow a link -> close the drawer so the destination isn't behind it.
	panel.addEventListener('click', function (e) {
		if (e.target.closest('a[href]')) close();
	});

	// Resizing up to desktop while open: reset.
	window.addEventListener('resize', function () {
		if (window.innerWidth > 1080) close();
	});
})();
