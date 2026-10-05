/* Vendored from the live conifers.ai markup. Structure and class names are
 * reproduced verbatim so app/conifers.css (the site's own stylesheet) applies
 * unchanged. Edit the copy here; keep the class names in sync with the theme. */

import { TestimonialMarquee } from "./TestimonialMarquee";

export function CustomersSection() {
  return (
    <section className="wp-block-group alignfull section section--cream is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow" id="customers">
    <div className="wp-block-group wrap is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
    <div className="wp-block-group sec-head is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
    <div className="wp-block-group sec-meta is-layout-flow wp-container-core-group-is-layout-a7dce961 wp-block-group-is-layout-flow">
    <p className="eyebrow on-light wp-block-paragraph">Customers</p>
    </div>
    
    
    
    <h2 className="wp-block-heading sec-title">What our customers are saying.</h2>
    
    
    
    <p className="sec-sub wp-block-paragraph">Security teams running <a href="https://www.conifers.ai/ai-soc-agents/">CognitiveSOC</a>, the leading <a href="https://www.conifers.ai/blog/top-ai-soc-agents/">agentic AI SOC platform</a>, are seeing results from day one.</p>
    </div>
    </div>
    
    
    
    <div className="wrap">
    		<TestimonialMarquee />
    		<div style={{ textAlign: 'center' }}><a className="t-link" href="https://www.conifers.ai/customer-case-studies/">Read customer case studies <span className="arrow">→</span></a></div>
    	</div>
    </section>
  );
}
