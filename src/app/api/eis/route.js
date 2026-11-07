// Disable strict TLS verification for EIS's questionable certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Handle preflight CORS requests.
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// Roman numeral → integer mapping
// ---------------------------------------------------------------------------
const ROMAN_MAP = { I: 1, II: 2, III: 3, IV: 4 };

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Extract student information from the profile HTML.
 * The info sits inside a `<div>` with key-value lines like:
 *   Registration No.: ICT/2022/074
 */
function parseStudentInfo(html) {
  const field = (label) => {
    const re = new RegExp(`${label}\\s*:\\s*(.+?)(?:<|\\r?\\n)`, "i");
    const m = html.match(re);
    return m ? m[1].trim() : null;
  };

  return {
    regNo: field("Registration No\\.?"),
    name: field("Name"),
    fullName: field("Full Name"),
    module: field("Registered Module"),
    degreeProgram: field("Degree Program"),
    indexNo: field("Index No\\.?"),
  };
}

/**
 * Parse semester tables from the profile HTML.
 *
 * Each table has:
 *  - A header row  `<tr><td colspan=3><b>Selected Subjects in Year I, Semester II, 21/22</b></td></tr>`
 *  - Course rows   `<tr><td>1</td><td>ICT1305</td><td>Data Structures</td><td> C</td></tr>`
 */
function parseSemesters(html) {
  const semesters = [];

  // Match each <table>…</table> block
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];

    // Look for the semester header inside this table
    const headerMatch = tableHtml.match(
      /Selected\s+Subjects\s+in\s+Year\s+(I{1,3}V?|IV),\s*(Pre-semester|Semester\s+I{1,3}V?|Semester\s+IV),\s*([\d/]+)/i
    );
    if (!headerMatch) continue;

    const yearRoman = headerMatch[1].trim();
    const semesterText = headerMatch[2].trim();
    const academicYear = headerMatch[3].trim();

    const year = ROMAN_MAP[yearRoman] ?? parseInt(yearRoman, 10);

    let semester;
    if (/pre-semester/i.test(semesterText)) {
      semester = 1;
    } else {
      const semRomanMatch = semesterText.match(/(I{1,3}V?|IV)$/);
      semester = semRomanMatch ? (ROMAN_MAP[semRomanMatch[1]] ?? 1) : 1;
    }

    const label = `Year ${yearRoman}, ${semesterText}, ${academicYear}`;

    // Extract course rows: rows whose first <td> contains a number (row index)
    const courses = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];
      // Collect all <td> cell contents
      const cells = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        // Strip any remaining HTML tags and trim
        cells.push(cellMatch[1].replace(/<[^>]*>/g, "").trim());
      }

      // A course row has at least 4 cells: index, code, title, grade
      // The first cell is a numeric index (1, 2, 3…)
      if (cells.length >= 3 && /^\d+$/.test(cells[0])) {
        const code = cells[1].trim();
        const title = cells[2].trim();
        let rawGrade = cells.length >= 4 ? cells[3].trim() : "";

        // Parse repeat grades and Medical Concessions (MC).
        // EIS displays multiple attempts space-separated (e.g. "D+ E", "C- D D", "C- C").
        // When multiple attempts exist, the highest grade obtained across all attempts is used for GPA calculation.
        // "MC" stands for Medical Concession and is not a grade.
        const tokens = rawGrade.split(/\s+/).filter((t) => t && t !== "MC");

        // Validate and rank from highest to lowest grade
        const GRADE_RANK = [
          "A+", "A", "A-",
          "B+", "B", "B-",
          "C+", "C", "C-",
          "D+", "D",
          "E",
        ];
        const validGrades = tokens.filter((t) => GRADE_RANK.includes(t));
        validGrades.sort((a, b) => GRADE_RANK.indexOf(a) - GRADE_RANK.indexOf(b));
        const grade = validGrades[0] ?? null;

        courses.push({ code, title, grade });
      }
    }

    semesters.push({ year, semester, label, courses });
  }

  return semesters;
}

// ---------------------------------------------------------------------------
// Main POST handler
// ---------------------------------------------------------------------------

/**
 * POST /api/eis
 * Body: { studentId: string, password: string }
 *
 * 1. Logs into EIS and captures the session cookie.
 * 2. Fetches the profile page.
 * 3. Parses student info + course results.
 * 4. Logs out.
 * 5. Returns structured JSON.
 */
export async function POST(request) {
  try {
    const { studentId, password } = await request.json();

    if (!studentId || !password) {
      return NextResponse.json(
        { success: false, error: "studentId and password are required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // ------------------------------------------------------------------
    // Step 1 — Login
    // ------------------------------------------------------------------
    const loginBody = new URLSearchParams({
      uname: studentId,
      password,
      go: "Go",
    });

    const loginRes = await fetch("https://eis.rjt.ac.lk/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: loginBody.toString(),
      redirect: "manual", // capture the 302 + Set-Cookie
    });

    // Extract PHPSESSID from Set-Cookie header
    const rawCookies = typeof loginRes.headers.getSetCookie === "function"
      ? loginRes.headers.getSetCookie().join("; ")
      : (loginRes.headers.get("set-cookie") || loginRes.headers.get("Set-Cookie") || "");
    const sessionMatch = rawCookies.match(/PHPSESSID=([^;]+)/);

    if (!sessionMatch) {
      // If the server didn't redirect / set a cookie, credentials are likely wrong
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const sessionCookie = `PHPSESSID=${sessionMatch[1]}`;

    // ------------------------------------------------------------------
    // Step 2 — Fetch profile page
    // ------------------------------------------------------------------
    const profileRes = await fetch("https://eis.rjt.ac.lk/profile/", {
      headers: { Cookie: sessionCookie },
    });

    if (!profileRes.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch profile page" },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const profileHtml = await profileRes.text();

    // Quick sanity check — if the page doesn't contain expected info, login
    // may have failed silently (e.g., redirected back to login).
    if (
      !profileHtml.includes("Registration No") &&
      !profileHtml.includes("Selected Subjects")
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // ------------------------------------------------------------------
    // Step 3 — Parse
    // ------------------------------------------------------------------
    const student = parseStudentInfo(profileHtml);
    const semesters = parseSemesters(profileHtml);

    // ------------------------------------------------------------------
    // Step 4 — Logout (fire-and-forget)
    // ------------------------------------------------------------------
    fetch("https://eis.rjt.ac.lk/logout.php", {
      headers: { Cookie: sessionCookie },
    }).catch(() => {
      /* swallow — logout failure is non-critical */
    });

    // ------------------------------------------------------------------
    // Step 5 — Return structured JSON
    // ------------------------------------------------------------------
    return NextResponse.json(
      { success: true, student, semesters },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("[EIS Proxy Error]", err);

    // Network / JSON parse / unexpected errors
    const message =
      err instanceof SyntaxError
        ? "Invalid request body — expected JSON with studentId and password"
        : "An unexpected error occurred while contacting EIS";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
