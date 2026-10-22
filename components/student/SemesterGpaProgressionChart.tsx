'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import { useIsMounted } from '@/lib/use-is-mounted';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronRight,
  BarChart2,
  LineChart as LineChartIcon,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface SemesterStat {
  semesterNum: number;
  semesterLabel: string;
  semesterShort: string;
  semesterGpa: number;
  cumulativeGpa: number;
  creditHours: number;
  cumulativeCredits: number;
  coursesCount: number;
  courses: Array<{
    code: string;
    title: string;
    gradePoint: number;
    letterGrade: string;
    creditHours: number;
    totalMarks: number;
  }>;
  standing: string;
  delta: number;
}

export function SemesterGpaProgressionChart() {
  const { currentUser, results, courses, branding } = useExam();

  const [chartType, setChartType] = useState<'AREA' | 'BAR'>('AREA');
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const isMounted = useIsMounted();

  // Compute semester-wise metrics from actual student results
  const semesterProgressionData = useMemo<SemesterStat[]>(() => {
    const studentResults = results.filter((r) => r.studentId === currentUser.id);

    // Group by semester
    const semMap: { [sem: number]: typeof studentResults } = {};
    studentResults.forEach((res) => {
      const course = courses.find((c) => c.id === res.courseId);
      const sem = course?.semester || 1;
      if (!semMap[sem]) semMap[sem] = [];
      semMap[sem].push(res);
    });

    const sortedSemesters = Object.keys(semMap)
      .map(Number)
      .sort((a, b) => a - b);

    const progression: SemesterStat[] = [];
    let runningTotalCredits = 0;
    let runningTotalPoints = 0;
    let previousGpa = 0;

    for (const sem of sortedSemesters) {
      const semResults = semMap[sem];
      let semPoints = 0;
      let semCredits = 0;

      const courseList = semResults.map((res) => {
        const c = courses.find((crs) => crs.id === res.courseId);
        const credits = c?.creditHours || 3;
        semPoints += res.gradePoint * credits;
        semCredits += credits;

        return {
          code: c?.code || 'CRS',
          title: c?.title || 'Course',
          gradePoint: res.gradePoint,
          letterGrade: res.letterGrade,
          creditHours: credits,
          totalMarks: res.totalMarks,
        };
      });

      const semGpa = semCredits > 0 ? Number((semPoints / semCredits).toFixed(2)) : 0;

      runningTotalCredits += semCredits;
      runningTotalPoints += semPoints;
      const cumGpa =
        runningTotalCredits > 0 ? Number((runningTotalPoints / runningTotalCredits).toFixed(2)) : semGpa;

      const delta = previousGpa > 0 ? Number((semGpa - previousGpa).toFixed(2)) : 0;
      previousGpa = semGpa;

      let standing = 'Good Standing';
      if (semGpa >= 3.85) standing = "Dean's Highest Honors";
      else if (semGpa >= 3.7) standing = "Dean's Honor List";
      else if (semGpa >= 3.3) standing = 'First Class Standing';

      progression.push({
        semesterNum: sem,
        semesterLabel: `Semester ${sem}`,
        semesterShort: `Sem ${sem}`,
        semesterGpa: semGpa,
        cumulativeGpa: cumGpa,
        creditHours: semCredits,
        cumulativeCredits: runningTotalCredits,
        coursesCount: courseList.length,
        courses: courseList,
        standing,
        delta,
      });
    }

    return progression;
  }, [currentUser.id, results, courses]);

  // Active semester detail for drilldown
  const activeDetail = useMemo(() => {
    if (selectedSemester !== null) {
      return semesterProgressionData.find((s) => s.semesterNum === selectedSemester);
    }
    return semesterProgressionData[semesterProgressionData.length - 1];
  }, [semesterProgressionData, selectedSemester]);

  // Summary KPIs
  const overallCgpa =
    semesterProgressionData.length > 0
      ? semesterProgressionData[semesterProgressionData.length - 1].cumulativeGpa
      : 3.8;

  const totalCreditsEarned =
    semesterProgressionData.length > 0
      ? semesterProgressionData[semesterProgressionData.length - 1].cumulativeCredits
      : 0;

  const peakSemester = useMemo(() => {
    if (semesterProgressionData.length === 0) return null;
    return [...semesterProgressionData].sort((a, b) => b.semesterGpa - a.semesterGpa)[0];
  }, [semesterProgressionData]);

  const latestSemester = semesterProgressionData[semesterProgressionData.length - 1];

  if (!isMounted) {
    return (
      <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs space-y-4 animate-pulse">
        <div className="h-6 w-1/3 bg-emerald-100 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-emerald-50/50 rounded-lg border border-emerald-100" />
          ))}
        </div>
        <div className="h-64 bg-emerald-50/30 rounded-xl border border-emerald-100" />
      </div>
    );
  }

  if (semesterProgressionData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-emerald-200/80 p-6 text-center shadow-2xs">
        <GraduationCap className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-60" />
        <h3 className="text-sm font-semibold text-neutral-900">No Semester Results Published Yet</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
          As soon as the examination committee finalizes and uploads evaluated course grades, your semester-wise GPA progression chart will render here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
              <TrendingUp className="w-4 h-4 text-emerald-800" />
            </span>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              Semester-Wise GPA Progression & Performance Analytics
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Tracking longitudinal academic trajectory across enrolled terms under {branding.collegeName} 4.00 Grading Scale.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-emerald-50 rounded-lg text-xs border border-emerald-200/70 self-start sm:self-auto">
          <button
            onClick={() => setChartType('AREA')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              chartType === 'AREA'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-950'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            Area Trend
          </button>
          <button
            onClick={() => setChartType('BAR')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              chartType === 'BAR'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-950'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Semester vs CGPA
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Cumulative CGPA
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-950">
              {overallCgpa.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-700 font-mono font-medium">/ 4.00</span>
          </div>
          <div className="text-[10px] text-emerald-800 font-medium mt-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-600" />
            {overallCgpa >= 3.7 ? "Dean's Honor Roll" : 'Good Standing'}
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/30 rounded-xl border border-emerald-100">
          <div className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
            Latest Term GPA
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-neutral-900">
              {latestSemester?.semesterGpa.toFixed(2)}
            </span>
            {latestSemester?.delta !== 0 && (
              <span
                className={`text-[11px] font-mono font-bold ${
                  (latestSemester?.delta || 0) > 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {(latestSemester?.delta || 0) > 0 ? '+' : ''}
                {latestSemester?.delta.toFixed(2)}
              </span>
            )}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            {latestSemester?.semesterLabel} ({latestSemester?.creditHours} Credits)
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/30 rounded-xl border border-emerald-100">
          <div className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
            Peak Term Achievement
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-800">
              {peakSemester?.semesterGpa.toFixed(2)}
            </span>
            <span className="text-[11px] font-mono font-semibold text-emerald-700">
              {peakSemester?.semesterShort}
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            All-time highest semester grade
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/30 rounded-xl border border-emerald-100">
          <div className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
            Credits Earned
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-neutral-900">
              {totalCreditsEarned}
            </span>
            <span className="text-xs text-neutral-500 font-mono">/ 130 Total</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            Across {semesterProgressionData.length} completed terms
          </div>
        </div>
      </div>

      {/* Recharts Visual Canvas */}
      <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-700 pb-2">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            Progression Curve: Semester GPA vs Cumulative CGPA
          </span>
          <span className="text-[11px] text-neutral-500">
            Click any point or semester pill below to inspect term syllabus details
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'AREA' ? (
              <AreaChart
                data={semesterProgressionData}
                margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="cgpaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="semesterShort"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  domain={[2.0, 4.0]}
                  ticks={[2.0, 2.5, 3.0, 3.5, 4.0]}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as SemesterStat;
                      return (
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-md text-xs space-y-1.5 min-w-[200px]">
                          <div className="flex items-center justify-between font-bold text-neutral-900 border-b border-neutral-100 pb-1">
                            <span>{data.semesterLabel}</span>
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                              {data.standing}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-600">Semester GPA:</span>
                            <span className="font-mono font-bold text-emerald-800 text-sm">
                              {data.semesterGpa.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-600">Cumulative CGPA:</span>
                            <span className="font-mono font-bold text-sky-700">
                              {data.cumulativeGpa.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
                            <span>Credit Hours:</span>
                            <span className="font-mono">{data.creditHours} Credits</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-neutral-500">
                            <span>Graded Courses:</span>
                            <span className="font-mono">{data.coursesCount} Completed</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  formatter={(val) => (
                    <span className="text-xs font-medium text-neutral-700">{val}</span>
                  )}
                />
                <ReferenceLine
                  y={3.5}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Honors Benchmark (3.50)",
                    position: 'insideBottomRight',
                    fill: '#B45309',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="semesterGpa"
                  name="Semester GPA"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gpaGradient)"
                  activeDot={{ r: 6, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeGpa"
                  name="Cumulative CGPA"
                  stroke="#0284C7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#cgpaGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart
                data={semesterProgressionData}
                margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="semesterShort"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[2.0, 4.0]}
                  ticks={[2.0, 2.5, 3.0, 3.5, 4.0]}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#A7F3D0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  formatter={(val) => (
                    <span className="text-xs font-medium text-neutral-700">{val}</span>
                  )}
                />
                <ReferenceLine
                  y={3.5}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Bar
                  dataKey="semesterGpa"
                  name="Semester GPA"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cumulativeGpa"
                  name="Cumulative CGPA"
                  fill="#0284C7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Semester Selector Pills */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
          <span>Drill Down into Semester Performance:</span>
          {activeDetail && (
            <span className="text-[11px] text-emerald-800 font-mono font-medium">
              Selected: {activeDetail.semesterLabel} · Term GPA: {activeDetail.semesterGpa.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {semesterProgressionData.map((s) => {
            const isSelected =
              (selectedSemester === null && s.semesterNum === latestSemester?.semesterNum) ||
              selectedSemester === s.semesterNum;

            return (
              <button
                key={s.semesterNum}
                onClick={() => setSelectedSemester(s.semesterNum)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs font-bold'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <span>{s.semesterShort}</span>
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-emerald-900 text-emerald-100' : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {s.semesterGpa.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Semester Course Breakdown Card */}
      {activeDetail && (
        <div className="bg-emerald-50/30 rounded-xl border border-emerald-200/90 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-200">
            <div>
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                {activeDetail.semesterLabel} Course Breakdown & Official Scorecard
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Official marks verified by course instructor and examination branch.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-900">
                Term Credits: <strong>{activeDetail.creditHours}</strong>
              </span>
              <span className="text-emerald-900 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                GPA: {activeDetail.semesterGpa.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {activeDetail.courses.map((crs) => (
              <div
                key={crs.code}
                className="p-3 bg-white border border-emerald-100 rounded-lg space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-neutral-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {crs.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      Grade {crs.letterGrade}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      ({crs.gradePoint.toFixed(1)})
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-700 font-medium truncate" title={crs.title}>
                  {crs.title}
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-100">
                  <span>Score: {crs.totalMarks} / 100</span>
                  <span className="font-mono font-semibold text-neutral-700">
                    {crs.creditHours} Credit Hrs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
