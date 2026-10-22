export type UserRole = 'ADMIN' | 'PRINCIPAL' | 'QA_CHECKER' | 'TEACHER' | 'STUDENT';

export interface Department {
  id: string;
  name: string;
  code: string;
  hodName: string;
}

export interface AcademicSession {
  id: string;
  name: string; // e.g. "Fall 2026", "Spring 2026"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  semester: number; // 1 to 8
  creditHours: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  semester?: number; // for students
  rollNumber?: string; // for students
  designation?: string; // for teachers / admin
  isApproved: boolean;
  registeredAt: string;
  avatarSeed?: string;
  phoneNumber?: string; // Required for WhatsApp duty roster & exam started dispatches
  password?: string; // User login password (manageable by Admin)
  status?: 'ACTIVE' | 'RESIGNED' | 'TRANSFERRED' | 'PASSED_OUT'; // Teacher resigned/transferred, Student active/passed out
  statusReason?: string;
  transferredToDepartmentId?: string;
  passedOutYear?: string;
  statusUpdatedAt?: string;
  enrolledCourseIds?: string[]; // for enrolled courses (students)
  assignedCourseIds?: string[]; // for teaching subjects assigned (teachers)
}

export type PaperQAStatus = 'PENDING_UPLOAD' | 'UNDER_QA_REVIEW' | 'QA_APPROVED' | 'QA_REJECTED';
export type ExamStageStatus = 'SCHEDULED' | 'EXAM_CALLED' | 'CONDUCTED' | 'RESULTS_UPLOADED';

export interface PaperSubmission {
  id: string;
  dateSheetEntryId: string;
  courseId: string;
  teacherId: string;
  title: string;
  syllabusCoverage: string; // e.g. "Chapters 1 to 6 (100% Core Topics)"
  questionsSummary: string; // e.g. "Section A: 10 MCQs (20M), Section B: 5 Subjective (50M), Section C: 2 Case Studies (30M)"
  totalMarks: number;
  fileAttachmentName: string;
  fileSizeMb?: string;
  pdfDataUrl?: string;
  submittedAt: string;
  qaStatus: PaperQAStatus;
  qaNotes?: string;
  qaReviewedAt?: string;
  qaReviewerId?: string;
}

export interface DateSheetEntry {
  id: string;
  sessionId: string;
  departmentId: string;
  semester: number; // 1 to 8
  courseId: string;
  assignedTeacherId: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "12:00 PM"
  hallNumber: string; // e.g. "Hall A-101"
  status: ExamStageStatus;
  paperSubmissionId?: string;
  dutyConfirmed: boolean;
  createdAt: string;
}

export interface DutyAssignment {
  id: string;
  dateSheetEntryId: string;
  teacherId: string;
  role: 'Chief Invigilator' | 'Hall Invigilator' | 'Deputy Superintendent';
  hallNumber: string;
  examDate: string;
  startTime: string;
  endTime: string;
  isConfirmed: boolean;
  confirmedAt?: string;
}

export interface DutyConflictItem {
  dutyId: string;
  dateSheetEntryId: string;
  courseCode: string;
  courseTitle: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  hallNumber: string;
  role: string;
  isConfirmed: boolean;
}

export interface DutyConflict {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherDesignation?: string;
  examDate: string;
  overlapMinutes: number;
  duties: DutyAssignment[];
  conflictItems: DutyConflictItem[];
  conflictDescription: string;
  severity: 'HIGH_OVERLAP' | 'PARTIAL_OVERLAP' | 'EXACT_DUPLICATE';
}

export interface ExamResult {
  id: string;
  dateSheetEntryId: string;
  courseId: string;
  studentId: string;
  internalMarks: number; // Max 20
  midtermMarks: number; // Max 30
  finalMarks: number; // Max 50
  totalMarks: number; // Max 100
  gradePoint: number; // 0.00 to 4.00
  letterGrade: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  submittedByTeacherId: string;
  submittedAt: string;
}

export interface SystemNotification {
  id: string;
  recipientRole?: UserRole;
  recipientUserId?: string;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO' | 'SUCCESS' | 'WARNING';
  createdAt: string;
  relatedDateSheetEntryId?: string;
  isRead: boolean;
}

export interface CollegeBranding {
  collegeName: string;
  subTitle: string;
  logoUrl?: string;
  accentColor?: string;
  // Signatories & Official University Seal Configuration
  deputyRegistrarName?: string;
  deputyRegistrarTitle?: string;
  controllerName?: string;
  controllerTitle?: string;
  sealText?: string;
  sealSubText?: string;
  sealType?: 'EMBOSSED' | 'EMBLEM' | 'ACADEMIC' | 'CUSTOM_IMAGE';
  sealImageUrl?: string;
  sealColor?: string;
}

export type ActivityActionType =
  | 'GRADE_PUBLISHED'
  | 'PAPER_DEADLINE_UPDATED'
  | 'DUTY_ROSTER_GENERATED'
  | 'PAPER_APPROVED'
  | 'PAPER_REJECTED'
  | 'PAPER_UPLOADED'
  | 'ROSTER_GENERATED'
  | 'DUTY_ASSIGNED'
  | 'DUTY_REMOVED'
  | 'DUTY_UPDATED'
  | 'USER_REGISTERED'
  | 'USER_APPROVED'
  | 'EXAM_ARCHIVED'
  | 'DATESHEET_ENTRY_CREATED'
  | 'DATESHEET_ENTRY_UPDATED'
  | 'DEPARTMENT_CREATED'
  | 'COURSE_CREATED'
  | 'TEACHER_ASSIGNED'
  | 'EXAM_CALLED'
  | 'EXAM_ENDED'
  | 'WHATSAPP_ALERT_DISPATCHED'
  | 'DATA_PURGED'
  | 'BRANDING_UPDATED'
  | 'SIGNATORIES_UPDATED'
  | 'SYSTEM_RESET'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'TEACHER_RESIGNED'
  | 'TEACHER_TRANSFERRED'
  | 'STUDENT_STATUS_CHANGED'
  | 'STUDENT_PROMOTED';

export type ActivitySeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
export type ActivityCategory = 'ACADEMIC' | 'QA_APPROVAL' | 'ROSTER' | 'SECURITY_ADMIN' | 'ADMISSION';

export interface SystemActivityLog {
  id: string;
  actionType: ActivityActionType;
  category: ActivityCategory;
  severity: ActivitySeverity;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actorEmail?: string;
  description: string;
  targetId?: string;
  targetType?: 'COURSE' | 'DATESHEET' | 'PAPER' | 'USER' | 'DUTY' | 'ARCHIVE' | 'SYSTEM';
  targetLabel?: string;
  departmentId?: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  tamperHash: string; // Cryptographic verification seal e.g. "SEC-7a9f...312"
}

export interface TranscriptCourseGrade {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  creditHours: number;
  internalMarks: number;
  midtermMarks: number;
  finalMarks: number;
  totalMarks: number;
  gradePoint: number;
  letterGrade: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  semester: number;
}

export interface YearTranscriptRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  phoneNumber?: string;
  departmentId: string;
  departmentName: string;
  examYear: string; // e.g. "2026", "2025"
  sessionName: string; // e.g. "Fall 2026 Examination"
  issuedAt: string;
  archivedExamId?: string;
  courses: TranscriptCourseGrade[];
  totalCreditsEarned: number;
  totalQualityPoints: number;
  gpa: number;
  cgpa: number;
  academicStanding: string;
  verificationHash: string;
}


