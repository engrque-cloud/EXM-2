import {
  Department,
  AcademicSession,
  Course,
  User,
  DateSheetEntry,
  PaperSubmission,
  DutyAssignment,
  ExamResult,
  SystemNotification,
  UserRole,
  CollegeBranding,
  SystemActivityLog,
  YearTranscriptRecord,
} from '@/types/exam-system';

const STORAGE_KEYS = {
  CURRENT_DATE: 'ems_simulated_current_date',
  DEPARTMENTS: 'ems_departments',
  SESSIONS: 'ems_sessions',
  COURSES: 'ems_courses',
  USERS: 'ems_users',
  DATESHEET: 'ems_datesheet',
  PAPERS: 'ems_papers',
  DUTY_ROSTER: 'ems_duty_roster',
  RESULTS: 'ems_results',
  NOTIFICATIONS: 'ems_notifications',
  ACTIVE_USER_ID: 'ems_active_user_id',
  BRANDING: 'ems_college_branding',
  ACTIVITY_LOGS: 'ems_activity_logs',
  YEAR_TRANSCRIPTS: 'ems_year_transcripts',
  PERMANENT_MARKS: 'ems_permanent_student_marks',
};

export const DEFAULT_BRANDING: CollegeBranding = {
  collegeName: 'Apex Green Valley College',
  subTitle: 'Office of the Controller of Examinations',
  logoUrl: '',
  deputyRegistrarName: 'Dr. Richard Vance, Ph.D.',
  deputyRegistrarTitle: 'Deputy Registrar (Academics)',
  controllerName: 'Prof. Malcolm Thorne',
  controllerTitle: 'Controller of Examinations',
  sealText: 'OFFICIAL SEAL',
  sealSubText: 'Exam Controller',
  sealType: 'EMBOSSED',
  sealImageUrl: '/src/assets/images/exam_system_logo_1792130817114.jpg',
  sealColor: '#064e3b',
};

// Initial anchor date for the university simulator
export const DEFAULT_SIMULATED_DATE = '2026-10-15';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-eng', name: 'Department of English', code: 'ENG', hodName: 'Dr. Eleanor Wright' },
  { id: 'dept-mth', name: 'Department of Mathematics', code: 'MTH', hodName: 'Prof. Arthur Pendelton' },
  { id: 'dept-cs', name: 'Department of Computer Science', code: 'CS', hodName: 'Dr. Tariq Vance' },
];

export const INITIAL_SESSIONS: AcademicSession[] = [
  { id: 'sess-fall-26', name: 'Fall 2026', isCurrent: true, startDate: '2026-09-01', endDate: '2027-01-20' },
  { id: 'sess-spr-26', name: 'Spring 2026', isCurrent: false, startDate: '2026-02-01', endDate: '2026-06-30' },
];

export const INITIAL_COURSES: Course[] = [
  // --- English Semester 1 to 8 ---
  { id: 'eng-101', code: 'ENG-101', title: 'Functional English & Grammar', departmentId: 'dept-eng', semester: 1, creditHours: 3 },
  { id: 'eng-102', code: 'ENG-102', title: 'Introduction to Linguistics', departmentId: 'dept-eng', semester: 1, creditHours: 3 },
  { id: 'eng-201', code: 'ENG-201', title: 'Classical & Renaissance Poetry', departmentId: 'dept-eng', semester: 2, creditHours: 3 },
  { id: 'eng-202', code: 'ENG-202', title: 'Professional Communication Skills', departmentId: 'dept-eng', semester: 2, creditHours: 3 },
  { id: 'eng-301', code: 'ENG-301', title: 'Drama & Elizabethan Theatre', departmentId: 'dept-eng', semester: 3, creditHours: 3 },
  { id: 'eng-302', code: 'ENG-302', title: 'Phonetics & Applied Phonology', departmentId: 'dept-eng', semester: 3, creditHours: 3 },
  { id: 'eng-401', code: 'ENG-401', title: 'Romantic & Victorian Poetry', departmentId: 'dept-eng', semester: 4, creditHours: 3 },
  { id: 'eng-402', code: 'ENG-402', title: 'Academic Discourse & Rhetoric', departmentId: 'dept-eng', semester: 4, creditHours: 3 },
  { id: 'eng-501', code: 'ENG-501', title: '19th Century British Novel', departmentId: 'dept-eng', semester: 5, creditHours: 3 },
  { id: 'eng-502', code: 'ENG-502', title: 'Classical Literary Criticism', departmentId: 'dept-eng', semester: 5, creditHours: 3 },
  { id: 'eng-601', code: 'ENG-601', title: 'Modern American Drama', departmentId: 'dept-eng', semester: 6, creditHours: 3 },
  { id: 'eng-602', code: 'ENG-602', title: 'Sociolinguistics & Dialectology', departmentId: 'dept-eng', semester: 6, creditHours: 3 },
  { id: 'eng-701', code: 'ENG-701', title: 'Postcolonial Literature', departmentId: 'dept-eng', semester: 7, creditHours: 3 },
  { id: 'eng-702', code: 'ENG-702', title: 'Research Methodology in Humanities', departmentId: 'dept-eng', semester: 7, creditHours: 3 },
  { id: 'eng-801', code: 'ENG-801', title: 'Contemporary Critical Theory', departmentId: 'dept-eng', semester: 8, creditHours: 3 },
  { id: 'eng-802', code: 'ENG-802', title: 'Capstone Seminar & Dissertation', departmentId: 'dept-eng', semester: 8, creditHours: 6 },

  // --- Mathematics Semester 1 to 8 ---
  { id: 'mth-101', code: 'MTH-101', title: 'Calculus & Analytical Geometry I', departmentId: 'dept-mth', semester: 1, creditHours: 3 },
  { id: 'mth-102', code: 'MTH-102', title: 'Discrete Mathematical Structures', departmentId: 'dept-mth', semester: 1, creditHours: 3 },
  { id: 'mth-201', code: 'MTH-201', title: 'Calculus II & Series Expansions', departmentId: 'dept-mth', semester: 2, creditHours: 3 },
  { id: 'mth-202', code: 'MTH-202', title: 'Linear Algebra & Matrix Theory', departmentId: 'dept-mth', semester: 2, creditHours: 3 },
  { id: 'mth-301', code: 'MTH-301', title: 'Multivariable Calculus & Vector Analysis', departmentId: 'dept-mth', semester: 3, creditHours: 3 },
  { id: 'mth-302', code: 'MTH-302', title: 'Ordinary Differential Equations', departmentId: 'dept-mth', semester: 3, creditHours: 3 },
  { id: 'mth-401', code: 'MTH-401', title: 'Real Analysis I (Metric Spaces)', departmentId: 'dept-mth', semester: 4, creditHours: 3 },
  { id: 'mth-402', code: 'MTH-402', title: 'Numerical Computing & Error Analysis', departmentId: 'dept-mth', semester: 4, creditHours: 3 },
  { id: 'mth-501', code: 'MTH-501', title: 'Complex Variables & Transforms', departmentId: 'dept-mth', semester: 5, creditHours: 3 },
  { id: 'mth-502', code: 'MTH-502', title: 'Partial Differential Equations', departmentId: 'dept-mth', semester: 5, creditHours: 3 },
  { id: 'mth-601', code: 'MTH-601', title: 'Abstract Algebra & Group Theory', departmentId: 'dept-mth', semester: 6, creditHours: 3 },
  { id: 'mth-602', code: 'MTH-602', title: 'Probability & Mathematical Statistics', departmentId: 'dept-mth', semester: 6, creditHours: 3 },
  { id: 'mth-701', code: 'MTH-701', title: 'Point Set Topology', departmentId: 'dept-mth', semester: 7, creditHours: 3 },
  { id: 'mth-702', code: 'MTH-702', title: 'Mathematical Modeling & Simulation', departmentId: 'dept-mth', semester: 7, creditHours: 3 },
  { id: 'mth-801', code: 'MTH-801', title: 'Functional Analysis & Hilbert Spaces', departmentId: 'dept-mth', semester: 8, creditHours: 3 },
  { id: 'mth-802', code: 'MTH-802', title: 'Senior Research Project in Applied Math', departmentId: 'dept-mth', semester: 8, creditHours: 6 },

  // --- Computer Science Semester 1 to 8 ---
  { id: 'cs-101', code: 'CS-101', title: 'Introduction to Computing & Logic', departmentId: 'dept-cs', semester: 1, creditHours: 3 },
  { id: 'cs-102', code: 'CS-102', title: 'Programming Fundamentals (C/C++)', departmentId: 'dept-cs', semester: 1, creditHours: 4 },
  { id: 'cs-201', code: 'CS-201', title: 'Object Oriented Programming', departmentId: 'dept-cs', semester: 2, creditHours: 4 },
  { id: 'cs-202', code: 'CS-202', title: 'Digital Logic & Circuit Design', departmentId: 'dept-cs', semester: 2, creditHours: 3 },
  { id: 'cs-301', code: 'CS-301', title: 'Data Structures & Algorithms', departmentId: 'dept-cs', semester: 3, creditHours: 4 },
  { id: 'cs-302', code: 'CS-302', title: 'Computer Architecture & Assembly', departmentId: 'dept-cs', semester: 3, creditHours: 3 },
  { id: 'cs-401', code: 'CS-401', title: 'Database Systems & SQL Modeling', departmentId: 'dept-cs', semester: 4, creditHours: 4 },
  { id: 'cs-402', code: 'CS-402', title: 'Operating Systems & Kernel Architecture', departmentId: 'dept-cs', semester: 4, creditHours: 4 },
  { id: 'cs-501', code: 'CS-501', title: 'Design & Analysis of Algorithms', departmentId: 'dept-cs', semester: 5, creditHours: 3 },
  { id: 'cs-502', code: 'CS-502', title: 'Software Engineering & Lifecycle', departmentId: 'dept-cs', semester: 5, creditHours: 3 },
  { id: 'cs-601', code: 'CS-601', title: 'Artificial Intelligence & Machine Learning', departmentId: 'dept-cs', semester: 6, creditHours: 4 },
  { id: 'cs-602', code: 'CS-602', title: 'Computer Networks & TCP/IP Protocol', departmentId: 'dept-cs', semester: 6, creditHours: 3 },
  { id: 'cs-701', code: 'CS-701', title: 'Distributed Systems & Microservices', departmentId: 'dept-cs', semester: 7, creditHours: 3 },
  { id: 'cs-702', code: 'CS-702', title: 'Information Security & Cryptography', departmentId: 'dept-cs', semester: 7, creditHours: 3 },
  { id: 'cs-801', code: 'CS-801', title: 'Cloud Computing & DevOps Architecture', departmentId: 'dept-cs', semester: 8, creditHours: 3 },
  { id: 'cs-802', code: 'CS-802', title: 'Senior Year Capstone Project', departmentId: 'dept-cs', semester: 8, creditHours: 6 },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Dr. Alistair Sterling',
    email: 'controller.exam@university.edu',
    phoneNumber: '+92 300 8472910',
    role: 'ADMIN',
    designation: 'Controller of Examinations',
    isApproved: true,
    registeredAt: '2026-08-01',
    avatarSeed: 'sterling',
  },
  {
    id: 'usr-principal',
    name: 'Prof. Margaret Holloway',
    email: 'principal@university.edu',
    phoneNumber: '+92 321 4455667',
    role: 'PRINCIPAL',
    designation: 'College Principal & Dean of Academics',
    isApproved: true,
    registeredAt: '2026-08-01',
    avatarSeed: 'holloway',
  },
  {
    id: 'usr-qa',
    name: 'Dr. Victor Morales',
    email: 'qa.rigor@university.edu',
    phoneNumber: '+92 333 9812345',
    role: 'QA_CHECKER',
    designation: 'Chair, Examination Quality Cell',
    isApproved: true,
    registeredAt: '2026-08-05',
    avatarSeed: 'morales',
  },
  // Teachers
  {
    id: 'usr-tchr-tariq',
    name: 'Dr. Tariq Vance',
    email: 'tariq.vance@university.edu',
    phoneNumber: '+92 301 7654321',
    role: 'TEACHER',
    departmentId: 'dept-cs',
    designation: 'Associate Professor, Computer Science',
    isApproved: true,
    registeredAt: '2026-08-10',
    avatarSeed: 'vance',
    assignedCourseIds: ['cs-201', 'cs-301', 'cs-401', 'cs-501'],
  },
  {
    id: 'usr-tchr-eleanor',
    name: 'Dr. Eleanor Wright',
    email: 'eleanor.wright@university.edu',
    phoneNumber: '+92 302 6543210',
    role: 'TEACHER',
    departmentId: 'dept-eng',
    designation: 'Professor & Chair, English',
    isApproved: true,
    registeredAt: '2026-08-10',
    avatarSeed: 'wright',
    assignedCourseIds: ['eng-201', 'eng-401', 'eng-501', 'eng-601'],
  },
  {
    id: 'usr-tchr-arthur',
    name: 'Prof. Arthur Pendelton',
    email: 'arthur.pendelton@university.edu',
    phoneNumber: '+92 304 5432109',
    role: 'TEACHER',
    departmentId: 'dept-mth',
    designation: 'Professor, Pure Mathematics',
    isApproved: true,
    registeredAt: '2026-08-10',
    avatarSeed: 'pendelton',
    assignedCourseIds: ['mth-101', 'mth-201', 'mth-401', 'mth-601'],
  },
  {
    id: 'usr-tchr-clara',
    name: 'Ms. Clara Higgins',
    email: 'clara.higgins@university.edu',
    phoneNumber: '+92 305 4321098',
    role: 'TEACHER',
    departmentId: 'dept-eng',
    designation: 'Assistant Professor, English',
    isApproved: true,
    registeredAt: '2026-08-15',
    avatarSeed: 'higgins',
    assignedCourseIds: ['eng-101', 'eng-102', 'eng-301', 'eng-402'],
  },
  // Students
  {
    id: 'usr-std-alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@student.edu',
    phoneNumber: '+92 312 3456789',
    role: 'STUDENT',
    departmentId: 'dept-cs',
    semester: 4,
    rollNumber: 'FA26-CS-042',
    isApproved: true,
    registeredAt: '2026-09-02',
    avatarSeed: 'alex',
    enrolledCourseIds: ['cs-401', 'cs-402', 'mth-401'],
  },
  {
    id: 'usr-std-zainab',
    name: 'Zainab Fatima',
    email: 'zainab.f@student.edu',
    phoneNumber: '+92 313 2345678',
    role: 'STUDENT',
    departmentId: 'dept-mth',
    semester: 6,
    rollNumber: 'FA26-MTH-019',
    isApproved: true,
    registeredAt: '2026-09-02',
    avatarSeed: 'zainab',
    enrolledCourseIds: ['mth-601', 'mth-602'],
  },
  {
    id: 'usr-std-julian',
    name: 'Julian Reed',
    email: 'julian.r@student.edu',
    phoneNumber: '+92 314 1234567',
    role: 'STUDENT',
    departmentId: 'dept-eng',
    semester: 2,
    rollNumber: 'FA26-ENG-008',
    isApproved: true,
    registeredAt: '2026-09-03',
    avatarSeed: 'julian',
    enrolledCourseIds: ['eng-201', 'eng-202'],
  },
  // Pending students waiting for Admin approval
  {
    id: 'usr-std-hannah',
    name: 'Hannah Abbott',
    email: 'hannah.a@student.edu',
    phoneNumber: '+92 315 9876543',
    role: 'STUDENT',
    departmentId: 'dept-cs',
    semester: 2,
    rollNumber: 'FA26-CS-103',
    isApproved: false,
    registeredAt: '2026-10-12',
    avatarSeed: 'hannah',
    enrolledCourseIds: ['cs-201', 'cs-202'],
  },
  {
    id: 'usr-std-marcus',
    name: 'Marcus Brody',
    email: 'marcus.b@student.edu',
    phoneNumber: '+92 316 8765432',
    role: 'STUDENT',
    departmentId: 'dept-mth',
    semester: 1,
    rollNumber: 'FA26-MTH-055',
    isApproved: false,
    registeredAt: '2026-10-13',
    avatarSeed: 'marcus',
    enrolledCourseIds: ['mth-101', 'mth-102'],
  },
];

export const INITIAL_DATESHEET: DateSheetEntry[] = [
  // 0. CS-201: Exam on 2026-10-17 (2 days / ~48 hours away from Oct 15 -> CRITICAL RED ALERT < 48 Hours! Paper NOT uploaded!)
  {
    id: 'ds-cs-201',
    sessionId: 'sess-fall-26',
    departmentId: 'dept-cs',
    semester: 2,
    courseId: 'cs-201',
    assignedTeacherId: 'usr-tchr-tariq',
    examDate: '2026-10-17',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    hallNumber: 'CS Lab 1 & 2',
    status: 'SCHEDULED',
    paperSubmissionId: undefined,
    dutyConfirmed: false,
    createdAt: '2026-09-20',
  },
  // 0b. CS-501: Exam on 2026-10-20 (5 days away from Oct 15 -> HIGH URGENCY AMBER ALERT 3-5 Days! Paper NOT uploaded!)
  {
    id: 'ds-cs-501',
    sessionId: 'sess-fall-26',
    departmentId: 'dept-cs',
    semester: 5,
    courseId: 'cs-501',
    assignedTeacherId: 'usr-tchr-tariq',
    examDate: '2026-10-20',
    startTime: '01:30 PM',
    endTime: '04:30 PM',
    hallNumber: 'Examination Hall C-102',
    status: 'SCHEDULED',
    paperSubmissionId: undefined,
    dutyConfirmed: false,
    createdAt: '2026-09-21',
  },
  // 1. CS-401: Exam on 2026-10-23 (8 days away from Oct 15 -> Teacher 10-day alert active! Paper is UNDER_QA_REVIEW)
  {
    id: 'ds-cs-401',
    sessionId: 'sess-fall-26',
    departmentId: 'dept-cs',
    semester: 4,
    courseId: 'cs-401',
    assignedTeacherId: 'usr-tchr-tariq',
    examDate: '2026-10-23',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    hallNumber: 'Auditorium Hall 1',
    status: 'SCHEDULED',
    paperSubmissionId: 'paper-cs-401',
    dutyConfirmed: false,
    createdAt: '2026-09-20',
  },
  // 2. MTH-401: Exam on 2026-10-21 (6 days away -> QA Approved! Duty confirmed on Duty Roster!)
  {
    id: 'ds-mth-401',
    sessionId: 'sess-fall-26',
    departmentId: 'dept-mth',
    semester: 4,
    courseId: 'mth-401',
    assignedTeacherId: 'usr-tchr-arthur',
    examDate: '2026-10-21',
    startTime: '01:30 PM',
    endTime: '04:30 PM',
    hallNumber: 'Examination Block B-204',
    status: 'SCHEDULED',
    paperSubmissionId: 'paper-mth-401',
    dutyConfirmed: true,
    createdAt: '2026-09-20',
  },
  // 3. ENG-201: Exam on 2026-10-24 (9 days away -> Teacher Clara Higgins has NOT uploaded paper yet -> URGENT 10-DAY ALERT!)
  {
    id: 'ds-eng-201',
    sessionId: 'sess-fall-26',
    departmentId: 'dept-eng',
    semester: 2,
    courseId: 'eng-201',
    assignedTeacherId: 'usr-tchr-clara',
    examDate: '2026-10-24',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    hallNumber: 'Humanities Hall H-12',
    status: 'SCHEDULED',
    paperSubmissionId: undefined,
    dutyConfirmed: false,
    createdAt: '2026-09-22',
  },
  // 4. CS-301: Exam on 2026-10-08 (Past date -> Principal called exam -> Results uploaded by teacher -> Transcripts ready!)
  {
    id: 'ds-cs-301',
    sessionId: 'sess-fall-26',
    departmentId: 'dept-cs',
    semester: 3,
    courseId: 'cs-301',
    assignedTeacherId: 'usr-tchr-tariq',
    examDate: '2026-10-08',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    hallNumber: 'CS Lab 3 & Hall 2',
    status: 'RESULTS_UPLOADED',
    paperSubmissionId: 'paper-cs-301',
    dutyConfirmed: true,
    createdAt: '2026-09-15',
  },
  // 5. MTH-201: Exam on 2026-11-05 (21 days away -> Beyond 10 days, normal scheduled state)
  {
    id: 'ds-mth-201',
    sessionId: 'sess-fall-26',
    departmentId: 'dept-mth',
    semester: 2,
    courseId: 'mth-201',
    assignedTeacherId: 'usr-tchr-arthur',
    examDate: '2026-11-05',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    hallNumber: 'Science Quad Hall S-1',
    status: 'SCHEDULED',
    paperSubmissionId: undefined,
    dutyConfirmed: false,
    createdAt: '2026-09-25',
  },
  // 6. ENG-101: Exam on 2026-10-18 (3 days away -> Exam called by Principal, waiting for teachers to upload results)
  {
    id: 'ds-eng-101',
    sessionId: 'sess-fall-26',
    departmentId: 'dept-eng',
    semester: 1,
    courseId: 'eng-101',
    assignedTeacherId: 'usr-tchr-eleanor',
    examDate: '2026-10-18',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    hallNumber: 'Main Auditorium',
    status: 'EXAM_CALLED',
    paperSubmissionId: 'paper-eng-101',
    dutyConfirmed: true,
    createdAt: '2026-09-18',
  },
];

export const INITIAL_PAPERS: PaperSubmission[] = [
  {
    id: 'paper-cs-401',
    dateSheetEntryId: 'ds-cs-401',
    courseId: 'cs-401',
    teacherId: 'usr-tchr-tariq',
    title: 'CS-401 Database Systems Midterm & Final Assessment Paper',
    syllabusCoverage: 'SQL DDL/DML, Relational Algebra, B+ Trees, Normalization 1NF-BCNF (100% Core Syllabus)',
    questionsSummary: 'Part 1: 15 Conceptual MCQs (15M) | Part 2: Normalization Proofs (35M) | Part 3: Query Optimization (50M)',
    totalMarks: 100,
    fileAttachmentName: 'CS401_Fall2026_Final_Question_Paper_v2.pdf',
    fileSizeMb: '1.8 MB',
    submittedAt: '2026-10-14 14:30',
    qaStatus: 'UNDER_QA_REVIEW',
    qaNotes: 'Currently being scrutinized for Bloom taxonomy distribution by QA Auditor Dr. Victor Morales.',
  },
  {
    id: 'paper-mth-401',
    dateSheetEntryId: 'ds-mth-401',
    courseId: 'mth-401',
    teacherId: 'usr-tchr-arthur',
    title: 'MTH-401 Real Analysis Comprehensive Examination 2026',
    syllabusCoverage: 'Topology of R, Sequences, Bolzano-Weierstrass, Heine-Borel Theorem, Riemann Integration',
    questionsSummary: 'Section A: Metric Topology Theorems (40M) | Section B: Uniform Convergence Proofs (60M)',
    totalMarks: 100,
    fileAttachmentName: 'MTH401_Real_Analysis_Final_Exam_Signed.pdf',
    fileSizeMb: '2.4 MB',
    submittedAt: '2026-10-10 11:15',
    qaStatus: 'QA_APPROVED',
    qaNotes: 'Rigorously vetted. Proof requirements and mark distribution conform with University Standards. Invigilation duty confirmed.',
    qaReviewedAt: '2026-10-11 16:40',
    qaReviewerId: 'usr-qa',
  },
  {
    id: 'paper-cs-301',
    dateSheetEntryId: 'ds-cs-301',
    courseId: 'cs-301',
    teacherId: 'usr-tchr-tariq',
    title: 'CS-301 Data Structures & Algorithms Comprehensive Paper',
    syllabusCoverage: 'Trees, Graphs, Dijkstra, Dynamic Programming, Hashing & Amortized Analysis',
    questionsSummary: 'Part A: Code Tracing & Asymptotics (30M) | Part B: Algorithmic Design & Proofs (70M)',
    totalMarks: 100,
    fileAttachmentName: 'CS301_DSA_FinalExam_Fall26.pdf',
    fileSizeMb: '1.2 MB',
    submittedAt: '2026-09-28 09:20',
    qaStatus: 'QA_APPROVED',
    qaNotes: 'Approved with distinction. Exemplary question variety.',
    qaReviewedAt: '2026-09-29 15:00',
    qaReviewerId: 'usr-qa',
  },
  {
    id: 'paper-eng-101',
    dateSheetEntryId: 'ds-eng-101',
    courseId: 'eng-101',
    teacherId: 'usr-tchr-eleanor',
    title: 'ENG-101 Functional English Comprehensive Paper',
    syllabusCoverage: 'Syntax, Discourse Analysis, Critical Reading Comprehension, Rhetorical Analysis',
    questionsSummary: 'Section 1: Reading Passage Analysis (30M) | Section 2: Essay & Technical Précis (70M)',
    totalMarks: 100,
    fileAttachmentName: 'ENG101_Fall26_QuestionPaper_Final.pdf',
    fileSizeMb: '0.9 MB',
    submittedAt: '2026-10-06 10:00',
    qaStatus: 'QA_APPROVED',
    qaNotes: 'Audited and verified against university rubric.',
    qaReviewedAt: '2026-10-07 11:30',
    qaReviewerId: 'usr-qa',
  },
];

export const INITIAL_DUTY_ROSTER: DutyAssignment[] = [
  {
    id: 'duty-mth-401',
    dateSheetEntryId: 'ds-mth-401',
    teacherId: 'usr-tchr-arthur',
    role: 'Chief Invigilator',
    hallNumber: 'Examination Block B-204',
    examDate: '2026-10-21',
    startTime: '01:30 PM',
    endTime: '04:30 PM',
    isConfirmed: true,
    confirmedAt: '2026-10-11 16:40',
  },
  {
    id: 'duty-clash-arthur',
    dateSheetEntryId: 'ds-cs-501',
    teacherId: 'usr-tchr-arthur',
    role: 'Hall Invigilator',
    hallNumber: 'Central Examination Hall H-1',
    examDate: '2026-10-21',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    isConfirmed: true,
    confirmedAt: '2026-10-12 10:15',
  },
  {
    id: 'duty-cs-301',
    dateSheetEntryId: 'ds-cs-301',
    teacherId: 'usr-tchr-tariq',
    role: 'Chief Invigilator',
    hallNumber: 'CS Lab 3 & Hall 2',
    examDate: '2026-10-08',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    isConfirmed: true,
    confirmedAt: '2026-09-29 15:00',
  },
  {
    id: 'duty-eng-101',
    dateSheetEntryId: 'ds-eng-101',
    teacherId: 'usr-tchr-eleanor',
    role: 'Chief Invigilator',
    hallNumber: 'Main Auditorium',
    examDate: '2026-10-18',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    isConfirmed: true,
    confirmedAt: '2026-10-07 11:30',
  },
];

export const INITIAL_RESULTS: ExamResult[] = [
  // --- Student Alex Morgan (CS, Semester 4) ---
  // Semester 1
  {
    id: 'res-alex-sem1-cs101',
    dateSheetEntryId: 'ds-hist-cs-101',
    courseId: 'cs-101',
    studentId: 'usr-std-alex',
    internalMarks: 18,
    midtermMarks: 26,
    finalMarks: 44,
    totalMarks: 88,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-tariq',
    submittedAt: '2025-01-15 16:00',
  },
  {
    id: 'res-alex-sem1-cs102',
    dateSheetEntryId: 'ds-hist-cs-102',
    courseId: 'cs-102',
    studentId: 'usr-std-alex',
    internalMarks: 16,
    midtermMarks: 24,
    finalMarks: 41,
    totalMarks: 81,
    gradePoint: 3.7,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-tariq',
    submittedAt: '2025-01-18 16:00',
  },
  {
    id: 'res-alex-sem1-mth101',
    dateSheetEntryId: 'ds-hist-mth-101',
    courseId: 'mth-101',
    studentId: 'usr-std-alex',
    internalMarks: 15,
    midtermMarks: 22,
    finalMarks: 39,
    totalMarks: 76,
    gradePoint: 3.3,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2025-01-20 16:00',
  },
  // Semester 2
  {
    id: 'res-alex-sem2-cs201',
    dateSheetEntryId: 'ds-cs-201',
    courseId: 'cs-201',
    studentId: 'usr-std-alex',
    internalMarks: 19,
    midtermMarks: 28,
    finalMarks: 46,
    totalMarks: 93,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-tariq',
    submittedAt: '2025-06-12 15:30',
  },
  {
    id: 'res-alex-sem2-cs202',
    dateSheetEntryId: 'ds-hist-cs-202',
    courseId: 'cs-202',
    studentId: 'usr-std-alex',
    internalMarks: 17,
    midtermMarks: 25,
    finalMarks: 42,
    totalMarks: 84,
    gradePoint: 3.7,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-tariq',
    submittedAt: '2025-06-14 15:30',
  },
  {
    id: 'res-alex-sem2-mth201',
    dateSheetEntryId: 'ds-mth-201',
    courseId: 'mth-201',
    studentId: 'usr-std-alex',
    internalMarks: 17,
    midtermMarks: 26,
    finalMarks: 42,
    totalMarks: 85,
    gradePoint: 3.7,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2025-06-18 15:30',
  },
  // Semester 3
  {
    id: 'res-cs-301-alex',
    dateSheetEntryId: 'ds-cs-301',
    courseId: 'cs-301',
    studentId: 'usr-std-alex',
    internalMarks: 18,
    midtermMarks: 27,
    finalMarks: 45,
    totalMarks: 90,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-tariq',
    submittedAt: '2026-01-10 17:30',
  },
  {
    id: 'res-alex-sem3-cs302',
    dateSheetEntryId: 'ds-hist-cs-302',
    courseId: 'cs-302',
    studentId: 'usr-std-alex',
    internalMarks: 17,
    midtermMarks: 25,
    finalMarks: 41,
    totalMarks: 83,
    gradePoint: 3.7,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-tariq',
    submittedAt: '2026-01-14 17:30',
  },
  {
    id: 'res-alex-sem3-mth301',
    dateSheetEntryId: 'ds-hist-mth-301',
    courseId: 'mth-301',
    studentId: 'usr-std-alex',
    internalMarks: 16,
    midtermMarks: 26,
    finalMarks: 41,
    totalMarks: 83,
    gradePoint: 3.7,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2026-01-18 17:30',
  },
  // Semester 4 (Current)
  {
    id: 'res-alex-sem4-cs401',
    dateSheetEntryId: 'ds-cs-401',
    courseId: 'cs-401',
    studentId: 'usr-std-alex',
    internalMarks: 19,
    midtermMarks: 29,
    finalMarks: 47,
    totalMarks: 95,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-tariq',
    submittedAt: '2026-10-11 17:30',
  },

  // --- Student Zainab Fatima (Mathematics, Semester 6) ---
  {
    id: 'res-zainab-sem1-mth101',
    dateSheetEntryId: 'ds-hist-mth-101',
    courseId: 'mth-101',
    studentId: 'usr-std-zainab',
    internalMarks: 18,
    midtermMarks: 27,
    finalMarks: 44,
    totalMarks: 89,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2024-01-15',
  },
  {
    id: 'res-zainab-sem1-mth102',
    dateSheetEntryId: 'ds-hist-mth-102',
    courseId: 'mth-102',
    studentId: 'usr-std-zainab',
    internalMarks: 16,
    midtermMarks: 24,
    finalMarks: 40,
    totalMarks: 80,
    gradePoint: 3.3,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2024-01-18',
  },
  {
    id: 'res-zainab-sem2-mth201',
    dateSheetEntryId: 'ds-mth-201',
    courseId: 'mth-201',
    studentId: 'usr-std-zainab',
    internalMarks: 19,
    midtermMarks: 28,
    finalMarks: 46,
    totalMarks: 93,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2024-06-15',
  },
  {
    id: 'res-zainab-sem2-mth202',
    dateSheetEntryId: 'ds-hist-mth-202',
    courseId: 'mth-202',
    studentId: 'usr-std-zainab',
    internalMarks: 17,
    midtermMarks: 26,
    finalMarks: 42,
    totalMarks: 85,
    gradePoint: 3.7,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2024-06-18',
  },
  {
    id: 'res-zainab-sem3-mth301',
    dateSheetEntryId: 'ds-hist-mth-301',
    courseId: 'mth-301',
    studentId: 'usr-std-zainab',
    internalMarks: 19,
    midtermMarks: 28,
    finalMarks: 47,
    totalMarks: 94,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2025-01-15',
  },
  {
    id: 'res-zainab-sem3-mth302',
    dateSheetEntryId: 'ds-hist-mth-302',
    courseId: 'mth-302',
    studentId: 'usr-std-zainab',
    internalMarks: 17,
    midtermMarks: 26,
    finalMarks: 42,
    totalMarks: 85,
    gradePoint: 3.7,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2025-01-18',
  },
  {
    id: 'res-zainab-sem4-mth401',
    dateSheetEntryId: 'ds-mth-401',
    courseId: 'mth-401',
    studentId: 'usr-std-zainab',
    internalMarks: 20,
    midtermMarks: 29,
    finalMarks: 48,
    totalMarks: 97,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2025-06-15',
  },
  {
    id: 'res-zainab-sem4-mth402',
    dateSheetEntryId: 'ds-hist-mth-402',
    courseId: 'mth-402',
    studentId: 'usr-std-zainab',
    internalMarks: 18,
    midtermMarks: 27,
    finalMarks: 44,
    totalMarks: 89,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2025-06-18',
  },
  {
    id: 'res-zainab-sem5-mth501',
    dateSheetEntryId: 'ds-hist-mth-501',
    courseId: 'mth-501',
    studentId: 'usr-std-zainab',
    internalMarks: 19,
    midtermMarks: 28,
    finalMarks: 47,
    totalMarks: 94,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2026-01-15',
  },
  {
    id: 'res-zainab-sem5-mth502',
    dateSheetEntryId: 'ds-hist-mth-502',
    courseId: 'mth-502',
    studentId: 'usr-std-zainab',
    internalMarks: 18,
    midtermMarks: 28,
    finalMarks: 45,
    totalMarks: 91,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2026-01-18',
  },
  {
    id: 'res-zainab-sem6-mth601',
    dateSheetEntryId: 'ds-hist-mth-601',
    courseId: 'mth-601',
    studentId: 'usr-std-zainab',
    internalMarks: 19,
    midtermMarks: 29,
    finalMarks: 47,
    totalMarks: 95,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-arthur',
    submittedAt: '2026-10-10',
  },

  // --- Student Julian Reed (English, Semester 2) ---
  {
    id: 'res-julian-sem1-eng101',
    dateSheetEntryId: 'ds-hist-eng-101',
    courseId: 'eng-101',
    studentId: 'usr-std-julian',
    internalMarks: 17,
    midtermMarks: 25,
    finalMarks: 42,
    totalMarks: 84,
    gradePoint: 3.7,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-clara',
    submittedAt: '2026-01-15',
  },
  {
    id: 'res-julian-sem1-eng102',
    dateSheetEntryId: 'ds-hist-eng-102',
    courseId: 'eng-102',
    studentId: 'usr-std-julian',
    internalMarks: 16,
    midtermMarks: 24,
    finalMarks: 40,
    totalMarks: 80,
    gradePoint: 3.3,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-eleanor',
    submittedAt: '2026-01-18',
  },
  {
    id: 'res-julian-sem2-eng201',
    dateSheetEntryId: 'ds-eng-201',
    courseId: 'eng-201',
    studentId: 'usr-std-julian',
    internalMarks: 19,
    midtermMarks: 28,
    finalMarks: 46,
    totalMarks: 93,
    gradePoint: 4.0,
    letterGrade: 'A',
    submittedByTeacherId: 'usr-tchr-clara',
    submittedAt: '2026-10-11',
  },
  {
    id: 'res-cs-301-std2',
    dateSheetEntryId: 'ds-cs-301',
    courseId: 'cs-301',
    studentId: 'usr-std-hannah',
    internalMarks: 15,
    midtermMarks: 22,
    finalMarks: 38,
    totalMarks: 75,
    gradePoint: 3.3,
    letterGrade: 'B+',
    submittedByTeacherId: 'usr-tchr-tariq',
    submittedAt: '2026-10-11 17:30',
  },
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    recipientRole: 'TEACHER',
    recipientUserId: 'usr-tchr-clara',
    title: 'Urgent: Exam Paper Submission Required',
    message: 'Exam for ENG-201 is scheduled in 9 days (2026-10-24). Please upload question paper immediately for QA audit.',
    type: 'ALERT',
    createdAt: '2026-10-14 08:00',
    relatedDateSheetEntryId: 'ds-eng-201',
    isRead: false,
  },
  {
    id: 'notif-2',
    recipientRole: 'QA_CHECKER',
    title: 'New Paper Pending QA Verification',
    message: 'Dr. Tariq Vance uploaded question paper for CS-401 (Database Systems). Examination scheduled in 8 days.',
    type: 'INFO',
    createdAt: '2026-10-14 14:35',
    relatedDateSheetEntryId: 'ds-cs-401',
    isRead: false,
  },
  {
    id: 'notif-3',
    recipientRole: 'PRINCIPAL',
    title: 'Exam Called: ENG-101 Functional English',
    message: 'Principal called for exam conduct on 2026-10-18. Invigilation confirmed, grade upload unlocked for faculty.',
    type: 'SUCCESS',
    createdAt: '2026-10-15 09:00',
    relatedDateSheetEntryId: 'ds-eng-101',
    isRead: true,
  },
];

// Helper calculations
export function calculateGrade(totalMarks: number): { letterGrade: ExamResult['letterGrade']; gradePoint: number } {
  if (totalMarks >= 85) return { letterGrade: 'A', gradePoint: 4.0 };
  if (totalMarks >= 78) return { letterGrade: 'B+', gradePoint: 3.4 };
  if (totalMarks >= 70) return { letterGrade: 'B', gradePoint: 3.0 };
  if (totalMarks >= 64) return { letterGrade: 'C+', gradePoint: 2.5 };
  if (totalMarks >= 55) return { letterGrade: 'C', gradePoint: 2.0 };
  if (totalMarks >= 50) return { letterGrade: 'D', gradePoint: 1.0 };
  return { letterGrade: 'F', gradePoint: 0.0 };
}

export function computeDaysDifference(targetDate: string, baseDate: string): number {
  const target = new Date(targetDate);
  const base = new Date(baseDate);
  const diffTime = target.getTime() - base.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function createAuditTamperHash(action: string, actor: string, timestamp: string): string {
  const seed = `${action}_${actor}_${timestamp}_EMS_SECURE_TOKEN_2026`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = Math.abs(hash ^ 0x5a5a5a5a).toString(16).padStart(8, '0');
  return `SEC-SHA256-${hex.toUpperCase()}-${part2.toUpperCase()}`;
}

export const INITIAL_ACTIVITY_LOGS: SystemActivityLog[] = [
  {
    id: 'log-000a',
    actionType: 'PAPER_DEADLINE_UPDATED',
    category: 'ACADEMIC',
    severity: 'WARNING',
    actorId: 'usr-principal',
    actorName: 'Dr. Evelyn Montgomery',
    actorRole: 'PRINCIPAL',
    actorEmail: 'principal@university.edu',
    description: 'Executive deadline extension issued for CS-501 (Cloud Computing Architecture) question paper submission to 2026-10-23 (T-7 day threshold). Faculty notified.',
    targetId: 'cs-501',
    targetType: 'DATESHEET',
    targetLabel: 'CS-501 Question Paper Deadline',
    departmentId: 'dept-cs',
    timestamp: '2026-10-15 11:20:00',
    tamperHash: createAuditTamperHash('PAPER_DEADLINE_UPDATED', 'Dr. Evelyn Montgomery', '2026-10-15 11:20:00'),
  },
  {
    id: 'log-000b',
    actionType: 'DUTY_ROSTER_GENERATED',
    category: 'ROSTER',
    severity: 'CRITICAL',
    actorId: 'usr-admin',
    actorName: 'Dr. Alistair Sterling',
    actorRole: 'ADMIN',
    actorEmail: 'controller.exam@university.edu',
    description: 'Automated Duty Roster generated for Fall 2026 Midterm Session. 14 invigilation shifts assigned with zero double-booking conflicts across all 3 departments.',
    targetId: 'duty-roster-cycle-1',
    targetType: 'DUTY',
    targetLabel: 'Institutional Duty Roster (Fall 2026)',
    departmentId: 'dept-cs',
    timestamp: '2026-10-15 09:15:00',
    tamperHash: createAuditTamperHash('DUTY_ROSTER_GENERATED', 'Dr. Alistair Sterling', '2026-10-15 09:15:00'),
  },
  {
    id: 'log-001',
    actionType: 'GRADE_PUBLISHED',
    category: 'ACADEMIC',
    severity: 'CRITICAL',
    actorId: 'usr-admin',
    actorName: 'Dr. Alistair Sterling',
    actorRole: 'ADMIN',
    actorEmail: 'controller.exam@university.edu',
    description: 'Published official semester grades for CS-301 (Data Structures). 12 candidate records released to transcripts.',
    targetId: 'cs-301',
    targetType: 'COURSE',
    targetLabel: 'CS-301 · Data Structures',
    departmentId: 'dept-cs',
    timestamp: '2026-10-14 16:30:15',
    tamperHash: createAuditTamperHash('GRADE_PUBLISHED', 'Dr. Alistair Sterling', '2026-10-14 16:30:15'),
  },
  {
    id: 'log-002',
    actionType: 'PAPER_APPROVED',
    category: 'QA_APPROVAL',
    severity: 'SUCCESS',
    actorId: 'usr-qa',
    actorName: 'Prof. Marcus Sterling',
    actorRole: 'QA_CHECKER',
    actorEmail: 'm.sterling.qa@university.edu',
    description: 'Document approval granted for CS-301 Final Examination Paper (PDF). Invigilator duty locked into Duty Roster.',
    targetId: 'paper-cs301',
    targetType: 'PAPER',
    targetLabel: 'CS-301 Question Paper PDF',
    departmentId: 'dept-cs',
    timestamp: '2026-10-13 14:15:20',
    tamperHash: createAuditTamperHash('PAPER_APPROVED', 'Prof. Marcus Sterling', '2026-10-13 14:15:20'),
  },
  {
    id: 'log-003',
    actionType: 'ROSTER_GENERATED',
    category: 'ROSTER',
    severity: 'CRITICAL',
    actorId: 'usr-admin',
    actorName: 'Dr. Alistair Sterling',
    actorRole: 'ADMIN',
    actorEmail: 'controller.exam@university.edu',
    description: 'Automated Duty Roster generator executed. 6 invigilator slots assigned across Hall A-101 and Hall B-204 with 0 overlap conflicts.',
    targetId: 'roster-cycle-1',
    targetType: 'DUTY',
    targetLabel: 'Automated Duty Roster',
    departmentId: 'dept-cs',
    timestamp: '2026-10-12 10:00:00',
    tamperHash: createAuditTamperHash('ROSTER_GENERATED', 'Dr. Alistair Sterling', '2026-10-12 10:00:00'),
  },
  {
    id: 'log-004',
    actionType: 'PAPER_UPLOADED',
    category: 'ACADEMIC',
    severity: 'INFO',
    actorId: 'usr-teacher-1',
    actorName: 'Dr. Raymond Clark',
    actorRole: 'TEACHER',
    actorEmail: 'raymond.clark@university.edu',
    description: 'Official question paper PDF uploaded: ENG101_Final_Question_Paper.pdf (1.8 MB). Routed to QA review deck.',
    targetId: 'paper-eng101',
    targetType: 'PAPER',
    targetLabel: 'ENG-101 Question Paper PDF',
    departmentId: 'dept-eng',
    timestamp: '2026-10-11 11:20:00',
    tamperHash: createAuditTamperHash('PAPER_UPLOADED', 'Dr. Raymond Clark', '2026-10-11 11:20:00'),
  },
  {
    id: 'log-005',
    actionType: 'DUTY_ASSIGNED',
    category: 'ROSTER',
    severity: 'INFO',
    actorId: 'usr-admin',
    actorName: 'Dr. Alistair Sterling',
    actorRole: 'ADMIN',
    actorEmail: 'controller.exam@university.edu',
    description: 'Assigned Chief Invigilator duty to Dr. Raymond Clark for ENG-101 in Hall A-101.',
    targetId: 'duty-eng-101',
    targetType: 'DUTY',
    targetLabel: 'ENG-101 Invigilation Duty',
    departmentId: 'dept-eng',
    timestamp: '2026-10-10 09:30:45',
    tamperHash: createAuditTamperHash('DUTY_ASSIGNED', 'Dr. Alistair Sterling', '2026-10-10 09:30:45'),
  },
  {
    id: 'log-006',
    actionType: 'USER_APPROVED',
    category: 'ADMISSION',
    severity: 'SUCCESS',
    actorId: 'usr-admin',
    actorName: 'Dr. Alistair Sterling',
    actorRole: 'ADMIN',
    actorEmail: 'controller.exam@university.edu',
    description: 'Approved student admission and verified academic credentials for Liam Henderson (Roll: FA26-CS-001, Semester 3).',
    targetId: 'usr-student-1',
    targetType: 'USER',
    targetLabel: 'Liam Henderson (Student)',
    departmentId: 'dept-cs',
    timestamp: '2026-10-09 15:40:12',
    tamperHash: createAuditTamperHash('USER_APPROVED', 'Dr. Alistair Sterling', '2026-10-09 15:40:12'),
  },
  {
    id: 'log-007',
    actionType: 'EXAM_ARCHIVED',
    category: 'SECURITY_ADMIN',
    severity: 'CRITICAL',
    actorId: 'usr-admin',
    actorName: 'Dr. Alistair Sterling',
    actorRole: 'ADMIN',
    actorEmail: 'controller.exam@university.edu',
    description: 'Committed cryptographic seal for Spring 2026 Examination Session data into permanent institutional archive vault.',
    targetId: 'sess-spr-26',
    targetType: 'ARCHIVE',
    targetLabel: 'Spring 2026 Archive Snapshot',
    timestamp: '2026-10-08 17:00:00',
    tamperHash: createAuditTamperHash('EXAM_ARCHIVED', 'Dr. Alistair Sterling', '2026-10-08 17:00:00'),
  },
];

// Client Storage API with full browser persistence
export class ExamStorage {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  static getSimulatedDate(): string {
    if (!this.isBrowser()) return DEFAULT_SIMULATED_DATE;
    return localStorage.getItem(STORAGE_KEYS.CURRENT_DATE) || DEFAULT_SIMULATED_DATE;
  }

  static setSimulatedDate(date: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_DATE, date);
  }

  static getActiveUserId(): string {
    if (!this.isBrowser()) return INITIAL_USERS[0].id;
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || 'usr-admin';
  }

  static setActiveUserId(userId: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  }

  static saveActiveUserId(userId: string): void {
    this.setActiveUserId(userId);
  }

  static getDepartments(): Department[] {
    if (!this.isBrowser()) return INITIAL_DEPARTMENTS;
    const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return raw ? JSON.parse(raw) : INITIAL_DEPARTMENTS;
  }

  static saveDepartments(departments: Department[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  }

  static getSessions(): AcademicSession[] {
    if (!this.isBrowser()) return INITIAL_SESSIONS;
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : INITIAL_SESSIONS;
  }

  static getCourses(): Course[] {
    if (!this.isBrowser()) return INITIAL_COURSES;
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    return raw ? JSON.parse(raw) : INITIAL_COURSES;
  }

  static saveCourses(courses: Course[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }

  static getUsers(): User[] {
    if (!this.isBrowser()) return INITIAL_USERS;
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return INITIAL_USERS;
    try {
      const parsed: User[] = JSON.parse(raw);
      const withPhones = parsed.map((u) => {
        if (!u.phoneNumber) {
          const initMatch = INITIAL_USERS.find((init) => init.id === u.id || init.email === u.email);
          return {
            ...u,
            phoneNumber: initMatch?.phoneNumber || '+92 300 1234567',
          };
        }
        return u;
      });
      return withPhones;
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: User[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getDateSheet(): DateSheetEntry[] {
    if (!this.isBrowser()) return INITIAL_DATESHEET;
    const raw = localStorage.getItem(STORAGE_KEYS.DATESHEET);
    if (raw === null) {
      // First boot: initialize with default datesheet
      this.saveDateSheet(INITIAL_DATESHEET);
      return INITIAL_DATESHEET;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DATESHEET;
    }
  }

  static saveDateSheet(entries: DateSheetEntry[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.DATESHEET, JSON.stringify(entries));
  }

  static getPapers(): PaperSubmission[] {
    if (!this.isBrowser()) return INITIAL_PAPERS;
    const raw = localStorage.getItem(STORAGE_KEYS.PAPERS);
    if (raw === null) {
      this.savePapers(INITIAL_PAPERS);
      return INITIAL_PAPERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PAPERS;
    }
  }

  static savePapers(papers: PaperSubmission[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
  }

  static getDutyRoster(): DutyAssignment[] {
    if (!this.isBrowser()) return INITIAL_DUTY_ROSTER;
    const raw = localStorage.getItem(STORAGE_KEYS.DUTY_ROSTER);
    if (raw === null) {
      this.saveDutyRoster(INITIAL_DUTY_ROSTER);
      return INITIAL_DUTY_ROSTER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DUTY_ROSTER;
    }
  }

  static saveDutyRoster(roster: DutyAssignment[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.DUTY_ROSTER, JSON.stringify(roster));
  }

  static getResults(): ExamResult[] {
    if (!this.isBrowser()) return INITIAL_RESULTS;
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (raw === null) {
      this.saveResults(INITIAL_RESULTS);
      return INITIAL_RESULTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_RESULTS;
    }
  }

  static saveResults(results: ExamResult[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  }

  // Permanent student marks repository across all semesters
  static getPermanentStudentMarks(): ExamResult[] {
    if (!this.isBrowser()) return INITIAL_RESULTS;
    const raw = localStorage.getItem(STORAGE_KEYS.PERMANENT_MARKS);
    if (raw === null) {
      this.savePermanentStudentMarks(INITIAL_RESULTS);
      return INITIAL_RESULTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RESULTS;
    } catch {
      return INITIAL_RESULTS;
    }
  }

  static savePermanentStudentMarks(newResults: ExamResult[]): void {
    if (!this.isBrowser()) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PERMANENT_MARKS);
      let existing: ExamResult[] = [];
      if (raw) {
        try { existing = JSON.parse(raw); } catch { existing = []; }
      }
      if (existing.length === 0) {
        existing = [...INITIAL_RESULTS];
      }
      const map = new Map<string, ExamResult>();
      existing.forEach((r) => map.set(`${r.studentId}_${r.courseId}`, r));
      newResults.forEach((r) => map.set(`${r.studentId}_${r.courseId}`, r));
      const merged = Array.from(map.values());
      localStorage.setItem(STORAGE_KEYS.PERMANENT_MARKS, JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to save permanent marks', e);
    }
  }

  static getNotifications(): SystemNotification[] {
    if (!this.isBrowser()) return INITIAL_NOTIFICATIONS;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
  }

  static saveNotifications(notifs: SystemNotification[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  static getBranding(): CollegeBranding {
    if (!this.isBrowser()) return DEFAULT_BRANDING;
    const raw = localStorage.getItem(STORAGE_KEYS.BRANDING);
    return raw ? JSON.parse(raw) : DEFAULT_BRANDING;
  }

  static saveBranding(branding: CollegeBranding): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
  }

  static getActivityLogs(): SystemActivityLog[] {
    if (!this.isBrowser()) return INITIAL_ACTIVITY_LOGS;
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    if (!raw) return INITIAL_ACTIVITY_LOGS;
    try {
      const parsed: SystemActivityLog[] = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  }

  static saveActivityLogs(logs: SystemActivityLog[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  }

  static getYearTranscripts(): YearTranscriptRecord[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.YEAR_TRANSCRIPTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveYearTranscripts(transcripts: YearTranscriptRecord[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.YEAR_TRANSCRIPTS, JSON.stringify(transcripts));
  }

  static resetDatabase(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_DATE, DEFAULT_SIMULATED_DATE);
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.DATESHEET, JSON.stringify(INITIAL_DATESHEET));
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(INITIAL_PAPERS));
    localStorage.setItem(STORAGE_KEYS.DUTY_ROSTER, JSON.stringify(INITIAL_DUTY_ROSTER));
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(INITIAL_RESULTS));
    localStorage.setItem(STORAGE_KEYS.PERMANENT_MARKS, JSON.stringify(INITIAL_RESULTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'usr-admin');
    localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(DEFAULT_BRANDING));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  }

  static purgeAllExamData(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.DATESHEET, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DUTY_ROSTER, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify([]));
  }

  static resetToAdminOnlyWithZeroEntries(): void {
    if (!this.isBrowser()) return;
    const adminUser: User = {
      id: 'usr-admin',
      name: 'System Administrator (Controller)',
      email: 'admin@university.edu',
      phoneNumber: '+92 300 8472910',
      role: 'ADMIN',
      password: 'admin',
      designation: 'Controller of Examinations & System Admin',
      isApproved: true,
      status: 'ACTIVE',
      registeredAt: DEFAULT_SIMULATED_DATE,
      avatarSeed: 'admin',
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DATESHEET, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DUTY_ROSTER, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'usr-admin');
    localStorage.setItem(STORAGE_KEYS.YEAR_TRANSCRIPTS, JSON.stringify([]));
    localStorage.setItem('ems_exam_archives', JSON.stringify([]));
    localStorage.setItem(
      STORAGE_KEYS.ACTIVITY_LOGS,
      JSON.stringify([
        {
          id: `log-init-${Date.now()}`,
          actionType: 'DATA_PURGED',
          category: 'SECURITY_ADMIN',
          severity: 'CRITICAL',
          actorId: 'usr-admin',
          actorName: 'System Administrator',
          actorRole: 'ADMIN',
          description: 'System reset to zero entries. Only Administrator account active.',
          timestamp: `${DEFAULT_SIMULATED_DATE} 00:00`,
          targetType: 'SYSTEM',
          targetLabel: 'Zero Entries Reset',
        },
      ])
    );
  }
}

