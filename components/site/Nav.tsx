/* Vendored from the live conifers.ai markup. Structure and class names are
 * reproduced verbatim so app/conifers.css (the site's own stylesheet) applies
 * unchanged. Edit the copy here; keep the class names in sync with the theme. */

export function Nav() {
  return (
    <header className="nav wp-block-template-part">
    <div className="wrap nav-inner">
    	<button className="nav-burger" type="button" aria-label="Open menu" aria-controls="cf-drawer" aria-expanded="false">
    		<span className="nav-burger-lines" aria-hidden="true"></span>
    	</button>
    	<a className="brand" href="/" aria-label="Conifers home">
    		<img className="brand-logo" src="https://www.conifers.ai/wp-content/themes/conifers-v2/assets/img/conifers-logo.png" alt="Conifers" width="408" height="84" fetchPriority="high" decoding="async" />
    	</a>
    	<div className="nav-right">
    		<a href="/careers" className="btn btn-solid chamfer">Go to Careers</a>
    	</div>
    	<a href="/careers" className="nav-cta-mini btn btn-solid chamfer" aria-label="Go to Careers">
    		<span className="ncm-full">Go to Careers</span><span className="ncm-short" aria-hidden="true">Careers</span>
    	</a>
    </div>
    
    <div className="nav-drawer" id="cf-drawer">
    	<button className="nav-drawer-scrim" type="button" tabIndex={-1} aria-label="Close menu"></button>
    	<div className="nav-drawer-panel" role="dialog" aria-modal="true" aria-label="Site menu">
    		<div className="nav-drawer-top">
    			<a className="brand" href="/" aria-label="Conifers home">
    				<img className="brand-logo" src="https://www.conifers.ai/wp-content/themes/conifers-v2/assets/img/conifers-logo.png" alt="Conifers" width="408" height="84" decoding="async" />
    			</a>
    			<button className="nav-drawer-close" type="button" aria-label="Close menu">
    				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    			</button>
    		</div>
    		<a className="nav-feat" href="https://www.conifers.ai/news/conifers-named-leader-idc-marketscape-ai-soc-platforms/"><span className="nav-feat-kicker">Featured resource</span><span className="nav-feat-row"><span className="nav-feat-chip">News</span><span className="nav-feat-date">Sep 28, 2026</span></span><span className="nav-feat-title">Conifers Named a Leader in the IDC MarketScape: Worldwide Standalone AI SOC Platforms 2026 Vendor Assessment</span><span className="nav-feat-link">Read <span className="arrow">&rarr;</span></span></a>
    		<a href="/careers" className="btn btn-solid chamfer nav-drawer-cta">Go to Careers <span className="arrow">&rarr;</span></a>
    		<div className="footer-social"><a href="https://www.linkedin.com/company/conifers-ai/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8h4.6v13H.2V8zm7.5 0h4.4v1.78h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 7v6.6h-4.6v-5.85c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21H7.7V8z" /></svg></a><a href="https://x.com/ConifersAI" aria-label="X" target="_blank" rel="noopener noreferrer"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.5 8.6L23.3 22h-6.9l-5.4-7-6.2 7H1.7l8-9.2L.9 2h7.1l4.9 6.4L18.9 2zm-1.2 18h1.9L7.4 4H5.3l12.4 16z" /></svg></a><a href="https://www.instagram.com/lifeatconifers/" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17-.21-.55-.47-.94-.88-1.35-.41-.41-.8-.67-1.35-.88-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07zM12 6.87A5.13 5.13 0 1 0 12 17.13 5.13 5.13 0 0 0 12 6.87zm0 8.46A3.33 3.33 0 1 1 12 8.67a3.33 3.33 0 0 1 0 6.66zm6.54-8.66a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" /></svg></a></div>
    	</div>
    </div>
    
    </header>
  );
}
