export interface BankTransaction {
  id: string;
  date: string; // YYYY-MM-DD format
  valueDate?: string; // YYYY-MM-DD
  particulars: string;
  chqRefNo?: string;
  withdrawal: number; // 0 if deposit
  deposit: number; // 0 if withdrawal
  balance: number;
  categoryLedger: string;
  voucherType: 'Payment' | 'Receipt' | 'Contra';
  costCenter?: string;
  notes?: string;
}

export interface StatementSummary {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscOrRouting: string;
  branch?: string;
  statementPeriod: {
    from: string;
    to: string;
  };
  currency: string;
  openingBalance: number;
  totalWithdrawals: number;
  totalDeposits: number;
  calculatedClosingBalance: number;
  statedClosingBalance: number;
  isReconciled: boolean;
  discrepancy: number;
}

export interface ParsedStatement {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  processedAt: string;
  summary: StatementSummary;
  transactions: BankTransaction[];
  rawText?: string;
  layoutType: 'HDFC' | 'SBI' | 'ICICI' | 'AXIS' | 'KOTAK' | 'CHASE' | 'GENERIC_MULTI_COL' | 'CUSTOM';
  cloudStorage: {
    isStored: boolean;
    provider?: 'vault' | 'gdrive' | 's3' | 'firestore';
    cloudPath?: string;
    sha256Checksum?: string;
    encryption: 'AES-256-GCM' | 'NONE';
    syncedAt?: string;
  };
}

export interface TallyConfig {
  version: 'TALLY_PRIME' | 'TALLY_ERP9';
  bankLedgerName: string;
  defaultPartyLedger: string;
  suspenseLedger: string;
  companyName: string;
  autoDetectVoucherType: boolean;
  includeChequeReference: boolean;
  includeGuid: boolean;
  narrationPrefix: string;
  dateFormat: 'YYYYMMDD' | 'DD-MMM-YYYY';
}

export interface QuickBooksConfig {
  bankAccountName: string;
  defaultExpenseAccount: string;
  defaultIncomeAccount: string;
  includeMemo: boolean;
  exportFormat: 'qbxml' | 'qbo' | 'iif';
}

export interface CloudStorageConfig {
  autoBackup: boolean;
  encryptionEnabled: boolean;
  primaryProvider: 'vault' | 'gdrive' | 's3';
  s3BucketName?: string;
  s3Region?: string;
  gdriveFolder?: string;
}
