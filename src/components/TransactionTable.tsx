import React, { useState } from 'react';
import {
  BankTransaction,
  ParsedStatement,
} from '../types/statement.ts';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ArrowUpDown,
  Tag,
  FileCheck,
} from 'lucide-react';

interface TransactionTableProps {
  transactions: BankTransaction[];
  currency: string;
  onUpdateTransaction: (updated: BankTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: (newTx: BankTransaction) => void;
  onBulkUpdateLedger: (ids: string[], ledger: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  currency,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddTransaction,
  onBulkUpdateLedger,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVoucher, setFilterVoucher] = useState<'ALL' | 'Payment' | 'Receipt' | 'Contra'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<BankTransaction | null>(null);
  const [bulkLedgerInput, setBulkLedgerInput] = useState('');
  const [showBulkLedgerModal, setShowBulkLedgerModal] = useState(false);

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.chqRefNo && tx.chqRefNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.categoryLedger.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.date.includes(searchTerm);

    const matchesFilter = filterVoucher === 'ALL' || tx.voucherType === filterVoucher;

    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const startEdit = (tx: BankTransaction) => {
    setEditingId(tx.id);
    setEditRow({ ...tx });
  };

  const saveEdit = () => {
    if (editRow) {
      onUpdateTransaction(editRow);
      setEditingId(null);
      setEditRow(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRow(null);
  };

  const handleAddNewRow = () => {
    const newTx: BankTransaction = {
      id: `tx-custom-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      particulars: 'New Bank Transaction Entry',
      chqRefNo: '',
      withdrawal: 0,
      deposit: 0,
      balance: transactions.length > 0 ? transactions[transactions.length - 1].balance : 0,
      categoryLedger: 'General Expense',
      voucherType: 'Payment',
    };
    onAddTransaction(newTx);
    startEdit(newTx);
  };

  const handleApplyBulkLedger = () => {
    if (bulkLedgerInput.trim() && selectedIds.length > 0) {
      onBulkUpdateLedger(selectedIds, bulkLedgerInput.trim());
      setShowBulkLedgerModal(false);
      setBulkLedgerInput('');
      setSelectedIds([]);
    }
  };

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search narration, cheque #, ledger, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Voucher type filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {(['ALL', 'Payment', 'Receipt', 'Contra'] as const).map((vt) => (
              <button
                key={vt}
                onClick={() => setFilterVoucher(vt)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterVoucher === vt
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {vt}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={() => setShowBulkLedgerModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center space-x-1"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Map Ledger ({selectedIds.length})</span>
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => onDeleteTransaction(id));
                  setSelectedIds([]);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}

          <button
            onClick={handleAddNewRow}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center space-x-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {/* Bulk Ledger Modal */}
      {showBulkLedgerModal && (
        <div className="p-4 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <span className="text-xs font-bold text-indigo-900">
              Bulk assign Ledger to {selectedIds.length} selected row(s):
            </span>
            <input
              type="text"
              placeholder="e.g. Rent Expenses, Office Supplies, Sundry Debtors..."
              value={bulkLedgerInput}
              onChange={(e) => setBulkLedgerInput(e.target.value)}
              className="text-xs px-3 py-1.5 bg-white border border-indigo-200 rounded-md flex-1 max-w-sm"
              autoFocus
            />
            <button
              onClick={handleApplyBulkLedger}
              className="text-xs font-bold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Apply
            </button>
            <button
              onClick={() => setShowBulkLedgerModal(false)}
              className="text-xs px-2 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transactions Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3 w-24">Date</th>
              <th className="py-3 px-4">Particulars / Narration</th>
              <th className="py-3 px-3 w-28">Chq / Ref No</th>
              <th className="py-3 px-3 w-28 text-right text-rose-700">Withdrawal (Dr)</th>
              <th className="py-3 px-3 w-28 text-right text-emerald-700">Deposit (Cr)</th>
              <th className="py-3 px-3 w-28 text-right">Balance</th>
              <th className="py-3 px-4 w-48">Tally Ledger Mapping</th>
              <th className="py-3 px-3 w-24 text-center">Voucher Type</th>
              <th className="py-3 px-3 w-16 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400">
                  No matching transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((tx, idx) => {
                const isSelected = selectedIds.includes(tx.id);
                const isEditingThis = editingId === tx.id;

                if (isEditingThis && editRow) {
                  return (
                    <tr key={tx.id} className="bg-amber-50/60">
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(tx.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[10px] text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          value={editRow.date}
                          onChange={(e) => setEditRow({ ...editRow, date: e.target.value })}
                          className="w-full text-xs p-1 bg-white border border-slate-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={editRow.particulars}
                          onChange={(e) => setEditRow({ ...editRow, particulars: e.target.value })}
                          className="w-full text-xs p-1 bg-white border border-slate-300 rounded font-medium"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={editRow.chqRefNo || ''}
                          onChange={(e) => setEditRow({ ...editRow, chqRefNo: e.target.value })}
                          className="w-full text-xs p-1 bg-white border border-slate-300 rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={editRow.withdrawal}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditRow({
                              ...editRow,
                              withdrawal: val,
                              deposit: val > 0 ? 0 : editRow.deposit,
                              voucherType: val > 0 ? 'Payment' : editRow.voucherType,
                            });
                          }}
                          className="w-full text-xs p-1 bg-white border border-slate-300 rounded text-right text-rose-700 font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={editRow.deposit}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditRow({
                              ...editRow,
                              deposit: val,
                              withdrawal: val > 0 ? 0 : editRow.withdrawal,
                              voucherType: val > 0 ? 'Receipt' : editRow.voucherType,
                            });
                          }}
                          className="w-full text-xs p-1 bg-white border border-slate-300 rounded text-right text-emerald-700 font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={editRow.balance}
                          onChange={(e) =>
                            setEditRow({ ...editRow, balance: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full text-xs p-1 bg-white border border-slate-300 rounded text-right font-mono"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={editRow.categoryLedger}
                          onChange={(e) =>
                            setEditRow({ ...editRow, categoryLedger: e.target.value })
                          }
                          className="w-full text-xs p-1 bg-white border border-slate-300 rounded font-medium text-indigo-700"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <select
                          value={editRow.voucherType}
                          onChange={(e) =>
                            setEditRow({
                              ...editRow,
                              voucherType: e.target.value as 'Payment' | 'Receipt' | 'Contra',
                            })
                          }
                          className="text-xs p-1 bg-white border border-slate-300 rounded"
                        >
                          <option value="Payment">Payment</option>
                          <option value="Receipt">Receipt</option>
                          <option value="Contra">Contra</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={saveEdit}
                            className="p-1 rounded text-emerald-700 hover:bg-emerald-100"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 rounded text-rose-700 hover:bg-rose-100"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(tx.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      <div className="max-w-md line-clamp-2">{tx.particulars}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 truncate max-w-[120px]">
                      {tx.chqRefNo || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-600">
                      {tx.withdrawal > 0 ? formatAmount(tx.withdrawal) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600">
                      {tx.deposit > 0 ? formatAmount(tx.deposit) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {formatAmount(tx.balance)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {tx.categoryLedger}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.voucherType === 'Payment'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : tx.voucherType === 'Receipt'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {tx.voucherType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => startEdit(tx)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary Count */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filtered.length} of {transactions.length} transactions
          {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
        </span>
        <span className="font-mono text-slate-600">
          Total Net Flow:{' '}
          {formatAmount(
            transactions.reduce((acc, t) => acc + (t.deposit - t.withdrawal), 0)
          )}{' '}
          {currency}
        </span>
      </div>
    </div>
  );
};
