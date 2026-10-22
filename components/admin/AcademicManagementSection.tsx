'use client';

import React, { useState, useMemo } from 'react';
import { useExam } from '@/lib/exam-context';
import { Department, Course, User } from '@/types/exam-system';
import {
  Building,
  BookOpen,
  GraduationCap,
  Users,
  Plus,
  Check,
  CheckCircle2,
  X,
  Search,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  BookMarked,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function AcademicManagementSection() {
  const {
    departments,
    courses,
    users,
    dateSheet,
    addDepartment,
    addCourse,
    addTeacher,
    assignTeacherSubjects,
    resetAllData,
    purgeAllData,
    simulatedDate,
  } = useExam();

  // Navigation Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'DEPTS' | 'COURSES' | 'TEACHERS' | 'RESET'>('DEPTS');

  // Success Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ title: string; detail: string } | null>(null);

  const showFeedback = (title: string, detail: string) => {
    setFeedbackMsg({ title, detail });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  // ----------------------------------------------------
  // 1. ADD DEPARTMENT MODAL & STATE
  // ----------------------------------------------------
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHod, setDeptHod] = useState('');

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim() || !deptHod.trim()) return;

    const created = addDepartment({
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      hodName: deptHod.trim(),
    });

    showFeedback(
      'Department Created',
      `"${created.name}" (${created.code}) created with HOD ${created.hodName}.`
    );

    setDeptName('');
    setDeptCode('');
    setDeptHod('');
    setIsAddDeptModalOpen(false);
  };

  // ----------------------------------------------------
  // 2. ADD COURSE MODAL & STATE
  // ----------------------------------------------------
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [courseDeptId, setCourseDeptId] = useState(departments[0]?.id || '');
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSemester, setCourseSemester] = useState<number>(1);
  const [courseCreditHours, setCourseCreditHours] = useState<number>(3);
  const [courseFilterDept, setCourseFilterDept] = useState<string>('ALL');
  const [courseSearch, setCourseSearch] = useState<string>('');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseTitle.trim() || !courseDeptId) return;

    const created = addCourse({
      code: courseCode.trim().toUpperCase(),
      title: courseTitle.trim(),
      departmentId: courseDeptId,
      semester: Number(courseSemester) || 1,
      creditHours: Number(courseCreditHours) || 3,
    });

    const dept = departments.find((d) => d.id === courseDeptId);

    showFeedback(
      'Course Added to Curriculum',
      `${created.code} - ${created.title} added under ${dept?.name || 'Department'} (Semester ${created.semester}).`
    );

    setCourseCode('');
    setCourseTitle('');
    setCourseSemester(1);
    setCourseCreditHours(3);
    setIsAddCourseModalOpen(false);
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (courseFilterDept !== 'ALL' && c.departmentId !== courseFilterDept) return false;
      if (courseSearch.trim()) {
        const query = courseSearch.toLowerCase();
        return (
          c.code.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [courses, courseFilterDept, courseSearch]);

  // ----------------------------------------------------
  // 3. TEACHERS & SUBJECT ASSIGNMENT STATE
  // ----------------------------------------------------
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherDeptId, setTeacherDeptId] = useState(departments[0]?.id || '');
  const [teacherDesignation, setTeacherDesignation] = useState('Assistant Professor');
  const [teacherSelectedCourses, setTeacherSelectedCourses] = useState<string[]>([]);
  const [teacherSearch, setTeacherSearch] = useState('');

  // Edit Teacher Teaching Subjects Modal
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [assignedCourseSelection, setAssignedCourseSelection] = useState<string[]>([]);

  const handleOpenEditSubjects = (t: User) => {
    setEditingTeacher(t);
    setAssignedCourseSelection(t.assignedCourseIds || []);
  };

  const handleSaveTeacherSubjects = () => {
    if (!editingTeacher) return;
    assignTeacherSubjects(editingTeacher.id, assignedCourseSelection);

    const taughtNames = courses
      .filter((c) => assignedCourseSelection.includes(c.id))
      .map((c) => c.code)
      .join(', ');

    showFeedback(
      'Teaching Assignments Updated',
      `Assigned [${taughtNames || 'None'}] to ${editingTeacher.name}.`
    );
    setEditingTeacher(null);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim() || !teacherDeptId) return;

    const created = addTeacher({
      name: teacherName.trim(),
      email: teacherEmail.trim().toLowerCase(),
      departmentId: teacherDeptId,
      designation: teacherDesignation.trim() || 'Lecturer',
      assignedCourseIds: teacherSelectedCourses,
    });

    const dept = departments.find((d) => d.id === teacherDeptId);

    showFeedback(
      'Faculty Member Registered',
      `${created.name} registered under ${dept?.name || 'Department'} with ${teacherSelectedCourses.length} assigned subject(s).`
    );

    setTeacherName('');
    setTeacherEmail('');
    setTeacherDesignation('Assistant Professor');
    setTeacherSelectedCourses([]);
    setIsAddTeacherModalOpen(false);
  };

  // Faculty list
  const facultyMembers = useMemo(() => {
    return users.filter((u) => u.role === 'TEACHER');
  }, [users]);

  const filteredFaculty = useMemo(() => {
    return facultyMembers.filter((t) => {
      if (!teacherSearch.trim()) return true;
      const q = teacherSearch.toLowerCase();
      const dept = departments.find((d) => d.id === t.departmentId);
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.designation && t.designation.toLowerCase().includes(q)) ||
        (dept && dept.name.toLowerCase().includes(q))
      );
    });
  }, [facultyMembers, teacherSearch, departments]);

  // ----------------------------------------------------
  // 4. REMOVE ALL DATA / SYSTEM PURGE CONFIRMATION
  // ----------------------------------------------------
  const [purgeModalType, setPurgeModalType] = useState<'EXAM_DATA_ONLY' | 'COMPLETE_FACTORY_RESET' | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const handleExecutePurge = () => {
    if (purgeModalType === 'EXAM_DATA_ONLY') {
      purgeAllData();
      showFeedback(
        'All Examination Data Purged',
        'All date sheets, question papers, duty assignments, and exam results have been removed.'
      );
    } else if (purgeModalType === 'COMPLETE_FACTORY_RESET') {
      resetAllData();
      showFeedback(
        'Complete Database Reset',
        'System database reset to initial baseline benchmark dataset.'
      );
    }
    setPurgeModalType(null);
    setConfirmInput('');
  };

  return (
    <div className="space-y-6">
      {/* Executive Feedback Banner */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl shadow-2xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">{feedbackMsg.title}</div>
              <div className="text-xs text-emerald-800">{feedbackMsg.detail}</div>
            </div>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-emerald-200/80 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  Academic Structure & Faculty Subject Allocation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Controller Authority
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Establish academic departments, introduce curriculum courses, assign teaching faculty to subjects, and manage system data resets.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
              <span className="block text-emerald-900 font-bold font-mono text-sm">{departments.length}</span>
              <span className="text-[10px] text-emerald-700 font-medium">Departments</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
              <span className="block text-emerald-900 font-bold font-mono text-sm">{courses.length}</span>
              <span className="text-[10px] text-emerald-700 font-medium">Courses</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
              <span className="block text-emerald-900 font-bold font-mono text-sm">{facultyMembers.length}</span>
              <span className="text-[10px] text-emerald-700 font-medium">Faculty</span>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-emerald-100">
          <button
            onClick={() => setActiveSubTab('DEPTS')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'DEPTS'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Departments ({departments.length})
          </button>

          <button
            onClick={() => setActiveSubTab('COURSES')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'COURSES'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Courses &amp; Curriculum ({courses.length})
          </button>

          <button
            onClick={() => setActiveSubTab('TEACHERS')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'TEACHERS'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Faculty &amp; Teaching Subjects ({facultyMembers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('RESET')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ml-auto ${
              activeSubTab === 'RESET'
                ? 'bg-red-700 text-white shadow-2xs'
                : 'text-red-700 hover:text-red-900 hover:bg-red-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Remove All Data / Reset
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DEPARTMENTS VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'DEPTS' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Academic Departments</h3>
              <p className="text-xs text-neutral-500">
                Official colleges and faculties recognized in the examination database.
              </p>
            </div>
            <button
              onClick={() => setIsAddDeptModalOpen(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptCourses = courses.filter((c) => c.departmentId === dept.id);
              const deptFaculty = users.filter((u) => u.departmentId === dept.id && u.role === 'TEACHER');
              const deptExams = dateSheet.filter((ds) => ds.departmentId === dept.id);

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-2xs hover:border-emerald-400 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {dept.code}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-900 mt-2">{dept.name}</h4>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                      <Building className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-xs text-neutral-600 pt-2 border-t border-neutral-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Head of Department:</span>
                      <span className="font-semibold text-neutral-800">{dept.hodName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Curriculum Courses:</span>
                      <span className="font-mono font-semibold text-emerald-900">{deptCourses.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Assigned Faculty:</span>
                      <span className="font-mono font-semibold text-emerald-900">{deptFaculty.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Scheduled Exams:</span>
                      <span className="font-mono font-semibold text-emerald-900">{deptExams.length}</span>
                    </div>
                  </div>

                  {/* Course Pills */}
                  {deptCourses.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1">
                      {deptCourses.slice(0, 4).map((c) => (
                        <span
                          key={c.id}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700"
                        >
                          {c.code}
                        </span>
                      ))}
                      {deptCourses.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 text-neutral-400">
                          +{deptCourses.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COURSES / SUBJECTS VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'COURSES' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Curriculum Courses &amp; Subjects</h3>
              <p className="text-xs text-neutral-500">
                Official accredited syllabus subjects eligible for examination scheduling and grading.
              </p>
            </div>
            <button
              onClick={() => setIsAddCourseModalOpen(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add New Course / Subject
            </button>
          </div>

          {/* Filtering Bar */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search code or title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-emerald-50 rounded-md text-xs">
                <button
                  onClick={() => setCourseFilterDept('ALL')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    courseFilterDept === 'ALL'
                      ? 'bg-white font-semibold text-emerald-950 shadow-2xs'
                      : 'text-emerald-800'
                  }`}
                >
                  All Depts
                </button>
                {departments.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setCourseFilterDept(d.id)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      courseFilterDept === d.id
                        ? 'bg-white font-semibold text-emerald-950 shadow-2xs'
                        : 'text-emerald-800'
                    }`}
                  >
                    {d.code}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-neutral-500">
              Showing <strong className="text-neutral-900">{filteredCourses.length}</strong> of {courses.length} courses
            </span>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-xl border border-emerald-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100 text-emerald-900 font-bold">
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Subject Title</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Teaching Faculty Assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                        No courses found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((c) => {
                      const dept = departments.find((d) => d.id === c.departmentId);
                      // Teachers who teach this course
                      const teachingFaculty = facultyMembers.filter(
                        (t) => t.assignedCourseIds && t.assignedCourseIds.includes(c.id)
                      );

                      return (
                        <tr key={c.id} className="hover:bg-emerald-50/20">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                            {c.code}
                          </td>
                          <td className="py-3 px-4 font-medium text-neutral-900">
                            {c.title}
                          </td>
                          <td className="py-3 px-4 text-neutral-700">
                            <span className="font-semibold text-emerald-900">{dept?.code}</span> · {dept?.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-700">
                            Semester {c.semester}
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-700">
                            {c.creditHours} Cr. Hrs
                          </td>
                          <td className="py-3 px-4">
                            {teachingFaculty.length === 0 ? (
                              <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Unassigned
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {teachingFaculty.map((t) => (
                                  <span
                                    key={t.id}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200"
                                  >
                                    <GraduationCap className="w-3 h-3 text-emerald-700" />
                                    {t.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TEACHERS & TEACHING SUBJECTS ASSIGNMENT VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'TEACHERS' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Teaching Faculty &amp; Subject Assignments</h3>
              <p className="text-xs text-neutral-500">
                Register teachers, assign which subjects/courses each faculty member teaches, and configure examination responsibilities.
              </p>
            </div>
            <button
              onClick={() => setIsAddTeacherModalOpen(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add New Teacher
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-emerald-200/80 p-3.5 flex items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search teacher name, email, department..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
            <span className="text-xs text-neutral-500">
              Total Faculty: <strong className="text-neutral-900">{facultyMembers.length}</strong>
            </span>
          </div>

          {/* Faculty List */}
          <div className="bg-white rounded-xl border border-emerald-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100 text-emerald-900 font-bold">
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Subjects Teaching (Assigned Courses)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredFaculty.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-neutral-400">
                        No teachers found. Click &quot;Add New Teacher&quot; above to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredFaculty.map((t) => {
                      const dept = departments.find((d) => d.id === t.departmentId);
                      const assignedCourses = courses.filter((c) =>
                        t.assignedCourseIds && t.assignedCourseIds.includes(c.id)
                      );

                      return (
                        <tr key={t.id} className="hover:bg-emerald-50/20">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0 border border-emerald-200">
                                {t.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-neutral-900">{t.name}</div>
                                <div className="text-[11px] text-neutral-500 font-mono">{t.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-700">
                            <span className="font-semibold text-emerald-900">{dept?.code}</span> · {dept?.name}
                          </td>
                          <td className="py-3 px-4 text-neutral-600">
                            {t.designation || 'Lecturer'}
                          </td>
                          <td className="py-3 px-4">
                            {assignedCourses.length === 0 ? (
                              <span className="text-[11px] text-neutral-400 italic">
                                No subjects assigned yet
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {assignedCourses.map((c) => (
                                  <span
                                    key={c.id}
                                    className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200"
                                  >
                                    <BookMarked className="w-3 h-3 text-emerald-700" />
                                    {c.code}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenEditSubjects(t)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3 text-emerald-700" />
                              Assign / Edit Subjects
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DANGER ZONE / REMOVE ALL DATA VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'RESET' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 bg-red-50/70 border border-red-300 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-950">
                  Executive Administrative Data Purge &amp; Reset Authority
                </h3>
                <p className="text-xs text-red-800 mt-0.5">
                  High-level institutional control to wipe exam records, remove date sheets, or execute a clean baseline restart.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Action 1: Purge Exam Data Only */}
            <div className="bg-white rounded-xl border border-red-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Purge All Examination &amp; Schedule Data</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Removes all scheduled <strong>Date Sheets</strong>, uploaded <strong>Question Papers</strong>, <strong>Invigilation Duty Assignments</strong>, and published <strong>Exam Results</strong>.
                </p>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                  <div>✓ Keeps academic departments, courses, and registered faculty intact.</div>
                  <div>✓ Resets exam readiness to 0% for a clean upcoming semester cycle.</div>
                  <div>✓ Fully logged into the tamper-proof Activity Audit Feed.</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setPurgeModalType('EXAM_DATA_ONLY');
                  setConfirmInput('');
                }}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Purge All Examination Data
              </button>
            </div>

            {/* Action 2: Complete Factory Reset */}
            <div className="bg-white rounded-xl border border-red-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                  <RefreshCw className="w-4 h-4 text-red-600" />
                  <span>Full Institutional Factory Reset (Wipe All Data)</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Completely wipes the entire database storage, restoring all departments, sample faculty, standard course catalog, and pristine demo benchmark records.
                </p>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                  <div>✓ Resets simulated date back to benchmark (2026-10-16).</div>
                  <div>✓ Reinitializes all 3 accredited departments (CS, Math, English).</div>
                  <div>✓ Restores pre-loaded QA question papers and duty rosters.</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setPurgeModalType('COMPLETE_FACTORY_RESET');
                  setConfirmInput('');
                }}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reset All Data to Baseline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD DEPARTMENT */}
      {/* ========================================================================= */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Establish Academic Department</h3>
                  <p className="text-xs text-neutral-500">Create new department in university records</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDeptModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of Artificial Intelligence"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI or PHY"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md uppercase font-mono focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Head of Dept (HOD)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={deptHod}
                    onChange={(e) => setDeptHod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD COURSE */}
      {/* ========================================================================= */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Add Course / Subject</h3>
                  <p className="text-xs text-neutral-500">Incorporate into university curriculum</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCourseModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Department
                </label>
                <select
                  value={courseDeptId}
                  onChange={(e) => setCourseDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-201"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md uppercase font-mono focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Credit Hours
                  </label>
                  <select
                    value={courseCreditHours}
                    onChange={(e) => setCourseCreditHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((ch) => (
                      <option key={ch} value={ch}>
                        {ch} Cr. Hrs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Subject Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning & Computer Vision"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Semester (1 to 8)
                </label>
                <select
                  value={courseSemester}
                  onChange={(e) => setCourseSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD TEACHER WITH TEACHING SUBJECTS */}
      {/* ========================================================================= */}
      {isAddTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Register Faculty Member</h3>
                  <p className="text-xs text-neutral-500">Add teacher and select which subjects they teach</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTeacherModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Alan Turing, Ph.D."
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. turing@university.edu"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Associate Professor"
                    value={teacherDesignation}
                    onChange={(e) => setTeacherDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Department
                </label>
                <select
                  value={teacherDeptId}
                  onChange={(e) => setTeacherDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    Which Subject(s) Are They Teaching?
                  </label>
                  <span className="text-[11px] text-emerald-800 font-mono">
                    {teacherSelectedCourses.length} selected
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto border border-neutral-200 rounded-lg p-2.5 divide-y divide-neutral-100 bg-neutral-50/50">
                  {courses.map((c) => {
                    const isChecked = teacherSelectedCourses.includes(c.id);
                    const dept = departments.find((d) => d.id === c.departmentId);
                    return (
                      <label
                        key={c.id}
                        className="py-2 px-1 flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-50/40 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTeacherSelectedCourses([...teacherSelectedCourses, c.id]);
                              } else {
                                setTeacherSelectedCourses(
                                  teacherSelectedCourses.filter((id) => id !== c.id)
                                );
                              }
                            }}
                            className="rounded border-neutral-300 text-emerald-800 focus:ring-emerald-700"
                          />
                          <span className="font-mono font-bold text-neutral-900">{c.code}</span>
                          <span className="text-neutral-700 text-[11px] truncate max-w-[200px]">{c.title}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {dept?.code} · Sem {c.semester}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Register Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN / EDIT SUBJECTS FOR EXISTING TEACHER */}
      {/* ========================================================================= */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Assign Teaching Subjects: {editingTeacher.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Select curriculum courses this faculty member is currently teaching
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-center justify-between">
                <span>
                  Designation: <strong>{editingTeacher.designation || 'Lecturer'}</strong>
                </span>
                <span className="font-mono text-emerald-800 font-bold">
                  {assignedCourseSelection.length} Subject(s) Selected
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-neutral-700 mb-2">
                  Select Teaching Courses:
                </div>
                <div className="max-h-72 overflow-y-auto border border-neutral-200 rounded-lg p-2.5 divide-y divide-neutral-100 bg-neutral-50/40">
                  {courses.map((c) => {
                    const isChecked = assignedCourseSelection.includes(c.id);
                    const dept = departments.find((d) => d.id === c.departmentId);
                    return (
                      <label
                        key={c.id}
                        className="py-2.5 px-2 flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-50/50 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedCourseSelection([...assignedCourseSelection, c.id]);
                              } else {
                                setAssignedCourseSelection(
                                  assignedCourseSelection.filter((id) => id !== c.id)
                                );
                              }
                            }}
                            className="rounded border-neutral-300 text-emerald-800 focus:ring-emerald-700"
                          />
                          <div>
                            <span className="font-mono font-bold text-neutral-900 mr-2">{c.code}</span>
                            <span className="text-neutral-800">{c.title}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-medium shrink-0 ml-2">
                          {dept?.code} · Sem {c.semester} · {c.creditHours} Cr.
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTeacherSubjects}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Save Teaching Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PURGE / RESET CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {purgeModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-red-300 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between bg-red-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-950">
                    {purgeModalType === 'EXAM_DATA_ONLY'
                      ? 'Confirm Purge of All Exam Records'
                      : 'Confirm Complete Factory Reset'}
                  </h3>
                  <p className="text-xs text-red-700">Irreversible administrative procedure</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPurgeModalType(null);
                  setConfirmInput('');
                }}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-neutral-700">
              <p className="leading-relaxed">
                {purgeModalType === 'EXAM_DATA_ONLY' ? (
                  <>
                    Are you sure you want to <strong>purge all examination data</strong>? This will permanently delete all scheduled date sheets, submitted question papers, invigilation duties, and published exam marks.
                  </>
                ) : (
                  <>
                    Are you sure you want to perform a <strong>complete institutional reset</strong>? All modifications to departments, custom courses, teachers, and student results will be wiped and restored to demo factory defaults.
                  </>
                )}
              </p>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-[11px] font-mono">
                Type <strong>CONFIRM</strong> below to authorize executive execution:
              </div>

              <input
                type="text"
                placeholder="Type CONFIRM"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-red-300 rounded-md font-mono focus:ring-1 focus:ring-red-600 uppercase"
              />

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPurgeModalType(null);
                    setConfirmInput('');
                  }}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmInput.trim().toUpperCase() !== 'CONFIRM'}
                  onClick={handleExecutePurge}
                  className={`px-5 py-2 text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 ${
                    confirmInput.trim().toUpperCase() === 'CONFIRM'
                      ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Execute Executive Purge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
