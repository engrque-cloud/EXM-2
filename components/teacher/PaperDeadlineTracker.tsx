'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import { computeDaysDifference } from '@/lib/exam-storage';
import { DateSheetEntry, PaperSubmission } from '@/types/exam-system';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  FileText,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';

interface PaperDeadlineTrackerProps {
  onOpenUpload: (entry: DateSheetEntry) => void;
  onOpenDateSimulator?: () => void;
}

export type DeadlineSeverity =
  | 'CRITICAL' // < 48 hours (<= 2 days)
  | 'URGENT' // 3 to 5 days
  | 'NOTICE' // 6 to 10 days
  | 'UPCOMING' // > 10 days
  | 'OVERDUE' // < 0 days (past exam date)
  | 'IN_REVIEW' // Paper submitted, waiting QA
  | 'APPROVED'; // QA approved

export function PaperDeadlineTracker({ onOpenUpload, onOpenDateSimulator }: PaperDeadlineTrackerProps) {
  const {
    simulatedDate,
    currentUser,
    users,
    dateSheet,
    papers,
    courses,
    departments,
    advanceDays,
  } = useExam();

  // Scope filter: My courses vs All university courses
  const [scope, setScope] = useState<'MY_COURSES' | 'ALL_FACULTY'>('MY_COURSES');
  // Severity filter
  const [filterSeverity, setFilterSeverity] = useState<string>('PENDING_ACTION');
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Determine base entries based on selected scope
  const baseEntries = useMemo(() => {
    if (scope === 'MY_COURSES') {
      return dateSheet.filter((ds) => ds.assignedTeacherId === currentUser.id);
    }
    return dateSheet;
  }, [dateSheet, scope, currentUser.id]);

  // Compute enriched items with deadline calculations
  const enrichedItems = useMemo(() => {
    return baseEntries.map((ds) => {
      const course = courses.find((c) => c.id === ds.courseId);
      const teacher = users.find((u) => u.id === ds.assignedTeacherId);
      const department = departments.find((d) => d.id === ds.departmentId);
      const paper = papers.find((p) => p.dateSheetEntryId === ds.id);

      const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);
      // Rough hours calculation based on 9 AM exam morning
      const approxHoursRemaining = Math.max(0, daysLeft * 24);

      // Calculate 10-day trigger date
      const examDateObj = new Date(ds.examDate);
      examDateObj.setDate(examDateObj.getDate() - 10);
      const tenDayNoticeDate = examDateObj.toISOString().split('T')[0];

      let severity: DeadlineSeverity;
      const isPaperSubmitted = !!paper && paper.qaStatus !== 'QA_REJECTED';
      const isApproved = paper?.qaStatus === 'QA_APPROVED';
      const isInReview = paper?.qaStatus === 'UNDER_QA_REVIEW';
      const isRejected = paper?.qaStatus === 'QA_REJECTED';

      if (isApproved) {
        severity = 'APPROVED';
      } else if (isInReview) {
        severity = 'IN_REVIEW';
      } else if (daysLeft < 0) {
        severity = 'OVERDUE';
      } else if (daysLeft <= 2) {
        // Red alert: < 48 hours
        severity = 'CRITICAL';
      } else if (daysLeft <= 5) {
        // Amber alert: 3 - 5 days
        severity = 'URGENT';
      } else if (daysLeft <= 10) {
        // Yellow alert: 6 - 10 days
        severity = 'NOTICE';
      } else {
        severity = 'UPCOMING';
      }

      const isPendingSubmission = !paper || isRejected;

      return {
        entry: ds,
        course,
        teacher,
        department,
        paper,
        daysLeft,
        approxHoursRemaining,
        tenDayNoticeDate,
        severity,
        isPendingSubmission,
        isRejected,
      };
    });
  }, [baseEntries, courses, users, departments, papers, simulatedDate]);

  // Counts for summary metrics
  const criticalCount = enrichedItems.filter(
    (item) => item.severity === 'CRITICAL' && item.isPendingSubmission
  ).length;

  const urgentCount = enrichedItems.filter(
    (item) => item.severity === 'URGENT' && item.isPendingSubmission
  ).length;

  const noticeCount = enrichedItems.filter(
    (item) => item.severity === 'NOTICE' && item.isPendingSubmission
  ).length;

  const overdueCount = enrichedItems.filter(
    (item) => item.severity === 'OVERDUE' && item.isPendingSubmission
  ).length;

  const inReviewCount = enrichedItems.filter((item) => item.severity === 'IN_REVIEW').length;
  const approvedCount = enrichedItems.filter((item) => item.severity === 'APPROVED').length;

  // Filtered list for display
  const displayedItems = useMemo(() => {
    return enrichedItems
      .filter((item) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchCourse =
            item.course?.code.toLowerCase().includes(q) ||
            item.course?.title.toLowerCase().includes(q);
          const matchTeacher = item.teacher?.name.toLowerCase().includes(q);
          if (!matchCourse && !matchTeacher) return false;
        }

        if (filterSeverity === 'ALL') return true;
        if (filterSeverity === 'PENDING_ACTION') {
          return item.isPendingSubmission;
        }
        if (filterSeverity === 'CRITICAL_ONLY') {
          return item.severity === 'CRITICAL';
        }
        if (filterSeverity === 'URGENT_ONLY') {
          return item.severity === 'URGENT';
        }
        if (filterSeverity === 'IN_REVIEW') {
          return item.severity === 'IN_REVIEW';
        }
        if (filterSeverity === 'APPROVED') {
          return item.severity === 'APPROVED';
        }
        return true;
      })
      .sort((a, b) => {
        // Sort priority: Pending submission with smallest daysLeft first
        if (a.isPendingSubmission && !b.isPendingSubmission) return -1;
        if (!a.isPendingSubmission && b.isPendingSubmission) return 1;
        return a.daysLeft - b.daysLeft;
      });
  }, [enrichedItems, filterSeverity, searchQuery]);

  return (
    <section className="bg-white rounded-xl border border-emerald-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-700/80 text-emerald-100 border border-emerald-600/50">
                10-Day Policy Engine
              </span>
              <span className="text-xs text-emerald-200 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                Simulated Date: {simulatedDate}
              </span>
            </div>

            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-300" />
              Paper Deadline Tracker
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full animate-pulse">
                  {criticalCount} Critical &lt; 48h
                </span>
              )}
            </h2>

            <p className="text-xs text-emerald-100/90 max-w-3xl leading-relaxed">
              University regulations require teachers to upload finalized question papers at least <strong>10 days</strong> before each exam.
              Audits take up to 48 hours; duty roster confirmation and exam printing require approved status.
            </p>
          </div>

          {/* Quick Date Simulator Actions */}
          <div className="flex flex-wrap items-center gap-2 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-700/60 shrink-0">
            <span className="text-[11px] text-emerald-200 font-medium">Test Deadlines:</span>
            <button
              onClick={() => advanceDays(2)}
              className="px-2.5 py-1 text-xs font-mono bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded border border-emerald-600 transition-colors"
              title="Fast forward simulated time by +2 days"
            >
              +2 Days
            </button>
            <button
              onClick={() => advanceDays(5)}
              className="px-2.5 py-1 text-xs font-mono bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded border border-emerald-600 transition-colors"
              title="Fast forward simulated time by +5 days"
            >
              +5 Days
            </button>
            {onOpenDateSimulator && (
              <button
                onClick={onOpenDateSimulator}
                className="px-2.5 py-1 text-xs font-medium bg-white text-emerald-900 hover:bg-emerald-50 rounded flex items-center gap-1 shadow-2xs font-semibold transition-colors"
              >
                <Sparkles className="w-3 h-3 text-emerald-700" />
                Date Simulator
              </button>
            )}
          </div>
        </div>

        {/* Color-Coded Alert Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-emerald-700/60">
          {/* Critical: Red */}
          <button
            onClick={() => setFilterSeverity('CRITICAL_ONLY')}
            className={`p-2.5 rounded-lg text-left transition-all border ${
              filterSeverity === 'CRITICAL_ONLY'
                ? 'bg-red-600/30 border-red-400 ring-2 ring-red-400'
                : 'bg-red-950/40 hover:bg-red-900/40 border-red-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-200 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                &lt; 48 Hours
              </span>
              <span className="text-base font-extrabold font-mono text-red-100">{criticalCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-red-100 mt-1">Critical Urgency</div>
          </button>

          {/* Urgent: Amber */}
          <button
            onClick={() => setFilterSeverity('URGENT_ONLY')}
            className={`p-2.5 rounded-lg text-left transition-all border ${
              filterSeverity === 'URGENT_ONLY'
                ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400'
                : 'bg-amber-950/40 hover:bg-amber-900/40 border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">
                3–5 Days Left
              </span>
              <span className="text-base font-extrabold font-mono text-amber-100">{urgentCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-amber-100 mt-1">High Urgency</div>
          </button>

          {/* Notice: Yellow */}
          <button
            onClick={() => setFilterSeverity('PENDING_ACTION')}
            className={`p-2.5 rounded-lg text-left transition-all border ${
              filterSeverity === 'PENDING_ACTION'
                ? 'bg-yellow-600/30 border-yellow-400 ring-2 ring-yellow-400'
                : 'bg-yellow-950/30 hover:bg-yellow-900/30 border-yellow-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-yellow-200 uppercase tracking-wider">
                6–10 Days Notice
              </span>
              <span className="text-base font-extrabold font-mono text-yellow-100">{noticeCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-yellow-100 mt-1">10-Day Window</div>
          </button>

          {/* Overdue */}
          <button
            onClick={() => setFilterSeverity('PENDING_ACTION')}
            className="p-2.5 rounded-lg text-left transition-all border bg-rose-950/30 hover:bg-rose-900/30 border-rose-500/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">
                Overdue
              </span>
              <span className="text-base font-extrabold font-mono text-rose-100">{overdueCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-rose-100 mt-1">Past Deadline</div>
          </button>

          {/* Under QA Review: Blue */}
          <button
            onClick={() => setFilterSeverity('IN_REVIEW')}
            className={`p-2.5 rounded-lg text-left transition-all border ${
              filterSeverity === 'IN_REVIEW'
                ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400'
                : 'bg-blue-950/30 hover:bg-blue-900/30 border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                In QA Audit
              </span>
              <span className="text-base font-extrabold font-mono text-blue-100">{inReviewCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-blue-100 mt-1">Reviewing</div>
          </button>

          {/* QA Approved: Emerald */}
          <button
            onClick={() => setFilterSeverity('APPROVED')}
            className={`p-2.5 rounded-lg text-left transition-all border ${
              filterSeverity === 'APPROVED'
                ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400'
                : 'bg-emerald-950/30 hover:bg-emerald-900/30 border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                Duty Locked
              </span>
              <span className="text-base font-extrabold font-mono text-emerald-100">{approvedCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-100 mt-1">QA Approved</div>
          </button>
        </div>
      </div>

      {/* Control Bar: Scope, Filters, and Legend */}
      <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope buttons */}
          <div className="inline-flex rounded-lg border border-emerald-200 bg-white p-0.5 text-xs">
            <button
              onClick={() => setScope('MY_COURSES')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                scope === 'MY_COURSES'
                  ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              My Courses ({currentUser.name.split(' ')[0]})
            </button>
            <button
              onClick={() => setScope('ALL_FACULTY')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                scope === 'ALL_FACULTY'
                  ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Faculty Submissions
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <button
              onClick={() => setFilterSeverity('PENDING_ACTION')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterSeverity === 'PENDING_ACTION'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              Pending Upload ({criticalCount + urgentCount + noticeCount + overdueCount})
            </button>
            <button
              onClick={() => setFilterSeverity('CRITICAL_ONLY')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterSeverity === 'CRITICAL_ONLY'
                  ? 'bg-red-100 text-red-900 border-red-300 font-semibold'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              &lt; 48h Only ({criticalCount})
            </button>
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterSeverity === 'ALL'
                  ? 'bg-neutral-800 text-white border-neutral-800 font-semibold'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              All Assigned ({enrichedItems.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search course code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-56 px-3 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Main Deadline Tracker Card Stream */}
      <div className="p-5 space-y-4">
        {displayedItems.length === 0 ? (
          <div className="text-center py-10 bg-neutral-50/70 rounded-xl border border-dashed border-neutral-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
            <div className="text-sm font-semibold text-neutral-800">
              No Pending Submissions Matching Selection
            </div>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              All question papers in this view have been submitted or approved, or no courses match your current filter.
            </p>
            <button
              onClick={() => setFilterSeverity('ALL')}
              className="mt-3 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-medium transition-colors"
            >
              Show All Assigned Papers
            </button>
          </div>
        ) : (
          displayedItems.map((item) => {
            const {
              entry,
              course,
              teacher,
              department,
              paper,
              daysLeft,
              approxHoursRemaining,
              tenDayNoticeDate,
              severity,
              isPendingSubmission,
              isRejected,
            } = item;

            // Compute timeline progress (0% at 10-days out, 100% on exam day)
            const progressPct = Math.min(
              100,
              Math.max(0, Math.round(((10 - Math.max(0, daysLeft)) / 10) * 100))
            );

            // Determine Alert Styling according to color-coded tiers
            let containerBg = 'bg-white';
            let borderColor = 'border-neutral-200';
            let alertBadge = null;
            let actionText = 'Upload Question Paper';
            let buttonClass =
              'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs';

            if (severity === 'CRITICAL') {
              // RED ALERT < 48 HOURS
              containerBg = 'bg-red-50/90';
              borderColor = 'border-red-400 shadow-sm';
              buttonClass =
                'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400 shadow-xs animate-pulse';
              actionText = '🚨 Upload Paper Immediately (< 48h)';
              alertBadge = (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  CRITICAL: Under 48 Hours Remaining!
                </div>
              );
            } else if (severity === 'URGENT') {
              // AMBER ALERT 3-5 DAYS
              containerBg = 'bg-amber-50/90';
              borderColor = 'border-amber-300';
              buttonClass =
                'bg-amber-700 hover:bg-amber-800 text-white shadow-xs';
              actionText = '⚠️ Upload Question Paper (Urgent)';
              alertBadge = (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white">
                  <Clock className="w-3.5 h-3.5" />
                  HIGH URGENCY: 3–5 Days Remaining
                </div>
              );
            } else if (severity === 'NOTICE') {
              // YELLOW ALERT 6-10 DAYS
              containerBg = 'bg-yellow-50/70';
              borderColor = 'border-yellow-300';
              buttonClass =
                'bg-yellow-700 hover:bg-yellow-800 text-white shadow-xs';
              actionText = 'Upload Question Paper (10-Day Window)';
              alertBadge = (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-600 text-white">
                  <AlertCircle className="w-3.5 h-3.5" />
                  10-DAY NOTICE: Paper Drafting Due
                </div>
              );
            } else if (severity === 'OVERDUE') {
              // OVERDUE
              containerBg = 'bg-rose-50';
              borderColor = 'border-rose-400';
              buttonClass =
                'bg-rose-700 hover:bg-rose-800 text-white shadow-xs';
              actionText = 'Submit Overdue Paper to QA';
              alertBadge = (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-700 text-white">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  OVERDUE: Exam Date Passed or Imminent
                </div>
              );
            } else if (severity === 'IN_REVIEW') {
              // SUBMITTED - IN QA REVIEW
              containerBg = 'bg-blue-50/60';
              borderColor = 'border-blue-200';
              alertBadge = (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                  <Clock className="w-3.5 h-3.5" />
                  Submitted · Under QA Audit
                </div>
              );
            } else if (severity === 'APPROVED') {
              // QA APPROVED
              containerBg = 'bg-emerald-50/60';
              borderColor = 'border-emerald-200';
              alertBadge = (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700 text-white">
                  <Check className="w-3.5 h-3.5" />
                  QA Approved · Duty Locked on Roster
                </div>
              );
            } else {
              // UPCOMING > 10 DAYS
              containerBg = 'bg-white';
              borderColor = 'border-neutral-200';
              alertBadge = (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-200 text-neutral-800">
                  <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                  Upcoming (&gt; 10 Days Out)
                </div>
              );
            }

            return (
              <div
                key={entry.id}
                className={`rounded-xl border-2 ${borderColor} ${containerBg} p-5 transition-all hover:shadow-xs`}
              >
                {/* Top Row: Course Info & Alert Badge */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-base font-bold text-neutral-900 bg-white/80 px-2 py-0.5 rounded border border-neutral-300">
                        {course?.code}
                      </span>
                      <span className="text-xs font-semibold text-neutral-700">
                        {department?.name} · Semester {entry.semester}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">
                        ({entry.hallNumber})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900">
                      {course?.title}
                    </h3>

                    <div className="text-xs text-neutral-600 flex items-center gap-2">
                      <span>Faculty: <strong>{teacher?.name}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Exam Session: {entry.startTime} – {entry.endTime}</span>
                    </div>
                  </div>

                  {/* Badge & Days Remaining counter */}
                  <div className="flex flex-col md:items-end gap-1.5 shrink-0">
                    {alertBadge}

                    <div className="text-right">
                      {daysLeft < 0 ? (
                        <span className="text-xs font-bold text-rose-800 font-mono">
                          {Math.abs(daysLeft)} day(s) overdue
                        </span>
                      ) : daysLeft <= 2 ? (
                        <div className="flex items-center gap-1.5 text-red-900 font-mono">
                          <Clock className="w-4 h-4 text-red-600 animate-bounce" />
                          <span className="text-sm font-extrabold text-red-700 bg-red-100/90 px-2 py-0.5 rounded border border-red-300">
                            {approxHoursRemaining} Hours Left ({daysLeft} days)
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs font-mono font-medium text-neutral-700">
                          {daysLeft} days until exam (~{approxHoursRemaining} hrs)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 10-Day Rule Milestone Timeline & Progress Bar */}
                <div className="mt-4 pt-3 border-t border-neutral-200/80">
                  <div className="flex items-center justify-between text-[11px] text-neutral-600 font-medium mb-1.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>
                        10-Day Policy Alert Date: <strong className="font-mono text-neutral-800">{tenDayNoticeDate}</strong>
                      </span>
                    </div>
                    <div>
                      Scheduled Exam Date: <strong className="font-mono text-neutral-900">{entry.examDate}</strong>
                    </div>
                  </div>

                  {/* Visual Progress Track */}
                  <div className="relative w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        severity === 'CRITICAL' || severity === 'OVERDUE'
                          ? 'bg-gradient-to-r from-amber-500 to-red-600'
                          : severity === 'URGENT'
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                          : severity === 'NOTICE'
                          ? 'bg-yellow-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Milestones beneath progress bar */}
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                    <span>10 Days Out (Alert Triggered)</span>
                    <span className="text-amber-800 font-semibold">5 Days (Urgent Queue)</span>
                    <span className="text-red-700 font-bold">&lt; 48h (Critical Threshold)</span>
                    <span>Exam Conduct</span>
                  </div>
                </div>

                {/* Status Notice & Action Strip */}
                <div className="mt-4 pt-3 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    {severity === 'CRITICAL' && (
                      <p className="text-red-900 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>Urgent Action Required:</strong> Exam paper must be submitted to QA within 48 hours to guarantee room allocation and print readiness.
                        </span>
                      </p>
                    )}
                    {severity === 'URGENT' && (
                      <p className="text-amber-900 font-medium flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          <strong>High Priority:</strong> 3 to 5 days remaining before exam date. Submit draft now to allow QA revision turnaround.
                        </span>
                      </p>
                    )}
                    {severity === 'NOTICE' && (
                      <p className="text-yellow-900 font-medium flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-yellow-700 shrink-0" />
                        <span>
                          10-Day Submission window active. Align question paper with approved course learning outcomes.
                        </span>
                      </p>
                    )}
                    {severity === 'OVERDUE' && (
                      <p className="text-rose-900 font-medium flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                        <span>
                          <strong>Deadline Breached:</strong> Exam date has arrived or passed without confirmed QA sign-off.
                        </span>
                      </p>
                    )}
                    {severity === 'IN_REVIEW' && (
                      <p className="text-blue-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          Paper submitted (<strong>{paper?.fileAttachmentName}</strong>). Currently under Bloom Taxonomy audit by QA Cell.
                        </span>
                      </p>
                    )}
                    {severity === 'APPROVED' && (
                      <p className="text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          QA Audit Verified ({paper?.fileAttachmentName}). Invigilation duty officially locked on Duty Roster.
                        </span>
                      </p>
                    )}
                    {severity === 'UPCOMING' && (
                      <p className="text-neutral-600 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span>
                          Scheduled for exam on {entry.examDate}. 10-day notice will activate on {tenDayNoticeDate}.
                        </span>
                      </p>
                    )}

                    {/* Show rejection notes if paper was rejected */}
                    {isRejected && (
                      <div className="mt-1 p-2 bg-red-100/80 rounded border border-red-300 text-red-950 font-medium text-[11px]">
                        <strong>QA Audit Feedback:</strong> {paper?.qaNotes}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0">
                    {isPendingSubmission ? (
                      <button
                        onClick={() => onOpenUpload(entry)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${buttonClass}`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {isRejected ? 'Re-Upload Question Paper' : actionText}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenUpload(entry)}
                          className="px-3 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-neutral-500" />
                          View Paper Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Educational Summary */}
      <div className="p-4 bg-neutral-50 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-600 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-800">10-Day Rule Workflow:</span>
          <span>Date Sheet Fixed</span>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
          <span>10-Day Advance Alert</span>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
          <span>Teacher Paper Upload</span>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
          <span>QA Audit Check</span>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
          <span className="text-emerald-800 font-semibold">Duty Roster Locked</span>
        </div>

        <div className="text-[11px] text-neutral-500">
          Showing <strong>{displayedItems.length}</strong> exam paper schedule(s)
        </div>
      </div>
    </section>
  );
}
