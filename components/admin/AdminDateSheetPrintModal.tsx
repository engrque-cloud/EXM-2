/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import {
  Printer,
  Download,
  X,
  Calendar,
  Filter,
  ShieldCheck,
  Building,
  GraduationCap,
} from 'lucide-react';

interface AdminDateSheetPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDeptId?: string;
  initialSemester?: number | string;
}

export function AdminDateSheetPrintModal({
  isOpen,
  onClose,
  initialDeptId = 'ALL',
  initialSemester = 'ALL',
}: AdminDateSheetPrintModalProps) {
  const {
    dateSheet,
    courses,
    departments,
    users,
    branding,
    simulatedDate,
  } = useExam();

  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDeptId);
  const [selectedSemester, setSelectedSemester] = useState<string>(String(initialSemester));

  const filteredEntries = useMemo(() => {
    return dateSheet
      .filter((ds) => {
        if (selectedDeptId !== 'ALL' && ds.departmentId !== selectedDeptId) return false;
        if (selectedSemester !== 'ALL' && String(ds.semester) !== selectedSemester) return false;
        return true;
      })
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
  }, [dateSheet, selectedDeptId, selectedSemester]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${branding.collegeName}_Master_DateSheet_${simulatedDate}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleDownloadCsv = () => {
    const headers = 'SNo,ExamDate,Day,Timing,CourseCode,CourseTitle,CreditHours,Department,Semester,HallNumber,AssignedFaculty\n';
    const rows = filteredEntries
      .map((ds, index) => {
        const c = courses.find((item) => item.id === ds.courseId);
        const d = departments.find((item) => item.id === ds.departmentId);
        const t = users.find((item) => item.id === ds.assignedTeacherId);
        const dayOfWeek = new Date(ds.examDate).toLocaleDateString('en-US', { weekday: 'short' });
        return `${index + 1},"${ds.examDate}","${dayOfWeek}","${ds.startTime} - ${ds.endTime}","${c?.code || ''}","${c?.title || ''}",${c?.creditHours || 3},"${d?.name || ''}",Semester ${ds.semester},"${ds.hallNumber}","${t?.name || 'Faculty Assigned'}"`;
      })
      .join('\n');

    const summary = `\n\nInstitution,"${branding.collegeName}"\nDirectorate,"${branding.subTitle || 'Office of the Controller of Examinations'}"\nIssue Date,"${simulatedDate}"\nFilter,"${selectedDeptId !== 'ALL' ? departments.find(d => d.id === selectedDeptId)?.name : 'All Departments'}"\nTotal Papers,${filteredEntries.length}`;

    const blob = new Blob([headers + rows + summary], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Master_Date_Sheet_${simulatedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentDeptObj = departments.find((d) => d.id === selectedDeptId);

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
                Official Master Examination Date Sheet (Controller Office Print Authority)
              </h3>
              <p className="text-[11px] text-neutral-600">
                Authorized for printing by Admin / Office of the Controller of Examinations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Filters inside modal */}
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-emerald-300 rounded-md bg-white font-medium text-neutral-800"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-emerald-300 rounded-md bg-white font-mono text-neutral-800"
            >
              <option value="ALL">All Semesters (1–8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </select>

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
                  MASTER EXAMINATION DATE SHEET · FALL 2026 SEMESTER EXAMINATIONS
                </div>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-950 font-mono text-xs font-bold rounded border border-emerald-300">
                OFFICIAL CONTROLLER COPY
              </span>
              <div className="text-[10px] text-neutral-500 mt-1 font-mono">
                Issued by Directorate: {simulatedDate}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">
                Ref No: EMS/DS/2026/F-{simulatedDate.replace(/-/g, '')}
              </div>
            </div>
          </div>

          {/* Scope & Particulars Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px] font-semibold">ACADEMIC DEPARTMENT</span>
              <span className="font-bold text-neutral-900">
                {currentDeptObj ? currentDeptObj.name : 'All Academic Faculties (Eng, Math, CS)'}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-semibold">SEMESTER SCOPE</span>
              <span className="font-bold font-mono text-emerald-900">
                {selectedSemester === 'ALL' ? 'Semesters 1 through 8' : `Semester ${selectedSemester}`}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-semibold">SCHEDULED SESSIONS</span>
              <span className="font-bold font-mono text-neutral-900">{filteredEntries.length} Paper(s) Scheduled</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-semibold">AUTHORITY</span>
              <span className="font-semibold text-neutral-800">Controller of Examinations</span>
            </div>
          </div>

          {/* Master Date Sheet Timetable Table */}
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
                  <th className="p-2.5">Designated Examiner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans text-[11px]">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-neutral-400">
                      No examinations scheduled matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((ds, index) => {
                    const c = courses.find((item) => item.id === ds.courseId);
                    const d = departments.find((item) => item.id === ds.departmentId);
                    const t = users.find((item) => item.id === ds.assignedTeacherId);
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
                        <td className="p-2.5 text-neutral-700">
                          <div className="font-medium">{t?.name || 'Faculty Member'}</div>
                          <div className="text-[9.5px] text-neutral-400">
                            {t?.designation || 'Examiner'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Operational Regulations for Center Superintendents & Staff */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1 text-[10.5px] text-neutral-600 print-avoid-break">
            <div className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
              Institutional Examination Directives & Regulations:
            </div>
            <div>
              1. <strong>Admission to Examination Hall:</strong> Candidates must possess a valid Candidate Admit Slip / Date Sheet and verified College Photo ID.
            </div>
            <div>
              2. <strong>Question Paper Protocol:</strong> Question papers must be opened strictly in the presence of Chief Invigilator and two invigilators 15 minutes prior to session start.
            </div>
            <div>
              3. <strong>Discipline & Integrity:</strong> Any possession of unauthorized devices, papers, or unfair means shall be immediately recorded on official incident form and sealed.
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
            Printer-friendly Master Date Sheet · Official University Seal Attached
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
              <span>Print Master Date Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
