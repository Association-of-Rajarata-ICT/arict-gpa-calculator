// Maps EIS (Examination Information System) data into the GPA calculator's state format.
// EIS returns courses grouped by semesters with grades. This module converts that into the
// { dept, data: { [deptId]: { grades, hidden, custom, ... } } } shape the calculator expects.

import { DEPARTMENTS } from "@/data/departments";
import { normalizeCode, findCourse, GRADES, buildCourses } from "@/lib/gpa";
import { EMPTY_DEPT_DATA } from "@/lib/storage";

const VALID_GRADES = new Set(GRADES.map((g) => g.grade));

/**
 * Detects the department from the registration number prefix or the module name.
 * EIS reg numbers look like "ICT/2022/074", "CHE/2022/001", etc.
 */
export function detectDepartment(student) {
  const prefix = student.regNo?.split("/")[0]?.toUpperCase();
  const byPrefix = {
    ICT: "it",
    COM: "phy",
    MAT: "phy",
    STA: "phy",
    PHY: "phy",
    CHE: "chem",
    BIO: "bio",
    BOT: "bio",
    ZOO: "bio",
    MIB: "bio",
    BDC: "bio",
    HPT: "hp",
    HPF: "hp",
    HPP: "hp",
  };
  if (byPrefix[prefix]) return byPrefix[prefix];

  // Fallback: match on module name
  const mod = (student.module || "").toLowerCase();
  if (mod.includes("information technology")) return "it";
  if (mod.includes("chemistry") || mod.includes("chemical")) return "chem";
  if (mod.includes("biology") || mod.includes("biological") || mod.includes("biodiversity") || mod.includes("microbiology")) return "bio";
  if (mod.includes("health")) return "hp";
  if (mod.includes("mathematics") || mod.includes("physics") || mod.includes("statistics") || mod.includes("physical")) return "phy";

  return null;
}

/**
 * Given EIS response data, builds the state patch to import into the calculator.
 *
 * Returns: { state: { dept, data }, profile: { name, regNo } }
 *
 * Logic:
 * - For each EIS course, check if it exists in the app's catalogue
 * - If it exists: set the grade (if available)
 * - If the course exists in catalogue but NOT in EIS for that year: mark it hidden
 * - If the course does NOT exist in catalogue: add as custom course
 */
export function buildImportState(eisData) {
  const { student, semesters } = eisData;
  const deptId = detectDepartment(student);
  if (!deptId) {
    throw new Error(`Could not determine department for "${student.regNo}". Please select your department manually.`);
  }

  const dept = DEPARTMENTS.find((d) => d.id === deptId);
  if (!dept) throw new Error(`Unknown department: ${deptId}`);

  // Get all courses this department would normally show
  const catalogueCourses = buildCourses(dept, EMPTY_DEPT_DATA);
  const catalogueByCode = new Map(catalogueCourses.map((c) => [c.code, c]));

  // Collect all courses from EIS
  const eisCourses = new Map(); // code → { code, title, grade, year, semester }
  for (const sem of semesters) {
    for (const c of sem.courses) {
      const code = normalizeCode(c.code);
      eisCourses.set(code, {
        code,
        title: c.title,
        grade: c.grade && VALID_GRADES.has(c.grade) ? c.grade : null,
        year: sem.year,
        semester: sem.semester,
      });
    }
  }

  // Build grades map
  const grades = {};
  for (const [code, c] of eisCourses) {
    if (c.grade) {
      // If it's a catalogue course use the code directly, otherwise use eis- prefixed id
      if (catalogueByCode.has(code)) {
        grades[code] = c.grade;
      }
    }
  }

  // Figure out which catalogue courses the student DIDN'T enrol in → hide them.
  // Also detect if any catalogue courses were taken in a different semester → move them.
  // Only hide courses from years the student has registered semesters for.
  const registeredYears = new Set(semesters.map((s) => s.year));
  const hidden = [];
  const moved = {};

  for (const cat of catalogueCourses) {
    const code = cat.code;
    if (registeredYears.has(cat.year)) {
      if (!eisCourses.has(code)) {
        hidden.push(code);
      } else {
        const eisCourse = eisCourses.get(code);
        if (eisCourse.semester && eisCourse.semester !== cat.semester) {
          moved[cat.id] = eisCourse.semester;
        }
      }
    }
  }

  // Find EIS courses not in the catalogue → add as custom
  const custom = [];
  for (const [code, c] of eisCourses) {
    if (!catalogueByCode.has(code)) {
      const customId = `eis-${code}`;
      custom.push({
        id: customId,
        code: c.code,
        title: c.title,
        year: c.year,
        semester: c.semester,
        credits: Number(code.charAt(4)) || 0, // second digit of code = credits
        nonGpa: false,
      });
      if (c.grade) {
        grades[customId] = c.grade;
      }
    }
  }

  // Detect track: if any Year 4 courses are registered, likely Honours
  const maxYear = Math.max(...semesters.map((s) => s.year));
  const track = maxYear >= 4 ? "hons" : null;

  // Count stats for UI feedback
  const totalCourses = eisCourses.size;
  const gradedCourses = [...eisCourses.values()].filter((c) => c.grade).length;

  return {
    state: {
      dept: deptId,
      data: {
        [deptId]: {
          grades,
          moved,
          hidden,
          custom,
          subjects: null,
          track,
          goal: null,
          targets: {},
        },
      },
    },
    profile: {
      name: student.name || "",
      regNo: student.regNo || "",
    },
    stats: { totalCourses, gradedCourses },
  };
}
