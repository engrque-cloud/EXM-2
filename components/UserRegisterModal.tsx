'use client';

import React, { useState } from 'react';
import { useExam } from '@/lib/exam-context';
import { UserRole } from '@/types/exam-system';
import { UserPlus, X, Check } from 'lucide-react';

interface UserRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserRegisterModal({ isOpen, onClose }: UserRegisterModalProps) {
  const { departments, registerUser } = useExam();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-cs');
  const [semester, setSemester] = useState<number>(1);
  const [rollNumber, setRollNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    registerUser({
      name,
      email,
      role,
      departmentId,
      semester: role === 'STUDENT' ? Number(semester) : undefined,
      rollNumber: role === 'STUDENT' ? rollNumber || `FA26-${departments.find((d) => d.id === departmentId)?.code || 'ENG'}-0${Math.floor(Math.random() * 90) + 10}` : undefined,
      designation: role !== 'STUDENT' ? designation || (role === 'TEACHER' ? 'Lecturer' : 'Officer') : undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setRollNumber('');
      setDesignation('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">User Account Registration</h2>
              <p className="text-xs text-neutral-500">
                New accounts require Controller of Examinations approval before access.
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

        {submitted ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">Registration Submitted</h3>
            <p className="text-xs text-neutral-500">
              Your profile has been queued. Switch to Admin / Controller persona to approve or reject this user.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jonathan Davis"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. j.davis@university.edu"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="QA_CHECKER">QA Checker</option>
                  <option value="PRINCIPAL">Principal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {role === 'STUDENT' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Semester (1 to 8)</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Roll / Reg Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. FA26-CS-088"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Assistant Professor, Pure Mathematics"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors shadow-2xs"
              >
                Submit for Approval
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
