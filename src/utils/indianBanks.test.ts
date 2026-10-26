import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateIndianIfsc,
  formatIndianCurrency,
  runIndianStatementAutoVerification,
  INDIAN_BANKS,
} from './indianBanks.ts';

test('validateIndianIfsc accurately recognizes Indian banks', () => {
  const hdfc = validateIndianIfsc('HDFC0000240');
  assert.equal(hdfc.isValid, true);
  assert.equal(hdfc.bankName, 'HDFC Bank');

  const sbi = validateIndianIfsc('SBIN0001140');
  assert.equal(sbi.isValid, true);
  assert.equal(sbi.bankName, 'State Bank of India');

  const icici = validateIndianIfsc('ICIC0000029');
  assert.equal(icici.isValid, true);
  assert.equal(icici.bankName, 'ICICI Bank');

  const invalid = validateIndianIfsc('INVALID123');
  assert.equal(invalid.isValid, false);
});

test('formatIndianCurrency produces clean Indian numbering (Lakhs & Crores)', () => {
  assert.equal(formatIndianCurrency(150000), '₹1,50,000.00');
  assert.equal(formatIndianCurrency(2500000), '₹25,00,000.00');
  assert.equal(formatIndianCurrency(12500000), '₹1,25,00,000.00');
  assert.equal(formatIndianCurrency(450.5), '₹450.50');
});

test('runIndianStatementAutoVerification computes audit scores and verification status', () => {
  const sampleTxns = [
    {
      date: '2024-04-01',
      deposit: 50000,
      withdrawal: 0,
      chqRefNo: 'UPI409218201928',
      categoryLedger: 'Sales Inflow',
    },
    {
      date: '2024-04-05',
      deposit: 0,
      withdrawal: 20000,
      chqRefNo: 'NEFT99102931',
      categoryLedger: 'Rent Expenses',
    },
  ];

  const report = runIndianStatementAutoVerification(
    'HDFC Bank Ltd',
    'HDFC0000240',
    100000,
    130000, // 100000 + 50000 - 20000 = 130000
    sampleTxns
  );

  assert.equal(report.isFullyVerified, true);
  assert.equal(report.reconciliation.isMathBalanced, true);
  assert.equal(report.reconciliation.discrepancy, 0);
  assert.ok(report.score >= 90);
  assert.equal(report.bankMatch.ifscValid, true);
});
