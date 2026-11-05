// Courses the timetables don't cover: field practicals, projects, training, and the
// Fisheries & Aquaculture stream. Source: FAS Student Handbook 2022/23 (aps.rjt.ac.lk).
// The handbook gives the year but not the semester, so `estimated` marks a best guess;
// students can move any course to the other semester in the app.
export const HANDBOOK_COURSES = [
  // Health Promotion field practicals (HPF) and projects (HPP)
  { code: "HPF1101", title: "Devising Applicable Measures of Individual and Group Health", year: 1, semester: 1, estimated: true },
  { code: "HPF1102", title: "Measuring Health Status of a Student Group", year: 1, semester: 2, estimated: true },
  { code: "HPF1203", title: "Activities to Improve Health of Student Groups", year: 1, semester: 2, estimated: true },
  { code: "HPF2201", title: "Applying Measures to Improve Health Status of a Student Group", year: 2, semester: 1, estimated: true },
  { code: "HPF2102", title: "Introduction to Field Settings", year: 2, semester: 1, estimated: true },
  { code: "HPF2103", title: "Engagement of Communities", year: 2, semester: 1, estimated: true },
  { code: "HPF2204", title: "Clarifying Health Issues with Assigned Communities", year: 2, semester: 1, estimated: true },
  { code: "HPF2105", title: "Devising Measures of Health in Partnership with Communities", year: 2, semester: 1, estimated: true },
  { code: "HPF2106", title: "Assessing Changes in Health Status of Student Groups", year: 2, semester: 2, estimated: true },
  { code: "HPF2207", title: "Clarifying Structural Determinants of Health with Communities", year: 2, semester: 2, estimated: true },
  { code: "HPF2211", title: "Addressing Structural Determinants of Health of Communities", year: 2, semester: 2, estimated: true },
  { code: "HPF2109", title: "Monitoring Progress of Communities", year: 2, semester: 2, estimated: true },
  { code: "HPF2110", title: "Clarifying Obstacles to Progress with Communities", year: 2, semester: 2, estimated: true },
  { code: "HPF3101", title: "Reporting Health Changes in Student Groups", year: 3, semester: 1, estimated: true },
  { code: "HPF3302", title: "Addressing Obstacles to Progress with Communities", year: 3, semester: 1, estimated: true },
  { code: "HPF3103", title: "Reviewing Progress with Communities and Redirecting Efforts", year: 3, semester: 1, estimated: true },
  { code: "HPF3208", title: "Progress Evaluation", year: 3, semester: 2, estimated: true },
  { code: "HPF3205", title: "Final Evaluation of Field Settings", year: 3, semester: 2, estimated: true },
  { code: "HPF3209", title: "Project Report Writing", year: 3, semester: 2, estimated: true },
  { code: "HPF3207", title: "Follow Up and Continuing Contact with Communities", year: 3, semester: 2, estimated: true },
  { code: "HPT4506", title: "Reduction and Control of Tobacco, Alcohol and Other Drug Related Harm", year: 4, semester: 1, estimated: true },
  { code: "HPT4204", title: "Reduction of Suicide", year: 4, semester: 2, estimated: true },
  { code: "HPP4801", title: "Project (Part I)", year: 4, semester: 1, estimated: true },
  { code: "HPP4802", title: "Project (Part II)", year: 4, semester: 2, estimated: true },
  // Computing
  { code: "ICT4609", title: "Individual Research Project", year: 4, semester: 2, estimated: true },
  { code: "ICT4410", title: "Industrial Training", year: 4, semester: 2, estimated: true },
  // Biological Sciences (honours)
  { code: "BDC4208", title: "Current Topics in Biodiversity Conservation", year: 4, semester: 1, estimated: true },
  { code: "BDC4209", title: "In-plant Training", year: 4, semester: 2, estimated: true },
  { code: "BDC4810", title: "Research Project", year: 4, semester: 2, estimated: true },
  { code: "MIB4208", title: "Current Topics in Microbiology", year: 4, semester: 1, estimated: true },
  { code: "MIB4209", title: "In-plant Training", year: 4, semester: 2, estimated: true },
  { code: "MIB4810", title: "Research Project", year: 4, semester: 2, estimated: true },
  { code: "BIO4603", title: "Research Project", year: 4, semester: 2, estimated: true },
  { code: "FAM4201", title: "Fishery Resources Management", year: 4, semester: 1, estimated: true },
  { code: "FAM4202", title: "Aquaculture Engineering", year: 4, semester: 1, estimated: true },
  { code: "FAM4203", title: "Aquafarming of Macrophytes", year: 4, semester: 1, estimated: true },
  { code: "FAM4204", title: "Fish Nutrition and Growth", year: 4, semester: 1, estimated: true },
  { code: "FAM4205", title: "Fish Health Management", year: 4, semester: 1, estimated: true },
  { code: "FAM4206", title: "Postharvest Techniques in Fisheries", year: 4, semester: 1, estimated: true },
  { code: "FAM4207", title: "Fishery Socioeconomics", year: 4, semester: 1, estimated: true },
  { code: "FAM4208", title: "Current Topics in Fisheries and Aquaculture Management", year: 4, semester: 1, estimated: true },
  { code: "FAM4209", title: "In-plant Training", year: 4, semester: 2, estimated: true },
  { code: "FAM4810", title: "Research Project", year: 4, semester: 2, estimated: true },
  // Chemical Sciences
  { code: "CHE3210", title: "Research Project", year: 3, semester: 2, estimated: true },
  { code: "CHE3121", title: "Industrial Training", year: 3, semester: 2, estimated: true },
  { code: "CHE3223", title: "Current Topics in Chemistry", year: 3, semester: 2, estimated: true },
  { code: "CHE4201", title: "Computational Chemistry", year: 4, semester: 1, estimated: true },
  { code: "CHE4212", title: "Pharmaceutical and Medicinal Chemistry", year: 4, semester: 1, estimated: true },
  { code: "CHE4213", title: "Chemical Toxicology", year: 4, semester: 1, estimated: true },
  { code: "CHE4216", title: "Scientific Research and Communication", year: 4, semester: 2, estimated: true },
  { code: "CHE4814", title: "Research Project and Seminars", year: 4, semester: 2, estimated: true },
  // Physical Sciences
  { code: "COM3405", title: "Group Project", year: 3, semester: 2, estimated: true },
  { code: "COM4604", title: "Research Project", year: 4, semester: 2, estimated: true },
  { code: "MAT4609", title: "Research Project", year: 4, semester: 2, estimated: true },
  { code: "STA3303", title: "Independent Study", year: 3, semester: 2, estimated: true },
];

// Zero-credit compulsory courses that "will not be used for the calculation of GPA"
// (Handbook §8.8.1 and the notes under Tables 8.9.1.1, 8.9.2.1 and 8.9.3.1).
export const NON_GPA_CODES = ["FDN1201", "FDN1202", "FDN1203", "FDN1204", "FDN1205", "FDN1306", "IDC1202"];

const ALL_FOUNDATION = ["FDN1201", "FDN1202", "FDN1203", "FDN1204", "FDN1205", "FDN1306"];
const INTERDISCIPLINARY = ["IDC1201", "IDC1202", "IDC2201", "IDC2202", "IDC2203", "IDC3203", "IDC3209", "IDC3211", "IDC3212"];

// Department → subject prefixes it lists, plus the shared courses its students sit (same lists
// as papers.arict.lk). Applied Sciences students pick subject combinations, so subjects can be
// switched off in the app; IT and Health Promotion follow a fixed curriculum.
export const DEPARTMENTS = [
  {
    id: "bio",
    name: "Biological Sciences",
    programme: "BSc / BSc Honours in Applied Sciences and Applied Biology",
    subjects: [
      { prefix: "BIO", label: "Biology" },
      { prefix: "BOT", label: "Botany" },
      { prefix: "ZOO", label: "Zoology" },
      { prefix: "BDC", label: "Biodiversity Conservation" },
      { prefix: "FAM", label: "Fisheries & Aquaculture" },
      { prefix: "MIB", label: "Microbiology" },
    ],
    shared: ["FDN1201", "FDN1202", "FDN1204", ...INTERDISCIPLINARY, "CHE1104", "CHE1105", "CHE1201", "CHE1203", "CHE1302"],
  },
  {
    id: "chem",
    name: "Chemical Sciences",
    programme: "BSc / BSc Honours in Applied Sciences and Chemistry",
    subjects: [{ prefix: "CHE", label: "Chemistry" }],
    shared: [...ALL_FOUNDATION, ...INTERDISCIPLINARY],
  },
  {
    id: "it",
    name: "Computing",
    programme: "BSc / BSc Honours in Information Technology",
    subjects: [{ prefix: "ICT", label: "Information Technology" }],
    shared: ["FDN1201", "FDN1203", "FDN1205", "FDN1306", "IDC1201", "IDC1202", "IDC2201", "IDC2203", "IDC3201"],
  },
  {
    id: "hp",
    name: "Health Promotion",
    programme: "BSc / BSc Honours in Health Promotion",
    subjects: [
      { prefix: "HPT", label: "Theory" },
      { prefix: "HPF", label: "Field practicals" },
      { prefix: "HPP", label: "Project" },
    ],
    shared: ["FDN1201", "FDN1202", "FDN1204", "IDC1201", "IDC1202", "IDC2201", "IDC3203", "BIO1201"],
  },
  {
    id: "phy",
    name: "Physical Sciences",
    programme: "BSc / BSc Honours in Applied Sciences and Industrial Mathematics",
    subjects: [
      { prefix: "MAT", label: "Mathematics" },
      { prefix: "STA", label: "Statistics" },
      { prefix: "PHY", label: "Physics" },
      { prefix: "COM", label: "Computer Science" },
    ],
    shared: [...ALL_FOUNDATION, ...INTERDISCIPLINARY],
  },
];
