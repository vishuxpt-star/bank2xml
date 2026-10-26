import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateReconciliation, suggestLedgerAndVoucher } from './reconciliation.ts';
import { BankTransaction } from '../types/statement.ts';

test('calculateReconciliation confirms matched bank statements', () => {
  const transactions: BankTransaction[] = [
    {
      id: '1',
      date: '2024-04-01',
      particulars: 'Deposit from customer',
      withdrawal: 0,
      deposit: 15000,
      balance: 115000,
      categoryLedger: 'Sales',
      voucherType: 'Receipt',
    },
    {
      id: '2',
      date: '2024-04-02',
      particulars: 'Vendor payout',
      withdrawal: 5000,
      deposit: 0,
      balance: 110000,
      categoryLedger: 'Suppliers',
      voucherType: 'Payment',
    },
  ];

  const openingBalance = 100000;
  const statedClosingBalance = 110000;

  const result = calculateReconciliation(openingBalance, statedClosingBalance, transactions);

  assert.equal(result.isReconciled, true);
  assert.equal(result.calculatedClosingBalance, 110000);
  assert.equal(result.discrepancy, 0);
  assert.equal(result.totalDeposits, 15000);
  assert.equal(result.totalWithdrawals, 5000);
});

test('calculateReconciliation detects discrepancy when math does not match stated closing', () => {
  const transactions: BankTransaction[] = [
    {
      id: '1',
      date: '2024-04-01',
      particulars: 'Deposit',
      withdrawal: 0,
      deposit: 5000,
      balance: 105000,
      categoryLedger: 'Sales',
      voucherType: 'Receipt',
    },
  ];

  const openingBalance = 100000;
  const statedClosingBalance = 112000; // mismatch

  const result = calculateReconciliation(openingBalance, statedClosingBalance, transactions);

  assert.equal(result.isReconciled, false);
  assert.equal(result.calculatedClosingBalance, 105000);
  assert.equal(result.discrepancy, 7000);
});

test('suggestLedgerAndVoucher detects standard business transactions', () => {
  const salaryTx = suggestLedgerAndVoucher('NEFT CHQ SALARY APRIL 2024', 0, 85000);
  assert.equal(salaryTx.ledger, 'Salary & Allowances A/c');
  assert.equal(salaryTx.voucherType, 'Payment');

  const rentTx = suggestLedgerAndVoucher('TRANSFER RENT PREMISES 4TH FLR', 0, 30000);
  assert.equal(rentTx.ledger, 'Office Rent Expenses');
  assert.equal(rentTx.voucherType, 'Payment');

  const atmTx = suggestLedgerAndVoucher('ATM WDL CASH MACHINE 1190', 0, 10000);
  assert.equal(atmTx.ledger, 'Cash in Hand (Petty Cash)');
  assert.equal(atmTx.voucherType, 'Contra');

  const intTx = suggestLedgerAndVoucher('INT.COLL ON SB A/C', 450, 0);
  assert.equal(intTx.ledger, 'Bank Interest Received');
  assert.equal(intTx.voucherType, 'Receipt');
});
