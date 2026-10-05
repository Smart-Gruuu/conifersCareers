/**
 * ConifersHello — announcement / hello bar behaviour.
 *
 * Progressive enhancement over the server-rendered bar (#cf-hellobar). All
 * configuration is read from data-* attributes so the markup stays fully
 * page-cache friendly (no per-visitor server variation, no nonce).
 *
 * Responsibilities:
 *   - pick which message shows (sequential rotation, or a sticky A/B variant),
 *     OR build a seamless, gap-free marquee ticker of all messages;
 *   - reveal the bar (immediately, after a delay, or after a scroll %), sliding
 *     it in from the top when it is an overlay;
 *   - auto-hide after the timeout (session-scoped);
 *   - handle the dismiss button (persisted, keyed to the current content);
 *   - beacon impression + click counts to the REST tracker for the A/B report.
 *
 * @package Conifers_v2
 */
( function () {
	'use strict';

	var bar = document.getElementById( 'cf-hellobar' );
	if ( ! bar ) {
		return;
	}

	var root      = document.documentElement;
	var msgs      = Array.prototype.slice.call( bar.querySelectorAll( '.cf-hb-msg' ) );
	if ( ! msgs.length ) {
		return;
	}

	var sig       = bar.getAttribute( 'data-sig' ) || '';
	var mode      = bar.getAttribute( 'data-mode' ) || 'rotate';
	var marquee   = bar.getAttribute( 'data-marquee' ) === '1';
	var timeout   = parseInt( bar.getAttribute( 'data-timeout' ), 10 ) || 0;
	var rotateFor = parseInt( bar.getAttribute( 'data-rotate' ), 10 ) || 0;
	var trackUrl  = bar.getAttribute( 'data-track' ) || '';
	var reveal    = bar.getAttribute( 'data-reveal' ) || 'immediate';
	var revDelay  = parseInt( bar.getAttribute( 'data-reveal-delay' ), 10 ) || 0;
	var revScroll = parseInt( bar.getAttribute( 'data-reveal-scroll' ), 10 ) || 0;
	var reduced   = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	var overlay   = 'immediate' !== reveal;

	var seen = {}; // impression de-dupe within this pageview.

	/**
	 * Fire-and-forget beacon to the A/B tracker.
	 *
	 * @param {string} id    Message id.
	 * @param {string} event 'impression' | 'click'.
	 */
	function track( id, event ) {
		if ( ! trackUrl || ! id ) {
			return;
		}
		var payload = JSON.stringify( { id: id, event: event, sig: sig } );
		try {
			if ( navigator.sendBeacon ) {
				navigator.sendBeacon( trackUrl, new Blob( [ payload ], { type: 'application/json' } ) );
			} else {
				fetch( trackUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true, credentials: 'omit' } );
			}
		} catch ( e ) {}
	}

	/**
	 * Record a message's impression once per pageview.
	 *
	 * @param {string} id Message id.
	 */
	function impression( id ) {
		if ( id && ! seen[ id ] ) {
			seen[ id ] = true;
			track( id, 'impression' );
		}
	}

	/* ---------------------------------------------------------------------
	 * Marquee — seamless, gap-free ticker
	 * ------------------------------------------------------------------ */

	/**
	 * Build the marquee. A single message that fits is centred and static; a
	 * single long message, or several messages, becomes a continuous ticker
	 * that is duplicated until it always fills the bar (no lonely headline
	 * drifting through empty space).
	 */
	/**
	 * Intrinsic (shrink-to-fit) width of a message's content, measured off-screen
	 * so the stretched live element's width does not mislead us.
	 *
	 * @param {HTMLElement} src Message element.
	 * @return {number} px.
	 */
	function measureContentWidth( src ) {
		var clone = src.cloneNode( true );
		clone.classList.remove( 'is-active' );
		clone.style.cssText = 'position:absolute;inset:auto;left:-9999px;top:0;right:auto;bottom:auto;visibility:hidden;opacity:0;display:inline-flex;width:auto;white-space:nowrap;';
		( bar.querySelector( '.cf-hb-inner' ) || bar ).appendChild( clone );
		var w = clone.scrollWidth || Math.ceil( clone.getBoundingClientRect().width );
		clone.parentNode.removeChild( clone );
		return Math.ceil( w );
	}

	function buildMarquee() {
		var trackEl = bar.querySelector( '.cf-hb-track' );
		if ( ! trackEl ) {
			return;
		}
		var containerW = Math.round( trackEl.getBoundingClientRect().width )
			|| Math.round( bar.getBoundingClientRect().width )
			|| window.innerWidth || 1200;

		// Snapshot the message markup (keeps arrow, href, data-id).
		var items = msgs.map( function ( el ) {
			return { html: el.innerHTML, href: el.getAttribute( 'href' ), id: el.getAttribute( 'data-id' ) };
		} );

		// Single message that fits comfortably → centre it, no motion needed.
		// Measure the intrinsic text width (the live element is stretched to the
		// full bar width by position:absolute, so its own scrollWidth is useless).
		if ( items.length === 1 ) {
			var probe = measureContentWidth( msgs[ 0 ] );
			if ( reduced || probe <= containerW - 48 ) {
				bar.classList.add( 'cf-hb-mq-center' );
				msgs[ 0 ].classList.add( 'is-active' );
				impression( items[ 0 ].id );
				return;
			}
		}
		if ( reduced ) {
			// Reduced motion, multiple messages: just show the first, centred.
			msgs[ 0 ].classList.add( 'is-active' );
			items.forEach( function ( it ) { impression( it.id ); } );
			return;
		}

		/**
		 * Create one group: every message once, each followed by a separator.
		 *
		 * @return {HTMLElement}
		 */
		function makeGroup() {
			var g = document.createElement( 'div' );
			g.className = 'cf-hb-mq-group';
			items.forEach( function ( it ) {
				var node;
				if ( it.href ) {
					node = document.createElement( 'a' );
					node.href = it.href;
				} else {
					node = document.createElement( 'span' );
				}
				node.className = 'cf-hb-msg';
				node.setAttribute( 'data-id', it.id );
				node.innerHTML = it.html;
				g.appendChild( node );
				var sep = document.createElement( 'span' );
				sep.className = 'cf-hb-sep';
				sep.setAttribute( 'aria-hidden', 'true' );
				sep.textContent = '•';
				g.appendChild( sep );
			} );
			return g;
		}

		var mq = document.createElement( 'div' );
		mq.className = 'cf-hb-mq';

		// First group to measure the natural width of one full cycle.
		var first = makeGroup();
		mq.appendChild( first );
		trackEl.innerHTML = '';
		trackEl.appendChild( mq );
		bar.classList.add( 'cf-hb-mq-on' );

		var groupW = first.scrollWidth || 1;

		// Duplicate until the rail is long enough that translating it left by one
		// group width never exposes a gap — i.e. rail >= container + one group,
		// with a safety margin. This is what keeps the bar filled edge-to-edge.
		var minRail = containerW + groupW + 8;
		var guard   = 0;
		while ( mq.scrollWidth < minRail && guard < 60 ) {
			mq.appendChild( makeGroup() );
			guard++;
		}
		// Always have at least two groups for a clean loop.
		if ( mq.querySelectorAll( '.cf-hb-mq-group' ).length < 2 ) {
			mq.appendChild( makeGroup() );
		}

		// Loop by exactly one group width => seamless. Constant ~70px/s speed.
		mq.style.setProperty( '--cf-hb-group', groupW + 'px' );
		mq.style.setProperty( '--cf-hb-dur', Math.max( 8, Math.round( groupW / 70 ) ) + 's' );

		items.forEach( function ( it ) { impression( it.id ); } );
	}

	/* ---------------------------------------------------------------------
	 * Static (non-marquee) — rotate / A-B
	 * ------------------------------------------------------------------ */

	/**
	 * Reveal a single message by index, hide the rest, count its impression.
	 *
	 * @param {number} idx Index into msgs.
	 */
	function show( idx ) {
		msgs.forEach( function ( el, i ) {
			var active = i === idx;
			el.classList.toggle( 'is-active', active );
			if ( active ) {
				impression( el.getAttribute( 'data-id' ) );
			}
		} );
	}

	function initStatic() {
		var start = 0;
		if ( 'ab' === mode && msgs.length > 1 ) {
			var key = 'cfHbVariant:' + sig;
			var stored = null;
			try { stored = window.localStorage.getItem( key ); } catch ( e ) {}
			var pick = stored !== null ? parseInt( stored, 10 ) : -1;
			if ( isNaN( pick ) || pick < 0 || pick >= msgs.length ) {
				pick = Math.floor( Math.random() * msgs.length );
				try { window.localStorage.setItem( key, String( pick ) ); } catch ( e ) {}
			}
			start = pick;
		}
		show( start );

		if ( 'rotate' === mode && msgs.length > 1 && rotateFor > 0 ) {
			var current = start;
			window.setInterval( function () {
				if ( document.hidden ) {
					return; // don't rotate / count impressions on a background tab.
				}
				current = ( current + 1 ) % msgs.length;
				show( current );
			}, rotateFor * 1000 );
		}
	}

	/* ---------------------------------------------------------------------
	 * Reveal + hide
	 * ------------------------------------------------------------------ */

	var isShown = false;
	var hideTimer = null;

	/**
	 * Bring the bar on screen. For overlays this triggers the slide-in and
	 * offsets the page so the fixed bar does not cover the nav.
	 */
	function revealNow() {
		if ( isShown || root.classList.contains( 'cf-hb-off' ) ) {
			return;
		}
		isShown = true;
		if ( overlay ) {
			root.style.setProperty( '--cf-hb-h', bar.offsetHeight + 'px' );
			root.classList.add( 'cf-hb-shown' );
		}
		// Auto-hide countdown starts once the bar is actually visible.
		if ( timeout > 0 ) {
			hideTimer = window.setTimeout( function () { hide( 'auto' ); }, timeout * 1000 );
		}
	}

	/**
	 * Hide the bar. persist='dismiss' remembers it long-term (localStorage);
	 * persist='auto' only for this browsing session (sessionStorage).
	 *
	 * @param {string} persist 'dismiss' | 'auto'.
	 */
	function hide( persist ) {
		if ( hideTimer ) { window.clearTimeout( hideTimer ); }
		if ( overlay ) {
			root.classList.remove( 'cf-hb-shown' );
		}
		root.classList.add( 'cf-hb-off' );
		try {
			if ( 'dismiss' === persist ) {
				window.localStorage.setItem( 'cfHbDismiss', sig );
			} else {
				window.sessionStorage.setItem( 'cfHbAuto', sig );
			}
		} catch ( e ) {}
	}

	/* ---------------------------------------------------------------------
	 * Init
	 * ------------------------------------------------------------------ */

	if ( root.classList.contains( 'cf-hb-off' ) ) {
		return; // already dismissed / auto-hid this announcement.
	}

	if ( marquee ) {
		buildMarquee();
	} else {
		initStatic();
	}

	// Dismiss button.
	var closeBtn = bar.querySelector( '.cf-hb-close' );
	if ( closeBtn ) {
		closeBtn.addEventListener( 'click', function () { hide( 'dismiss' ); } );
	}

	// Click tracking (delegated; also catches the marquee clones).
	bar.addEventListener( 'click', function ( ev ) {
		var link = ev.target.closest ? ev.target.closest( 'a.cf-hb-msg' ) : null;
		if ( link ) {
			track( link.getAttribute( 'data-id' ), 'click' );
		}
	} );

	// Reveal trigger.
	if ( 'delay' === reveal ) {
		window.setTimeout( revealNow, Math.max( 0, revDelay ) * 1000 );
	} else if ( 'scroll' === reveal ) {
		var onScroll = function () {
			var h   = document.documentElement;
			var max = ( h.scrollHeight - h.clientHeight );
			var pct = max > 0 ? ( ( window.pageYOffset || h.scrollTop ) / max ) * 100 : 100;
			if ( pct >= revScroll ) {
				revealNow();
				window.removeEventListener( 'scroll', onScroll );
			}
		};
		window.addEventListener( 'scroll', onScroll, { passive: true } );
		onScroll();
	} else {
		revealNow(); // immediate (inline).
	}
}() );
