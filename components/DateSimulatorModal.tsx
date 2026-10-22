'use client';

import React, { useState } from 'react';
import { useExam } from '@/lib/exam-context';
import { computeDaysDifference, DEFAULT_SIMULATED_DATE } from '@/lib/exam-storage';
import { Clock, Calendar, ArrowRight, RotateCcw, X, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

interface DateSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DateSimulatorModal({ isOpen, onClose }: DateSimulatorModalProps) {
  const { simulatedDate, setSimulatedDate, advanceDays, dateSheet, papers, courses } = useExam();
  const [customDate, setCustomDate] = useState(simulatedDate);

  if (!isOpen) return null;

  // Audit exam statuses against current simulated date
  const statusAudit = dateSheet.map((ds) => {
    const course = courses.find((c) => c.id === ds.courseId);
    const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
    const daysLeft = computeDaysDifference(ds.examDate, simulatedDate);
    return {
      id: ds.id,
      code: course?.code || 'N/A',
      title: course?.title || '',
      examDate: ds.examDate,
      daysLeft,
      qaStatus: paper ? paper.qaStatus : 'PENDING_UPLOAD',
      examStatus: ds.status,
    };
  });

  const within10Days = statusAudit.filter((a) => a.daysLeft <= 10 && a.daysLeft >= 0);
  const overduePapers = statusAudit.filter((a) => a.daysLeft < 0 && a.qaStatus !== 'QA_APPROVED');

  const handleApplyCustomDate = () => {
    if (customDate) {
      setSimulatedDate(customDate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">University Time Warp & Simulator</h2>
              <p className="text-xs text-neutral-500">
                Simulate advancing time to test the 10-day paper alerts, QA review windows, and exam conduct.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Current Active Date Display */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-amber-800 block">Current Simulated Date</span>
              <span className="text-xl font-bold font-mono tabular-nums text-neutral-900">
                {simulatedDate}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-amber-700 block">Relative Status</span>
              <span className="text-xs font-semibold text-amber-900">
                {within10Days.length} paper(s) in $\le$10d alert window
              </span>
            </div>
          </div>

          {/* Quick Jump Buttons */}
          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-2">
              Fast-Forward System Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => advanceDays(1)}
                className="px-3 py-2 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors text-center"
              >
                +1 Day
              </button>
              <button
                onClick={() => advanceDays(3)}
                className="px-3 py-2 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors text-center"
              >
                +3 Days
              </button>
              <button
                onClick={() => advanceDays(7)}
                className="px-3 py-2 text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-md transition-colors text-center"
              >
                +7 Days (Alerts)
              </button>
              <button
                onClick={() => advanceDays(14)}
                className="px-3 py-2 text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-md transition-colors text-center"
              >
                +14 Days (Exams)
              </button>
            </div>
          </div>

          {/* Custom Date Input */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="text-xs font-medium text-neutral-700 block mb-1.5">
              Set Specific Calendar Date (YYYY-MM-DD)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                />
              </div>
              <button
                onClick={handleApplyCustomDate}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
              >
                Apply Date
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Real-time Status Breakdown */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="text-xs font-semibold text-neutral-800 mb-2">
              Upcoming Exam Deadlines (Real-Time Relative to {simulatedDate}):
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-neutral-100 text-xs">
              {statusAudit.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-neutral-900">{item.code}</span>
                    <span className="text-neutral-500 ml-1.5 truncate">
                      {item.title}
                    </span>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      Exam: {item.examDate}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {item.daysLeft < 0 ? (
                      <span className="font-mono text-neutral-500 font-medium">Exam Date Passed</span>
                    ) : item.daysLeft <= 10 ? (
                      <span className="font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                        {item.daysLeft}d left (10d alert)
                      </span>
                    ) : (
                      <span className="font-mono text-neutral-600">
                        {item.daysLeft}d left
                      </span>
                    )}
                    <div className="text-[10px] text-neutral-500">
                      {item.qaStatus.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={() => {
              setSimulatedDate(DEFAULT_SIMULATED_DATE);
              setCustomDate(DEFAULT_SIMULATED_DATE);
            }}
            className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Oct 15, 2026
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
