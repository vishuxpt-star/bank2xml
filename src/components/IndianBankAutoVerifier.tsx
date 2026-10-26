import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  HelpCircle,
  FileCheck,
  KeyRound,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { ParsedStatement } from '../types/statement.ts';
import {
  INDIAN_BANKS,
  runIndianStatementAutoVerification,
  formatIndianCurrency,
} from '../utils/indianBanks.ts';

interface IndianBankAutoVerifierProps {
  statement: ParsedStatement;
  onAutoFixMath?: () => void;
}

export const IndianBankAutoVerifier: React.FC<IndianBankAutoVerifierProps> = ({
  statement,
  onAutoFixMath,
}) => {
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const [showAuditDetails, setShowAuditDetails] = useState(true);

  const verificationReport = runIndianStatementAutoVerification(
    statement.summary.bankName,
    statement.summary.ifscOrRouting,
    statement.summary.openingBalance,
    statement.summary.statedClosingBalance,
    statement.transactions
  );

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-xs p-6 mb-8 relative overflow-hidden">
      {/* Decorative Indian Tricolor Subtle Gradient Accent Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shadow-xs">
            🇮🇳
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                Indian Bank Statement Auto-Verification Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center">
                <Award className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Score: {verificationReport.score}/100
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automated audit for RBI Clearing Standards, IFSC verification, UPI RRN/UTR audit, and Tally Prime compatibility
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowPasswordHints(!showPasswordHints)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Bank PDF Password Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAuditDetails(!showAuditDetails)}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center space-x-1 border border-emerald-200"
          >
            <span>{showAuditDetails ? 'Hide Audit Matrix' : 'View Audit Matrix'}</span>
            {showAuditDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* PDF Password Hints Accordion (Instant lookup for all Indian Banks) */}
      {showPasswordHints && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
              <KeyRound className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Standard Password Formats for Indian Bank Statement PDFs:
            </h4>
            <span className="text-[11px] text-slate-500">
              Unlock before uploading if your bank statement is password-protected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {INDIAN_BANKS.map((bank) => (
              <div key={bank.code} className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{bank.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                    {bank.ifscPrefix}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  🔑 {bank.pdfPasswordHint}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-Point Automated Verification Matrix */}
      {showAuditDetails && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {verificationReport.auditChecks.map((check, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-start space-x-2.5 ${
                check.status === 'PASS'
                  ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                  : check.status === 'WARN'
                  ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                  : 'bg-rose-50/50 border-rose-200 text-rose-950'
              }`}
            >
              {check.status === 'PASS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">{check.title}</span>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {check.message}
                </p>
              </div>
            </div>
          ))}

          {/* Quick Indian Banking Summary Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">
                Detected Bank: {statement.summary.bankName}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                IFSC: <span className="font-mono font-bold text-slate-800">{statement.summary.ifscOrRouting || 'Auto-Detected'}</span> • Layout: {statement.layoutType}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
