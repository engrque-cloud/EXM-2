/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useExam } from '@/lib/exam-context';
import { UserRole } from '@/types/exam-system';
import {
  Calendar,
  Clock,
  Bell,
  RotateCcw,
  UserPlus,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Palette,
  LogOut,
  Phone,
  MessageSquare,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { EditProfileModal } from '@/components/common/EditProfileModal';

interface TopNavbarProps {
  onOpenSimulator: () => void;
  onOpenRegister: () => void;
}

export function TopNavbar({ onOpenSimulator, onOpenRegister }: TopNavbarProps) {
  const {
    simulatedDate,
    currentUser,
    switchRole,
    users,
    setCurrentUser,
    notifications,
    unreadNotifsCount,
    markNotificationRead,
    markAllNotificationsRead,
    resetAllData,
    branding,
    logout,
  } = useExam();

  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const roles: Array<{ key: UserRole; label: string; desc: string }> = [
    { key: 'ADMIN', label: 'Admin / Controller', desc: 'Date Sheet, Results & Transcripts' },
    { key: 'PRINCIPAL', label: 'Principal', desc: 'Bottleneck Tracker & Exam Call' },
    { key: 'QA_CHECKER', label: 'QA Auditor', desc: 'Paper Rigor & Duty Lock' },
    { key: 'TEACHER', label: 'Teacher', desc: 'Upload Papers & Submit Grades' },
    { key: 'STUDENT', label: 'Student', desc: 'Exam Date Sheet (Printable)' },
  ];

  const filteredNotifs = notifications.filter(
    (n) => !n.recipientRole || n.recipientRole === currentUser.role || n.recipientUserId === currentUser.id
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-emerald-100 shadow-2xs no-print print-hidden top-navbar">
      {/* 3-Zone Top Bar Contract: Brand — Role Nav & Clock — Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark with College Logo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="Logo"
              width={36}
              height={36}
              style={{ width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px', objectFit: 'cover' }}
              className="w-9 h-9 rounded-lg object-cover border border-emerald-200 shadow-2xs shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs border border-emerald-900 shrink-0">
              {branding.collegeName.slice(0, 2).toUpperCase() || 'EMS'}
            </div>
          )}
          <div className="leading-tight">
            <span className="text-base font-bold text-neutral-900 tracking-tight whitespace-nowrap block">
              {branding.collegeName}
            </span>
            <div className="text-[11px] text-emerald-800 font-medium hidden sm:block truncate max-w-[220px]">
              {branding.subTitle}
            </div>
          </div>
        </div>

        {/* Zone 2: Strict Role Portal Indicator (No cross-screen switching allowed) */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-50/90 rounded-full border border-emerald-200/90 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
          <span className="text-xs font-bold text-neutral-900">
            {currentUser.role === 'ADMIN' && 'Controller of Examinations Portal'}
            {currentUser.role === 'PRINCIPAL' && 'Principal Executive Portal'}
            {currentUser.role === 'QA_CHECKER' && 'Quality Assurance Cell'}
            {currentUser.role === 'TEACHER' && 'Faculty Member Portal'}
            {currentUser.role === 'STUDENT' && 'Student Academic Portal'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-800 text-white font-semibold uppercase tracking-wider">
            {currentUser.role}
          </span>
        </div>

        {/* Zone 3: Date Simulator Button, Notifications, User Profile & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Interactive Date Simulator Badge / Button */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200 rounded-md text-xs font-medium transition-colors shadow-2xs"
            title="Open Date Simulator to fast-forward time and test 10-day alerts"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="hidden sm:inline text-emerald-800 font-medium">Simulated:</span>
            <span className="font-mono tabular-nums font-bold text-emerald-950">{simulatedDate}</span>
          </button>

          {/* Direct Register Student Button */}
          <button
            onClick={onOpenRegister}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors"
            title="Register as a new student or faculty member"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="relative p-2 text-emerald-900 hover:text-emerald-950 rounded-md hover:bg-emerald-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-700 text-white rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums leading-none">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-emerald-200 rounded-lg shadow-lg py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">Notifications</span>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-emerald-800 hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                  {filteredNotifs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-400">
                      No notifications for current role
                    </div>
                  ) : (
                    filteredNotifs.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 text-left hover:bg-emerald-50/40 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-emerald-50/70' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === 'ALERT' && (
                            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          {n.type === 'SUCCESS' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {n.type === 'INFO' && (
                            <Calendar className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          )}
                          {n.type === 'WARNING' && (
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-neutral-900 truncate">
                              {n.title}
                            </div>
                            <div className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">
                              {n.message}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono mt-1">
                              {n.createdAt}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active User Switcher / Profile Popover */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 pl-2 hover:bg-emerald-50 rounded-md transition-colors border border-transparent hover:border-emerald-200"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center border border-emerald-200">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-neutral-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-700 font-mono font-medium">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-emerald-200 rounded-lg shadow-lg py-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-neutral-100">
                  <div className="text-xs font-bold text-neutral-900">{currentUser.name}</div>
                  <div className="text-[11px] text-neutral-500 truncate">{currentUser.email}</div>
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-mono mt-0.5">
                    <Phone className="w-3 h-3 text-[#25D366]" />
                    <span>{currentUser.phoneNumber || '+92 301 7654321'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded font-sans font-bold">
                      WhatsApp Active
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                    {currentUser.designation || (currentUser.role === 'STUDENT' ? `Semester ${currentUser.semester} · ${currentUser.rollNumber}` : currentUser.role)}
                  </div>
                </div>

                <div className="p-2 space-y-1.5">
                  <div className="px-2 py-1 text-[11px] text-neutral-500 bg-neutral-50 rounded font-mono">
                    Session: <strong className="text-emerald-950 font-bold">{currentUser.role} LOCKED</strong>
                  </div>
                  
                  {/* Change User Details / Edit Profile Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowEditProfileModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-emerald-900 hover:bg-emerald-50 flex items-center gap-2 font-semibold rounded-md transition-colors border border-emerald-200/90 bg-emerald-50/40 cursor-pointer"
                  >
                    <UserCog className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                    <span>Change User Details / Edit Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600" />
                    Sign Out / Return to Login
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => logout()}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors border border-neutral-200"
            title="Log Out to Login Page"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Edit Profile / Change User Details Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
        />
      )}
    </header>
  );
}
