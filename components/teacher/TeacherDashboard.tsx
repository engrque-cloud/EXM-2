'use client';

import React, { useState } from 'react';
import { useExam } from '@/lib/exam-context';
import { computeDaysDifference } from '@/lib/exam-storage';
import { DateSheetEntry } from '@/types/exam-system';
import {
  Upload,
  Clock,
  ShieldAlert,
  CheckCircle2,
  FileText,
  AlertTriangle,
  GraduationCap,
  Calendar,
  X,
  Plus,
  Send,
  Eye,
  Check,
  Edit2,
  Printer,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { PaperDeadlineTracker } from './PaperDeadlineTracker';
import { TeacherDateSheetPrintModal } from './TeacherDateSheetPrintModal';
import {
  DashboardPrintHeader,
  DashboardPrintFooter,
  DashboardPdfExportButton,
} from '@/components/common/DashboardPdfExport';
import { EditProfileModal } from '@/components/common/EditProfileModal';

export function TeacherDashboard() {
  const {
    simulatedDate,
    currentUser,
    users,
    setCurrentUser,
    dateSheet,
    papers,
    courses,
    dutyRoster,
    results,
    uploadPaper,
    submitExamResults,
    branding,
    sendWhatsAppDutyRosterAlert,
  } = useExam();

  // All faculty members for easy testing
  const allTeachers = users.filter((u) => u.role === 'TEACHER' && u.isApproved);

  // Active teacher's assigned date sheet rows
  const myDateSheet = dateSheet.filter((ds) => ds.assignedTeacherId === currentUser.id);

  // Active teacher's duty roster
  const myDuties = dutyRoster.filter((d) => d.teacherId === currentUser.id && d.isConfirmed);

  // Modal states for uploading paper
  // Modal states for uploading PDF paper
  const [uploadModalEntry, setUploadModalEntry] = useState<DateSheetEntry | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('1.8 MB');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [showDateSheetModal, setShowDateSheetModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Modal states for entering exam results
  const [gradingModalEntry, setGradingModalEntry] = useState<DateSheetEntry | null>(null);
  const [gradingRows, setGradingRows] = useState<
    Array<{
      studentId: string;
      studentName: string;
      rollNumber: string;
      internalMarks: number;
      midtermMarks: number;
      finalMarks: number;
    }>
  >([]);
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState('');

  // Compute 10-day notification alerts
  const urgent10DayAlerts = myDateSheet.filter((ds) => {
    const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);
    const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
    const isApproved = paper?.qaStatus === 'QA_APPROVED';
    return daysLeft <= 10 && daysLeft >= 0 && !isApproved;
  });

  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');

  // Open PDF upload modal
  const handleOpenUpload = (entry: DateSheetEntry) => {
    const course = courses.find((c) => c.id === entry.courseId);
    setUploadModalEntry(entry);
    setPdfFileName(`${course?.code || 'Exam'}_Final_Question_Paper.pdf`);
    setPdfFileSize('1.8 MB');
    setPdfDataUrl('');
  };

  // Handle local PDF file selection
  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a valid PDF (.pdf) file.');
        return;
      }
      setPdfFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setPdfFileSize(`${sizeMb} MB`);

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPdfDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit PDF paper upload
  const handleDoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalEntry) return;

    const course = courses.find((c) => c.id === uploadModalEntry.courseId);

    uploadPaper({
      dateSheetEntryId: uploadModalEntry.id,
      courseId: uploadModalEntry.courseId,
      teacherId: currentUser.id,
      title: `${course?.code || 'Course'} Examination Paper (PDF)`,
      fileAttachmentName: pdfFileName || `${course?.code || 'Exam'}_Final_Paper.pdf`,
      fileSizeMb: pdfFileSize || '1.8 MB',
      pdfDataUrl: pdfDataUrl || undefined,
    });

    setUploadSuccessMsg('PDF Question paper uploaded and submitted for QA Review!');
    setTimeout(() => {
      setUploadSuccessMsg('');
      setUploadModalEntry(null);
    }, 2000);
  };

  // Open grading modal
  const handleOpenGrading = (entry: DateSheetEntry) => {
    setGradingModalEntry(entry);
    // Find students belonging to this department & semester
    const enrolledStudents = users.filter(
      (u) =>
        u.role === 'STUDENT' &&
        u.isApproved &&
        u.departmentId === entry.departmentId &&
        u.semester === entry.semester
    );

    // Fallback if none in exact semester
    const targetStudents = enrolledStudents.length > 0 ? enrolledStudents : users.filter((u) => u.role === 'STUDENT' && u.isApproved);

    // Populate rows with existing or default scores
    const rows = targetStudents.map((std) => {
      const existing = results.find(
        (r) => r.dateSheetEntryId === entry.id && r.studentId === std.id
      );
      return {
        studentId: std.id,
        studentName: std.name,
        rollNumber: std.rollNumber || 'FA26-REG',
        internalMarks: existing ? existing.internalMarks : 17,
        midtermMarks: existing ? existing.midtermMarks : 25,
        finalMarks: existing ? existing.finalMarks : 42,
      };
    });

    setGradingRows(rows);
  };

  // Submit grading results
  const handleDoSubmitGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingModalEntry) return;

    const payload = gradingRows.map((row) => ({
      dateSheetEntryId: gradingModalEntry.id,
      courseId: gradingModalEntry.courseId,
      studentId: row.studentId,
      internalMarks: Number(row.internalMarks),
      midtermMarks: Number(row.midtermMarks),
      finalMarks: Number(row.finalMarks),
      submittedByTeacherId: currentUser.id,
    }));

    submitExamResults(payload);
    setGradeSuccessMsg('Student grades calculated and submitted to Controller of Examinations!');
    setTimeout(() => {
      setGradeSuccessMsg('');
      setGradingModalEntry(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 print-area">
      {/* Official Institutional Printable Header (Shown ONLY during PDF Export / Print) */}
      <DashboardPrintHeader
        dashboardType="TEACHER"
        currentViewTitle={`Faculty Examination Conduct & Timetable · ${currentUser.name}`}
      />

      {/* Header Banner - hidden in print */}
      <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium mb-1">
              <span>{branding.collegeName}</span>
              <span aria-hidden="true">·</span>
              <span>Faculty Examination Portal</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Teacher Examination Workspace
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Upload examination papers before the 10-day deadline, track QA audit endorsements, check invigilation duty, and submit student marks after exam conduct.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DashboardPdfExportButton
              viewName={`Teacher_${currentUser.name.replace(/\s+/g, '_')}`}
              reportTitle={`Faculty Examination Dossier - ${currentUser.name}`}
            />

            <button
              type="button"
              onClick={() => setShowDateSheetModal(true)}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-200" />
              <span>Print Faculty Date Sheet</span>
            </button>

            {/* Edit My Faculty Details Button */}
            <button
              type="button"
              onClick={() => setShowEditProfileModal(true)}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Change your email, password, phone, or designation"
            >
              <UserCog className="w-3.5 h-3.5 text-emerald-800" />
              <span>Edit My Details</span>
            </button>
          </div>
        </div>

        {/* 10-Day Alert Banner if any exam is approaching */}
        {urgent10DayAlerts.length > 0 && (
          <div className="mt-5 p-4 bg-amber-50 border border-amber-300 rounded-lg animate-pulse-subtle">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-amber-900">
                  Automated Alert: 10-Day Question Paper Submission Deadline!
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  You have <span className="font-bold">{urgent10DayAlerts.length}</span> assigned examination(s) scheduled within the next 10 days relative to today ({simulatedDate}). University regulations mandate question paper upload for QA audit.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {urgent10DayAlerts.map((ds) => {
                    const course = courses.find((c) => c.id === ds.courseId);
                    const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);
                    return (
                      <button
                        key={ds.id}
                        onClick={() => handleOpenUpload(ds)}
                        className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Paper: {course?.code} ({daysLeft} days left)
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metric Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-xs text-neutral-500 font-medium">Assigned Date Sheets</div>
            <div className="text-xl font-bold font-mono text-neutral-900 mt-0.5">{myDateSheet.length}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Courses scheduled for exam</div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
            <div className="text-xs text-amber-700 font-medium">10-Day Upload Alerts</div>
            <div className="text-xl font-bold font-mono text-amber-900 mt-0.5">{urgent10DayAlerts.length}</div>
            <div className="text-[11px] text-amber-700 mt-0.5">Deadline window active</div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
            <div className="text-xs text-blue-700 font-medium">Confirmed Invigilation Duties</div>
            <div className="text-xl font-bold font-mono text-blue-900 mt-0.5">{myDuties.length}</div>
            <div className="text-[11px] text-blue-700 mt-0.5">Locked onto Duty Roster</div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
            <div className="text-xs text-emerald-700 font-medium">Exam Call / Results Pending</div>
            <div className="text-xl font-bold font-mono text-emerald-900 mt-0.5">
              {myDateSheet.filter((d) => d.status === 'EXAM_CALLED').length}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Principal called for exam conduct</div>
          </div>
        </div>
      </div>

      {/* Dedicated 10-Day Paper Deadline Tracker Section */}
      <PaperDeadlineTracker onOpenUpload={handleOpenUpload} />

      {/* Assigned Exam Papers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              My Assigned Examination Papers &amp; Date Sheets
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select paper to upload question file. Once QA approves the paper, your invigilation duty is confirmed on the Duty Roster.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDateSheetModal(true)}
            className="no-print px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700" />
            <span>Print My Date Sheet</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-medium">
                <th className="py-3 px-4">Course / Paper</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Exam Date & Time</th>
                <th className="py-3 px-4">10-Day Countdown Status</th>
                <th className="py-3 px-4">Hall Venue</th>
                <th className="py-3 px-4">QA Paper Status</th>
                <th className="py-3 px-4">Duty Confirmation</th>
                <th className="py-3 px-4">Faculty Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {myDateSheet.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    No date sheet entries currently assigned to {currentUser.name}.
                  </td>
                </tr>
              ) : (
                myDateSheet.map((ds) => {
                  const course = courses.find((c) => c.id === ds.courseId);
                  const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
                  const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);

                  return (
                    <tr key={ds.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900 font-mono">
                          {course?.code}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[200px]">
                          {course?.title}
                        </div>
                        {paper && (
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-neutral-400" />
                            {paper.fileAttachmentName}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-700">
                        Semester {ds.semester}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-medium text-neutral-900">{ds.examDate}</div>
                        <div className="text-[11px] text-neutral-500">{ds.startTime} – {ds.endTime}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {daysLeft < 0 ? (
                          <span className="text-neutral-500 font-mono text-[11px]">
                            Exam Date Passed
                          </span>
                        ) : !paper || paper.qaStatus === 'QA_REJECTED' ? (
                          daysLeft <= 2 ? (
                            <div className="inline-flex flex-col">
                              <span className="font-bold text-red-700 font-mono text-[11px] bg-red-100 px-2 py-0.5 rounded border border-red-300 flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                {daysLeft * 24}h Left (&lt; 48h Critical)
                              </span>
                              <span className="text-[10px] text-red-700 font-semibold mt-0.5">
                                {paper?.qaStatus === 'QA_REJECTED' ? 'Re-Upload Required!' : 'Upload Paper Immediately!'}
                              </span>
                            </div>
                          ) : daysLeft <= 5 ? (
                            <div className="inline-flex flex-col">
                              <span className="font-bold text-amber-800 font-mono text-[11px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                                {daysLeft} days left (3–5d Urgent)
                              </span>
                              <span className="text-[10px] text-amber-700 mt-0.5">
                                QA Draft Pending
                              </span>
                            </div>
                          ) : daysLeft <= 10 ? (
                            <div className="inline-flex flex-col">
                              <span className="font-bold text-yellow-800 font-mono text-[11px] bg-yellow-50 px-2 py-0.5 rounded border border-yellow-300">
                                {daysLeft} days left (10d Alert)
                              </span>
                              <span className="text-[10px] text-yellow-700 mt-0.5">
                                Submission Due
                              </span>
                            </div>
                          ) : (
                            <span className="text-neutral-600 font-mono text-[11px]">
                              {daysLeft} days away
                            </span>
                          )
                        ) : (
                          <div className="inline-flex flex-col">
                            <span className="text-emerald-800 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                              {daysLeft} days away
                            </span>
                            <span className="text-[10px] text-emerald-700 mt-0.5">
                              {paper.qaStatus === 'QA_APPROVED' ? 'Duty Locked' : 'Submitted to QA'}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-700 font-mono">
                        {ds.hallNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        {paper?.qaStatus === 'QA_APPROVED' ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            QA Approved
                          </span>
                        ) : paper?.qaStatus === 'UNDER_QA_REVIEW' ? (
                          <span className="text-amber-700 font-medium">
                            In QA Review
                          </span>
                        ) : paper?.qaStatus === 'QA_REJECTED' ? (
                          <div>
                            <span className="text-red-700 font-medium">Rejected</span>
                            <div className="text-[10px] text-red-600 mt-0.5">{paper.qaNotes}</div>
                          </div>
                        ) : (
                          <span className="text-neutral-400">Not Uploaded</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {ds.dutyConfirmed ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Confirmed in Duty Roster
                          </span>
                        ) : (
                          <span className="text-neutral-400">
                            Pending QA
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {/* Paper Upload Button */}
                          {(!paper || paper.qaStatus === 'QA_REJECTED') && (
                            <button
                              onClick={() => handleOpenUpload(ds)}
                              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <Upload className="w-3 h-3" />
                              {paper?.qaStatus === 'QA_REJECTED' ? 'Re-Upload Paper' : 'Upload Paper'}
                            </button>
                          )}

                          {/* Result Upload Button (if exam called, conducted, or past date) */}
                          {(ds.status === 'EXAM_CALLED' || ds.status === 'CONDUCTED' || daysLeft <= 0) && ds.status !== 'RESULTS_UPLOADED' && (
                            <button
                              onClick={() => handleOpenGrading(ds)}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              Upload Exam Results
                            </button>
                          )}

                          {ds.status === 'RESULTS_UPLOADED' && (
                            <button
                              onClick={() => handleOpenGrading(ds)}
                              className="px-2.5 py-1 text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3 text-emerald-700" />
                              Edit / View Results
                            </button>
                          )}
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

      {/* My Confirmed Duty Roster */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              My Invigilation Duty Roster ({myDuties.length} Confirmed)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              These invigilation slots are locked and officialized. Click below to trigger automated WhatsApp messages for your duty shifts.
            </p>
          </div>
          {myDuties.length > 0 && (
            <button
              onClick={() => {
                if (myDuties[0]) {
                  sendWhatsAppDutyRosterAlert(myDuties[0].id);
                }
              }}
              className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              title="Send WhatsApp alert containing assigned duty shifts"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Send WhatsApp Alert
            </button>
          )}
        </div>

        {myDuties.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            No confirmed duties yet. Duties are locked on the roster once your question paper is approved by QA.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {myDuties.map((duty) => {
              const ds = dateSheet.find((d) => d.id === duty.dateSheetEntryId);
              const course = courses.find((c) => c.id === ds?.courseId);
              return (
                <div
                  key={duty.id}
                  className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1.5 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-neutral-900">{course?.code}</span>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        Confirmed
                      </span>
                    </div>
                    <div className="text-neutral-600 text-[11px]">{course?.title}</div>
                    <div className="pt-2 border-t border-neutral-200 font-mono text-neutral-700 space-y-0.5 text-[11px]">
                      <div>Date: <span className="font-medium">{duty.examDate}</span></div>
                      <div>Session: {duty.startTime} – {duty.endTime}</div>
                      <div>Hall: <span className="font-medium">{duty.hallNumber}</span></div>
                      <div className="text-blue-900 font-medium">Role: {duty.role}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => sendWhatsAppDutyRosterAlert(duty.id)}
                    className="w-full mt-3 px-2.5 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-950 border border-[#25D366]/40 rounded font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Send automated WhatsApp alert for this shift"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                    Send WhatsApp Alert
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pure PDF Upload Modal */}
      {uploadModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">
                    Upload Question Paper (PDF)
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {courses.find((c) => c.id === uploadModalEntry.courseId)?.code} · {courses.find((c) => c.id === uploadModalEntry.courseId)?.title} (Sem {uploadModalEntry.semester})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalEntry(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadSuccessMsg ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{uploadSuccessMsg}</h3>
                <p className="text-xs text-neutral-500">
                  The PDF paper has been dispatched to the QA Auditor for fast-track evaluation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDoUpload} className="p-6 space-y-5">
                {/* PDF File Picker Zone */}
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-2">
                    Select Official Question Paper PDF
                  </label>

                  <div className="border-2 border-dashed border-emerald-300 rounded-xl p-6 bg-emerald-50/20 hover:bg-emerald-50/50 transition-colors text-center relative group">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="pdf-upload-input"
                    />
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6 text-emerald-800" />
                    </div>
                    <div className="text-xs font-bold text-neutral-900">
                      Click to choose or drag & drop your PDF file
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Accepts only standard .pdf documents (Max 25 MB)
                    </p>
                  </div>
                </div>

                {/* Selected PDF Document Preview Card */}
                <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      PDF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 truncate max-w-[260px]">
                        {pdfFileName || `${courses.find((c) => c.id === uploadModalEntry.courseId)?.code || 'Exam'}_FinalExam.pdf`}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                        <span>{pdfFileSize}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-medium">Valid PDF Document</span>
                      </div>
                    </div>
                  </div>

                  <label
                    htmlFor="pdf-upload-input"
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer px-2.5 py-1 bg-white border border-neutral-200 rounded shadow-2xs hover:bg-neutral-50"
                  >
                    Change File
                  </label>
                </div>

                <div className="text-[11px] text-neutral-500 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                  <strong className="text-emerald-950">Note:</strong> Your uploaded PDF will be reviewed directly by the QA Cell. Once accepted, your invigilation duty is automatically locked in the Duty Roster.
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setUploadModalEntry(null)}
                    className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload PDF & Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Student Marks Grading Modal */}
      {gradingModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Official Grade & Exam Result Sheet
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {courses.find((c) => c.id === gradingModalEntry.courseId)?.code} · {courses.find((c) => c.id === gradingModalEntry.courseId)?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGradingModalEntry(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {gradeSuccessMsg ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{gradeSuccessMsg}</h3>
                <p className="text-xs text-neutral-500">
                  Results published. Students can now inspect their GPA progression on their portal. Official Transcripts can only be printed by the Admin Office.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDoSubmitGrading} className="p-6 space-y-4">
                <div className="text-xs text-neutral-600 pb-2 border-b border-neutral-100 flex items-center justify-between">
                  <span>Grading Scale: Internal (20M) + Midterm (30M) + Final (50M) = 100M Total</span>
                  <span className="font-mono text-neutral-400">A $\ge$ 85, B+ $\ge$ 78, B $\ge$ 70, C $\ge$ 55, D $\ge$ 50</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-medium">
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Roll Number</th>
                        <th className="py-2.5 px-3">Internal (Max 20)</th>
                        <th className="py-2.5 px-3">Midterm (Max 30)</th>
                        <th className="py-2.5 px-3">Final (Max 50)</th>
                        <th className="py-2.5 px-3">Total (100)</th>
                        <th className="py-2.5 px-3">Grade Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {gradingRows.map((row, idx) => {
                        const total = Number(row.internalMarks) + Number(row.midtermMarks) + Number(row.finalMarks);
                        let gp = 0.0;
                        let letter = 'F';
                        if (total >= 85) { gp = 4.0; letter = 'A'; }
                        else if (total >= 78) { gp = 3.4; letter = 'B+'; }
                        else if (total >= 70) { gp = 3.0; letter = 'B'; }
                        else if (total >= 64) { gp = 2.5; letter = 'C+'; }
                        else if (total >= 55) { gp = 2.0; letter = 'C'; }
                        else if (total >= 50) { gp = 1.0; letter = 'D'; }

                        return (
                          <tr key={row.studentId} className="hover:bg-neutral-50/60">
                            <td className="py-2.5 px-3 font-semibold text-neutral-900">
                              {row.studentName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-neutral-600">
                              {row.rollNumber}
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min={0}
                                max={20}
                                value={row.internalMarks}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setGradingRows((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, internalMarks: val } : r))
                                  );
                                }}
                                className="w-16 px-2 py-1 text-xs border border-neutral-300 rounded font-mono"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min={0}
                                max={30}
                                value={row.midtermMarks}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setGradingRows((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, midtermMarks: val } : r))
                                  );
                                }}
                                className="w-16 px-2 py-1 text-xs border border-neutral-300 rounded font-mono"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min={0}
                                max={50}
                                value={row.finalMarks}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setGradingRows((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, finalMarks: val } : r))
                                  );
                                }}
                                className="w-16 px-2 py-1 text-xs border border-neutral-300 rounded font-mono"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                              {total} / 100
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              <span className="font-bold text-blue-900">{letter}</span> ({gp.toFixed(1)})
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setGradingModalEntry(null)}
                    className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
                  >
                    Publish Official Exam Results
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Official Institutional Printable Footer (Shown ONLY during PDF Export / Print) */}
      <DashboardPrintFooter />

      {/* Official Faculty Date Sheet Print Modal */}
      <TeacherDateSheetPrintModal
        isOpen={showDateSheetModal}
        onClose={() => setShowDateSheetModal(false)}
      />

      {/* Edit Faculty User Details Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
        />
      )}
    </div>
  );
}
