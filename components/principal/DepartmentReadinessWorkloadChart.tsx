'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import { useIsMounted } from '@/lib/use-is-mounted';
import {
  ResponsiveContainer,
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
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building,
  TrendingUp,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

interface DeptAnalytics {
  deptId: string;
  deptCode: string;
  deptName: string;
  hodName: string;
  totalPapers: number;
  readyPapers: number;
  pendingPapers: number;
  readinessRate: number;
  facultyCount: number;
  totalDutiesAssigned: number;
  activeTeachersOnDuty: number;
  avgDutiesPerTeacher: number;
  workloadStatus: 'LIGHT' | 'BALANCED' | 'HEAVY';
}

interface Props {
  onSelectDepartmentFilter?: (deptId: string) => void;
}

export function DepartmentReadinessWorkloadChart({ onSelectDepartmentFilter }: Props) {
  const { departments, courses, users, dateSheet, papers, dutyRoster, branding } = useExam();

  const [metricView, setMetricView] = useState<'ABSOLUTE' | 'PERCENTAGE'>('ABSOLUTE');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const isMounted = useIsMounted();

  // Compute department-wise readiness and workload
  const deptAnalyticsData = useMemo<DeptAnalytics[]>(() => {
    return departments.map((dept) => {
      const deptDateSheet = dateSheet.filter((ds) => ds.departmentId === dept.id);
      const totalPapers = deptDateSheet.length;

      let readyCount = 0;
      let pendingCount = 0;

      deptDateSheet.forEach((ds) => {
        const paper = papers.find((p) => p.dateSheetEntryId === ds.id);
        const isReady =
          paper?.qaStatus === 'QA_APPROVED' ||
          ds.status === 'EXAM_CALLED' ||
          ds.status === 'RESULTS_UPLOADED';

        if (isReady) {
          readyCount += 1;
        } else {
          pendingCount += 1;
        }
      });

      const readinessRate = totalPapers > 0 ? Math.round((readyCount / totalPapers) * 100) : 0;

      // Faculty in this department
      const deptFaculty = users.filter(
        (u) => u.role === 'TEACHER' && u.departmentId === dept.id && u.isApproved
      );
      const facultyCount = deptFaculty.length || 1; // avoid division by zero
      const deptTeacherIds = new Set(deptFaculty.map((f) => f.id));

      // Duties assigned to this department's faculty
      const assignedDuties = dutyRoster.filter((duty) => deptTeacherIds.has(duty.teacherId));
      const totalDutiesAssigned = assignedDuties.length;
      const activeTeachersOnDuty = new Set(assignedDuties.map((d) => d.teacherId)).size;
      const avgDutiesPerTeacher = Number((totalDutiesAssigned / facultyCount).toFixed(1));

      let workloadStatus: 'LIGHT' | 'BALANCED' | 'HEAVY' = 'BALANCED';
      if (avgDutiesPerTeacher > 2.0) workloadStatus = 'HEAVY';
      else if (avgDutiesPerTeacher < 1.0) workloadStatus = 'LIGHT';

      return {
        deptId: dept.id,
        deptCode: dept.code,
        deptName: dept.name,
        hodName: dept.hodName,
        totalPapers,
        readyPapers: readyCount,
        pendingPapers: pendingCount,
        readinessRate,
        facultyCount,
        totalDutiesAssigned,
        activeTeachersOnDuty,
        avgDutiesPerTeacher,
        workloadStatus,
      };
    });
  }, [departments, dateSheet, papers, users, dutyRoster]);

  // High-level aggregates
  const institutionalTotals = useMemo(() => {
    const totalScheduled = deptAnalyticsData.reduce((acc, d) => acc + d.totalPapers, 0);
    const totalReady = deptAnalyticsData.reduce((acc, d) => acc + d.readyPapers, 0);
    const totalPending = deptAnalyticsData.reduce((acc, d) => acc + d.pendingPapers, 0);
    const totalDuties = deptAnalyticsData.reduce((acc, d) => acc + d.totalDutiesAssigned, 0);
    const totalFaculty = deptAnalyticsData.reduce((acc, d) => acc + d.facultyCount, 0);
    const institutionalReadiness =
      totalScheduled > 0 ? Math.round((totalReady / totalScheduled) * 100) : 0;
    const avgWorkload = totalFaculty > 0 ? Number((totalDuties / totalFaculty).toFixed(1)) : 0;

    return {
      totalScheduled,
      totalReady,
      totalPending,
      totalDuties,
      totalFaculty,
      institutionalReadiness,
      avgWorkload,
    };
  }, [deptAnalyticsData]);

  // Selected department details
  const activeDept = useMemo(() => {
    if (selectedDeptId) {
      return deptAnalyticsData.find((d) => d.deptId === selectedDeptId);
    }
    return deptAnalyticsData[0];
  }, [deptAnalyticsData, selectedDeptId]);

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

  return (
    <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
              <BarChart2 className="w-4 h-4 text-emerald-800" />
            </span>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              Department-Wise Exam Readiness & Faculty Workload
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Comparative institutional evaluation across academic departments: QA-endorsed papers vs concurrent supervision duty quotas.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-emerald-50 rounded-lg text-xs border border-emerald-200/70 self-start sm:self-auto">
          <button
            onClick={() => setMetricView('ABSOLUTE')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              metricView === 'ABSOLUTE'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-950'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Grouped Counts
          </button>
          <button
            onClick={() => setMetricView('PERCENTAGE')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              metricView === 'PERCENTAGE'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-950'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Readiness Rate %
          </button>
        </div>
      </div>

      {/* Institutional KPI Metric Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
          <div className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
            Overall Exam Readiness
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-950">
              {institutionalTotals.institutionalReadiness}%
            </span>
            <span className="text-xs text-emerald-700 font-mono">
              ({institutionalTotals.totalReady}/{institutionalTotals.totalScheduled} Papers)
            </span>
          </div>
          <div className="text-[10px] text-emerald-800 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            QA verified & ready for printing
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/80">
          <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
            Pending / In QA Review
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-amber-900">
              {institutionalTotals.totalPending}
            </span>
            <span className="text-xs text-amber-700 font-mono">Papers Bottlenecked</span>
          </div>
          <div className="text-[10px] text-amber-800 font-medium mt-1">
            Requires Teacher upload or QA clearance
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/30 rounded-xl border border-emerald-100">
          <div className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
            Total Invigilation Duties
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-neutral-900">
              {institutionalTotals.totalDuties}
            </span>
            <span className="text-xs text-neutral-500 font-mono">Duties Allocated</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            Across {institutionalTotals.totalFaculty} active faculty members
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/30 rounded-xl border border-emerald-100">
          <div className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
            Average Faculty Load
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-800">
              {institutionalTotals.avgWorkload}
            </span>
            <span className="text-xs text-neutral-500 font-mono">Duties / Teacher</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
            <Scale className="w-3 h-3 text-emerald-700" />
            Institutional equity threshold: &le; 2.0
          </div>
        </div>
      </div>

      {/* Recharts Grouped Bar Chart Visual Canvas */}
      <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-700 pb-1">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            Grouped Bar Breakdown: English, Mathematics, and Computer Science
          </span>
          <span className="text-[11px] text-neutral-500">
            Hover over any cluster to view department head & quota details
          </span>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {metricView === 'ABSOLUTE' ? (
              <BarChart
                data={deptAnalyticsData}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="deptCode"
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#0F172A' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DeptAnalytics;
                      return (
                        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-md text-xs space-y-2 min-w-[240px]">
                          <div className="border-b border-neutral-100 pb-1.5">
                            <div className="font-bold text-neutral-900 text-sm">{data.deptName}</div>
                            <div className="text-[11px] text-neutral-500">
                              HOD: <span className="font-medium text-neutral-800">{data.hodName}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                              Exam Readiness ({data.readinessRate}%)
                            </div>
                            <div className="flex justify-between items-center text-emerald-900">
                              <span>Ready / QA-Approved:</span>
                              <span className="font-mono font-bold text-emerald-700">{data.readyPapers} Papers</span>
                            </div>
                            <div className="flex justify-between items-center text-amber-800">
                              <span>Pending / In Review:</span>
                              <span className="font-mono font-bold text-amber-700">{data.pendingPapers} Papers</span>
                            </div>
                            <div className="flex justify-between items-center text-neutral-600 pt-1 border-t border-neutral-100">
                              <span>Total Scheduled:</span>
                              <span className="font-mono font-bold text-neutral-800">{data.totalPapers}</span>
                            </div>
                          </div>

                          <div className="space-y-1 pt-1.5 border-t border-neutral-100">
                            <div className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">
                              Faculty Workload
                            </div>
                            <div className="flex justify-between items-center text-neutral-700">
                              <span>Duties Assigned:</span>
                              <span className="font-mono font-bold text-indigo-700">{data.totalDutiesAssigned} Duties</span>
                            </div>
                            <div className="flex justify-between items-center text-neutral-600">
                              <span>Approved Teachers:</span>
                              <span className="font-mono font-medium">{data.facultyCount}</span>
                            </div>
                            <div className="flex justify-between items-center text-neutral-700 font-medium">
                              <span>Average Load:</span>
                              <span className="font-mono font-bold text-emerald-800">
                                {data.avgDutiesPerTeacher} / Teacher
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-neutral-700">{value}</span>
                  )}
                />
                <Bar
                  dataKey="readyPapers"
                  name="Ready Papers (QA-Approved)"
                  fill="#059669" // emerald-600
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pendingPapers"
                  name="Pending Papers (In Review/Upload)"
                  fill="#F59E0B" // amber-500
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="totalDutiesAssigned"
                  name="Invigilation Duties Assigned"
                  fill="#4F46E5" // indigo-600
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <BarChart
                data={deptAnalyticsData}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="deptCode"
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#0F172A' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickFormatter={(val) => `${val}%`}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}%`,
                    name === 'readinessRate' ? 'Exam Readiness Rate' : name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#A7F3D0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-neutral-700">
                      {value === 'readinessRate' ? 'Department Readiness Index (%)' : value}
                    </span>
                  )}
                />
                <ReferenceLine
                  y={75}
                  stroke="#059669"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Institutional Target (75%)',
                    position: 'insideTopRight',
                    fill: '#065F46',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="readinessRate"
                  name="readinessRate"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Departmental Breakdown & Fast-Action Switcher
          </h3>
          <span className="text-[11px] text-neutral-500">
            Click any department to inspect metrics & filter inspection table
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {deptAnalyticsData.map((d) => {
            const isSelected = selectedDeptId === d.deptId;
            return (
              <div
                key={d.deptId}
                onClick={() => {
                  setSelectedDeptId(d.deptId);
                  if (onSelectDepartmentFilter) {
                    onSelectDepartmentFilter(d.deptId);
                  }
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
                    : 'bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {d.deptCode}
                    </span>
                    <span className="font-bold text-neutral-900 text-xs truncate max-w-[150px]">
                      {d.deptName.replace('Department of ', '')}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      d.readinessRate >= 75
                        ? 'bg-emerald-100 text-emerald-900'
                        : d.readinessRate >= 50
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {d.readinessRate}% Ready
                  </span>
                </div>

                {/* Readiness Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-neutral-600">
                    <span>Paper QA Readiness</span>
                    <span className="font-mono font-bold text-neutral-900">
                      {d.readyPapers} / {d.totalPapers}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${d.readinessRate}%` }}
                      className="bg-emerald-600 h-full transition-all"
                    />
                    <div
                      style={{ width: `${100 - d.readinessRate}%` }}
                      className="bg-amber-400 h-full transition-all"
                    />
                  </div>
                </div>

                {/* Faculty Workload Meter */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Faculty Workload</span>
                    <span className="font-mono font-bold text-neutral-900">
                      {d.totalDutiesAssigned} Duties ({d.avgDutiesPerTeacher}/teacher)
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      d.workloadStatus === 'BALANCED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : d.workloadStatus === 'LIGHT'
                        ? 'bg-neutral-100 text-neutral-700'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {d.workloadStatus === 'BALANCED'
                      ? 'Balanced'
                      : d.workloadStatus === 'LIGHT'
                      ? 'Light Quota'
                      : 'Heavy Load'}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                  <span>HOD: {d.hodName}</span>
                  <span className="flex items-center gap-0.5 text-emerald-700 text-[10px] font-bold">
                    Filter View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
