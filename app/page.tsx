/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { ExamProvider, useExam } from '@/lib/exam-context';
import { TopNavbar } from '@/components/TopNavbar';
import { DateSimulatorModal } from '@/components/DateSimulatorModal';
import { UserRegisterModal } from '@/components/UserRegisterModal';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { PrincipalDashboard } from '@/components/principal/PrincipalDashboard';
import { QADashboard } from '@/components/qa/QADashboard';
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard';
import { StudentPortal } from '@/components/student/StudentPortal';
import { LoginPage } from '@/components/auth/LoginPage';
import { WhatsAppDispatchModal } from '@/components/common/WhatsAppDispatchModal';
import { ShieldCheck, Info } from 'lucide-react';

function ExamAppContent() {
  const {
    currentUser,
    simulatedDate,
    branding,
    isLoggedIn,
    whatsAppModal,
    closeWhatsAppModal,
  } = useExam();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // If user is not authenticated, render Login Page as the primary landing page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <LoginPage />
        {whatsAppModal && (
          <WhatsAppDispatchModal
            isOpen={whatsAppModal.isOpen}
            recipientName={whatsAppModal.recipientName}
            phoneNumber={whatsAppModal.phoneNumber}
            title={whatsAppModal.title}
            message={whatsAppModal.message}
            whatsAppLink={whatsAppModal.whatsAppLink}
            onClose={closeWhatsAppModal}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-neutral-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation - excluded from PDF exports */}
      <div className="no-print print-hidden">
        <TopNavbar
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />
      </div>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'ADMIN' && <AdminDashboard />}
        {currentUser.role === 'PRINCIPAL' && <PrincipalDashboard />}
        {currentUser.role === 'QA_CHECKER' && <QADashboard />}
        {currentUser.role === 'TEACHER' && <TeacherDashboard />}
        {currentUser.role === 'STUDENT' && <StudentPortal />}
      </main>

      {/* Clean Institutional Footer with College Branding & Exam Management System Emblem - explicitly hidden during print/PDF export */}
      <footer className="border-t border-emerald-200/80 bg-white py-6 mt-12 text-xs text-neutral-600 no-print print-hidden site-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={branding.logoUrl || '/src/assets/images/exam_system_logo_1792130817114.jpg'}
              alt={`${branding.collegeName} Emblem`}
              referrerPolicy="no-referrer"
              width={44}
              height={44}
              style={{ width: '44px', height: '44px', maxWidth: '44px', maxHeight: '44px', objectFit: 'contain' }}
              className="w-11 h-11 rounded-full object-contain border border-emerald-200 shadow-2xs shrink-0 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-sm">{branding.collegeName}</span>
                <span className="text-emerald-700 font-semibold text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  Exam Management System
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                <span>{branding.subTitle || 'Office of the Controller of Examinations'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-800 font-medium">Academic Integrity &amp; Institutional Precision</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] text-neutral-500 font-mono text-center sm:text-right">
            <span>Faculties: English · Mathematics · Computer Science (Sem 1–8)</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold">
              Simulated Date: {simulatedDate}
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DateSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      <UserRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      {whatsAppModal && (
        <WhatsAppDispatchModal
          isOpen={whatsAppModal.isOpen}
          recipientName={whatsAppModal.recipientName}
          phoneNumber={whatsAppModal.phoneNumber}
          title={whatsAppModal.title}
          message={whatsAppModal.message}
          whatsAppLink={whatsAppModal.whatsAppLink}
          onClose={closeWhatsAppModal}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ExamProvider>
      <ExamAppContent />
    </ExamProvider>
  );
}
