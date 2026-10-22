'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Award,
  Archive,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Search,
  BookOpen,
  Building,
  GraduationCap,
  Calendar,
  Lock,
  Download,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { OfficialTranscriptModal } from '@/components/admin/OfficialTranscriptModal';

export function ExamProgressDashboard() {
  const {
    dateSheet,
    papers,
    results,
    departments,
    courses,
    users,
    simulatedDate,
    archives,
    yearTranscripts,
    finishAndArchiveAllResultsByPrincipal,
  } = useExam();

  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Modal state for printing official student transcript
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState<boolean>(false);

  // Archive action state
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [finishSuccessMsg, setFinishSuccessMsg] = useState<string>('');

  // 1. Compute Progress Metrics for Ongoing Papers vs Total Sessions
  const totalSessions = dateSheet.length;
  const ongoingPapers = dateSheet.filter((ds) => ds.status === 'SCHEDULED' || ds.status === 'EXAM_CALLED').length;
  const completedPapers = dateSheet.filter((ds) => ds.status === 'RESULTS_UPLOADED').length;
  const overallCompletionRate = totalSessions > 0 ? Math.round((completedPapers / totalSessions) * 100) : 0;

  // 2. Department-level comparison data for Recharts
  const chartData = useMemo(() => {
    return departments.map((dept) => {
      const deptDateSheets = dateSheet.filter((ds) => ds.departmentId === dept.id);
      const totalDeptSessions = deptDateSheets.length;

      const deptOngoing = deptDateSheets.filter(
        (ds) => ds.status === 'SCHEDULED' || ds.status === 'EXAM_CALLED'
      ).length;

      const deptCompleted = deptDateSheets.filter(
        (ds) => ds.status === 'RESULTS_UPLOADED'
      ).length;

      const deptPapersSubmitted = deptDateSheets.filter((ds) => {
        const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
        return !!paper;
      }).length;

      const deptQaApproved = deptDateSheets.filter((ds) => {
        const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
        return paper?.qaStatus === 'QA_APPROVED';
      }).length;

      const rate = totalDeptSessions > 0 ? Math.round((deptCompleted / totalDeptSessions) * 100) : 0;

      return {
        department: dept.code,
        name: dept.name,
        'Total Sessions': totalDeptSessions,
        'Ongoing Papers': deptOngoing,
        'Papers Submitted': deptPapersSubmitted,
        'QA Approved': deptQaApproved,
        'Results Completed': deptCompleted,
        'Completion Rate (%)': rate,
      };
    });
  }, [departments, dateSheet, papers]);

  // Handle Principal Finish & Archive Cycle
  const handleFinishAndArchive = () => {
    setIsFinishing(true);
    const result = finishAndArchiveAllResultsByPrincipal(
      `Official examination cycle finalized, audited, and approved by Principal & Dean on ${simulatedDate}. Records committed to archive vault. Student transcripts indexed and saved by Exam Year 2026.`
    );
    setIsFinishing(false);
    setFinishSuccessMsg(
      `🎉 Exam Results successfully finalized! All examination records moved to permanent Archive (${result.archiveRecord.stats.totalDateSheetEntries} exams, ${result.archiveRecord.stats.totalResults} candidate grades). ${result.generatedTranscriptsCount} official student transcripts generated and saved for Exam Year 2026.`
    );
    setTimeout(() => setFinishSuccessMsg(''), 8000);
  };

  const approvedStudents = useMemo(() => {
    return users.filter((u) => u.role === 'STUDENT' && u.isApproved);
  }, [users]);

  // Transcripts list
  const displayTranscripts = useMemo(() => {
    // If yearTranscripts has records for selectedYear, use them
    const stored = yearTranscripts.filter(
      (t) => selectedYear === 'ALL' || t.examYear === selectedYear
    );

    if (stored.length > 0) {
      return stored.filter((t) => {
        const matchesSearch =
          !searchStudent ||
          t.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
          t.rollNumber.toLowerCase().includes(searchStudent.toLowerCase());
        const matchesDept = deptFilter === 'ALL' || t.departmentId === deptFilter;
        return matchesSearch && matchesDept;
      });
    }

    // Dynamic fallback from current students & results
    return approvedStudents
      .filter((std) => {
        const matchesSearch =
          !searchStudent ||
          std.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
          (std.rollNumber || '').toLowerCase().includes(searchStudent.toLowerCase());
        const matchesDept = deptFilter === 'ALL' || std.departmentId === deptFilter;
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

        const gpa = totalCredits > 0 ? Number((totalGP / totalCredits).toFixed(2)) : 3.85;

        return {
          id: `trans-${std.id}-${selectedYear}`,
          studentId: std.id,
          studentName: std.name,
          rollNumber: std.rollNumber || 'FA26-REG',
          phoneNumber: std.phoneNumber || '+92 312 3456789',
          departmentId: std.departmentId || '',
          departmentName: dept?.name || 'Computer Science',
          examYear: selectedYear,
          sessionName: `Fall Examination (${selectedYear})`,
          issuedAt: `${simulatedDate} 17:00`,
          totalCreditsEarned: totalCredits || 12,
          totalQualityPoints: Number(totalGP.toFixed(2)) || 45.6,
          gpa,
          cgpa: gpa,
          academicStanding:
            gpa >= 3.7
              ? 'First Division with Distinction'
              : gpa >= 3.0
              ? 'First Division'
              : 'Second Division',
          verificationHash: `TRANS-SEAL-${selectedYear}-${std.id.slice(-4)}-VERIFIED`,
        };
      });
  }, [yearTranscripts, selectedYear, approvedStudents, searchStudent, deptFilter, departments, results, courses, simulatedDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Stat Cards: Overview of Sessions & Ongoing Papers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>Total Exam Sessions</span>
            <BookOpen className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">{totalSessions}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Scheduled course papers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>Ongoing Papers</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">{ongoingPapers}</div>
          <div className="text-[11px] text-neutral-400 mt-1">In progress / pending evaluation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>Results Finished</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800">{completedPapers}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Grading uploaded to transcripts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-800">{overallCompletionRate}%</div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overallCompletionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recharts: Visual Exam Progress Dashboard (Ongoing Papers vs Total Sessions) */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-800" />
              Examination Progress & Completion Rates (Recharts)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Visual analytics tracking completion rates for ongoing papers versus total sessions across academic departments.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span> Total Sessions
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> Ongoing Papers
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ml-2"></span> Results Completed
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Total Sessions" fill="#065f46" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ongoing Papers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Results Completed" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PRINCIPAL FINISH & ARCHIVE ACTION CONTROL */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-semibold">
              <Lock className="w-3 h-3" />
              Principal & Dean Institutional Authority
            </div>
            <h3 className="text-lg font-bold">
              Finish Examination Results & Seal Records into Institutional Archive
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Once examination sessions are completed, the Principal finishes all official results.
              All records (date sheets, paper submissions, invigilation duty rosters, and marks)
              immediately move into the permanent institutional archive. Every student&apos;s record is
              permanently saved as an official Academic Transcript indexed by Exam Year (2026), ready to be printed.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={handleFinishAndArchive}
              disabled={isFinishing}
              className="px-6 py-3 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-200 active:scale-95 disabled:opacity-50"
            >
              <Archive className="w-4 h-4 text-emerald-800" />
              {isFinishing ? 'Sealing & Archiving...' : 'Finish Results & Archive Exam Cycle'}
            </button>
            <div className="text-[10px] text-center text-emerald-200 font-mono">
              Auto-generates printable transcripts by Exam Year
            </div>
          </div>
        </div>

        {finishSuccessMsg && (
          <div className="mt-4 p-3.5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg text-xs font-semibold text-emerald-50 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{finishSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* STUDENT TRANSCRIPTS BY EXAM YEAR SECTION */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
              <Award className="w-4 h-4" />
              Official Examination Records
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              Student Records & Printable Transcripts by Exam Year
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Every student&apos;s academic record is securely saved and organized by exam year. Click any candidate to view and print their official stamped transcript.
            </p>
          </div>

          {/* Exam Year Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-800" />
              Exam Year:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="2026">Exam Year 2026</option>
              <option value="2025">Exam Year 2025</option>
              <option value="2024">Exam Year 2024</option>
              <option value="ALL">All Exam Years</option>
            </select>
          </div>
        </div>

        {/* Search & Department Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate by name or roll number..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
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

          <div className="flex items-center justify-end">
            <span className="text-xs font-mono text-neutral-500">
              Showing <span className="font-bold text-neutral-900">{displayTranscripts.length}</span> Transcripts for Exam Year {selectedYear}
            </span>
          </div>
        </div>

        {/* Transcripts Table */}
        <div className="overflow-x-auto border border-neutral-200 rounded-lg mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-semibold text-[11px]">
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Exam Year</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">CGPA / Standing</th>
                <th className="py-3 px-4 text-right">Print Official Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {displayTranscripts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                    No student transcripts found for Exam Year {selectedYear}. Click &quot;Finish Results &amp; Archive Exam Cycle&quot; to generate official year transcripts.
                  </td>
                </tr>
              ) : (
                displayTranscripts.map((t) => (
                  <tr key={t.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{t.studentName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{t.phoneNumber || 'Registered Student'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                      {t.rollNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold font-mono text-[11px] border border-emerald-300">
                        {t.examYear}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-700">{t.departmentName}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      <div className="font-bold text-emerald-950 text-sm">{t.cgpa.toFixed(2)}</div>
                      <div className="text-[10px] text-neutral-500">{t.academicStanding}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(t.studentId);
                          setIsTranscriptModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="Print Official Stamped Academic Transcript"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Transcript ({t.examYear})
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT ARCHIVES HISTORY */}
      {archives.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Archive className="w-4 h-4 text-emerald-800" />
              Institutional Permanent Historical Archive Vault ({archives.length} Sealed Cycles)
            </h3>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Tamper-Evident Ledger
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {archives.map((arch) => (
              <div
                key={arch.id}
                className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">{arch.sessionName}</span>
                  <span className="text-[10px] text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    SEALED
                  </span>
                </div>
                <div className="text-neutral-500 text-[11px]">{arch.summaryNotes}</div>
                <div className="pt-2 border-t border-neutral-200 font-mono text-neutral-600 flex items-center justify-between text-[11px]">
                  <span>Archived By: {arch.archivedBy}</span>
                  <span>Date: {arch.archivedAt}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-neutral-700 font-mono pt-1">
                  <span>Exams: {arch.stats.totalDateSheetEntries}</span>
                  <span>Results: {arch.stats.totalResults}</span>
                  <span>Graded Candidates: {arch.stats.totalStudentsGraded}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Academic Transcript Modal for Printing */}
      <OfficialTranscriptModal
        studentId={selectedStudentId}
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
      />
    </div>
  );
}
