/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { useExam } from '@/lib/exam-context';
import { User, UserRole } from '@/types/exam-system';
import {
  X,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Building,
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenWhatsApp?: (recipient: { name: string; phone: string; role: string }) => void;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onOpenWhatsApp,
}: EditUserModalProps) {
  const {
    users,
    departments,
    updateUser,
    deleteUser,
    setTeacherResigned,
    transferTeacher,
    setStudentStatus,
    promoteStudentSemester,
    simulatedDate,
  } = useExam();

  const activeUser = users.find((u) => u.id === user?.id) || user;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [rollNumber, setRollNumber] = useState('');
  const [designation, setDesignation] = useState('');

  // Teacher specific status states
  const [teacherStatus, setTeacherStatus] = useState<'ACTIVE' | 'RESIGNED' | 'TRANSFERRED'>('ACTIVE');
  const [resignationReason, setResignationReason] = useState('Voluntary Resignation');
  const [transferDeptId, setTransferDeptId] = useState('');
  const [transferReason, setTransferReason] = useState('Faculty Departmental Reassignment');

  // Student specific status states
  const [studentStatus, setStudentStatusState] = useState<'ACTIVE' | 'PASSED_OUT'>('ACTIVE');
  const [passedOutYear, setPassedOutYear] = useState('2026');

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  useEffect(() => {
    if (activeUser) {
      setName(activeUser.name || '');
      setEmail(activeUser.email || '');
      setPassword(activeUser.password || 'password123');
      setPhoneNumber(activeUser.phoneNumber || '');
      setRole(activeUser.role);
      setDepartmentId(activeUser.departmentId || departments[0]?.id || '');
      setSemester(activeUser.semester || 1);
      setRollNumber(activeUser.rollNumber || '');
      setDesignation(activeUser.designation || '');

      if (activeUser.role === 'TEACHER') {
        setTeacherStatus((activeUser.status as 'ACTIVE' | 'RESIGNED' | 'TRANSFERRED') || 'ACTIVE');
        setTransferDeptId(activeUser.transferredToDepartmentId || departments.find((d) => d.id !== activeUser.departmentId)?.id || '');
        setResignationReason(activeUser.statusReason || 'Voluntary Resignation');
        setTransferReason(activeUser.statusReason || 'Faculty Departmental Reassignment');
      } else if (activeUser.role === 'STUDENT') {
        setStudentStatusState((activeUser.status as 'ACTIVE' | 'PASSED_OUT') || 'ACTIVE');
        setPassedOutYear(activeUser.passedOutYear || simulatedDate.slice(0, 4));
      }
      setNotificationMsg(null);
    }
  }, [activeUser, departments, simulatedDate]);

  if (!isOpen || !user || !activeUser) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    if (!name.trim() || !email.trim()) {
      setNotificationMsg({ type: 'ERROR', text: 'Name and email are mandatory.' });
      return;
    }

    updateUser(activeUser.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      phoneNumber: phoneNumber.trim(),
      role,
      departmentId,
      semester: role === 'STUDENT' ? Number(semester) : undefined,
      rollNumber: role === 'STUDENT' ? rollNumber.trim() : undefined,
      designation: role !== 'STUDENT' ? designation.trim() : undefined,
    });

    setNotificationMsg({
      type: 'SUCCESS',
      text: `User details updated successfully for ${name}. Email & Password synchronized.`,
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTeacherStatusChange = (newStatus: 'ACTIVE' | 'RESIGNED' | 'TRANSFERRED') => {
    setTeacherStatus(newStatus);
    if (newStatus === 'RESIGNED') {
      setTeacherResigned(user.id, resignationReason);
      setNotificationMsg({
        type: 'SUCCESS',
        text: `Faculty member ${user.name} recorded as RESIGNED from the college.`,
      });
    } else if (newStatus === 'TRANSFERRED') {
      if (!transferDeptId) return;
      transferTeacher(user.id, transferDeptId, transferReason);
      setDepartmentId(transferDeptId);
      const targetDept = departments.find((d) => d.id === transferDeptId);
      setNotificationMsg({
        type: 'SUCCESS',
        text: `Faculty member ${user.name} transferred to ${targetDept?.name || 'new department'}.`,
      });
    } else {
      updateUser(user.id, {
        status: 'ACTIVE',
        statusReason: 'Active faculty in service',
      });
      setNotificationMsg({
        type: 'SUCCESS',
        text: `Faculty member ${user.name} restored to ACTIVE status.`,
      });
    }
  };

  const handleStudentStatusToggle = (newStatus: 'ACTIVE' | 'PASSED_OUT') => {
    setStudentStatusState(newStatus);
    setStudentStatus(user.id, newStatus, passedOutYear);
    setNotificationMsg({
      type: 'SUCCESS',
      text: `Student status updated to ${newStatus === 'PASSED_OUT' ? 'PASSED OUT / GRADUATED' : 'ACTIVE ENROLLED'}.`,
    });
  };

  const handlePromoteSemester = () => {
    const res = promoteStudentSemester(user.id);
    if (res.passedOut) {
      setStudentStatusState('PASSED_OUT');
      setNotificationMsg({
        type: 'SUCCESS',
        text: `Student ${user.name} has completed 8th semester and is now marked as PASSED OUT / GRADUATED!`,
      });
    } else {
      setSemester(res.newSemester || semester + 1);
      setNotificationMsg({
        type: 'SUCCESS',
        text: `Student ${user.name} promoted to Semester ${res.newSemester}!`,
      });
    }
  };

  const handleDeleteUser = () => {
    if (confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.role}) from the system?`)) {
      deleteUser(user.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-200 w-full max-w-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center border border-emerald-700 font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Manage User Record: {user.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-800 border border-emerald-700 text-emerald-200">
                  {user.role}
                </span>
              </h3>
              <p className="text-xs text-emerald-200/90 font-mono">
                ID: {user.id} · Phone: {user.phoneNumber || 'Not set'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notificationMsg && (
          <div
            className={`px-6 py-3 text-xs font-semibold flex items-center gap-2 ${
              notificationMsg.type === 'SUCCESS'
                ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                : 'bg-red-50 text-red-900 border-b border-red-200'
            }`}
          >
            {notificationMsg.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            )}
            <span>{notificationMsg.text}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: General Credentials & Account Information */}
          <form id="edit-user-form" onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-emerald-800" />
                Account Credentials & Identity
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">Authentication Info</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Login Password (Update / Reset)
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set user password"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  User can sign in with this password along with their email or phone number.
                </span>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  WhatsApp Phone Number (Mandatory)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-emerald-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono bg-emerald-50/20"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Used for duty roster shifts, exam alerts, and universal announcements.
                </span>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Assigned Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white font-mono font-bold"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="TEACHER">TEACHER</option>
                  <option value="QA_CHECKER">QA_CHECKER</option>
                  <option value="PRINCIPAL">PRINCIPAL</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {role === 'STUDENT' ? (
                <>
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Student Roll Number (ID)
                    </label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. FA26-CS-042"
                      className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono font-bold text-emerald-950 bg-emerald-50/20"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Current Semester (1 to 8)
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white font-mono font-semibold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Academic Designation / Title
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Assistant Professor, Lecturer, Dean, HOD"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white"
                  />
                </div>
              )}
            </div>
          </form>

          {/* Section 2: TEACHER SPECIFIC RESIGNATION & DEPARTMENT TRANSFER */}
          {user.role === 'TEACHER' && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    Faculty Employment & Department Status
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Manage resignation status or transfer faculty member to another academic department.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                    teacherStatus === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : teacherStatus === 'RESIGNED'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}
                >
                  {teacherStatus}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTeacherStatusChange('ACTIVE')}
                  className={`px-3 py-2 rounded-lg font-semibold border transition-all text-left flex flex-col ${
                    teacherStatus === 'ACTIVE'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <span className="font-bold">Active in Service</span>
                  <span className="text-[10px] opacity-80">Eligible for invigilation duties</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherStatusChange('RESIGNED')}
                  className={`px-3 py-2 rounded-lg font-semibold border transition-all text-left flex flex-col ${
                    teacherStatus === 'RESIGNED'
                      ? 'bg-red-800 text-white border-red-900 shadow-2xs'
                      : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                  }`}
                >
                  <span className="font-bold">Faculty Resigned</span>
                  <span className="text-[10px] opacity-80">Login locked, removed from duties</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherStatusChange('TRANSFERRED')}
                  className={`px-3 py-2 rounded-lg font-semibold border transition-all text-left flex flex-col ${
                    teacherStatus === 'TRANSFERRED'
                      ? 'bg-blue-800 text-white border-blue-900 shadow-2xs'
                      : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <span className="font-bold">Transfer Department</span>
                  <span className="text-[10px] opacity-80">Reassign to another department</span>
                </button>
              </div>

              {/* If Resigned Details */}
              {teacherStatus === 'RESIGNED' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2 text-xs">
                  <label className="font-semibold text-red-950 block">Resignation Reason / Record Details</label>
                  <input
                    type="text"
                    value={resignationReason}
                    onChange={(e) => setResignationReason(e.target.value)}
                    placeholder="e.g. Voluntary resignation accepted by Dean on 2026-10-18"
                    className="w-full px-3 py-1.5 border border-red-300 rounded bg-white text-red-950 focus:outline-none"
                  />
                  <span className="text-[10px] text-red-700 block">
                    Resigned teachers cannot be scheduled for examination duties and cannot log into the teacher portal.
                  </span>
                </div>
              )}

              {/* If Transfer Details */}
              {teacherStatus === 'TRANSFERRED' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-xs">
                  <label className="font-semibold text-blue-950 block">Destination Department</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={transferDeptId}
                      onChange={(e) => {
                        setTransferDeptId(e.target.value);
                        handleTeacherStatusChange('TRANSFERRED');
                      }}
                      className="px-3 py-1.5 border border-blue-300 rounded bg-white text-blue-950 font-medium"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      placeholder="Transfer justification / circular number"
                      className="px-3 py-1.5 border border-blue-300 rounded bg-white text-blue-950"
                    />
                  </div>
                  <span className="text-[10px] text-blue-700 block">
                    Teacher teaching assignments and duty roster will now align with the destination department.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Section 3: STUDENT SPECIFIC STATUS & PROMOTION */}
          {user.role === 'STUDENT' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-800" />
                    Student Academic Progression & Status
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Track enrollment status, promote candidate to the next semester, or record graduation / pass-out.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                    studentStatus === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-purple-100 text-purple-900 border border-purple-300'
                  }`}
                >
                  {studentStatus === 'PASSED_OUT' ? 'PASSED OUT / GRADUATED' : 'ACTIVE ENROLLED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800">Enrolled Semester</span>
                    <span className="font-bold font-mono text-emerald-900 text-sm">
                      Semester {semester} / 8
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePromoteSemester}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {semester >= 8 ? 'Complete 8th Sem & Graduate (Pass Out)' : `Promote to Semester ${semester + 1}`}
                  </button>
                  <span className="text-[10px] text-neutral-500 block text-center">
                    Advances candidate into next academic cycle & updates course eligibility.
                  </span>
                </div>

                <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-2">
                  <span className="font-semibold text-neutral-800 block">Graduation / Pass-out Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleStudentStatusToggle('ACTIVE')}
                      className={`py-1.5 px-2 rounded font-semibold text-center border ${
                        studentStatus === 'ACTIVE'
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      Active Enrolled
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStudentStatusToggle('PASSED_OUT')}
                      className={`py-1.5 px-2 rounded font-semibold text-center border ${
                        studentStatus === 'PASSED_OUT'
                          ? 'bg-purple-700 text-white border-purple-800'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      Passed Out
                    </button>
                  </div>
                  {studentStatus === 'PASSED_OUT' && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-neutral-500">Graduation Year:</span>
                      <input
                        type="text"
                        value={passedOutYear}
                        onChange={(e) => {
                          setPassedOutYear(e.target.value);
                          setStudentStatus(user.id, 'PASSED_OUT', e.target.value);
                        }}
                        className="px-2 py-1 text-xs border border-purple-300 rounded font-mono w-24 text-center font-bold text-purple-950"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenWhatsApp && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWhatsApp({
                    name: user.name,
                    phone: user.phoneNumber || '+92 300 1234567',
                    role: user.role,
                  });
                }}
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Send WhatsApp notice to this user"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send WhatsApp</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDeleteUser}
              className="px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Delete user account"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="edit-user-form"
              onClick={handleSaveGeneral}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save &amp; Update Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
