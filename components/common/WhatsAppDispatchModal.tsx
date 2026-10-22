'use client';

import React, { useState } from 'react';
import { MessageSquare, ExternalLink, Copy, Check, X, ShieldAlert, PhoneCall } from 'lucide-react';

interface WhatsAppDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  phoneNumber: string;
  title: string;
  message: string;
  whatsAppLink: string;
}

export function WhatsAppDispatchModal({
  isOpen,
  onClose,
  recipientName,
  phoneNumber,
  title,
  message,
  whatsAppLink,
}: WhatsAppDispatchModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* WhatsApp Brand Header */}
        <div className="px-6 py-4 bg-[#075E54] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">WhatsApp Notification Dispatch</h3>
              <p className="text-[11px] text-emerald-100 opacity-90 font-mono">
                Recipient: {recipientName} ({phoneNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-800">{title}</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
              WhatsApp Verified
            </span>
          </div>

          {/* Formatted Message Preview */}
          <div className="p-4 bg-[#E5DDD5]/30 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-800 whitespace-pre-line leading-relaxed shadow-inner max-h-60 overflow-y-auto">
            {message}
          </div>

          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              Target Phone: <strong className="text-neutral-800 font-mono">{phoneNumber}</strong> (Required for instant delivery)
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Dismiss
            </button>
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="px-5 py-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Open in WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
