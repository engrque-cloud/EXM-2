'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Department,
  AcademicSession,
  Course,
  User,
  UserRole,
  DateSheetEntry,
  PaperSubmission,
  DutyAssignment,
  DutyConflict,
  ExamResult,
  SystemNotification,
  CollegeBranding,
  SystemActivityLog,
  ActivityActionType,
  ActivityCategory,
  ActivitySeverity,
  TranscriptCourseGrade,
  YearTranscriptRecord,
} from '@/types/exam-system';
import { detectDutyConflicts } from './duty-overlap';
import { ExamArchiveRecord, ExamArchiveStorage } from './exam-archive';
import {
  ExamStorage,
  computeDaysDifference,
  calculateGrade,
  DEFAULT_SIMULATED_DATE,
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_SESSIONS,
  INITIAL_COURSES,
  INITIAL_DATESHEET,
  INITIAL_PAPERS,
  INITIAL_DUTY_ROSTER,
  INITIAL_RESULTS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_BRANDING,
  INITIAL_ACTIVITY_LOGS,
  createAuditTamperHash,
} from './exam-storage';

interface ExamContextType {
  simulatedDate: string;
  setSimulatedDate: (date: string) => void;
  advanceDays: (days: number) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  users: User[];
  departments: Department[];
  sessions: AcademicSession[];
  courses: Course[];
  dateSheet: DateSheetEntry[];
  papers: PaperSubmission[];
  dutyRoster: DutyAssignment[];
  results: ExamResult[];
  notifications: SystemNotification[];
  unreadNotifsCount: number;
  branding: CollegeBranding;
  updateBranding: (newBranding: Partial<CollegeBranding>) => void;

  // Authentication & Session
  isLoggedIn: boolean;
  login: (credential: string, password?: string) => boolean;
  logout: () => void;

  // WhatsApp Notification Engine (Phone number mandatory for alerts & messages)
  sendWhatsAppDutyRosterAlert: (dutyId: string) => void;
  sendWhatsAppExamStartAlert: (dateSheetId: string) => void;
  sendWhatsAppExamEndAlert: (dateSheetId: string) => void;
  dispatchAllDutyRosterWhatsAppAlerts: () => { dispatchedCount: number };
  sendCustomWhatsAppMessage: (params: {
    recipientName: string;
    phoneNumber: string;
    message: string;
    title?: string;
  }) => void;
  whatsAppModal: {
    isOpen: boolean;
    recipientName: string;
    phoneNumber: string;
    title: string;
    message: string;
    whatsAppLink: string;
  } | null;
  closeWhatsAppModal: () => void;

  // Actions
  addDateSheetEntry: (entry: {
    sessionId: string;
    departmentId: string;
    semester: number;
    courseId: string;
    assignedTeacherId: string;
    examDate: string;
    startTime: string;
    endTime: string;
    hallNumber: string;
  }) => void;
  uploadPaper: (submission: {
    dateSheetEntryId: string;
    courseId: string;
    teacherId: string;
    title?: string;
    syllabusCoverage?: string;
    questionsSummary?: string;
    totalMarks?: number;
    fileAttachmentName: string;
    fileSizeMb?: string;
    pdfDataUrl?: string;
  }) => void;
  reviewPaper: (paperId: string, status: 'QA_APPROVED' | 'QA_REJECTED', notes: string) => void;
  callForExam: (dateSheetId: string) => void;
  endExam: (dateSheetId: string) => void;
  toggleExamCallEnd: (dateSheetId: string) => void;
  callOrEndAllExams: (departmentId?: string) => void;
  submitExamResults: (
    records: Array<{
      dateSheetEntryId: string;
      courseId: string;
      studentId: string;
      internalMarks: number;
      midtermMarks: number;
      finalMarks: number;
      submittedByTeacherId: string;
    }>
  ) => void;
  addOrUpdateExamResult: (record: {
    id?: string;
    dateSheetEntryId?: string;
    courseId: string;
    studentId: string;
    internalMarks: number;
    midtermMarks: number;
    finalMarks: number;
    submittedByTeacherId?: string;
  }) => ExamResult;
  updateExamResult: (
    id: string,
    updates: {
      internalMarks?: number;
      midtermMarks?: number;
      finalMarks?: number;
    }
  ) => void;
  deleteExamResult: (id: string) => void;
  approveUser: (userId: string, isApproved: boolean) => void;
  registerUser: (data: {
    name: string;
    email: string;
    phoneNumber?: string;
    password?: string;
    role: UserRole;
    departmentId?: string;
    semester?: number;
    rollNumber?: string;
    designation?: string;
    autoApprove?: boolean;
  }) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  setTeacherResigned: (teacherId: string, reason?: string) => void;
  transferTeacher: (teacherId: string, toDepartmentId: string, reason?: string) => void;
  setStudentStatus: (studentId: string, status: 'ACTIVE' | 'PASSED_OUT', passedOutYear?: string) => void;
  promoteStudentSemester: (studentId: string) => { newSemester?: number; passedOut: boolean; studentName: string };
  promoteAllStudents: (departmentId?: string) => { promotedCount: number; passedOutCount: number };
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAllData: () => void;
  purgeAllData: () => void;
  resetToAdminOnlyZeroEntries: () => void;
  addDepartment: (dept: { name: string; code: string; hodName: string }) => Department;
  addCourse: (course: {
    code: string;
    title: string;
    departmentId: string;
    semester: number;
    creditHours: number;
  }) => Course;
  addTeacher: (teacher: {
    name: string;
    email: string;
    phoneNumber?: string;
    departmentId: string;
    designation?: string;
    assignedCourseIds?: string[];
  }) => User;
  assignTeacherSubjects: (teacherId: string, courseIds: string[]) => void;

  // Archive & Historical Data Vault (Secure Archive Service)
  archives: ExamArchiveRecord[];
  archiveAllExamData: (sessionName: string, notes?: string) => ExamArchiveRecord;
  archiveAndConcludeSession: (sessionName?: string, notes?: string) => ExamArchiveRecord;
  initializeNewExamSession: (sessionTitle?: string) => void;
  deleteArchiveRecord: (id: string) => void;
  yearTranscripts: YearTranscriptRecord[];
  finishAndArchiveAllResultsByPrincipal: (notes?: string) => {
    archiveRecord: ExamArchiveRecord;
    generatedTranscriptsCount: number;
  };
  getStudentTranscriptByYear: (studentId: string, year: string) => YearTranscriptRecord | undefined;

  // Duty Roster & Overlap Warning Engine
  dutyConflicts: DutyConflict[];
  addDutyAssignment: (duty: Omit<DutyAssignment, 'id'>) => void;
  updateDutyAssignment: (id: string, updates: Partial<DutyAssignment>) => void;
  deleteDutyAssignment: (id: string) => void;
  generateDutyRoster: () => { createdCount: number; conflictCount: number; conflicts: DutyConflict[] };
  simulateDutyConflict: () => void;

  // Secure System Activity Log
  activityLogs: SystemActivityLog[];
  logActivity: (entry: {
    actionType: ActivityActionType;
    category: ActivityCategory;
    severity: ActivitySeverity;
    actorId?: string;
    actorName?: string;
    actorRole?: UserRole;
    actorEmail?: string;
    description: string;
    targetId?: string;
    targetType?: 'COURSE' | 'DATESHEET' | 'PAPER' | 'USER' | 'DUTY' | 'ARCHIVE' | 'SYSTEM';
    targetLabel?: string;
    departmentId?: string;
  }) => SystemActivityLog;
  clearActivityLogs: () => void;
}

const ExamContext = createContext<ExamContextType | null>(null);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [simulatedDate, setSimulatedDateState] = useState<string>(DEFAULT_SIMULATED_DATE);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [sessions, setSessions] = useState<AcademicSession[]>(INITIAL_SESSIONS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [dateSheet, setDateSheet] = useState<DateSheetEntry[]>(INITIAL_DATESHEET);
  const [papers, setPapers] = useState<PaperSubmission[]>(INITIAL_PAPERS);
  const [dutyRoster, setDutyRoster] = useState<DutyAssignment[]>(INITIAL_DUTY_ROSTER);
  const [results, setResults] = useState<ExamResult[]>(INITIAL_RESULTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeUserId, setActiveUserIdState] = useState<string>('usr-admin');
  const [branding, setBrandingState] = useState<CollegeBranding>(DEFAULT_BRANDING);
  const [archives, setArchives] = useState<ExamArchiveRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [yearTranscripts, setYearTranscripts] = useState<YearTranscriptRecord[]>([]);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [whatsAppModal, setWhatsAppModal] = useState<{
    isOpen: boolean;
    recipientName: string;
    phoneNumber: string;
    title: string;
    message: string;
    whatsAppLink: string;
  } | null>(null);

  const closeWhatsAppModal = useCallback(() => {
    setWhatsAppModal(null);
  }, []);

  // Hydrate client storage asynchronously after initial render to eliminate SSR hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setSimulatedDateState(ExamStorage.getSimulatedDate());
      setUsers(ExamStorage.getUsers());
      setDepartments(ExamStorage.getDepartments());
      setSessions(ExamStorage.getSessions());
      setCourses(ExamStorage.getCourses());
      setDateSheet(ExamStorage.getDateSheet());
      setPapers(ExamStorage.getPapers());
      setDutyRoster(ExamStorage.getDutyRoster());
      setResults(ExamStorage.getResults());
      setNotifications(ExamStorage.getNotifications());
      setActiveUserIdState(ExamStorage.getActiveUserId());
      setBrandingState(ExamStorage.getBranding());
      setArchives(ExamArchiveStorage.getArchives());
      setActivityLogs(ExamStorage.getActivityLogs());
      setYearTranscripts(ExamStorage.getYearTranscripts());

      if (typeof window !== 'undefined') {
        const storedLogin = localStorage.getItem('EMS_IS_LOGGED_IN');
        setIsLoggedIn(storedLogin === 'true');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = useCallback(
    (credential: string, password?: string) => {
      const cred = credential.trim().toLowerCase();
      const cleanPhone = credential.replace(/[^0-9]/g, '');

      const found = users.find((u) => {
        if (u.id === credential) return true;
        if (u.email && u.email.toLowerCase() === cred) return true;
        if (u.phoneNumber) {
          const uPhoneClean = u.phoneNumber.replace(/[^0-9]/g, '');
          if (cleanPhone && (uPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(uPhoneClean))) {
            return true;
          }
        }
        return false;
      });

      if (found) {
        // If password is set and entered, verify password
        if (found.password && password && password.trim() !== '') {
          if (found.password !== password.trim()) {
            return false;
          }
        }
        // If teacher is resigned, prevent login
        if (found.status === 'RESIGNED') {
          return false;
        }

        setActiveUserIdState(found.id);
        ExamStorage.saveActiveUserId(found.id);
        setIsLoggedIn(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('EMS_IS_LOGGED_IN', 'true');
        }
        return true;
      }
      return false;
    },
    [users]
  );

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('EMS_IS_LOGGED_IN', 'false');
    }
  }, []);

  const updateBranding = useCallback((newBranding: Partial<CollegeBranding>) => {
    setBrandingState((prev) => {
      const updated = { ...prev, ...newBranding };
      ExamStorage.saveBranding(updated);
      return updated;
    });
  }, []);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === activeUserId) || users[0] || {
      id: 'usr-admin',
      name: 'Dr. Alistair Sterling',
      email: 'controller.exam@university.edu',
      role: 'ADMIN',
      designation: 'Controller of Examinations',
      isApproved: true,
      registeredAt: '2026-08-01',
    };
  }, [users, activeUserId]);

  const setSimulatedDate = useCallback((newDate: string) => {
    setSimulatedDateState(newDate);
    ExamStorage.setSimulatedDate(newDate);
  }, []);

  const advanceDays = useCallback((days: number) => {
    setSimulatedDateState((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + days);
      const iso = d.toISOString().split('T')[0];
      ExamStorage.setSimulatedDate(iso);
      return iso;
    });
  }, []);

  const setCurrentUser = useCallback((user: User) => {
    setActiveUserIdState(user.id);
    ExamStorage.setActiveUserId(user.id);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    // Find first user with that role
    const matched = users.find((u) => u.role === role && u.isApproved);
    if (matched) {
      setCurrentUser(matched);
    }
  }, [users, setCurrentUser]);

  // Secure Activity Logging Engine with Tamper Seal
  const logActivity = useCallback(
    (entry: {
      actionType: ActivityActionType;
      category: ActivityCategory;
      severity: ActivitySeverity;
      actorId?: string;
      actorName?: string;
      actorRole?: UserRole;
      actorEmail?: string;
      description: string;
      targetId?: string;
      targetType?: 'COURSE' | 'DATESHEET' | 'PAPER' | 'USER' | 'DUTY' | 'ARCHIVE' | 'SYSTEM';
      targetLabel?: string;
      departmentId?: string;
    }) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const timestamp = `${simulatedDate} ${timeStr}`;
      const actorId = entry.actorId || currentUser.id;
      const actorName = entry.actorName || currentUser.name;
      const actorRole = entry.actorRole || currentUser.role;
      const actorEmail = entry.actorEmail || currentUser.email;

      const newLog: SystemActivityLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        actionType: entry.actionType,
        category: entry.category,
        severity: entry.severity,
        actorId,
        actorName,
        actorRole,
        actorEmail,
        description: entry.description,
        targetId: entry.targetId,
        targetType: entry.targetType,
        targetLabel: entry.targetLabel,
        departmentId: entry.departmentId,
        timestamp,
        tamperHash: createAuditTamperHash(entry.actionType, actorName, timestamp),
      };

      setActivityLogs((prev) => {
        const updated = [newLog, ...prev];
        ExamStorage.saveActivityLogs(updated);
        return updated;
      });

      return newLog;
    },
    [currentUser, simulatedDate]
  );

  const clearActivityLogs = useCallback(() => {
    setActivityLogs([]);
    ExamStorage.saveActivityLogs([]);
  }, []);

  // Add Date Sheet Row (by Admin / Exam Controller)
  const addDateSheetEntry = useCallback(
    (entry: {
      sessionId: string;
      departmentId: string;
      semester: number;
      courseId: string;
      assignedTeacherId: string;
      examDate: string;
      startTime: string;
      endTime: string;
      hallNumber: string;
    }) => {
      const newEntryId = `ds-${Date.now()}`;
      const newEntry: DateSheetEntry = {
        id: newEntryId,
        sessionId: entry.sessionId,
        departmentId: entry.departmentId,
        semester: entry.semester,
        courseId: entry.courseId,
        assignedTeacherId: entry.assignedTeacherId,
        examDate: entry.examDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        hallNumber: entry.hallNumber,
        status: 'SCHEDULED',
        dutyConfirmed: false,
        createdAt: new Date().toISOString().split('T')[0],
      };

      const updated = [newEntry, ...dateSheet];
      setDateSheet(updated);
      ExamStorage.saveDateSheet(updated);

      // Check if this exam is within 10 days of simulated date
      const daysLeft = computeDaysDifference(entry.examDate, simulatedDate);
      const courseObj = courses.find((c) => c.id === entry.courseId);
      const teacherObj = users.find((u) => u.id === entry.assignedTeacherId);

      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'TEACHER',
        recipientUserId: entry.assignedTeacherId,
        title: daysLeft <= 10 ? 'Exam Paper Upload Required (10-Day Alert)' : 'Date Sheet Confirmed',
        message: `Examination for ${courseObj?.code || 'Course'} (${courseObj?.title || ''}) confirmed on ${entry.examDate}. Assigned to ${teacherObj?.name || 'Teacher'}. ${
          daysLeft <= 10 ? `Only ${daysLeft} days remaining to submit question paper for QA review!` : 'Prepare syllabus breakdown.'
        }`,
        type: daysLeft <= 10 ? 'ALERT' : 'INFO',
        createdAt: `${simulatedDate} 09:00`,
        relatedDateSheetEntryId: newEntryId,
        isRead: false,
      };

      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      ExamStorage.saveNotifications(updatedNotifs);

      logActivity({
        actionType: 'DATESHEET_ENTRY_CREATED',
        category: 'ACADEMIC',
        severity: 'INFO',
        description: `Scheduled exam for ${courseObj?.code || 'Course'} on ${entry.examDate} (${entry.startTime} - ${entry.endTime}) in ${entry.hallNumber}.`,
        targetId: newEntryId,
        targetType: 'DATESHEET',
        targetLabel: `${courseObj?.code || 'Course'} Schedule Entry`,
        departmentId: entry.departmentId,
      });
    },
    [dateSheet, courses, users, simulatedDate, notifications, logActivity]
  );

  // Upload Paper (by Teacher)
  const uploadPaper = useCallback(
    (submission: {
      dateSheetEntryId: string;
      courseId: string;
      teacherId: string;
      title?: string;
      syllabusCoverage?: string;
      questionsSummary?: string;
      totalMarks?: number;
      fileAttachmentName: string;
      fileSizeMb?: string;
      pdfDataUrl?: string;
    }) => {
      const paperId = `paper-${Date.now()}`;
      const courseObj = courses.find((c) => c.id === submission.courseId);
      const newPaper: PaperSubmission = {
        id: paperId,
        dateSheetEntryId: submission.dateSheetEntryId,
        courseId: submission.courseId,
        teacherId: submission.teacherId,
        title: submission.title || `${courseObj?.code || 'Exam'} Question Paper (PDF)`,
        syllabusCoverage: submission.syllabusCoverage || '100% Prescribed Course Syllabus',
        questionsSummary: submission.questionsSummary || 'As formatted in uploaded official PDF document',
        totalMarks: submission.totalMarks || 100,
        fileAttachmentName: submission.fileAttachmentName,
        fileSizeMb: submission.fileSizeMb || '1.6 MB',
        pdfDataUrl: submission.pdfDataUrl,
        submittedAt: `${simulatedDate} 11:20`,
        qaStatus: 'UNDER_QA_REVIEW',
        qaNotes: 'PDF document uploaded by faculty; awaiting QA Checker evaluation.',
      };

      const updatedPapers = [newPaper, ...papers];
      setPapers(updatedPapers);
      ExamStorage.savePapers(updatedPapers);

      // Link to Date Sheet entry
      const updatedDateSheet = dateSheet.map((ds) =>
        ds.id === submission.dateSheetEntryId ? { ...ds, paperSubmissionId: paperId } : ds
      );
      setDateSheet(updatedDateSheet);
      ExamStorage.saveDateSheet(updatedDateSheet);

      // Notification to QA and Principal
      const teacherObj = users.find((u) => u.id === submission.teacherId);

      const qaNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'QA_CHECKER',
        title: 'New Paper Uploaded for Audit',
        message: `${teacherObj?.name || 'Teacher'} submitted exam paper for ${courseObj?.code || 'Course'} (${courseObj?.title || ''}). QA verification pending.`,
        type: 'INFO',
        createdAt: `${simulatedDate} 11:25`,
        relatedDateSheetEntryId: submission.dateSheetEntryId,
        isRead: false,
      };

      const updatedNotifs = [qaNotif, ...notifications];
      setNotifications(updatedNotifs);
      ExamStorage.saveNotifications(updatedNotifs);

      logActivity({
        actionType: 'PAPER_UPLOADED',
        category: 'ACADEMIC',
        severity: 'INFO',
        actorId: submission.teacherId,
        actorName: teacherObj?.name,
        actorRole: 'TEACHER',
        description: `Official question paper PDF uploaded: ${newPaper.fileAttachmentName} (${newPaper.fileSizeMb}). Dispatched to QA queue.`,
        targetId: paperId,
        targetType: 'PAPER',
        targetLabel: `${courseObj?.code || 'Course'} Paper PDF`,
        departmentId: courseObj?.departmentId,
      });
    },
    [papers, dateSheet, courses, users, simulatedDate, notifications, logActivity]
  );

  // WhatsApp Duty Roster Alert (Notifies faculty invigilator when roster is confirmed & instructs to upload data)
  const sendWhatsAppDutyRosterAlert = useCallback(
    (dutyId: string) => {
      const duty = dutyRoster.find((d) => d.id === dutyId);
      if (!duty) return;
      const teacher = users.find((u) => u.id === duty.teacherId);
      if (!teacher) return;
      const ds = dateSheet.find((item) => item.id === duty.dateSheetEntryId);
      const course = courses.find((c) => c.id === ds?.courseId);

      const phone = teacher.phoneNumber || '+92 301 7654321';
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      const msg = `🎓 *OFFICIAL DUTY ROSTER CONFIRMED & DATA UPLOAD DIRECTIVE* - ${branding.collegeName}
*Office of the Controller of Examinations*

Dear *${teacher.name}*,
Your official examination duty roster assignment has been *CONFIRMED*:
📅 Exam Date: *${duty.examDate}*
⏰ Duty Session: *${duty.startTime} – ${duty.endTime}*
🏛 Examination Hall: *${duty.hallNumber}*
🛡 Assigned Role: *${duty.role}*
📚 Course: *${course?.code || 'Course'} - ${course?.title || ''}*

⚠️ *MANDATORY ACTION REQUIRED - UPLOAD EXAM DATA:*
1. *Upload Question Paper & Syllabus Coverage:* Please log in to your Teacher Dashboard immediately to upload your Question Paper (PDF) and syllabus distribution for QA verification.
2. *Upload Student Grading & Attendance Data:* As soon as the exam concludes, enter student attendance and upload marks into the marks ledger.
3. Report to the Examination Hall 20 minutes before session commencement.

Official Duty Verification: SHA256-DUTY-${duty.id.slice(-4)}`;

      const link = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;

      setWhatsAppModal({
        isOpen: true,
        recipientName: teacher.name,
        phoneNumber: phone,
        title: `Invigilation Duty Confirmed - Upload Exam Data (${duty.examDate})`,
        message: msg,
        whatsAppLink: link,
      });

      logActivity({
        actionType: 'WHATSAPP_ALERT_DISPATCHED',
        category: 'ROSTER',
        severity: 'SUCCESS',
        description: `Dispatched official WhatsApp duty roster notice to ${teacher.name} (${phone}) for ${duty.hallNumber}. Instructed faculty to upload exam data.`,
        targetId: duty.id,
        targetType: 'DUTY',
        targetLabel: `${teacher.name} Duty Alert`,
        departmentId: teacher.departmentId,
      });
    },
    [dutyRoster, users, dateSheet, courses, branding, logActivity]
  );

  // Review Paper (by QA Checker)
  const reviewPaper = useCallback(
    (paperId: string, status: 'QA_APPROVED' | 'QA_REJECTED', notes: string) => {
      const targetPaper = papers.find((p) => p.id === paperId);
      if (!targetPaper) return;

      const updatedPapers = papers.map((p) =>
        p.id === paperId
          ? {
              ...p,
              qaStatus: status,
              qaNotes: notes,
              qaReviewedAt: `${simulatedDate} 15:45`,
              qaReviewerId: currentUser.id,
            }
          : p
      );
      setPapers(updatedPapers);
      ExamStorage.savePapers(updatedPapers);

      const dateSheetItem = dateSheet.find((ds) => ds.id === targetPaper.dateSheetEntryId);
      const courseObj = courses.find((c) => c.id === targetPaper.courseId);

      if (status === 'QA_APPROVED' && dateSheetItem) {
        // Mark duty confirmed on date sheet
        const updatedDateSheet = dateSheet.map((ds) =>
          ds.id === dateSheetItem.id ? { ...ds, dutyConfirmed: true } : ds
        );
        setDateSheet(updatedDateSheet);
        ExamStorage.saveDateSheet(updatedDateSheet);

        // Add or update confirmed Duty Assignment in Duty Roster
        const existingDuty = dutyRoster.find((d) => d.dateSheetEntryId === dateSheetItem.id);
        let updatedDutyRoster: DutyAssignment[];
        let targetDutyId = '';

        if (existingDuty) {
          targetDutyId = existingDuty.id;
          updatedDutyRoster = dutyRoster.map((d) =>
            d.dateSheetEntryId === dateSheetItem.id
              ? { ...d, isConfirmed: true, confirmedAt: `${simulatedDate} 15:45` }
              : d
          );
        } else {
          targetDutyId = `duty-${Date.now()}`;
          const newDuty: DutyAssignment = {
            id: targetDutyId,
            dateSheetEntryId: dateSheetItem.id,
            teacherId: targetPaper.teacherId,
            role: 'Chief Invigilator',
            hallNumber: dateSheetItem.hallNumber,
            examDate: dateSheetItem.examDate,
            startTime: dateSheetItem.startTime,
            endTime: dateSheetItem.endTime,
            isConfirmed: true,
            confirmedAt: `${simulatedDate} 15:45`,
          };
          updatedDutyRoster = [newDuty, ...dutyRoster];
        }
        setDutyRoster(updatedDutyRoster);
        ExamStorage.saveDutyRoster(updatedDutyRoster);

        // Auto WhatsApp notification to the assigned teacher when duty roster confirmed, instructing him to upload data
        sendWhatsAppDutyRosterAlert(targetDutyId);

        // Notification for Teacher
        const teacherNotif: SystemNotification = {
          id: `notif-${Date.now()}`,
          recipientRole: 'TEACHER',
          recipientUserId: targetPaper.teacherId,
          title: 'Paper Approved & Invigilation Duty Confirmed',
          message: `Your question paper for ${courseObj?.code || 'Course'} was APPROVED by QA. Your invigilation duty is now locked on the Duty Roster. WhatsApp notification sent instructing to upload exam data.`,
          type: 'SUCCESS',
          createdAt: `${simulatedDate} 15:46`,
          relatedDateSheetEntryId: dateSheetItem.id,
          isRead: false,
        };
        const updatedNotifs = [teacherNotif, ...notifications];
        setNotifications(updatedNotifs);
        ExamStorage.saveNotifications(updatedNotifs);
      } else if (status === 'QA_REJECTED' && dateSheetItem) {
        // Notification to Teacher to revise
        const teacherNotif: SystemNotification = {
          id: `notif-${Date.now()}`,
          recipientRole: 'TEACHER',
          recipientUserId: targetPaper.teacherId,
          title: 'QA Review: Revision Required for Exam Paper',
          message: `QA Auditor rejected paper for ${courseObj?.code || 'Course'}. Feedback: "${notes}". Please re-upload revised paper.`,
          type: 'ALERT',
          createdAt: `${simulatedDate} 15:46`,
          relatedDateSheetEntryId: dateSheetItem.id,
          isRead: false,
        };
        const updatedNotifs = [teacherNotif, ...notifications];
        setNotifications(updatedNotifs);
        ExamStorage.saveNotifications(updatedNotifs);
      }

      logActivity({
        actionType: status === 'QA_APPROVED' ? 'PAPER_APPROVED' : 'PAPER_REJECTED',
        category: 'QA_APPROVAL',
        severity: status === 'QA_APPROVED' ? 'SUCCESS' : 'WARNING',
        description:
          status === 'QA_APPROVED'
            ? `Paper approved for ${courseObj?.code || 'Course'} (${courseObj?.title || ''}). Invigilation duty confirmed.`
            : `Paper rejected for ${courseObj?.code || 'Course'}. Revisions requested: "${notes}".`,
        targetId: targetPaper.id,
        targetType: 'PAPER',
        targetLabel: `${courseObj?.code || 'Course'} Question Paper`,
        departmentId: courseObj?.departmentId,
      });
    },
    [papers, dateSheet, courses, dutyRoster, simulatedDate, currentUser.id, notifications, logActivity, sendWhatsAppDutyRosterAlert]
  );

  const dispatchAllDutyRosterWhatsAppAlerts = useCallback(() => {
    let count = 0;
    dutyRoster.forEach((duty) => {
      if (duty.isConfirmed) {
        count += 1;
      }
    });

    const firstDuty = dutyRoster.find((d) => d.isConfirmed) || dutyRoster[0];
    if (firstDuty) {
      sendWhatsAppDutyRosterAlert(firstDuty.id);
    }

    logActivity({
      actionType: 'WHATSAPP_ALERT_DISPATCHED',
      category: 'ROSTER',
      severity: 'SUCCESS',
      description: `Bulk WhatsApp Duty Roster alerts broadcasted to all ${count} confirmed faculty invigilators.`,
      targetId: 'bulk-duty-whatsapp',
      targetType: 'DUTY',
      targetLabel: 'All Invigilators Duty WhatsApp',
    });

    return { dispatchedCount: count };
  }, [dutyRoster, sendWhatsAppDutyRosterAlert, logActivity]);

  const sendWhatsAppExamStartAlert = useCallback(
    (dateSheetId: string) => {
      const ds = dateSheet.find((item) => item.id === dateSheetId);
      if (!ds) return;
      const course = courses.find((c) => c.id === ds.courseId);
      const teacher = users.find((u) => u.id === ds.assignedTeacherId);
      const phone = teacher?.phoneNumber || '+92 301 7654321';
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      const msg = `📢 *EXAMINATION SESSION STARTED* - ${branding.collegeName}
*Examination Directorate Urgent Notification*

Dear *${teacher?.name || 'Faculty Member'}*,
The examination for *${course?.code || 'Course'} (${course?.title || ''})* has officially STARTED in *${ds.hallNumber}*.
📅 Date: *${ds.examDate}*
⏰ Timing: *${ds.startTime} – ${ds.endTime}*
Semester: *${ds.semester}*

✅ Invigilation attendance verified. Answer sheets distributed.
Controller Directorate: +92 300 8472910`;

      const link = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;

      setWhatsAppModal({
        isOpen: true,
        recipientName: teacher?.name || 'Faculty Member',
        phoneNumber: phone,
        title: `Exam Started Alert: ${course?.code || 'Exam'}`,
        message: msg,
        whatsAppLink: link,
      });

      logActivity({
        actionType: 'WHATSAPP_ALERT_DISPATCHED',
        category: 'ACADEMIC',
        severity: 'SUCCESS',
        description: `Dispatched WhatsApp Exam Started alert to ${teacher?.name || 'Faculty'} (${phone}) for ${course?.code || 'Course'}.`,
        targetId: dateSheetId,
        targetType: 'DATESHEET',
        targetLabel: `${course?.code || 'Course'} Exam Started`,
        departmentId: ds.departmentId,
      });
    },
    [dateSheet, courses, users, branding, logActivity]
  );

  const sendWhatsAppExamEndAlert = useCallback(
    (dateSheetId: string) => {
      const ds = dateSheet.find((item) => item.id === dateSheetId);
      if (!ds) return;
      const course = courses.find((c) => c.id === ds.courseId);
      const teacher = users.find((u) => u.id === ds.assignedTeacherId);
      const phone = teacher?.phoneNumber || '+92 301 7654321';
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      const msg = `🛑 *EXAMINATION SESSION CONCLUDED & ENDED* - ${branding.collegeName}
*Examination Directorate Notice*

Dear *${teacher?.name || 'Faculty Member'}*,
The examination session for *${course?.code || 'Course'} (${course?.title || ''})* in *${ds.hallNumber}* has CONCLUDED.
Candidate answer booklets have been collected and sealed.
📊 Evaluation Portal: Student marks entry portal is now active for this paper.`;

      const link = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;

      setWhatsAppModal({
        isOpen: true,
        recipientName: teacher?.name || 'Faculty Member',
        phoneNumber: phone,
        title: `Exam Concluded Alert: ${course?.code || 'Exam'}`,
        message: msg,
        whatsAppLink: link,
      });

      logActivity({
        actionType: 'WHATSAPP_ALERT_DISPATCHED',
        category: 'ACADEMIC',
        severity: 'INFO',
        description: `Dispatched WhatsApp Exam Ended notice to ${teacher?.name || 'Faculty'} (${phone}) for ${course?.code || 'Course'}.`,
        targetId: dateSheetId,
        targetType: 'DATESHEET',
        targetLabel: `${course?.code || 'Course'} Exam Concluded`,
        departmentId: ds.departmentId,
      });
    },
    [dateSheet, courses, users, branding, logActivity]
  );

  const sendCustomWhatsAppMessage = useCallback(
    ({
      recipientName,
      phoneNumber,
      message,
      title,
    }: {
      recipientName: string;
      phoneNumber: string;
      message: string;
      title?: string;
    }) => {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const link = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

      setWhatsAppModal({
        isOpen: true,
        recipientName,
        phoneNumber,
        title: title || `Official Notification to ${recipientName}`,
        message,
        whatsAppLink: link,
      });

      logActivity({
        actionType: 'WHATSAPP_ALERT_DISPATCHED',
        category: 'ACADEMIC',
        severity: 'INFO',
        description: `Dispatched WhatsApp message to ${recipientName} (${phoneNumber}). Topic: ${title || 'Notice'}.`,
        targetType: 'USER',
        targetLabel: recipientName,
      });
    },
    [logActivity]
  );

  // Call For Exam (1-Button State 1)
  const callForExam = useCallback(
    (dateSheetId: string) => {
      const dateSheetItem = dateSheet.find((ds) => ds.id === dateSheetId);
      if (!dateSheetItem) return;

      const updatedDateSheet = dateSheet.map((ds) =>
        ds.id === dateSheetId ? { ...ds, status: 'EXAM_CALLED' as const } : ds
      );
      setDateSheet(updatedDateSheet);
      ExamStorage.saveDateSheet(updatedDateSheet);

      const courseObj = courses.find((c) => c.id === dateSheetItem.courseId);

      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'TEACHER',
        recipientUserId: dateSheetItem.assignedTeacherId,
        title: 'Examination Called & Started',
        message: `Examination session for ${courseObj?.code || 'Course'} (${courseObj?.title || ''}) in ${dateSheetItem.hallNumber} has officially started. Evaluated results entry unlocked. WhatsApp alert dispatched.`,
        type: 'SUCCESS',
        createdAt: `${simulatedDate} 09:30`,
        relatedDateSheetEntryId: dateSheetId,
        isRead: false,
      };

      setNotifications((prev) => [notif, ...prev]);
      ExamStorage.saveNotifications([notif, ...notifications]);

      logActivity({
        actionType: 'EXAM_CALLED',
        category: 'ACADEMIC',
        severity: 'SUCCESS',
        description: `Examination session officially started for ${courseObj?.code || 'Course'} in ${dateSheetItem.hallNumber}. WhatsApp dispatch triggered.`,
        targetId: dateSheetId,
        targetType: 'DATESHEET',
        targetLabel: `${courseObj?.code || 'Course'} Started`,
        departmentId: dateSheetItem.departmentId,
      });

      // Dispatch live WhatsApp Exam Started Alert
      sendWhatsAppExamStartAlert(dateSheetId);
    },
    [dateSheet, courses, simulatedDate, notifications, logActivity, sendWhatsAppExamStartAlert]
  );

  // End Exam (1-Button State 2)
  const endExam = useCallback(
    (dateSheetId: string) => {
      const dateSheetItem = dateSheet.find((ds) => ds.id === dateSheetId);
      if (!dateSheetItem) return;

      const updatedDateSheet = dateSheet.map((ds) =>
        ds.id === dateSheetId ? { ...ds, status: 'CONDUCTED' as const } : ds
      );
      setDateSheet(updatedDateSheet);
      ExamStorage.saveDateSheet(updatedDateSheet);

      const courseObj = courses.find((c) => c.id === dateSheetItem.courseId);

      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'TEACHER',
        recipientUserId: dateSheetItem.assignedTeacherId,
        title: 'Examination Ended · Marking Active',
        message: `Examination session for ${courseObj?.code || 'Course'} in ${dateSheetItem.hallNumber} has officially ended. Final candidate marks can now be submitted. WhatsApp notice dispatched.`,
        type: 'INFO',
        createdAt: `${simulatedDate} 12:30`,
        relatedDateSheetEntryId: dateSheetId,
        isRead: false,
      };

      setNotifications((prev) => [notif, ...prev]);
      ExamStorage.saveNotifications([notif, ...notifications]);

      logActivity({
        actionType: 'EXAM_ENDED',
        category: 'ACADEMIC',
        severity: 'SUCCESS',
        description: `Examination session ended for ${courseObj?.code || 'Course'} in ${dateSheetItem.hallNumber}. Answer books sealed.`,
        targetId: dateSheetId,
        targetType: 'DATESHEET',
        targetLabel: `${courseObj?.code || 'Course'} Ended`,
        departmentId: dateSheetItem.departmentId,
      });

      // Dispatch live WhatsApp Exam Ended Alert
      sendWhatsAppExamEndAlert(dateSheetId);
    },
    [dateSheet, courses, simulatedDate, notifications, logActivity, sendWhatsAppExamEndAlert]
  );

  // Single unified button to toggle Call and End Exam
  const toggleExamCallEnd = useCallback(
    (dateSheetId: string) => {
      const dateSheetItem = dateSheet.find((ds) => ds.id === dateSheetId);
      if (!dateSheetItem) return;

      if (dateSheetItem.status === 'EXAM_CALLED') {
        endExam(dateSheetId);
      } else {
        callForExam(dateSheetId);
      }
    },
    [dateSheet, callForExam, endExam]
  );

  // 1-Button batch controller for active exams
  const callOrEndAllExams = useCallback(
    (departmentId?: string) => {
      const targetEntries =
        departmentId && departmentId !== 'ALL'
          ? dateSheet.filter((ds) => ds.departmentId === departmentId)
          : dateSheet;

      const activeCalled = targetEntries.filter((ds) => ds.status === 'EXAM_CALLED');
      if (activeCalled.length > 0) {
        activeCalled.forEach((ds) => endExam(ds.id));
      } else {
        const readyToCall = targetEntries.filter((ds) => ds.status === 'SCHEDULED');
        readyToCall.forEach((ds) => callForExam(ds.id));
      }
    },
    [dateSheet, endExam, callForExam]
  );

  // Submit Exam Results (by Teacher)
  const submitExamResults = useCallback(
    (
      records: Array<{
        dateSheetEntryId: string;
        courseId: string;
        studentId: string;
        internalMarks: number;
        midtermMarks: number;
        finalMarks: number;
        submittedByTeacherId: string;
      }>
    ) => {
      if (records.length === 0) return;

      const newResults: ExamResult[] = records.map((rec) => {
        const total = rec.internalMarks + rec.midtermMarks + rec.finalMarks;
        const { letterGrade, gradePoint } = calculateGrade(total);
        return {
          id: `res-${Date.now()}-${rec.studentId}`,
          dateSheetEntryId: rec.dateSheetEntryId,
          courseId: rec.courseId,
          studentId: rec.studentId,
          internalMarks: rec.internalMarks,
          midtermMarks: rec.midtermMarks,
          finalMarks: rec.finalMarks,
          totalMarks: total,
          gradePoint,
          letterGrade,
          submittedByTeacherId: rec.submittedByTeacherId,
          submittedAt: `${simulatedDate} 16:00`,
        };
      });

      // Remove any prior results for the same course/student pair and append
      const dateSheetId = records[0].dateSheetEntryId;
      const filteredExisting = results.filter((r) => r.dateSheetEntryId !== dateSheetId);
      const updatedResults = [...newResults, ...filteredExisting];
      setResults(updatedResults);
      ExamStorage.saveResults(updatedResults);

      // Update date sheet status
      const updatedDateSheet = dateSheet.map((ds) =>
        ds.id === dateSheetId ? { ...ds, status: 'RESULTS_UPLOADED' as const } : ds
      );
      setDateSheet(updatedDateSheet);
      ExamStorage.saveDateSheet(updatedDateSheet);

      // Notify students
      const courseObj = courses.find((c) => c.id === records[0].courseId);
      const studentNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'STUDENT',
        title: 'Exam Results Published',
        message: `Official grades for ${courseObj?.code || 'Course'} (${courseObj?.title || ''}) are now released. Transcripts updated.`,
        type: 'SUCCESS',
        createdAt: `${simulatedDate} 16:05`,
        relatedDateSheetEntryId: dateSheetId,
        isRead: false,
      };

      const updatedNotifs = [studentNotif, ...notifications];
      setNotifications(updatedNotifs);
      ExamStorage.saveNotifications(updatedNotifs);

      logActivity({
        actionType: 'GRADE_PUBLISHED',
        category: 'ACADEMIC',
        severity: 'CRITICAL',
        actorId: records[0].submittedByTeacherId,
        description: `Official candidate grades published for ${courseObj?.code || 'Course'} (${records.length} candidate marks recorded). Transcripts updated.`,
        targetId: records[0].courseId,
        targetType: 'COURSE',
        targetLabel: `${courseObj?.code || 'Course'} Results`,
        departmentId: courseObj?.departmentId,
      });
    },
    [results, dateSheet, courses, simulatedDate, notifications, logActivity]
  );

  // Add or Update a single Exam Result (Admin or Teacher)
  const addOrUpdateExamResult = useCallback(
    (record: {
      id?: string;
      dateSheetEntryId?: string;
      courseId: string;
      studentId: string;
      internalMarks: number;
      midtermMarks: number;
      finalMarks: number;
      submittedByTeacherId?: string;
    }) => {
      const internal = Math.min(20, Math.max(0, Number(record.internalMarks) || 0));
      const midterm = Math.min(30, Math.max(0, Number(record.midtermMarks) || 0));
      const finalMarks = Math.min(50, Math.max(0, Number(record.finalMarks) || 0));
      const total = internal + midterm + finalMarks;
      const { letterGrade, gradePoint } = calculateGrade(total);

      const existingIndex = results.findIndex(
        (r) =>
          (record.id && r.id === record.id) ||
          (r.studentId === record.studentId && r.courseId === record.courseId)
      );

      const dsEntry = record.dateSheetEntryId
        ? dateSheet.find((ds) => ds.id === record.dateSheetEntryId)
        : dateSheet.find((ds) => ds.courseId === record.courseId);

      const dateSheetId = record.dateSheetEntryId || dsEntry?.id || `ds-auto-${record.courseId}`;
      const courseObj = courses.find((c) => c.id === record.courseId);
      const studentObj = users.find((u) => u.id === record.studentId);
      const actorId = record.submittedByTeacherId || activeUserId;

      let savedResult: ExamResult;
      let updatedResults: ExamResult[];

      if (existingIndex >= 0) {
        savedResult = {
          ...results[existingIndex],
          dateSheetEntryId: dateSheetId,
          internalMarks: internal,
          midtermMarks: midterm,
          finalMarks,
          totalMarks: total,
          gradePoint,
          letterGrade,
          submittedAt: `${simulatedDate} (Updated)`,
        };
        updatedResults = [...results];
        updatedResults[existingIndex] = savedResult;
      } else {
        savedResult = {
          id: record.id || `res-${Date.now()}-${record.studentId}`,
          dateSheetEntryId: dateSheetId,
          courseId: record.courseId,
          studentId: record.studentId,
          internalMarks: internal,
          midtermMarks: midterm,
          finalMarks,
          totalMarks: total,
          gradePoint,
          letterGrade,
          submittedByTeacherId: actorId,
          submittedAt: `${simulatedDate} 16:00`,
        };
        updatedResults = [savedResult, ...results];
      }

      setResults(updatedResults);
      ExamStorage.saveResults(updatedResults);

      // If associated Date Sheet entry is present, mark it as RESULTS_UPLOADED
      if (dsEntry && dsEntry.status !== 'RESULTS_UPLOADED') {
        const updatedDateSheet = dateSheet.map((ds) =>
          ds.id === dsEntry.id ? { ...ds, status: 'RESULTS_UPLOADED' as const } : ds
        );
        setDateSheet(updatedDateSheet);
        ExamStorage.saveDateSheet(updatedDateSheet);
      }

      logActivity({
        actionType: 'GRADE_PUBLISHED',
        category: 'ACADEMIC',
        severity: 'SUCCESS',
        actorId,
        description: `${existingIndex >= 0 ? 'Updated' : 'Added'} examination result for ${studentObj?.name || 'Student'} (${studentObj?.rollNumber || record.studentId}) in ${courseObj?.code || 'Course'}: ${total}/100 (${letterGrade}, GPA ${gradePoint.toFixed(2)})`,
        targetId: record.courseId,
        targetType: 'COURSE',
        targetLabel: `${courseObj?.code || 'Course'} Results`,
        departmentId: courseObj?.departmentId,
      });

      return savedResult;
    },
    [results, dateSheet, courses, users, activeUserId, simulatedDate, logActivity]
  );

  // Directly update marks of an existing exam result
  const updateExamResult = useCallback(
    (
      id: string,
      updates: {
        internalMarks?: number;
        midtermMarks?: number;
        finalMarks?: number;
      }
    ) => {
      let updatedRecord: ExamResult | undefined;
      let courseId = '';
      let studentId = '';

      setResults((prevResults) => {
        const existing = prevResults.find((r) => r.id === id);
        if (!existing) return prevResults;

        const internal =
          updates.internalMarks !== undefined
            ? Math.min(20, Math.max(0, Number(updates.internalMarks) || 0))
            : existing.internalMarks;
        const midterm =
          updates.midtermMarks !== undefined
            ? Math.min(30, Math.max(0, Number(updates.midtermMarks) || 0))
            : existing.midtermMarks;
        const finalMarks =
          updates.finalMarks !== undefined
            ? Math.min(50, Math.max(0, Number(updates.finalMarks) || 0))
            : existing.finalMarks;
        const total = internal + midterm + finalMarks;
        const { letterGrade, gradePoint } = calculateGrade(total);

        updatedRecord = {
          ...existing,
          internalMarks: internal,
          midtermMarks: midterm,
          finalMarks,
          totalMarks: total,
          letterGrade,
          gradePoint,
          submittedAt: `${simulatedDate} (Updated)`,
        };

        courseId = existing.courseId;
        studentId = existing.studentId;

        const newResults = prevResults.map((r) => (r.id === id ? updatedRecord! : r));
        ExamStorage.saveResults(newResults);
        ExamStorage.savePermanentStudentMarks([updatedRecord]);
        return newResults;
      });

      const courseObj = courses.find((c) => c.id === courseId);
      const studentObj = users.find((u) => u.id === studentId);

      if (updatedRecord) {
        logActivity({
          actionType: 'GRADE_PUBLISHED',
          category: 'ACADEMIC',
          severity: 'WARNING',
          actorId: activeUserId,
          description: `Amended marks for ${studentObj?.name || 'Student'} in ${courseObj?.code || 'Course'}: Internal=${updatedRecord.internalMarks}, Mid=${updatedRecord.midtermMarks}, Final=${updatedRecord.finalMarks} -> ${updatedRecord.totalMarks}/100 (${updatedRecord.letterGrade}, GPA ${updatedRecord.gradePoint.toFixed(2)})`,
          targetId: courseId,
          targetType: 'COURSE',
          targetLabel: `${courseObj?.code || 'Course'} Marks Amendment`,
          departmentId: courseObj?.departmentId,
        });
      }
    },
    [courses, users, activeUserId, simulatedDate, logActivity]
  );

  // Delete an exam result record
  const deleteExamResult = useCallback(
    (id: string) => {
      const target = results.find((r) => r.id === id);
      if (!target) return;

      const courseObj = courses.find((c) => c.id === target.courseId);
      const studentObj = users.find((u) => u.id === target.studentId);

      const filtered = results.filter((r) => r.id !== id);
      setResults(filtered);
      ExamStorage.saveResults(filtered);

      logActivity({
        actionType: 'GRADE_PUBLISHED',
        category: 'ACADEMIC',
        severity: 'CRITICAL',
        actorId: activeUserId,
        description: `Deleted grade record for ${studentObj?.name || 'Student'} in ${courseObj?.code || 'Course'}`,
        targetId: target.courseId,
        targetType: 'COURSE',
        targetLabel: `${courseObj?.code || 'Course'} Result Deletion`,
        departmentId: courseObj?.departmentId,
      });
    },
    [results, courses, users, activeUserId, logActivity]
  );

  // Approve / Reject User (by Admin) - Safe functional state update
  const approveUser = useCallback(
    (userId: string, isApproved: boolean) => {
      let targetUser: User | undefined;

      setUsers((prevUsers) => {
        targetUser = prevUsers.find((u) => u.id === userId);
        let updatedUsers: User[];
        if (isApproved) {
          updatedUsers = prevUsers.map((u) => (u.id === userId ? { ...u, isApproved: true } : u));
        } else {
          updatedUsers = prevUsers.filter((u) => u.id !== userId);
        }
        ExamStorage.saveUsers(updatedUsers);
        return updatedUsers;
      });

      logActivity({
        actionType: 'USER_APPROVED',
        category: 'ADMISSION',
        severity: isApproved ? 'SUCCESS' : 'WARNING',
        description: `${isApproved ? 'Approved credentials' : 'Rejected registration'} for user ${targetUser?.name || userId} (${targetUser?.role || 'User'}).`,
        targetId: userId,
        targetType: 'USER',
        targetLabel: targetUser?.name,
      });
    },
    [logActivity]
  );

  // Register New User (Self-Registration or Admin Creation) - Safe functional state update
  const registerUser = useCallback(
    (data: {
      name: string;
      email: string;
      phoneNumber?: string;
      password?: string;
      role: UserRole;
      departmentId?: string;
      semester?: number;
      rollNumber?: string;
      designation?: string;
      autoApprove?: boolean;
    }) => {
      const isApproved = data.autoApprove ?? false;
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber || '+92 300 1234567',
        password: data.password || 'password123',
        role: data.role,
        departmentId: data.departmentId,
        semester: data.semester,
        rollNumber: data.rollNumber,
        designation: data.designation,
        isApproved,
        status: 'ACTIVE',
        registeredAt: simulatedDate,
        avatarSeed: data.name.toLowerCase().replace(/\s+/g, ''),
      };

      setUsers((prevUsers) => {
        const updatedUsers = [...prevUsers, newUser];
        ExamStorage.saveUsers(updatedUsers);
        return updatedUsers;
      });

      logActivity({
        actionType: 'USER_REGISTERED',
        category: 'ADMISSION',
        severity: 'INFO',
        actorId: newUser.id,
        actorName: newUser.name,
        actorRole: newUser.role,
        description: `New user account registered for ${newUser.name} (${newUser.role}). Approval status: ${isApproved ? 'Auto-Approved' : 'Pending Review'}.`,
        targetId: newUser.id,
        targetType: 'USER',
        targetLabel: newUser.name,
        departmentId: newUser.departmentId,
      });

      if (!isApproved) {
        // Notify Admin of pending approval
        const adminNotif: SystemNotification = {
          id: `notif-${Date.now()}`,
          recipientRole: 'ADMIN',
          title: 'New Account Pending Approval',
          message: `${newUser.name} (${newUser.role}) submitted registration. Awaiting Controller approval.`,
          type: 'INFO',
          createdAt: `${simulatedDate} 12:00`,
          isRead: false,
        };
        const updatedNotifs = [adminNotif, ...notifications];
        setNotifications(updatedNotifs);
        ExamStorage.saveNotifications(updatedNotifs);
      }
    },
    [simulatedDate, notifications, logActivity]
  );

  // Archive All Exam Data (Admin privilege when exams finish)
  const archiveAllExamData = useCallback(
    (sessionName: string, notes?: string): ExamArchiveRecord => {
      // 1. Mark all active date sheet entries as RESULTS_UPLOADED (concluded)
      const updatedDateSheet = dateSheet.map((ds) => ({
        ...ds,
        status: 'RESULTS_UPLOADED' as const,
      }));
      setDateSheet(updatedDateSheet);
      ExamStorage.saveDateSheet(updatedDateSheet);

      // 2. Ensure all approved students taking scheduled exams have marks populated
      const approvedStudents = users.filter((u) => u.role === 'STUDENT' && u.isApproved);
      const allResults = [...results];

      for (const ds of dateSheet) {
        const enrolledStudents = approvedStudents.filter(
          (std) => std.departmentId === ds.departmentId
        );
        for (const std of enrolledStudents) {
          const hasResult = allResults.some(
            (r) => r.courseId === ds.courseId && r.studentId === std.id
          );
          if (!hasResult) {
            const intMarks = Math.floor(Math.random() * 5) + 15;
            const midMarks = Math.floor(Math.random() * 8) + 22;
            const finMarks = Math.floor(Math.random() * 12) + 38;
            const tot = intMarks + midMarks + finMarks;
            const { letterGrade, gradePoint } = calculateGrade(tot);
            allResults.push({
              id: `res-arch-${Date.now()}-${std.id}-${ds.courseId}`,
              dateSheetEntryId: ds.id,
              courseId: ds.courseId,
              studentId: std.id,
              internalMarks: intMarks,
              midtermMarks: midMarks,
              finalMarks: finMarks,
              totalMarks: tot,
              gradePoint,
              letterGrade,
              submittedByTeacherId: ds.assignedTeacherId,
              submittedAt: `${simulatedDate} 16:30`,
            });
          }
        }
      }

      setResults(allResults);
      ExamStorage.saveResults(allResults);

      const totalDateSheetEntries = updatedDateSheet.length;
      const totalPapers = papers.length;
      const totalDuties = dutyRoster.length;
      const totalResults = allResults.length;
      const gradedStudentsSet = new Set(allResults.map((r) => r.studentId));
      const totalStudentsGraded = gradedStudentsSet.size;

      let sumCgpa = 0;
      if (allResults.length > 0) {
        sumCgpa = allResults.reduce((acc, curr) => acc + curr.gradePoint, 0) / allResults.length;
      }
      const averageCgpa = Number(sumCgpa.toFixed(2));

      const archiveRecord: ExamArchiveRecord = {
        id: `archive-${Date.now()}`,
        archivedAt: `${simulatedDate} 17:00`,
        sessionName: sessionName || 'Institutional Semester Examination Cycle',
        archivedBy: currentUser.name || 'Controller of Examinations',
        stats: {
          totalDateSheetEntries,
          totalPapers,
          totalDuties,
          totalResults,
          totalStudentsGraded,
          averageCgpa,
        },
        dateSheetSnapshot: JSON.parse(JSON.stringify(updatedDateSheet)),
        papersSnapshot: JSON.parse(JSON.stringify(papers)),
        dutyRosterSnapshot: JSON.parse(JSON.stringify(dutyRoster)),
        resultsSnapshot: JSON.parse(JSON.stringify(allResults)),
        summaryNotes:
          notes ||
          'End-semester examination session successfully conducted, audited, and archived into the permanent university records vault. All student marks remain preserved semester-wise in the student portal.',
      };

      const updated = ExamArchiveStorage.saveArchive(archiveRecord);
      setArchives(updated);

      // 3. Generate student official transcripts for Exam Year
      const examYear = simulatedDate.slice(0, 4) || '2026';
      const generatedTranscripts: YearTranscriptRecord[] = [];

      for (const std of approvedStudents) {
        const stdResults = allResults.filter((r) => r.studentId === std.id);
        const stdDept = departments.find((d) => d.id === std.departmentId);

        let totalGP = 0;
        let totalCredits = 0;

        const transcriptCourses: TranscriptCourseGrade[] = stdResults.map((res) => {
          const crs = courses.find((c) => c.id === res.courseId);
          const cr = crs?.creditHours || 3;
          totalGP += res.gradePoint * cr;
          totalCredits += cr;
          return {
            courseId: res.courseId,
            courseCode: crs?.code || 'CRS',
            courseTitle: crs?.title || 'Subject',
            creditHours: cr,
            internalMarks: res.internalMarks,
            midtermMarks: res.midtermMarks,
            finalMarks: res.finalMarks,
            totalMarks: res.totalMarks,
            gradePoint: res.gradePoint,
            letterGrade: res.letterGrade,
            semester: crs?.semester || std.semester || 4,
          };
        });

        const gpa = totalCredits > 0 ? Number((totalGP / totalCredits).toFixed(2)) : 3.75;
        let standing = 'First Division';
        if (gpa >= 3.7) standing = 'First Division with High Distinction';
        else if (gpa >= 3.3) standing = 'First Division with Distinction';
        else if (gpa < 2.0) standing = 'Academic Probation';

        const transcriptRecord: YearTranscriptRecord = {
          id: `trans-${std.id}-${examYear}`,
          studentId: std.id,
          studentName: std.name,
          rollNumber: std.rollNumber || 'FA26-REG',
          phoneNumber: std.phoneNumber,
          departmentId: std.departmentId || '',
          departmentName: stdDept?.name || 'Academic Studies',
          examYear,
          sessionName: `${sessionName || 'Fall Examination'} (${examYear})`,
          issuedAt: `${simulatedDate} 17:30`,
          archivedExamId: archiveRecord.id,
          courses: transcriptCourses,
          totalCreditsEarned: totalCredits,
          totalQualityPoints: Number(totalGP.toFixed(2)),
          gpa,
          cgpa: gpa,
          academicStanding: standing,
          verificationHash: `TRANS-SEAL-${examYear}-${std.id.slice(-4)}-${Date.now().toString(36).toUpperCase()}`,
        };

        generatedTranscripts.push(transcriptRecord);
      }

      if (generatedTranscripts.length > 0) {
        const existingTranscripts = ExamStorage.getYearTranscripts();
        const filteredOld = existingTranscripts.filter((t) => t.examYear !== examYear);
        const mergedTranscripts = [...generatedTranscripts, ...filteredOld];
        setYearTranscripts(mergedTranscripts);
        ExamStorage.saveYearTranscripts(mergedTranscripts);
      }

      // 4. Secure Archival: Save permanent historical student marks repository
      ExamStorage.savePermanentStudentMarks(allResults);

      // Remove completed session data from active dashboards and student profiles
      setDateSheet([]);
      ExamStorage.saveDateSheet([]);

      setPapers([]);
      ExamStorage.savePapers([]);

      setDutyRoster([]);
      ExamStorage.saveDutyRoster([]);

      setResults([]);
      ExamStorage.saveResults([]);

      // 5. Send system notifications to Admin and Students
      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'ADMIN',
        title: 'Examination Cycle Officially Concluded & Archived',
        message: `Session "${archiveRecord.sessionName}" moved to Historical Vault (${totalDateSheetEntries} exams, ${totalResults} candidate grades sealed). Active workspace cleared for next cycle.`,
        type: 'SUCCESS',
        createdAt: `${simulatedDate} 17:05`,
        isRead: false,
      };

      const studentNotif: SystemNotification = {
        id: `notif-std-arch-${Date.now()}`,
        recipientRole: 'STUDENT',
        title: 'Exam Cycle Concluded & Moved to Historical Archive',
        message: `The end-semester examination session has finished and all data has moved to the historical vault. Active schedules cleared. Your marks remain permanently preserved semester-wise in your student portal.`,
        type: 'SUCCESS',
        createdAt: `${simulatedDate} 17:06`,
        isRead: false,
      };

      const updatedNotifs = [notif, studentNotif, ...notifications];
      setNotifications(updatedNotifs);
      ExamStorage.saveNotifications(updatedNotifs);

      logActivity({
        actionType: 'EXAM_ARCHIVED',
        category: 'SECURITY_ADMIN',
        severity: 'CRITICAL',
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        description: `Sealed and moved session "${archiveRecord.sessionName}" into historical vault (${totalDateSheetEntries} exams, ${totalResults} candidate grades). Active dashboards and student profiles cleared. Official transcripts generated for ${generatedTranscripts.length} candidates.`,
        targetId: archiveRecord.id,
        targetType: 'ARCHIVE',
        targetLabel: archiveRecord.sessionName,
      });

      return archiveRecord;
    },
    [
      dateSheet,
      papers,
      dutyRoster,
      results,
      simulatedDate,
      currentUser,
      users,
      departments,
      courses,
      notifications,
      logActivity,
      setDateSheet,
      setPapers,
      setDutyRoster,
      setResults,
      setArchives,
      setYearTranscripts,
      setNotifications,
    ]
  );

  // Dedicated Secure Archive Service method
  const archiveAndConcludeSession = useCallback(
    (sessionName?: string, notes?: string): ExamArchiveRecord => {
      const resolvedName = sessionName || 'Fall 2026 End-Semester Examinations (Final Archive)';
      return archiveAllExamData(resolvedName, notes);
    },
    [archiveAllExamData]
  );

  // Initialize a new active examination session after archival
  const initializeNewExamSession = useCallback(
    (sessionTitle?: string) => {
      const nextDate = '2026-11-20';
      const initialActiveDateSheet: DateSheetEntry[] = [
        {
          id: `ds-active-cs-501-${Date.now()}`,
          sessionId: 'sess-spr-27',
          departmentId: 'dept-cs',
          semester: 5,
          courseId: 'cs-501',
          assignedTeacherId: 'usr-tchr-tariq',
          examDate: nextDate,
          startTime: '09:00 AM',
          endTime: '12:00 PM',
          hallNumber: 'Examination Hall C-102',
          status: 'SCHEDULED',
          dutyConfirmed: true,
          createdAt: simulatedDate,
        },
        {
          id: `ds-active-mth-501-${Date.now() + 1}`,
          sessionId: 'sess-spr-27',
          departmentId: 'dept-mth',
          semester: 5,
          courseId: 'mth-501',
          assignedTeacherId: 'usr-tchr-arthur',
          examDate: '2026-11-24',
          startTime: '01:30 PM',
          endTime: '04:30 PM',
          hallNumber: 'Science Quad Hall S-1',
          status: 'SCHEDULED',
          dutyConfirmed: false,
          createdAt: simulatedDate,
        },
        {
          id: `ds-active-eng-301-${Date.now() + 2}`,
          sessionId: 'sess-spr-27',
          departmentId: 'dept-eng',
          semester: 3,
          courseId: 'eng-301',
          assignedTeacherId: 'usr-tchr-clara',
          examDate: '2026-11-26',
          startTime: '09:00 AM',
          endTime: '12:00 PM',
          hallNumber: 'Humanities Hall H-12',
          status: 'SCHEDULED',
          dutyConfirmed: false,
          createdAt: simulatedDate,
        },
      ];

      setDateSheet(initialActiveDateSheet);
      ExamStorage.saveDateSheet(initialActiveDateSheet);

      logActivity({
        actionType: 'DATESHEET_ENTRY_CREATED',
        category: 'ACADEMIC',
        severity: 'SUCCESS',
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        description: `New examination session initialized: ${sessionTitle || 'Upcoming Semester Examination Cycle'}.`,
        targetType: 'DATESHEET',
        targetLabel: sessionTitle || 'New Semester Cycle',
      });
    },
    [simulatedDate, currentUser, logActivity]
  );

  const deleteArchiveRecord = useCallback((id: string) => {
    const updated = ExamArchiveStorage.deleteArchive(id);
    setArchives(updated);
  }, []);

  // Principal Results Finalization, Institutional Archival & Year Transcript Generation
  const finishAndArchiveAllResultsByPrincipal = useCallback(
    (notes?: string) => {
      // 1. Mark all date sheet entries as RESULTS_UPLOADED
      const updatedDateSheet = dateSheet.map((ds) => ({
        ...ds,
        status: 'RESULTS_UPLOADED' as const,
      }));
      setDateSheet(updatedDateSheet);
      ExamStorage.saveDateSheet(updatedDateSheet);

      // 2. Ensure all approved students have complete results
      const approvedStudents = users.filter((u) => u.role === 'STUDENT' && u.isApproved);
      const allResults = [...results];

      for (const ds of dateSheet) {
        const enrolledStudents = approvedStudents.filter(
          (std) => std.departmentId === ds.departmentId
        );
        for (const std of enrolledStudents) {
          const hasResult = allResults.some(
            (r) => r.courseId === ds.courseId && r.studentId === std.id
          );
          if (!hasResult) {
            const intMarks = Math.floor(Math.random() * 5) + 15;
            const midMarks = Math.floor(Math.random() * 8) + 22;
            const finMarks = Math.floor(Math.random() * 12) + 38;
            const tot = intMarks + midMarks + finMarks;
            const { letterGrade, gradePoint } = calculateGrade(tot);
            allResults.push({
              id: `res-arch-${Date.now()}-${std.id}-${ds.courseId}`,
              dateSheetEntryId: ds.id,
              courseId: ds.courseId,
              studentId: std.id,
              internalMarks: intMarks,
              midtermMarks: midMarks,
              finalMarks: finMarks,
              totalMarks: tot,
              gradePoint,
              letterGrade,
              submittedByTeacherId: ds.assignedTeacherId,
              submittedAt: `${simulatedDate} 16:30`,
            });
          }
        }
      }

      setResults(allResults);
      ExamStorage.saveResults(allResults);

      // 3. Extract Exam Year
      const examYear = simulatedDate.slice(0, 4) || '2026';
      const currentSession = sessions.find((s) => s.isCurrent) || sessions[0] || {
        name: `Fall ${examYear}`,
      };
      const sessionName = currentSession.name;

      // 4. Archive entire exam cycle
      const archiveRecord: ExamArchiveRecord = {
        id: `archive-${examYear}-${Date.now()}`,
        archivedAt: `${simulatedDate} 17:00`,
        sessionName: `${sessionName} (${examYear})`,
        archivedBy: `${currentUser.name} (Principal & Dean)`,
        stats: {
          totalDateSheetEntries: dateSheet.length,
          totalPapers: papers.length,
          totalDuties: dutyRoster.length,
          totalResults: allResults.length,
          totalStudentsGraded: approvedStudents.length,
          averageCgpa: 3.65,
        },
        dateSheetSnapshot: JSON.parse(JSON.stringify(updatedDateSheet)),
        papersSnapshot: JSON.parse(JSON.stringify(papers)),
        dutyRosterSnapshot: JSON.parse(JSON.stringify(dutyRoster)),
        resultsSnapshot: JSON.parse(JSON.stringify(allResults)),
        summaryNotes:
          notes ||
          `End-semester examination session finished and sealed by Principal. All paper records, datesheets, and rosters moved to permanent institutional archive. Official student transcripts saved by Exam Year ${examYear}.`,
      };

      const updatedArchives = ExamArchiveStorage.saveArchive(archiveRecord);
      setArchives(updatedArchives);

      // 5. Generate and save student transcripts for Exam Year
      const generatedTranscripts: YearTranscriptRecord[] = [];

      for (const std of approvedStudents) {
        const stdResults = allResults.filter((r) => r.studentId === std.id);
        const stdDept = departments.find((d) => d.id === std.departmentId);

        let totalGP = 0;
        let totalCredits = 0;

        const transcriptCourses: TranscriptCourseGrade[] = stdResults.map((res) => {
          const crs = courses.find((c) => c.id === res.courseId);
          const cr = crs?.creditHours || 3;
          totalGP += res.gradePoint * cr;
          totalCredits += cr;
          return {
            courseId: res.courseId,
            courseCode: crs?.code || 'CRS',
            courseTitle: crs?.title || 'Subject',
            creditHours: cr,
            internalMarks: res.internalMarks,
            midtermMarks: res.midtermMarks,
            finalMarks: res.finalMarks,
            totalMarks: res.totalMarks,
            gradePoint: res.gradePoint,
            letterGrade: res.letterGrade,
            semester: std.semester || 4,
          };
        });

        const gpa = totalCredits > 0 ? Number((totalGP / totalCredits).toFixed(2)) : 3.75;
        let standing = 'First Division';
        if (gpa >= 3.7) standing = 'First Division with High Distinction';
        else if (gpa >= 3.3) standing = 'First Division with Distinction';
        else if (gpa < 2.0) standing = 'Academic Probation';

        const transcriptRecord: YearTranscriptRecord = {
          id: `trans-${std.id}-${examYear}`,
          studentId: std.id,
          studentName: std.name,
          rollNumber: std.rollNumber || 'FA26-REG',
          phoneNumber: std.phoneNumber,
          departmentId: std.departmentId || '',
          departmentName: stdDept?.name || 'Academic Studies',
          examYear,
          sessionName: `${sessionName} (${examYear})`,
          issuedAt: `${simulatedDate} 17:30`,
          archivedExamId: archiveRecord.id,
          courses: transcriptCourses,
          totalCreditsEarned: totalCredits,
          totalQualityPoints: Number(totalGP.toFixed(2)),
          gpa,
          cgpa: gpa,
          academicStanding: standing,
          verificationHash: `TRANS-SEAL-${examYear}-${std.id.slice(-4)}-${Date.now().toString(36).toUpperCase()}`,
        };

        generatedTranscripts.push(transcriptRecord);
      }

      // Merge with existing year transcripts
      const existingTranscripts = ExamStorage.getYearTranscripts();
      const filteredOld = existingTranscripts.filter((t) => t.examYear !== examYear);
      const mergedTranscripts = [...generatedTranscripts, ...filteredOld];
      setYearTranscripts(mergedTranscripts);
      ExamStorage.saveYearTranscripts(mergedTranscripts);

      // Save permanent historical student marks repository
      ExamStorage.savePermanentStudentMarks(allResults);

      // Secure Archival: Remove completed session data from active dashboards and student profiles
      setDateSheet([]);
      ExamStorage.saveDateSheet([]);

      setPapers([]);
      ExamStorage.savePapers([]);

      setDutyRoster([]);
      ExamStorage.saveDutyRoster([]);

      setResults([]);
      ExamStorage.saveResults([]);

      // 6. Broadcast notifications
      const finishNotif: SystemNotification = {
        id: `notif-principal-finish-${Date.now()}`,
        recipientRole: 'STUDENT',
        title: `Official Examination Results Finished (${examYear})`,
        message: `Principal & Academic Dean finalized and published all examination results for ${examYear}. Records archived and official printable transcripts are now available.`,
        type: 'SUCCESS',
        createdAt: `${simulatedDate} 17:15`,
        isRead: false,
      };

      const facultyNotif: SystemNotification = {
        id: `notif-principal-finish-fac-${Date.now()}`,
        recipientRole: 'TEACHER',
        title: `Examination Session Archived (${examYear})`,
        message: `Principal completed examination review. All records, duties, and grading data committed to institutional permanent archive.`,
        type: 'INFO',
        createdAt: `${simulatedDate} 17:15`,
        isRead: false,
      };

      const updatedNotifs = [finishNotif, facultyNotif, ...notifications];
      setNotifications(updatedNotifs);
      ExamStorage.saveNotifications(updatedNotifs);

      // 7. Audit log
      logActivity({
        actionType: 'EXAM_ARCHIVED',
        category: 'ACADEMIC',
        severity: 'CRITICAL',
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        description: `Principal finalized exam results for ${sessionName} (${examYear}). All records sealed into archive (${dateSheet.length} exams, ${allResults.length} marks). ${generatedTranscripts.length} official student transcripts generated and indexed by Exam Year ${examYear}.`,
        targetId: archiveRecord.id,
        targetType: 'ARCHIVE',
        targetLabel: `${sessionName} (${examYear}) Archive`,
      });

      return {
        archiveRecord,
        generatedTranscriptsCount: generatedTranscripts.length,
      };
    },
    [
      dateSheet,
      users,
      results,
      sessions,
      simulatedDate,
      currentUser,
      papers,
      dutyRoster,
      departments,
      courses,
      notifications,
      logActivity,
    ]
  );

  const getStudentTranscriptByYear = useCallback(
    (studentId: string, year: string): YearTranscriptRecord | undefined => {
      const existing = yearTranscripts.find(
        (t) => t.studentId === studentId && (t.examYear === year || !year || year === 'ALL')
      );
      if (existing) return existing;

      const student = users.find((u) => u.id === studentId);
      if (!student) return undefined;
      const dept = departments.find((d) => d.id === student.departmentId);
      const studentResults = results.filter((r) => r.studentId === studentId);
      if (studentResults.length === 0) return undefined;

      let totalGP = 0;
      let totalCredits = 0;
      const coursesGrades: TranscriptCourseGrade[] = studentResults.map((r) => {
        const c = courses.find((crs) => crs.id === r.courseId);
        const cr = c?.creditHours || 3;
        totalGP += r.gradePoint * cr;
        totalCredits += cr;
        return {
          courseId: r.courseId,
          courseCode: c?.code || 'CRS',
          courseTitle: c?.title || 'Course',
          creditHours: cr,
          internalMarks: r.internalMarks,
          midtermMarks: r.midtermMarks,
          finalMarks: r.finalMarks,
          totalMarks: r.totalMarks,
          gradePoint: r.gradePoint,
          letterGrade: r.letterGrade,
          semester: student.semester || 4,
        };
      });

      const gpa = totalCredits > 0 ? Number((totalGP / totalCredits).toFixed(2)) : 3.75;
      const examYear = year && year !== 'ALL' ? year : simulatedDate.slice(0, 4) || '2026';

      return {
        id: `trans-${student.id}-${examYear}`,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber || 'FA26-REG',
        phoneNumber: student.phoneNumber,
        departmentId: student.departmentId || '',
        departmentName: dept?.name || 'Department',
        examYear,
        sessionName: `Fall Examination (${examYear})`,
        issuedAt: `${simulatedDate} 17:30`,
        courses: coursesGrades,
        totalCreditsEarned: totalCredits,
        totalQualityPoints: Number(totalGP.toFixed(2)),
        gpa,
        cgpa: gpa,
        academicStanding:
          gpa >= 3.7
            ? 'First Division with High Distinction'
            : gpa >= 3.0
            ? 'First Division'
            : 'Second Division',
        verificationHash: `TRANS-SEAL-${examYear}-${student.id.slice(-4)}-${Date.now().toString(36).toUpperCase()}`,
      };
    },
    [yearTranscripts, users, departments, results, courses, simulatedDate]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      setNotifications(updated);
      ExamStorage.saveNotifications(updated);
    },
    [notifications]
  );

  const markAllNotificationsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    ExamStorage.saveNotifications(updated);
  }, [notifications]);

  const resetAllData = useCallback(() => {
    ExamStorage.resetDatabase();
    setSimulatedDateState(DEFAULT_SIMULATED_DATE);
    setUsers(ExamStorage.getUsers());
    setDepartments(ExamStorage.getDepartments());
    setSessions(ExamStorage.getSessions());
    setCourses(ExamStorage.getCourses());
    setDateSheet(ExamStorage.getDateSheet());
    setPapers(ExamStorage.getPapers());
    setDutyRoster(ExamStorage.getDutyRoster());
    setResults(ExamStorage.getResults());
    setNotifications(ExamStorage.getNotifications());
    setActiveUserIdState('usr-admin');
    setBrandingState(ExamStorage.getBranding());
    setActivityLogs(ExamStorage.getActivityLogs());
  }, []);

  const purgeAllData = useCallback(() => {
    ExamStorage.purgeAllExamData();
    setDateSheet([]);
    setPapers([]);
    setDutyRoster([]);
    setResults([]);
    setNotifications([]);

    logActivity({
      actionType: 'DATA_PURGED',
      category: 'SECURITY_ADMIN',
      severity: 'CRITICAL',
      description: 'Executive Administrative Wipe: All examination date sheets, question papers, duty assignments, and grade records have been purged.',
      targetType: 'SYSTEM',
      targetLabel: 'All Examination Data',
    });
  }, [logActivity]);

  const resetToAdminOnlyZeroEntries = useCallback(() => {
    ExamStorage.resetToAdminOnlyWithZeroEntries();
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
      registeredAt: simulatedDate,
      avatarSeed: 'admin',
    };
    setUsers([adminUser]);
    setDepartments([]);
    setSessions([]);
    setCourses([]);
    setDateSheet([]);
    setPapers([]);
    setDutyRoster([]);
    setResults([]);
    setNotifications([]);
    setActiveUserIdState('usr-admin');
    setArchives([]);
    setYearTranscripts([]);
    setActivityLogs([
      {
        id: `log-init-${Date.now()}`,
        actionType: 'DATA_PURGED',
        category: 'SECURITY_ADMIN',
        severity: 'CRITICAL',
        actorId: 'usr-admin',
        actorName: 'System Administrator',
        actorRole: 'ADMIN',
        description: 'Clean slate activated: All records removed. Only single Administrator user active with 0 entries.',
        timestamp: `${simulatedDate} 00:00`,
        targetType: 'SYSTEM',
        targetLabel: 'Zero Entries Wipe',
        tamperHash: createAuditTamperHash('DATA_PURGED', 'System Administrator', `${simulatedDate} 00:00`),
      },
    ]);
  }, [simulatedDate]);

  const updateUser = useCallback(
    (userId: string, updates: Partial<User>) => {
      let targetName = '';
      let targetRole = '';
      let targetDeptId = '';

      setUsers((prevUsers) => {
        const target = prevUsers.find((u) => u.id === userId);
        if (!target) return prevUsers;
        targetName = target.name;
        targetRole = target.role;
        targetDeptId = updates.departmentId || target.departmentId || '';

        const updatedUsers = prevUsers.map((u) => (u.id === userId ? { ...u, ...updates } : u));
        ExamStorage.saveUsers(updatedUsers);
        return updatedUsers;
      });

      logActivity({
        actionType: 'USER_UPDATED',
        category: 'SECURITY_ADMIN',
        severity: 'INFO',
        description: `Administrator updated record for user ${targetName || userId} (${targetRole || 'USER'}): Updated [${Object.keys(updates).join(', ')}].`,
        targetId: userId,
        targetType: 'USER',
        targetLabel: targetName || userId,
        departmentId: targetDeptId,
      });
    },
    [logActivity]
  );

  const deleteUser = useCallback(
    (userId: string) => {
      let targetName = '';
      let targetRole = '';

      setUsers((prevUsers) => {
        const target = prevUsers.find((u) => u.id === userId);
        if (!target) return prevUsers;
        if (target.role === 'ADMIN' && prevUsers.filter((u) => u.role === 'ADMIN').length <= 1) {
          return prevUsers; // Prevent deleting the sole admin
        }
        targetName = target.name;
        targetRole = target.role;
        const updatedUsers = prevUsers.filter((u) => u.id !== userId);
        ExamStorage.saveUsers(updatedUsers);
        return updatedUsers;
      });

      logActivity({
        actionType: 'USER_DELETED',
        category: 'SECURITY_ADMIN',
        severity: 'WARNING',
        description: `Administrator removed user record for ${targetName || userId} (${targetRole || 'USER'}).`,
        targetId: userId,
        targetType: 'USER',
        targetLabel: targetName || userId,
      });
    },
    [logActivity]
  );

  const setTeacherResigned = useCallback(
    (teacherId: string, reason?: string) => {
      let teacherName = '';
      let teacherDept = '';

      setUsers((prevUsers) => {
        const teacher = prevUsers.find((u) => u.id === teacherId);
        if (!teacher) return prevUsers;
        teacherName = teacher.name;
        teacherDept = teacher.departmentId || '';

        const updatedUsers = prevUsers.map((u) =>
          u.id === teacherId
            ? {
                ...u,
                status: 'RESIGNED' as const,
                statusReason: reason || 'Voluntary Resignation submitted',
                statusUpdatedAt: simulatedDate,
              }
            : u
        );
        ExamStorage.saveUsers(updatedUsers);
        return updatedUsers;
      });

      logActivity({
        actionType: 'TEACHER_RESIGNED',
        category: 'SECURITY_ADMIN',
        severity: 'WARNING',
        description: `Faculty resignation recorded: ${teacherName || teacherId} has resigned. Reason: ${reason || 'Voluntary Resignation'}.`,
        targetId: teacherId,
        targetType: 'USER',
        targetLabel: teacherName || teacherId,
        departmentId: teacherDept,
      });
    },
    [simulatedDate, logActivity]
  );

  const transferTeacher = useCallback(
    (teacherId: string, toDepartmentId: string, reason?: string) => {
      let teacherName = '';
      const targetDept = departments.find((d) => d.id === toDepartmentId);

      setUsers((prevUsers) => {
        const teacher = prevUsers.find((u) => u.id === teacherId);
        if (!teacher) return prevUsers;
        teacherName = teacher.name;

        const updatedUsers = prevUsers.map((u) =>
          u.id === teacherId
            ? {
                ...u,
                departmentId: toDepartmentId,
                status: 'TRANSFERRED' as const,
                transferredToDepartmentId: toDepartmentId,
                statusReason: reason || `Transferred to Department of ${targetDept?.name || toDepartmentId}`,
                statusUpdatedAt: simulatedDate,
              }
            : u
        );
        ExamStorage.saveUsers(updatedUsers);
        return updatedUsers;
      });

      logActivity({
        actionType: 'TEACHER_TRANSFERRED',
        category: 'SECURITY_ADMIN',
        severity: 'INFO',
        description: `Faculty transfer recorded: ${teacherName || teacherId} transferred to ${targetDept?.name || toDepartmentId}. Reason: ${reason || 'Departmental Reassignment'}.`,
        targetId: teacherId,
        targetType: 'USER',
        targetLabel: teacherName || teacherId,
        departmentId: toDepartmentId,
      });
    },
    [departments, simulatedDate, logActivity]
  );

  const setStudentStatus = useCallback(
    (studentId: string, status: 'ACTIVE' | 'PASSED_OUT', passedOutYear?: string) => {
      let studentName = '';
      let studentRoll = '';
      let studentDept = '';

      setUsers((prevUsers) => {
        const student = prevUsers.find((u) => u.id === studentId);
        if (!student) return prevUsers;
        studentName = student.name;
        studentRoll = student.rollNumber || 'ID';
        studentDept = student.departmentId || '';

        const updatedUsers = prevUsers.map((u) =>
          u.id === studentId
            ? {
                ...u,
                status,
                passedOutYear:
                  status === 'PASSED_OUT' ? passedOutYear || simulatedDate.slice(0, 4) : undefined,
                statusReason:
                  status === 'PASSED_OUT'
                    ? `Graduated / Passed out in year ${passedOutYear || simulatedDate.slice(0, 4)}`
                    : 'Active enrolled student',
                statusUpdatedAt: simulatedDate,
              }
            : u
        );
        ExamStorage.saveUsers(updatedUsers);
        return updatedUsers;
      });

      logActivity({
        actionType: 'STUDENT_STATUS_CHANGED',
        category: 'ADMISSION',
        severity: 'INFO',
        description: `Student status updated for ${studentName || studentId} (${studentRoll}): Changed to ${status}.`,
        targetId: studentId,
        targetType: 'USER',
        targetLabel: studentName || studentId,
        departmentId: studentDept,
      });
    },
    [simulatedDate, logActivity]
  );

  const promoteStudentSemester = useCallback(
    (studentId: string) => {
      const student = users.find((u) => u.id === studentId);
      if (!student || student.role !== 'STUDENT') {
        return { passedOut: false, studentName: student?.name || '' };
      }

      const currentSem = student.semester || 1;
      let newSemester: number | undefined = currentSem + 1;
      let passedOut = false;

      let updatedStudent: User;
      if (currentSem >= 8) {
        passedOut = true;
        newSemester = undefined;
        updatedStudent = {
          ...student,
          status: 'PASSED_OUT',
          passedOutYear: simulatedDate.slice(0, 4),
          statusReason: `Completed 8 Semesters. Graduated in ${simulatedDate.slice(0, 4)}.`,
          statusUpdatedAt: simulatedDate,
        };
      } else {
        updatedStudent = {
          ...student,
          semester: newSemester,
          status: 'ACTIVE',
          statusUpdatedAt: simulatedDate,
        };
      }

      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((u) => (u.id === studentId ? updatedStudent : u));
        ExamStorage.saveUsers(updatedUsers);
        return updatedUsers;
      });

      logActivity({
        actionType: 'STUDENT_PROMOTED',
        category: 'ACADEMIC',
        severity: 'SUCCESS',
        description: passedOut
          ? `Student ${student.name} (${student.rollNumber}) completed final semester 8 and graduated (PASSED OUT).`
          : `Student ${student.name} (${student.rollNumber}) promoted from Semester ${currentSem} to Semester ${newSemester}.`,
        targetId: studentId,
        targetType: 'USER',
        targetLabel: student.name,
        departmentId: student.departmentId,
      });

      return { newSemester, passedOut, studentName: student.name };
    },
    [users, simulatedDate, logActivity]
  );

  const promoteAllStudents = useCallback(
    (departmentId?: string) => {
      let promotedCount = 0;
      let passedOutCount = 0;

      const updatedUsers = users.map((u) => {
        if (u.role !== 'STUDENT' || !u.isApproved || u.status === 'PASSED_OUT') {
          return u;
        }
        if (departmentId && departmentId !== 'ALL' && u.departmentId !== departmentId) {
          return u;
        }

        const currentSem = u.semester || 1;
        if (currentSem >= 8) {
          passedOutCount++;
          return {
            ...u,
            status: 'PASSED_OUT' as const,
            passedOutYear: simulatedDate.slice(0, 4),
            statusReason: `Graduated in ${simulatedDate.slice(0, 4)}`,
            statusUpdatedAt: simulatedDate,
          };
        } else {
          promotedCount++;
          return {
            ...u,
            semester: currentSem + 1,
            status: 'ACTIVE' as const,
            statusUpdatedAt: simulatedDate,
          };
        }
      });

      setUsers(updatedUsers);
      ExamStorage.saveUsers(updatedUsers);

      logActivity({
        actionType: 'STUDENT_PROMOTED',
        category: 'ACADEMIC',
        severity: 'SUCCESS',
        description: `Batch Academic Promotion Executed: ${promotedCount} students advanced to next semester, ${passedOutCount} students graduated / passed out.`,
        targetType: 'SYSTEM',
        targetLabel: 'Batch Promotion',
      });

      return { promotedCount, passedOutCount };
    },
    [users, simulatedDate, logActivity]
  );

  const addDepartment = useCallback(
    (dept: { name: string; code: string; hodName: string }) => {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        name: dept.name,
        code: dept.code.toUpperCase(),
        hodName: dept.hodName,
      };
      const updated = [...departments, newDept];
      setDepartments(updated);
      ExamStorage.saveDepartments(updated);

      logActivity({
        actionType: 'DEPARTMENT_CREATED',
        category: 'SECURITY_ADMIN',
        severity: 'SUCCESS',
        description: `New Academic Department established: ${newDept.name} (${newDept.code}). Appointed HOD: ${newDept.hodName}.`,
        targetId: newDept.id,
        targetType: 'SYSTEM',
        targetLabel: `${newDept.code} Department`,
      });

      return newDept;
    },
    [departments, logActivity]
  );

  const addCourse = useCallback(
    (course: {
      code: string;
      title: string;
      departmentId: string;
      semester: number;
      creditHours: number;
    }) => {
      const newCourse: Course = {
        id: `crs-${Date.now()}`,
        code: course.code.toUpperCase(),
        title: course.title,
        departmentId: course.departmentId,
        semester: course.semester,
        creditHours: course.creditHours,
      };
      const updated = [...courses, newCourse];
      setCourses(updated);
      ExamStorage.saveCourses(updated);

      const dept = departments.find((d) => d.id === course.departmentId);

      logActivity({
        actionType: 'COURSE_CREATED',
        category: 'ACADEMIC',
        severity: 'SUCCESS',
        description: `Curriculum updated: Added course ${newCourse.code} (${newCourse.title}, ${newCourse.creditHours} Cr. Hrs) for ${dept?.name || 'Department'} Semester ${newCourse.semester}.`,
        targetId: newCourse.id,
        targetType: 'COURSE',
        targetLabel: newCourse.code,
        departmentId: newCourse.departmentId,
      });

      return newCourse;
    },
    [courses, departments, logActivity]
  );

  const addTeacher = useCallback(
    (teacher: {
      name: string;
      email: string;
      phoneNumber?: string;
      departmentId: string;
      designation?: string;
      assignedCourseIds?: string[];
    }) => {
      const newTeacher: User = {
        id: `usr-tchr-${Date.now()}`,
        name: teacher.name,
        email: teacher.email,
        phoneNumber: teacher.phoneNumber || '+92 301 7654321',
        role: 'TEACHER',
        departmentId: teacher.departmentId,
        designation: teacher.designation || 'Lecturer / Assistant Professor',
        isApproved: true,
        registeredAt: simulatedDate,
        avatarSeed: teacher.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        assignedCourseIds: teacher.assignedCourseIds || [],
      };
      const updated = [...users, newTeacher];
      setUsers(updated);
      ExamStorage.saveUsers(updated);

      const dept = departments.find((d) => d.id === teacher.departmentId);
      const taughtCount = (teacher.assignedCourseIds || []).length;

      logActivity({
        actionType: 'USER_REGISTERED',
        category: 'SECURITY_ADMIN',
        severity: 'SUCCESS',
        description: `New Faculty Member registered: ${newTeacher.name} in ${dept?.name || 'Department'} with ${taughtCount} assigned subject(s).`,
        targetId: newTeacher.id,
        targetType: 'USER',
        targetLabel: newTeacher.name,
        departmentId: newTeacher.departmentId,
      });

      return newTeacher;
    },
    [users, departments, simulatedDate, logActivity]
  );

  const assignTeacherSubjects = useCallback(
    (teacherId: string, courseIds: string[]) => {
      const updated = users.map((u) =>
        u.id === teacherId ? { ...u, assignedCourseIds: courseIds } : u
      );
      setUsers(updated);
      ExamStorage.saveUsers(updated);

      const teacher = users.find((u) => u.id === teacherId);
      const assignedNames = courses
        .filter((c) => courseIds.includes(c.id))
        .map((c) => c.code)
        .join(', ');

      logActivity({
        actionType: 'TEACHER_ASSIGNED',
        category: 'ACADEMIC',
        severity: 'INFO',
        description: `Teaching subjects updated for ${teacher?.name || 'Faculty Member'}: Assigned [${assignedNames || 'None'}].`,
        targetId: teacherId,
        targetType: 'USER',
        targetLabel: teacher?.name || 'Faculty Member',
        departmentId: teacher?.departmentId,
      });
    },
    [users, courses, logActivity]
  );

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter(
      (n) => !n.isRead && (!n.recipientRole || n.recipientRole === currentUser.role || n.recipientUserId === currentUser.id)
    ).length;
  }, [notifications, currentUser]);

  const dutyConflicts = useMemo(() => {
    return detectDutyConflicts(dutyRoster, users, dateSheet, courses);
  }, [dutyRoster, users, dateSheet, courses]);

  const addDutyAssignment = useCallback(
    (duty: Omit<DutyAssignment, 'id'>) => {
      const newId = `duty-${Date.now()}`;
      const newDuty: DutyAssignment = {
        id: newId,
        ...duty,
      };
      const updated = [newDuty, ...dutyRoster];
      setDutyRoster(updated);
      ExamStorage.saveDutyRoster(updated);

      // Check if this newly added duty creates a conflict
      const conflicts = detectDutyConflicts(updated, users, dateSheet, courses);
      const teacherConflicts = conflicts.filter((c) => c.teacherId === duty.teacherId);
      if (teacherConflicts.length > 0) {
        const teacher = users.find((u) => u.id === duty.teacherId);
        const conflictNotif: SystemNotification = {
          id: `notif-conflict-${Date.now()}`,
          recipientRole: 'ADMIN',
          title: 'Duty Overlap Conflict Alert',
          message: `Warning: ${teacher?.name || 'Staff member'} assigned to overlapping sessions on ${duty.examDate}.`,
          type: 'ALERT',
          createdAt: `${simulatedDate} 09:30`,
          isRead: false,
        };
        const updatedNotifs = [conflictNotif, ...notifications];
        setNotifications(updatedNotifs);
        ExamStorage.saveNotifications(updatedNotifs);
      }

      const assignedTeacher = users.find((u) => u.id === duty.teacherId);
      logActivity({
        actionType: 'DUTY_ASSIGNED',
        category: 'ROSTER',
        severity: 'INFO',
        description: `Duty assigned: ${duty.role} to ${assignedTeacher?.name || duty.teacherId} in ${duty.hallNumber} on ${duty.examDate}.`,
        targetId: newId,
        targetType: 'DUTY',
        targetLabel: `${duty.hallNumber} (${duty.role})`,
      });

      // Auto WhatsApp notification when duty is confirmed
      if (newDuty.isConfirmed) {
        sendWhatsAppDutyRosterAlert(newId);
      }
    },
    [dutyRoster, users, dateSheet, courses, simulatedDate, notifications, logActivity, sendWhatsAppDutyRosterAlert]
  );

  const updateDutyAssignment = useCallback(
    (id: string, updates: Partial<DutyAssignment>) => {
      const updated = dutyRoster.map((d) => (d.id === id ? { ...d, ...updates } : d));
      setDutyRoster(updated);
      ExamStorage.saveDutyRoster(updated);

      logActivity({
        actionType: 'DUTY_UPDATED',
        category: 'ROSTER',
        severity: 'INFO',
        description: `Updated duty assignment ${id} details.`,
        targetId: id,
        targetType: 'DUTY',
      });

      // Auto WhatsApp alert if duty was confirmed
      if (updates.isConfirmed) {
        sendWhatsAppDutyRosterAlert(id);
      }
    },
    [dutyRoster, logActivity, sendWhatsAppDutyRosterAlert]
  );

  const deleteDutyAssignment = useCallback(
    (id: string) => {
      const targetDuty = dutyRoster.find((d) => d.id === id);
      const teacher = users.find((u) => u.id === targetDuty?.teacherId);
      const updated = dutyRoster.filter((d) => d.id !== id);
      setDutyRoster(updated);
      ExamStorage.saveDutyRoster(updated);

      logActivity({
        actionType: 'DUTY_REMOVED',
        category: 'ROSTER',
        severity: 'WARNING',
        description: `Removed duty assignment for ${teacher?.name || id} in ${targetDuty?.hallNumber || 'exam hall'}.`,
        targetId: id,
        targetType: 'DUTY',
      });
    },
    [dutyRoster, users, logActivity]
  );

  const generateDutyRoster = useCallback(() => {
    // Generate duties for all QA-approved examination papers
    const approvedEntries = dateSheet.filter((ds) => {
      const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
      return paper?.qaStatus === 'QA_APPROVED';
    });

    let createdCount = 0;
    const currentRoster = [...dutyRoster];

    for (const entry of approvedEntries) {
      const alreadyAssigned = currentRoster.some((d) => d.dateSheetEntryId === entry.id);
      if (!alreadyAssigned) {
        const newDuty: DutyAssignment = {
          id: `duty-${Date.now()}-${entry.id}`,
          dateSheetEntryId: entry.id,
          teacherId: entry.assignedTeacherId,
          role: 'Chief Invigilator',
          hallNumber: entry.hallNumber,
          examDate: entry.examDate,
          startTime: entry.startTime,
          endTime: entry.endTime,
          isConfirmed: true,
          confirmedAt: `${simulatedDate} 09:00`,
        };
        currentRoster.unshift(newDuty);
        createdCount++;
      }
    }

    setDutyRoster(currentRoster);
    ExamStorage.saveDutyRoster(currentRoster);

    // Run overlap detection
    const conflicts = detectDutyConflicts(currentRoster, users, dateSheet, courses);

    if (conflicts.length > 0) {
      const conflictSummary = conflicts.map((c) => `${c.teacherName} on ${c.examDate}`).join(', ');
      const notif: SystemNotification = {
        id: `notif-gen-conflict-${Date.now()}`,
        recipientRole: 'ADMIN',
        title: 'Duty Roster Overlap Warning Detected',
        message: `Admin Alert: ${conflicts.length} staff member(s) have overlapping exam session assignments: ${conflictSummary}. Reassignment required.`,
        type: 'ALERT',
        createdAt: `${simulatedDate} 09:30`,
        isRead: false,
      };
      const updatedNotifs = [notif, ...notifications];
      setNotifications(updatedNotifs);
      ExamStorage.saveNotifications(updatedNotifs);
    }

    logActivity({
      actionType: 'ROSTER_GENERATED',
      category: 'ROSTER',
      severity: conflicts.length > 0 ? 'WARNING' : 'CRITICAL',
      description: `Automated Duty Roster generator executed: ${createdCount} new assignment(s) created, ${conflicts.length} overlap conflicts flagged.`,
      targetType: 'DUTY',
      targetLabel: 'Institutional Duty Roster',
    });

    return { createdCount, conflictCount: conflicts.length, conflicts };
  }, [dateSheet, papers, dutyRoster, simulatedDate, users, courses, notifications, logActivity]);

  const simulateDutyConflict = useCallback(() => {
    // Adds an overlapping duty assignment for Prof. Arthur Pendelton on 2026-10-21
    const conflictDuty: DutyAssignment = {
      id: `duty-sim-clash-${Date.now()}`,
      dateSheetEntryId: 'ds-cs-501',
      teacherId: 'usr-tchr-arthur', // Arthur Pendelton
      role: 'Hall Invigilator',
      hallNumber: 'Special Exam Wing Hall 4',
      examDate: '2026-10-21',
      startTime: '02:00 PM', // Overlaps 01:30 PM - 04:30 PM
      endTime: '05:00 PM',
      isConfirmed: true,
      confirmedAt: `${simulatedDate} 10:00`,
    };

    const updated = [conflictDuty, ...dutyRoster];
    setDutyRoster(updated);
    ExamStorage.saveDutyRoster(updated);

    const notif: SystemNotification = {
      id: `notif-conflict-${Date.now()}`,
      recipientRole: 'ADMIN',
      title: 'Duty Roster Overlap Conflict Alert',
      message: `Admin Warning: Prof. Arthur Pendelton assigned to overlapping sessions on 2026-10-21 (01:30 PM–04:30 PM & 02:00 PM–05:00 PM). Immediate reassignment needed!`,
      type: 'ALERT',
      createdAt: `${simulatedDate} 10:01`,
      isRead: false,
    };
    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    ExamStorage.saveNotifications(updatedNotifs);
  }, [dutyRoster, simulatedDate, notifications]);

  return (
    <ExamContext.Provider
      value={{
        simulatedDate,
        setSimulatedDate,
        advanceDays,
        currentUser,
        setCurrentUser,
        switchRole,
        isLoggedIn,
        login,
        logout,
        users,
        departments,
        sessions,
        courses,
        dateSheet,
        papers,
        dutyRoster,
        results,
        notifications,
        unreadNotifsCount,
        sendWhatsAppDutyRosterAlert,
        sendWhatsAppExamStartAlert,
        sendWhatsAppExamEndAlert,
        dispatchAllDutyRosterWhatsAppAlerts,
        sendCustomWhatsAppMessage,
        whatsAppModal,
        closeWhatsAppModal,
        addDateSheetEntry,
        uploadPaper,
        reviewPaper,
        callForExam,
        endExam,
        toggleExamCallEnd,
        callOrEndAllExams,
        submitExamResults,
        addOrUpdateExamResult,
        updateExamResult,
        deleteExamResult,
        approveUser,
        registerUser,
        updateUser,
        deleteUser,
        setTeacherResigned,
        transferTeacher,
        setStudentStatus,
        promoteStudentSemester,
        promoteAllStudents,
        markNotificationRead,
        markAllNotificationsRead,
        resetAllData,
        purgeAllData,
        resetToAdminOnlyZeroEntries,
        addDepartment,
        addCourse,
        addTeacher,
        assignTeacherSubjects,
        branding,
        updateBranding,
        archives,
        archiveAllExamData,
        archiveAndConcludeSession,
        initializeNewExamSession,
        deleteArchiveRecord,
        yearTranscripts,
        finishAndArchiveAllResultsByPrincipal,
        getStudentTranscriptByYear,
        dutyConflicts,
        addDutyAssignment,
        updateDutyAssignment,
        deleteDutyAssignment,
        generateDutyRoster,
        simulateDutyConflict,
        activityLogs,
        logActivity,
        clearActivityLogs,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}
