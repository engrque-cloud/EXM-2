/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { useExam } from '@/lib/exam-context';
import {
  MessageSquare,
  X,
  Phone,
  User as UserIcon,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Calendar,
  Award,
  Users,
} from 'lucide-react';

interface UniversalWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: {
    name: string;
    phone: string;
    role?: string;
  } | null;
}

export function UniversalWhatsAppModal({
  isOpen,
  onClose,
  initialRecipient,
}: UniversalWhatsAppModalProps) {
  const {
    users,
    branding,
    simulatedDate,
    sendCustomWhatsAppMessage,
    dateSheet,
    courses,
    dutyRoster,
  } = useExam();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [templateType, setTemplateType] = useState<
    'DUTY_ROSTER' | 'EXAM_STARTED' | 'EXAM_RESULT' | 'STUDENT_PROMOTION' | 'CUSTOM'
  >('CUSTOM');
  const [customSubject, setCustomSubject] = useState<string>('Important Institutional Notice');
  const [customBody, setCustomBody] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialRecipient) {
      setRecipientName(initialRecipient.name);
      setPhoneNumber(initialRecipient.phone);
      const match = users.find(
        (u) =>
          u.name.toLowerCase() === initialRecipient.name.toLowerCase() ||
          u.phoneNumber === initialRecipient.phone
      );
      if (match) setSelectedUserId(match.id);
    } else if (users.length > 0 && !selectedUserId) {
      const first = users.find((u) => u.role !== 'ADMIN') || users[0];
      setSelectedUserId(first.id);
      setRecipientName(first.name);
      setPhoneNumber(first.phoneNumber || '+92 300 1234567');
    }
  }, [initialRecipient, users]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    if (userId === 'MANUAL') {
      setRecipientName('');
      setPhoneNumber('');
      return;
    }
    const target = users.find((u) => u.id === userId);
    if (target) {
      setRecipientName(target.name);
      setPhoneNumber(target.phoneNumber || '+92 300 1234567');
    }
  };

  // Generate template message
  const generatedMessage = React.useMemo(() => {
    const target = users.find((u) => u.id === selectedUserId);
    const greeting = recipientName ? `Dear *${recipientName}*,` : 'Dear Sir/Madam,';

    if (templateType === 'DUTY_ROSTER') {
      const teacherDuty = dutyRoster.find((d) => d.teacherId === target?.id) || dutyRoster[0];
      const ds = dateSheet.find((item) => item.id === teacherDuty?.dateSheetEntryId);
      const course = courses.find((c) => c.id === ds?.courseId);

      return `🎓 *OFFICIAL DUTY ROSTER SCHEDULE & DATA DIRECTIVE* - ${branding.collegeName}
*Office of the Controller of Examinations*

${greeting}
Your assigned examination duty roster shift is confirmed:
📅 Date: *${teacherDuty?.examDate || simulatedDate}*
⏰ Timing: *${teacherDuty?.startTime || '09:00 AM'} – ${teacherDuty?.endTime || '12:00 PM'}*
🏛 Hall: *${teacherDuty?.hallNumber || 'Examination Hall 1'}*
🛡 Assigned Role: *${teacherDuty?.role || 'Chief Invigilator'}*
📚 Course: *${course?.code || 'Course'} - ${course?.title || 'Examination Session'}*

⚠️ *MANDATORY ACTION REQUIRED:*
1. Upload Question Paper & syllabus distribution on your Teacher Dashboard for QA approval.
2. Enter student marks and attendance directly into the grading ledger upon exam conclusion.
3. Report 20 minutes prior to session commencement.

Verification Code: SHA256-DUTY-${target?.id.slice(-4) || 'VERIFIED'}`;
    }

    if (templateType === 'EXAM_STARTED') {
      const ds = dateSheet[0];
      const course = courses.find((c) => c.id === ds?.courseId);

      return `📢 *EXAMINATION SESSION OFFICIALLY STARTED* - ${branding.collegeName}
*Urgent Examination Directorate Broadcast*

${greeting}
The examination session has commenced:
📚 Paper: *${course?.code || 'Course'} (${course?.title || 'Examination'})*
🏛 Venue: *${ds?.hallNumber || 'Main Examination Complex'}*
📅 Date: *${simulatedDate}*
⏰ Session: *${ds?.startTime || '09:30 AM'} – ${ds?.endTime || '12:30 PM'}*

✅ Question papers unpacked under seal.
✅ Invigilation staff and candidate attendance recorded.
Evaluation portal will unlock immediately after session concludes.`;
    }

    if (templateType === 'EXAM_RESULT') {
      return `🎉 *OFFICIAL EXAMINATION RESULTS PUBLISHED* - ${branding.collegeName}
*Office of the Controller of Examinations*

${greeting}
Your semester examination results have been verified, approved by the Principal, and officially published into the institutional archive.

📄 *Official Academic Transcripts Available:*
Every student's record is permanently saved by Exam Year (2026).
Please visit your Student Academic Portal to view your grades or request an official stamped print transcript.

Office of Controller: controller.exam@university.edu`;
    }

    if (templateType === 'STUDENT_PROMOTION') {
      return `🎓 *ACADEMIC SEMESTER PROMOTION DIRECTIVE* - ${branding.collegeName}
*Office of Academic Affairs & Admissions*

${greeting}
Congratulations! Based on official examination results and grade ledger review, your academic progression has been approved:
📈 Status: *PROMOTED TO NEXT SEMESTER*
🏛 Institution: *${branding.collegeName}*
📅 Effective Date: *${simulatedDate}*

Please check your portal for revised course enrollments and the upcoming academic timetable.`;
    }

    // CUSTOM MESSAGE
    return `🏛 *${customSubject.toUpperCase()}* - ${branding.collegeName}
*Institutional Broadcast from Controller Directorate*

${greeting}

${customBody || 'This is an official communication from the College Examination Directorate. Please review the attached instructions carefully.'}

📅 Issued: ${simulatedDate}
Official Dispatch Directorate: ${branding.collegeName}`;
  }, [
    selectedUserId,
    recipientName,
    templateType,
    customSubject,
    customBody,
    users,
    branding,
    simulatedDate,
    dutyRoster,
    dateSheet,
    courses,
  ]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!phoneNumber.trim()) {
      alert('Please enter or select a valid WhatsApp phone number.');
      return;
    }

    sendCustomWhatsAppMessage({
      recipientName: recipientName.trim() || 'Recipient',
      phoneNumber: phoneNumber.trim(),
      message: generatedMessage,
      title: `${templateType}: ${customSubject}`,
    });

    onClose();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-300 w-full max-w-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* WhatsApp Theme Header */}
        <div className="px-6 py-4 bg-[#075E54] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs font-bold">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Institutional WhatsApp Notification Engine
              </h3>
              <p className="text-xs text-emerald-100 font-mono">
                Send duty rosters, exam start alerts, and direct messages to anyone
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Recipient Picker */}
          <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <span className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-800" />
              Select Recipient (User Directory or Any Custom Contact)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Choose from Registered Users
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleSelectUser(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  <option value="MANUAL">+ Enter Custom Recipient (Anyone)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role} · {u.phoneNumber || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Dr. Haris or Student Name"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-neutral-700 block mb-1">
                  WhatsApp Phone Number (with Country Code)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#25D366] absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +92 300 8472910"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-emerald-300 rounded-lg focus:ring-1 focus:ring-emerald-700 font-mono bg-emerald-50/20 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Template Category Selector */}
          <div>
            <label className="font-bold text-neutral-800 block mb-1.5">
              Notification Category &amp; Preset Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('DUTY_ROSTER')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  templateType === 'DUTY_ROSTER'
                    ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-2xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className="block font-semibold">Duty Roster</span>
                <span className="text-[10px] opacity-80 block truncate">Shift &amp; Upload Data</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('EXAM_STARTED')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  templateType === 'EXAM_STARTED'
                    ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-2xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className="block font-semibold">Exam Started</span>
                <span className="text-[10px] opacity-80 block truncate">Hall Commencement</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('EXAM_RESULT')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  templateType === 'EXAM_RESULT'
                    ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-2xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className="block font-semibold">Results Notice</span>
                <span className="text-[10px] opacity-80 block truncate">Transcript Available</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('STUDENT_PROMOTION')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  templateType === 'STUDENT_PROMOTION'
                    ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-2xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className="block font-semibold">Promotion Alert</span>
                <span className="text-[10px] opacity-80 block truncate">Semester Advanced</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('CUSTOM')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  templateType === 'CUSTOM'
                    ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-2xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className="block font-semibold">Custom Notice</span>
                <span className="text-[10px] opacity-80 block truncate">Any Message</span>
              </button>
            </div>
          </div>

          {/* If Custom Message -> Free Text Form */}
          {templateType === 'CUSTOM' && (
            <div className="space-y-3 p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <div>
                <label className="font-semibold text-neutral-800 block mb-1">Notice Headline</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="e.g. Clearance Deadline / Timetable Amendment"
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Message Content / Circular Text
                </label>
                <textarea
                  rows={4}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Type any custom notice, exam reminder, or administrative directive..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
                />
              </div>
            </div>
          )}

          {/* Formatted WhatsApp Live Preview */}
          <div>
            <div className="flex items-center justify-between pb-1 mb-1">
              <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-800" />
                Live WhatsApp Message Preview
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-4 bg-[#E5DDD5]/40 rounded-xl border border-neutral-300 font-mono text-xs text-neutral-800 whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto shadow-inner">
              {generatedMessage}
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Message will be delivered directly to WhatsApp on {phoneNumber || 'target phone'}.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="px-6 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open &amp; Dispatch in WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
