/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { useExam } from '@/lib/exam-context';
import {
  Printer,
  Download,
  X,
  Calendar,
  ShieldCheck,
  Building,
  GraduationCap,
  Clock,
  MapPin,
  UserCheck,
} from 'lucide-react';

interface TeacherDateSheetPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeacherDateSheetPrintModal({
  isOpen,
  onClose,
}: TeacherDateSheetPrintModalProps) {
  const {
    currentUser,
    dateSheet,
    courses,
    departments,
    dutyRoster,
    papers,
    branding,
    simulatedDate,
  } = useExam();

  if (!isOpen) return null;

  const teacherDept = departments.find((d) => d.id === currentUser.departmentId);

  // Faculty's assigned examinations from date sheet
  const myAssignedExams = dateSheet
    .filter((ds) => ds.assignedTeacherId === currentUser.id)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  // Faculty's confirmed invigilation duties
  const myDuties = dutyRoster.filter(
    (d) => d.teacherId === currentUser.id && d.isConfirmed
  );

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${branding.collegeName}_Faculty_DateSheet_${currentUser.name.replace(/\s+/g, '_')}_${simulatedDate}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleDownloadCsv = () => {
    const headers = 'SNo,ExamDate,Day,SessionTiming,CourseCode,CourseTitle,CreditHours,Department,Semester,HallNumber,DutyRole,PaperStatus\n';
    const rows = myAssignedExams
      .map((ds, index) => {
        const c = courses.find((item) => item.id === ds.courseId);
        const d = departments.find((item) => item.id === ds.departmentId);
        const p = papers.find((item) => item.dateSheetEntryId === ds.id);
        const duty = myDuties.find((item) => item.dateSheetEntryId === ds.id);
        const dayOfWeek = new Date(ds.examDate).toLocaleDateString('en-US', { weekday: 'short' });
        return `${index + 1},"${ds.examDate}","${dayOfWeek}","${ds.startTime} - ${ds.endTime}","${c?.code || ''}","${c?.title || ''}",${c?.creditHours || 3},"${d?.name || ''}",Semester ${ds.semester},"${ds.hallNumber}","${duty?.role || 'Examiner'}","${p?.qaStatus || 'PENDING'}"`;
      })
      .join('\n');

    const summary = `\n\nFaculty Member,"${currentUser.name}"\nDesignation,"${currentUser.designation || 'Faculty'}"\nDepartment,"${teacherDept?.name || 'Department'}"\nIssue Date,"${simulatedDate}"\nTotal Assigned Papers,${myAssignedExams.length}`;

    const blob = new Blob([headers + rows + summary], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Faculty_Date_Sheet_${currentUser.name.replace(/\s+/g, '_')}_${simulatedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-emerald-300 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 print-area my-auto">
        {/* Top Control Bar - Hidden in Print */}
        <div className="px-6 py-4 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/90 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-2xs">
              <Printer className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Official Faculty Examination &amp; Invigilation Date Sheet
              </h3>
              <p className="text-[11px] text-neutral-600">
                Personalized examination conduct and hall invigilation timetable for {currentUser.name}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Date Sheet</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 space-y-5 text-xs font-sans">
          {/* Institutional Header with dynamic College Name, Subtitle & Logo */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-emerald-800 text-left">
            <div className="flex items-center gap-4">
              <img
                src={branding.logoUrl || '/exam_system_logo.jpg'}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-lg object-contain border border-emerald-300 bg-white"
              />
              <div>
                <div className="text-xl font-serif font-black text-neutral-900 tracking-tight uppercase">
                  {branding.collegeName}
                </div>
                <div className="text-emerald-800 font-semibold text-xs tracking-wide">
                  {branding.subTitle || 'Office of the Controller of Examinations'}
                </div>
                <div className="text-neutral-600 text-[11px] font-bold mt-1 uppercase tracking-wider">
                  FACULTY EXAMINATION CONDUCT &amp; INVIGILATION DATE SHEET · FALL 2026
                </div>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-950 font-mono text-xs font-bold rounded border border-emerald-300">
                FACULTY DOSSIER COPY
              </span>
              <div className="text-[10px] text-neutral-500 mt-1 font-mono">
                Issued by Directorate: {simulatedDate}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">
                Staff Ref: {currentUser.id.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Faculty Identification Particulars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px] font-semibold">FACULTY NAME</span>
              <span className="font-bold text-neutral-900 text-sm">{currentUser.name}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-semibold">DESIGNATION &amp; ROLE</span>
              <span className="font-semibold text-neutral-800">{currentUser.designation || 'Examiner / Faculty'}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-semibold">DEPARTMENT</span>
              <span className="font-bold text-emerald-900">{teacherDept?.name || 'Academic Faculty'}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-semibold">ASSIGNED SESSIONS</span>
              <span className="font-bold font-mono text-neutral-900">
                {myAssignedExams.length} Examination(s)
              </span>
            </div>
          </div>

          {/* Timetable Table */}
          <div className="border border-neutral-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-emerald-900 text-white font-semibold text-[11px]">
                <tr>
                  <th className="p-2.5 text-center w-10">#</th>
                  <th className="p-2.5">Date &amp; Day</th>
                  <th className="p-2.5">Session Timing</th>
                  <th className="p-2.5">Course Code &amp; Title</th>
                  <th className="p-2.5">Dept &amp; Sem</th>
                  <th className="p-2.5">Hall / Room</th>
                  <th className="p-2.5">Invigilation Role</th>
                  <th className="p-2.5">Paper Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans text-[11px]">
                {myAssignedExams.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-neutral-400">
                      No examinations currently scheduled for your profile in this academic term.
                    </td>
                  </tr>
                ) : (
                  myAssignedExams.map((ds, index) => {
                    const c = courses.find((item) => item.id === ds.courseId);
                    const d = departments.find((item) => item.id === ds.departmentId);
                    const p = papers.find((item) => item.dateSheetEntryId === ds.id);
                    const duty = myDuties.find((item) => item.dateSheetEntryId === ds.id);
                    const dayOfWeek = new Date(ds.examDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                    });

                    return (
                      <tr key={ds.id} className="hover:bg-neutral-50 print-avoid-break">
                        <td className="p-2.5 text-center font-mono text-neutral-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-neutral-900 whitespace-nowrap">
                          {ds.examDate}{' '}
                          <span className="text-neutral-500 font-normal">({dayOfWeek})</span>
                        </td>
                        <td className="p-2.5 font-mono text-neutral-700 whitespace-nowrap">
                          {ds.startTime} – {ds.endTime}
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold font-mono text-neutral-900">{c?.code}</div>
                          <div className="text-neutral-600 text-[10.5px] font-medium leading-tight">
                            {c?.title}
                          </div>
                          <div className="text-[9.5px] text-neutral-400 font-mono">
                            {c?.creditHours} Credit Hours
                          </div>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="font-bold text-emerald-900">{d?.code || 'GEN'}</span> · Sem {ds.semester}
                        </td>
                        <td className="p-2.5 font-semibold text-neutral-800 whitespace-nowrap">
                          {ds.hallNumber}
                        </td>
                        <td className="p-2.5">
                          <span className="font-semibold text-emerald-900">
                            {duty?.role || 'Chief Examiner'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {p?.qaStatus === 'QA_APPROVED' ? (
                            <span className="text-emerald-800 font-semibold text-[10px]">
                              QA Approved
                            </span>
                          ) : p?.qaStatus === 'UNDER_QA_REVIEW' ? (
                            <span className="text-amber-800 font-semibold text-[10px]">
                              In QA Review
                            </span>
                          ) : (
                            <span className="text-red-700 font-semibold text-[10px]">
                              Pending Upload
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

          {/* Operational Instructions for Faculty Examiners */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1 text-[10.5px] text-neutral-600 print-avoid-break">
            <div className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
              Faculty Invigilator Protocols &amp; Conduct Rules:
            </div>
            <div>
              1. <strong>Reporting Window:</strong> All designated examiners and invigilators must report to the Central Examination Control Room 30 minutes prior to session start.
            </div>
            <div>
              2. <strong>Candidate Seating Verification:</strong> Verify each candidate&apos;s printed Date Sheet and College Identity Card prior to distributing answer books.
            </div>
            <div>
              3. <strong>Answer Booklet Submission:</strong> Count and reconcile all collected scripts before submitting sealed envelopes to the Controller of Examinations.
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div className="pt-4 border-t-2 border-neutral-200 flex items-center justify-between print-avoid-break">
            {/* Deputy Registrar */}
            <div className="text-left space-y-0.5">
              <div className="h-8 flex items-end">
                <span className="font-serif italic text-base text-emerald-950 font-bold border-b border-neutral-400 pb-0.5 px-2">
                  {branding.deputyRegistrarName || 'Dr. Richard Vance, Ph.D.'}
                </span>
              </div>
              <div className="font-bold text-neutral-900 text-[11px]">
                {branding.deputyRegistrarTitle || 'Deputy Registrar (Academics)'}
              </div>
              <div className="text-[10px] text-neutral-500">{branding.collegeName}</div>
            </div>

            {/* Official University Seal */}
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 bg-emerald-50/30"
                style={{ borderColor: branding.sealColor || '#064e3b', color: branding.sealColor || '#064e3b' }}
              >
                <ShieldCheck className="w-5 h-5 mb-0.5" />
                <div className="text-[7.5px] font-black uppercase tracking-wider leading-tight">
                  {branding.sealText || 'OFFICIAL SEAL'}
                </div>
                <div className="text-[6.5px] font-mono text-neutral-600">
                  {branding.sealSubText || 'Exam Controller'}
                </div>
              </div>
            </div>

            {/* Controller of Examinations */}
            <div className="text-right space-y-0.5">
              <div className="h-8 flex items-end justify-end">
                <span className="font-serif italic text-base text-emerald-950 font-bold border-b border-neutral-400 pb-0.5 px-2">
                  {branding.controllerName || 'Prof. Malcolm Thorne'}
                </span>
              </div>
              <div className="font-bold text-neutral-900 text-[11px]">
                {branding.controllerTitle || 'Controller of Examinations'}
              </div>
              <div className="text-[10px] text-emerald-800 font-semibold">{branding.collegeName}</div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons Footer - Hidden during print */}
        <div className="px-6 py-3.5 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between no-print">
          <div className="text-xs text-neutral-500">
            Official Faculty Examination Schedule · Certified by Examination Directorate
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Faculty Date Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
