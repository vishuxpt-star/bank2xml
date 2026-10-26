import { BankTransaction, TallyConfig } from '../types/statement.ts';

/**
 * Escapes characters for XML compliance
 */
export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats a date string (YYYY-MM-DD or similar) into Tally's required YYYYMMDD format
 */
export function formatTallyDate(dateStr: string): string {
  if (!dateStr) return '';
  const clean = dateStr.replace(/[^0-9]/g, '');
  if (clean.length === 8) {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        return `${parts[0]}${parts[1].padStart(2, '0')}${parts[2].padStart(2, '0')}`;
      }
    }
    return clean;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }
  return clean.slice(0, 8);
}

/**
 * Generates strictly compliant Tally ERP9 and TallyPrime XML for Voucher Import
 */
export function generateTallyXml(
  transactions: BankTransaction[],
  config: TallyConfig,
  companyName: string = ''
): string {
  const comp = escapeXml(companyName || config.companyName || '##SVCURRENTCOMPANY');
  const bankLedger = escapeXml(config.bankLedgerName || 'Bank Account');
  const defaultParty = escapeXml(config.defaultPartyLedger || 'Suspense Account');
  const isTallyPrime = config.version === 'TALLY_PRIME';

  const vouchersXml = transactions
    .map((tx, index) => {
      const tallyDate = formatTallyDate(tx.date);
      const isDeposit = tx.deposit > 0;
      const amount = isDeposit ? tx.deposit : tx.withdrawal;
      const formattedAmount = Math.abs(amount).toFixed(2);
      
      const vchType = tx.voucherType || (isDeposit ? 'Receipt' : 'Payment');
      const vchNumber = String(index + 1);
      const refNumber = escapeXml(tx.chqRefNo || '');
      const narrationPrefix = config.narrationPrefix ? `${config.narrationPrefix} ` : '';
      const narration = escapeXml(`${narrationPrefix}${tx.particulars || ''}`.trim());
      const partyLedger = escapeXml(tx.categoryLedger || defaultParty);

      // Tally Prime GUID for idempotent deduplication
      const guid = `b2xml-${tallyDate}-${vchNumber}-${Math.random().toString(36).substring(2, 9)}`;

      let ledgerEntries = '';

      if (vchType === 'Receipt') {
        // Receipt: Bank is Debited (IsDeemedPositive = Yes, Amount = -amount)
        // Party/Customer is Credited (IsDeemedPositive = No, Amount = amount)
        ledgerEntries = `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${bankLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <LEDGERFROMITEM>No</LEDGERFROMITEM>
              <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
              <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
              <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
              <AMOUNT>-${formattedAmount}</AMOUNT>
              ${
                refNumber
                  ? `<BANKALLOCATIONS.LIST>
                <DATE>${tallyDate}</DATE>
                <INSTRUMENTDATE>${tallyDate}</INSTRUMENTDATE>
                <NAME>${refNumber}</NAME>
                <TRANSACTIONTYPE>Others</TRANSACTIONTYPE>
                <PAYMENTFAVOURING>${partyLedger}</PAYMENTFAVOURING>
                <INSTRUMENTNUMBER>${refNumber}</INSTRUMENTNUMBER>
                <AMOUNT>-${formattedAmount}</AMOUNT>
              </BANKALLOCATIONS.LIST>`
                  : ''
              }
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <LEDGERFROMITEM>No</LEDGERFROMITEM>
              <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
              <AMOUNT>${formattedAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;
      } else if (vchType === 'Payment') {
        // Payment: Party/Expense is Debited (IsDeemedPositive = Yes, Amount = -amount)
        // Bank is Credited (IsDeemedPositive = No, Amount = amount)
        ledgerEntries = `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <LEDGERFROMITEM>No</LEDGERFROMITEM>
              <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
              <AMOUNT>-${formattedAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${bankLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <LEDGERFROMITEM>No</LEDGERFROMITEM>
              <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
              <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
              <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
              <AMOUNT>${formattedAmount}</AMOUNT>
              ${
                refNumber
                  ? `<BANKALLOCATIONS.LIST>
                <DATE>${tallyDate}</DATE>
                <INSTRUMENTDATE>${tallyDate}</INSTRUMENTDATE>
                <NAME>${refNumber}</NAME>
                <TRANSACTIONTYPE>Others</TRANSACTIONTYPE>
                <PAYMENTFAVOURING>${partyLedger}</PAYMENTFAVOURING>
                <INSTRUMENTNUMBER>${refNumber}</INSTRUMENTNUMBER>
                <AMOUNT>${formattedAmount}</AMOUNT>
              </BANKALLOCATIONS.LIST>`
                  : ''
              }
            </ALLLEDGERENTRIES.LIST>`;
      } else {
        // Contra:
        ledgerEntries = `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${formattedAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${bankLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${formattedAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;
      }

      return `          <TALLYMESSAGE xmlns:UDF="TallyUDF">
            <VOUCHER VCHTYPE="${vchType}" ACTION="Create" OBJVIEW="Accounting Voucher View">
              ${config.includeGuid || isTallyPrime ? `<GUID>${guid}</GUID>` : ''}
              <DATE>${tallyDate}</DATE>
              <REFERENCEDATE>${tallyDate}</REFERENCEDATE>
              <VOUCHERTYPENAME>${vchType}</VOUCHERTYPENAME>
              <VOUCHERNUMBER>${vchNumber}</VOUCHERNUMBER>
              ${refNumber ? `<REFERENCE>${refNumber}</REFERENCE>` : ''}
              <NARRATION>${narration}</NARRATION>
              <EFFECTIVEDATE>${tallyDate}</EFFECTIVEDATE>
              <ISINVOICE>No</ISINVOICE>
              ${isTallyPrime ? `<PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>` : ''}
${ledgerEntries}
            </VOUCHER>
          </TALLYMESSAGE>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${comp}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${vouchersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

/**
 * Generates Tally Master Ledgers XML so users can auto-create all required ledgers
 * into Tally ERP9 / Tally Prime before importing vouchers, preventing "Ledger not found" errors!
 */
export function generateTallyMastersXml(
  transactions: BankTransaction[],
  bankLedgerName: string,
  companyName: string = '##SVCURRENTCOMPANY'
): string {
  const uniqueLedgers = Array.from(
    new Set(transactions.map((t) => t.categoryLedger).filter(Boolean))
  );

  const bankMasterXml = `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(bankLedgerName)}" ACTION="Create">
            <NAME>${escapeXml(bankLedgerName)}</NAME>
            <PARENT>Bank Accounts</PARENT>
            <ISBILLWISEON>No</ISBILLWISEON>
            <ISCOSTCENTRESON>No</ISCOSTCENTRESON>
          </LEDGER>
        </TALLYMESSAGE>`;

  const otherMastersXml = uniqueLedgers
    .map((ledger) => {
      const isExpense = !ledger.toLowerCase().includes('debtor') && !ledger.toLowerCase().includes('sales');
      const parent = isExpense ? 'Indirect Expenses' : 'Sundry Debtors';
      return `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(ledger)}" ACTION="Create">
            <NAME>${escapeXml(ledger)}</NAME>
            <PARENT>${parent}</PARENT>
            <ISBILLWISEON>No</ISBILLWISEON>
            <ISCOSTCENTRESON>No</ISCOSTCENTRESON>
          </LEDGER>
        </TALLYMESSAGE>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${bankMasterXml}
${otherMastersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

export interface TallyValidationResult {
  isValid: boolean;
  voucherCount: number;
  isTallyPrimeCompatible: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates generated XML against Tally ERP9 and Tally Prime import specifications
 */
export function validateTallyXml(xml: string): TallyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!xml.includes('<ENVELOPE>') || !xml.includes('</ENVELOPE>')) {
    errors.push('Missing root <ENVELOPE> tag. Tally ERP9 and TallyPrime require standard envelope wrapper.');
  }

  if (!xml.includes('<TALLYREQUEST>Import Data</TALLYREQUEST>')) {
    errors.push('Missing <TALLYREQUEST>Import Data</TALLYREQUEST> in header.');
  }

  if (!xml.includes('<REPORTNAME>Vouchers</REPORTNAME>')) {
    errors.push('Missing <REPORTNAME>Vouchers</REPORTNAME> specification.');
  }

  const voucherMatches = xml.match(/<VOUCHER\b[^>]*>/g);
  const voucherCount = voucherMatches ? voucherMatches.length : 0;

  if (voucherCount === 0) {
    errors.push('No <VOUCHER> entries found in XML payload.');
  }

  // Check date tags
  const dateMatches = xml.match(/<DATE>([^<]+)<\/DATE>/g);
  if (dateMatches) {
    for (const d of dateMatches) {
      const val = d.replace(/<\/?DATE>/g, '');
      if (!/^\d{8}$/.test(val)) {
        errors.push(`Invalid Tally date format detected: "${val}". Tally requires 8-digit YYYYMMDD.`);
        break;
      }
    }
  }

  if (/&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml)) {
    warnings.push('Unescaped ampersands detected. All text must use &amp; to prevent XML parsing failure in Tally.');
  }

  const hasGuid = xml.includes('<GUID>');
  const isTallyPrimeCompatible = errors.length === 0 && (hasGuid || xml.includes('Accounting Voucher View'));

  return {
    isValid: errors.length === 0,
    voucherCount,
    isTallyPrimeCompatible,
    errors,
    warnings,
  };
}
