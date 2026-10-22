'use client';

import { DateSheetEntry, PaperSubmission, DutyAssignment, ExamResult } from '@/types/exam-system';

export interface ExamArchiveRecord {
  id: string;
  archivedAt: string;
  sessionName: string;
  archivedBy: string;
  stats: {
    totalDateSheetEntries: number;
    totalPapers: number;
    totalDuties: number;
    totalResults: number;
    totalStudentsGraded: number;
    averageCgpa: number;
  };
  dateSheetSnapshot: DateSheetEntry[];
  papersSnapshot: PaperSubmission[];
  dutyRosterSnapshot: DutyAssignment[];
  resultsSnapshot: ExamResult[];
  summaryNotes: string;
  tamperHash?: string;
  status?: 'SEALED_ARCHIVE';
}

const STORAGE_KEY_ARCHIVES = 'exam_system_archives_v1';

export class ExamArchiveStorage {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  static getArchives(): ExamArchiveRecord[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ARCHIVES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveArchive(record: ExamArchiveRecord): ExamArchiveRecord[] {
    if (!this.isBrowser()) return [record];
    try {
      const existing = this.getArchives();
      const updated = [record, ...existing];
      localStorage.setItem(STORAGE_KEY_ARCHIVES, JSON.stringify(updated));
      return updated;
    } catch {
      return [record];
    }
  }

  static deleteArchive(id: string): ExamArchiveRecord[] {
    if (!this.isBrowser()) return [];
    try {
      const existing = this.getArchives();
      const updated = existing.filter((a) => a.id !== id);
      localStorage.setItem(STORAGE_KEY_ARCHIVES, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }
}
