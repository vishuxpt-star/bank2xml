import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeXml,
  formatTallyDate,
  generateTallyXml,
  generateTallyMastersXml,
  validateTallyXml,
} from './tallyXmlGenerator.ts';
import { BankTransaction, TallyConfig } from '../types/statement.ts';

test('escapeXml handles special characters properly', () => {
  const input = '<Ledger & "Company" \'Name\'>';
  const expected = '&lt;Ledger &amp; &quot;Company&quot; &apos;Name&apos;&gt;';
  assert.equal(escapeXml(input), expected);
});

test('formatTallyDate formats standard YYYY-MM-DD into YYYYMMDD', () => {
  assert.equal(formatTallyDate('2024-04-15'), '20240415');
  assert.equal(formatTallyDate('2024-01-05'), '20240105');
  assert.equal(formatTallyDate('20241025'), '20241025');
});

test('generateTallyXml produces compliant Tally ERP9 & TallyPrime XML with balanced ledger entries', () => {
  const sampleTransactions: BankTransaction[] = [
    {
      id: 'tx-1',
      date: '2024-04-01',
      particulars: 'Office Rent for April 2024',
      chqRefNo: 'NEFT98124',
      withdrawal: 25000,
      deposit: 0,
      balance: 175000,
      categoryLedger: 'Rent Expenses',
      voucherType: 'Payment',
    },
    {
      id: 'tx-2',
      date: '2024-04-02',
      particulars: 'Client Wire Inflow Acme Corp',
      chqRefNo: 'RTGS11223',
      withdrawal: 0,
      deposit: 50000,
      balance: 225000,
      categoryLedger: 'Acme Corp Sales',
      voucherType: 'Receipt',
    },
  ];

  const config: TallyConfig = {
    version: 'TALLY_PRIME',
    bankLedgerName: 'HDFC Current Bank A/c',
    defaultPartyLedger: 'Suspense A/c',
    suspenseLedger: 'Suspense A/c',
    companyName: 'Apex Enterprises Pvt Ltd',
    autoDetectVoucherType: true,
    includeChequeReference: true,
    includeGuid: true,
    narrationPrefix: 'BANK STMT:',
    dateFormat: 'YYYYMMDD',
  };

  const xml = generateTallyXml(sampleTransactions, config, 'Apex Enterprises Pvt Ltd');

  // Verify structure
  assert.ok(xml.includes('<ENVELOPE>'));
  assert.ok(xml.includes('<TALLYREQUEST>Import Data</TALLYREQUEST>'));
  assert.ok(xml.includes('<REPORTNAME>Vouchers</REPORTNAME>'));
  assert.ok(xml.includes('<SVCURRENTCOMPANY>Apex Enterprises Pvt Ltd</SVCURRENTCOMPANY>'));
  assert.ok(xml.includes('<GUID>'));
  assert.ok(xml.includes('<PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>'));

  // Verify Payment voucher entries
  assert.ok(xml.includes('<VOUCHER VCHTYPE="Payment"'));
  assert.ok(xml.includes('<LEDGERNAME>Rent Expenses</LEDGERNAME>'));
  assert.ok(xml.includes('<AMOUNT>-25000.00</AMOUNT>'));
  assert.ok(xml.includes('<LEDGERNAME>HDFC Current Bank A/c</LEDGERNAME>'));
  assert.ok(xml.includes('<AMOUNT>25000.00</AMOUNT>'));

  // Run validation
  const validation = validateTallyXml(xml);
  assert.equal(validation.isValid, true);
  assert.equal(validation.isTallyPrimeCompatible, true);
  assert.equal(validation.voucherCount, 2);
  assert.equal(validation.errors.length, 0);
});

test('generateTallyMastersXml creates required Master Ledgers for Tally Prime', () => {
  const transactions: BankTransaction[] = [
    {
      id: '1',
      date: '2024-04-01',
      particulars: 'Rent',
      withdrawal: 5000,
      deposit: 0,
      balance: 100000,
      categoryLedger: 'Office Rent Account',
      voucherType: 'Payment',
    },
  ];

  const mastersXml = generateTallyMastersXml(transactions, 'HDFC Bank Account');
  assert.ok(mastersXml.includes('<REPORTNAME>All Masters</REPORTNAME>'));
  assert.ok(mastersXml.includes('<LEDGER NAME="HDFC Bank Account" ACTION="Create">'));
  assert.ok(mastersXml.includes('<PARENT>Bank Accounts</PARENT>'));
  assert.ok(mastersXml.includes('<LEDGER NAME="Office Rent Account" ACTION="Create">'));
});
