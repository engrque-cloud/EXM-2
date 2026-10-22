import { DutyAssignment, User, DateSheetEntry, Course } from '@/types/exam-system';

export interface DutyConflictItem {
  dutyId: string;
  dateSheetEntryId: string;
  courseCode: string;
  courseTitle: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  hallNumber: string;
  role: string;
  isConfirmed: boolean;
}

export interface DutyConflict {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherDesignation?: string;
  examDate: string;
  overlapMinutes: number;
  duties: DutyAssignment[];
  conflictItems: DutyConflictItem[];
  conflictDescription: string;
  severity: 'HIGH_OVERLAP' | 'PARTIAL_OVERLAP' | 'EXACT_DUPLICATE';
}

/**
 * Parses time strings like "09:00 AM", "01:30 PM", "12:00 PM", "14:00" into minutes from midnight (0 - 1440).
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const trimmed = timeStr.trim().toUpperCase();
  const isPM = trimmed.includes('PM');
  const isAM = trimmed.includes('AM');
  const clean = trimmed.replace(/[AP]M/, '').trim();
  const [hourPart, minutePart] = clean.split(':');
  let hours = parseInt(hourPart, 10) || 0;
  const minutes = parseInt(minutePart, 10) || 0;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight back into a human-friendly "09:00 AM" string.
 */
export function formatMinutesToTime(minutesFromMidnight: number): string {
  const m = ((minutesFromMidnight % 1440) + 1440) % 1440;
  const hours24 = Math.floor(m / 60);
  const minutes = m % 60;
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours12)}:${pad(minutes)} ${isPM ? 'PM' : 'AM'}`;
}

/**
 * Checks whether two time intervals on the same day overlap.
 * Returns true if max(start1, start2) < min(end1, end2).
 */
export function checkTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseTimeToMinutes(start1);
  const e1 = parseTimeToMinutes(end1);
  const s2 = parseTimeToMinutes(start2);
  const e2 = parseTimeToMinutes(end2);

  // If end is equal to or before start (e.g. invalid), no positive overlap
  if (e1 <= s1 || e2 <= s2) return false;

  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Calculates the exact overlapping duration in minutes between two time intervals.
 */
export function getOverlapDurationMinutes(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): number {
  const s1 = parseTimeToMinutes(start1);
  const e1 = parseTimeToMinutes(end1);
  const s2 = parseTimeToMinutes(start2);
  const e2 = parseTimeToMinutes(end2);

  return Math.max(0, Math.min(e1, e2) - Math.max(s1, s2));
}

/**
 * Detects all overlapping duty conflicts across the entire Duty Roster.
 */
export function detectDutyConflicts(
  dutyRoster: DutyAssignment[],
  users: User[],
  dateSheet: DateSheetEntry[],
  courses: Course[]
): DutyConflict[] {
  const conflicts: DutyConflict[] = [];

  // Group duties by teacherId and examDate
  const grouped: Record<string, DutyAssignment[]> = {};
  for (const duty of dutyRoster) {
    const key = `${duty.teacherId}__${duty.examDate}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(duty);
  }

  // Iterate over groups and look for pairwise overlaps
  for (const [key, duties] of Object.entries(grouped)) {
    if (duties.length < 2) continue;

    const [teacherId, examDate] = key.split('__');
    const teacher = users.find((u) => u.id === teacherId);
    if (!teacher) continue;

    // Check every pair
    for (let i = 0; i < duties.length; i++) {
      for (let j = i + 1; j < duties.length; j++) {
        const d1 = duties[i];
        const d2 = duties[j];

        if (checkTimeOverlap(d1.startTime, d1.endTime, d2.startTime, d2.endTime)) {
          const overlapMins = getOverlapDurationMinutes(
            d1.startTime,
            d1.endTime,
            d2.startTime,
            d2.endTime
          );

          const ds1 = dateSheet.find((d) => d.id === d1.dateSheetEntryId);
          const c1 = courses.find((c) => c.id === ds1?.courseId);

          const ds2 = dateSheet.find((d) => d.id === d2.dateSheetEntryId);
          const c2 = courses.find((c) => c.id === ds2?.courseId);

          const conflictItems: DutyConflictItem[] = [
            {
              dutyId: d1.id,
              dateSheetEntryId: d1.dateSheetEntryId,
              courseCode: c1?.code || 'Course 1',
              courseTitle: c1?.title || 'Examination Session',
              timeSlot: `${d1.startTime} – ${d1.endTime}`,
              startTime: d1.startTime,
              endTime: d1.endTime,
              hallNumber: d1.hallNumber,
              role: d1.role,
              isConfirmed: d1.isConfirmed,
            },
            {
              dutyId: d2.id,
              dateSheetEntryId: d2.dateSheetEntryId,
              courseCode: c2?.code || 'Course 2',
              courseTitle: c2?.title || 'Examination Session',
              timeSlot: `${d2.startTime} – ${d2.endTime}`,
              startTime: d2.startTime,
              endTime: d2.endTime,
              hallNumber: d2.hallNumber,
              role: d2.role,
              isConfirmed: d2.isConfirmed,
            },
          ];

          let severity: DutyConflict['severity'] = 'PARTIAL_OVERLAP';
          if (d1.startTime === d2.startTime && d1.endTime === d2.endTime) {
            severity = 'EXACT_DUPLICATE';
          } else if (overlapMins >= 60) {
            severity = 'HIGH_OVERLAP';
          }

          conflicts.push({
            id: `conflict-${d1.id}-${d2.id}`,
            teacherId: teacher.id,
            teacherName: teacher.name,
            teacherEmail: teacher.email,
            teacherDesignation: teacher.designation,
            examDate,
            overlapMinutes: overlapMins,
            duties: [d1, d2],
            conflictItems,
            conflictDescription: `${teacher.name} is scheduled concurrently in ${d1.hallNumber} (${d1.startTime}–${d1.endTime}) and ${d2.hallNumber} (${d2.startTime}–${d2.endTime}) with ${overlapMins} minutes overlap.`,
            severity,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Checks if a specific proposed duty assignment clashes with existing duties of that teacher.
 */
export function checkProposedDutyOverlap(
  teacherId: string,
  examDate: string,
  startTime: string,
  endTime: string,
  dutyRoster: DutyAssignment[],
  dateSheet: DateSheetEntry[],
  courses: Course[],
  excludeDutyId?: string
): { hasConflict: boolean; conflictingDuties: DutyConflictItem[]; message?: string } {
  const teacherDuties = dutyRoster.filter(
    (d) =>
      d.teacherId === teacherId &&
      d.examDate === examDate &&
      (!excludeDutyId || d.id !== excludeDutyId)
  );

  const conflicting: DutyConflictItem[] = [];

  for (const d of teacherDuties) {
    if (checkTimeOverlap(startTime, endTime, d.startTime, d.endTime)) {
      const ds = dateSheet.find((entry) => entry.id === d.dateSheetEntryId);
      const c = courses.find((course) => course.id === ds?.courseId);

      conflicting.push({
        dutyId: d.id,
        dateSheetEntryId: d.dateSheetEntryId,
        courseCode: c?.code || 'Course',
        courseTitle: c?.title || 'Exam Session',
        timeSlot: `${d.startTime} – ${d.endTime}`,
        startTime: d.startTime,
        endTime: d.endTime,
        hallNumber: d.hallNumber,
        role: d.role,
        isConfirmed: d.isConfirmed,
      });
    }
  }

  if (conflicting.length > 0) {
    const details = conflicting
      .map((c) => `${c.courseCode} in ${c.hallNumber} (${c.timeSlot})`)
      .join(', ');
    return {
      hasConflict: true,
      conflictingDuties: conflicting,
      message: `Staff member has an overlapping duty on ${examDate}: ${details}`,
    };
  }

  return { hasConflict: false, conflictingDuties: [] };
}

/**
 * Finds available teachers for a specific date and time slot.
 */
export function getFacultyAvailabilityForSlot(
  examDate: string,
  startTime: string,
  endTime: string,
  allTeachers: User[],
  dutyRoster: DutyAssignment[],
  courses: Course[],
  dateSheet: DateSheetEntry[],
  excludeDutyId?: string
): {
  availableTeachers: User[];
  busyTeachers: { teacher: User; conflictDetails: string }[];
} {
  const availableTeachers: User[] = [];
  const busyTeachers: { teacher: User; conflictDetails: string }[] = [];

  for (const teacher of allTeachers) {
    const check = checkProposedDutyOverlap(
      teacher.id,
      examDate,
      startTime,
      endTime,
      dutyRoster,
      dateSheet,
      courses,
      excludeDutyId
    );

    if (check.hasConflict) {
      busyTeachers.push({
        teacher,
        conflictDetails: check.message || 'Occupied during this exam session',
      });
    } else {
      availableTeachers.push(teacher);
    }
  }

  return { availableTeachers, busyTeachers };
}
