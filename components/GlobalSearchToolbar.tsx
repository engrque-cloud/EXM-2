'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import {
  Search,
  X,
  Filter,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  ChevronDown,
} from 'lucide-react';

interface GlobalSearchToolbarProps {
  context?: 'ADMIN' | 'QA';
  onSelectEntity?: (type: 'STUDENT' | 'TEACHER' | 'PAPER' | 'SCHEDULE', id: string) => void;
  className?: string;
}

export function GlobalSearchToolbar({ context = 'ADMIN', onSelectEntity, className = '' }: GlobalSearchToolbarProps) {
  const { users, courses, dateSheet, papers, departments, simulatedDate } = useExam();

  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'PAPER' | 'SCHEDULE'>('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [isOpenResults, setIsOpenResults] = useState(false);

  // Search Results Compilation
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && selectedDept === 'ALL' && !selectedDate && selectedType === 'ALL') {
      return { students: [], teachers: [], papers: [], schedules: [], totalMatches: 0 };
    }

    // Filter Students
    let matchedStudents = users.filter((u) => u.role === 'STUDENT');
    if (selectedDept !== 'ALL') {
      matchedStudents = matchedStudents.filter((s) => s.departmentId === selectedDept);
    }
    if (q) {
      matchedStudents = matchedStudents.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q))
      );
    }

    // Filter Teachers
    let matchedTeachers = users.filter((u) => u.role === 'TEACHER');
    if (selectedDept !== 'ALL') {
      matchedTeachers = matchedTeachers.filter((t) => t.departmentId === selectedDept);
    }
    if (q) {
      matchedTeachers = matchedTeachers.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          (t.designation && t.designation.toLowerCase().includes(q))
      );
    }

    // Filter Papers
    let matchedPapers = papers.map((p) => {
      const course = courses.find((c) => c.id === p.courseId);
      const teacher = users.find((u) => u.id === p.teacherId);
      const ds = dateSheet.find((d) => d.id === p.dateSheetEntryId);
      return { paper: p, course, teacher, ds };
    });

    if (selectedDept !== 'ALL') {
      matchedPapers = matchedPapers.filter((item) => item.course?.departmentId === selectedDept);
    }
    if (selectedDate) {
      matchedPapers = matchedPapers.filter((item) => item.ds?.examDate === selectedDate);
    }
    if (q) {
      matchedPapers = matchedPapers.filter(
        (item) =>
          item.paper.id.toLowerCase().includes(q) ||
          item.paper.fileAttachmentName.toLowerCase().includes(q) ||
          item.course?.code.toLowerCase().includes(q) ||
          item.course?.title.toLowerCase().includes(q) ||
          item.teacher?.name.toLowerCase().includes(q) ||
          item.paper.qaStatus.toLowerCase().includes(q)
      );
    }

    // Filter Schedules / Date Sheet
    let matchedSchedules = dateSheet.map((ds) => {
      const course = courses.find((c) => c.id === ds.courseId);
      const teacher = users.find((u) => u.id === ds.assignedTeacherId);
      return { ds, course, teacher };
    });

    if (selectedDept !== 'ALL') {
      matchedSchedules = matchedSchedules.filter((item) => item.ds.departmentId === selectedDept);
    }
    if (selectedDate) {
      matchedSchedules = matchedSchedules.filter((item) => item.ds.examDate === selectedDate);
    }
    if (q) {
      matchedSchedules = matchedSchedules.filter(
        (item) =>
          item.ds.id.toLowerCase().includes(q) ||
          item.course?.code.toLowerCase().includes(q) ||
          item.course?.title.toLowerCase().includes(q) ||
          item.teacher?.name.toLowerCase().includes(q) ||
          item.ds.hallNumber.toLowerCase().includes(q) ||
          item.ds.examDate.includes(q)
      );
    }

    // Apply entity type isolation
    const finalStudents = selectedType === 'ALL' || selectedType === 'STUDENT' ? matchedStudents : [];
    const finalTeachers = selectedType === 'ALL' || selectedType === 'TEACHER' ? matchedTeachers : [];
    const finalPapers = selectedType === 'ALL' || selectedType === 'PAPER' ? matchedPapers : [];
    const finalSchedules = selectedType === 'ALL' || selectedType === 'SCHEDULE' ? matchedSchedules : [];

    const totalMatches =
      finalStudents.length + finalTeachers.length + finalPapers.length + finalSchedules.length;

    return {
      students: finalStudents,
      teachers: finalTeachers,
      papers: finalPapers,
      schedules: finalSchedules,
      totalMatches,
    };
  }, [query, selectedDept, selectedDate, selectedType, users, courses, dateSheet, papers]);

  const hasActiveFilters = Boolean(query.trim() || selectedDept !== 'ALL' || selectedDate || selectedType !== 'ALL');

  const handleClearAll = () => {
    setQuery('');
    setSelectedDept('ALL');
    setSelectedType('ALL');
    setSelectedDate('');
    setIsOpenResults(false);
  };

  return (
    <div className={`relative bg-white rounded-xl border border-emerald-300 shadow-xs p-3.5 space-y-3 ${className}`}>
      {/* Top Search Input Row with Universal Scope */}
      <div className="flex flex-col md:flex-row md:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-emerald-800" />
          <input
            type="text"
            placeholder={
              context === 'QA'
                ? 'Search question papers by ID, course code, teacher name, or PDF file...'
                : 'Universal Search: Find students by roll no, teachers by name/ID, papers by code, or schedules...'
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpenResults(true);
            }}
            onFocus={() => setIsOpenResults(true)}
            className="w-full pl-9 pr-9 py-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium placeholder:text-neutral-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Department Filter */}
          <div className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setIsOpenResults(true);
              }}
              className="px-2.5 py-1.5 border border-emerald-200 rounded-md bg-emerald-50/50 text-emerald-950 font-semibold focus:ring-1 focus:ring-emerald-700 text-xs"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setIsOpenResults(true);
              }}
              className="px-2 py-1 border border-emerald-200 rounded-md bg-white text-neutral-800 text-xs font-mono focus:ring-1 focus:ring-emerald-700"
              title="Filter by Exam Date"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1.5 text-neutral-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Scope Selector Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-100 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mr-1 shrink-0">
            Scope:
          </span>
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-2.5 py-1 rounded-md transition-colors shrink-0 ${
              selectedType === 'ALL'
                ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100 font-medium'
            }`}
          >
            All Entities
          </button>
          <button
            onClick={() => setSelectedType('PAPER')}
            className={`px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1 ${
              selectedType === 'PAPER'
                ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100 font-medium'
            }`}
          >
            <FileText className="w-3 h-3" />
            Exam Papers ({papers.length})
          </button>
          {context === 'ADMIN' && (
            <>
              <button
                onClick={() => setSelectedType('STUDENT')}
                className={`px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1 ${
                  selectedType === 'STUDENT'
                    ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100 font-medium'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                Students ({users.filter((u) => u.role === 'STUDENT').length})
              </button>
              <button
                onClick={() => setSelectedType('TEACHER')}
                className={`px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1 ${
                  selectedType === 'TEACHER'
                    ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100 font-medium'
                }`}
              >
                <Users className="w-3 h-3" />
                Teachers ({users.filter((u) => u.role === 'TEACHER').length})
              </button>
              <button
                onClick={() => setSelectedType('SCHEDULE')}
                className={`px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1 ${
                  selectedType === 'SCHEDULE'
                    ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100 font-medium'
                }`}
              >
                <Calendar className="w-3 h-3" />
                Schedules ({dateSheet.length})
              </button>
            </>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {searchResults.totalMatches} matches found
            </span>
            <button
              onClick={() => setIsOpenResults(!isOpenResults)}
              className="text-emerald-800 hover:underline font-semibold flex items-center gap-0.5"
            >
              <span>{isOpenResults ? 'Hide Panel' : 'Show Panel'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpenResults ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Floating Interactive Live Results Deck */}
      {hasActiveFilters && isOpenResults && (
        <div className="mt-3 p-4 bg-neutral-50 border border-emerald-200 rounded-xl space-y-4 max-h-[60vh] overflow-y-auto shadow-inner animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-700" />
              Live Search Results ({searchResults.totalMatches} found)
            </span>
            <button
              onClick={() => setIsOpenResults(false)}
              className="text-neutral-400 hover:text-neutral-700 text-xs flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Close
            </button>
          </div>

          {searchResults.totalMatches === 0 ? (
            <div className="py-6 text-center text-neutral-400 text-xs">
              No entities matched your search parameters. Try adjusting keywords, department, or date.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Exam Papers Section */}
              {searchResults.papers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-emerald-700" />
                    Paper Submissions ({searchResults.papers.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {searchResults.papers.map(({ paper, course, teacher, ds }) => (
                      <div
                        key={paper.id}
                        onClick={() => onSelectEntity?.('PAPER', paper.id)}
                        className="p-3 bg-white border border-neutral-200 hover:border-emerald-500 rounded-lg text-xs cursor-pointer hover:shadow-2xs transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-neutral-900">
                            {course?.code} · Sem {course?.semester}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              paper.qaStatus === 'QA_APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : paper.qaStatus === 'UNDER_QA_REVIEW'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {paper.qaStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-600 truncate">{course?.title}</div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100 font-mono">
                          <span>By: {teacher?.name}</span>
                          <span>Exam: {ds?.examDate || 'Scheduled'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Students Section (Admin context) */}
              {searchResults.students.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3 h-3 text-sky-700" />
                    Registered Students ({searchResults.students.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {searchResults.students.map((std) => (
                      <div
                        key={std.id}
                        onClick={() => onSelectEntity?.('STUDENT', std.id)}
                        className="p-3 bg-white border border-neutral-200 hover:border-sky-500 rounded-lg text-xs cursor-pointer hover:shadow-2xs transition-all"
                      >
                        <div className="font-semibold text-neutral-900 truncate">{std.name}</div>
                        <div className="font-mono text-emerald-800 text-[11px] mt-0.5">
                          {std.rollNumber || 'FA26-REG'}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-1 flex items-center justify-between">
                          <span>Semester {std.semester || 1}</span>
                          <span>Dept: {departments.find((d) => d.id === std.departmentId)?.code || 'ENG'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers Section */}
              {searchResults.teachers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-amber-700" />
                    Designated Faculty ({searchResults.teachers.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {searchResults.teachers.map((tch) => (
                      <div
                        key={tch.id}
                        onClick={() => onSelectEntity?.('TEACHER', tch.id)}
                        className="p-3 bg-white border border-neutral-200 hover:border-amber-500 rounded-lg text-xs cursor-pointer hover:shadow-2xs transition-all"
                      >
                        <div className="font-semibold text-neutral-900 truncate">{tch.name}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{tch.designation || 'Lecturer'}</div>
                        <div className="text-[10px] text-emerald-800 font-mono mt-1">
                          {tch.email}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedules Section */}
              {searchResults.schedules.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-purple-700" />
                    Date Sheet Examination Slots ({searchResults.schedules.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {searchResults.schedules.map(({ ds, course, teacher }) => (
                      <div
                        key={ds.id}
                        onClick={() => onSelectEntity?.('SCHEDULE', ds.id)}
                        className="p-3 bg-white border border-neutral-200 hover:border-purple-500 rounded-lg text-xs cursor-pointer hover:shadow-2xs transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-neutral-900">{course?.code}</span>
                          <span className="font-mono text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            {ds.hallNumber}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-600">
                          {ds.examDate} ({ds.startTime})
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          Examiner: {teacher?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
