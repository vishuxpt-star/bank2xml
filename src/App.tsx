import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { UploadSection } from './components/UploadSection.tsx';
import { IndianBankAutoVerifier } from './components/IndianBankAutoVerifier.tsx';
import { StatementOverview } from './components/StatementOverview.tsx';
import { TransactionTable } from './components/TransactionTable.tsx';
import { XmlExportStudio } from './components/XmlExportStudio.tsx';
import { CloudVaultPanel } from './components/CloudVaultPanel.tsx';
import { TallyImportGuide } from './components/TallyImportGuide.tsx';
import { SAMPLE_STATEMENTS } from './data/sampleStatements.ts';
import {
  BankTransaction,
  ParsedStatement,
  StatementSummary,
} from './types/statement.ts';
import {
  calculateReconciliation,
  suggestLedgerAndVoucher,
} from './utils/reconciliation.ts';
import { Shield, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'converter' | 'xmlStudio' | 'vault' | 'tallyGuide'>('converter');
  const [currentStatement, setCurrentStatement] = useState<ParsedStatement>(SAMPLE_STATEMENTS[0]);
  const [selectedLayout, setSelectedLayout] = useState('AUTO');
  const [autoSaveToVault, setAutoSaveToVault] = useState(true);
  const [vaultCount, setVaultCount] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // When a statement is loaded from upload or sample
  const handleStatementLoaded = async (stmt: ParsedStatement) => {
    setCurrentStatement(stmt);
    showToast(`Loaded statement: ${stmt.summary.bankName} (${stmt.transactions.length} txns)`);

    // If auto-save to cloud vault is enabled
    if (autoSaveToVault) {
      try {
        await fetch('/api/cloud-vault/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            statement: stmt,
            provider: 'vault',
          }),
        });
        setVaultCount((prev) => prev + 1);
      } catch (e) {
        console.warn('Auto vault backup log:', e);
      }
    }
  };

  const handleSelectSample = (index: number) => {
    const sample = SAMPLE_STATEMENTS[index] || SAMPLE_STATEMENTS[0];
    handleStatementLoaded(sample);
  };

  // Update summary header
  const handleUpdateSummary = (newSummary: StatementSummary) => {
    const recon = calculateReconciliation(
      newSummary.openingBalance,
      newSummary.statedClosingBalance,
      currentStatement.transactions
    );

    setCurrentStatement((prev) => ({
      ...prev,
      summary: {
        ...newSummary,
        totalWithdrawals: recon.totalWithdrawals,
        totalDeposits: recon.totalDeposits,
        calculatedClosingBalance: recon.calculatedClosingBalance,
        isReconciled: recon.isReconciled,
        discrepancy: recon.discrepancy,
      },
    }));
    showToast('Updated statement header information');
  };

  // Transaction mutations
  const handleUpdateTransaction = (updatedTx: BankTransaction) => {
    const newTxns = currentStatement.transactions.map((tx) =>
      tx.id === updatedTx.id ? updatedTx : tx
    );
    updateTransactionsAndReconcile(newTxns);
    showToast('Transaction row updated');
  };

  const handleDeleteTransaction = (id: string) => {
    const newTxns = currentStatement.transactions.filter((tx) => tx.id !== id);
    updateTransactionsAndReconcile(newTxns);
    showToast('Transaction removed');
  };

  const handleAddTransaction = (newTx: BankTransaction) => {
    const newTxns = [...currentStatement.transactions, newTx];
    updateTransactionsAndReconcile(newTxns);
    showToast('Added new transaction row');
  };

  const handleBulkUpdateLedger = (ids: string[], ledger: string) => {
    const newTxns = currentStatement.transactions.map((tx) =>
      ids.includes(tx.id) ? { ...tx, categoryLedger: ledger } : tx
    );
    updateTransactionsAndReconcile(newTxns);
    showToast(`Updated ledger to "${ledger}" on ${ids.length} transactions`);
  };

  const handleAutoCategorizeAll = () => {
    let count = 0;
    const newTxns = currentStatement.transactions.map((tx) => {
      const suggested = suggestLedgerAndVoucher(tx.particulars, tx.deposit, tx.withdrawal);
      if (tx.categoryLedger !== suggested.ledger) count++;
      return {
        ...tx,
        categoryLedger: suggested.ledger,
        voucherType: suggested.voucherType,
      };
    });
    updateTransactionsAndReconcile(newTxns);
    showToast(`Smart categorized ${count} ledgers from narration rules`);
  };

  const updateTransactionsAndReconcile = (transactions: BankTransaction[]) => {
    const recon = calculateReconciliation(
      currentStatement.summary.openingBalance,
      currentStatement.summary.statedClosingBalance,
      transactions
    );

    setCurrentStatement((prev) => ({
      ...prev,
      summary: {
        ...prev.summary,
        totalWithdrawals: recon.totalWithdrawals,
        totalDeposits: recon.totalDeposits,
        calculatedClosingBalance: recon.calculatedClosingBalance,
        isReconciled: recon.isReconciled,
        discrepancy: recon.discrepancy,
      },
      transactions,
    }));
  };

  const handleSaveToCloudVault = async (tallyXml: string, qbXml: string) => {
    const response = await fetch('/api/cloud-vault/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        statement: currentStatement,
        tallyXml,
        quickBooksXml: qbXml,
        provider: 'vault',
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to save to cloud vault');
    }
    const data = await response.json();
    setVaultCount((prev) => prev + 1);
    showToast('Securely stored in Cloud Vault with AES-256 seal!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vaultCount={vaultCount}
        onSelectSample={handleSelectSample}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'converter' && (
          <div>
            {/* Upload Area */}
            <UploadSection
              onStatementLoaded={handleStatementLoaded}
              selectedLayout={selectedLayout}
              setSelectedLayout={setSelectedLayout}
              autoSaveToVault={autoSaveToVault}
              setAutoSaveToVault={setAutoSaveToVault}
            />

            {/* Indian Banking Auto-Verification & RBI Compliance Card */}
            <IndianBankAutoVerifier statement={currentStatement} />

            {/* Statement Overview Header & Reconciliation Card */}
            <StatementOverview
              statement={currentStatement}
              onUpdateSummary={handleUpdateSummary}
              onOpenXmlStudio={() => setActiveTab('xmlStudio')}
              onAutoCategorize={handleAutoCategorizeAll}
            />

            {/* Interactive Review Table */}
            <TransactionTable
              transactions={currentStatement.transactions}
              currency={currentStatement.summary.currency}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onAddTransaction={handleAddTransaction}
              onBulkUpdateLedger={handleBulkUpdateLedger}
            />
          </div>
        )}

        {activeTab === 'xmlStudio' && (
          <XmlExportStudio
            statement={currentStatement}
            onSaveToCloudVault={handleSaveToCloudVault}
            onOpenGuide={() => setActiveTab('tallyGuide')}
          />
        )}

        {activeTab === 'vault' && (
          <CloudVaultPanel
            onLoadStatement={(stmt) => {
              setCurrentStatement(stmt);
              setActiveTab('converter');
              showToast(`Loaded ${stmt.summary.bankName} from Cloud Vault!`);
            }}
            onRefreshVaultCount={(cnt) => setVaultCount(cnt)}
          />
        )}

        {activeTab === 'tallyGuide' && <TallyImportGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Bank2XML</span>
            <span>•</span>
            <span>Strict Tally Prime &amp; Tally.ERP 9 XML Schema Compliance</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-emerald-600 font-medium">
              <Shield className="w-3.5 h-3.5 mr-1" />
              Client AES-256 Vault
            </span>
            <span>QuickBooks Online &amp; Desktop Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
