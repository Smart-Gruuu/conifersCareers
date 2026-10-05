/**
 * Testimonials for the homepage marquee, lifted from the live page markup.
 *
 * On conifers.ai the logo lives inside <figcaption class="t-attr"> and the
 * theme script hoists it to be the first child of the card at runtime (the
 * `.tcard > .t-logo` rules depend on that position). Here the data is rendered
 * in its final shape instead, so no DOM surgery is needed - see
 * TestimonialMarquee.tsx.
 */

export type Testimonial = {
  quote: string;
  logo:
    | { kind: "img"; src: string; alt: string; width: string; height: string; style?: string }
    | { kind: "text"; text: string };
  avatar?: { src: string; alt: string };
  name: string;
  role: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "“Conifers clearly understands what we need to scale, especially in the face of increasingly sophisticated threats. The platform’s ability to continuously adapt to each of our clients’ specific information and profile and deliver high-quality investigations to meet this demand is a game-changer.”",
    logo: {
      kind: "img",
      src: "https://www.conifers.ai/wp-content/themes/conifers-v2/assets/img/amsys-logo.svg",
      alt: "AMSYS",
      width: "593",
      height: "265"
    },
    avatar: {
      src: "https://www.conifers.ai/wp-content/uploads/2026/08/shemon-bar-tal.jpg",
      alt: "Shemon Bar-Tal"
    },
    name: "Shemon Bar-Tal",
    role: "President of Global Services, AMSYS"
  },
  {
    quote: "“Conifers is transforming how we run our SOC. Instead of drowning in alerts or hiring more analysts, we now have agentic AI that acts with context, scales our expertise, and adapts in real time. It’s more than what automation provides. It’s intelligence we can trust.”",
    logo: {
      kind: "img",
      src: "https://www.conifers.ai/wp-content/themes/conifers-v2/assets/img/onesecure-logo.png",
      alt: "OneSecure",
      width: "200",
      height: "50"
    },
    avatar: {
      src: "https://www.conifers.ai/wp-content/uploads/2026/08/edmund-how.jpg",
      alt: "Edmund How"
    },
    name: "Edmund How",
    role: "Founder & CEO, OneSecure"
  },
  {
    quote: "“AI presents an opportunity to eliminate this compromise, enabling organizations to achieve both effectiveness and efficiency. With Conifers it’s possible to maintain comprehensive detection coverage while conducting deep, high-quality investigations, ensuring faster and more accurate responses to incidents.”",
    logo: {
      kind: "img",
      src: "https://www.conifers.ai/wp-content/themes/conifers-v2/assets/img/critical-start-logo.svg",
      alt: "Critical Start",
      width: "298",
      height: "55"
    },
    avatar: {
      src: "https://www.conifers.ai/wp-content/uploads/2026/08/randy-watkins.jpeg",
      alt: "Randy Watkins"
    },
    name: "Randy Watkins",
    role: "CTO, Critical Start"
  },
  {
    quote: "“The Conifers platform has enabled us to efficiently integrate AI capabilities into our SOC, leveraging our existing tools, processes, and procedures while continuously delivering increasing value. Its ability to manage dozens of tenants, each with its own baseline and customer-specific knowledge base, has significantly improved the quality of our operations.”",
    logo: {
      kind: "img",
      src: "https://www.conifers.ai/wp-content/themes/conifers-v2/assets/img/dtx-logo.png",
      alt: "DTX",
      width: "120",
      height: "102",
      style: "height:42px;"
    },
    avatar: {
      src: "https://www.conifers.ai/wp-content/uploads/2026/08/rutger-de-boer.jpeg",
      alt: "Rutger de Boer"
    },
    name: "Rutger de Boer",
    role: "CTO, DTX"
  },
  {
    quote: "“We evaluated every agentic SOC platform on the market. Conifers was the only one that grounded itself in our environment and scaled to our alert volume without adding headcount, and we can audit every decision it makes.”",
    logo: {
      kind: "text",
      text: "Fortune 500"
    },
    name: "VP, Security Operations",
    role: "Global financial services · undisclosed"
  },
];
