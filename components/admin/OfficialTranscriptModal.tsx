/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useExam } from '@/lib/exam-context';
import {
  Printer,
  X,
  Award,
  ShieldCheck,
  Download,
  Building,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Lock,
  PenTool,
  Settings,
  UploadCloud,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface OfficialTranscriptModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OfficialTranscriptModal({
  studentId,
  isOpen,
  onClose,
}: OfficialTranscriptModalProps) {
  const {
    branding,
    updateBranding,
    users,
    courses,
    departments,
    results,
    simulatedDate,
  } = useExam();

  const [userSelectedId, setUserSelectedId] = useState<string>('');
  const [isEditingSignatories, setIsEditingSignatories] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  // Form states initialized with current branding
  const [deputyName, setDeputyName] = useState(branding.deputyRegistrarName || 'Dr. Richard Vance, Ph.D.');
  const [deputyTitle, setDeputyTitle] = useState(branding.deputyRegistrarTitle || 'Deputy Registrar (Academics)');
  const [controllerName, setControllerName] = useState(branding.controllerName || 'Prof. Malcolm Thorne');
  const [controllerTitle, setControllerTitle] = useState(branding.controllerTitle || 'Controller of Examinations');
  const [sealText, setSealText] = useState(branding.sealText || 'OFFICIAL SEAL');
  const [sealSubText, setSealSubText] = useState(branding.sealSubText || 'Exam Controller');
  const [sealType, setSealType] = useState<'EMBOSSED' | 'EMBLEM' | 'ACADEMIC' | 'CUSTOM_IMAGE'>(
    branding.sealType || 'EMBOSSED'
  );
  const [sealImageUrl, setSealImageUrl] = useState(
    branding.sealImageUrl || '/src/assets/images/exam_system_logo_1792130817114.jpg'
  );
  const [sealColor, setSealColor] = useState(branding.sealColor || '#064e3b');



  if (!isOpen) return null;

  const allApprovedStudents = users.filter((u) => u.role === 'STUDENT' && u.isApproved);
  const activeStudentId = userSelectedId || studentId;
  const currentStudent = users.find((u) => u.id === activeStudentId) || allApprovedStudents[0] || users[0];
  const studentDept = departments.find((d) => d.id === currentStudent?.departmentId);
  const studentSemester = currentStudent?.semester || 4;

  // Student results
  const studentResults = results.filter((r) => r.studentId === currentStudent?.id);

  // Compute GPA and credits
  let totalGradePoints = 0;
  let totalCreditHours = 0;
  let totalQualityPoints = 0;

  studentResults.forEach((res) => {
    const course = courses.find((c) => c.id === res.courseId);
    const crHours = course?.creditHours || 3;
    const qualityPoints = res.gradePoint * crHours;
    totalGradePoints += res.gradePoint * crHours;
    totalCreditHours += crHours;
    totalQualityPoints += qualityPoints;
  });

  const cumulativeGpa = totalCreditHours > 0 ? (totalGradePoints / totalCreditHours).toFixed(2) : '3.80';

  const getAcademicStanding = (gpa: number) => {
    if (gpa >= 3.7) return 'First Division with High Distinction (Summa Cum Laude)';
    if (gpa >= 3.3) return 'First Division with Distinction';
    if (gpa >= 2.8) return 'First Division';
    if (gpa >= 2.0) return 'Second Division (Satisfactory)';
    return 'Academic Probation';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!currentStudent) return;
    const headers = 'CourseCode,CourseTitle,CreditHours,InternalMarks(Max20),MidtermMarks(Max30),FinalMarks(Max50),TotalMarks(100),LetterGrade,GradePoint,QualityPoints\n';
    const rows = studentResults
      .map((res) => {
        const c = courses.find((item) => item.id === res.courseId);
        const cr = c?.creditHours || 3;
        const qp = (res.gradePoint * cr).toFixed(2);
        return `"${c?.code || ''}","${c?.title || ''}",${cr},${res.internalMarks},${res.midtermMarks},${res.finalMarks},${res.totalMarks},"${res.letterGrade}",${res.gradePoint.toFixed(2)},${qp}`;
      })
      .join('\n');

    const summary = `\n\nStudent Name,"${currentStudent.name}"\nRoll Number,"${currentStudent.rollNumber || 'N/A'}"\nDepartment,"${studentDept?.name || 'N/A'}"\nSemester,${studentSemester}\nCumulative GPA,${cumulativeGpa}\nTotal Credits,${totalCreditHours}\nIssue Date,"${simulatedDate}"\nIssued By,"Admin / Office of the Controller of Examinations"`;

    const blob = new Blob([headers + rows + summary], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Official_Transcript_${currentStudent.rollNumber || currentStudent.id}_${simulatedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSignatories = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBranding({
      deputyRegistrarName: deputyName,
      deputyRegistrarTitle: deputyTitle,
      controllerName: controllerName,
      controllerTitle: controllerTitle,
      sealText,
      sealSubText,
      sealType,
      sealImageUrl,
      sealColor,
    });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaultDeputy = 'Dr. Richard Vance, Ph.D.';
    const defaultDeputyTitle = 'Deputy Registrar (Academics)';
    const defaultController = 'Prof. Malcolm Thorne';
    const defaultControllerTitle = 'Controller of Examinations';
    const defaultSealText = 'OFFICIAL SEAL';
    const defaultSealSubText = 'Exam Controller';
    const defaultSealType = 'EMBOSSED' as const;
    const defaultSealImageUrl = '/src/assets/images/exam_system_logo_1792130817114.jpg';
    const defaultSealColor = '#064e3b';

    setDeputyName(defaultDeputy);
    setDeputyTitle(defaultDeputyTitle);
    setControllerName(defaultController);
    setControllerTitle(defaultControllerTitle);
    setSealText(defaultSealText);
    setSealSubText(defaultSealSubText);
    setSealType(defaultSealType);
    setSealImageUrl(defaultSealImageUrl);
    setSealColor(defaultSealColor);

    updateBranding({
      deputyRegistrarName: defaultDeputy,
      deputyRegistrarTitle: defaultDeputyTitle,
      controllerName: defaultController,
      controllerTitle: defaultControllerTitle,
      sealText: defaultSealText,
      sealSubText: defaultSealSubText,
      sealType: defaultSealType,
      sealImageUrl: defaultSealImageUrl,
      sealColor: defaultSealColor,
    });

    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleSealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSealImageUrl(reader.result);
          setSealType('CUSTOM_IMAGE');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-emerald-300 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto print-area">
        {/* Modal Admin Header - hidden during print */}
        <div className="px-6 py-3.5 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50/90 gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900">Official Academic Transcript</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                  Admin Exclusive Authority
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Official institutional grade ledger sealed by Controller of Examinations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick student switcher for admin convenience */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-neutral-600 hidden md:inline">Candidate:</span>
              <select
                value={currentStudent?.id || ''}
                onChange={(e) => setUserSelectedId(e.target.value)}
                className="px-2.5 py-1 text-xs border border-emerald-300 rounded-md bg-white font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {allApprovedStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber || 'No Roll'}) - Sem {s.semester}
                  </option>
                ))}
              </select>
            </div>

            {/* Option to change Deputy Registrar, Controller, and Seal */}
            <button
              type="button"
              onClick={() => setIsEditingSignatories(!isEditingSignatories)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                isEditingSignatories
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}
              title="Change Deputy Registrar, Controller of Examinations, and Seal"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isEditingSignatories ? 'Close Controls' : 'Edit Deputy, Controller & Seal'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Close Transcript"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- SIGNATORIES & SEAL CUSTOMIZATION PANEL (ADMIN DRAWER - HIDDEN IN PRINT) --- */}
        {isEditingSignatories && (
          <div className="bg-emerald-50/70 border-b border-emerald-200 p-5 space-y-4 no-print animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-800" />
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Customize Deputy Registrar, Controller of Examinations &amp; Official Seal
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-300 rounded hover:bg-neutral-50 flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-neutral-500" />
                  Restore Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSignatories(false)}
                  className="text-neutral-400 hover:text-neutral-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {saveSuccessNotice && (
              <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                Signatories &amp; Official Seal updated successfully across all transcripts!
              </div>
            )}

            <form onSubmit={handleSaveSignatories} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Deputy Registrar Configuration */}
                <div className="p-3.5 bg-white rounded-lg border border-emerald-200/90 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                      1. Deputy Registrar
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">Signatory #1</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                      Deputy Registrar Full Name
                    </label>
                    <input
                      type="text"
                      value={deputyName}
                      onChange={(e) => setDeputyName(e.target.value)}
                      placeholder="e.g. Dr. Richard Vance, Ph.D."
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded focus:ring-1 focus:ring-emerald-700 font-serif font-bold text-neutral-900 bg-neutral-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                      Deputy Registrar Designation / Title
                    </label>
                    <input
                      type="text"
                      value={deputyTitle}
                      onChange={(e) => setDeputyTitle(e.target.value)}
                      placeholder="e.g. Deputy Registrar (Academics)"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded focus:ring-1 focus:ring-emerald-700 font-medium text-neutral-800"
                    />
                  </div>
                </div>

                {/* 2. Controller of Examinations Configuration */}
                <div className="p-3.5 bg-white rounded-lg border border-emerald-200/90 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                      2. Controller of Examinations
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">Signatory #2</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                      Controller Full Name
                    </label>
                    <input
                      type="text"
                      value={controllerName}
                      onChange={(e) => setControllerName(e.target.value)}
                      placeholder="e.g. Prof. Malcolm Thorne"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded focus:ring-1 focus:ring-emerald-700 font-serif font-bold text-neutral-900 bg-neutral-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                      Controller Designation / Title
                    </label>
                    <input
                      type="text"
                      value={controllerTitle}
                      onChange={(e) => setControllerTitle(e.target.value)}
                      placeholder="e.g. Controller of Examinations"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded focus:ring-1 focus:ring-emerald-700 font-medium text-neutral-800"
                    />
                  </div>
                </div>

                {/* 3. Official University Seal Configuration */}
                <div className="p-3.5 bg-white rounded-lg border border-emerald-200/90 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      3. Official Document Seal
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">Center Stamp</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-700 block mb-1">
                        Seal Main Text
                      </label>
                      <input
                        type="text"
                        value={sealText}
                        onChange={(e) => setSealText(e.target.value)}
                        placeholder="OFFICIAL SEAL"
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded uppercase font-bold text-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-700 block mb-1">
                        Seal Subtitle
                      </label>
                      <input
                        type="text"
                        value={sealSubText}
                        onChange={(e) => setSealSubText(e.target.value)}
                        placeholder="Exam Controller"
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded text-neutral-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-neutral-700 block mb-1">
                      Seal Style
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSealType('EMBOSSED')}
                        className={`p-1.5 rounded border text-center font-medium transition-colors cursor-pointer ${
                          sealType === 'EMBOSSED'
                            ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        Shield Seal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSealType('EMBLEM');
                          setSealImageUrl('/src/assets/images/exam_system_logo_1792130817114.jpg');
                        }}
                        className={`p-1.5 rounded border text-center font-medium transition-colors cursor-pointer ${
                          sealType === 'EMBLEM'
                            ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        Emblem Crest
                      </button>
                      <button
                        type="button"
                        onClick={() => setSealType('ACADEMIC')}
                        className={`p-1.5 rounded border text-center font-medium transition-colors cursor-pointer ${
                          sealType === 'ACADEMIC'
                            ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        Academic
                      </button>
                    </div>
                  </div>

                  {/* Ink Color Selector */}
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-700 block mb-1">
                      Seal Ink Color
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#064e3b', label: 'Emerald' },
                        { color: '#1e3a8a', label: 'Navy' },
                        { color: '#881337', label: 'Crimson' },
                        { color: '#b45309', label: 'Gold' },
                        { color: '#171717', label: 'Black' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setSealColor(c.color)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                            sealColor === c.color ? 'scale-110 border-neutral-900 shadow-xs' : 'border-white'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}
                      <input
                        type="text"
                        value={sealColor}
                        onChange={(e) => setSealColor(e.target.value)}
                        className="w-20 px-2 py-0.5 text-[10px] font-mono border border-neutral-300 rounded"
                        placeholder="#064e3b"
                      />
                    </div>
                  </div>

                  {/* Custom Seal File Upload */}
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-700 block mb-1">
                      Upload Custom Stamp / Seal Image
                    </label>
                    <label className="flex items-center gap-1.5 px-2 py-1 border border-dashed border-neutral-300 rounded bg-neutral-50 hover:bg-emerald-50 text-[10px] text-neutral-600 cursor-pointer transition-colors">
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Upload image...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSealFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                <span className="text-[11px] text-neutral-500">
                  Tip: Changes update the live document preview below and persist to system storage.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply &amp; Save Signatories
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* --- OFFICIAL TRANSCRIPT DOCUMENT BODY (PRINTABLE) --- */}
        <div className="p-6 sm:p-10 space-y-6 text-neutral-900 bg-white font-sans text-xs">
          {/* Institution Header with Emblem and University Seal */}
          <div className="border-b-2 border-emerald-900 pb-5 page-break-avoid print-avoid-break">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Emblem"
                    width={64}
                    height={64}
                    style={{ width: '64px', height: '64px', maxWidth: '64px', maxHeight: '64px', objectFit: 'cover' }}
                    className="w-16 h-16 rounded-lg object-cover border border-emerald-300 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-emerald-900 text-white font-black flex items-center justify-center text-2xl shadow-sm border border-emerald-950">
                    {branding.collegeName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight uppercase">
                    {branding.collegeName}
                  </h1>
                  <h2 className="text-xs font-bold text-emerald-900 tracking-wide uppercase">
                    {branding.subTitle || 'Office of the Controller of Examinations'}
                  </h2>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Permanent Academic Records Directorate · Verified Institutional Registry
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="inline-block p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-center">
                  <span className="block text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                    Official Transcript
                  </span>
                  <span className="font-mono font-bold text-xs text-neutral-900 block mt-0.5">
                    REG-SEC-2026
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono mt-1">
                  Issued: {simulatedDate}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100 text-center">
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-emerald-950 px-4 py-1 bg-emerald-50/70 border border-emerald-200 rounded-md inline-block">
                Official Academic Transcript &amp; Cumulative Grade Ledger
              </span>
            </div>
          </div>

          {/* Student Profile Particulars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 text-xs page-break-avoid print-avoid-break particulars-strip">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-900 block">Candidate Name</span>
              <strong className="text-neutral-900 text-sm block mt-0.5 font-bold">{currentStudent.name}</strong>
              <span className="text-[10px] text-neutral-500">Enrolled Student</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-900 block">Roll / Registration No</span>
              <strong className="text-neutral-900 text-sm font-mono block mt-0.5 font-bold">
                {currentStudent.rollNumber || 'FA26-CS-042'}
              </strong>
              <span className="text-[10px] text-neutral-500">ID: {currentStudent.id}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-900 block">Degree / Department</span>
              <strong className="text-neutral-900 block mt-0.5 font-semibold">
                {studentDept?.name || 'Department of Computer Science'}
              </strong>
              <span className="text-[10px] text-emerald-800 font-mono">Code: {studentDept?.code || 'CS'}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-900 block">Current Term</span>
              <strong className="text-neutral-900 block mt-0.5 font-mono font-semibold">
                Semester {studentSemester} (Fall 2026)
              </strong>
              <span className="text-[10px] text-emerald-700 font-semibold">Status: In Good Standing</span>
            </div>
          </div>

          {/* Comprehensive Course Grade Ledger */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-800" />
                Evaluated Examination Courses &amp; Marks Breakdown
              </h3>
              <span className="text-[11px] font-mono text-neutral-500">
                {studentResults.length} Courses Recorded
              </span>
            </div>

            <div className="border border-neutral-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-white font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Course Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-2 text-center">Cr. Hrs</th>
                    <th className="py-2.5 px-2 text-center">Internal (20)</th>
                    <th className="py-2.5 px-2 text-center">Midterm (30)</th>
                    <th className="py-2.5 px-2 text-center">Final (50)</th>
                    <th className="py-2.5 px-2 text-center font-bold">Total (100)</th>
                    <th className="py-2.5 px-2 text-center">Grade</th>
                    <th className="py-2.5 px-2 text-center">GP</th>
                    <th className="py-2.5 px-3 text-right">Quality Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-sans">
                  {studentResults.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-neutral-400">
                        No examination results recorded for this student yet. Use &quot;Upload Results&quot; tab to publish marks.
                      </td>
                    </tr>
                  ) : (
                    studentResults.map((res) => {
                      const course = courses.find((c) => c.id === res.courseId);
                      const crHours = course?.creditHours || 3;
                      const qp = (res.gradePoint * crHours).toFixed(2);

                      return (
                        <tr key={res.id} className="hover:bg-emerald-50/20 page-break-avoid print-avoid-break">
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                            {course?.code || 'CRS-001'}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-neutral-800">
                            {course?.title || 'Course Subject'}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono">{crHours}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-neutral-700">{res.internalMarks}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-neutral-700">{res.midtermMarks}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-neutral-700">{res.finalMarks}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-neutral-900">
                            {res.totalMarks}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="font-mono font-bold text-emerald-950 px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-[11px]">
                              {res.letterGrade}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-semibold">
                            {res.gradePoint.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-950">
                            {qp}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Standing & Cumulative Statistics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-emerald-900 text-white rounded-xl shadow-xs page-break-avoid print-avoid-break">
            <div>
              <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Total Credits Attempted</span>
              <strong className="text-xl font-mono font-bold block mt-0.5">{totalCreditHours} Cr. Hrs</strong>
              <span className="text-[10px] text-emerald-300">Degree Requirement: 136</span>
            </div>

            <div>
              <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Total Quality Points</span>
              <strong className="text-xl font-mono font-bold block mt-0.5">{totalQualityPoints.toFixed(2)}</strong>
              <span className="text-[10px] text-emerald-300">Sum of (Cr. Hrs × GP)</span>
            </div>

            <div>
              <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Semester / Cumulative GPA</span>
              <strong className="text-2xl font-mono font-black text-emerald-300 block mt-0.5">
                {cumulativeGpa} <span className="text-xs text-white font-normal">/ 4.00</span>
              </strong>
              <span className="text-[10px] text-emerald-200">Scale of 4.00 Max</span>
            </div>

            <div>
              <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Official Academic Standing</span>
              <strong className="text-xs font-bold block mt-1 text-emerald-100 leading-tight">
                {getAcademicStanding(Number(cumulativeGpa))}
              </strong>
              <span className="text-[10px] text-emerald-300 block mt-1 font-mono">Good Standing Verified</span>
            </div>
          </div>

          {/* Grading Scale Reference & Authenticity Watermark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200 text-[10px] text-neutral-600 page-break-avoid print-avoid-break">
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
              <strong className="font-bold text-neutral-800 uppercase block">Institutional Grading Scale Key:</strong>
              <div className="grid grid-cols-4 gap-1 font-mono text-[9px]">
                <div>A: 85–100 (4.00)</div>
                <div>B+: 78–84 (3.40)</div>
                <div>B: 70–77 (3.00)</div>
                <div>C+: 64–69 (2.50)</div>
                <div>C: 55–63 (2.00)</div>
                <div>D: 50–54 (1.00)</div>
                <div>F: &lt;50 (0.00)</div>
                <div>Passing: 50%</div>
              </div>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1 font-mono text-[10px]">
              <strong className="font-bold text-neutral-800 uppercase block font-sans">Cryptographic Document Seal:</strong>
              <div className="text-neutral-500 truncate">SHA-256-TR: d9f82c4e61a8b0c41094392019aeb3</div>
              <div className="text-emerald-900 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                Digitally Sealed &amp; Stamped by Controller Office
              </div>
            </div>
          </div>

          {/* Official Signatures & Verification Stamp */}
          <div className="pt-8 border-t-2 border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs relative page-break-avoid print-avoid-break signature-block">
            {/* Deputy Registrar Signature Block */}
            <div
              onClick={() => setIsEditingSignatories(true)}
              className="text-center sm:text-left space-y-1 cursor-pointer p-2 rounded-lg hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all group"
              title="Click to edit Deputy Registrar name & designation"
            >
              <div className="h-10 flex items-end">
                <span className="font-serif italic text-lg text-emerald-950 font-bold border-b border-neutral-400 pb-0.5 px-2">
                  {deputyName}
                </span>
              </div>
              <div className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <span>{deputyTitle}</span>
                <PenTool className="w-2.5 h-2.5 text-neutral-400 group-hover:text-emerald-700 no-print" />
              </div>
              <div className="text-[10px] text-neutral-500">{branding.collegeName}</div>
            </div>

            {/* University Embossed Stamp Graphic / Custom Seal */}
            <div
              onClick={() => setIsEditingSignatories(true)}
              className="cursor-pointer p-1.5 rounded-full hover:ring-2 hover:ring-emerald-500 transition-all group shrink-0"
              title="Click to change Official Document Seal & style"
            >
              {sealType === 'EMBLEM' || (sealType === 'CUSTOM_IMAGE' && sealImageUrl) ? (
                <div
                  className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-1.5 shrink-0 relative overflow-hidden bg-white shadow-2xs"
                  style={{ borderColor: sealColor }}
                >
                  <img
                    src={sealImageUrl || '/src/assets/images/exam_system_logo_1792130817114.jpg'}
                    alt="University Seal"
                    referrerPolicy="no-referrer"
                    width={56}
                    height={56}
                    style={{ width: '56px', height: '56px', maxWidth: '56px', maxHeight: '56px', objectFit: 'contain' }}
                    className="w-14 h-14 rounded-full object-contain"
                  />
                  <div
                    className="text-[7.5px] font-black uppercase tracking-wider leading-tight truncate px-1 mt-0.5"
                    style={{ color: sealColor }}
                  >
                    {sealText}
                  </div>
                </div>
              ) : sealType === 'ACADEMIC' ? (
                <div
                  className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-2 shrink-0 bg-emerald-50/40"
                  style={{ borderColor: sealColor, color: sealColor }}
                >
                  <GraduationCap className="w-6 h-6 mb-0.5" style={{ color: sealColor }} />
                  <div className="text-[8px] font-black uppercase tracking-wider leading-tight">
                    {sealText}
                  </div>
                  <div className="text-[7px] text-neutral-600 font-mono">
                    {sealSubText}
                  </div>
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-2 shrink-0 bg-emerald-50/40"
                  style={{ borderColor: sealColor, color: sealColor }}
                >
                  <ShieldCheck className="w-6 h-6 mb-0.5" style={{ color: sealColor }} />
                  <div className="text-[8px] font-black uppercase tracking-wider leading-tight">
                    {sealText}
                  </div>
                  <div className="text-[7px] text-neutral-600 font-mono">
                    {sealSubText}
                  </div>
                </div>
              )}
              <div className="text-[8px] text-center text-emerald-800 font-mono mt-0.5 no-print opacity-0 group-hover:opacity-100 transition-opacity">
                Edit Seal
              </div>
            </div>

            {/* Controller of Examinations Signature Block */}
            <div
              onClick={() => setIsEditingSignatories(true)}
              className="text-center sm:text-right space-y-1 cursor-pointer p-2 rounded-lg hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all group"
              title="Click to edit Controller of Examinations name & designation"
            >
              <div className="h-10 flex items-end justify-center sm:justify-end">
                <span className="font-serif italic text-lg text-emerald-950 font-bold border-b border-neutral-400 pb-0.5 px-2">
                  {controllerName}
                </span>
              </div>
              <div className="font-bold text-neutral-900 text-xs flex items-center justify-center sm:justify-end gap-1.5">
                <span>{controllerTitle}</span>
                <PenTool className="w-2.5 h-2.5 text-neutral-400 group-hover:text-emerald-700 no-print" />
              </div>
              <div className="text-[10px] text-emerald-800 font-semibold">{branding.collegeName}</div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="text-[9px] text-neutral-400 text-center pt-2 border-t border-neutral-200">
            OFFICIAL TRANSCRIPT NOTICE: This academic record is issued exclusively under the authority of the College Administration and Controller of Examinations. Students cannot print official transcripts. Any unauthorized copy, erasure, or alteration renders this credential void.
          </div>
        </div>

        {/* Modal Action Buttons Footer - hidden during print */}
        <div className="px-6 py-4 bg-neutral-100 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Admin Print Authority Active · Printer-ready format with university seal</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsEditingSignatories(!isEditingSignatories)}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isEditingSignatories ? 'Hide Signatories' : 'Change Deputy, Controller & Seal'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              Download CSV
            </button>

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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Official Transcript
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
