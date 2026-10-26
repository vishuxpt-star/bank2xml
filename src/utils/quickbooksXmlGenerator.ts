import { BankTransaction, QuickBooksConfig } from '../types/statement.ts';
import { escapeXml } from './tallyXmlGenerator.ts';

/**
 * Formats date into QuickBooks standard YYYY-MM-DD
 */
export function formatQBDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return dateStr;
}

/**
 * Generates QuickBooks qbXML standard format for Checks (Payments) and Deposits
 */
export function generateQuickBooksQbXml(
  transactions: BankTransaction[],
  config: QuickBooksConfig
): string {
  const bankAccount = escapeXml(config.bankAccountName || 'Checking');
  const defaultExpense = escapeXml(config.defaultExpenseAccount || 'General Expense');
  const defaultIncome = escapeXml(config.defaultIncomeAccount || 'Sales Income');

  const requestsXml = transactions
    .map((tx) => {
      const qbDate = formatQBDate(tx.date);
      const isDeposit = tx.deposit > 0;
      const amount = (isDeposit ? tx.deposit : tx.withdrawal).toFixed(2);
      const memo = escapeXml(tx.particulars || '');
      const ref = escapeXml(tx.chqRefNo || '');

      if (isDeposit) {
        const incomeAccount = escapeXml(tx.categoryLedger || defaultIncome);
        return `    <DepositAddRq>
      <DepositAdd>
        <TxnDate>${qbDate}</TxnDate>
        <DepositToAccountRef>
          <FullName>${bankAccount}</FullName>
        </DepositToAccountRef>
        <Memo>${memo}</Memo>
        <DepositLineAdd>
          <AccountRef>
            <FullName>${incomeAccount}</FullName>
          </AccountRef>
          <Amount>${amount}</Amount>
          <Memo>${memo}</Memo>
          ${ref ? `<CheckNumber>${ref}</CheckNumber>` : ''}
        </DepositLineAdd>
      </DepositAdd>
    </DepositAddRq>`;
      } else {
        const expenseAccount = escapeXml(tx.categoryLedger || defaultExpense);
        return `    <CheckAddRq>
      <CheckAdd>
        <AccountRef>
          <FullName>${bankAccount}</FullName>
        </AccountRef>
        <TxnDate>${qbDate}</TxnDate>
        ${ref ? `<RefNumber>${ref}</RefNumber>` : ''}
        <Memo>${memo}</Memo>
        <ExpenseLineAdd>
          <AccountRef>
            <FullName>${expenseAccount}</FullName>
          </AccountRef>
          <Amount>${amount}</Amount>
          <Memo>${memo}</Memo>
        </ExpenseLineAdd>
      </CheckAdd>
    </CheckAddRq>`;
      }
    })
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<?qbxml version="13.0"?>
<QBXML>
  <QBXMLMsgsRq onError="stopOnError">
${requestsXml}
  </QBXMLMsgsRq>
</QBXML>`;
}

/**
 * Generates QuickBooks QBO (OFX) format commonly used for QuickBooks Online Bank Feeds
 */
export function generateQuickBooksQbo(
  transactions: BankTransaction[],
  config: QuickBooksConfig,
  accountNumber: string = '1234567890'
): string {
  const bankAccount = config.bankAccountName || 'Checking';
  const cleanAccount = (accountNumber || '1234567890').replace(/[^a-zA-Z0-9]/g, '');

  const stmtTrnXml = transactions
    .map((tx, idx) => {
      const d = formatQBDate(tx.date).replace(/-/g, '') + '120000';
      const isDeposit = tx.deposit > 0;
      const amount = isDeposit ? tx.deposit.toFixed(2) : `-${tx.withdrawal.toFixed(2)}`;
      const trnType = isDeposit ? 'CREDIT' : 'DEBIT';
      const fitId = `TXN-${d.slice(0, 8)}-${idx + 1}`;
      const memo = escapeXml(tx.particulars || '').slice(0, 255);
      const chq = tx.chqRefNo ? `<CHECKNUM>${escapeXml(tx.chqRefNo)}</CHECKNUM>` : '';

      return `        <STMTTRN>
          <TRNTYPE>${trnType}</TRNTYPE>
          <DTPOSTED>${d}</DTPOSTED>
          <TRNAMT>${amount}</TRNAMT>
          <FITID>${fitId}</FITID>
          ${chq}
          <NAME>${memo.slice(0, 32)}</NAME>
          <MEMO>${memo}</MEMO>
        </STMTTRN>`;
    })
    .join('\n');

  return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <DTSERVER>${new Date().toISOString().slice(0, 10).replace(/-/g, '')}120000</DTSERVER>
      <LANGUAGE>ENG</LANGUAGE>
    </SONRS>
  </SIGNONMSGSRSV1>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>1001</TRNUID>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <STMTRS>
        <CURDEF>USD</CURDEF>
        <BANKACCTFROM>
          <BANKID>123456789</BANKID>
          <ACCTID>${cleanAccount}</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>${transactions[0] ? formatQBDate(transactions[0].date).replace(/-/g, '') + '120000' : '20240101120000'}</DTSTART>
          <DTEND>${transactions[transactions.length - 1] ? formatQBDate(transactions[transactions.length - 1].date).replace(/-/g, '') + '120000' : '20241231120000'}</DTEND>
${stmtTrnXml}
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;
}
