/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useExam } from '@/lib/exam-context';
import { exportCurrentDashboardToPdf } from '@/lib/pdf-export';
import { FileDown, Printer, Check, ShieldCheck } from 'lucide-react';

interface DashboardPdfExportButtonProps {
  viewName: string;
  reportTitle?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'compact';
}

export function DashboardPdfExportButton({
  viewName,
  reportTitle,
  className = '',
  variant = 'secondary',
}: DashboardPdfExportButtonProps) {
  const { branding, simulatedDate } = useExam();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    exportCurrentDashboardToPdf({
      collegeName: branding.collegeName,
      reportName: reportTitle || viewName,
      simulatedDate,
      onAfterPrint: () => setIsExporting(false),
    });
    setTimeout(() => setIsExporting(false), 2500);
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleExport}
        title={`Export ${viewName} to PDF`}
        className={`no-print inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer shadow-2xs ${
          isExporting
            ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-300 hover:border-emerald-500'
        } ${className}`}
      >
        {isExporting ? <Check className="w-3.5 h-3.5 text-emerald-700 animate-pulse" /> : <FileDown className="w-3.5 h-3.5 text-emerald-700" />}
        <span>{isExporting ? 'Preparing PDF...' : 'Export PDF'}</span>
      </button>
    );
  }

  if (variant === 'primary') {
    return (
      <button
        type="button"
        onClick={handleExport}
        className={`no-print inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs bg-emerald-800 hover:bg-emerald-900 text-white ${className}`}
      >
        {isExporting ? <Check className="w-4 h-4 text-emerald-300 animate-pulse" /> : <Printer className="w-4 h-4" />}
        <span>{isExporting ? 'Opening PDF Print...' : 'Export View to PDF'}</span>
      </button>
    );
  }

  // Default secondary
  return (
    <button
      type="button"
      onClick={handleExport}
      className={`no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-2xs bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-300 hover:border-emerald-500 ${className}`}
    >
      {isExporting ? (
        <Check className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
      ) : (
        <FileDown className="w-3.5 h-3.5 text-emerald-700" />
      )}
      <span>{isExporting ? 'Preparing Print...' : 'Export to PDF'}</span>
    </button>
  );
}

/**
 * Institutional printable document header that appears exclusively when exporting/printing to PDF
 */
export function DashboardPrintHeader({
  dashboardType,
  currentViewTitle,
  departmentFilter,
}: {
  dashboardType: 'PRINCIPAL' | 'ADMIN' | 'TEACHER' | 'STUDENT';
  currentViewTitle: string;
  departmentFilter?: string;
}) {
  const { branding, simulatedDate, currentUser } = useExam();

  const roleTitleMap = {
    PRINCIPAL: 'OFFICE OF THE PRINCIPAL · EXECUTIVE OVERSIGHT REPORT',
    ADMIN: 'OFFICE OF THE CONTROLLER OF EXAMINATIONS · OFFICIAL AUDIT RECORD',
    TEACHER: 'FACULTY ACADEMIC & EXAMINATION DOSSIER',
    STUDENT: 'CANDIDATE EXAMINATION TRANSCRIPT & SCHEDULE',
  };

  return (
    <div className="print-only mb-6 pb-4 border-b-2 border-neutral-800 font-sans print-header page-break-avoid print-avoid-break">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={branding.logoUrl || '/exam_system_logo.jpg'}
            alt="Emblem"
            width={56}
            height={56}
            style={{ width: '56px', height: '56px', maxWidth: '56px', maxHeight: '56px', objectFit: 'contain' }}
            className="w-14 h-14 object-contain rounded-md"
          />
          <div>
            <h1 className="text-lg font-serif font-black text-neutral-900 tracking-tight uppercase">
              {branding.collegeName}
            </h1>
            <p className="text-xs text-neutral-700 font-medium">
              {branding.subTitle || 'Examination Management & Directorate System'}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-900 font-bold mt-0.5">
              {roleTitleMap[dashboardType]}
            </p>
          </div>
        </div>

        {/* Right side report verification stamp */}
        <div className="text-right text-[10px] space-y-0.5 border-l-2 border-neutral-300 pl-3">
          <div className="font-mono text-neutral-500">Official Report Ref:</div>
          <div className="font-mono font-bold text-neutral-900">
            EMS-REP-{simulatedDate.replace(/-/g, '')}-{(dashboardType).slice(0, 3)}
          </div>
          <div className="text-neutral-600">
            Generated: <span className="font-semibold">{simulatedDate} 09:30</span>
          </div>
          <div className="text-neutral-600">
            Auth: <span className="font-semibold">{currentUser.name}</span> ({currentUser.role})
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-neutral-600">Active View: </span>
          <span className="font-bold text-neutral-900 uppercase tracking-wide">{currentViewTitle}</span>
          {departmentFilter && (
            <span className="ml-2 text-neutral-600">
              · Filter: <span className="font-semibold">{departmentFilter}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 inline" />
          <span>Verified Institutional Record · Confidential</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Institutional printable footer that appears exclusively during PDF export
 */
export function DashboardPrintFooter() {
  const { branding, simulatedDate } = useExam();

  return (
    <div className="print-only print-footer mt-8 pt-4 border-t border-neutral-300 text-[10px] text-neutral-500">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-neutral-700">{branding.collegeName}</span> · Examination Management System
          <div className="text-[9px] text-neutral-400 mt-0.5">
            Produced via secure institutional portal. All rights reserved. Record validated for session {simulatedDate}.
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif italic font-bold text-neutral-800">
            {branding.controllerName || 'Prof. Malcolm Thorne'}
          </div>
          <div className="text-[9px] text-neutral-600">
            {branding.controllerTitle || 'Controller of Examinations'}
          </div>
        </div>
      </div>
    </div>
  );
}
