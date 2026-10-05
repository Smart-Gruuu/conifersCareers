"use client";

import { useState } from "react";
import { BOARD_URL, type Role } from "@/lib/greenhouse";
import { CAREERS_EMAIL } from "@/lib/company";

/**
 * Server-rendered equivalent of the Greenhouse widget the live careers page
 * fills at runtime. The markup mirrors that widget's output exactly - including
 * the `gw-*` hook attributes - so app/careers.css (the theme's own
 * pages/trust.min.css) styles it unchanged.
 */
export function RolesBoard({
  departments,
}: {
  departments: { name: string; roles: Role[] }[];
}) {
  // The live board renders every department expanded; the heads still toggle.
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <div className="gh-board">
      <div gw-departments-container="" className="gh-depts">
        {departments.map((dept) => {
          const expanded = !closed[dept.name];
          return (
            <div
              gw-departments-item=""
              className="gh-dept"
              gw-department-item={dept.name}
              key={dept.name}
            >
              <button
                type="button"
                className="gh-dept-head"
                aria-expanded={expanded}
                onClick={() =>
                  setClosed((c) => ({ ...c, [dept.name]: !c[dept.name] }))
                }
              >
                <span gw-departments-title="" className="gh-dept-name">
                  {dept.name}
                </span>
                <svg
                  className="gh-chev"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              <div className="gh-dept-panel">
                <div gw-jobs-container="" className="jobs-list">
                  {dept.roles.map((role) => (
                    <div gw-jobs-item="" className="gh-job" key={role.id}>
                      <a
                        gw-jobs-apply=""
                        href={role.applyUrl}
                        // Greenhouse postings live on their own board; roles
                        // posted here are applied for in place.
                        target={role.external ? "_blank" : undefined}
                        rel={role.external ? "noopener" : undefined}
                        className="job-row"
                      >
                        <div className="job-main">
                          <div className="job-title-row">
                            <h3 gw-jobs-title="" className="job-title">
                              {role.title}
                            </h3>
                            {role.badge && (
                              <span className="role-badge">{role.badge}</span>
                            )}
                          </div>
                          <div className="job-meta">
                            <span className="job-attr">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
                                <circle cx="12" cy="10" r="2.5" />
                              </svg>
                              <span gw-jobs-location="">{role.location}</span>
                            </span>
                          </div>
                        </div>
                        <span className="job-apply">
                          Apply <span className="arrow">&rarr;</span>
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* On the live page this is the pre-hydration placeholder. Here the board
          is server-rendered, so it only shows when the board came back empty. */}
      <p className="gh-empty" style={{ display: departments.length ? "none" : "block" }}>
        Open roles aren&rsquo;t available right now &mdash; view all openings on
        our{" "}
        <a href={BOARD_URL} target="_blank" rel="noopener">
          Greenhouse board
        </a>{" "}
        or <a href={`mailto:${CAREERS_EMAIL}`}>send us your CV</a>.
      </p>
    </div>
  );
}
