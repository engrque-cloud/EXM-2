/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useExam } from '@/lib/exam-context';
import { computeDaysDifference } from '@/lib/exam-storage';
import {
  Calendar,
  Users,
  FileCheck2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Check,
  X,
  Info,
  Search,
  Filter,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  PieChart as PieChartIcon,
  Palette,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  Archive,
  FolderArchive,
  Upload,
  Download,
  UserPlus,
  FileSpreadsheet,
  Award,
  FileText,
  Lock,
  ShieldAlert,
  Edit2,
  Trash2,
  Printer,
  ExternalLink,
  RotateCcw,
  PenTool,
  Clock,
  Layers,
  MessageSquare,
  ArrowUpRight,
  Phone,
  UserCog,
} from 'lucide-react';
import { DutyRosterSection } from './DutyRosterSection';
import { SystemActivityLogComponent } from './SystemActivityLog';
import { AcademicManagementSection } from './AcademicManagementSection';
import { InstitutionalBrandingSection } from './InstitutionalBrandingSection';
import { ActivityFeed } from '@/components/common/ActivityFeed';
import {
  DashboardPrintHeader,
  DashboardPrintFooter,
  DashboardPdfExportButton,
} from '@/components/common/DashboardPdfExport';
import { exportCurrentDashboardToPdf } from '@/lib/pdf-export';
import { OfficialTranscriptModal } from './OfficialTranscriptModal';
import { AddEditResultModal } from './AddEditResultModal';
import { EditUserModal } from './EditUserModal';
import { UniversalWhatsAppModal } from './UniversalWhatsAppModal';
import { GlobalSearchToolbar } from '@/components/GlobalSearchToolbar';
import { checkProposedDutyOverlap } from '@/lib/duty-overlap';
import { calculateGrade } from '@/lib/exam-storage';
import { ExamArchiveRecord } from '@/lib/exam-archive';
import { ExamResult } from '@/types/exam-system';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

export function AdminDashboard() {
  const {
    currentUser,
    simulatedDate,
    departments,
    sessions,
    courses,
    users,
    dateSheet,
    papers,
    dutyRoster,
    dutyConflicts,
    results,
    archives,
    addDateSheetEntry,
    approveUser,
    registerUser,
    updateUser,
    deleteUser,
    setTeacherResigned,
    transferTeacher,
    setStudentStatus,
    promoteStudentSemester,
    promoteAllStudents,
    submitExamResults,
    addOrUpdateExamResult,
    updateExamResult,
    deleteExamResult,
    archiveAllExamData,
    initializeNewExamSession,
    deleteArchiveRecord,
    branding,
    updateBranding,
    logActivity,
    activityLogs,
    resetToAdminOnlyZeroEntries,
    resetAllData,
  } = useExam();

  const [activeTab, setActiveTab] = useState<
    | 'DATESHEET'
    | 'ANALYTICS'
    | 'ROSTER'
    | 'RESULTS'
    | 'TRANSCRIPTS'
    | 'ARCHIVE'
    | 'USERS'
    | 'BRANDING'
    | 'CALENDAR'
    | 'ACADEMIC_SETUP'
    | 'ACTIVITY_LOG'
  >('DATESHEET');

  // Official Transcript Printing State (Admin Exclusive)
  const [selectedTranscriptStudentId, setSelectedTranscriptStudentId] = useState<string>('');
  const [showTranscriptModal, setShowTranscriptModal] = useState<boolean>(false);

  // Add / Edit Exam Result State
  const [showAddResultModal, setShowAddResultModal] = useState<boolean>(false);
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null);

  // User Management & Status Update State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [showEditUserModal, setShowEditUserModal] = useState<boolean>(false);

  // Universal WhatsApp Messaging State
  const [showUniversalWhatsAppModal, setShowUniversalWhatsAppModal] = useState<boolean>(false);
  const [whatsAppPreselectedRecipient, setWhatsAppPreselectedRecipient] = useState<{
    name: string;
    phone: string;
    role?: string;
  } | null>(null);

  // User Management Notices & Quick Search Filter
  const [userMgmtNotice, setUserMgmtNotice] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Results Ledger Filters
  const [resultsLedgerSearch, setResultsLedgerSearch] = useState<string>('');
  const [resultsLedgerDeptFilter, setResultsLedgerDeptFilter] = useState<string>('ALL');
  const [resultsLedgerCourseFilter, setResultsLedgerCourseFilter] = useState<string>('ALL');

  const handleOpenTranscript = (stdId: string) => {
    setSelectedTranscriptStudentId(stdId);
    setShowTranscriptModal(true);
  };

  const handleOpenAddResult = () => {
    setEditingResult(null);
    setShowAddResultModal(true);
  };

  const handleOpenEditResult = (res: ExamResult) => {
    setEditingResult(res);
    setShowAddResultModal(true);
  };

  const handleDeleteResult = (id: string, stdName: string, crsCode: string) => {
    if (confirm(`Are you sure you want to delete the result for ${stdName} in ${crsCode}?`)) {
      deleteExamResult(id);
    }
  };

  // Filter states for Date Sheet
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for adding new Date Sheet row
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id || 'dept-cs');
  const [formSessionId, setFormSessionId] = useState(sessions[0]?.id || 'sess-fall-26');
  const [formSemester, setFormSemester] = useState<number>(4);
  const [formCourseId, setFormCourseId] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formExamDate, setFormExamDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00 AM');
  const [formEndTime, setFormEndTime] = useState('12:00 PM');
  const [formHall, setFormHall] = useState('Examination Hall A-101');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Real-time conflict checking for Date Sheet creation form
  const formScheduleConflict = useMemo(() => {
    if (!formTeacherId || !formExamDate || !formStartTime || !formEndTime) return null;
    return checkProposedDutyOverlap(
      formTeacherId,
      formExamDate,
      formStartTime,
      formEndTime,
      dutyRoster,
      dateSheet,
      courses
    );
  }, [formTeacherId, formExamDate, formStartTime, formEndTime, dutyRoster, dateSheet, courses]);

  // Available courses filtered by selected department and semester
  const availableCourses = courses.filter(
    (c) => c.departmentId === formDeptId && c.semester === formSemester
  );

  // Available teachers
  const facultyList = users.filter((u) => u.role === 'TEACHER' && u.isApproved);

  // Pending user registration approvals
  const pendingUsers = users.filter((u) => !u.isApproved);
  const registeredStudents = users.filter((u) => u.role === 'STUDENT' && u.isApproved);

  const filteredRegisteredStudents = useMemo(() => {
    return registeredStudents.filter((std) => {
      const q = userSearchQuery.trim().toLowerCase();
      if (!q) return true;
      const dept = departments.find((d) => d.id === std.departmentId);
      return (
        std.name.toLowerCase().includes(q) ||
        (std.email && std.email.toLowerCase().includes(q)) ||
        (std.rollNumber && std.rollNumber.toLowerCase().includes(q)) ||
        (std.phoneNumber && std.phoneNumber.includes(q)) ||
        (dept && dept.name.toLowerCase().includes(q)) ||
        (dept && dept.code.toLowerCase().includes(q))
      );
    });
  }, [registeredStudents, userSearchQuery, departments]);

  const filteredAllUsers = useMemo(() => {
    return users
      .filter((u) => u.isApproved)
      .filter((u) => {
        if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
        const q = userSearchQuery.trim().toLowerCase();
        if (!q) return true;
        const dept = departments.find((d) => d.id === u.departmentId);
        return (
          u.name.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phoneNumber && u.phoneNumber.includes(q)) ||
          (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
          (u.designation && u.designation.toLowerCase().includes(q)) ||
          (dept && dept.name.toLowerCase().includes(q)) ||
          u.role.toLowerCase().includes(q)
        );
      });
  }, [users, userRoleFilter, userSearchQuery, departments]);

  // --- RESULTS UPLOAD STATE (ADMIN) ---
  const [selectedResultCourseId, setSelectedResultCourseId] = useState(courses[0]?.id || 'cs-301');
  const [resultSuccessMsg, setResultSuccessMsg] = useState('');

  // Course object
  const selectedCourseObj = useMemo(() => {
    return courses.find((c) => c.id === selectedResultCourseId) || courses[0];
  }, [courses, selectedResultCourseId]);

  // Enrolled students for this course's department & semester
  const enrolledStudentsForResult = useMemo(() => {
    if (!selectedCourseObj) return [];
    const exact = users.filter(
      (u) =>
        u.role === 'STUDENT' &&
        u.isApproved &&
        u.departmentId === selectedCourseObj.departmentId &&
        u.semester === selectedCourseObj.semester
    );
    return exact.length > 0 ? exact : users.filter((u) => u.role === 'STUDENT' && u.isApproved);
  }, [users, selectedCourseObj]);

  // User manual overrides: studentId -> { internal, midterm, final }
  const [scoreOverrides, setScoreOverrides] = useState<{
    [studentId: string]: { internal?: number; midterm?: number; final?: number };
  }>({});

  // Computed scores map with defaults/existing results and overrides
  const studentScores = useMemo(() => {
    const map: { [studentId: string]: { internal: number; midterm: number; final: number } } = {};
    if (!selectedCourseObj) return map;

    enrolledStudentsForResult.forEach((std) => {
      const existing = results.find(
        (r) => r.courseId === selectedCourseObj.id && r.studentId === std.id
      );
      const override = scoreOverrides[std.id];
      map[std.id] = {
        internal:
          override?.internal !== undefined
            ? override.internal
            : existing
            ? existing.internalMarks
            : 18,
        midterm:
          override?.midterm !== undefined
            ? override.midterm
            : existing
            ? existing.midtermMarks
            : 26,
        final:
          override?.final !== undefined ? override.final : existing ? existing.finalMarks : 44,
      };
    });
    return map;
  }, [enrolledStudentsForResult, results, selectedCourseObj, scoreOverrides]);

  const handleScoreChange = (stdId: string, field: 'internal' | 'midterm' | 'final', val: number) => {
    const current = studentScores[stdId] || { internal: 18, midterm: 26, final: 44 };
    setScoreOverrides((prev) => ({
      ...prev,
      [stdId]: {
        ...current,
        ...prev[stdId],
        [field]: val,
      },
    }));
  };

  const handleAutoFillCourseMarks = () => {
    const autoMap: typeof scoreOverrides = {};
    enrolledStudentsForResult.forEach((std, idx) => {
      autoMap[std.id] = {
        internal: 16 + (idx % 4),
        midterm: 24 + (idx % 5),
        final: 42 + (idx % 7),
      };
    });
    setScoreOverrides(autoMap);
  };

  const handleDownloadResultsTemplate = () => {
    if (!selectedCourseObj) return;
    const headers = 'RollNumber,StudentName,InternalMarks(Max20),MidtermMarks(Max30),FinalMarks(Max50)\n';
    const rows = enrolledStudentsForResult
      .map((std) => {
        const s = studentScores[std.id] || { internal: 18, midterm: 26, final: 44 };
        return `${std.rollNumber || 'FA26-REG'},"${std.name}",${s.internal},${s.midterm},${s.final}`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedCourseObj.code}_Results_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResultsFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert('CSV file is empty or missing data rows.');
        return;
      }

      // Skip header row
      const dataRows = lines.slice(1);
      let updatedCount = 0;
      const newScores = { ...studentScores };

      dataRows.forEach((row) => {
        const cols = row.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 4) {
          const rollOrName = cols[0].toLowerCase();
          const internal = Math.min(20, Math.max(0, Number(cols[cols.length - 3]) || 0));
          const midterm = Math.min(30, Math.max(0, Number(cols[cols.length - 2]) || 0));
          const final = Math.min(50, Math.max(0, Number(cols[cols.length - 1]) || 0));

          const matchedStudent = enrolledStudentsForResult.find(
            (std) =>
              std.rollNumber?.toLowerCase() === rollOrName ||
              std.name.toLowerCase().includes(rollOrName) ||
              rollOrName.includes(std.rollNumber?.toLowerCase() || '---')
          );

          if (matchedStudent) {
            newScores[matchedStudent.id] = { internal, midterm, final };
            updatedCount += 1;
          }
        }
      });

      setScoreOverrides((prev) => ({ ...prev, ...newScores }));
      setResultSuccessMsg(
        `Imported results spreadsheet "${file.name}": successfully loaded marks for ${updatedCount} candidates!`
      );
      setTimeout(() => setResultSuccessMsg(''), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveCourseResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseObj) return;

    const matchingDs = dateSheet.find((ds) => ds.courseId === selectedCourseObj.id);
    const dsId = matchingDs ? matchingDs.id : `ds-${selectedCourseObj.id}`;

    const records = enrolledStudentsForResult.map((std) => {
      const s = studentScores[std.id] || { internal: 18, midterm: 26, final: 44 };
      return {
        dateSheetEntryId: dsId,
        courseId: selectedCourseObj.id,
        studentId: std.id,
        internalMarks: Number(s.internal) || 0,
        midtermMarks: Number(s.midterm) || 0,
        finalMarks: Number(s.final) || 0,
        submittedByTeacherId: matchingDs?.assignedTeacherId || 'usr-admin',
      };
    });

    submitExamResults(records);
    setResultSuccessMsg(`Results for ${selectedCourseObj.code} (${enrolledStudentsForResult.length} candidates) published successfully!`);
    setTimeout(() => setResultSuccessMsg(''), 4000);
  };

  // --- ARCHIVE STATE ---
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveSessionTitle, setArchiveSessionTitle] = useState('Fall 2026 End-Semester Examinations (Final Archive)');
  const [archiveNotes, setArchiveNotes] = useState('Official institutional end-semester examination cycle successfully concluded, certified by Controller of Examinations.');
  const [archiveSuccessMsg, setArchiveSuccessMsg] = useState('');
  const [selectedArchiveDetail, setSelectedArchiveDetail] = useState<ExamArchiveRecord | null>(null);

  const handleExecuteArchive = (e: React.FormEvent) => {
    e.preventDefault();
    const created = archiveAllExamData(archiveSessionTitle, archiveNotes);
    setArchiveSuccessMsg(`Examination cycle "${created.sessionName}" successfully archived into permanent vault!`);
    setShowArchiveModal(false);
    setTimeout(() => setArchiveSuccessMsg(''), 4000);
  };

  // --- STUDENT REGISTRATION STATE ---
  const [showStudentRegModal, setShowStudentRegModal] = useState(false);
  const [stdRegName, setStdRegName] = useState('');
  const [stdRegEmail, setStdRegEmail] = useState('');
  const [stdRegDeptId, setStdRegDeptId] = useState(departments[0]?.id || 'dept-cs');
  const [stdRegSemester, setStdRegSemester] = useState<number>(1);
  const [stdRegRollNo, setStdRegRollNo] = useState('');
  const [stdRegAutoApprove, setStdRegAutoApprove] = useState(true);
  const [stdRegSuccessMsg, setStdRegSuccessMsg] = useState('');

  const handleRegisterStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdRegName || !stdRegEmail) return;

    const deptCode = departments.find((d) => d.id === stdRegDeptId)?.code || 'CS';
    const computedRoll = stdRegRollNo.trim() || `FA26-${deptCode}-0${Math.floor(Math.random() * 90) + 10}`;

    registerUser({
      name: stdRegName,
      email: stdRegEmail,
      role: 'STUDENT',
      departmentId: stdRegDeptId,
      semester: Number(stdRegSemester),
      rollNumber: computedRoll,
      autoApprove: stdRegAutoApprove,
    });

    setStdRegSuccessMsg(`Student ${stdRegName} (${computedRoll}) registered ${stdRegAutoApprove ? 'and approved' : 'and queued'} successfully!`);
    setStdRegName('');
    setStdRegEmail('');
    setStdRegRollNo('');
    setTimeout(() => {
      setStdRegSuccessMsg('');
      setShowStudentRegModal(false);
    }, 2000);
  };

  // Handle adding new Date Sheet row
  const handleCreateDateSheetEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourseId || !formTeacherId || !formExamDate) {
      alert('Please select course, assigned teacher, and confirmed exam date.');
      return;
    }

    addDateSheetEntry({
      sessionId: formSessionId,
      departmentId: formDeptId,
      semester: formSemester,
      courseId: formCourseId,
      assignedTeacherId: formTeacherId,
      examDate: formExamDate,
      startTime: formStartTime,
      endTime: formEndTime,
      hallNumber: formHall,
    });

    const crs = courses.find((c) => c.id === formCourseId);
    setFormSuccessMessage(`Date sheet row for ${crs?.code} confirmed on ${formExamDate}!`);
    setTimeout(() => {
      setFormSuccessMessage('');
      setIsAddingEntry(false);
    }, 2000);
  };


  // Filtered date sheet entries
  const filteredDateSheet = dateSheet.filter((ds) => {
    const course = courses.find((c) => c.id === ds.courseId);
    const teacher = users.find((u) => u.id === ds.assignedTeacherId);
    const matchesDept = selectedDeptFilter === 'ALL' || ds.departmentId === selectedDeptFilter;
    const matchesSem = selectedSemFilter === 'ALL' || ds.semester === Number(selectedSemFilter);
    const matchesSearch =
      !searchQuery ||
      course?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSem && matchesSearch;
  });

  // Count of finished or conducted exams eligible for archival
  const finishedExamsCount = useMemo(() => {
    return dateSheet.filter(
      (ds) =>
        computeDaysDifference(ds.examDate, simulatedDate) < 0 ||
        ds.status === 'CONDUCTED' ||
        ds.status === 'RESULTS_UPLOADED'
    ).length;
  }, [dateSheet, simulatedDate]);

  // Calculate paper status distribution data for Recharts
  const { statusDistributionData, departmentChartData, statusCounts } = useMemo(() => {
    let qaApprovedCount = 0;
    let pendingQaCount = 0;
    let pendingUploadCount = 0;
    let rejectedCount = 0;

    dateSheet.forEach((ds) => {
      const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
      if (!paper) {
        pendingUploadCount += 1;
      } else if (paper.qaStatus === 'QA_APPROVED') {
        qaApprovedCount += 1;
      } else if (paper.qaStatus === 'UNDER_QA_REVIEW') {
        pendingQaCount += 1;
      } else if (paper.qaStatus === 'QA_REJECTED') {
        rejectedCount += 1;
      } else {
        pendingUploadCount += 1;
      }
    });

    const statusData = [
      { name: 'QA-Approved', value: qaApprovedCount, color: '#15803D' }, // emerald-700
      { name: 'Pending QA Review', value: pendingQaCount, color: '#D97706' }, // amber-600
      { name: 'Pending Upload', value: pendingUploadCount, color: '#0284C7' }, // sky-600
      { name: 'QA Rejected', value: rejectedCount, color: '#DC2626' }, // red-600
    ].filter((item) => item.value > 0);

    // Department-wise stats for BarChart
    const deptData = departments.map((d) => {
      const deptExams = dateSheet.filter((ds) => ds.departmentId === d.id);
      let approved = 0;
      let inProgress = 0;

      deptExams.forEach((ds) => {
        const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
        if (paper?.qaStatus === 'QA_APPROVED') {
          approved += 1;
        } else {
          inProgress += 1;
        }
      });

      return {
        department: d.code,
        fullName: d.name,
        total: deptExams.length,
        approved,
        inProgress,
      };
    });

    return {
      statusDistributionData: statusData,
      departmentChartData: deptData,
      statusCounts: {
        approved: qaApprovedCount,
        review: pendingQaCount,
        pending: pendingUploadCount,
        rejected: rejectedCount,
      },
    };
  }, [dateSheet, papers, departments]);

  const totalExams = dateSheet.length;
  const pendingApprovalsCount = pendingUsers.length;
  const approvedPapersCount = statusCounts.approved;
  const confirmedDutiesCount = dutyRoster.filter((d) => d.isConfirmed).length;
  const approvalRatePercent = totalExams > 0 ? Math.round((approvedPapersCount / totalExams) * 100) : 0;

  const tabTitleMap: Record<string, string> = {
    DATESHEET: 'Master Examination Date Sheet & Schedule',
    ANALYTICS: 'Paper Submission & Quality Assurance Status Distribution',
    ROSTER: 'Automated Invigilation Duty Roster',
    RESULTS: 'Official Academic Grade Ledger & Results Publication',
    TRANSCRIPTS: 'Official Candidate Academic Transcripts',
    ARCHIVE: 'Institutional Examination Archival Ledger',
    USERS: 'System User Directory & Role-Based Access Control',
    BRANDING: 'Institutional Branding, Signatories & Seal Configuration',
    CALENDAR: 'Academic & Examination Conduct Calendar',
    ACADEMIC_SETUP: 'Academic Departments, Courses & Faculty Allocation',
    ACTIVITY_LOG: 'Institutional Security & Activity Audit Log Feed',
  };

  return (
    <div className="space-y-6 print-area">
      {/* Official Institutional Printable Header (Shown ONLY during PDF Export / Print) */}
      <DashboardPrintHeader
        dashboardType="ADMIN"
        currentViewTitle={tabTitleMap[activeTab] || activeTab}
      />

      {/* Top Banner & Overview in Light Green Theme - hidden during print */}
      <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt="College Logo"
                width={48}
                height={48}
                style={{ width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', objectFit: 'cover' }}
                className="w-12 h-12 rounded-lg object-cover border border-emerald-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0 border border-emerald-900">
                {branding.collegeName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium mb-1">
                <span>{branding.collegeName}</span>
                <span aria-hidden="true">·</span>
                <span>{branding.subTitle}</span>
              </div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                Exam Controller Dashboard
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                Manage datesheet schedules, audit QA progress distribution, lock invigilation rosters, and customize college branding.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DashboardPdfExportButton
              viewName={`Admin_${activeTab}`}
              reportTitle={tabTitleMap[activeTab] || 'Exam Controller Report'}
            />

            <button
              onClick={() => setActiveTab('BRANDING')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer border ${
                activeTab === 'BRANDING'
                  ? 'bg-emerald-800 text-white border-emerald-900'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-emerald-700" />
              Configure College Name &amp; Subtitle
            </button>
            <button
              onClick={() => {
                setIsAddingEntry(true);
                setActiveTab('DATESHEET');
              }}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Set Date Sheet Row
            </button>
          </div>
        </div>

        {/* Metric Strips with Light Green Accents */}
        <div className={`grid grid-cols-2 ${dutyConflicts.length > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mt-6 pt-6 border-t border-emerald-100`}>
          <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-100">
            <div className="text-xs text-emerald-800 font-medium">Scheduled Papers</div>
            <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
              {totalExams}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Semesters 1 to 8 across 3 departments</div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
            <div className="text-xs text-emerald-900 font-medium">QA Approved ({approvalRatePercent}%)</div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-800 mt-0.5">
              {approvedPapersCount}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Ready for print & conduct</div>
          </div>

          <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-100">
            <div className="text-xs text-emerald-800 font-medium">Confirmed Duty Roster</div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-950 mt-0.5">
              {confirmedDutiesCount}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Auto-locked on QA paper approval</div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
            <div className="text-xs text-amber-800 font-medium">Pending User Approvals</div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-700 mt-0.5">
              {pendingApprovalsCount}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Students / staff registration queue</div>
          </div>

          {dutyConflicts.length > 0 && (
            <div
              onClick={() => setActiveTab('ROSTER')}
              className="p-3 bg-red-50/90 rounded-lg border-2 border-red-400 cursor-pointer hover:bg-red-100/90 transition-colors"
            >
              <div className="text-xs text-red-900 font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                Duty Overlap Clash!
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-red-700 mt-0.5">
                {dutyConflicts.length} Conflict
              </div>
              <div className="text-[11px] text-red-800 mt-0.5 font-bold underline">Click to resolve in Roster →</div>
            </div>
          )}
        </div>
      </div>

      {/* Global Universal Search & Filtering Toolbar */}
      <GlobalSearchToolbar
        context="ADMIN"
        onSelectEntity={(type) => {
          if (type === 'STUDENT') {
            setActiveTab('USERS');
          } else if (type === 'TEACHER') {
            setActiveTab('ROSTER');
          } else if (type === 'PAPER' || type === 'SCHEDULE') {
            setActiveTab('DATESHEET');
          }
        }}
      />

      {/* Primary Tab Navigation - hidden during print */}
      <div className="flex flex-wrap items-center gap-2 border-b border-emerald-200/80 pb-2 no-print">
        <button
          onClick={() => setActiveTab('DATESHEET')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'DATESHEET'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Master Date Sheet Schedule
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'ANALYTICS'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5" />
          Paper QA Distribution (Recharts)
        </button>

        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'ROSTER'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Duty Roster ({confirmedDutiesCount})
          {dutyConflicts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              {dutyConflicts.length} Conflict
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RESULTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'RESULTS'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Exam Results &amp; Marks
        </button>

        <button
          onClick={() => setActiveTab('TRANSCRIPTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'TRANSCRIPTS'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Official Transcripts (Print)
        </button>

        <button
          onClick={() => setActiveTab('ARCHIVE')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'ARCHIVE'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          Archive All Data
          {archives.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {archives.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 relative ${
            activeTab === 'USERS'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Users & Student Registration
          {pendingApprovalsCount > 0 && (
            <span className="w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ACADEMIC_SETUP')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ACADEMIC_SETUP'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Depts, Courses &amp; Teachers
        </button>

        <button
          onClick={() => setActiveTab('BRANDING')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'BRANDING'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          College Name & Logo
        </button>

        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'CALENDAR'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Exam Calendar
        </button>

        <button
          onClick={() => setActiveTab('ACTIVITY_LOG')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ACTIVITY_LOG'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Activity Feed &amp; Audit Log
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            {activityLogs.length}
          </span>
        </button>
      </div>

      {/* TAB: RECHARTS EXAM PAPER STATUS DISTRIBUTION */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-emerald-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-emerald-800" />
                  Examination Paper Status Distribution
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Real-time visual monitoring of question papers through the quality verification lifecycle.
                </p>
              </div>
              <div className="text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                Total Papers: <span className="font-bold">{totalExams}</span> · Approval Rate: <span className="font-bold">{approvalRatePercent}%</span>
              </div>
            </div>

            {/* Recharts Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-center">
              {/* Chart 1: Donut Distribution */}
              <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
                  <span>Overall Status Breakdown</span>
                  <span className="text-[11px] text-neutral-400">Recharts Pie/Donut</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '8px',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span className="text-xs text-neutral-700 font-medium">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-100 text-xs">
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-center">
                    <span className="block text-emerald-800 font-bold font-mono text-base">{statusCounts.approved}</span>
                    <span className="text-[10px] text-emerald-700 font-medium">QA-Approved</span>
                  </div>
                  <div className="p-2 bg-amber-50 rounded border border-amber-200 text-center">
                    <span className="block text-amber-800 font-bold font-mono text-base">{statusCounts.review}</span>
                    <span className="text-[10px] text-amber-700 font-medium">In QA Review</span>
                  </div>
                  <div className="p-2 bg-sky-50 rounded border border-sky-200 text-center">
                    <span className="block text-sky-800 font-bold font-mono text-base">{statusCounts.pending}</span>
                    <span className="text-[10px] text-sky-700 font-medium">Pending Upload</span>
                  </div>
                  <div className="p-2 bg-red-50 rounded border border-red-200 text-center">
                    <span className="block text-red-800 font-bold font-mono text-base">{statusCounts.rejected}</span>
                    <span className="text-[10px] text-red-700 font-medium">QA Rejected</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Department-wise Completion Bar Chart */}
              <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
                  <span>Department Progress Comparison</span>
                  <span className="text-[11px] text-neutral-400">Recharts BarChart</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span className="text-xs text-neutral-700 font-medium">{value}</span>
                        )}
                      />
                      <Bar dataKey="approved" name="QA-Approved" fill="#15803D" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inProgress" name="Pending/Review" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-emerald-100 text-[11px] text-neutral-500 text-center">
                  Departments: English (ENG), Mathematics (MTH), Computer Science (CS) across Semesters 1 to 8.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: COLLEGE BRANDING & LOGO SETTINGS */}
      {activeTab === 'BRANDING' && (
        <InstitutionalBrandingSection
          key={`${branding.collegeName}-${branding.subTitle}-${branding.logoUrl || ""}`}
          branding={branding}
          updateBranding={updateBranding}
          logActivity={logActivity}
          simulatedDate={simulatedDate}
        />
      )}

      {/* TAB 1: DATE SHEET MANAGEMENT */}
      {activeTab === 'DATESHEET' && (
        <div className="space-y-4">
          {/* Create Date Sheet Row Modal / Collapse Drawer */}
          {isAddingEntry && (
            <div className="bg-white rounded-xl border border-emerald-300 shadow-sm p-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-800" />
                    Set Date Sheet for Exam
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    First row: select paper and teacher and date is confirmed. The assigned teacher will automatically receive a paper upload alert 10 days before the exam date.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingEntry(false)}
                  className="text-neutral-400 hover:text-neutral-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formSuccessMessage && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {formSuccessMessage}
                </div>
              )}

              <form onSubmit={handleCreateDateSheetEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Department */}
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      1. Department
                    </label>
                    <select
                      value={formDeptId}
                      onChange={(e) => {
                        setFormDeptId(e.target.value);
                        setFormCourseId('');
                      }}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Semester (1 to 8) */}
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      2. Semester (1 to 8)
                    </label>
                    <select
                      value={formSemester}
                      onChange={(e) => {
                        setFormSemester(Number(e.target.value));
                        setFormCourseId('');
                      }}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white font-mono"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Academic Session */}
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      3. Academic Session
                    </label>
                    <select
                      value={formSessionId}
                      onChange={(e) => setFormSessionId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white"
                    >
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.isCurrent ? '(Current)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                  {/* Select Paper */}
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      4. Select Paper / Course
                    </label>
                    <select
                      required
                      value={formCourseId}
                      onChange={(e) => setFormCourseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                    >
                      <option value="">-- Choose Course for Semester {formSemester} --</option>
                      {availableCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} · {c.title} ({c.creditHours} Credit Hrs)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Teacher */}
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      5. Assign Course Teacher / Examiner
                    </label>
                    <select
                      required
                      value={formTeacherId}
                      onChange={(e) => setFormTeacherId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white"
                    >
                      <option value="">-- Assign Designated Faculty Member --</option>
                      {facultyList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.designation || 'Faculty'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-neutral-100">
                  {/* Exam Date */}
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      6. Confirmed Exam Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formExamDate}
                      onChange={(e) => setFormExamDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 font-mono"
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Start Time
                    </label>
                    <input
                      type="text"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 font-mono"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      End Time
                    </label>
                    <input
                      type="text"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      placeholder="12:00 PM"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 font-mono"
                    />
                  </div>

                  {/* Venue / Hall */}
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Examination Hall / Room
                    </label>
                    <input
                      type="text"
                      value={formHall}
                      onChange={(e) => setFormHall(e.target.value)}
                      placeholder="Hall A-101"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                {/* Real-time Overlap Conflict Alert for Selected Teacher */}
                {formScheduleConflict?.hasConflict && (
                  <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-lg text-xs space-y-1.5 animate-pulse">
                    <div className="font-extrabold text-red-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      DUTY OVERLAP WARNING: Assigned Faculty Member Has A Concurrent Session!
                    </div>
                    <p className="text-red-900">
                      <strong>{users.find((u) => u.id === formTeacherId)?.name}</strong> already has an exam duty scheduled on <strong>{formExamDate}</strong> during this time window:
                    </p>
                    <ul className="list-disc list-inside text-[11px] font-mono text-red-900 bg-white/70 p-2 rounded border border-red-200">
                      {formScheduleConflict.conflictingDuties.map((c) => (
                        <li key={c.dutyId}>
                          <strong>{c.courseCode}</strong> ({c.courseTitle}) in {c.hallNumber} from {c.timeSlot}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-red-800 font-semibold">
                      Confirming this row will flag a double-booking warning on the Duty Roster.
                    </p>
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingEntry(false)}
                    className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-xs font-bold text-white rounded-md transition-colors shadow-2xs ${
                      formScheduleConflict?.hasConflict
                        ? 'bg-red-700 hover:bg-red-800'
                        : 'bg-emerald-800 hover:bg-emerald-900'
                    }`}
                  >
                    {formScheduleConflict?.hasConflict
                      ? 'Confirm With Overlap Warning'
                      : 'Confirm & Publish Date Sheet Row'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admin Archival Authority Banner when Exams are Finished */}
          {finishedExamsCount > 0 && (
            <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    <span>{finishedExamsCount} Examination Session(s) Completed</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                      Admin Archival Authority
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-850 mt-0.5 max-w-2xl text-neutral-700">
                    When exams finish, the Admin / Controller of Examinations has the legal authority to seal all date sheets, question papers, duty records, and grades into the permanent institutional archive vault.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ARCHIVE');
                    setShowArchiveModal(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archive All Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('RESULTS')}
                  className="px-3 py-2 bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  Upload Results
                </button>
              </div>
            </div>
          )}

          {/* Filtering Bar */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search course code, title, teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-1 p-1 bg-emerald-50 rounded-md text-xs">
                <button
                  onClick={() => setSelectedDeptFilter('ALL')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedDeptFilter === 'ALL' ? 'bg-white font-semibold text-emerald-950 shadow-2xs' : 'text-emerald-800'
                  }`}
                >
                  All Depts
                </button>
                {departments.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDeptFilter(d.id)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedDeptFilter === d.id ? 'bg-white font-semibold text-emerald-950 shadow-2xs' : 'text-emerald-800'
                    }`}
                  >
                    {d.code}
                  </button>
                ))}
              </div>

              {/* Semester Filter */}
              <select
                value={selectedSemFilter}
                onChange={(e) => setSelectedSemFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md bg-white text-neutral-700"
              >
                <option value="ALL">All Semesters (1–8)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-neutral-500">
                Showing <span className="font-semibold text-neutral-900">{filteredDateSheet.length}</span> date sheet entries
              </span>
              <button
                type="button"
                onClick={() => {
                  const deptObj = departments.find((d) => d.id === selectedDeptFilter);
                  const deptLabel = deptObj ? deptObj.code : 'All_Departments';
                  exportCurrentDashboardToPdf({
                    reportName: `Master_DateSheet_${deptLabel}_Sem${selectedSemFilter}`,
                    collegeName: branding.collegeName,
                    simulatedDate,
                  });
                }}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Print or Export this Date Sheet as Official Institutional Document"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Master Date Sheet</span>
              </button>
            </div>
          </div>

          {/* Master Date Sheet Table */}
          <div className="bg-white rounded-xl border border-emerald-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100 text-emerald-900 font-semibold">
                    <th className="py-3 px-4">Course / Paper</th>
                    <th className="py-3 px-4">Dept & Sem</th>
                    <th className="py-3 px-4">Assigned Teacher</th>
                    <th className="py-3 px-4">Exam Date & Timing</th>
                    <th className="py-3 px-4">10-Day Alert Status</th>
                    <th className="py-3 px-4">Hall Number</th>
                    <th className="py-3 px-4">QA Status</th>
                    <th className="py-3 px-4">Duty Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredDateSheet.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                            <FolderArchive className="w-5 h-5" />
                          </div>
                          <div className="text-sm font-bold text-neutral-800">
                            {dateSheet.length === 0
                              ? 'Active Examination Cycle Concluded & Sealed into Archive'
                              : 'No date sheet entries match your search criteria'}
                          </div>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            {dateSheet.length === 0
                              ? 'All examination date sheets, question papers, and candidate marks have moved to the Historical Vault. Student marks remain permanently preserved semester-wise.'
                              : 'Try adjusting your search query, department, or semester filters.'}
                          </p>
                          {dateSheet.length === 0 && (
                            <div className="flex items-center justify-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setActiveTab('ARCHIVE')}
                                className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
                              >
                                <FolderArchive className="w-3.5 h-3.5 text-emerald-800" />
                                <span>Inspect Historical Archive</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => initializeNewExamSession('Spring 2027 Examination Cycle')}
                                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Initialize Next Examination Cycle</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDateSheet.map((ds) => {
                      const course = courses.find((c) => c.id === ds.courseId);
                      const dept = departments.find((d) => d.id === ds.departmentId);
                      const teacher = users.find((u) => u.id === ds.assignedTeacherId);
                      const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
                      const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);

                      return (
                        <tr key={ds.id} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-neutral-900 font-mono">
                              {course?.code}
                            </div>
                            <div className="text-[11px] text-neutral-500 truncate max-w-[200px]">
                              {course?.title}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-neutral-700">
                            <div>{dept?.code}</div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              Semester {ds.semester}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-neutral-800">
                            <div className="font-medium">{teacher?.name}</div>
                            <div className="text-[10px] text-neutral-400">{teacher?.designation || 'Teacher'}</div>
                          </td>

                          <td className="py-3.5 px-4 font-mono tabular-nums text-neutral-900">
                            <div className="font-medium">{ds.examDate}</div>
                            <div className="text-[11px] text-neutral-500">
                              {ds.startTime} – {ds.endTime}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {daysLeft < 0 ? (
                              <span className="text-neutral-500 font-mono text-[11px]">
                                Completed ({Math.abs(daysLeft)}d ago)
                              </span>
                            ) : daysLeft <= 10 ? (
                              <div className="inline-flex flex-col">
                                <span className="font-bold text-amber-800 font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  {daysLeft} days left (10d Alert)
                                </span>
                                <span className="text-[10px] text-amber-700 mt-0.5">
                                  {paper ? 'Paper Submitted' : 'Upload Pending'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-600 font-mono text-[11px]">
                                {daysLeft} days away
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-neutral-700 font-mono">
                            {ds.hallNumber}
                          </td>

                          <td className="py-3.5 px-4">
                            {paper?.qaStatus === 'QA_APPROVED' ? (
                              <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                QA-Approved
                              </span>
                            ) : paper?.qaStatus === 'UNDER_QA_REVIEW' ? (
                              <span className="text-amber-700 font-medium text-xs">
                                In QA Audit
                              </span>
                            ) : paper?.qaStatus === 'QA_REJECTED' ? (
                              <span className="text-red-700 font-medium text-xs">
                                Revision Req.
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-xs">
                                Not Uploaded
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {ds.dutyConfirmed ? (
                              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Locked & Confirmed
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-400">
                                Pending QA Approval
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DUTY ROSTER & CONFLICT WARNING ENGINE */}
      {activeTab === 'ROSTER' && <DutyRosterSection />}

      {/* TAB: UPLOAD RESULTS (ADMIN) */}
      {activeTab === 'RESULTS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-800" />
                  Official Exam Results Registry & Grade Upload Deck
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Upload, record, and publish official student marks for scheduled examinations. Published results immediately update student semester GPA progression charts and transcripts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddResult}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add / Update Result
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ARCHIVE');
                    setShowArchiveModal(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                  title="Archive all exam data and seal student marks once exams and grading are concluded"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Archive Exam &amp; Results Data</span>
                </button>

                {/* Course Selector Dropdown */}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 whitespace-nowrap">
                    Course:
                  </label>
                  <select
                    value={selectedResultCourseId}
                    onChange={(e) => setSelectedResultCourseId(e.target.value)}
                    className="px-3 py-2 text-xs border border-emerald-300 rounded-lg bg-emerald-50/50 font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-700 max-w-[240px]"
                  >
                    {courses.map((crs) => (
                      <option key={crs.id} value={crs.id}>
                        {crs.code} - {crs.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {resultSuccessMsg && (
              <div className="mt-4 p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                {resultSuccessMsg}
              </div>
            )}

            {/* Selected Course Metadata Banner */}
            {selectedCourseObj && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 text-xs">
                <div>
                  <span className="text-[11px] text-neutral-500 block">Course Code & Title</span>
                  <strong className="text-neutral-900 font-mono text-sm block mt-0.5">
                    {selectedCourseObj.code}
                  </strong>
                  <span className="text-[11px] text-neutral-600 truncate block">
                    {selectedCourseObj.title}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 block">Department & Term</span>
                  <strong className="text-neutral-900 block mt-0.5">
                    {departments.find((d) => d.id === selectedCourseObj.departmentId)?.name || 'Central'}
                  </strong>
                  <span className="text-[11px] text-emerald-800 font-semibold">
                    Semester {selectedCourseObj.semester} · {selectedCourseObj.creditHours} Credit Hours
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 block">Enrolled Candidates</span>
                  <strong className="text-neutral-900 font-mono text-lg block mt-0.5">
                    {enrolledStudentsForResult.length}
                  </strong>
                  <span className="text-[11px] text-neutral-500">Registered students in this term</span>
                </div>

                <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-2 col-span-2 sm:col-span-1">
                  <label className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload CSV</span>
                    <input
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      onChange={handleResultsFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleDownloadResultsTemplate}
                    className="px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                    title="Download pre-populated CSV template with roll numbers"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillCourseMarks}
                    className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Auto-Fill
                  </button>
                </div>
              </div>
            )}

            {/* Student Grading Form Table */}
            <form onSubmit={handleSaveCourseResults} className="mt-6 space-y-4">
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/60 border-b border-emerald-100 text-emerald-950 font-semibold">
                      <th className="py-3 px-4">Student Name & Roll No</th>
                      <th className="py-3 px-4">Internal Marks (Max 20)</th>
                      <th className="py-3 px-4">Midterm Marks (Max 30)</th>
                      <th className="py-3 px-4">Final Exam (Max 50)</th>
                      <th className="py-3 px-4">Total Score (100)</th>
                      <th className="py-3 px-4">Letter Grade</th>
                      <th className="py-3 px-4">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {enrolledStudentsForResult.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-400">
                          No students enrolled in this department and semester. Use &quot;Users &amp; Student Registration&quot; tab to register students.
                        </td>
                      </tr>
                    ) : (
                      enrolledStudentsForResult.map((std) => {
                        const scores = studentScores[std.id] || { internal: 18, midterm: 26, final: 44 };
                        const total = (Number(scores.internal) || 0) + (Number(scores.midterm) || 0) + (Number(scores.final) || 0);
                        const { letterGrade, gradePoint } = calculateGrade(total);

                        return (
                          <tr key={std.id} className="hover:bg-emerald-50/20">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-neutral-900">{std.name}</div>
                              <div className="text-[11px] font-mono text-emerald-800">{std.rollNumber || 'FA26-REG'}</div>
                            </td>

                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min={0}
                                max={20}
                                value={scores.internal}
                                onChange={(e) => handleScoreChange(std.id, 'internal', Number(e.target.value))}
                                className="w-20 px-2.5 py-1 text-xs border border-neutral-300 rounded font-mono font-bold text-center focus:ring-1 focus:ring-emerald-700"
                              />
                            </td>

                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min={0}
                                max={30}
                                value={scores.midterm}
                                onChange={(e) => handleScoreChange(std.id, 'midterm', Number(e.target.value))}
                                className="w-20 px-2.5 py-1 text-xs border border-neutral-300 rounded font-mono font-bold text-center focus:ring-1 focus:ring-emerald-700"
                              />
                            </td>

                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min={0}
                                max={50}
                                value={scores.final}
                                onChange={(e) => handleScoreChange(std.id, 'final', Number(e.target.value))}
                                className="w-20 px-2.5 py-1 text-xs border border-neutral-300 rounded font-mono font-bold text-center focus:ring-1 focus:ring-emerald-700"
                              />
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-neutral-900 text-sm">
                              {total} <span className="text-[11px] text-neutral-400 font-normal">/ 100</span>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                  letterGrade.startsWith('A')
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : letterGrade.startsWith('B')
                                    ? 'bg-blue-100 text-blue-900'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {letterGrade}
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-neutral-800">
                              {gradePoint.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {enrolledStudentsForResult.length > 0 && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Grading calculates semester GPA progression automatically for students.
                  </span>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Publish Exam Results
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Section 2: Official Results Ledger & Live Grade Editor */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                  Official Examination Results Ledger ({results.length} Published Records)
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Update marks, delete erroneous entries, or print official candidate transcripts.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddResult}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Add / Update Result
              </button>
            </div>

            {/* Filter toolbar for results ledger */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div>
                <input
                  type="text"
                  placeholder="Search student name or roll no..."
                  value={resultsLedgerSearch}
                  onChange={(e) => setResultsLedgerSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div>
                <select
                  value={resultsLedgerDeptFilter}
                  onChange={(e) => setResultsLedgerDeptFilter(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md bg-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={resultsLedgerCourseFilter}
                  onChange={(e) => setResultsLedgerCourseFilter(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md bg-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="ALL">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Ledger Table */}
            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Student Name &amp; Roll No</th>
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-2 text-center">Internal (20)</th>
                    <th className="py-2.5 px-2 text-center">Midterm (30)</th>
                    <th className="py-2.5 px-2 text-center">Final (50)</th>
                    <th className="py-2.5 px-2 text-center font-bold">Total (100)</th>
                    <th className="py-2.5 px-2 text-center">Grade</th>
                    <th className="py-2.5 px-2 text-center">GP</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {results.filter((res) => {
                    const std = users.find((u) => u.id === res.studentId);
                    const crs = courses.find((c) => c.id === res.courseId);
                    const matchesSearch =
                      !resultsLedgerSearch ||
                      (std?.name || '').toLowerCase().includes(resultsLedgerSearch.toLowerCase()) ||
                      (std?.rollNumber || '').toLowerCase().includes(resultsLedgerSearch.toLowerCase()) ||
                      (crs?.code || '').toLowerCase().includes(resultsLedgerSearch.toLowerCase());
                    const matchesDept =
                      resultsLedgerDeptFilter === 'ALL' || crs?.departmentId === resultsLedgerDeptFilter || std?.departmentId === resultsLedgerDeptFilter;
                    const matchesCourse =
                      resultsLedgerCourseFilter === 'ALL' || res.courseId === resultsLedgerCourseFilter;
                    return matchesSearch && matchesDept && matchesCourse;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <div className="max-w-md mx-auto space-y-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                            <FolderArchive className="w-5 h-5" />
                          </div>
                          <div className="text-sm font-bold text-neutral-800">
                            {results.length === 0
                              ? 'Active Results Ledger Archived into Historical Records'
                              : 'No examination results match your search filter'}
                          </div>
                          <p className="text-xs text-neutral-500">
                            {results.length === 0
                              ? 'All student evaluation marks and grades have been sealed into the Historical Archive. Student marks remain permanently preserved semester-wise in student portals and transcripts.'
                              : 'Try adjusting your search criteria or department filter.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    results
                      .filter((res) => {
                        const std = users.find((u) => u.id === res.studentId);
                        const crs = courses.find((c) => c.id === res.courseId);
                        const matchesSearch =
                          !resultsLedgerSearch ||
                          (std?.name || '').toLowerCase().includes(resultsLedgerSearch.toLowerCase()) ||
                          (std?.rollNumber || '').toLowerCase().includes(resultsLedgerSearch.toLowerCase()) ||
                          (crs?.code || '').toLowerCase().includes(resultsLedgerSearch.toLowerCase());
                        const matchesDept =
                          resultsLedgerDeptFilter === 'ALL' || crs?.departmentId === resultsLedgerDeptFilter || std?.departmentId === resultsLedgerDeptFilter;
                        const matchesCourse =
                          resultsLedgerCourseFilter === 'ALL' || res.courseId === resultsLedgerCourseFilter;
                        return matchesSearch && matchesDept && matchesCourse;
                      })
                      .map((res) => {
                        const std = users.find((u) => u.id === res.studentId);
                        const crs = courses.find((c) => c.id === res.courseId);
                        return (
                          <tr key={res.id} className="hover:bg-emerald-50/20">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-neutral-900">{std?.name || 'Student'}</div>
                              <div className="text-[11px] font-mono text-emerald-800">{std?.rollNumber || 'No Roll'}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold font-mono text-neutral-900">{crs?.code}</div>
                              <div className="text-[11px] text-neutral-500 truncate max-w-[160px]">{crs?.title}</div>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono">{res.internalMarks}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{res.midtermMarks}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{res.finalMarks}</td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-neutral-900">
                              {res.totalMarks}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="font-mono font-bold text-emerald-950 px-1.5 py-0.5 rounded bg-emerald-100 text-[11px] border border-emerald-300">
                                {res.letterGrade}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-semibold">
                              {res.gradePoint.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditResult(res)}
                                  className="p-1.5 text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
                                  title="Update / Edit Result"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenTranscript(res.studentId)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                                  title="Print Official Transcript"
                                >
                                  <Printer className="w-3 h-3 text-emerald-700" />
                                  <span>Transcript</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteResult(res.id, std?.name || 'Student', crs?.code || 'Course')}
                                  className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                  title="Delete Result"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: OFFICIAL TRANSCRIPTS (ADMIN EXCLUSIVE PRINTING AUTHORITY) */}
      {activeTab === 'TRANSCRIPTS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  Exclusive Controller of Examinations Authority
                </div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-800" />
                  Official Academic Transcripts Printing Deck
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
                  Under institutional examination policy, only the College Administrator / Office of the Controller of Examinations has the legal authority to print official stamped academic transcripts. In the student portal, students can only print their Date Sheet.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-950 font-bold text-xs rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                  <Printer className="w-3.5 h-3.5 text-emerald-800" />
                  Admin Exclusive Print
                </span>
              </div>
            </div>

            {/* Student Search & Department Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div>
                <input
                  type="text"
                  placeholder="Search candidate by name or roll number..."
                  value={resultsLedgerSearch}
                  onChange={(e) => setResultsLedgerSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div>
                <select
                  value={resultsLedgerDeptFilter}
                  onChange={(e) => setResultsLedgerDeptFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md bg-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end">
                <span className="text-xs font-mono text-neutral-500">
                  Showing {registeredStudents.length} Verified Candidates
                </span>
              </div>
            </div>

            {/* Candidates Table with Print Official Transcript buttons */}
            <div className="overflow-x-auto border border-neutral-200 rounded-lg mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-semibold text-[11px]">
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4 text-center">Recorded Results</th>
                    <th className="py-3 px-4 text-center">Computed GPA</th>
                    <th className="py-3 px-4 text-right">Official Print</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {registeredStudents
                    .filter((std) => {
                      const matchesSearch =
                        !resultsLedgerSearch ||
                        std.name.toLowerCase().includes(resultsLedgerSearch.toLowerCase()) ||
                        (std.rollNumber || '').toLowerCase().includes(resultsLedgerSearch.toLowerCase());
                      const matchesDept =
                        resultsLedgerDeptFilter === 'ALL' || std.departmentId === resultsLedgerDeptFilter;
                      return matchesSearch && matchesDept;
                    })
                    .map((std) => {
                      const dept = departments.find((d) => d.id === std.departmentId);
                      const stdResults = results.filter((r) => r.studentId === std.id);

                      let totalGP = 0;
                      let totalCredits = 0;
                      stdResults.forEach((r) => {
                        const crs = courses.find((c) => c.id === r.courseId);
                        const cr = crs?.creditHours || 3;
                        totalGP += r.gradePoint * cr;
                        totalCredits += cr;
                      });
                      const gpa = totalCredits > 0 ? (totalGP / totalCredits).toFixed(2) : '3.80';

                      return (
                        <tr key={std.id} className="hover:bg-emerald-50/20">
                          <td className="py-3 px-4">
                            <div className="font-bold text-neutral-900">{std.name}</div>
                            <div className="text-[11px] text-neutral-400 font-mono">{std.email}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-900 text-xs">
                            {std.rollNumber || 'FA26-REG'}
                          </td>
                          <td className="py-3 px-4 text-neutral-700">
                            {dept?.name || 'Computer Science'}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-neutral-800">
                            Semester {std.semester || 4}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-semibold">
                              {stdResults.length} Courses
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-black text-emerald-950 text-sm">
                            {gpa}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenTranscript(std.id)}
                              className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Print Official Transcript
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ARCHIVE ALL DATA (ADMIN RIGHT WHEN EXAM FINISHED) */}
      {activeTab === 'ARCHIVE' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Header & Readiness Status */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  Institutional Controller Authority
                </div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Archive className="w-5 h-5 text-emerald-800" />
                  End-Semester Examination Archive & Historical Vault
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
                  When examination sessions are conducted and evaluated, the Admin / Controller of Examinations has the legal right to seal and archive all active examination date sheets, question papers, duty rosters, and student marks into the permanent university historical vault.
                </p>
              </div>

              <button
                onClick={() => setShowArchiveModal(true)}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <FolderArchive className="w-4 h-4" />
                Archive All Exam Data Now
              </button>
            </div>

            {archiveSuccessMsg && (
              <div className="mt-4 p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                {archiveSuccessMsg}
              </div>
            )}

            {/* Examination Cycle Health Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-100">
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="text-xs text-emerald-800 font-semibold">Scheduled Exam Papers</div>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
                  {dateSheet.length}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Across all 3 departments</div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="text-xs text-emerald-800 font-semibold">QA-Approved Papers</div>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
                  {papers.filter((p) => p.qaStatus === 'QA_APPROVED').length} / {papers.length}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Audited & approved</div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="text-xs text-emerald-800 font-semibold">Confirmed Duty Assignments</div>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
                  {dutyRoster.filter((d) => d.isConfirmed).length}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Faculty invigilations</div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="text-xs text-emerald-800 font-semibold">Evaluated Student Marks</div>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
                  {results.length}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Course results uploaded</div>
              </div>
            </div>
          </div>

          {/* Archived Records Ledger */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-emerald-800" />
                  Archived Examination Sessions ({archives.length})
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Permanent snapshots sealed with Controller cryptographic timestamps and candidate grade ledgers.
                </p>
              </div>
            </div>

            {archives.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-neutral-50/60 rounded-xl border border-neutral-200">
                <FolderArchive className="w-12 h-12 text-neutral-400 mx-auto opacity-60" />
                <div className="text-sm font-bold text-neutral-700">No Examination Sessions Archived Yet</div>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  When current exams and student grading finish, click &quot;Archive All Exam Data Now&quot; above to create a sealed institutional snapshot.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {archives.map((arch) => (
                  <div
                    key={arch.id}
                    className="p-4 bg-emerald-50/20 border border-emerald-200 rounded-xl hover:bg-emerald-50/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">{arch.sessionName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-semibold border border-emerald-200">
                          SEALED ARCHIVE
                        </span>
                      </div>

                      <div className="text-xs text-neutral-600 mt-1 flex flex-wrap items-center gap-3">
                        <span>Archived: <strong className="font-mono text-neutral-800">{arch.archivedAt}</strong></span>
                        <span>·</span>
                        <span>Certified by: <strong>{arch.archivedBy}</strong></span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-mono">
                        <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                          {arch.stats.totalDateSheetEntries} Exams
                        </span>
                        <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                          {arch.stats.totalPapers} Question Papers
                        </span>
                        <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                          {arch.stats.totalDuties} Duties
                        </span>
                        <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                          {arch.stats.totalResults} Graded Results
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 rounded font-bold text-emerald-900">
                          Avg CGPA: {arch.stats.averageCgpa.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedArchiveDetail(arch)}
                        className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-500" />
                        Inspect Snapshot
                      </button>

                      <button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(arch, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${arch.sessionName.replace(/\s+/g, '_')}_Official_Archive.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export JSON
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this archive from the vault?')) {
                            deleteArchiveRecord(arch.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="Delete archive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archive Modal */}
          {showArchiveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                      <Archive className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">
                        Seal & Archive Examination Session
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Controller Official End-Semester Records Seal
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowArchiveModal(false)}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleExecuteArchive} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Archive Session Title
                    </label>
                    <input
                      type="text"
                      required
                      value={archiveSessionTitle}
                      onChange={(e) => setArchiveSessionTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-medium focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Official Controller Sign-Off Remarks
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={archiveNotes}
                      onChange={(e) => setArchiveNotes(e.target.value)}
                      className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                    <strong className="block font-semibold">Archive Snapshot Scope:</strong>
                    <span>
                      This will freeze an immutable snapshot of {dateSheet.length} scheduled exams, {papers.length} submitted question papers, {dutyRoster.length} duty assignments, and {results.length} candidate result records into the institutional archive vault.
                    </span>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowArchiveModal(false)}
                      className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Seal & Commit Archive
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Archive Inspection Modal */}
          {selectedArchiveDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/50 sticky top-0 bg-white z-10">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Archive Ledger Snapshot: {selectedArchiveDetail.sessionName}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono">
                      Sealed: {selectedArchiveDetail.archivedAt} · Sign-off: {selectedArchiveDetail.archivedBy}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedArchiveDetail(null)}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <strong className="block text-neutral-900 font-semibold mb-0.5">Remarks:</strong>
                    <span className="text-neutral-700">{selectedArchiveDetail.summaryNotes}</span>
                  </div>

                  <div>
                    <h5 className="font-bold text-neutral-900 mb-2">Archived Exam Papers & Date Sheet:</h5>
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-700">
                          <tr>
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Course</th>
                            <th className="py-2 px-3">Hall</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {selectedArchiveDetail.dateSheetSnapshot.map((ds) => (
                            <tr key={ds.id}>
                              <td className="py-2 px-3 font-mono">{ds.examDate}</td>
                              <td className="py-2 px-3 font-bold font-mono">
                                {courses.find((c) => c.id === ds.courseId)?.code || ds.courseId}
                              </td>
                              <td className="py-2 px-3">{ds.hallNumber}</td>
                              <td className="py-2 px-3 font-mono text-emerald-800">{ds.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 text-right">
                  <button
                    onClick={() => setSelectedArchiveDetail(null)}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Close Ledger
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER APPROVALS, STUDENT PROMOTION & DIRECTORY */}
      {activeTab === 'USERS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Action Strip */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                Institutional User Directory, Academic Progression &amp; Communications
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Update emails &amp; passwords, record faculty resignation or department transfers, track active/graduated student status, promote semesters, and dispatch WhatsApp notices.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => {
                  setWhatsAppPreselectedRecipient(null);
                  setShowUniversalWhatsAppModal(true);
                }}
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Send WhatsApp notice to any user or custom phone number"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>+ Send WhatsApp to Anyone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Promote all active enrolled students to their next semester? 8th semester seniors will graduate and be marked as PASSED OUT.')) {
                    const res = promoteAllStudents();
                    setUserMgmtNotice(`Academic Promotion Complete: ${res.promotedCount} students advanced to next semester, ${res.passedOutCount} graduated (Passed Out).`);
                    setTimeout(() => setUserMgmtNotice(''), 6000);
                  }
                }}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Batch advance all enrolled students"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-800" />
                <span>Batch Promote Students</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStudentRegModal(true)}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register Student</span>
              </button>
            </div>
          </div>

          {/* Quick Search & Role Filter Toolbar for User Records */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user by name, email, roll #, or phone..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-neutral-50/50"
              />
              {userSearchQuery && (
                <button
                  type="button"
                  onClick={() => setUserSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-neutral-500 font-medium shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-800" />
                Role:
              </span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="ALL">All Roles ({users.filter((u) => u.isApproved).length})</option>
                <option value="STUDENT">Students ({users.filter((u) => u.role === 'STUDENT' && u.isApproved).length})</option>
                <option value="TEACHER">Faculty ({users.filter((u) => u.role === 'TEACHER' && u.isApproved).length})</option>
                <option value="ADMIN">Admins ({users.filter((u) => u.role === 'ADMIN' && u.isApproved).length})</option>
                <option value="PRINCIPAL">Principal ({users.filter((u) => u.role === 'PRINCIPAL' && u.isApproved).length})</option>
                <option value="QA_CHECKER">QA Auditors ({users.filter((u) => u.role === 'QA_CHECKER' && u.isApproved).length})</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSelectedUserForEdit(currentUser);
                  setShowEditUserModal(true);
                }}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
                title="Change Admin details (email, password, phone)"
              >
                <UserCog className="w-3.5 h-3.5 text-emerald-800" />
                <span>Edit My Details</span>
              </button>
            </div>
          </div>

          {userMgmtNotice && (
            <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{userMgmtNotice}</span>
            </div>
          )}

          {stdRegSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{stdRegSuccessMsg}</span>
            </div>
          )}

          {/* Student Registration Modal */}
          {showStudentRegModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">
                        Student Account Registration
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Enroll student into examination database
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStudentRegModal(false)}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleRegisterStudentSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={stdRegName}
                      onChange={(e) => setStdRegName(e.target.value)}
                      placeholder="e.g. Liam Henderson"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Institutional Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={stdRegEmail}
                      onChange={(e) => setStdRegEmail(e.target.value)}
                      placeholder="e.g. liam.henderson@university.edu"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Department
                      </label>
                      <select
                        value={stdRegDeptId}
                        onChange={(e) => setStdRegDeptId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Enrolled Semester
                      </label>
                      <select
                        value={stdRegSemester}
                        onChange={(e) => setStdRegSemester(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Roll Number / Candidate ID (Optional - Auto generated if blank)
                    </label>
                    <input
                      type="text"
                      value={stdRegRollNo}
                      onChange={(e) => setStdRegRollNo(e.target.value)}
                      placeholder={`e.g. FA26-${departments.find((d) => d.id === stdRegDeptId)?.code || 'CS'}-099`}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-emerald-950 block">Auto-Approve Account</span>
                      <span className="text-[11px] text-neutral-500">Immediately enable results and transcripts access</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={stdRegAutoApprove}
                      onChange={(e) => setStdRegAutoApprove(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-800 focus:ring-emerald-700 w-4 h-4"
                    />
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowStudentRegModal(false)}
                      className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Register Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Pending Approval Section */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  Pending User Approval Requests ({pendingUsers.length})
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Review incoming student and faculty registration requests and approve or reject them.
                </p>
              </div>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                All user accounts are approved. No pending registration requests.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 mt-2">
                {pendingUsers.map((u) => {
                  const dept = departments.find((d) => d.id === u.departmentId);
                  return (
                    <div key={u.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-neutral-900">{u.name}</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-bold">
                            {u.role}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {u.email} · {dept?.name || 'Central'} ·{' '}
                          {u.role === 'STUDENT' ? `Semester ${u.semester} (Roll: ${u.rollNumber})` : u.designation || 'Staff'}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                          Registered: {u.registeredAt} · Phone: {u.phoneNumber || 'N/A'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => approveUser(u.id, true)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve User
                        </button>
                        <button
                          onClick={() => approveUser(u.id, false)}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Registered Students Directory */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-800" />
                  Registered Students Enrollment Directory ({registeredStudents.length} Students)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage candidate credentials, promote to next semester, record pass-out graduation, or dispatch WhatsApp alerts.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50/60 border-b border-emerald-100 text-emerald-950 font-semibold text-[11px]">
                    <th className="py-2.5 px-4">Candidate Name</th>
                    <th className="py-2.5 px-4">Roll Number</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4 text-center">Semester / Promote</th>
                    <th className="py-2.5 px-4">Email &amp; Phone</th>
                    <th className="py-2.5 px-4 text-center">Academic Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredRegisteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-xs text-neutral-400">
                        {userSearchQuery
                          ? `No student matching "${userSearchQuery}" found.`
                          : 'No students currently enrolled in database. Click "+ Register Student" to enroll a candidate.'}
                      </td>
                    </tr>
                  ) : (
                    filteredRegisteredStudents.map((std) => {
                      const dept = departments.find((d) => d.id === std.departmentId);
                      const isPassedOut = std.status === 'PASSED_OUT';
                      return (
                        <tr key={std.id} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-neutral-900">
                            <div>{std.name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">Password: {std.password || 'password123'}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                            {std.rollNumber || 'FA26-REG'}
                          </td>
                          <td className="py-3 px-4 text-neutral-700">
                            {dept?.name || 'Central'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="font-mono font-bold text-neutral-900 px-2 py-0.5 rounded bg-neutral-100">
                                {isPassedOut ? 'Graduated' : `Sem ${std.semester || 1}`}
                              </span>
                              {!isPassedOut && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = promoteStudentSemester(std.id);
                                    if (res.passedOut) {
                                      setUserMgmtNotice(`${std.name} has completed 8th semester and graduated (PASSED OUT)!`);
                                    } else {
                                      setUserMgmtNotice(`${std.name} promoted to Semester ${res.newSemester}!`);
                                    }
                                    setTimeout(() => setUserMgmtNotice(''), 4000);
                                  }}
                                  className="p-1 text-emerald-800 hover:bg-emerald-100 rounded border border-emerald-300"
                                  title="Promote to Next Semester"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">
                            <div>{std.email}</div>
                            <div className="text-emerald-700">{std.phoneNumber || '+92 312 3456789'}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isPassedOut ? (
                              <span className="px-2 py-0.5 rounded-full font-bold font-mono text-[10px] bg-purple-100 text-purple-900 border border-purple-300">
                                Passed Out ({std.passedOutYear || '2026'})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full font-bold font-mono text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Active Enrolled
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForEdit(std);
                                  setShowEditUserModal(true);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:text-emerald-950 bg-white hover:bg-neutral-100 border border-neutral-300 rounded shadow-2xs cursor-pointer"
                                title="Edit user name, email, password, status"
                              >
                                Edit Record
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setWhatsAppPreselectedRecipient({
                                    name: std.name,
                                    phone: std.phoneNumber || '+92 312 3456789',
                                    role: 'STUDENT',
                                  });
                                  setShowUniversalWhatsAppModal(true);
                                }}
                                className="p-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] border border-[#25D366]/40 rounded cursor-pointer"
                                title="Send WhatsApp alert"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-current" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenTranscript(std.id)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                title="Print Official Stamped Transcript"
                              >
                                <Printer className="w-3 h-3 text-emerald-700" />
                                <span>Transcript</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Institutional Directory (Admin, Principal, QA, Faculty & Students) */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-100 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-800" />
                  Full Institutional Directory &amp; Staff Ledger ({users.filter((u) => u.isApproved).length} Approved Accounts)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Update accounts, change passwords, manage faculty resignation or transfer, and dispatch WhatsApp alerts.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50/40 border-b border-emerald-100 text-emerald-900 font-semibold text-[11px]">
                    <th className="py-2.5 px-4">Name &amp; Phone</th>
                    <th className="py-2.5 px-4">Email &amp; Password</th>
                    <th className="py-2.5 px-4">System Role</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">Designation / Sem</th>
                    <th className="py-2.5 px-4">Status &amp; Transfer Info</th>
                    <th className="py-2.5 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredAllUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-xs text-neutral-400">
                        No user account found matching &quot;{userSearchQuery || userRoleFilter}&quot;. Try clearing filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAllUsers.map((u) => {
                      const dept = departments.find((d) => d.id === u.departmentId);
                      const isTeacher = u.role === 'TEACHER';
                      const isResigned = u.status === 'RESIGNED';
                      const isTransferred = u.status === 'TRANSFERRED';
                      const isPassedOut = u.status === 'PASSED_OUT';

                      return (
                        <tr key={u.id} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-neutral-900">{u.name}</div>
                            <div className="text-[11px] text-emerald-800 font-mono font-medium flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#25D366]" />
                              <span>{u.phoneNumber || '+92 300 1234567'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <div className="text-neutral-700">{u.email}</div>
                            <div className="text-neutral-400 font-semibold flex items-center gap-1">
                              <Lock className="w-3 h-3 text-neutral-400" />
                              <span>{u.password || 'password123'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">{u.role}</td>
                          <td className="py-3 px-4 text-neutral-700">
                            <div>{dept?.name || 'Central Directorate'}</div>
                            {isTransferred && (
                              <div className="text-[10px] text-blue-700 font-medium">
                                Transferred to {dept?.code || 'New Dept'}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-neutral-600">
                            {u.role === 'STUDENT'
                              ? `Semester ${u.semester} · ${u.rollNumber || 'FA26-REG'}`
                              : u.designation || 'Authorized Academic Staff'}
                          </td>
                          <td className="py-3 px-4">
                            {isResigned ? (
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 rounded-full font-bold font-mono text-[10px] bg-red-100 text-red-800 border border-red-300">
                                  Resigned
                                </span>
                                <div className="text-[10px] text-red-600 truncate max-w-[140px]" title={u.statusReason}>
                                  {u.statusReason || 'Resigned from service'}
                                </div>
                              </div>
                            ) : isTransferred ? (
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 rounded-full font-bold font-mono text-[10px] bg-blue-100 text-blue-800 border border-blue-300">
                                  Transferred
                                </span>
                                <div className="text-[10px] text-blue-600 truncate max-w-[140px]" title={u.statusReason}>
                                  {dept?.name || 'New Department'}
                                </div>
                              </div>
                            ) : isPassedOut ? (
                              <span className="px-2 py-0.5 rounded-full font-bold font-mono text-[10px] bg-purple-100 text-purple-900 border border-purple-300">
                                Passed Out ({u.passedOutYear || '2026'})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full font-bold font-mono text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 w-fit">
                                <Check className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForEdit(u);
                                  setShowEditUserModal(true);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:text-emerald-950 bg-white hover:bg-neutral-100 border border-neutral-300 rounded shadow-2xs cursor-pointer"
                                title="Update email, password, resignation, transfer"
                              >
                                Edit / Manage
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setWhatsAppPreselectedRecipient({
                                    name: u.name,
                                    phone: u.phoneNumber || '+92 300 1234567',
                                    role: u.role,
                                  });
                                  setShowUniversalWhatsAppModal(true);
                                }}
                                className="p-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] border border-[#25D366]/40 rounded cursor-pointer"
                                title="Send WhatsApp alert"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-current" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DANGER ZONE: RESET ALL DATA TO ZERO ENTRIES (ADMIN ONLY) */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-950">
                  Executive Database Reset — Zero Entries Clean Slate (Admin Only)
                </h4>
                <p className="text-xs text-red-800/90 mt-0.5 leading-relaxed">
                  Removes all students, faculty members, departments, courses, date sheets, question papers, invigilation duty rosters, exam results, and transcripts. Leaves <strong>ONLY</strong> the single Administrator user account active with <strong>0 entries</strong> across the entire system.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          'CRITICAL CONFIRMATION: Are you sure you want to remove ALL data? Only the single Administrator account will remain with 0 entries in the database.'
                        )
                      ) {
                        resetToAdminOnlyZeroEntries();
                        setUserMgmtNotice('Database wiped to clean slate: Only Administrator account remains with zero entries.');
                        setTimeout(() => setUserMgmtNotice(''), 6000);
                      }
                    }}
                    className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Blank Slate (Admin Only - Zero Entries)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Reload the standard demo database with sample departments, courses, faculty, and students?')) {
                        resetAllData();
                        setUserMgmtNotice('Standard institutional demo data reloaded successfully.');
                        setTimeout(() => setUserMgmtNotice(''), 5000);
                      }
                    }}
                    className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Restore Standard Demo Database</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CALENDAR MATRIX */}
      {activeTab === 'CALENDAR' && (
        <div className="bg-white rounded-xl border border-emerald-200/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Institutional Exam Calendar</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Timeline visualization of upcoming examination dates across all three departments.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Reference Date: <span className="font-bold text-neutral-900">{simulatedDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {departments.map((dept) => {
              const deptExams = dateSheet.filter((d) => d.departmentId === dept.id);
              return (
                <div key={dept.id} className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/20">
                  <div className="font-semibold text-emerald-950 text-xs pb-2 border-b border-emerald-200 flex items-center justify-between">
                    <span>{dept.name}</span>
                    <span className="font-mono text-emerald-800 font-bold">{deptExams.length} Papers</span>
                  </div>

                  <div className="space-y-2 mt-3">
                    {deptExams.length === 0 ? (
                      <div className="text-neutral-400 text-xs py-4 text-center">No exams scheduled</div>
                    ) : (
                      deptExams.map((ds) => {
                        const course = courses.find((c) => c.id === ds.courseId);
                        const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);
                        return (
                          <div
                            key={ds.id}
                            className="p-2.5 bg-white border border-emerald-100 rounded-md text-xs space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold font-mono text-neutral-900">{course?.code}</span>
                              <span className="font-mono text-[11px] text-neutral-500">{ds.examDate}</span>
                            </div>
                            <div className="text-neutral-600 text-[11px] truncate">{course?.title}</div>
                            <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px] text-neutral-500">
                              <span>Sem {ds.semester} · {ds.hallNumber}</span>
                              <span className={daysLeft <= 10 && daysLeft >= 0 ? 'text-amber-700 font-bold' : ''}>
                                {daysLeft < 0 ? 'Passed' : `${daysLeft}d away`}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: ACADEMIC STRUCTURE, COURSES, TEACHERS & PURGE DATA */}
      {activeTab === 'ACADEMIC_SETUP' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <AcademicManagementSection />
        </div>
      )}

      {/* TAB: SYSTEM ACTIVITY FEED & AUDIT DECK */}
      {activeTab === 'ACTIVITY_LOG' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ActivityFeed mode="ADMIN" showSimulators={true} />
        </div>
      )}

      {/* Official Institutional Printable Footer (Shown ONLY during PDF Export / Print) */}
      <DashboardPrintFooter />

      {/* Official Academic Transcript Modal (Admin Exclusive Print Authority) */}
      <OfficialTranscriptModal
        studentId={selectedTranscriptStudentId}
        isOpen={showTranscriptModal}
        onClose={() => setShowTranscriptModal(false)}
      />

      {/* Add / Edit Exam Result Modal (Admin & Teacher Results Modification Engine) */}
      <AddEditResultModal
        isOpen={showAddResultModal}
        onClose={() => {
          setShowAddResultModal(false);
          setEditingResult(null);
        }}
        initialResult={editingResult}
      />

      {/* Edit User Modal (Admin Authority to modify student / teacher / principal / admin records) */}
      {showEditUserModal && (
        <EditUserModal
          isOpen={showEditUserModal}
          user={users.find((u) => u.id === selectedUserForEdit?.id) || selectedUserForEdit}
          onClose={() => {
            setShowEditUserModal(false);
            setSelectedUserForEdit(null);
          }}
          onOpenWhatsApp={(rec) => {
            setWhatsAppPreselectedRecipient(rec);
            setShowUniversalWhatsAppModal(true);
          }}
        />
      )}

      {/* Universal WhatsApp Alert Modal */}
      {showUniversalWhatsAppModal && (
        <UniversalWhatsAppModal
          isOpen={showUniversalWhatsAppModal}
          onClose={() => {
            setShowUniversalWhatsAppModal(false);
            setWhatsAppPreselectedRecipient(null);
          }}
          initialRecipient={whatsAppPreselectedRecipient}
        />
      )}
    </div>
  );
}
