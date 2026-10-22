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
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  MessageSquare,
  ShieldCheck,
  Save,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
}

export function EditProfileModal({ isOpen, onClose, targetUser }: EditProfileModalProps) {
  const { currentUser, updateUser, departments } = useExam();
  
  // Use targetUser if passed, otherwise edit currentUser
  const userToEdit = targetUser || currentUser;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [rollNumber, setRollNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setPassword(userToEdit.password || 'password123');
      setPhoneNumber(userToEdit.phoneNumber || '');
      setDepartmentId(userToEdit.departmentId || departments[0]?.id || '');
      setSemester(userToEdit.semester || 1);
      setRollNumber(userToEdit.rollNumber || '');
      setDesignation(userToEdit.designation || '');
      setFeedback(null);
    }
  }, [userToEdit, departments, isOpen]);

  if (!isOpen || !userToEdit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: 'ERROR', text: 'Full Name cannot be empty.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFeedback({ type: 'ERROR', text: 'Please enter a valid institutional email address.' });
      return;
    }
    if (!password.trim() || password.length < 4) {
      setFeedback({ type: 'ERROR', text: 'Password must be at least 4 characters long.' });
      return;
    }
    if (!phoneNumber.trim()) {
      setFeedback({ type: 'ERROR', text: 'WhatsApp Phone Number is required for duty & exam alerts.' });
      return;
    }

    updateUser(userToEdit.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      phoneNumber: phoneNumber.trim(),
      departmentId: departmentId || undefined,
      designation: userToEdit.role !== 'STUDENT' ? designation.trim() : undefined,
      semester: userToEdit.role === 'STUDENT' ? Number(semester) : undefined,
      rollNumber: userToEdit.role === 'STUDENT' ? rollNumber.trim() : undefined,
    });

    setFeedback({
      type: 'SUCCESS',
      text: `User details updated successfully! New login credentials (email, password, phone) are saved.`,
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTestWhatsApp = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${name}, your user profile details in the Examination Management Portal have been updated.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-200 w-full max-w-lg overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center border border-emerald-700 font-bold">
              {name.charAt(0) || userToEdit.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>Update User Details &amp; Profile</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-800 border border-emerald-700 text-emerald-200">
                  {userToEdit.role}
                </span>
              </h3>
              <p className="text-xs text-emerald-200/90 font-mono">
                {userToEdit.id === currentUser.id ? 'Your Active Account Session' : `Account ID: ${userToEdit.id}`}
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

        {feedback && (
          <div
            className={`px-6 py-3 text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'SUCCESS'
                ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                : 'bg-red-50 text-red-900 border-b border-red-200'
            }`}
          >
            {feedback.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Form Body */}
        <form id="edit-profile-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Full Legal Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. John Doe"
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Institutional Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@university.edu"
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
              />
            </div>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Used as primary login identifier across all portals.
            </span>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Login Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-neutral-400 hover:text-neutral-700"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Can be updated anytime. Minimum 4 characters.
            </span>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              WhatsApp Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[#25D366] absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full pl-9 pr-20 py-2 text-xs border border-emerald-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono bg-emerald-50/20"
              />
              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="absolute right-2 top-1.5 px-2 py-0.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Send test WhatsApp message"
              >
                <MessageSquare className="w-2.5 h-2.5 fill-current" />
                <span>Test</span>
              </button>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">
              Duty rosters, exam commencement reminders, and official notices are dispatched to this WhatsApp number.
            </span>
          </div>

          {/* Department Selection */}
          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Assigned Department
            </label>
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role specific fields */}
          {userToEdit.role === 'STUDENT' ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Enrolled Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Roll / Registration No.
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. FA26-CS-042"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Official Designation / Title
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Assistant Professor, QA Officer, Controller"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-medium"
              />
            </div>
          )}

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-950">
              <span className="font-bold block">Instant Security Synchronization</span>
              Updates are sealed in the tamper-evident cryptographic audit log and saved immediately.
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save &amp; Update Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
