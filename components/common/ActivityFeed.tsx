'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import { SystemActivityLog, ActivityCategory, ActivitySeverity, ActivityActionType } from '@/types/exam-system';
import { DashboardPdfExportButton } from './DashboardPdfExport';
import {
  GraduationCap,
  Calendar,
  Users,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock,
  Sparkles,
  Download,
  CalendarDays,
  FileCheck2,
  FileText,
  Palette,
  ChevronRight,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';

interface ActivityFeedProps {
  mode?: 'PRINCIPAL' | 'ADMIN';
  compact?: boolean;
  maxItems?: number;
  showSimulators?: boolean;
}

export function ActivityFeed({
  mode = 'PRINCIPAL',
  compact = false,
  maxItems,
  showSimulators = true,
}: ActivityFeedProps) {
  const {
    activityLogs,
    simulatedDate,
    currentUser,
    courses,
    dateSheet,
    users,
    logActivity,
    generateDutyRoster,
  } = useExam();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLogDetail, setSelectedLogDetail] = useState<SystemActivityLog | null>(null);

  // Quick Deadline Update Modal State
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [selectedDateSheetId, setSelectedDateSheetId] = useState<string>('');
  const [newDeadlineDate, setNewDeadlineDate] = useState<string>('2026-10-24');
  const [deadlineReason, setDeadlineReason] = useState<string>('Faculty syllabus review extension');

  // Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      // Action Type filter
      if (selectedActionFilter !== 'ALL') {
        if (selectedActionFilter === 'GRADE_PUBLISHED' && log.actionType !== 'GRADE_PUBLISHED') return false;
        if (selectedActionFilter === 'PAPER_DEADLINE_UPDATED' && log.actionType !== 'PAPER_DEADLINE_UPDATED') return false;
        if (
          selectedActionFilter === 'DUTY_ROSTER_GENERATED' &&
          log.actionType !== 'DUTY_ROSTER_GENERATED' &&
          log.actionType !== 'ROSTER_GENERATED'
        )
          return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchActor = log.actorName.toLowerCase().includes(q) || (log.actorEmail && log.actorEmail.toLowerCase().includes(q));
        const matchDesc = log.description.toLowerCase().includes(q);
        const matchAction = log.actionType.toLowerCase().includes(q);
        const matchTarget = (log.targetLabel && log.targetLabel.toLowerCase().includes(q)) || (log.targetId && log.targetId.toLowerCase().includes(q));
        if (!matchActor && !matchDesc && !matchAction && !matchTarget) {
          return false;
        }
      }

      return true;
    });
  }, [activityLogs, selectedActionFilter, selectedCategory, selectedSeverity, searchQuery]);

  const displayedLogs = maxItems ? filteredLogs.slice(0, maxItems) : filteredLogs;

  // Simulator Triggers
  const handleSimulateGradePublished = () => {
    const csCourse = courses.find((c) => c.code === 'CS-301') || courses[0];
    logActivity({
      actionType: 'GRADE_PUBLISHED',
      category: 'ACADEMIC',
      severity: 'CRITICAL',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorEmail: currentUser.email,
      description: `Official grades verified and published for ${csCourse.code} (${csCourse.title}). Marks released to candidate transcripts.`,
      targetId: csCourse.id,
      targetType: 'COURSE',
      targetLabel: `${csCourse.code} · ${csCourse.title}`,
      departmentId: csCourse.departmentId,
    });
  };

  const handleSimulateRosterGenerated = () => {
    generateDutyRoster();
  };

  const handleApplyDeadlineUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = dateSheet.find((ds) => ds.id === selectedDateSheetId) || dateSheet[0];
    if (!entry) return;

    const course = courses.find((c) => c.id === entry.courseId);
    const teacher = users.find((u) => u.id === entry.assignedTeacherId);

    logActivity({
      actionType: 'PAPER_DEADLINE_UPDATED',
      category: 'ACADEMIC',
      severity: 'WARNING',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorEmail: currentUser.email,
      description: `Paper submission deadline for ${course?.code || 'Course'} (${course?.title || ''}) adjusted to ${newDeadlineDate}. Reason: ${deadlineReason}. Assigned teacher: ${teacher?.name || 'Faculty'}.`,
      targetId: entry.id,
      targetType: 'DATESHEET',
      targetLabel: `${course?.code || 'Course'} Paper Deadline`,
      departmentId: entry.departmentId,
    });

    setIsDeadlineModalOpen(false);
  };

  // Helper for action badges
  const renderActionBadge = (action: ActivityActionType) => {
    switch (action) {
      case 'GRADE_PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            Grade Published
          </span>
        );
      case 'PAPER_DEADLINE_UPDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Paper Deadline Updated
          </span>
        );
      case 'DUTY_ROSTER_GENERATED':
      case 'ROSTER_GENERATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <Users className="w-3.5 h-3.5 text-purple-700" />
            Duty Roster Generated
          </span>
        );
      case 'PAPER_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-900 border border-blue-200">
            <FileCheck2 className="w-3 h-3 text-blue-700" />
            Paper Approved
          </span>
        );
      case 'PAPER_UPLOADED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-900 border border-sky-200">
            <FileText className="w-3 h-3 text-sky-700" />
            Paper Uploaded
          </span>
        );
      case 'BRANDING_UPDATED':
      case 'SIGNATORIES_UPDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-900 border border-teal-200">
            <Palette className="w-3 h-3 text-teal-700" />
            Signatories Updated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            <ShieldCheck className="w-3 h-3 text-neutral-600" />
            {action.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  const renderSeverityDot = (sev: ActivitySeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="w-2 h-2 rounded-full bg-red-600 ring-4 ring-red-100" title="Critical Executive Event" />;
      case 'WARNING':
        return <span className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-100" title="Warning / Schedule Adjustment" />;
      case 'SUCCESS':
        return <span className="w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-emerald-100" title="Success / Endorsed" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-sky-500 ring-4 ring-sky-100" title="Informational Log" />;
    }
  };

  const handleExportCsv = () => {
    const headers = 'ID,Timestamp,ActionType,Category,Severity,ActorName,ActorRole,TargetLabel,Description,TamperHash\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actionType}","${l.category}","${l.severity}","${l.actorName}","${l.actorRole}","${l.targetLabel || ''}","${l.description.replace(/"/g, '""')}","${l.tamperHash}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EMS_Activity_Feed_${simulatedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 print-area">
      {/* Header and Quick Actions Bar */}
      <div className="p-4 bg-white border border-emerald-200 rounded-xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <span>Institutional Activity Feed</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  {activityLogs.length} events logged
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Live audit trail of university examination operations, grade releases, deadline changes, and duty roster cycles.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & PDF Export */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end no-print">
          <DashboardPdfExportButton
            viewName="System_Activity_Feed"
            reportTitle="Institutional Activity & Audit Feed"
          />

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Simulator Buttons Toolbar */}
      {showSimulators && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs text-emerald-950 font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Quick Event Simulator (Test real-time feed logging):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateGradePublished}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-950 bg-white border border-emerald-300 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Log &apos;Grade Published&apos;</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (dateSheet.length > 0) {
                  setSelectedDateSheetId(dateSheet[0].id);
                }
                setIsDeadlineModalOpen(true);
              }}
              className="px-2.5 py-1 text-xs font-semibold text-amber-950 bg-white border border-amber-300 rounded hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>+ Update Paper Deadline</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateRosterGenerated}
              className="px-2.5 py-1 text-xs font-semibold text-purple-950 bg-white border border-purple-300 rounded hover:bg-purple-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-purple-700" />
              <span>+ Generate Duty Roster</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-3 no-print shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Action Types Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedActionFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedActionFilter === 'ALL'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              All Events ({activityLogs.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedActionFilter('GRADE_PUBLISHED')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                selectedActionFilter === 'GRADE_PUBLISHED'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}
            >
              <GraduationCap className="w-3 h-3 text-emerald-600" />
              Grade Published
            </button>

            <button
              type="button"
              onClick={() => setSelectedActionFilter('PAPER_DEADLINE_UPDATED')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                selectedActionFilter === 'PAPER_DEADLINE_UPDATED'
                  ? 'bg-amber-700 text-white font-bold'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-600" />
              Paper Deadline Updated
            </button>

            <button
              type="button"
              onClick={() => setSelectedActionFilter('DUTY_ROSTER_GENERATED')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                selectedActionFilter === 'DUTY_ROSTER_GENERATED'
                  ? 'bg-purple-800 text-white font-bold'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
              }`}
            >
              <Users className="w-3 h-3 text-purple-600" />
              Duty Roster Generated
            </button>
          </div>

          {/* Search input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed by actor, course, action..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category & Severity Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-0.5 border border-neutral-200 rounded bg-neutral-50 text-neutral-800 focus:bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="ACADEMIC">Academic & Exams</option>
              <option value="ROSTER">Duty Roster</option>
              <option value="QA_APPROVAL">QA Paper Review</option>
              <option value="SECURITY_ADMIN">Security & Branding</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-2 py-0.5 border border-neutral-200 rounded bg-neutral-50 text-neutral-800 focus:bg-white"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="SUCCESS">Success</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Activity Timeline Stream */}
      <div className="space-y-3">
        {displayedLogs.length === 0 ? (
          <div className="p-10 bg-white border border-neutral-200 rounded-xl text-center space-y-2">
            <Clock className="w-8 h-8 text-neutral-300 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-800">No activity logs matching criteria</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try adjusting your search terms or filter selections. You can also trigger new events using the simulator bar above.
            </p>
          </div>
        ) : (
          displayedLogs.map((log) => {
            return (
              <div
                key={log.id}
                className="p-4 bg-white border border-neutral-200 rounded-xl hover:border-emerald-300 transition-all shadow-2xs hover:shadow-xs group print-avoid-break"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">{renderSeverityDot(log.severity)}</div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderActionBadge(log.actionType)}
                        {log.targetLabel && (
                          <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 rounded text-neutral-700 font-semibold border border-neutral-200">
                            {log.targetLabel}
                          </span>
                        )}
                        <span className="text-xs text-neutral-400 font-mono">
                          {log.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                        {log.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 pt-1">
                        <span className="flex items-center gap-1 font-medium text-neutral-700">
                          <span className="font-semibold">Actor:</span> {log.actorName} ({log.actorRole})
                        </span>
                        {log.actorEmail && (
                          <span className="text-neutral-400 font-mono text-[10px]">
                            {log.actorEmail}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedLogDetail(log)}
                          className="text-[10px] text-emerald-800 font-mono hover:underline flex items-center gap-1 cursor-pointer no-print ml-auto"
                        >
                          <Lock className="w-3 h-3 text-emerald-700" />
                          <span>{log.tamperHash.slice(0, 16)}...</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLogDetail(log)}
                    className="shrink-0 p-1.5 text-neutral-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors no-print cursor-pointer"
                    title="View tamper seal & cryptographic record"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Detail & Cryptographic Tamper Seal Modal */}
      {selectedLogDetail && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Cryptographic Audit Trail Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-neutral-500 block mb-1">Event Type & Severity:</span>
                <div className="flex items-center gap-2">
                  {renderActionBadge(selectedLogDetail.actionType)}
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 rounded text-neutral-800">
                    Severity: {selectedLogDetail.severity}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-neutral-500 block mb-0.5">Description:</span>
                <p className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-900 font-medium">
                  {selectedLogDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-neutral-500 block mb-0.5">Actor:</span>
                  <div className="font-medium text-neutral-900">{selectedLogDetail.actorName}</div>
                  <div className="text-[11px] text-neutral-500">{selectedLogDetail.actorRole}</div>
                </div>
                <div>
                  <span className="font-semibold text-neutral-500 block mb-0.5">Timestamp:</span>
                  <div className="font-mono text-neutral-900">{selectedLogDetail.timestamp}</div>
                  <div className="text-[11px] text-neutral-500">Simulated Campus Epoch</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-neutral-500 block mb-1 flex items-center justify-between">
                  <span>Cryptographic Tamper-Evident Hash:</span>
                  <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Intact
                  </span>
                </span>
                <div className="p-2.5 bg-neutral-900 text-emerald-400 font-mono text-[11px] rounded-lg break-all">
                  {selectedLogDetail.tamperHash}
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Generated via SHA-256 HMAC digest bound to actor ID, event payload, and timestamp.
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg transition-colors cursor-pointer"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Paper Deadline Modal */}
      {isDeadlineModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in no-print">
          <form
            onSubmit={handleApplyDeadlineUpdate}
            className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Update Paper Submission Deadline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeadlineModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Select Examination Schedule / Course:
                </label>
                <select
                  required
                  value={selectedDateSheetId}
                  onChange={(e) => setSelectedDateSheetId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 font-medium text-neutral-900"
                >
                  {dateSheet.map((ds) => {
                    const c = courses.find((item) => item.id === ds.courseId);
                    return (
                      <option key={ds.id} value={ds.id}>
                        {c?.code || 'Course'} - {c?.title} (Exam Date: {ds.examDate})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  New Adjusted Submission Deadline:
                </label>
                <input
                  type="date"
                  required
                  value={newDeadlineDate}
                  onChange={(e) => setNewDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 font-mono text-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Executive Reason for Deadline Adjustment:
                </label>
                <input
                  type="text"
                  required
                  value={deadlineReason}
                  onChange={(e) => setDeadlineReason(e.target.value)}
                  placeholder="e.g. Special academic review extension granted by Principal"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 text-neutral-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeadlineModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Apply &amp; Log Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
