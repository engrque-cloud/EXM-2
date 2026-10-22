'use client';

import React, { useState } from 'react';
import { useExam } from '@/lib/exam-context';
import { PaperSubmission } from '@/types/exam-system';
import { computeDaysDifference } from '@/lib/exam-storage';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Search,
  ExternalLink,
  Check,
  X,
  Eye,
  Download,
} from 'lucide-react';
import { GlobalSearchToolbar } from '@/components/GlobalSearchToolbar';

export function QADashboard() {
  const {
    simulatedDate,
    papers,
    dateSheet,
    courses,
    users,
    reviewPaper,
    dutyRoster,
    branding,
  } = useExam();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNDER_QA_REVIEW' | 'QA_APPROVED' | 'QA_REJECTED'>('ALL');
  const [selectedPaper, setSelectedPaper] = useState<PaperSubmission | null>(null);
  const [auditNotes, setAuditNotes] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(true);

  // Compute metrics
  const pendingCount = papers.filter((p) => p.qaStatus === 'UNDER_QA_REVIEW').length;
  const approvedCount = papers.filter((p) => p.qaStatus === 'QA_APPROVED').length;
  const rejectedCount = papers.filter((p) => p.qaStatus === 'QA_REJECTED').length;

  const filteredPapers = papers.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.qaStatus === filterStatus;
  });

  const handleOpenAuditModal = (paper: PaperSubmission) => {
    setSelectedPaper(paper);
    setAuditNotes(paper.qaNotes || '');
  };

  const handleApprove = () => {
    if (!selectedPaper) return;
    const finalNotes = auditNotes.trim() || 'Question paper accepted and approved by QA.';
    reviewPaper(selectedPaper.id, 'QA_APPROVED', finalNotes);
    setActionSuccessMessage(`Question paper for ${courses.find((c) => c.id === selectedPaper.courseId)?.code} ACCEPTED.`);
    setSelectedPaper(null);
    setTimeout(() => setActionSuccessMessage(''), 4000);
  };

  const handleReject = () => {
    if (!selectedPaper) return;
    const finalNotes = auditNotes.trim() || 'Paper rejected. Please address remarks and re-upload revised PDF.';
    reviewPaper(selectedPaper.id, 'QA_REJECTED', finalNotes);
    setActionSuccessMessage(`Question paper for ${courses.find((c) => c.id === selectedPaper.courseId)?.code} REJECTED.`);
    setSelectedPaper(null);
    setTimeout(() => setActionSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium mb-1">
              <span>{branding.collegeName}</span>
              <span aria-hidden="true">·</span>
              <span>Examination Rigor & Quality Cell</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              QA Question Paper Audit & Rigor Desk
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Audit submitted question papers for syllabus coverage, Bloom&apos;s cognitive taxonomy balance, and formatting. Approving a paper automatically confirms the teacher&apos;s invigilation duty on the Duty Roster.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg">
            <div className="text-xs text-amber-800 font-medium">Pending QA Audit</div>
            <div className="text-2xl font-bold font-mono text-amber-900 mt-0.5">{pendingCount}</div>
            <div className="text-[11px] text-amber-700 mt-0.5">Awaiting quality assessment</div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg">
            <div className="text-xs text-emerald-800 font-medium">Approved & Confirmed</div>
            <div className="text-2xl font-bold font-mono text-emerald-900 mt-0.5">{approvedCount}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Duty locked into Duty Roster</div>
          </div>

          <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-lg">
            <div className="text-xs text-red-800 font-medium">Revisions Requested</div>
            <div className="text-2xl font-bold font-mono text-red-900 mt-0.5">{rejectedCount}</div>
            <div className="text-[11px] text-red-700 mt-0.5">Sent back to faculty for edits</div>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <div className="text-xs text-neutral-600 font-medium">Total Papers Tracked</div>
            <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">{papers.length}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Across all semesters & sessions</div>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {actionSuccessMessage}
        </div>
      )}

      {/* QA Global Search & Filtering Toolbar */}
      <GlobalSearchToolbar
        context="QA"
        onSelectEntity={(type, id) => {
          if (type === 'PAPER') {
            const matched = papers.find((p) => p.id === id);
            if (matched) {
              handleOpenAuditModal(matched);
            }
          }
        }}
      />

      {/* Filter Strip */}
      <div className="bg-white rounded-xl border border-emerald-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1 p-1 bg-emerald-50 rounded-lg text-xs">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                : 'text-emerald-950 hover:text-emerald-900'
            }`}
          >
            All Papers ({papers.length})
          </button>
          <button
            onClick={() => setFilterStatus('UNDER_QA_REVIEW')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterStatus === 'UNDER_QA_REVIEW'
                ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                : 'text-emerald-950 hover:text-emerald-900'
            }`}
          >
            Pending Audit ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('QA_APPROVED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterStatus === 'QA_APPROVED'
                ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                : 'text-emerald-950 hover:text-emerald-900'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilterStatus('QA_REJECTED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterStatus === 'QA_REJECTED'
                ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                : 'text-emerald-950 hover:text-emerald-900'
            }`}
          >
            Revisions ({rejectedCount})
          </button>
        </div>

        <div className="text-xs text-neutral-500 font-mono">
          Simulated Clock: {simulatedDate}
        </div>
      </div>

      {/* Papers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-medium">
                <th className="py-3 px-4">Course / Paper</th>
                <th className="py-3 px-4">Subject Examiner</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Exam Date & Window</th>
                <th className="py-3 px-4">Uploaded PDF Paper</th>
                <th className="py-3 px-4">QA Status</th>
                <th className="py-3 px-4">Duty Confirmation</th>
                <th className="py-3 px-4">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPapers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    No papers in this status category.
                  </td>
                </tr>
              ) : (
                filteredPapers.map((paper) => {
                  const course = courses.find((c) => c.id === paper.courseId);
                  const teacher = users.find((u) => u.id === paper.teacherId);
                  const ds = dateSheet.find((d) => d.id === paper.dateSheetEntryId);
                  const daysLeft = ds ? computeDaysDifference(ds.examDate, simulatedDate) : 0;
                  const isDutyConfirmed = ds?.dutyConfirmed;

                  return (
                    <tr key={paper.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900 font-mono">
                          {course?.code}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                          {course?.title}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-800">
                        <div className="font-medium">{teacher?.name}</div>
                        <div className="text-[10px] text-neutral-400">{teacher?.designation || 'Faculty'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-700">
                        {paper.submittedAt}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-medium text-neutral-900">{ds?.examDate}</div>
                        <div className="text-[11px] text-neutral-500">
                          {daysLeft < 0 ? 'Conducted' : `${daysLeft} days remaining`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                            PDF
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-neutral-900 text-xs truncate" title={paper.fileAttachmentName}>
                              {paper.fileAttachmentName}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono">
                              {paper.fileSizeMb || '1.6 MB'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {paper.qaStatus === 'UNDER_QA_REVIEW' && (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                            Under QA Review
                          </span>
                        )}
                        {paper.qaStatus === 'QA_APPROVED' && (
                          <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                            QA Approved
                          </span>
                        )}
                        {paper.qaStatus === 'QA_REJECTED' && (
                          <span className="text-red-800 bg-red-50 px-2 py-0.5 rounded font-semibold border border-red-200">
                            Revision Required
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isDutyConfirmed ? (
                          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Confirmed in Duty Roster
                          </div>
                        ) : (
                          <div className="text-xs text-neutral-400">
                            Locked on Approval
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleOpenAuditModal(paper)}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
                        >
                          Audit Paper
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paper Audit Drawer / Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    QA Academic Rigor Audit Deck
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Verify compliance with curriculum standards and confirm invigilation duty.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaper(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Course & Teacher Details */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-base font-bold text-neutral-900 block">
                      {courses.find((c) => c.id === selectedPaper.courseId)?.code} · {courses.find((c) => c.id === selectedPaper.courseId)?.title}
                    </span>
                    <span className="text-xs text-neutral-500">
                      Subject Examiner: <strong className="text-neutral-800">{users.find((u) => u.id === selectedPaper.teacherId)?.name}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">
                    {selectedPaper.totalMarks || 100} Marks Total
                  </span>
                </div>

                {/* Uploaded PDF Document Card */}
                <div className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      PDF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        {selectedPaper.fileAttachmentName}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                        <span>{selectedPaper.fileSizeMb || '1.6 MB'}</span>
                        <span>·</span>
                        <span className="font-mono">Submitted {selectedPaper.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPdfPreview(!showPdfPreview)}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showPdfPreview ? 'Hide PDF Document' : 'View PDF Document'}
                    </button>
                  </div>
                </div>

                {/* Visible PDF Document Viewer */}
                {showPdfPreview && (
                  <div className="mt-3 bg-white rounded-lg border border-neutral-300 shadow-inner overflow-hidden animate-in fade-in duration-150">
                    <div className="bg-neutral-800 text-white px-3 py-1.5 text-[11px] font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-rose-400" />
                        {selectedPaper.fileAttachmentName} (Official PDF Examination Sheet)
                      </span>
                      <span className="text-[10px] text-neutral-400">Page 1 of 1 · Verified PDF</span>
                    </div>

                    {selectedPaper.pdfDataUrl ? (
                      <iframe
                        src={selectedPaper.pdfDataUrl}
                        className="w-full h-80 border-0 bg-neutral-100"
                        title="Question Paper PDF"
                      />
                    ) : (
                      <div className="p-6 text-neutral-800 font-serif bg-neutral-50/50 space-y-4 max-h-80 overflow-y-auto">
                        <div className="text-center pb-3 border-b border-neutral-300">
                          <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-sans">
                            {branding.collegeName}
                          </div>
                          <div className="text-[11px] text-neutral-600 font-sans">
                            Office of the Controller of Examinations · End-Semester Examination
                          </div>
                          <div className="text-sm font-bold text-neutral-900 mt-2 font-sans">
                            {courses.find((c) => c.id === selectedPaper.courseId)?.code}: {courses.find((c) => c.id === selectedPaper.courseId)?.title}
                          </div>
                          <div className="text-[11px] text-neutral-600 font-sans flex items-center justify-center gap-4 mt-1">
                            <span>Max Marks: {selectedPaper.totalMarks || 100}</span>
                            <span>·</span>
                            <span>Time Allowed: 3 Hours</span>
                            <span>·</span>
                            <span>Passing: 50%</span>
                          </div>
                        </div>

                        <div className="text-[11px] italic text-neutral-600 font-sans border-b border-neutral-200 pb-2">
                          <strong>Instructions:</strong> Answer all questions in Section A. Attempt any three questions from Section B. Section C is compulsory. Calculators and reference tables are permitted.
                        </div>

                        <div className="space-y-3 text-xs leading-relaxed">
                          <div>
                            <div className="font-bold text-neutral-900 font-sans">SECTION A: Core Fundamentals & Theory (20 Marks)</div>
                            <p className="text-[11px] text-neutral-700 mt-0.5">
                              1. Define the fundamental principles governing this curriculum. Formulate the mathematical proof and explain boundary constraints with suitable diagrams. (10 Marks)
                            </p>
                            <p className="text-[11px] text-neutral-700 mt-1">
                              2. Differentiate between classical deterministic paradigms and modern applied stochastic formulations in the context of this domain. (10 Marks)
                            </p>
                          </div>

                          <div>
                            <div className="font-bold text-neutral-900 font-sans">SECTION B: Analytical Problems & Computations (40 Marks)</div>
                            <p className="text-[11px] text-neutral-700 mt-0.5">
                              3. Given an institutional workload matrix with continuous temporal variables, derive the optimal distribution theorem and show numerical convergence. (20 Marks)
                            </p>
                            <p className="text-[11px] text-neutral-700 mt-1">
                              4. Execute a rigorous step-by-step case simulation evaluating systemic efficiency and error-propagation bounds. (20 Marks)
                            </p>
                          </div>

                          <div>
                            <div className="font-bold text-neutral-900 font-sans">SECTION C: Comprehensive System Design (40 Marks)</div>
                            <p className="text-[11px] text-neutral-700 mt-0.5">
                              5. Synthesize an enterprise-scale solution addressing real-world edge conditions, auditing compliance, and resilience metrics. (40 Marks)
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-neutral-300 flex items-center justify-between text-[10px] text-neutral-500 font-sans">
                          <span>Paper Set by: {users.find((u) => u.id === selectedPaper.teacherId)?.name}</span>
                          <span className="font-bold text-emerald-800">*** END OF EXAMINATION QUESTION PAPER ***</span>
                          <span>Official Seal Applied</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pure Review Text Box */}
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  QA Evaluation Remarks & Review Notes (Text Box)
                </label>
                <textarea
                  rows={4}
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Enter remarks, approval justification, or required revisions for the course teacher..."
                  className="w-full p-3 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-normal bg-white"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Your remarks will be recorded in the official audit ledger and sent to the faculty member.
                </span>
              </div>

              {/* Status Note */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Accepting locks the teacher&apos;s invigilation duty into the Duty Roster. Rejecting returns the paper for re-upload.
                </span>
              </div>
            </div>

            {/* Modal Footer Actions: Accept and Reject */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between sticky bottom-0">
              <button
                onClick={() => setSelectedPaper(null)}
                className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleReject}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Paper
                </button>
                <button
                  onClick={handleApprove}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Paper
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
