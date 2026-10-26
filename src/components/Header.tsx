import React from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  HardDrive,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'converter' | 'xmlStudio' | 'vault' | 'tallyGuide';
  setActiveTab: (tab: 'converter' | 'xmlStudio' | 'vault' | 'tallyGuide') => void;
  vaultCount: number;
  onSelectSample: (index: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  vaultCount,
  onSelectSample,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Bank<span className="text-emerald-600">2XML</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                  Tally Prime &amp; ERP 9 Certified Schema
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Bank Statement PDF &amp; Scanned OCR to Tally ERP9 / QuickBooks XML
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('converter')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'converter'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Statement Parser</span>
            </button>

            <button
              onClick={() => setActiveTab('xmlStudio')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'xmlStudio'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Tally &amp; QB XML Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'vault'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Secure Vault</span>
              {vaultCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-emerald-600 text-white font-bold">
                  {vaultCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tallyGuide')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'tallyGuide'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Tally Import Guide</span>
              <span className="md:hidden">Guide</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
