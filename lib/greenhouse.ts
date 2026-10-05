/**
 * Conifers publishes openings through Greenhouse (board token
 * `conifersaicareers`). The public job-board API needs no key, so the careers
 * page renders straight from it and stays in sync without a CMS step.
 */

import { LOCAL_ROLES } from "./local-roles";

export const BOARD_TOKEN = "conifersaicareers";
export const BOARD_URL = `https://boards.greenhouse.io/${BOARD_TOKEN}`;


const API = `https://boards-api.greenhouse.io/v1/boards/${BOARD_TOKEN}`;

/** Revalidate the board hourly — postings change on the order of days. */
const REVALIDATE_SECONDS = 3600;

export type Role = {
  id: number;
  title: string;
  location: string;
  /** Greenhouse posting URL, or an in-platform /careers/<slug> path. */
  applyUrl: string;
  updatedAt: string;
  /** True for Greenhouse postings, which open on their own board. */
  external: boolean;
  /** Short status pill, e.g. "Actively hiring". */
  badge?: string;
};

export type Department = {
  name: string;
  roles: Role[];
};

type GhJob = {
  id: number;
  title: string;
  absolute_url: string;
  updated_at: string;
  location: { name: string } | null;
};

type GhDepartment = {
  id: number;
  name: string;
  jobs: GhJob[];
};

function toRole(job: GhJob): Role {
  const title = job.title.trim();
  return {
    id: job.id,
    // Greenhouse titles and locations frequently carry stray whitespace.
    title,
    location: job.location?.name?.trim() || "Remote",
    // Applications are taken here rather than on Greenhouse, so the board links
    // to our own detail page.
    applyUrl: `/careers/${greenhouseSlug(title, job.id)}`,
    updatedAt: job.updated_at,
    external: false,
  };
}

/**
 * URL slug for a Greenhouse posting.
 *
 * The id is appended because Greenhouse titles are edited in place — "Security
 * Sales Engineer" became "Sales Engineer" during this project — and a slug
 * derived from the title alone would break every existing link on a rename.
 * Resolution reads the trailing id, so old links keep working.
 */
export function greenhouseSlug(title: string, id: number): string {
  return `${slugify(title)}-${id}`;
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents left by NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Pulls the Greenhouse job id back out of a slug, or null if there isn't one. */
export function jobIdFromSlug(slug: string): number | null {
  const m = /-(\d+)$/.exec(slug);
  return m ? Number(m[1]) : null;
}

export type GreenhouseJobDetail = {
  id: number;
  slug: string;
  title: string;
  location: string;
  department: string;
  /** Raw posting body from Greenhouse: HTML, entity-escaped, unsanitised. */
  contentHtml: string;
  updatedAt: string;
};

type GhJobFull = GhJob & {
  content?: string;
  departments?: { name: string }[];
};

/**
 * Every posting with its description. One request serves both the detail pages
 * and the static params, and the hourly cache keeps it cheap.
 */
export async function getGreenhouseJobs(): Promise<GreenhouseJobDetail[]> {
  try {
    const res = await fetch(`${API}/jobs?content=true`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error(`Greenhouse responded ${res.status}`);
      return [];
    }

    const data = (await res.json()) as { jobs: GhJobFull[] };
    return data.jobs.map((job) => {
      const title = job.title.trim();
      return {
        id: job.id,
        slug: greenhouseSlug(title, job.id),
        title,
        location: job.location?.name?.trim() || "Remote",
        department: job.departments?.[0]?.name?.trim() || "Open roles",
        contentHtml: job.content || "",
        updatedAt: job.updated_at,
      };
    });
  } catch (err) {
    console.error("Failed to load Greenhouse postings", err);
    return [];
  }
}

export async function getGreenhouseJob(
  slug: string,
): Promise<GreenhouseJobDetail | null> {
  const id = jobIdFromSlug(slug);
  if (id === null) return null;
  const jobs = await getGreenhouseJobs();
  return jobs.find((j) => j.id === id) ?? null;
}

/**
 * Fetches open roles grouped by department, dropping departments with no live
 * postings (the live board does the same). Returns an empty list rather than
 * throwing: a board outage should degrade to the "view all openings" fallback,
 * not take the whole careers page down.
 */
export async function getDepartments(): Promise<Department[]> {
  try {
    const res = await fetch(`${API}/departments`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      console.error(`Greenhouse responded ${res.status}`);
      return [];
    }

    const data = (await res.json()) as { departments: GhDepartment[] };

    const fromBoard = data.departments
      .filter((dept) => dept.jobs.length > 0)
      .map((dept) => ({
        // The board's own department names carry a trailing space.
        name: dept.name.trim(),
        roles: dept.jobs.map(toRole),
      }));

    return mergeLocalRoles(fromBoard);
  } catch (err) {
    console.error("Failed to load Greenhouse board", err);
    // Roles posted here don't depend on Greenhouse, so still show them.
    return mergeLocalRoles([]);
  }
}

/**
 * Folds the locally posted roles into the Greenhouse departments, creating a
 * department if the board has none by that name, then sorts everything so the
 * board reads the same way regardless of where a role came from.
 */
function mergeLocalRoles(departments: Department[]): Department[] {
  const byName = new Map(departments.map((d) => [d.name, { ...d, roles: [...d.roles] }]));

  for (const local of LOCAL_ROLES) {
    const role: Role = {
      // Local ids are negative so they can never collide with a Greenhouse id.
      id: -(LOCAL_ROLES.indexOf(local) + 1),
      title: local.title,
      location: local.location,
      applyUrl: `/careers/${local.slug}`,
      updatedAt: new Date(0).toISOString(),
      external: false,
      badge: local.badge,
    };

    const dept = byName.get(local.department);
    if (dept) {
      dept.roles.push(role);
    } else {
      byName.set(local.department, { name: local.department, roles: [role] });
    }
  }

  return [...byName.values()]
    .map((d) => ({
      ...d,
      roles: d.roles.sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
