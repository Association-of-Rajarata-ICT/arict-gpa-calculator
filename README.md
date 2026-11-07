# ARICT GPA Calculator

> **The free GPA calculator for the Faculty of Applied Sciences, Rajarata University of Sri Lanka.**  
> Live at **[gpa.arict.lk](https://gpa.arict.lk)**

![ARICT GPA Calculator](docs/social/gpa-flyer-landscape-1920x1080.jpg)

---

## What it does

Most GPA calculators require you to type 30+ course grades manually and only tell you where you are. This one **auto-fills your entire academic history from the university EIS in one click** and shows you **how to get to the next class**.

| Feature                                | Detail                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **⚡ 1-Click EiS Auto-Fill**           | Log in with university EIS credentials to auto-populate all enrolled semesters, course codes, and grades |
| **5 departments**                      | Biological Sciences, Chemical Sciences, Computing, Health Promotion, Physical Sciences                  |
| **Auto-detects department & track**    | Automatically identifies your department from your registration number (e.g., `ICT` → Computing)        |
| **BSc & Honours**                      | 3-year BSc and 4-year BSc Honours — choose per department                                               |
| **Repeat & Medical Cert (MC) support** | Automatically uses the latest repeat attempt grade and properly parses medical certificate results      |
| **Semester, cumulative & overall GPA** | Follows the FAS Student Handbook 2022/23 grading rules                                                  |
| **Degree class**                       | First, Second Upper, Second Lower, Pass                                                                 |
| **Next-class planner**                 | Shows the GPA your remaining courses need; suggests a grade for each; lets you test "what if" changes   |
| **PDF report & backup**                | Exports a designed A4 report; upload it later to restore every grade, even after clearing your browser  |
| **Privacy-first**                      | Zero passwords stored; credentials are authenticated directly with EIS via a stateless proxy            |
| **Dark & light themes**                | Works on phone and desktop with smooth animations and responsive design                                 |

---

## ⚡ 1-Click EiS Auto-Fill (New)

Students no longer have to manually select courses or type 30+ grades. 

1. Click **Import from EIS** on the calculator page.
2. Enter your student registration number (e.g. `ICT/2022/074`) and EIS password.
3. The calculator securely authenticates with the university Examination Information System (EIS) and instantly:
   - **Detects your department** and academic track.
   - **Loads all registered semesters** (including Pre-semesters and repeats).
   - **Resolves repeat attempts** (e.g. `C- C` automatically resolves to the latest grade `C`).
   - **Handles Medical Certificates** (e.g. `MC B` extracts `B`; pending `MC` remains ungraded).
   - **Hides courses you did not take**, tailoring the curriculum to your exact enrolment.
   - **Calculates your exact GPA** and prompts your next-class targets.

> **Privacy Promise:** Your credentials are used solely to establish an active session with EIS in real-time. Neither your password nor your results are ever stored on any external server or database. All grade data resides strictly within your local browser storage.

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   └── eis/route.js        Stateless serverless proxy to authenticate & parse EIS profile HTML
│   ├── page.js                 Home — hero, how-it-works, planner overview, FAQ
│   └── calculator/page.js      /calculator — full calculator, EIS sync & next-class planner
├── components/
│   ├── EISSection.js           Dedicated 1-click EIS import hero banner
│   ├── EISLoginDialog.js       Modal for secure EIS authentication
│   ├── DepartmentPicker.js     Manual department selector (fallback)
│   ├── SemesterCard.js         Semester course grade rows & credit calculations
│   ├── SummaryPanel.js         Cumulative GPA & class standing summary card
│   ├── PlannerPanel.js         Next-class goal planner & target grades
│   ├── DegreeStep.js           BSc (3-yr) vs BSc Honours (4-yr) selector
│   └── motion/
│       ├── PageTransition.js   Two-layer curtain transition
│       └── ReportPreview3D.js  Interactive 3D PDF report preview
├── data/
│   ├── courses.js              Course list (titles, years, semesters)
│   ├── departments.js          Handbook courses (practicals, projects, FAM) from FAS Handbook 2022/23
│   └── faq.js                  Frequently asked questions
└── lib/
    ├── eis.js                  EIS payload parser & state mapper
    ├── gpa.js                  Handbook grading calculations, credits & class thresholds
    ├── planner.js              Next-class target planner algorithm
    ├── report.js               PDF report builder (pdf-lib)
    └── storage.js              localStorage persistence & state sanitizer
```

- `/` — Landing page with interactive 3D hero, features walkthrough, grading rules, and FAQ.
- `/calculator` — Core application: 1-Click EIS Auto-Fill → Department Picker → Degree selection → Semester courses → Live GPA summary → Next-class planner.
- `/api/eis` — Next.js API route that acts as a secure, stateless bridge to `eis.rjt.ac.lk`.

---

## Data & Grading Rules

| What                                | Source                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Course titles, years, semesters     | `src/data/courses.js` — FAS curriculum timetable                                                        |
| Practicals, projects, training, FAM | `src/data/departments.js` (`HANDBOOK_COURSES`) — FAS Handbook 2022/23                                   |
| Credits                             | Second digit of the course code (Handbook §8.6): e.g. ICT 1**4**07 = 4 credits                           |
| Non-GPA courses                     | FDN courses and IDC 1202 (Handbook §8.8) — zero credit weight                                           |
| Grade points                        | A+/A 4.0 · A− 3.7 · B+ 3.3 · B 3.0 · B− 2.7 · C+ 2.3 · C 2.0 · C− 1.7 · D+ 1.3 · D 1.0 · E 0.0 (§8.10.2) |
| GPA formula                         | Σ(points × credits) / Σcredits, **truncated** to two decimals (§8.10.3)                                  |
| Class bands                         | First ≥ 3.70 · Second Upper ≥ 3.30 · Second Lower ≥ 3.00 · Pass ≥ 2.00 (§8.11)                           |

---

## PDF Backup & Restore

- **Export:** "Download PDF report" builds a styled A4 report in-browser using `pdf-lib`. It includes the official ARICT header, cumulative GPA, class band, semester progression chart, and itemized course grades. The saved state is embedded as metadata and an `arict-gpa-backup.json` attachment.
- **Restore:** "Restore from PDF" parses the embedded metadata from any previously downloaded report and instantly restores all your grades.

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev     # http://localhost:3000

# Run linter
npm run lint

# Build for production (deployed on Vercel)
npm run build
```

**Tech stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · GSAP · Lenis · Three.js · pdf-lib · Lucide React

---

## Disclaimer

This is an **unofficial study aid** built by [ARICT](https://arict.lk) as an open-source student project. Your official results are on the university EIS. Always verify your official standing with the faculty.

---

_Built with ❤️ by the Association of Rajarata Information & Communication Technology (ARICT)_
