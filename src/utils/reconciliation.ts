import { BankTransaction, StatementSummary } from '../types/statement.ts';

export interface ReconciliationResult {
  isReconciled: boolean;
  calculatedClosingBalance: number;
  statedClosingBalance: number;
  discrepancy: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
}

/**
 * Calculates and verifies financial reconciliation for the bank statement
 */
export function calculateReconciliation(
  openingBalance: number,
  statedClosingBalance: number,
  transactions: BankTransaction[]
): ReconciliationResult {
  let totalDeposits = 0;
  let totalWithdrawals = 0;

  for (const tx of transactions) {
    totalDeposits += Number(tx.deposit || 0);
    totalWithdrawals += Number(tx.withdrawal || 0);
  }

  // Round to 2 decimal places to avoid IEEE floating point inaccuracies
  totalDeposits = Math.round(totalDeposits * 100) / 100;
  totalWithdrawals = Math.round(totalWithdrawals * 100) / 100;

  const calculatedClosing = Math.round((openingBalance + totalDeposits - totalWithdrawals) * 100) / 100;
  const roundedStatedClosing = Math.round(statedClosingBalance * 100) / 100;
  const discrepancy = Math.round(Math.abs(calculatedClosing - roundedStatedClosing) * 100) / 100;

  // Reconciled if discrepancy <= 0.05 (allowing minor rounding tolerances)
  const isReconciled = discrepancy <= 0.05;

  return {
    isReconciled,
    calculatedClosingBalance: calculatedClosing,
    statedClosingBalance: roundedStatedClosing,
    discrepancy,
    totalDeposits,
    totalWithdrawals,
    transactionCount: transactions.length,
  };
}

import { INDIAN_NARRATION_RULES } from './indianBanks.ts';

/**
 * Category & Ledger suggestion rules based on narration keywords
 */
export const CATEGORY_RULES = INDIAN_NARRATION_RULES;

/**
 * Auto-suggests a ledger and voucher type based on narration text and amount direction
 */
export function suggestLedgerAndVoucher(
  particulars: string,
  deposit: number,
  withdrawal: number
): { ledger: string; voucherType: 'Payment' | 'Receipt' | 'Contra' } {
  const isDeposit = deposit > 0;
  const defaultVoucher: 'Payment' | 'Receipt' = isDeposit ? 'Receipt' : 'Payment';
  const defaultLedger = isDeposit ? 'Sundry Debtors / Income' : 'Sundry Creditors / Expense';

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(particulars)) {
      return {
        ledger: rule.ledger,
        voucherType: rule.voucherType || defaultVoucher,
      };
    }
  }

  return {
    ledger: defaultLedger,
    voucherType: defaultVoucher,
  };
}
