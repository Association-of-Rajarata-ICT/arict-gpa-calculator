# ARICT GPA Calculator

> **The free GPA calculator for the Faculty of Applied Sciences, Rajarata University of Sri Lanka.**  
> Live at **[gpa.arict.lk](https://gpa.arict.lk)**

![ARICT GPA Calculator](docs/social/gpa-flyer-landscape-1920x1080.jpg)

---

## What it does

Most GPA calculators tell you where you are. This one also shows you **how to get to the next class**.

| Feature                                | Detail                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **5 departments**                      | Biological Sciences, Chemical Sciences, Computing, Health Promotion, Physical Sciences                 |
| **BSc & Honours**                      | 3-year BSc and 4-year BSc Honours — choose per department                                              |
| **Semester, cumulative & overall GPA** | Follows the FAS Student Handbook 2022/23 grading rules                                                 |
| **Degree class**                       | First, Second Upper, Second Lower, Pass                                                                |
| **Next-class planner**                 | Shows the GPA your remaining courses need; suggests a grade for each; lets you test "what if" changes  |
| **PDF report**                         | Exports a designed A4 report; upload it later to restore every grade, even after clearing your browser |
| **No sign-in**                         | Grades never leave your browser (`localStorage`)                                                       |
| **Dark & light themes**                | Works on phone and desktop                                                                             |

---

## Architecture

```
src/
├── app/                   Next.js App Router pages
│   ├── page.js            Home — hero, how-it-works, planner overview, FAQ
│   └── calculator/        /calculator — the full tool
├── components/
│   ├── motion/
│   │   └── PageTransition.js   Two-layer curtain transition (skipped for reduced motion)
│   └── ...
├── data/
│   ├── courses.js         Course list (titles, years, semesters) — same as papers.arict.lk
│   └── departments.js     Handbook courses (practicals, projects, FAM) from FAS Handbook 2022/23
└── lib/
    ├── planner.js         Next-class planner logic
    └── report.js          PDF report builder (pdf-lib)
```

**Two pages.**

- `/` — explains the tool: hero with a calculator preview, how it works, the next-class planner, PDF report, grading system and FAQ.
- `/calculator` — the tool itself: department picker → BSc / BSc Honours step → semester tables → summary → next-class planner.

**Page transitions.** Every internal link triggers a two-layer curtain with the page name (`src/components/motion/PageTransition.js`), skipped for `prefers-reduced-motion`.

**State.** Everything is saved in `localStorage` under the key `arict-gpa:v1`. Optional name and registration number are stored under `arict-gpa:profile`.

---

## Data & grading rules

| What                                | Source                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Course titles, years, semesters     | `src/data/courses.js` — same 2026 timetable as papers.arict.lk                                           |
| Practicals, projects, training, FAM | `src/data/departments.js` (`HANDBOOK_COURSES`) — FAS Handbook 2022/23; semester marked "not confirmed"   |
| Credits                             | Second digit of the course code (Handbook §8.6): e.g. ICT 1**4**07 = 4 credits                           |
| Non-GPA courses                     | FDN courses and IDC 1202 (Handbook §8.8) — see `NON_GPA_CODES`                                           |
| Grade points                        | A+/A 4.0 · A− 3.7 · B+ 3.3 · B 3.0 · B− 2.7 · C+ 2.3 · C 2.0 · C− 1.7 · D+ 1.3 · D 1.0 · E 0.0 (§8.10.2) |
| GPA formula                         | Σ(points × credits) / Σcredits, **truncated** to two decimals (§8.10.3)                                  |
| Class bands                         | First ≥ 3.70 · Second Upper ≥ 3.30 · Second Lower ≥ 3.00 · Pass ≥ 2.00 (§8.11)                           |

To add or fix a course, edit `src/data/courses.js` and/or `src/data/departments.js`. Credits always follow the course code.

---

## PDF backup & restore

**Export.** "Download PDF report" builds an A4 report in-browser using `pdf-lib`. It includes the ARICT header, overall GPA and class band, a semester GPA chart, a full course table, and the grading reference. The full saved state is embedded as:

- the `ARICTGPABackup` key in the PDF info dictionary, and
- an `arict-gpa-backup.json` file attachment.

**Restore.** "Restore from PDF" (department panel and summary panel) reads either copy and re-fills the calculator. Restoring replaces only the departments in the file and keeps any others. Older JSON backups are still accepted. A printed or "Save as PDF" copy has no embedded data and cannot be restored.

---

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export → ./out
```

**Tech stack:** Next.js 16 · React 19 · Tailwind CSS 4 · GSAP · Lenis · pdf-lib · Lucide React

---

## Disclaimer

This is an **unofficial study aid** built by [ARICT](https://arict.lk) as a student project. Your official results are on the university EIS. Always verify your GPA with your faculty.

---

_Built with ❤️ by the Association of Rajarata Information & Communication Technology (ARICT)_
