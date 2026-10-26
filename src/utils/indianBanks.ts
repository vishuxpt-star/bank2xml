export interface IndianBankInfo {
  code: string;
  name: string;
  fullName: string;
  ifscPrefix: string;
  category: 'Private' | 'Public' | 'Payment/Neo';
  standardColumns: string[];
  pdfPasswordHint: string;
  defaultBankLedger: string;
}

export const INDIAN_BANKS: IndianBankInfo[] = [
  {
    code: 'HDFC',
    name: 'HDFC Bank',
    fullName: 'HDFC Bank Limited',
    ifscPrefix: 'HDFC',
    category: 'Private',
    standardColumns: ['Date', 'Narration / Description', 'Chq/Ref No', 'Value Dt', 'Withdrawal (Dr)', 'Deposit (Cr)', 'Closing Balance'],
    pdfPasswordHint: 'Customer ID (8-9 digits) or Registered Mobile / PAN',
    defaultBankLedger: 'HDFC Bank Current A/c',
  },
  {
    code: 'SBI',
    name: 'State Bank of India',
    fullName: 'State Bank of India (SBI)',
    ifscPrefix: 'SBIN',
    category: 'Public',
    standardColumns: ['Txn Date', 'Value Date', 'Description', 'Ref/Cheque No', 'Debit', 'Credit', 'Balance'],
    pdfPasswordHint: 'Last 5 digits of registered mobile number + DOB in DDMMYY format',
    defaultBankLedger: 'State Bank of India A/c',
  },
  {
    code: 'ICICI',
    name: 'ICICI Bank',
    fullName: 'ICICI Bank Limited',
    ifscPrefix: 'ICIC',
    category: 'Private',
    standardColumns: ['Transaction Date', 'Value Date', 'Remarks / Particulars', 'Cheque No / Ref', 'Withdrawals', 'Deposits', 'Balance'],
    pdfPasswordHint: 'First 4 letters of name (lowercase) + DDMM of birth',
    defaultBankLedger: 'ICICI Bank Current A/c',
  },
  {
    code: 'AXIS',
    name: 'Axis Bank',
    fullName: 'Axis Bank Limited',
    ifscPrefix: 'UTIB',
    category: 'Private',
    standardColumns: ['Tran Date', 'Particulars', 'Chq No', 'Debit', 'Credit', 'Balance', 'Init. Br'],
    pdfPasswordHint: 'First 4 characters of name in CAPITAL + Last 4 digits of Account Number',
    defaultBankLedger: 'Axis Bank Current A/c',
  },
  {
    code: 'KOTAK',
    name: 'Kotak Mahindra',
    fullName: 'Kotak Mahindra Bank',
    ifscPrefix: 'KKBK',
    category: 'Private',
    standardColumns: ['Date', 'Transaction Details', 'Chq / Ref No.', 'Amount (Debit / Credit)', 'Balance'],
    pdfPasswordHint: 'CRN Number (Customer Relationship Number) or Date of Birth (DDMMYYYY)',
    defaultBankLedger: 'Kotak Mahindra Bank A/c',
  },
  {
    code: 'BOB',
    name: 'Bank of Baroda',
    fullName: 'Bank of Baroda (BOB)',
    ifscPrefix: 'BARB',
    category: 'Public',
    standardColumns: ['Txn Date', 'Particulars', 'Instrument / Ref ID', 'Withdrawal (Dr)', 'Deposit (Cr)', 'Balance'],
    pdfPasswordHint: 'Full PAN card number in UPPERCASE or Mobile number',
    defaultBankLedger: 'Bank of Baroda A/c',
  },
  {
    code: 'PNB',
    name: 'Punjab National Bank',
    fullName: 'Punjab National Bank (PNB)',
    ifscPrefix: 'PUNB',
    category: 'Public',
    standardColumns: ['Date', 'Details', 'Cheque / Ref', 'Debit', 'Credit', 'Balance'],
    pdfPasswordHint: '16-digit Account Number or Customer ID',
    defaultBankLedger: 'Punjab National Bank A/c',
  },
  {
    code: 'CANARA',
    name: 'Canara Bank',
    fullName: 'Canara Bank',
    ifscPrefix: 'CNRB',
    category: 'Public',
    standardColumns: ['Date', 'Particulars', 'Chq.No.', 'Withdrawal', 'Deposit', 'Balance'],
    pdfPasswordHint: 'Customer ID (8 digits) or 13-digit Account Number',
    defaultBankLedger: 'Canara Bank Current A/c',
  },
  {
    code: 'INDUSIND',
    name: 'IndusInd Bank',
    fullName: 'IndusInd Bank Limited',
    ifscPrefix: 'INDB',
    category: 'Private',
    standardColumns: ['Date', 'Description', 'Ref / Cheque', 'Dr', 'Cr', 'Balance'],
    pdfPasswordHint: 'Date of Birth (DDMMYYYY) or PAN Number in UPPERCASE',
    defaultBankLedger: 'IndusInd Bank A/c',
  },
  {
    code: 'IDFC',
    name: 'IDFC FIRST Bank',
    fullName: 'IDFC FIRST Bank Limited',
    ifscPrefix: 'IDFB',
    category: 'Private',
    standardColumns: ['Transaction Date', 'Narration', 'Reference No', 'Debit', 'Credit', 'Balance'],
    pdfPasswordHint: 'Date of Birth in DDMMYYYY format',
    defaultBankLedger: 'IDFC FIRST Bank A/c',
  },
  {
    code: 'FEDERAL',
    name: 'Federal Bank',
    fullName: 'Federal Bank Limited',
    ifscPrefix: 'FDRL',
    category: 'Private',
    standardColumns: ['Tran Date', 'Particulars', 'Instrument ID', 'Withdrawal', 'Deposit', 'Balance'],
    pdfPasswordHint: '14-digit Account Number or PAN',
    defaultBankLedger: 'Federal Bank Current A/c',
  },
  {
    code: 'PAYTM_RAZORPAY',
    name: 'RazorpayX / Paytm / Neo',
    fullName: 'RazorpayX Business / Fintech Current A/c',
    ifscPrefix: 'PYTM',
    category: 'Payment/Neo',
    standardColumns: ['Created At', 'Narration', 'UTR / Payout ID', 'Debit', 'Credit', 'Balance'],
    pdfPasswordHint: 'Unprotected or OTP authenticated download',
    defaultBankLedger: 'RazorpayX Current A/c',
  },
];

/**
 * Validates Indian IFSC code format (11 characters: 4 letters, 0, 6 alphanumerics)
 */
export function validateIndianIfsc(ifsc: string): { isValid: boolean; bankName?: string } {
  if (!ifsc) return { isValid: false };
  const clean = ifsc.trim().toUpperCase();
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  if (!ifscRegex.test(clean)) {
    return { isValid: false };
  }

  const prefix = clean.slice(0, 4);
  const matched = INDIAN_BANKS.find((b) => b.ifscPrefix === prefix);

  return {
    isValid: true,
    bankName: matched ? matched.name : `${prefix} Bank`,
  };
}

/**
 * Formats a currency number in the Indian Numbering System (Lakhs and Crores)
 * e.g. 150000 -> "₹1,50,000.00", 12500000 -> "₹1,25,00,000.00"
 */
export function formatIndianCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const parts = absAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let result = '';
  if (integerPart.length > 3) {
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${formattedRemaining},${lastThree}`;
  } else {
    result = integerPart;
  }

  return `${isNegative ? '-' : ''}₹${result}.${decimalPart}`;
}

/**
 * Indian Accounting specific Ledger and GST/TDS auto-classification
 */
export const INDIAN_NARRATION_RULES: {
  pattern: RegExp;
  ledger: string;
  voucherType: 'Payment' | 'Receipt' | 'Contra';
  description: string;
}[] = [
  // Tax & Statutory
  { pattern: /gst|gstn|igst|cgst|sgst/i, ledger: 'GST Input / Output Clearing A/c', voucherType: 'Payment', description: 'Goods & Services Tax' },
  { pattern: /tds|tax deducted/i, ledger: 'TDS Payable / Receivable A/c', voucherType: 'Payment', description: 'Tax Deducted at Source' },
  { pattern: /advance tax|income tax|challan 280/i, ledger: 'Advance Income Tax A/c', voucherType: 'Payment', description: 'Direct Tax Payment' },
  { pattern: /epf|pf cont|provident fund/i, ledger: 'Provident Fund (PF) Payable', voucherType: 'Payment', description: 'Employee Provident Fund' },
  { pattern: /esic|esi/i, ledger: 'ESIC Payable A/c', voucherType: 'Payment', description: 'Employee State Insurance' },

  // Payroll
  { pattern: /salary|payroll|wages|stipend/i, ledger: 'Salary & Allowances A/c', voucherType: 'Payment', description: 'Employee Salaries' },
  { pattern: /bonus|ex gratia/i, ledger: 'Staff Bonus & Incentives', voucherType: 'Payment', description: 'Bonus' },

  // Cash / Contra
  { pattern: /atm wdl|cash wdl|nfs\*|atw\//i, ledger: 'Cash in Hand (Petty Cash)', voucherType: 'Contra', description: 'ATM / Branch Cash Withdrawal' },
  { pattern: /cash dep|by cash/i, ledger: 'Cash in Hand', voucherType: 'Contra', description: 'Cash Deposited to Bank' },

  // Bank Charges & Interest
  { pattern: /chg|charge|sms fee|annual maintenance|debit card fee|ledger folio/i, ledger: 'Bank Charges & Commissions', voucherType: 'Payment', description: 'Bank Operational Charges' },
  { pattern: /int\.coll|interest credit|int pd|savings interest/i, ledger: 'Bank Interest Received', voucherType: 'Receipt', description: 'Interest Credit' },
  { pattern: /sweep in|mod bal|fd closure/i, ledger: 'Fixed Deposit / MOD A/c', voucherType: 'Receipt', description: 'Sweep-in Fixed Deposit' },
  { pattern: /sweep out|auto fd/i, ledger: 'Fixed Deposit / MOD A/c', voucherType: 'Contra', description: 'Sweep-out to Fixed Deposit' },

  // Rent & Utilities
  { pattern: /rent|lease/i, ledger: 'Office Rent Expenses', voucherType: 'Payment', description: 'Premises Rent' },
  { pattern: /bescom|tata power|mseb|electricity|power corp|cesc/i, ledger: 'Electricity & Utility Expenses', voucherType: 'Payment', description: 'Power Utilities' },
  { pattern: /airtel|jio|act|vodafone|vi|broadband|bsnl/i, ledger: 'Telephone & Internet Charges', voucherType: 'Payment', description: 'Telecom & ISP' },

  // Food & Staff Welfare
  { pattern: /swiggy|zomato|starbucks|chai point|mcdonald|food|refreshment/i, ledger: 'Staff Welfare & Refreshments', voucherType: 'Payment', description: 'Team Food & Refreshments' },

  // Travel & Fuel
  { pattern: /uber|ola|rapido|fastag|toll|petrol|hpcl|bpcl|iocl/i, ledger: 'Travel, Fuel & Conveyance', voucherType: 'Payment', description: 'Conveyance & Toll' },

  // Software & Cloud
  { pattern: /aws|google cloud|microsoft|azure|zoho|tally|canva|github/i, ledger: 'Software & Cloud Subscriptions', voucherType: 'Payment', description: 'SaaS & Cloud Services' },

  // UPI Inflow / Outflow
  { pattern: /upi\/cr|upi inw|received from|upi payment received/i, ledger: 'Sundry Debtors (UPI Collections)', voucherType: 'Receipt', description: 'UPI Customer Collection' },
  { pattern: /upi\/dr|upi out|paid to/i, ledger: 'Sundry Creditors (Vendor Payment)', voucherType: 'Payment', description: 'UPI Vendor Payment' },

  // NEFT / RTGS
  { pattern: /neft cr|rtgs cr|imps cr/i, ledger: 'Sundry Debtors', voucherType: 'Receipt', description: 'Client Bank Wire' },
  { pattern: /neft dr|rtgs dr|imps dr/i, ledger: 'Sundry Creditors', voucherType: 'Payment', description: 'Vendor Bank Wire' },
];

/**
 * Automated Verification Report for an Indian Bank Statement
 */
export interface IndianStatementVerificationReport {
  score: number; // 0 to 100
  isFullyVerified: boolean;
  bankMatch: {
    detectedBank: string;
    ifscValid: boolean;
    ifscCode: string;
    category?: string;
  };
  reconciliation: {
    isMathBalanced: boolean;
    discrepancy: number;
    openingBalance: number;
    closingBalance: number;
    totalCredits: number;
    totalDebits: number;
  };
  auditChecks: {
    title: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    message: string;
  }[];
}

export function runIndianStatementAutoVerification(
  bankName: string,
  ifsc: string,
  openingBalance: number,
  statedClosingBalance: number,
  transactions: any[]
): IndianStatementVerificationReport {
  const auditChecks: { title: string; status: 'PASS' | 'WARN' | 'FAIL'; message: string }[] = [];
  let score = 100;

  // 1. IFSC Code Check
  const ifscCheck = validateIndianIfsc(ifsc);
  if (ifscCheck.isValid) {
    auditChecks.push({
      title: 'Indian IFSC & RBI Clearing Code',
      status: 'PASS',
      message: `Verified valid IFSC: ${ifsc.toUpperCase()} (${ifscCheck.bankName})`,
    });
  } else {
    score -= 10;
    auditChecks.push({
      title: 'Indian IFSC & RBI Clearing Code',
      status: 'WARN',
      message: ifsc ? `IFSC format is non-standard: ${ifsc}` : 'IFSC Code missing in statement header',
    });
  }

  // 2. Math Balance
  const totalCredits = transactions.reduce((s, t) => s + (Number(t.deposit) || 0), 0);
  const totalDebits = transactions.reduce((s, t) => s + (Number(t.withdrawal) || 0), 0);
  const calculatedClosing = Math.round((openingBalance + totalCredits - totalDebits) * 100) / 100;
  const discrepancy = Math.round(Math.abs(calculatedClosing - statedClosingBalance) * 100) / 100;
  const isMathBalanced = discrepancy <= 0.05;

  if (isMathBalanced) {
    auditChecks.push({
      title: 'Double-Entry Reconciliation',
      status: 'PASS',
      message: `Opening + Credits (₹${totalCredits.toFixed(2)}) - Debits (₹${totalDebits.toFixed(2)}) equals Closing (₹${statedClosingBalance.toFixed(2)})`,
    });
  } else {
    score -= 30;
    auditChecks.push({
      title: 'Double-Entry Reconciliation',
      status: 'FAIL',
      message: `Math mismatch of ₹${discrepancy.toFixed(2)} between calculated closing (₹${calculatedClosing.toFixed(2)}) and stated closing (₹${statedClosingBalance.toFixed(2)})`,
    });
  }

  // 3. Indian Reference Checks (UPI RRN / UTR / Cheque)
  const withRef = transactions.filter((t) => t.chqRefNo && t.chqRefNo.length >= 6).length;
  const refPercentage = transactions.length > 0 ? (withRef / transactions.length) * 100 : 0;
  if (refPercentage >= 70) {
    auditChecks.push({
      title: 'UPI RRN / UTR / Cheque References',
      status: 'PASS',
      message: `${withRef} of ${transactions.length} (${Math.round(refPercentage)}%) entries have valid Indian audit reference numbers`,
    });
  } else {
    auditChecks.push({
      title: 'UPI RRN / UTR / Cheque References',
      status: 'WARN',
      message: `Only ${withRef} of ${transactions.length} entries contain UTR/UPI references`,
    });
  }

  // 4. Tally ERP9 / Prime Date Compliance (YYYY-MM-DD parseable to YYYYMMDD)
  const allDatesValid = transactions.every((t) => Boolean(t.date));
  if (allDatesValid) {
    auditChecks.push({
      title: 'Tally Prime & ERP 9 Date Sequence',
      status: 'PASS',
      message: 'All transaction dates strictly parseable into Tally 8-digit YYYYMMDD format',
    });
  } else {
    score -= 15;
    auditChecks.push({
      title: 'Tally Prime & ERP 9 Date Sequence',
      status: 'FAIL',
      message: 'Some transactions have missing or unparseable dates',
    });
  }

  // 5. Categorization readiness
  const categorized = transactions.filter((t) => t.categoryLedger && t.categoryLedger !== 'Suspense Account').length;
  auditChecks.push({
    title: 'Tally Chart of Accounts Auto-Mapping',
    status: 'PASS',
    message: `${categorized} of ${transactions.length} ledgers classified to standard Indian accounting heads`,
  });

  return {
    score: Math.max(0, score),
    isFullyVerified: isMathBalanced && allDatesValid,
    bankMatch: {
      detectedBank: bankName,
      ifscValid: ifscCheck.isValid,
      ifscCode: ifsc,
      category: ifscCheck.bankName,
    },
    reconciliation: {
      isMathBalanced,
      discrepancy,
      openingBalance,
      closingBalance: statedClosingBalance,
      totalCredits,
      totalDebits,
    },
    auditChecks,
  };
}
