/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { CollegeBranding, ActivityActionType, ActivityCategory, ActivitySeverity, UserRole } from '@/types/exam-system';
import {
  Palette,
  CheckCircle2,
  Building,
  UploadCloud,
  RotateCcw,
  Check,
  ShieldCheck,
  PenTool,
  Info,
  GraduationCap,
} from 'lucide-react';

interface InstitutionalBrandingSectionProps {
  branding: CollegeBranding;
  updateBranding: (newBranding: Partial<CollegeBranding>) => void;
  logActivity: (entry: {
    actionType: ActivityActionType;
    category: ActivityCategory;
    severity: ActivitySeverity;
    actorId?: string;
    actorName?: string;
    actorRole?: UserRole;
    actorEmail?: string;
    description: string;
    targetId?: string;
    targetType?: 'COURSE' | 'DATESHEET' | 'PAPER' | 'USER' | 'DUTY' | 'ARCHIVE' | 'SYSTEM';
    targetLabel?: string;
    departmentId?: string;
  }) => void;
  simulatedDate: string;
}

export function InstitutionalBrandingSection({
  branding,
  updateBranding,
  logActivity,
  simulatedDate,
}: InstitutionalBrandingSectionProps) {
  // Form State initialized from active context branding
  const [editCollegeName, setEditCollegeName] = useState(branding.collegeName);
  const [editSubTitle, setEditSubTitle] = useState(branding.subTitle);
  const [editLogoUrl, setEditLogoUrl] = useState(branding.logoUrl || '');
  const [brandingSaveSuccess, setBrandingSaveSuccess] = useState(false);

  // Transcript Signatories & Official Seal State
  const [editDeputyName, setEditDeputyName] = useState(
    branding.deputyRegistrarName || 'Dr. Richard Vance, Ph.D.'
  );
  const [editDeputyTitle, setEditDeputyTitle] = useState(
    branding.deputyRegistrarTitle || 'Deputy Registrar (Academics)'
  );
  const [editControllerName, setEditControllerName] = useState(
    branding.controllerName || 'Prof. Malcolm Thorne'
  );
  const [editControllerTitle, setEditControllerTitle] = useState(
    branding.controllerTitle || 'Controller of Examinations'
  );
  const [editSealText, setEditSealText] = useState(branding.sealText || 'OFFICIAL SEAL');
  const [editSealSubText, setEditSealSubText] = useState(branding.sealSubText || 'Exam Controller');
  const [editSealType, setEditSealType] = useState<'EMBOSSED' | 'EMBLEM' | 'ACADEMIC' | 'CUSTOM_IMAGE'>(
    branding.sealType || 'EMBOSSED'
  );
  const [editSealImageUrl, setEditSealImageUrl] = useState(
    branding.sealImageUrl || '/src/assets/images/exam_system_logo_1792130817114.jpg'
  );
  const [editSealColor, setEditSealColor] = useState(branding.sealColor || '#064e3b');

  // Curated Institutional College Identity Presets for Quick Configuration
  const institutionalPresets = [
    {
      name: 'Apex Institute of Technology & Engineering',
      subTitle: 'Office of the Controller of Examinations',
      tag: 'Apex Tech (Default)',
    },
    {
      name: 'National University of Science & Technology',
      subTitle: 'Directorate of Academic Affairs & Examinations',
      tag: 'NUST University',
    },
    {
      name: 'Imperial College of Higher Education',
      subTitle: 'Office of the Registrar & Examinations Board',
      tag: 'Imperial College',
    },
    {
      name: 'Metropolitan State Polytechnic University',
      subTitle: 'Board of Examinations and Academic Assessment',
      tag: 'Metropolitan Poly',
    },
  ];

  const presetLogos = [
    {
      name: 'Exam Management System Emblem (Vector)',
      url: '/src/assets/images/exam_system_logo_1792130817114.jpg',
    },
    {
      name: 'Academic Laurel Crest',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Ivy Heritage Shield',
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Modern University Seal',
      url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80',
    },
  ];

  // Image file upload handler for logo
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image file upload handler for custom seal
  const handleSealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSealImageUrl(reader.result as string);
        setEditSealType('CUSTOM_IMAGE');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save branding & signatories settings (persists to ExamProvider state and global footer)
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCollege = editCollegeName.trim() || 'Institutional College';
    const finalSubTitle = editSubTitle.trim() || 'Office of the Controller of Examinations';

    updateBranding({
      collegeName: finalCollege,
      subTitle: finalSubTitle,
      logoUrl: editLogoUrl,
      deputyRegistrarName: editDeputyName,
      deputyRegistrarTitle: editDeputyTitle,
      controllerName: editControllerName,
      controllerTitle: editControllerTitle,
      sealText: editSealText,
      sealSubText: editSealSubText,
      sealType: editSealType,
      sealImageUrl: editSealImageUrl,
      sealColor: editSealColor,
    });

    logActivity({
      actionType: 'BRANDING_UPDATED',
      category: 'SECURITY_ADMIN',
      severity: 'SUCCESS',
      description: `Institutional branding updated: College Name set to "${finalCollege}", Subtitle set to "${finalSubTitle}". Persisted to ExamProvider and global footer.`,
      targetType: 'SYSTEM',
      targetLabel: 'Institutional Branding Configuration',
    });

    setBrandingSaveSuccess(true);
    setTimeout(() => setBrandingSaveSuccess(false), 3500);
  };

  return (
    <div className="bg-white rounded-xl border border-emerald-200 p-6 space-y-6 animate-in fade-in duration-200">
      <div className="pb-4 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-800" />
            Institutional Identity &amp; College Configuration
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Update the official college name and subtitle in the ExamProvider state. All changes are persisted to browser storage and instantly update the application footer, top navigation, student admit slips, and official transcripts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditCollegeName('Apex Institute of Technology & Engineering');
            setEditSubTitle('Office of the Controller of Examinations');
            setEditLogoUrl('');
          }}
          className="px-2.5 py-1.5 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-neutral-500" />
          Reset Identity to Defaults
        </button>
      </div>

      {brandingSaveSuccess && (
        <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Institutional identity updated successfully in ExamProvider! Changes are persisted and active in the global footer, navigation, and transcripts.</span>
        </div>
      )}

      {/* ExamProvider State & Footer Persistence Info Banner */}
      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-emerald-950">ExamProvider State &amp; Footer Persistence Guarantee:</strong>
          <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
            Updating and saving this configuration updates the centralized <code className="px-1.5 py-0.5 bg-white rounded border border-emerald-200 font-mono text-[10px] text-emerald-900 font-semibold">branding</code> state in the root <code className="px-1.5 py-0.5 bg-white rounded border border-emerald-200 font-mono text-[10px] text-emerald-900 font-semibold">ExamProvider</code>, syncing seamlessly to local storage. The global footer at the bottom of the page dynamically renders these updated values.
          </p>
        </div>
      </div>

      {/* Institutional Presets Quick-Select */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-700" />
            Quick Institutional Templates (1-Click Fill):
          </span>
          <span className="text-[10px] text-neutral-500">Clicking loads college name &amp; subtitle into inputs</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {institutionalPresets.map((preset) => {
            const isSelected = editCollegeName === preset.name && editSubTitle === preset.subTitle;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setEditCollegeName(preset.name);
                  setEditSubTitle(preset.subTitle);
                }}
                className={`p-2.5 text-left rounded-lg border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-2xs font-semibold'
                    : 'bg-white border-neutral-200 hover:border-emerald-300 text-neutral-700 hover:bg-emerald-50/40'
                }`}
              >
                <div className="font-bold text-xs truncate" title={preset.name}>
                  {preset.tag}
                </div>
                <div className="text-[10px] text-neutral-500 truncate mt-1" title={preset.subTitle}>
                  {preset.subTitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSaveBranding} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* College Name & Subtitle inputs */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                  <span>College / University Official Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  {editCollegeName.length} chars
                </span>
              </div>
              <input
                type="text"
                required
                value={editCollegeName}
                onChange={(e) => setEditCollegeName(e.target.value)}
                placeholder="e.g. Apex Institute of Technology & Engineering"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 font-semibold text-neutral-900 bg-white"
              />
              <span className="text-[11px] text-emerald-800 font-medium mt-1 block">
                ✓ Persists directly to the global footer title and top navigation wordmark.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                  <span>Directorate / Examination Council Subtitle</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  {editSubTitle.length} chars
                </span>
              </div>
              <input
                type="text"
                required
                value={editSubTitle}
                onChange={(e) => setEditSubTitle(e.target.value)}
                placeholder="e.g. Office of the Controller of Examinations"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 text-neutral-800 bg-white"
              />
              <span className="text-[11px] text-emerald-800 font-medium mt-1 block">
                ✓ Persists directly to the global footer subtitle, date sheet headers, and transcripts.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                Custom Emblem / Crest Logo Image URL
              </label>
              <input
                type="text"
                value={editLogoUrl}
                onChange={(e) => setEditLogoUrl(e.target.value)}
                placeholder="https://example.com/college-logo.png"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-700 font-mono text-neutral-700 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">
                Or Upload Emblem Image File
              </label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-emerald-300 rounded-lg bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer text-xs text-emerald-800 transition-colors">
                <UploadCloud className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Choose an emblem image from your device...</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Live Preview Box with BOTH Header & Footer Visualizers */}
          <div className="p-5 bg-emerald-50/30 border border-emerald-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Real-Time Visual Feedback (Preview)
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">
                Auto-Synchronized
              </span>
            </div>

            {/* 1. Header Wordmark Preview */}
            <div className="p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs space-y-1.5">
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                1. Top Navbar Header Display:
              </div>
              <div className="flex items-center gap-3 pt-1 border-t border-neutral-100">
                {editLogoUrl ? (
                  <img
                    src={editLogoUrl}
                    alt="Logo Preview"
                    width={36}
                    height={36}
                    style={{ width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px', objectFit: 'cover' }}
                    className="w-9 h-9 rounded-md object-cover border border-emerald-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-md bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {editCollegeName.slice(0, 2).toUpperCase() || 'CU'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-neutral-900 leading-tight">
                    {editCollegeName || 'College Name'}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium">
                    {editSubTitle || 'Office of the Controller of Examinations'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Global Footer Mirror Preview */}
            <div className="p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                <span>2. Global Application Footer Display:</span>
                <span className="text-emerald-700 lowercase font-mono">mirrors app/page.tsx</span>
              </div>
              <div className="pt-2 border-t border-neutral-100 bg-[#FAFDF9] p-2.5 rounded-md border border-emerald-100">
                <div className="flex items-center gap-3">
                  <img
                    src={editLogoUrl || '/src/assets/images/exam_system_logo_1792130817114.jpg'}
                    alt="Emblem"
                    width={36}
                    height={36}
                    style={{ width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px', objectFit: 'contain' }}
                    className="w-9 h-9 rounded-full object-contain border border-emerald-200 shadow-2xs bg-white shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-neutral-900 text-xs truncate">
                        {editCollegeName || 'College / University Name'}
                      </span>
                      <span className="text-emerald-700 font-semibold text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
                        Exam Management System
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-emerald-900 font-medium">
                        {editSubTitle || 'Office of the Controller of Examinations'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-neutral-400">Academic Integrity &amp; Institutional Precision</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-emerald-50 flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                  <span>Faculties: English · Mathematics · Computer Science</span>
                  <span className="px-1.5 py-0.2 bg-neutral-100 rounded text-neutral-600 font-bold">
                    Simulated Date: {simulatedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Preset Crests */}
            <div>
              <span className="text-[11px] font-semibold text-neutral-600 block mb-2">
                Curated Crest / Emblem Presets:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {presetLogos.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setEditLogoUrl(preset.url)}
                    className={`p-2 rounded-lg border text-left text-[11px] transition-colors flex flex-col items-center gap-1.5 cursor-pointer ${
                      editLogoUrl === preset.url
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      width={32}
                      height={32}
                      style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'cover' }}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <span className="text-center line-clamp-1">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {editLogoUrl && (
              <button
                type="button"
                onClick={() => setEditLogoUrl('')}
                className="text-[11px] text-red-600 hover:underline block cursor-pointer"
              >
                Clear custom logo (use green monogram)
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Official Transcript Signatories & Document Seal */}
        <div className="pt-6 border-t border-emerald-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                Official Transcript Signatories &amp; Document Seal
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Configure the official signatories and university stamp that appear on all generated academic transcripts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditDeputyName('Dr. Richard Vance, Ph.D.');
                setEditDeputyTitle('Deputy Registrar (Academics)');
                setEditControllerName('Prof. Malcolm Thorne');
                setEditControllerTitle('Controller of Examinations');
                setEditSealText('OFFICIAL SEAL');
                setEditSealSubText('Exam Controller');
                setEditSealType('EMBOSSED');
                setEditSealImageUrl('/src/assets/images/exam_system_logo_1792130817114.jpg');
                setEditSealColor('#064e3b');
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-300 rounded hover:bg-neutral-50 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-neutral-500" />
              Reset Signatories to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Deputy Registrar Configuration */}
            <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                  1. Deputy Registrar
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Signatory #1</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                  Full Name &amp; Academic Post-nominal
                </label>
                <input
                  type="text"
                  value={editDeputyName}
                  onChange={(e) => setEditDeputyName(e.target.value)}
                  placeholder="e.g. Dr. Richard Vance, Ph.D."
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 font-serif font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                  Designation / Department Title
                </label>
                <input
                  type="text"
                  value={editDeputyTitle}
                  onChange={(e) => setEditDeputyTitle(e.target.value)}
                  placeholder="e.g. Deputy Registrar (Academics)"
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 text-neutral-800"
                />
              </div>
            </div>

            {/* 2. Controller of Examinations Configuration */}
            <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                  2. Controller of Examinations
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Signatory #2</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                  Full Name &amp; Academic Title
                </label>
                <input
                  type="text"
                  value={editControllerName}
                  onChange={(e) => setEditControllerName(e.target.value)}
                  placeholder="e.g. Prof. Malcolm Thorne"
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 font-serif font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                  Designation / Directorate Title
                </label>
                <input
                  type="text"
                  value={editControllerTitle}
                  onChange={(e) => setEditControllerTitle(e.target.value)}
                  placeholder="e.g. Controller of Examinations"
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 text-neutral-800"
                />
              </div>
            </div>

            {/* 3. Official University Seal & Stamp */}
            <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  3. Official Document Seal
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Security Stamp</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                  Seal Type &amp; Rendering Style
                </label>
                <select
                  value={editSealType}
                  onChange={(e) =>
                    setEditSealType(
                      e.target.value as 'EMBOSSED' | 'EMBLEM' | 'ACADEMIC' | 'CUSTOM_IMAGE'
                    )
                  }
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  <option value="EMBOSSED">Embossed University Stamp (Red/Green Border)</option>
                  <option value="EMBLEM">College Emblem Logo Inside Seal</option>
                  <option value="ACADEMIC">Academic Crest with Graduation Cap</option>
                  <option value="CUSTOM_IMAGE">Custom Uploaded Official Seal Image</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Seal Primary Text
                  </label>
                  <input
                    type="text"
                    value={editSealText}
                    onChange={(e) => setEditSealText(e.target.value)}
                    placeholder="OFFICIAL SEAL"
                    className="w-full px-2 py-1 text-xs border border-neutral-300 rounded-md font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Seal Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editSealColor}
                      onChange={(e) => setEditSealColor(e.target.value)}
                      className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0.5"
                    />
                    <span className="text-[10px] font-mono text-neutral-500">{editSealColor}</span>
                  </div>
                </div>
              </div>

              {editSealType === 'CUSTOM_IMAGE' && (
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Upload Custom Official Seal Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSealFileUpload}
                    className="w-full text-[11px] text-neutral-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Live Signatory Footer Preview Box */}
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-900 block">
              Live Transcript Signatures &amp; Seal Preview:
            </span>
            <div className="p-6 bg-white border border-neutral-200 rounded-lg shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
              <div className="text-center sm:text-left space-y-0.5">
                <div className="font-serif italic text-base text-emerald-950 font-bold border-b border-neutral-400 pb-0.5 px-2 inline-block">
                  {editDeputyName}
                </div>
                <div className="font-bold text-neutral-900 text-xs mt-1">{editDeputyTitle}</div>
                <div className="text-[10px] text-neutral-500">{editCollegeName}</div>
              </div>

              {/* Stamp Graphic */}
              <div className="shrink-0">
                {editSealType === 'EMBLEM' || (editSealType === 'CUSTOM_IMAGE' && editSealImageUrl) ? (
                  <div
                    className="w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-1 relative overflow-hidden bg-white shadow-2xs"
                    style={{ borderColor: editSealColor }}
                  >
                    <img
                      src={editSealImageUrl || '/src/assets/images/exam_system_logo_1792130817114.jpg'}
                      alt="Seal Preview"
                      referrerPolicy="no-referrer"
                      width={48}
                      height={48}
                      style={{ width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', objectFit: 'contain' }}
                      className="w-12 h-12 rounded-full object-contain"
                    />
                    <div
                      className="text-[6.5px] font-black uppercase tracking-wider leading-tight truncate px-0.5 mt-0.5"
                      style={{ color: editSealColor }}
                    >
                      {editSealText}
                    </div>
                  </div>
                ) : editSealType === 'ACADEMIC' ? (
                  <div
                    className="w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-1 bg-emerald-50/30"
                    style={{ borderColor: editSealColor, color: editSealColor }}
                  >
                    <GraduationCap className="w-5 h-5 mb-0.5" style={{ color: editSealColor }} />
                    <div className="text-[7px] font-black uppercase tracking-wider leading-tight">
                      {editSealText}
                    </div>
                    <div className="text-[6px] text-neutral-500 font-mono">{editSealSubText}</div>
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-1 bg-emerald-50/30"
                    style={{ borderColor: editSealColor, color: editSealColor }}
                  >
                    <ShieldCheck className="w-5 h-5 mb-0.5" />
                    <div className="text-[7.5px] font-black uppercase tracking-wider leading-tight">
                      {editSealText}
                    </div>
                    <div className="text-[6.5px] font-mono text-neutral-600">{editSealSubText}</div>
                  </div>
                )}
              </div>

              <div className="text-center sm:text-right space-y-0.5">
                <div className="font-serif italic text-base text-emerald-950 font-bold border-b border-neutral-400 pb-0.5 px-2 inline-block">
                  {editControllerName}
                </div>
                <div className="font-bold text-neutral-900 text-xs mt-1">{editControllerTitle}</div>
                <div className="text-[10px] text-emerald-800 font-semibold">{editCollegeName}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Changes will persist in ExamProvider state and immediately update the global application footer.</span>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Save &amp; Persist to Footer &amp; System
          </button>
        </div>
      </form>
    </div>
  );
}
