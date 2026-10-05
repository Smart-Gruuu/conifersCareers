/**
 * Roles posted directly on this site rather than through Greenhouse.
 *
 * These are merged into the careers board alongside the Greenhouse postings
 * (see lib/greenhouse.ts). Unlike a Greenhouse role, a local role links to an
 * in-platform detail page at /careers/<slug> and is applied for through the
 * form there, which emails the application to the company.
 */

export type LocalRole = {
  slug: string;
  title: string;
  /** Must match a department name on the Greenhouse board to merge into it. */
  department: string;
  location: string;
  /** Shown under the title on the detail page. */
  employmentType?: string;
  compensation?: string;
  /** Short status pill shown on the board and the detail page. */
  badge?: string;
  /** Lead paragraphs, rendered before the first heading. */
  intro: string[];
  sections: { heading: string; body?: string[]; bullets?: string[] }[];
};

export const LOCAL_ROLES: LocalRole[] = [
  {
    slug: "technical-advisor-us-client-bridge",
    title: "Technical Advisor – US Client Bridge",
    department: "Customer Experience",
    location: "Remote (Worldwide)",
    compensation: "$30/hour base, plus a bonus system",
    badge: "Actively hiring",
    intro: [
      "Conifers is transforming security operations centers (SOCs) with CognitiveSOC™, its AI SOC platform, enabling enterprises and MSSPs to achieve SOC excellence.",
      "By leveraging agentic AI, Conifers helps security teams investigate complex, multi-tier incidents with speed, accuracy, and trust.",
      "Led by seasoned cybersecurity leaders and backed by SYN Ventures, PICUS Capital, and others, the company brings deep industry knowledge and innovation to an increasingly AI-driven threat landscape.",
      "We’re building an AI-native security platform that enables autonomous agents to investigate real-world threats at a massive scale.",
    ],
    sections: [
      {
        heading: "About the role",
        body: [
          "You’ll be the communication bridge between our core engineering team in Tel Aviv and our clients across the US. Acting as a trusted technical liaison, you’ll translate complex technical concepts into clear communication, keep projects aligned across time zones, and ensure our clients feel supported and understood.",
          "If you thrive at the intersection of technology and communication, and enjoy connecting people and ideas across cultures, you’ll feel at home here.",
        ],
      },
      {
        heading: "What you’ll do",
        bullets: [
          "Serve as the primary communication link between Conifers’ developers in Tel Aviv and US-based clients",
          "Translate technical concepts, updates, and requirements clearly between engineering and client teams",
          "Facilitate meetings, syncs, and discussions across US time zones",
          "Ensure client needs, feedback, and questions are accurately relayed to the engineering team",
          "Support project coordination and keep stakeholders aligned on timelines and deliverables",
          "Build strong, trust-based relationships with clients and internal teams",
          "Bring clarity, ownership, and strong communication standards to every interaction",
        ],
      },
      {
        heading: "What you’ll bring",
        bullets: [
          "Strong technical foundation with hands-on knowledge of modern programming languages",
          "Full professional fluency in English, written and spoken — must",
          "Excellent communication and interpersonal skills",
          "Ability to explain technical topics to both technical and non-technical audiences",
          "Comfort working across time zones and with distributed, multicultural teams",
          "Strong ownership mindset and bias for action",
          "Self-driven and reliable in a remote work environment",
        ],
      },
      {
        heading: "Nice to have",
        bullets: [
          "Experience in the cybersecurity domain",
          "Experience in a client-facing or technical support role",
          "Experience working with US-based clients or teams",
          "Experience in a fast-paced startup environment",
        ],
      },
      {
        heading: "Compensation",
        bullets: ["$30/hour base, plus a bonus system"],
      },
    ],
  },
];

export function getLocalRole(slug: string): LocalRole | undefined {
  return LOCAL_ROLES.find((r) => r.slug === slug);
}
