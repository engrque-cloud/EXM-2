'use client';

import React, { useState } from 'react';
import { useExam } from '@/lib/exam-context';
import { computeDaysDifference } from '@/lib/exam-storage';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  UserCheck,
  Building,
  GraduationCap,
  BarChart2,
  TrendingUp,
  Award,
  Archive,
} from 'lucide-react';
import { DepartmentReadinessWorkloadChart } from './DepartmentReadinessWorkloadChart';
import { DepartmentGradeComparisonChart } from './DepartmentGradeComparisonChart';
import { ExamProgressDashboard } from './ExamProgressDashboard';
import { ActivityFeed } from '@/components/common/ActivityFeed';
import {
  DashboardPrintHeader,
  DashboardPrintFooter,
  DashboardPdfExportButton,
} from '@/components/common/DashboardPdfExport';

export function PrincipalDashboard() {
  const {
    simulatedDate,
    departments,
    courses,
    users,
    dateSheet,
    papers,
    dutyRoster,
    callForExam,
    branding,
  } = useExam();

  const [activeView, setActiveView] = useState<
    'EXAM_PROGRESS' | 'GRADES_BREAKDOWN' | 'READINESS_WORKLOAD' | 'BOTTLENECK' | 'CALENDAR' | 'ACTIVITY_FEED'
  >('EXAM_PROGRESS');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [callSuccessMessage, setCallSuccessMessage] = useState<string>('');

  // Analyze each date sheet paper's bottleneck stage
  const pipelineEntries = dateSheet.map((ds) => {
    const course = courses.find((c) => c.id === ds.courseId);
    const dept = departments.find((d) => d.id === ds.departmentId);
    const teacher = users.find((u) => u.id === ds.assignedTeacherId);
    const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
    const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);

    // Determine exact bottleneck stage
    let stage: 'TEACHER_STUCK' | 'QA_STUCK' | 'APPROVED' | 'READY_FOR_CALL' | 'COMPLETED';

    if (ds.status === 'RESULTS_UPLOADED') {
      stage = 'COMPLETED';
    } else if (ds.status === 'EXAM_CALLED') {
      stage = 'READY_FOR_CALL';
    } else if (paper?.qaStatus === 'QA_APPROVED') {
      // If exam date reached or passed, can call exam
      if (daysLeft <= 0 || daysLeft <= 3) {
        stage = 'READY_FOR_CALL';
      } else {
        stage = 'APPROVED';
      }
    } else if (paper?.qaStatus === 'UNDER_QA_REVIEW') {
      stage = 'QA_STUCK';
    } else {
      // Pending upload or rejected by QA
      stage = 'TEACHER_STUCK';
    }

    return {
      dateSheet: ds,
      course,
      dept,
      teacher,
      paper,
      daysLeft,
      stage,
    };
  }).filter((item) => {
    if (selectedDeptFilter === 'ALL') return true;
    return item.dept?.id === selectedDeptFilter;
  });

  const teacherStuckList = pipelineEntries.filter((e) => e.stage === 'TEACHER_STUCK');
  const qaStuckList = pipelineEntries.filter((e) => e.stage === 'QA_STUCK');
  const approvedList = pipelineEntries.filter((e) => e.stage === 'APPROVED');
  const readyForCallList = pipelineEntries.filter((e) => e.stage === 'READY_FOR_CALL');
  const completedList = pipelineEntries.filter((e) => e.stage === 'COMPLETED');

  const handleCallExam = (dsId: string, courseCode?: string) => {
    callForExam(dsId);
    setCallSuccessMessage(`Principal called exam for ${courseCode || 'Course'}! Teacher grade submission unlocked.`);
    setTimeout(() => setCallSuccessMessage(''), 3000);
  };

  const viewTitleMap: Record<string, string> = {
    EXAM_PROGRESS: 'Examination Progress, Completion Rates & Archive Transcripts',
    GRADES_BREAKDOWN: 'Comparative Grade Breakdown (Recharts)',
    READINESS_WORKLOAD: 'Department Readiness & Faculty Workload',
    BOTTLENECK: 'Visual Examination Pipeline & Bottleneck Audit',
    CALENDAR: 'Institutional Examination Calendar',
    ACTIVITY_FEED: 'System Activity & Audit Event Feed',
  };

  return (
    <div className="space-y-6 print-area">
      {/* Official Institutional Printable Header (Shown ONLY during PDF Export / Print) */}
      <DashboardPrintHeader
        dashboardType="PRINCIPAL"
        currentViewTitle={viewTitleMap[activeView] || activeView}
        departmentFilter={selectedDeptFilter !== 'ALL' ? selectedDeptFilter : undefined}
      />

      {/* Header Banner - hidden in print */}
      <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium mb-1">
              <span>{branding.collegeName}</span>
              <span aria-hidden="true">·</span>
              <span>Office of the Principal</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Principal Executive Dashboard & Pipeline Inspector
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Visually diagnose where papers are held up (at Teacher&apos;s end or QA&apos;s end) and trigger official &quot;Call for Exam&quot; to release grade submissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DashboardPdfExportButton
              viewName={`Principal_${activeView}`}
              reportTitle={viewTitleMap[activeView] || 'Principal Executive Report'}
            />

            <div className="flex flex-wrap items-center gap-1 p-1 bg-emerald-50 rounded-lg text-xs border border-emerald-200/60">
              <button
                onClick={() => setActiveView('EXAM_PROGRESS')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'EXAM_PROGRESS'
                    ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-emerald-950'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                Exam Progress &amp; Archive Transcripts
              </button>
              <button
                onClick={() => setActiveView('GRADES_BREAKDOWN')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'GRADES_BREAKDOWN'
                    ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-emerald-950'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                Comparative Grades
              </button>
              <button
                onClick={() => setActiveView('READINESS_WORKLOAD')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'READINESS_WORKLOAD'
                    ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-emerald-950'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                Readiness & Workload
              </button>
              <button
                onClick={() => setActiveView('BOTTLENECK')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'BOTTLENECK'
                    ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-emerald-950'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Visual Pipeline Check
              </button>
              <button
                onClick={() => setActiveView('CALENDAR')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'CALENDAR'
                    ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-emerald-950'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Institutional Calendar
              </button>
              <button
                onClick={() => setActiveView('ACTIVITY_FEED')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'ACTIVITY_FEED'
                    ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-emerald-950'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                Activity Feed
              </button>
            </div>
          </div>
        </div>

        {/* Executive Health Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div className="p-3 bg-red-50/60 border border-red-100 rounded-lg">
            <div className="text-xs text-red-700 font-medium">Stuck at Teacher End</div>
            <div className="text-2xl font-bold font-mono text-red-800 mt-1">
              {teacherStuckList.length}
            </div>
            <div className="text-[11px] text-red-600 mt-0.5">
              {teacherStuckList.filter((t) => t.daysLeft <= 10).length} in critical 10-day window
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
            <div className="text-xs text-amber-700 font-medium">Stuck at QA Auditor End</div>
            <div className="text-2xl font-bold font-mono text-amber-800 mt-1">
              {qaStuckList.length}
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5">Awaiting quality verification</div>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg">
            <div className="text-xs text-emerald-700 font-medium">QA Approved & Duty Locked</div>
            <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
              {approvedList.length + readyForCallList.length}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Invigilation duty confirmed</div>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
            <div className="text-xs text-blue-700 font-medium">Exam Finished / Called</div>
            <div className="text-2xl font-bold font-mono text-blue-900 mt-1">
              {readyForCallList.length + completedList.length}
            </div>
            <div className="text-[11px] text-blue-600 mt-0.5">
              {completedList.length} results finalized
            </div>
          </div>
        </div>
      </div>

      {callSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {callSuccessMessage}
        </div>
      )}

      {/* VIEW: EXAM PROGRESS & RECHARTS COMPLETION RATES + ARCHIVES AND YEAR TRANSCRIPTS */}
      {activeView === 'EXAM_PROGRESS' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <ExamProgressDashboard />
        </div>
      )}

      {/* VIEW 0: RECHARTS DEPARTMENT GRADE COMPARISON (ENGLISH, MATHEMATICS, COMPUTER SCIENCE) */}
      {activeView === 'GRADES_BREAKDOWN' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <DepartmentGradeComparisonChart />
        </div>
      )}

      {/* VIEW 1: RECHARTS GROUPED BAR CHART: DEPT READINESS & FACULTY WORKLOAD */}
      {activeView === 'READINESS_WORKLOAD' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <DepartmentReadinessWorkloadChart
            onSelectDepartmentFilter={(deptId) => {
              setSelectedDeptFilter(deptId);
              setActiveView('BOTTLENECK');
            }}
          />
        </div>
      )}

      {/* VIEW 2: VISUAL PIPELINE CHECK */}
      {activeView === 'BOTTLENECK' && (
        <div className="space-y-4">
          {/* Quick Bar Chart Link */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 px-4 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-medium flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-700" />
              Viewing paper bottlenecks across departments. Want comparative readiness vs invigilation workload?
            </span>
            <button
              onClick={() => setActiveView('READINESS_WORKLOAD')}
              className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-100 rounded border border-emerald-300 transition-colors flex items-center gap-1 shadow-2xs"
            >
              Open Grouped Bar Chart <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Department Filter Strip */}
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-neutral-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-700">Filter by Department:</span>
              <button
                onClick={() => setSelectedDeptFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedDeptFilter === 'ALL'
                    ? 'bg-neutral-900 text-white font-medium'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                All Departments
              </button>
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeptFilter(d.id)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedDeptFilter === d.id
                      ? 'bg-neutral-900 text-white font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <div className="text-neutral-500 font-mono text-[11px]">
              Simulated Reference Date: {simulatedDate}
            </div>
          </div>

          {/* Kanban Bottleneck Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {/* Column 1: Stuck at Teacher */}
            <div className="bg-white rounded-xl border border-red-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-red-50/70 border-b border-red-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-red-900">1. Stuck at Teacher</h3>
                  <div className="text-[11px] text-red-700">Paper upload pending or rejected</div>
                </div>
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                  {teacherStuckList.length}
                </span>
              </div>

              <div className="p-3 space-y-3 min-h-[300px] max-h-[600px] overflow-y-auto">
                {teacherStuckList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No papers stuck at teacher end
                  </div>
                ) : (
                  teacherStuckList.map((item) => (
                    <div
                      key={item.dateSheet.id}
                      className="p-3 bg-red-50/30 border border-red-200/80 rounded-lg text-xs space-y-2 hover:border-red-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold font-mono text-neutral-900 block">
                            {item.course?.code}
                          </span>
                          <span className="text-[11px] text-neutral-600 line-clamp-1">
                            {item.course?.title}
                          </span>
                        </div>
                        {item.daysLeft <= 10 && item.daysLeft >= 0 ? (
                          <span className="px-1.5 py-0.5 bg-red-600 text-white font-mono font-bold text-[10px] rounded">
                            {item.daysLeft}d left!
                          </span>
                        ) : (
                          <span className="font-mono text-neutral-500 text-[10px]">
                            {item.daysLeft < 0 ? 'Overdue' : `${item.daysLeft}d away`}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-red-100 text-[11px] space-y-1">
                        <div className="text-neutral-700">
                          <span className="text-neutral-400">Teacher:</span> {item.teacher?.name}
                        </div>
                        <div className="text-neutral-500 font-mono text-[10px]">
                          Exam Date: {item.dateSheet.examDate}
                        </div>
                        {item.paper?.qaStatus === 'QA_REJECTED' && (
                          <div className="text-[10px] text-red-700 bg-red-100/70 p-1 rounded">
                            QA Rejected: {item.paper.qaNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Stuck at QA Auditor */}
            <div className="bg-white rounded-xl border border-amber-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-900">2. Stuck at QA End</h3>
                  <div className="text-[11px] text-amber-700">Uploaded, awaiting quality audit</div>
                </div>
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                  {qaStuckList.length}
                </span>
              </div>

              <div className="p-3 space-y-3 min-h-[300px] max-h-[600px] overflow-y-auto">
                {qaStuckList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No papers stuck in QA queue
                  </div>
                ) : (
                  qaStuckList.map((item) => (
                    <div
                      key={item.dateSheet.id}
                      className="p-3 bg-amber-50/30 border border-amber-200/80 rounded-lg text-xs space-y-2 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold font-mono text-neutral-900 block">
                            {item.course?.code}
                          </span>
                          <span className="text-[11px] text-neutral-600 line-clamp-1">
                            {item.course?.title}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-mono font-bold text-[10px] rounded border border-amber-200">
                          In Audit
                        </span>
                      </div>

                      <div className="pt-2 border-t border-amber-100 text-[11px] space-y-1">
                        <div className="text-neutral-700">
                          <span className="text-neutral-400">Submitted by:</span> {item.teacher?.name}
                        </div>
                        <div className="text-neutral-500 font-mono text-[10px]">
                          Uploaded: {item.paper?.submittedAt}
                        </div>
                        <div className="text-[10px] text-amber-800 bg-amber-100/60 p-1 rounded">
                          Auditor: Dr. Victor Morales (Review Pending)
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: QA Approved & Locked */}
            <div className="bg-white rounded-xl border border-emerald-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-emerald-50/70 border-b border-emerald-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-emerald-900">3. Approved & Scheduled</h3>
                  <div className="text-[11px] text-emerald-700">Duty locked, ready for exam day</div>
                </div>
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                  {approvedList.length}
                </span>
              </div>

              <div className="p-3 space-y-3 min-h-[300px] max-h-[600px] overflow-y-auto">
                {approvedList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No approved upcoming papers
                  </div>
                ) : (
                  approvedList.map((item) => (
                    <div
                      key={item.dateSheet.id}
                      className="p-3 bg-emerald-50/20 border border-emerald-200/80 rounded-lg text-xs space-y-2 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold font-mono text-neutral-900 block">
                            {item.course?.code}
                          </span>
                          <span className="text-[11px] text-neutral-600 line-clamp-1">
                            {item.course?.title}
                          </span>
                        </div>
                        <span className="font-mono text-emerald-700 text-[10px] font-bold">
                          {item.daysLeft}d left
                        </span>
                      </div>

                      <div className="pt-2 border-t border-emerald-100 text-[11px] space-y-1">
                        <div className="text-neutral-700">
                          <span className="text-neutral-400">Invigilator:</span> {item.teacher?.name}
                        </div>
                        <div className="text-neutral-500 font-mono text-[10px]">
                          Hall: {item.dateSheet.hallNumber}
                        </div>
                        <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Duty Locked in Roster
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 4: Exam Called & Results (Action Trigger) */}
            <div className="bg-white rounded-xl border border-blue-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-blue-50/70 border-b border-blue-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-blue-900">4. Call for Exam & Results</h3>
                  <div className="text-[11px] text-blue-700">Principal calls exam to unlock grades</div>
                </div>
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                  {readyForCallList.length + completedList.length}
                </span>
              </div>

              <div className="p-3 space-y-3 min-h-[300px] max-h-[600px] overflow-y-auto">
                {readyForCallList.length === 0 && completedList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No exams reached or ready for calling
                  </div>
                ) : (
                  <>
                    {/* Ready to be called by Principal */}
                    {readyForCallList.map((item) => (
                      <div
                        key={item.dateSheet.id}
                        className="p-3 bg-blue-50/40 border border-blue-300 rounded-lg text-xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold font-mono text-neutral-900 block">
                              {item.course?.code}
                            </span>
                            <span className="text-[11px] text-neutral-600 line-clamp-1">
                              {item.course?.title}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 font-mono text-[10px] rounded font-semibold">
                            {item.dateSheet.status === 'EXAM_CALLED' ? 'Exam Called' : 'Exam Ready'}
                          </span>
                        </div>

                        <div className="text-[11px] text-neutral-600">
                          Teacher: <span className="font-medium text-neutral-800">{item.teacher?.name}</span>
                        </div>

                        {item.dateSheet.status !== 'EXAM_CALLED' ? (
                          <button
                            onClick={() => handleCallExam(item.dateSheet.id, item.course?.code)}
                            className="w-full py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <Megaphone className="w-3.5 h-3.5" />
                            Principal: Call for Exam
                          </button>
                        ) : (
                          <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium text-center">
                            Exam Called · Awaiting Teacher Result Upload
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Already Completed */}
                    {completedList.map((item) => (
                      <div
                        key={item.dateSheet.id}
                        className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1.5 opacity-90"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold font-mono text-neutral-900">
                            {item.course?.code}
                          </span>
                          <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Results Published
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {item.course?.title}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          Teacher uploaded official marks & transcripts
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INSTITUTIONAL CALENDAR */}
      {activeView === 'CALENDAR' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">
              Executive Institutional Calendar
            </h3>
            <span className="text-xs font-mono text-neutral-500">
              Reference Time: {simulatedDate}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-medium">
                  <th className="py-3 px-4">Exam Date</th>
                  <th className="py-3 px-4">Course & Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-4">Hall</th>
                  <th className="py-3 px-4">Bottleneck Status</th>
                  <th className="py-3 px-4">Principal Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {dateSheet.map((ds) => {
                  const course = courses.find((c) => c.id === ds.courseId);
                  const dept = departments.find((d) => d.id === ds.departmentId);
                  const teacher = users.find((u) => u.id === ds.assignedTeacherId);
                  const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
                  const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);

                  return (
                    <tr key={ds.id} className="hover:bg-neutral-50/70">
                      <td className="py-3.5 px-4 font-mono font-medium text-neutral-900">
                        {ds.examDate}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900 font-mono">{course?.code}</div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[200px]">{course?.title}</div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-700">{dept?.code}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-700">Sem {ds.semester}</td>
                      <td className="py-3.5 px-4 text-neutral-800">{teacher?.name}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-600">{ds.hallNumber}</td>

                      <td className="py-3.5 px-4">
                        {ds.status === 'RESULTS_UPLOADED' ? (
                          <span className="text-emerald-700 font-medium">Completed & Graded</span>
                        ) : ds.status === 'EXAM_CALLED' ? (
                          <span className="text-blue-700 font-medium">Exam Called by Principal</span>
                        ) : paper?.qaStatus === 'QA_APPROVED' ? (
                          <span className="text-emerald-700 font-medium">QA Approved (Duty Locked)</span>
                        ) : paper?.qaStatus === 'UNDER_QA_REVIEW' ? (
                          <span className="text-amber-700 font-medium">Stuck at QA Review</span>
                        ) : (
                          <span className="text-red-700 font-medium">
                            Stuck at Teacher ({daysLeft <= 10 ? '10d Alert!' : 'Upload Pending'})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {ds.status === 'SCHEDULED' && paper?.qaStatus === 'QA_APPROVED' && (
                          <button
                            onClick={() => handleCallExam(ds.id, course?.code)}
                            className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-semibold rounded transition-colors"
                          >
                            Call Exam
                          </button>
                        )}
                        {ds.status === 'EXAM_CALLED' && (
                          <span className="text-[11px] text-neutral-500">Awaiting marks</span>
                        )}
                        {ds.status === 'RESULTS_UPLOADED' && (
                          <span className="text-[11px] text-emerald-700 font-semibold">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: INSTITUTIONAL ACTIVITY FEED */}
      {activeView === 'ACTIVITY_FEED' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <ActivityFeed mode="PRINCIPAL" showSimulators={true} />
        </div>
      )}

      {/* Official Institutional Printable Footer (Shown ONLY during PDF Export / Print) */}
      <DashboardPrintFooter />
    </div>
  );
}
