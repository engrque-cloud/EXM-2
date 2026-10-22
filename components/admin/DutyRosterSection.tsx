'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import { DutyAssignment, User } from '@/types/exam-system';
import {
  checkProposedDutyOverlap,
  getFacultyAvailabilityForSlot,
  DutyConflict,
} from '@/lib/duty-overlap';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X,
  Plus,
  RefreshCw,
  UserCheck,
  Building,
  AlertCircle,
  HelpCircle,
  Trash2,
  MessageSquare,
} from 'lucide-react';

export function DutyRosterSection() {
  const {
    dutyRoster,
    dutyConflicts,
    users,
    dateSheet,
    courses,
    addDutyAssignment,
    updateDutyAssignment,
    deleteDutyAssignment,
    generateDutyRoster,
    simulateDutyConflict,
    sendWhatsAppDutyRosterAlert,
    dispatchAllDutyRosterWhatsAppAlerts,
  } = useExam();

  // Faculty list (teachers)
  const facultyMembers = useMemo(() => {
    return users.filter((u) => u.role === 'TEACHER' && u.isApproved);
  }, [users]);

  // Filter state for table
  const [tableFilter, setTableFilter] = useState<'ALL' | 'CONFLICTS_ONLY' | 'CLEAN_ONLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Generation Feedback Modal
  const [genModalResult, setGenModalResult] = useState<{
    show: boolean;
    createdCount: number;
    conflictCount: number;
    conflicts: DutyConflict[];
  }>({
    show: false,
    createdCount: 0,
    conflictCount: 0,
    conflicts: [],
  });

  // Reassignment Modal State
  const [reassignModalDuty, setReassignModalDuty] = useState<DutyAssignment | null>(null);
  const [selectedReplacementTeacherId, setSelectedReplacementTeacherId] = useState('');
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState('');

  // Manual Add Duty Modal State
  const [isAddDutyModalOpen, setIsAddDutyModalOpen] = useState(false);
  const [newDutyDateSheetId, setNewDutyDateSheetId] = useState(dateSheet[0]?.id || '');
  const [newDutyTeacherId, setNewDutyTeacherId] = useState(facultyMembers[0]?.id || '');
  const [newDutyRole, setNewDutyRole] = useState<'Chief Invigilator' | 'Hall Invigilator' | 'Deputy Superintendent'>(
    'Hall Invigilator'
  );
  const [newDutyExamDate, setNewDutyExamDate] = useState('2026-10-21');
  const [newDutyStartTime, setNewDutyStartTime] = useState('01:30 PM');
  const [newDutyEndTime, setNewDutyEndTime] = useState('04:30 PM');
  const [newDutyHall, setNewDutyHall] = useState('Central Examination Hall H-1');
  const [addDutySuccessMsg, setAddDutySuccessMsg] = useState('');

  // Set of conflicting duty IDs for quick lookup in the table
  const conflictingDutyIds = useMemo(() => {
    const ids = new Set<string>();
    for (const conflict of dutyConflicts) {
      for (const d of conflict.duties) {
        ids.add(d.id);
      }
    }
    return ids;
  }, [dutyConflicts]);

  // Real-time conflict validation for Manual Add Duty Modal
  const addDutyConflictCheck = useMemo(() => {
    if (!newDutyTeacherId || !newDutyExamDate || !newDutyStartTime || !newDutyEndTime) {
      return { hasConflict: false, conflictingDuties: [] };
    }
    return checkProposedDutyOverlap(
      newDutyTeacherId,
      newDutyExamDate,
      newDutyStartTime,
      newDutyEndTime,
      dutyRoster,
      dateSheet,
      courses
    );
  }, [newDutyTeacherId, newDutyExamDate, newDutyStartTime, newDutyEndTime, dutyRoster, dateSheet, courses]);

  // Available faculty for the slot in Manual Add Duty Modal
  const availabilityForAddDuty = useMemo(() => {
    if (!newDutyExamDate || !newDutyStartTime || !newDutyEndTime) {
      return { availableTeachers: facultyMembers, busyTeachers: [] };
    }
    return getFacultyAvailabilityForSlot(
      newDutyExamDate,
      newDutyStartTime,
      newDutyEndTime,
      facultyMembers,
      dutyRoster,
      courses,
      dateSheet
    );
  }, [newDutyExamDate, newDutyStartTime, newDutyEndTime, facultyMembers, dutyRoster, courses, dateSheet]);

  // Availability for Reassign Modal
  const availabilityForReassign = useMemo(() => {
    if (!reassignModalDuty) return { availableTeachers: [], busyTeachers: [] };
    return getFacultyAvailabilityForSlot(
      reassignModalDuty.examDate,
      reassignModalDuty.startTime,
      reassignModalDuty.endTime,
      facultyMembers,
      dutyRoster,
      courses,
      dateSheet,
      reassignModalDuty.id // Exclude current duty so current teacher doesn't conflict with self
    );
  }, [reassignModalDuty, facultyMembers, dutyRoster, courses, dateSheet]);

  // Handle generating/syncing roster
  const handleTriggerGenerateRoster = () => {
    const res = generateDutyRoster();
    setGenModalResult({
      show: true,
      createdCount: res.createdCount,
      conflictCount: res.conflictCount,
      conflicts: res.conflicts,
    });
  };

  // Open Reassign Modal
  const handleOpenReassignModal = (duty: DutyAssignment) => {
    setReassignModalDuty(duty);
    // Suggest first available teacher who is not the current one
    const avail = getFacultyAvailabilityForSlot(
      duty.examDate,
      duty.startTime,
      duty.endTime,
      facultyMembers,
      dutyRoster,
      courses,
      dateSheet,
      duty.id
    );
    const candidate = avail.availableTeachers.find((t) => t.id !== duty.teacherId);
    setSelectedReplacementTeacherId(candidate ? candidate.id : '');
    setReassignSuccessMsg('');
  };

  // Confirm Reassignment
  const handleConfirmReassignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalDuty || !selectedReplacementTeacherId) return;

    updateDutyAssignment(reassignModalDuty.id, {
      teacherId: selectedReplacementTeacherId,
    });

    const newTeacher = users.find((u) => u.id === selectedReplacementTeacherId);
    setReassignSuccessMsg(`Successfully reassigned duty to ${newTeacher?.name}! Overlap conflict resolved.`);

    setTimeout(() => {
      setReassignModalDuty(null);
      setReassignSuccessMsg('');
    }, 1800);
  };

  // Handle Manual Duty Creation
  const handleCreateManualDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDutyTeacherId || !newDutyExamDate) return;

    addDutyAssignment({
      dateSheetEntryId: newDutyDateSheetId,
      teacherId: newDutyTeacherId,
      role: newDutyRole,
      hallNumber: newDutyHall,
      examDate: newDutyExamDate,
      startTime: newDutyStartTime,
      endTime: newDutyEndTime,
      isConfirmed: true,
      confirmedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    const teacher = users.find((u) => u.id === newDutyTeacherId);
    setAddDutySuccessMsg(
      addDutyConflictCheck.hasConflict
        ? `Duty assigned to ${teacher?.name} with an overlapping session conflict recorded.`
        : `Duty assignment for ${teacher?.name} confirmed without conflicts!`
    );

    setTimeout(() => {
      setAddDutySuccessMsg('');
      setIsAddDutyModalOpen(false);
    }, 1800);
  };

  // Filtered Duty Roster rows
  const displayedDuties = useMemo(() => {
    return dutyRoster.filter((duty) => {
      const teacher = users.find((u) => u.id === duty.teacherId);
      const ds = dateSheet.find((d) => d.id === duty.dateSheetEntryId);
      const course = courses.find((c) => c.id === ds?.courseId);

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = teacher?.name.toLowerCase().includes(q);
        const matchCourse = course?.code.toLowerCase().includes(q) || course?.title.toLowerCase().includes(q);
        const matchHall = duty.hallNumber.toLowerCase().includes(q);
        if (!matchName && !matchCourse && !matchHall) return false;
      }

      const isConflict = conflictingDutyIds.has(duty.id);
      if (tableFilter === 'CONFLICTS_ONLY' && !isConflict) return false;
      if (tableFilter === 'CLEAN_ONLY' && isConflict) return false;

      return true;
    });
  }, [dutyRoster, users, dateSheet, courses, searchQuery, tableFilter, conflictingDutyIds]);

  return (
    <div className="space-y-6">
      {/* 🚨 CRITICAL OVERLAP WARNING BANNER (When conflicts exist) */}
      {dutyConflicts.length > 0 ? (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5 shadow-xs transition-all animate-in fade-in duration-300">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-red-600 text-white">
                    Overlap Warning Alert
                  </span>
                  <span className="text-xs font-mono font-bold text-red-950 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                    {dutyConflicts.length} Staff Member Conflict(s) Detected
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-red-950 tracking-tight">
                  Staff Double-Booking Detected in Exam Duty Roster!
                </h3>

                <p className="text-xs text-red-900 leading-relaxed max-w-4xl">
                  University examination protocol strictly prohibits simultaneous hall invigilation.
                  A faculty member has been assigned to <strong>two overlapping examination sessions</strong> on the same date.
                  Immediate reassignment is required before exam session locking.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setTableFilter('CONFLICTS_ONLY')}
                className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                View Conflicting Rows Only
              </button>
            </div>
          </div>

          {/* Detailed Conflict Breakdown Cards */}
          <div className="mt-4 pt-4 border-t border-red-200 grid grid-cols-1 gap-3">
            {dutyConflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="bg-white rounded-lg border border-red-300 p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span className="font-bold text-sm text-neutral-900">{conflict.teacherName}</span>
                    <span className="text-xs text-neutral-500 font-mono">({conflict.teacherEmail})</span>
                    <span className="text-[11px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono font-bold">
                      Date: {conflict.examDate}
                    </span>
                  </div>

                  <span className="text-xs font-bold font-mono text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded">
                    Overlap Duration: {conflict.overlapMinutes} Minutes Simultaneous Clash
                  </span>
                </div>

                {/* Overlapping Sessions Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {conflict.conflictItems.map((item, idx) => (
                    <div
                      key={item.dutyId}
                      className="p-3 bg-red-50/60 rounded-md border border-red-200/90 space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                          Session #{idx + 1}: {item.courseCode}
                        </span>
                        <span className="text-[11px] text-red-900 font-semibold font-mono">
                          {item.role}
                        </span>
                      </div>

                      <div className="text-neutral-700 font-medium truncate">{item.courseTitle}</div>

                      <div className="flex items-center justify-between text-neutral-600 font-mono text-[11px] pt-1 border-t border-red-200">
                        <span className="flex items-center gap-1 font-semibold text-red-950">
                          <Clock className="w-3.5 h-3.5 text-red-600" />
                          {item.timeSlot}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-neutral-800">
                          <Building className="w-3.5 h-3.5 text-neutral-500" />
                          {item.hallNumber}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          onClick={() => {
                            const target = dutyRoster.find((d) => d.id === item.dutyId);
                            if (target) handleOpenReassignModal(target);
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Reassign Session #{idx + 1}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Clean Roster Banner when 0 conflicts */
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-950">
                Duty Roster Engine Status: Verified & Zero Session Clashes
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Every assigned faculty member has distinct, non-overlapping exam supervision hours. No concurrent time collisions detected.
              </p>
            </div>
          </div>

          <button
            onClick={simulateDutyConflict}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            title="Inject an overlapping session to test and demonstrate the warning system"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            Simulate Overlapping Session Clash
          </button>
        </div>
      )}

      {/* Main Controls Card */}
      <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900">
                Faculty Invigilation Duty Roster
              </h3>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                {dutyRoster.length} Total Assignments
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Automated roster synchronization locks duties when QA endorses papers. The built-in collision engine monitors concurrent session overlaps.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerGenerateRoster}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Auto-Generate / Sync Roster
            </button>

            <button
              onClick={() => setIsAddDutyModalOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              Assign Invigilator
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setTableFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                tableFilter === 'ALL'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              All Assignments ({dutyRoster.length})
            </button>

            <button
              onClick={() => setTableFilter('CONFLICTS_ONLY')}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors flex items-center gap-1 ${
                tableFilter === 'CONFLICTS_ONLY'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Overlapping Conflicts ({conflictingDutyIds.size})
            </button>

            <button
              onClick={() => setTableFilter('CLEAN_ONLY')}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                tableFilter === 'CLEAN_ONLY'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Clear Sessions ({dutyRoster.length - conflictingDutyIds.size})
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search faculty, course code, hall..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3 py-1.5 text-xs border border-emerald-200 rounded-lg bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* Duty Roster Table */}
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-50/50 border-b border-emerald-100 text-emerald-950 font-bold">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Exam Date</th>
                <th className="py-3 px-4">Session Timing</th>
                <th className="py-3 px-4">Course & Hall Venue</th>
                <th className="py-3 px-4">Overlap Audit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {displayedDuties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No duty roster records matching selection.
                  </td>
                </tr>
              ) : (
                displayedDuties.map((duty) => {
                  const teacher = users.find((u) => u.id === duty.teacherId);
                  const ds = dateSheet.find((d) => d.id === duty.dateSheetEntryId);
                  const course = courses.find((c) => c.id === ds?.courseId);
                  const isConflict = conflictingDutyIds.has(duty.id);

                  // Find other conflicting duty if exists
                  const conflictObj = dutyConflicts.find(
                    (c) => c.teacherId === duty.teacherId && c.examDate === duty.examDate
                  );
                  const conflictingOtherItem = conflictObj?.conflictItems.find(
                    (item) => item.dutyId !== duty.id
                  );

                  return (
                    <tr
                      key={duty.id}
                      className={`transition-colors ${
                        isConflict
                          ? 'bg-red-50/70 border-l-4 border-l-red-500 hover:bg-red-100/60'
                          : 'hover:bg-neutral-50/80'
                      }`}
                    >
                      {/* Teacher info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{teacher?.name}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{teacher?.email}</div>
                        <div className="text-[10px] text-neutral-400">{teacher?.designation}</div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 font-semibold text-neutral-800">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200">
                          {duty.role}
                        </span>
                      </td>

                      {/* Exam Date */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900 tabular-nums">
                        {duty.examDate}
                      </td>

                      {/* Session Timing */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-neutral-900">
                          {duty.startTime} – {duty.endTime}
                        </div>
                        {isConflict && conflictingOtherItem && (
                          <div className="text-[10px] text-red-700 font-semibold mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-red-600" />
                            Clashes with {conflictingOtherItem.timeSlot}
                          </div>
                        )}
                      </td>

                      {/* Course and Hall */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-neutral-900">{course?.code}</div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[180px]">{course?.title}</div>
                        <div className="text-[11px] font-semibold text-neutral-700 mt-0.5 flex items-center gap-1 font-mono">
                          <Building className="w-3 h-3 text-neutral-400" />
                          {duty.hallNumber}
                        </div>
                      </td>

                      {/* Overlap Audit Status */}
                      <td className="py-3.5 px-4">
                        {isConflict ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              Overlapping Clash!
                            </span>
                            {conflictingOtherItem && (
                              <div className="text-[10px] text-red-800 font-medium">
                                Concurrent duty in {conflictingOtherItem.hallNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-700" />
                            Confirmed · Clear Slot
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => sendWhatsAppDutyRosterAlert(duty.id)}
                            className="px-2 py-1 text-xs font-semibold rounded border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-950 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Send WhatsApp confirmation alert & data upload directive"
                          >
                            <MessageSquare className="w-3 h-3 text-[#25D366]" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleOpenReassignModal(duty)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors flex items-center gap-1 ${
                              isConflict
                                ? 'bg-red-700 hover:bg-red-800 text-white border-red-700 shadow-2xs'
                                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300'
                            }`}
                          >
                            <UserCheck className="w-3 h-3" />
                            Reassign
                          </button>

                          <button
                            onClick={() => deleteDutyAssignment(duty.id)}
                            className="p-1 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Remove Duty Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REASSIGN DUTY MODAL (With Availability & Conflict Guidance) */}
      {reassignModalDuty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-bold text-neutral-900">
                  Reassign Faculty Invigilator
                </h3>
              </div>
              <button
                onClick={() => setReassignModalDuty(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reassignSuccessMsg ? (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                {reassignSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleConfirmReassignment} className="space-y-4">
                {/* Session Details Box */}
                <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1 text-xs">
                  <div className="font-bold text-neutral-900">
                    Exam Date: <span className="font-mono text-emerald-900">{reassignModalDuty.examDate}</span>
                  </div>
                  <div className="font-mono text-neutral-700">
                    Session Time: <span className="font-bold">{reassignModalDuty.startTime} – {reassignModalDuty.endTime}</span>
                  </div>
                  <div className="text-neutral-600">
                    Hall: <span className="font-bold text-neutral-800">{reassignModalDuty.hallNumber}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Current Assigned: <strong>{users.find((u) => u.id === reassignModalDuty.teacherId)?.name}</strong>
                  </div>
                </div>

                {/* Available Teachers Select */}
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Select Replacement Faculty Member:
                  </label>
                  <select
                    required
                    value={selectedReplacementTeacherId}
                    onChange={(e) => setSelectedReplacementTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="">-- Choose Free & Available Faculty --</option>
                    <optgroup label="✅ Available (Zero Session Overlap)">
                      {availabilityForReassign.availableTeachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.designation || 'Faculty'}) — Free
                        </option>
                      ))}
                    </optgroup>
                    {availabilityForReassign.busyTeachers.length > 0 && (
                      <optgroup label="⚠️ Busy (Has Overlapping Session)">
                        {availabilityForReassign.busyTeachers.map(({ teacher, conflictDetails }) => (
                          <option key={teacher.id} value={teacher.id} disabled className="text-neutral-400">
                            {teacher.name} — [BUSY: {conflictDetails}]
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Conflict Guidance Notice */}
                {selectedReplacementTeacherId && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Selected replacement has verified zero duty clashes during this slot. Reassigning will clear the overlap error.
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReassignModalDuty(null)}
                    className="px-3.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedReplacementTeacherId}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Confirm Reassignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL ASSIGN INVIGILATOR (With Real-time Warning Pre-validation) */}
      {isAddDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-bold text-neutral-900">
                  Assign Faculty Member to Exam Session
                </h3>
              </div>
              <button
                onClick={() => setIsAddDutyModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addDutySuccessMsg ? (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                {addDutySuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleCreateManualDuty} className="space-y-4">
                {/* Real-time Overlap Warning Box */}
                {addDutyConflictCheck.hasConflict && (
                  <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-lg space-y-1.5 animate-pulse">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-red-950">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      OVERLAPPING SESSION CONFLICT DETECTED!
                    </div>
                    <p className="text-xs text-red-900">
                      {users.find((u) => u.id === newDutyTeacherId)?.name} is already assigned to a concurrent session during this slot:
                    </p>
                    <ul className="text-[11px] font-mono text-red-900 list-disc list-inside">
                      {addDutyConflictCheck.conflictingDuties.map((c) => (
                        <li key={c.dutyId}>
                          <strong>{c.courseCode}</strong> in {c.hallNumber} ({c.timeSlot})
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-red-800 font-semibold">
                      Please pick another available faculty member or modify the exam timing to avoid a simultaneous duty clash.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Select Faculty */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      1. Select Faculty Member
                    </label>
                    <select
                      required
                      value={newDutyTeacherId}
                      onChange={(e) => setNewDutyTeacherId(e.target.value)}
                      className={`w-full px-3 py-2 text-xs border rounded-lg bg-white font-medium ${
                        addDutyConflictCheck.hasConflict
                          ? 'border-red-400 text-red-950 ring-1 ring-red-400'
                          : 'border-neutral-300 text-neutral-900 focus:ring-1 focus:ring-emerald-700'
                      }`}
                    >
                      <optgroup label="✅ Available (No Session Clash)">
                        {availabilityForAddDuty.availableTeachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.designation || 'Faculty'})
                          </option>
                        ))}
                      </optgroup>
                      {availabilityForAddDuty.busyTeachers.length > 0 && (
                        <optgroup label="⚠️ Busy (Concurrent Exam Overlap)">
                          {availabilityForAddDuty.busyTeachers.map(({ teacher }) => (
                            <option key={teacher.id} value={teacher.id} className="text-red-700">
                              ⚠️ {teacher.name} (Has Overlap Clash)
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      2. Supervision Role
                    </label>
                    <select
                      value={newDutyRole}
                      onChange={(e) =>
                        setNewDutyRole(e.target.value as 'Chief Invigilator' | 'Hall Invigilator' | 'Deputy Superintendent')
                      }
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium text-neutral-900 focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="Chief Invigilator">Chief Invigilator</option>
                      <option value="Hall Invigilator">Hall Invigilator</option>
                      <option value="Deputy Superintendent">Deputy Superintendent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Exam Date */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      3. Confirmed Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newDutyExamDate}
                      onChange={(e) => setNewDutyExamDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      4. Start Time
                    </label>
                    <input
                      type="text"
                      required
                      value={newDutyStartTime}
                      onChange={(e) => setNewDutyStartTime(e.target.value)}
                      placeholder="e.g. 09:00 AM"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      5. End Time
                    </label>
                    <input
                      type="text"
                      required
                      value={newDutyEndTime}
                      onChange={(e) => setNewDutyEndTime(e.target.value)}
                      placeholder="e.g. 12:00 PM"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Hall / Room */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      6. Examination Hall / Venue
                    </label>
                    <input
                      type="text"
                      required
                      value={newDutyHall}
                      onChange={(e) => setNewDutyHall(e.target.value)}
                      placeholder="e.g. Auditorium Hall 1"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  {/* Linked Date Sheet / Paper */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      7. Linked Course Examination
                    </label>
                    <select
                      value={newDutyDateSheetId}
                      onChange={(e) => setNewDutyDateSheetId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium text-neutral-900 focus:ring-1 focus:ring-emerald-700"
                    >
                      {dateSheet.map((ds) => {
                        const crs = courses.find((c) => c.id === ds.courseId);
                        return (
                          <option key={ds.id} value={ds.id}>
                            {crs?.code} · {crs?.title} ({ds.examDate})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-500">
                    {addDutyConflictCheck.hasConflict ? (
                      <span className="text-red-700 font-bold">⚠️ Warning active: Overlapping session conflict!</span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">✅ Conflict check passed (No clash)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddDutyModalOpen(false)}
                      className="px-3.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 ${
                        addDutyConflictCheck.hasConflict
                          ? 'bg-red-700 hover:bg-red-800 text-white'
                          : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      {addDutyConflictCheck.hasConflict ? 'Assign Despite Overlap Warning' : 'Confirm Assignment'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: GENERATION RESULT FEEDBACK MODAL */}
      {genModalResult.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                {genModalResult.conflictCount > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                )}
                <h3 className="text-base font-bold text-neutral-900">
                  Duty Roster Generation Complete
                </h3>
              </div>
              <button
                onClick={() => setGenModalResult((prev) => ({ ...prev, show: false }))}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-1">
                <div>
                  New Duties Generated: <strong className="font-mono text-emerald-900">{genModalResult.createdCount}</strong>
                </div>
                <div>
                  Total Roster Records: <strong className="font-mono text-neutral-900">{dutyRoster.length}</strong>
                </div>
              </div>

              {genModalResult.conflictCount > 0 ? (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg space-y-2">
                  <div className="text-xs font-extrabold text-red-950 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    WARNING: {genModalResult.conflictCount} Overlapping Session Conflict(s) Detected!
                  </div>
                  <p className="text-xs text-red-900">
                    The collision engine detected staff members assigned to concurrent examination sessions.
                    Please review the warnings highlighted at the top of the Duty Roster.
                  </p>
                  <div className="space-y-1 pt-1">
                    {genModalResult.conflicts.map((c) => (
                      <div key={c.id} className="text-[11px] font-mono text-red-900 bg-white/80 p-2 rounded border border-red-200">
                        • <strong>{c.teacherName}</strong> on {c.examDate}: {c.overlapMinutes} mins overlap.
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Zero time clashes! All staff members have distinct non-overlapping invigilation slots.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end">
              <button
                onClick={() => setGenModalResult((prev) => ({ ...prev, show: false }))}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
              >
                Close & Review Duty Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
