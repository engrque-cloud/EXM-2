/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useExam } from '@/lib/exam-context';
import { UserRole } from '@/types/exam-system';
import {
  ShieldCheck,
  Building,
  GraduationCap,
  Users,
  Lock,
  Phone,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export function LoginPage() {
  const { users, departments, login, registerUser, branding } = useExam();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [credential, setCredential] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('STUDENT');
  const [regDeptId, setRegDeptId] = useState(departments[0]?.id || 'dept-cs');
  const [regSemester, setRegSemester] = useState<number>(4);
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regDesignation, setRegDesignation] = useState('Assistant Professor');
  const [regSuccess, setRegSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!credential.trim()) {
      setLoginError('Please enter your email or WhatsApp phone number.');
      return;
    }

    const cleanPhone = credential.replace(/[^0-9]/g, '');
    const credLower = credential.trim().toLowerCase();
    const targetUser = users.find((u) => {
      if (u.id === credential) return true;
      if (u.email && u.email.toLowerCase() === credLower) return true;
      if (u.phoneNumber && cleanPhone) {
        const uClean = u.phoneNumber.replace(/[^0-9]/g, '');
        if (uClean.endsWith(cleanPhone) || cleanPhone.endsWith(uClean)) return true;
      }
      return false;
    });

    if (targetUser && targetUser.status === 'RESIGNED') {
      setLoginError('Access Denied: This faculty member record is marked as RESIGNED from the college.');
      return;
    }

    const success = login(credential.trim(), loginPassword);
    if (!success) {
      if (targetUser && targetUser.password && loginPassword && targetUser.password !== loginPassword) {
        setLoginError('Incorrect password. Please verify your password or contact the Controller of Examinations.');
      } else {
        setLoginError(
          'No matching user found with that email or phone number. Check the demo profiles below or register a new account.'
        );
      }
    }
  };

  const handleQuickLogin = (userId: string) => {
    login(userId);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setLoginError('Name, Email, and WhatsApp Phone Number are mandatory.');
      return;
    }

    const deptCode = departments.find((d) => d.id === regDeptId)?.code || 'CS';

    registerUser({
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phoneNumber: regPhone.trim(),
      password: regPassword.trim() || 'password123',
      role: regRole,
      departmentId: regDeptId,
      semester: regRole === 'STUDENT' ? Number(regSemester) : undefined,
      rollNumber:
        regRole === 'STUDENT'
          ? regRollNumber.trim() || `FA26-${deptCode}-0${Math.floor(Math.random() * 80) + 20}`
          : undefined,
      designation: regRole !== 'STUDENT' ? regDesignation.trim() || 'Faculty' : undefined,
      autoApprove: true, // auto-approve so user can immediately test
    });

    setRegSuccess(
      `Account successfully registered for ${regName}! You are logged in with WhatsApp alert delivery configured.`
    );

    // Auto login
    setTimeout(() => {
      login(regEmail.trim());
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7F2] to-[#E5ECE5] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-200">
      {/* Top Banner Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <img
            src={branding.logoUrl || '/src/assets/images/exam_system_logo_1792130817114.jpg'}
            alt="University Logo"
            width={48}
            height={48}
            style={{ width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', objectFit: 'contain' }}
            className="w-12 h-12 rounded-full object-contain border border-emerald-300 shadow-2xs bg-white shrink-0"
          />
          <div>
            <h1 className="text-base font-extrabold text-neutral-900 tracking-tight">
              {branding.collegeName}
            </h1>
            <p className="text-xs text-emerald-800 font-medium">
              {branding.subTitle || 'Office of the Controller of Examinations'}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          Examination Management System (EMS)
        </span>
      </div>

      {/* Main Login / Registration Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white rounded-2xl shadow-xl border border-emerald-200/90 overflow-hidden">
        {/* Card Header */}
        <div className="p-6 bg-emerald-900 text-white text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800/80 border border-emerald-700 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-7 h-7 text-emerald-200" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Institutional Portal Access</h2>
          <p className="text-xs text-emerald-200/90 mt-1 max-w-xs mx-auto">
            Authorized sign-in for Administrators, Principals, QA Auditors, Faculty, and Students.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-emerald-950/60 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setLoginError('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'LOGIN' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setLoginError('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'REGISTER' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-300 hover:text-white'
              }`}
            >
              Register New Account
            </button>
          </div>
        </div>

        {/* WhatsApp Notification Requirement Notice */}
        <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 flex items-start gap-2.5 text-xs">
          <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-emerald-900 text-[11px] leading-relaxed">
            <strong>WhatsApp Alerts Enabled:</strong> A valid phone number is required for all accounts to receive automated duty roster schedules and real-time exam started announcements.
          </div>
        </div>

        {/* Error / Success Notifications */}
        {loginError && (
          <div className="m-4 mb-0 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        {regSuccess && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>{regSuccess}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {mode === 'LOGIN' && (
          <div className="p-6 space-y-5">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Email Address or WhatsApp Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="e.g. controller.exam@university.edu or +92 300 8472910"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700">Password</label>
                  <span className="text-[10px] text-neutral-400">Default: admin or password123</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Sign In to Examination Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Demo Personas Strip */}
            <div className="pt-4 border-t border-neutral-100 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                <span>Or select a One-Click Persona:</span>
                <span className="font-mono text-emerald-800 font-bold">Instant Login</span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {users.slice(0, 5).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u.id)}
                    className="w-full p-2.5 bg-neutral-50 hover:bg-emerald-50/70 border border-neutral-200 hover:border-emerald-300 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                        {u.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-neutral-900 truncate group-hover:text-emerald-950">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono truncate">
                          {u.phoneNumber || '+92 300 1234567'} · {u.role}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-emerald-900 border border-emerald-200 shrink-0">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Dr. Haris Qureshi"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. haris.qureshi@university.edu"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {/* Mandatory Phone Number Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp Phone Number</span>
                  <span className="text-red-500 font-black">*</span>
                </label>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Required for WhatsApp Alerts
                </span>
              </div>
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="e.g. +92 300 1234567"
                className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-700 font-mono bg-emerald-50/20"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Duty roster assignments and live exam started notifications will be sent to this number.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Account Password (for Sign In)
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create a secure password"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Account Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Faculty / Teacher</option>
                  <option value="QA_CHECKER">QA Auditor</option>
                  <option value="ADMIN">Controller / Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Department</label>
                <select
                  value={regDeptId}
                  onChange={(e) => setRegDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {regRole === 'STUDENT' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Semester</label>
                  <select
                    value={regSemester}
                    onChange={(e) => setRegSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={regRollNumber}
                    onChange={(e) => setRegRollNumber(e.target.value)}
                    placeholder="e.g. FA26-CS-088"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Academic Designation
                </label>
                <input
                  type="text"
                  value={regDesignation}
                  onChange={(e) => setRegDesignation(e.target.value)}
                  placeholder="e.g. Assistant Professor, Computer Science"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer mt-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete Registration &amp; Sign In</span>
            </button>
          </form>
        )}
      </div>

      {/* Footer Branding */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-neutral-500 pt-6">
        <span>{branding.collegeName} Examination Directorate</span>
        <span className="mx-2">·</span>
        <span>Secure Session Authorization</span>
        <span className="mx-2">·</span>
        <span className="font-mono text-emerald-800 font-semibold">WhatsApp Automation Ready</span>
      </div>
    </div>
  );
}
