'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import { ExamResult } from '@/types/exam-system';
import { calculateGrade } from '@/lib/exam-storage';
import {
  X,
  Check,
  GraduationCap,
  Calculator,
  User,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

interface AddEditResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialResult?: ExamResult | null;
  defaultCourseId?: string;
  defaultStudentId?: string;
}

export function AddEditResultModal({
  isOpen,
  onClose,
  initialResult,
  defaultCourseId,
  defaultStudentId,
}: AddEditResultModalProps) {
  if (!isOpen) return null;

  return (
    <AddEditResultForm
      key={initialResult ? initialResult.id : `${defaultCourseId || ''}-${defaultStudentId || ''}-new`}
      initialResult={initialResult}
      defaultCourseId={defaultCourseId}
      defaultStudentId={defaultStudentId}
      onClose={onClose}
    />
  );
}

interface AddEditResultFormProps {
  initialResult?: ExamResult | null;
  defaultCourseId?: string;
  defaultStudentId?: string;
  onClose: () => void;
}

function AddEditResultForm({
  initialResult,
  defaultCourseId,
  defaultStudentId,
  onClose,
}: AddEditResultFormProps) {
  const {
    courses,
    users,
    departments,
    dateSheet,
    results,
    addOrUpdateExamResult,
  } = useExam();

  const allApprovedStudents = useMemo(() => {
    return users.filter((u) => u.role === 'STUDENT' && u.isApproved);
  }, [users]);

  // Form State initialized directly from props (no useEffect needed)
  const [courseId, setCourseId] = useState<string>(
    initialResult?.courseId || defaultCourseId || courses[0]?.id || 'cs-301'
  );
  const [studentId, setStudentId] = useState<string>(
    initialResult?.studentId || defaultStudentId || allApprovedStudents[0]?.id || 'usr-std-1'
  );
  const [internalMarks, setInternalMarks] = useState<number>(
    initialResult?.internalMarks ?? 18
  );
  const [midtermMarks, setMidtermMarks] = useState<number>(
    initialResult?.midtermMarks ?? 26
  );
  const [finalMarks, setFinalMarks] = useState<number>(
    initialResult?.finalMarks ?? 44
  );
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Auto-fill existing result marks if student & course already have a record
  const existingRecord = useMemo(() => {
    if (!courseId || !studentId) return null;
    return results.find((r) => r.courseId === courseId && r.studentId === studentId);
  }, [results, courseId, studentId]);

  // Live Calculations
  const total = Number(internalMarks || 0) + Number(midtermMarks || 0) + Number(finalMarks || 0);
  const { letterGrade, gradePoint } = calculateGrade(total);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const selectedStudent = users.find((u) => u.id === studentId);
  const studentDept = departments.find((d) => d.id === selectedStudent?.departmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!courseId) {
      setErrorMsg('Please select a course.');
      return;
    }
    if (!studentId) {
      setErrorMsg('Please select a student.');
      return;
    }

    if (internalMarks < 0 || internalMarks > 20) {
      setErrorMsg('Internal marks must be between 0 and 20.');
      return;
    }
    if (midtermMarks < 0 || midtermMarks > 30) {
      setErrorMsg('Midterm marks must be between 0 and 30.');
      return;
    }
    if (finalMarks < 0 || finalMarks > 50) {
      setErrorMsg('Final examination marks must be between 0 and 50.');
      return;
    }

    const matchingDateSheet = dateSheet.find((ds) => ds.courseId === courseId);

    addOrUpdateExamResult({
      id: initialResult?.id || existingRecord?.id,
      courseId,
      studentId,
      dateSheetEntryId: matchingDateSheet?.id,
      internalMarks: Number(internalMarks),
      midtermMarks: Number(midtermMarks),
      finalMarks: Number(finalMarks),
    });

    setFeedbackMsg(
      `${initialResult || existingRecord ? 'Updated' : 'Added'} result: ${selectedStudent?.name} - ${selectedCourse?.code} (${total}/100, Grade ${letterGrade}, GP ${gradePoint.toFixed(2)})`
    );

    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleApplyPreset = (intM: number, midM: number, finM: number) => {
    setInternalMarks(intM);
    setMidtermMarks(midM);
    setFinalMarks(finM);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-emerald-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-200 flex items-center justify-between bg-emerald-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                {initialResult || existingRecord ? 'Update Examination Result' : 'Add New Examination Result'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                Enter student assessment breakdown and publish verified marks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-900 rounded-lg flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {existingRecord && !initialResult && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px]">
              Note: An existing result is already on file for this candidate in {selectedCourse?.code}. Submitting will update their scores.
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-neutral-700 font-semibold mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-800" />
              <span>Candidate / Student</span>
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              {allApprovedStudents.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.name} — {std.rollNumber || 'No Roll'} (Sem {std.semester} · {departments.find((d) => d.id === std.departmentId)?.code || 'GEN'})
                </option>
              ))}
            </select>
            {selectedStudent && (
              <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-2">
                <span>Roll: <strong className="font-mono text-neutral-800">{selectedStudent.rollNumber || 'FA26-REG'}</strong></span>
                <span>·</span>
                <span>{studentDept?.name}</span>
                <span>·</span>
                <span>Semester {selectedStudent.semester}</span>
              </div>
            )}
          </div>

          {/* Course Selector */}
          <div>
            <label className="block text-neutral-700 font-semibold mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
              <span>Examination Course</span>
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              {courses.map((crs) => (
                <option key={crs.id} value={crs.id}>
                  {crs.code} — {crs.title} ({crs.creditHours} Cr. Hrs · Sem {crs.semester})
                </option>
              ))}
            </select>
          </div>

          {/* Marks Breakdown Grid */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-neutral-800 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-emerald-800" />
                Score Breakdown (Scale of 100):
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleApplyPreset(19, 28, 46)}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded border border-emerald-200"
                >
                  Grade A (93)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(16, 24, 40)}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 rounded border border-blue-200"
                >
                  Grade B+ (80)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-600 text-[11px] font-medium mb-1">
                  Internal (Max 20)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={internalMarks}
                  onChange={(e) => setInternalMarks(Number(e.target.value))}
                  required
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold text-center border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-neutral-600 text-[11px] font-medium mb-1">
                  Midterm (Max 30)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={midtermMarks}
                  onChange={(e) => setMidtermMarks(Number(e.target.value))}
                  required
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold text-center border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-neutral-600 text-[11px] font-medium mb-1">
                  Final Exam (Max 50)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={finalMarks}
                  onChange={(e) => setFinalMarks(Number(e.target.value))}
                  required
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold text-center border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Computed Grade Preview Strip */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Total Aggregate Score</span>
              <div className="text-xl font-black font-mono text-emerald-950 mt-0.5">
                {total} <span className="text-xs text-neutral-500 font-normal">/ 100 Marks</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Letter Grade</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded font-mono font-bold text-sm bg-emerald-800 text-white shadow-2xs">
                  {letterGrade}
                </span>
              </div>

              <div className="text-right pl-3 border-l border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Grade Point</span>
                <span className="text-lg font-black font-mono text-neutral-900 mt-0.5 block">
                  {gradePoint.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {initialResult || existingRecord ? 'Save & Update Result' : 'Publish Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
