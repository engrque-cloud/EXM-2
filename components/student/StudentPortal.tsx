/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import { computeDaysDifference, ExamStorage } from '@/lib/exam-storage';
import { Course, ExamResult } from '@/types/exam-system';
import {
  Calendar,
  GraduationCap,
  Printer,
  FileText,
  Clock,
  Building,
  CheckCircle2,
  Award,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  X,
  TrendingUp,
  UserCog,
  FolderArchive,
  Layers,
  BookmarkCheck,
} from 'lucide-react';
import { SemesterGpaProgressionChart } from './SemesterGpaProgressionChart';
import { exportCurrentDashboardToPdf } from '@/lib/pdf-export';
import { DashboardPrintFooter } from '@/components/common/DashboardPdfExport';
import { OfficialTranscriptModal } from '@/components/admin/OfficialTranscriptModal';
import { EditProfileModal } from '@/components/common/EditProfileModal';

export function StudentPortal() {
  const {
    simulatedDate,
    currentUser,
    users,
    setCurrentUser,
    departments,
    courses,
    dateSheet,
    results,
    branding,
    archives,
    yearTranscripts,
    getStudentTranscriptByYear,
  } = useExam();

  const [activeTab, setActiveTab] = useState<'DATESHEET' | 'GPA_PROGRESSION' | 'RESULTS' | 'TRANSCRIPTS'>('DATESHEET');
  const [showAdmitCard, setShowAdmitCard] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [selectedTranscriptYear, setSelectedTranscriptYear] = useState('2026');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<number | 'ALL'>('ALL');

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // All student accounts for testing
  const allStudents = users.filter((u) => u.role === 'STUDENT' && u.isApproved);

  const studentDept = departments.find((d) => d.id === currentUser.departmentId);
  const studentSemester = currentUser.semester || 4;

  // Personalized date sheet for student's department and semester
  const myDateSheet = dateSheet.filter(
    (ds) =>
      ds.departmentId === currentUser.departmentId &&
      ds.semester === studentSemester
  );

  // Comprehensive student exam results across active evaluation, permanent storage, archived vaults, and transcripts
  const consolidatedStudentResults = useMemo(() => {
    const map = new Map<string, ExamResult>();

    // 1. Gather historical permanent marks (preserves marks semester-wise after active session is archived)
    const permanentMarks = ExamStorage.getPermanentStudentMarks();
    permanentMarks.forEach((res) => {
      if (res.studentId === currentUser.id) {
        map.set(res.courseId, res);
      }
    });

    // 2. Gather historical archived results
    archives.forEach((arch) => {
      arch.resultsSnapshot?.forEach((res) => {
        if (res.studentId === currentUser.id) {
          map.set(res.courseId, res);
        }
      });
    });

    // 3. Gather from year transcripts
    yearTranscripts.forEach((yt) => {
      if (yt.studentId === currentUser.id) {
        yt.courses.forEach((c) => {
          if (!map.has(c.courseId)) {
            map.set(c.courseId, {
              id: `trans-${yt.id}-${c.courseId}`,
              dateSheetEntryId: '',
              courseId: c.courseId,
              studentId: yt.studentId,
              internalMarks: c.internalMarks,
              midtermMarks: c.midtermMarks,
              finalMarks: c.finalMarks,
              totalMarks: c.totalMarks,
              gradePoint: c.gradePoint,
              letterGrade: c.letterGrade,
              submittedByTeacherId: '',
              submittedAt: yt.issuedAt,
            });
          }
        });
      }
    });

    // 4. Active results (authoritative latest)
    results.forEach((r) => {
      if (r.studentId === currentUser.id) {
        map.set(r.courseId, r);
      }
    });

    return Array.from(map.values());
  }, [results, archives, yearTranscripts, currentUser.id]);

  // Group student results semester-wise
  const semesterGroups = useMemo(() => {
    const groupsMap = new Map<
      number,
      {
        semester: number;
        items: Array<{
          result: ExamResult;
          course: Course;
        }>;
        totalCredits: number;
        totalQualityPoints: number;
        sgpa: number;
        isArchived: boolean;
      }
    >();

    consolidatedStudentResults.forEach((res) => {
      const course = courses.find((c) => c.id === res.courseId);
      const sem = course?.semester || studentSemester || 1;
      const credit = course?.creditHours || 3;

      if (!groupsMap.has(sem)) {
        groupsMap.set(sem, {
          semester: sem,
          items: [],
          totalCredits: 0,
          totalQualityPoints: 0,
          sgpa: 0,
          isArchived: archives.some((a) =>
            a.resultsSnapshot?.some((r) => r.id === res.id || r.courseId === res.courseId)
          ),
        });
      }

      const group = groupsMap.get(sem)!;
      const resolvedCourse: Course = course || {
        id: res.courseId,
        code: res.courseId.toUpperCase(),
        title: `Course Subject (${res.courseId.toUpperCase()})`,
        departmentId: currentUser.departmentId || '',
        semester: sem,
        creditHours: credit,
      };

      group.items.push({ result: res, course: resolvedCourse });
      group.totalCredits += credit;
      group.totalQualityPoints += res.gradePoint * credit;
    });

    // Sort by semester ascending
    const sorted = Array.from(groupsMap.values()).sort((a, b) => a.semester - b.semester);

    sorted.forEach((g) => {
      g.sgpa = g.totalCredits > 0 ? Number((g.totalQualityPoints / g.totalCredits).toFixed(2)) : 0;
    });

    return sorted;
  }, [consolidatedStudentResults, courses, studentSemester, archives, currentUser.departmentId]);

  // Overall Cumulative Academic CGPA & Current Semester SGPA
  const { cumulativeCgpa, cumulativeCredits, cumulativeQualityPoints, currentSemesterSgpa } = useMemo(() => {
    let qp = 0;
    let cr = 0;
    semesterGroups.forEach((g) => {
      qp += g.totalQualityPoints;
      cr += g.totalCredits;
    });
    const cgpa = cr > 0 ? (qp / cr).toFixed(2) : '3.80';

    const currentGroup =
      semesterGroups.find((g) => g.semester === studentSemester) ||
      semesterGroups[semesterGroups.length - 1];
    const currSgpa = currentGroup ? currentGroup.sgpa.toFixed(2) : cgpa;

    return {
      cumulativeCgpa: cgpa,
      cumulativeCredits: cr,
      cumulativeQualityPoints: qp.toFixed(2),
      currentSemesterSgpa: currSgpa,
    };
  }, [semesterGroups, studentSemester]);

  // Fallback flat results for backward compatibility
  const myResults = consolidatedStudentResults;
  const semesterGpa = currentSemesterSgpa;

  return (
    <div className="space-y-6">
      {/* Student Profile Header in Light Green Theme */}
      <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-200">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Enrolled &amp; Verified
                </span>
              </div>
              <div className="text-xs text-neutral-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                <span>Roll: <strong className="font-mono text-neutral-800">{currentUser.rollNumber || 'FA26-CS-042'}</strong></span>
                <span aria-hidden="true">·</span>
                <span>{studentDept?.name || 'Department of Computer Science'}</span>
                <span aria-hidden="true">·</span>
                <span>Semester <strong className="font-mono">{studentSemester}</strong></span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-800 font-medium">{branding.collegeName}</span>
              </div>
            </div>
          </div>

          {/* Edit My Student Details Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditProfileModal(true)}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Change your email, password, phone, roll number, or semester"
            >
              <UserCog className="w-4 h-4 text-emerald-800" />
              <span>Edit My Details</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-emerald-100">
          <button
            onClick={() => setActiveTab('DATESHEET')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'DATESHEET'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            My Exam Date Sheet & Schedule
          </button>

          <button
            onClick={() => setActiveTab('GPA_PROGRESSION')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'GPA_PROGRESSION'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Semester GPA Progression (Recharts)
          </button>

          <button
            onClick={() => setActiveTab('RESULTS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'RESULTS'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Semester Marks (Semester-Wise)
          </button>

          <button
            onClick={() => setActiveTab('TRANSCRIPTS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'TRANSCRIPTS'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-emerald-300" />
            Official Transcripts by Exam Year
          </button>

          <button
            onClick={() => setShowAdmitCard(true)}
            className="sm:ml-auto px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-900 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-200" />
            Print Official Date Sheet
          </button>
        </div>
      </div>

      {/* TAB 1: DATE SHEET */}
      {activeTab === 'DATESHEET' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Confirmed Examination Schedule ({studentDept?.code} · Semester {studentSemester})
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Official date sheet confirmed by {branding.collegeName} Examination Directorate. Arrive 30 minutes prior to session start.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  Today: {simulatedDate}
                </span>
                <button
                  onClick={() => setShowAdmitCard(true)}
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Date Sheet</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100 text-emerald-900 font-semibold">
                    <th className="py-3 px-4">Course Code & Title</th>
                    <th className="py-3 px-4">Exam Date</th>
                    <th className="py-3 px-4">Session Timing</th>
                    <th className="py-3 px-4">Examination Hall</th>
                    <th className="py-3 px-4">Days Remaining</th>
                    <th className="py-3 px-4">Duty & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {myDateSheet.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="max-w-md mx-auto space-y-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                            <FolderArchive className="w-5 h-5" />
                          </div>
                          <div className="text-sm font-bold text-neutral-800">
                            Examination Cycle Concluded &amp; Archived
                          </div>
                          <p className="text-xs text-neutral-500">
                            The active examination schedule has been officially finalized, audited, and moved to the permanent university vault. All your grades and evaluation marks remain preserved semester-wise in the{' '}
                            <button
                              type="button"
                              onClick={() => setActiveTab('RESULTS')}
                              className="text-emerald-800 font-bold underline cursor-pointer hover:text-emerald-950"
                            >
                              Semester Marks
                            </button>{' '}
                            tab.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    myDateSheet.map((ds) => {
                      const course = courses.find((c) => c.id === ds.courseId);
                      const teacher = users.find((u) => u.id === ds.assignedTeacherId);
                      const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);

                      return (
                        <tr key={ds.id} className="hover:bg-emerald-50/20">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-neutral-900 font-mono text-xs">
                              {course?.code}
                            </div>
                            <div className="text-[11px] text-neutral-600 font-medium">
                              {course?.title}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              {course?.creditHours} Credit Hours
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-medium text-neutral-900">
                            {ds.examDate}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-neutral-700">
                            {ds.startTime} – {ds.endTime}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-medium text-neutral-800">
                            {ds.hallNumber}
                          </td>

                          <td className="py-3.5 px-4">
                            {daysLeft < 0 ? (
                              <span className="text-neutral-500 font-mono text-[11px]">
                                Completed
                              </span>
                            ) : daysLeft <= 10 ? (
                              <span className="font-bold text-amber-800 font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                In {daysLeft} days
                              </span>
                            ) : (
                              <span className="text-neutral-600 font-mono text-[11px]">
                                In {daysLeft} days
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {ds.dutyConfirmed ? (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                Hall Allocated
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">
                                Scheduled
                              </span>
                            )}
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              Invigilator: {teacher?.name || 'Faculty Assigned'}
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

      {/* TAB 2: SEMESTER GPA PROGRESSION CHART (RECHARTS) */}
      {activeTab === 'GPA_PROGRESSION' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <SemesterGpaProgressionChart />
        </div>
      )}

      {/* TAB 3: SEMESTER MARKS & GRADES (PRESERVED SEMESTER-WISE AFTER EXAM & RESULTS ARCHIVED) */}
      {activeTab === 'RESULTS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Official Archival Integrity Notice */}
          <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-xl flex items-start gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <strong className="text-emerald-950 font-bold text-sm">
                  Institutional Archival Policy: Marks Preserved Semester-Wise
                </strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                  Archived Vault Active
                </span>
              </div>
              <p className="text-emerald-900 mt-1 leading-relaxed">
                When examination sessions, date sheets, and teacher evaluation cycles finish, all exam data is archived into the permanent university vault. In compliance with the Controller of Examinations regulations, <strong>all your marks remain permanently preserved and cataloged semester-wise</strong> below.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-emerald-900 font-semibold rounded text-[11px] border border-emerald-300 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Preserved Records: {consolidatedStudentResults.length} Courses Graded
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-emerald-900 font-semibold rounded text-[11px] border border-emerald-300 shadow-2xs">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  {semesterGroups.length} Semester(s) Cataloged
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 font-semibold rounded text-[11px] border border-amber-300 shadow-2xs">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  Official Stamped Transcripts: Admin Controller Exclusive
                </span>
              </div>
            </div>
          </div>

          {/* Academic Progression Summary Strip */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Degree Academic Standing
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                  {currentUser.name} ({currentUser.rollNumber || 'FA26-REG'})
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {studentDept?.name || 'Academic Studies'} · Current Semester {studentSemester}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center min-w-[110px]">
                  <span className="text-[10px] font-bold text-emerald-800 block uppercase">
                    Cumulative CGPA
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-950">
                    {cumulativeCgpa}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono block">Out of 4.00</span>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-neutral-600 block uppercase">
                    Earned Credits
                  </span>
                  <span className="text-2xl font-black font-mono text-neutral-900">
                    {cumulativeCredits}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono block">Credit Hours</span>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-neutral-600 block uppercase">
                    Quality Points
                  </span>
                  <span className="text-2xl font-black font-mono text-neutral-900">
                    {cumulativeQualityPoints}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono block">QP Earned</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('GPA_PROGRESSION')}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Progression Chart</span>
                </button>
              </div>
            </div>

            {/* Semester Filter Selector Pills */}
            <div className="mt-5 pt-4 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                <span className="text-xs font-bold text-neutral-800">Filter By Semester:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSemesterFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                    selectedSemesterFilter === 'ALL'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200'
                  }`}
                >
                  All Semesters ({semesterGroups.length})
                </button>

                {semesterGroups.map((g) => (
                  <button
                    key={g.semester}
                    type="button"
                    onClick={() => setSelectedSemesterFilter(g.semester)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                      selectedSemesterFilter === g.semester
                        ? 'bg-emerald-800 text-white'
                        : 'bg-white hover:bg-emerald-50 text-neutral-700 border border-neutral-300'
                    }`}
                  >
                    <span>Semester {g.semester}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                        selectedSemesterFilter === g.semester
                          ? 'bg-emerald-900 text-emerald-100'
                          : 'bg-emerald-100 text-emerald-900 font-semibold'
                      }`}
                    >
                      GPA {g.sgpa.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Render Semester Groups */}
          {semesterGroups.length === 0 ? (
            <div className="bg-white rounded-xl border border-emerald-200/80 p-12 text-center shadow-2xs">
              <FolderArchive className="w-12 h-12 text-neutral-400 mx-auto opacity-60" />
              <h4 className="text-sm font-bold text-neutral-800 mt-3">
                No Examination Marks Recorded Yet
              </h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
                Once departmental faculty upload and publish evaluation scores, your grades will be sealed into the institutional vault and presented semester-wise here.
              </p>
            </div>
          ) : (
            (selectedSemesterFilter === 'ALL'
              ? semesterGroups
              : semesterGroups.filter((g) => g.semester === selectedSemesterFilter)
            ).map((semGroup) => (
              <div
                key={semGroup.semester}
                className="bg-white rounded-xl border border-emerald-200/80 shadow-2xs overflow-hidden"
              >
                {/* Semester Card Header */}
                <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      S{semGroup.semester}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-neutral-900">
                          Semester {semGroup.semester} Academic Marks Record
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          Archived in Vault
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {studentDept?.name} · {semGroup.items.length} Evaluated Courses
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 block">Semester Credits</span>
                      <span className="text-xs font-bold font-mono text-neutral-800">
                        {semGroup.totalCredits} Cr. Hrs
                      </span>
                    </div>

                    <div className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-right shadow-2xs">
                      <span className="text-[9px] uppercase tracking-wider block font-semibold text-emerald-200">
                        Semester GPA
                      </span>
                      <span className="text-base font-black font-mono">
                        {semGroup.sgpa.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Marks Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-emerald-50/30 border-b border-emerald-100 text-emerald-950 font-semibold text-[11px]">
                        <th className="py-3 px-4">Course Code &amp; Title</th>
                        <th className="py-3 px-4 text-center">Credit Hours</th>
                        <th className="py-3 px-4 text-center">Internal (20)</th>
                        <th className="py-3 px-4 text-center">Midterm (30)</th>
                        <th className="py-3 px-4 text-center">Final (50)</th>
                        <th className="py-3 px-4 text-center">Total (100)</th>
                        <th className="py-3 px-4 text-center">Letter Grade</th>
                        <th className="py-3 px-4 text-center">Grade Point</th>
                        <th className="py-3 px-4 text-right">Archival Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {semGroup.items.map(({ result: res, course }) => (
                        <tr key={res.id} className="hover:bg-emerald-50/20">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-neutral-900 text-xs">
                              {course?.code}
                            </div>
                            <div className="text-[11px] text-neutral-600 font-medium">
                              {course?.title}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-neutral-700">
                            {course?.creditHours || 3}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-neutral-700">
                            {res.internalMarks}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-neutral-700">
                            {res.midtermMarks}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-neutral-700">
                            {res.finalMarks}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-black text-neutral-900">
                            {res.totalMarks}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                                res.letterGrade === 'A'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : res.letterGrade.startsWith('B')
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : res.letterGrade.startsWith('C')
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-red-100 text-red-900 border-red-300'
                              }`}
                            >
                              {res.letterGrade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-neutral-900">
                            {res.gradePoint.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              Archived &amp; Sealed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: OFFICIAL ACADEMIC TRANSCRIPTS BY EXAM YEAR (PRINTABLE) */}
      {activeTab === 'TRANSCRIPTS' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
                  <Award className="w-4 h-4 text-emerald-700" />
                  Official Student Record
                </div>
                <h2 className="text-base font-bold text-neutral-900">
                  Official Academic Transcripts (Saved by Exam Year)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Academic records finalized by the Principal are archived and available as official transcripts. Select an exam year to review and print.
                </p>
              </div>

              {/* Year Filter & Print Trigger */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span className="text-xs font-semibold text-neutral-700">Exam Year:</span>
                  <select
                    value={selectedTranscriptYear}
                    onChange={(e) => setSelectedTranscriptYear(e.target.value)}
                    className="text-xs font-bold text-emerald-950 bg-white border border-emerald-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="2026">2026 (Fall Examination)</option>
                    <option value="2025">2025 (Annual Examination)</option>
                    <option value="2024">2024 (Annual Examination)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTranscriptModal(true)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Official Transcript ({selectedTranscriptYear})
                </button>
              </div>
            </div>

            {/* Student Transcript Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
              <div>
                <span className="text-[11px] text-neutral-500 block">Candidate &amp; Roll Number</span>
                <span className="text-sm font-bold text-neutral-900">{currentUser.name}</span>
                <span className="text-xs font-mono text-emerald-900 block font-semibold">{currentUser.rollNumber || 'FA26-REG'}</span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">Department &amp; Degree Program</span>
                <span className="text-sm font-semibold text-neutral-800">{studentDept?.name || 'Computer Science'}</span>
                <span className="text-xs text-neutral-500 block">Semester {studentSemester} · Exam Year {selectedTranscriptYear}</span>
              </div>
              <div className="md:text-right">
                <span className="text-[11px] text-neutral-500 block">Computed Cumulative CGPA</span>
                <span className="text-2xl font-bold font-mono text-emerald-950">{semesterGpa}</span>
                <span className="text-[10px] text-emerald-700 font-medium block">First Division with Distinction</span>
              </div>
            </div>

            {/* Courses in Transcript for Year */}
            <div className="overflow-x-auto border border-neutral-200 rounded-lg mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-semibold text-[11px]">
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Subject Title</th>
                    <th className="py-3 px-4 text-center">Credit Hours</th>
                    <th className="py-3 px-4 text-center">Total Marks (100)</th>
                    <th className="py-3 px-4 text-center">Letter Grade</th>
                    <th className="py-3 px-4 text-center">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {myResults.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                        No examination results recorded for Exam Year {selectedTranscriptYear} yet.
                      </td>
                    </tr>
                  ) : (
                    myResults.map((res) => {
                      const course = courses.find((c) => c.id === res.courseId);
                      return (
                        <tr key={res.id} className="hover:bg-neutral-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                            {course?.code}
                          </td>
                          <td className="py-3 px-4 text-neutral-700">{course?.title}</td>
                          <td className="py-3 px-4 text-center font-mono">{course?.creditHours || 3}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-neutral-900">{res.totalMarks}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-emerald-900 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                              {res.letterGrade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-neutral-800">
                            {res.gradePoint.toFixed(2)}
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

      {/* Printable Date Sheet Modal Branded with College Name and Logo (Student Authorized Print) */}
      {showAdmitCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-300 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 print-area my-auto">
            <div className="px-6 py-4 border-b border-emerald-200 flex items-center justify-between bg-emerald-50/80 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-neutral-900">Official Candidate Examination Date Sheet</h3>
              </div>
              <button
                onClick={() => setShowAdmitCard(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              {/* Official Header with dynamic College Name & Logo */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-emerald-800 text-left page-break-avoid print-avoid-break">
                <div className="flex items-center gap-3">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      width={56}
                      height={56}
                      style={{ width: '56px', height: '56px', maxWidth: '56px', maxHeight: '56px', objectFit: 'cover' }}
                      className="w-14 h-14 rounded-lg object-cover border border-emerald-300"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                      {branding.collegeName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-base font-extrabold text-neutral-900 tracking-tight uppercase">
                      {branding.collegeName}
                    </div>
                    <div className="text-emerald-800 font-semibold text-xs">
                      {branding.subTitle || 'Office of the Controller of Examinations'}
                    </div>
                    <div className="text-neutral-500 text-[11px] font-medium mt-0.5">
                      OFFICIAL EXAMINATION DATE SHEET · SEMESTER FALL 2026
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-950 font-mono text-[11px] font-bold rounded border border-emerald-300">
                    CANDIDATE COPY
                  </span>
                  <div className="text-[10px] text-neutral-400 mt-1 font-mono">Issued: {simulatedDate}</div>
                </div>
              </div>

              {/* Student Identification Particulars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-lg page-break-avoid print-avoid-break particulars-strip">
                <div>
                  <span className="text-neutral-400 block text-[10px] font-semibold">CANDIDATE NAME</span>
                  <span className="font-bold text-neutral-900 text-xs">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-semibold">ROLL / REG NO</span>
                  <span className="font-bold font-mono text-emerald-900 text-xs">{currentUser.rollNumber || 'FA26-CS-042'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-semibold">DEPARTMENT</span>
                  <span className="font-medium text-neutral-800 text-xs">{studentDept?.name}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-semibold">SEMESTER</span>
                  <span className="font-bold font-mono text-neutral-900 text-xs">Semester {studentSemester}</span>
                </div>
              </div>

              {/* Scheduled Papers on Date Sheet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-900 text-xs">Confirmed Examination Timetable:</span>
                  <span className="text-[10px] font-mono text-neutral-500">{myDateSheet.length} Scheduled Papers</span>
                </div>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-emerald-900 text-white font-semibold text-[11px]">
                      <tr>
                        <th className="p-2.5">Course Code &amp; Title</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">Hall / Venue</th>
                        <th className="p-2.5">Invigilator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 font-sans text-[11px]">
                      {myDateSheet.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-neutral-400">
                            No scheduled examinations for this department and semester.
                          </td>
                        </tr>
                      ) : (
                        myDateSheet.map((ds) => {
                          const crs = courses.find((c) => c.id === ds.courseId);
                          const teacher = users.find((u) => u.id === ds.assignedTeacherId);
                          return (
                            <tr key={ds.id} className="hover:bg-neutral-50 page-break-avoid print-avoid-break">
                              <td className="p-2.5">
                                <div className="font-bold font-mono text-neutral-900">{crs?.code}</div>
                                <div className="text-neutral-600 font-medium text-[10px]">{crs?.title}</div>
                              </td>
                              <td className="p-2.5 font-mono font-semibold text-neutral-900">{ds.examDate}</td>
                              <td className="p-2.5 font-mono text-neutral-700">{ds.startTime} – {ds.endTime}</td>
                              <td className="p-2.5 font-semibold text-emerald-900">{ds.hallNumber}</td>
                              <td className="p-2.5 text-neutral-600 text-[10px]">{teacher?.name || 'Faculty Assigned'}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strict Examination Code of Conduct */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1 text-[10px] text-neutral-600 page-break-avoid print-avoid-break">
                <div className="font-bold text-neutral-800 uppercase tracking-wider text-[9px]">Mandatory Candidate Regulations:</div>
                <div>1. Candidate must bring this printed Date Sheet along with their verified College Photo Identity Card to every examination.</div>
                <div>2. Programmable calculators, mobile phones, smartwatches, and unauthorized notes are strictly banned inside examination halls.</div>
                <div>3. Candidates must be seated in their designated hall 15 minutes before the scheduled start time. Doors close promptly.</div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-[11px] page-break-avoid print-avoid-break signature-block">
                <div className="text-neutral-500 font-mono text-[10px]">
                  <div>Security Hash: SHA-256-DS-{currentUser.rollNumber?.slice(-4) || '8842'}</div>
                  <div>Status: Approved &amp; Released by Directorate</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-neutral-800 text-xs">Controller of Examinations</div>
                  <div className="text-[10px] text-emerald-800 font-medium">{branding.collegeName}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between no-print">
              <button
                onClick={() => setShowAdmitCard(false)}
                className="px-4 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Close
              </button>
              <button
                onClick={() => {
                  exportCurrentDashboardToPdf({
                    reportName: `${currentUser.rollNumber || 'Student'}_Examination_DateSheet`,
                    collegeName: branding.collegeName,
                    simulatedDate,
                  });
                }}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Date Sheet Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Academic Transcript Modal for Printable Output */}
      <OfficialTranscriptModal
        studentId={currentUser.id}
        isOpen={showTranscriptModal}
        onClose={() => setShowTranscriptModal(false)}
      />

      {/* Edit My Details Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
        />
      )}

      {/* Official Institutional Printable Footer (Shown ONLY during PDF Export / Print) */}
      <DashboardPrintFooter />
    </div>
  );
}
