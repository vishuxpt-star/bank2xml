import React, { useState } from 'react';
import {
  Building,
  Calendar,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { ParsedStatement, StatementSummary } from '../types/statement.ts';

interface StatementOverviewProps {
  statement: ParsedStatement;
  onUpdateSummary: (summary: StatementSummary) => void;
  onOpenXmlStudio: () => void;
  onAutoCategorize: () => void;
}

export const StatementOverview: React.FC<StatementOverviewProps> = ({
  statement,
  onUpdateSummary,
  onOpenXmlStudio,
  onAutoCategorize,
}) => {
  const { summary } = statement;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StatementSummary>({ ...summary });

  const formatCurrency = (val: number) => {
    const num = (val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const curr = summary.currency || 'INR';
    if (curr === 'INR') return `₹${num}`;
    if (curr === 'USD') return `$${num}`;
    if (curr === 'EUR') return `€${num}`;
    if (curr === 'GBP') return `£${num}`;
    return `${curr} ${num}`;
  };

  const handleSave = () => {
    onUpdateSummary(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">{summary.bankName}</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                  {statement.layoutType} Layout
                </span>
              </div>
              <p className="text-xs text-slate-500">
                A/C Holder: <span className="font-semibold text-slate-700">{summary.accountHolder}</span> • A/C No:{' '}
                <span className="font-mono font-medium text-slate-800">{summary.accountNumber}</span>
                {summary.ifscOrRouting && ` • IFSC/Routing: ${summary.ifscOrRouting}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAutoCategorize}
            className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
          >
            ⚡ Auto-Categorize Ledgers
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Header'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenXmlStudio}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <span>Generate Tally XML</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional Edit Form */}
      {isEditing && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Bank Name</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-md"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Account Holder</label>
            <input
              type="text"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-md"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-md"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Opening Balance</label>
            <input
              type="number"
              step="0.01"
              value={formData.openingBalance}
              onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-md"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Stated Closing Balance</label>
            <input
              type="number"
              step="0.01"
              value={formData.statedClosingBalance}
              onChange={(e) => setFormData({ ...formData, statedClosingBalance: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSave}
              className="w-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-2 rounded-md flex items-center justify-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Details</span>
            </button>
          </div>
        </div>
      )}

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Opening Balance */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Opening Balance</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono">
            {formatCurrency(summary.openingBalance)}
          </p>
          <span className="text-[11px] text-slate-500">
            As of {summary.statementPeriod?.from || 'Start date'}
          </span>
        </div>

        {/* Total Inflows (Deposits) */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-medium">Total Deposits (Credits)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-800 font-mono">
            +{formatCurrency(summary.totalDeposits)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">
            Inflow to Bank Account
          </span>
        </div>

        {/* Total Outflows (Withdrawals) */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-medium">Total Withdrawals (Debits)</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-lg font-bold text-rose-800 font-mono">
            -{formatCurrency(summary.totalWithdrawals)}
          </p>
          <span className="text-[11px] text-rose-600 font-medium">
            Outflow from Bank Account
          </span>
        </div>

        {/* Closing Balance */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-xs font-medium">Closing Balance</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-indigo-950 font-mono">
            {formatCurrency(summary.calculatedClosingBalance)}
          </p>
          <span className="text-[11px] text-indigo-600">
            As of {summary.statementPeriod?.to || 'End date'}
          </span>
        </div>
      </div>

      {/* Mathematical Reconciliation Banner */}
      <div
        className={`mt-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          summary.isReconciled
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              summary.isReconciled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {summary.isReconciled ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">
                {summary.isReconciled
                  ? 'Mathematical Reconciliation Verified'
                  : 'Reconciliation Discrepancy Detected'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  summary.isReconciled
                    ? 'bg-emerald-200/80 text-emerald-900'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {summary.isReconciled ? '0.00 Difference' : `Diff: ${formatCurrency(summary.discrepancy)}`}
              </span>
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              Formula: Opening ({formatCurrency(summary.openingBalance)}) + Inflow ({formatCurrency(summary.totalDeposits)}) - Outflow ({formatCurrency(summary.totalWithdrawals)}) = Calculated Closing ({formatCurrency(summary.calculatedClosingBalance)})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/70 border border-current">
            {statement.transactions.length} Verified Entries
          </span>
        </div>
      </div>
    </div>
  );
};
