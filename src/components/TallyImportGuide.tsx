import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  FolderOpen,
  FileCheck2,
  Terminal,
  ShieldAlert,
  Sparkles,
  Layers,
} from 'lucide-react';

export const TallyImportGuide: React.FC = () => {
  const [activeVersionTab, setActiveVersionTab] = useState<'prime' | 'erp9'>('prime');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">
                Tally Prime &amp; Tally ERP9 XML Import Guide
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Official Schema Compatible
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Complete walkthrough for importing bank statement XML files into Tally Prime (v1.0 - v5.0) and Tally.ERP 9
            </p>
          </div>
        </div>

        {/* Tab switch between Tally Prime and Tally ERP 9 */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveVersionTab('prime')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeVersionTab === 'prime'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TallyPrime (Recommended)
          </button>
          <button
            onClick={() => setActiveVersionTab('erp9')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeVersionTab === 'erp9'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tally.ERP 9 (Classic)
          </button>
        </div>
      </div>

      {/* Guide Content depending on active tab */}
      {activeVersionTab === 'prime' ? (
        <div className="mt-6 space-y-6">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-950 leading-relaxed">
              <strong>TallyPrime Enhanced Features:</strong> Bank2XML includes unique GUIDs for TallyPrime deduplication and 
              proper <code className="bg-emerald-100 font-mono px-1 rounded">&lt;PERSISTEDVIEW&gt;</code> tags to ensure vouchers automatically reflect in your Bank Reconciliation and Day Book.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Prime Step 1
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">
                (Optional) Import Masters First
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                If you have new party ledgers or vendors in the bank statement, download the <strong>Master Ledgers XML</strong> from the XML Studio and import it first:
              </p>
              <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-bold">Alt + O</kbd> &gt; Masters &gt; XML &gt; Select <span className="text-emerald-700">TALLY_MASTERS_...xml</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Prime Step 2
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">
                Open Import in TallyPrime
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                On the top navigation bar of TallyPrime, click <strong>Import</strong> or use the standard keyboard shortcut:
              </p>
              <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-bold">Alt + O</kbd> &gt; Select <span className="font-bold">Transactions</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Prime Step 3
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">
                Select File Path &amp; Format
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                In the Import Transactions menu:
              </p>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                <li>File Format: <strong>XML (Data Interchange)</strong></li>
                <li>File Path: <strong>Specify Path</strong> or <strong>Select from Drive</strong></li>
                <li>File to Import: Select your downloaded <span className="font-mono text-emerald-700">TALLY_VOUCHERS_...xml</span></li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Prime Step 4
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">
                Complete Import &amp; Verify
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-bold">Enter</kbd>. TallyPrime will import all bank receipts, payments, and contras within seconds.
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold">
                ✓ Check in: Gateway of Tally &gt; Day Book or Banking &gt; Bank Reconciliation!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                ERP 9 Step 1
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">Save XML to Tally Directory</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Download the XML file and save it in your Tally.ERP9 folder (e.g.{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">C:\Tally.ERP9\tally_vouchers.xml</code>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                ERP 9 Step 2
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">Gateway of Tally</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Navigate to:
              </p>
              <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                Gateway of Tally &gt; Import Data &gt; Vouchers
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                ERP 9 Step 3
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">Enter File Name</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Enter the exact file path:
              </p>
              <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                File Name (XML): C:\Tally.ERP9\tally_vouchers.xml
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                ERP 9 Step 4
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">Check Tally.imp Log</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Press Enter. If any vouchers are skipped due to missing ledgers, open <code className="font-mono text-slate-800">Tally.imp</code> in your installation folder to view details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting Common Tally Errors */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
          <HelpCircle className="w-4 h-4 text-slate-500 mr-2" />
          Pro-Tips &amp; Troubleshooting
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1">Ledger Name Matching</h5>
            <p className="text-slate-600 leading-relaxed">
              Tally requires ledger names to match letter-for-letter. If you have "HDFC Current A/c", configure that exact string in Bank2XML settings before exporting.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1">Date Period (F2)</h5>
            <p className="text-slate-600 leading-relaxed">
              If Tally says "Date out of range", press <strong>Alt + F2</strong> in Tally to ensure the open Financial Year covers your statement dates.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1">Zero Duplicate Entries</h5>
            <p className="text-slate-600 leading-relaxed">
              Bank2XML generates unique transaction IDs and GUIDs, so re-importing in Tally Prime avoids duplicate voucher creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
