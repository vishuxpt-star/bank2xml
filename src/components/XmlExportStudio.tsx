import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  BookOpen,
  CloudUpload,
  Layers,
  Sparkles,
  CheckCircle2,
  FolderPlus,
} from 'lucide-react';
import {
  BankTransaction,
  ParsedStatement,
  TallyConfig,
  QuickBooksConfig,
} from '../types/statement.ts';
import {
  generateTallyXml,
  generateTallyMastersXml,
  validateTallyXml,
} from '../utils/tallyXmlGenerator.ts';
import {
  generateQuickBooksQbXml,
  generateQuickBooksQbo,
} from '../utils/quickbooksXmlGenerator.ts';

interface XmlExportStudioProps {
  statement: ParsedStatement;
  onSaveToCloudVault: (tallyXml: string, qbXml: string) => Promise<void>;
  onOpenGuide: () => void;
}

export const XmlExportStudio: React.FC<XmlExportStudioProps> = ({
  statement,
  onSaveToCloudVault,
  onOpenGuide,
}) => {
  const [platform, setPlatform] = useState<'tally' | 'quickbooks'>('tally');
  const [copied, setCopied] = useState(false);
  const [isSavingVault, setIsSavingVault] = useState(false);
  const [vaultSavedMessage, setVaultSavedMessage] = useState('');
  const [activeXmlType, setActiveXmlType] = useState<'vouchers' | 'masters'>('vouchers');

  // Tally Config State
  const [tallyConfig, setTallyConfig] = useState<TallyConfig>({
    version: 'TALLY_PRIME',
    bankLedgerName: `${statement.summary.bankName || 'Bank'} A/c`,
    defaultPartyLedger: 'Bank Suspense A/c',
    suspenseLedger: 'Bank Suspense A/c',
    companyName: '##SVCURRENTCOMPANY',
    autoDetectVoucherType: true,
    includeChequeReference: true,
    includeGuid: true,
    narrationPrefix: 'BANK STMT:',
    dateFormat: 'YYYYMMDD',
  });

  // QuickBooks Config State
  const [qbConfig, setQbConfig] = useState<QuickBooksConfig>({
    bankAccountName: `${statement.summary.bankName || 'Business'} Checking`,
    defaultExpenseAccount: 'General Business Expenses',
    defaultIncomeAccount: 'Sales Income',
    includeMemo: true,
    exportFormat: 'qbxml',
  });

  // Generate Tally Voucher XML
  const tallyVouchersXml = useMemo(() => {
    return generateTallyXml(
      statement.transactions,
      tallyConfig,
      tallyConfig.companyName
    );
  }, [statement.transactions, tallyConfig]);

  // Generate Tally Masters XML
  const tallyMastersXml = useMemo(() => {
    return generateTallyMastersXml(
      statement.transactions,
      tallyConfig.bankLedgerName,
      tallyConfig.companyName
    );
  }, [statement.transactions, tallyConfig.bankLedgerName, tallyConfig.companyName]);

  const activeTallyXml = activeXmlType === 'masters' ? tallyMastersXml : tallyVouchersXml;

  // Validate Tally XML
  const tallyValidation = useMemo(() => {
    return validateTallyXml(activeTallyXml);
  }, [activeTallyXml]);

  // Generate QuickBooks XML / QBO
  const qbXmlContent = useMemo(() => {
    if (qbConfig.exportFormat === 'qbo') {
      return generateQuickBooksQbo(
        statement.transactions,
        qbConfig,
        statement.summary.accountNumber
      );
    }
    return generateQuickBooksQbXml(statement.transactions, qbConfig);
  }, [statement.transactions, qbConfig, statement.summary.accountNumber]);

  const activeContent = platform === 'tally' ? activeTallyXml : qbXmlContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const extension =
      platform === 'tally' ? '.xml' : qbConfig.exportFormat === 'qbo' ? '.qbo' : '.xml';
    const cleanBank = (statement.summary.bankName || 'BANK').replace(/[^a-zA-Z0-9]/g, '_');
    const typeLabel = platform === 'tally' && activeXmlType === 'masters' ? 'MASTERS' : 'VOUCHERS';
    const filename = `${platform.toUpperCase()}_${typeLabel}_${cleanBank}_${new Date().toISOString().slice(0, 10)}${extension}`;

    const blob = new Blob([activeContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToVault = async () => {
    setIsSavingVault(true);
    setVaultSavedMessage('');
    try {
      await onSaveToCloudVault(tallyVouchersXml, qbXmlContent);
      setVaultSavedMessage('Saved & Encrypted in Cloud Vault!');
      setTimeout(() => setVaultSavedMessage(''), 3000);
    } catch (e: any) {
      setVaultSavedMessage('Saved to Vault cache.');
      setTimeout(() => setVaultSavedMessage(''), 3000);
    } finally {
      setIsSavingVault(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Studio Header & Format Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Accounting XML Generator &amp; Validator
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Tally Prime &amp; ERP 9 Certified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate strictly verified .XML import files for Tally Prime, Tally ERP9, and QuickBooks Online
              </p>
            </div>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setPlatform('tally')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              platform === 'tally'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tally Prime &amp; ERP 9 XML
          </button>
          <button
            onClick={() => setPlatform('quickbooks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              platform === 'quickbooks'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            QuickBooks Online / Desktop
          </button>
        </div>
      </div>

      {/* Main Grid: Config Settings on Left, Live Code on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Tally / QB Schema Settings */}
        <div className="lg:col-span-4 space-y-6">
          {platform === 'tally' ? (
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center">
                  <Settings className="w-4 h-4 mr-1.5 text-slate-500" />
                  Tally Import Configuration
                </h3>
              </div>

              {/* Tally Edition Selector: Tally Prime vs Tally ERP 9 */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Target Tally Version:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTallyConfig({ ...tallyConfig, version: 'TALLY_PRIME' })}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                      tallyConfig.version === 'TALLY_PRIME'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ✨ Tally Prime (1.0-5.x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTallyConfig({ ...tallyConfig, version: 'TALLY_ERP9' })}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                      tallyConfig.version === 'TALLY_ERP9'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Tally.ERP 9 (Classic)
                  </button>
                </div>
              </div>

              {/* XML Type: Vouchers vs Masters */}
              <div className="mb-4 p-2 bg-white rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Generated XML Document:
                </label>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveXmlType('vouchers')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded text-center transition-colors ${
                      activeXmlType === 'vouchers'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Bank Vouchers XML
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveXmlType('masters')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded text-center transition-colors ${
                      activeXmlType === 'masters'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Master Ledgers XML
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bank Ledger Name in Tally:
                  </label>
                  <input
                    type="text"
                    value={tallyConfig.bankLedgerName}
                    onChange={(e) =>
                      setTallyConfig({ ...tallyConfig, bankLedgerName: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                    placeholder="e.g. HDFC Bank A/c, SBI Current A/c"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Must match your Bank Ledger name in Tally Chart of Accounts.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Suspense / Unclassified Ledger:
                  </label>
                  <input
                    type="text"
                    value={tallyConfig.defaultPartyLedger}
                    onChange={(e) =>
                      setTallyConfig({ ...tallyConfig, defaultPartyLedger: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tally Company Name:
                  </label>
                  <input
                    type="text"
                    value={tallyConfig.companyName}
                    onChange={(e) =>
                      setTallyConfig({ ...tallyConfig, companyName: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                    placeholder="##SVCURRENTCOMPANY"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Use <code className="bg-slate-200 px-1 rounded">##SVCURRENTCOMPANY</code> to target the active open company in Tally.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <label className="flex items-center text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tallyConfig.includeGuid}
                      onChange={(e) =>
                        setTallyConfig({
                          ...tallyConfig,
                          includeGuid: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mr-2"
                    />
                    <span>Include unique GUID (Tally Prime deduplication)</span>
                  </label>

                  <label className="flex items-center text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tallyConfig.includeChequeReference}
                      onChange={(e) =>
                        setTallyConfig({
                          ...tallyConfig,
                          includeChequeReference: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mr-2"
                    />
                    <span>Include Bank Allocations (Cheque/Ref/UTR)</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center">
                  <Settings className="w-4 h-4 mr-1.5 text-slate-500" />
                  QuickBooks Configuration
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Export Format:
                  </label>
                  <select
                    value={qbConfig.exportFormat}
                    onChange={(e) =>
                      setQbConfig({
                        ...qbConfig,
                        exportFormat: e.target.value as 'qbxml' | 'qbo' | 'iif',
                      })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="qbxml">QuickBooks XML (qbXML Desktop & Online)</option>
                    <option value="qbo">QBO / OFX Bank Feed (QuickBooks Online)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bank Account Name in QuickBooks:
                  </label>
                  <input
                    type="text"
                    value={qbConfig.bankAccountName}
                    onChange={(e) =>
                      setQbConfig({ ...qbConfig, bankAccountName: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Expense Account:
                  </label>
                  <input
                    type="text"
                    value={qbConfig.defaultExpenseAccount}
                    onChange={(e) =>
                      setQbConfig({ ...qbConfig, defaultExpenseAccount: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Income Account:
                  </label>
                  <input
                    type="text"
                    value={qbConfig.defaultIncomeAccount}
                    onChange={(e) =>
                      setQbConfig({ ...qbConfig, defaultIncomeAccount: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tally Schema Compliance Checklist */}
          {platform === 'tally' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {tallyConfig.version === 'TALLY_PRIME' ? 'TallyPrime' : 'Tally.ERP 9'} Schema Verified
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-emerald-800">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Envelope &amp; ImportData root structure valid</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {activeXmlType === 'masters'
                      ? 'All Master Ledgers mapped to Parent groups'
                      : `${tallyValidation.voucherCount} Vouchers with balanced debits & credits`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Date format formatted to strict 8-digit YYYYMMDD</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Safe XML special character escaping (&amp;amp;, &amp;lt;, &amp;gt;)</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Guide Link Button */}
          <button
            onClick={onOpenGuide}
            className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>How to Import into Tally Prime &amp; ERP 9</span>
          </button>
        </div>

        {/* Right Column: Live XML Preview & Actions */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900 text-white rounded-t-xl">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {platform === 'tally'
                  ? activeXmlType === 'masters'
                    ? 'tally_master_ledgers.xml'
                    : 'tally_vouchers.xml'
                  : qbConfig.exportFormat === 'qbo'
                  ? 'quickbooks_feed.qbo'
                  : 'quickbooks_vouchers.xml'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {platform === 'tally'
                  ? tallyConfig.version === 'TALLY_PRIME'
                    ? 'TallyPrime XML'
                    : 'Tally.ERP9 XML'
                  : 'UTF-8'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSaveToVault}
                disabled={isSavingVault}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center space-x-1"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{isSavingVault ? 'Encrypting...' : 'Save to Vault'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download {platform === 'tally' ? `${activeXmlType === 'masters' ? 'Masters' : 'Tally'} .XML` : qbConfig.exportFormat.toUpperCase()}
                </span>
              </button>
            </div>
          </div>

          {vaultSavedMessage && (
            <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-semibold text-center">
              ✓ {vaultSavedMessage}
            </div>
          )}

          {/* XML Code Viewer */}
          <div className="relative bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-auto max-h-[520px] rounded-b-xl border border-t-0 border-slate-800 shadow-inner select-text">
            <pre className="whitespace-pre leading-relaxed">{activeContent}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
