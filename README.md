# ARICT GPA Calculator

A semester and overall GPA calculator for the five departments of the Faculty of Applied Sciences, Rajarata University of Sri Lanka. It is planned for **gpa.arict.lk**.

- Choose a department and its courses load with their credits and GPA status already filled in.
- Pick a grade for each course to see the semester, cumulative and overall GPA, plus the class band.
- Applied Sciences students can switch subjects on and off. Anyone can move a course to the other semester, remove courses they aren't taking, or add their own.
- Everything is saved in the browser's `localStorage` under the key `arict-gpa:v1`. There's no backend and no sign-in. The Backup and Restore buttons move a JSON file between devices.

## Data and rules

| What | Where it comes from |
| --- | --- |
| Courses, titles, years and semesters | `src/data/courses.js`. This is the same 2026 timetable list papers.arict.lk uses. |
| Field practicals, projects, training and the FAM stream | `src/data/departments.js` (`HANDBOOK_COURSES`), taken from the FAS Student Handbook 2022/23. The handbook gives no semester for these, so they're marked "Semester not confirmed". |
| Credits | The second digit of the course code (Handbook §8.6), e.g. ICT 1**4**07 = 4 credits |
| Non-GPA courses | FDN courses and IDC 1202 (Handbook §8.8). See `NON_GPA_CODES`. |
| Grade points | A+/A 4.0, A- 3.7, B+ 3.3, B 3.0, B- 2.7, C+ 2.3, C 2.0, C- 1.7, D+ 1.3, D 1.0, E 0.0 (§8.10.2) |
| GPA | Σ(points × credits) / Σcredits, truncated to two decimals (§8.10.3) |
| Class bands | First ≥ 3.70, Second Upper ≥ 3.30, Second Lower ≥ 3.00, Pass ≥ 2.00 (§8.11) |

To add or fix a course, edit the two data files. Credits always follow the code.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to ./out
```

## Deploy to gpa.arict.lk (Vercel)

1. Push this folder to its own GitHub repository.
2. In Vercel, choose **Add New → Project**, import the repository and keep the Next.js preset. The output is a static export, so there are no environment variables to set.
3. Under **Project → Settings → Domains**, add `gpa.arict.lk`.
4. At the DNS provider for `arict.lk`, add a record:
   `CNAME  gpa  cname.vercel-dns.com`
   (If `arict.lk` already uses Vercel nameservers, Vercel adds this record itself.)

The site is a plain static export (`out/`), so any static host will also work.
