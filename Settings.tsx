
import React, { useState, useEffect } from 'react';
import { Upload, Save, Globe, DollarSign, UserCheck, Languages, MessageSquareQuote, Loader2, CheckCircle2 } from 'lucide-react';
import { BusinessSettings } from '../types';

interface SettingsProps {
  currentSettings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ currentSettings, onSaveSettings }) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [formData, setFormData] = useState<BusinessSettings>(currentSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setFormData(currentSettings);
  }, [currentSettings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveSettings(formData);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">System Settings</h2>
          <p className="text-gray-500">Manage your business information and bilingual preferences</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center justify-center gap-2 px-8 py-4 bg-[#1d70d1] text-white font-black rounded-2xl hover:bg-[#1559a8] transition-all shadow-xl shadow-blue-100 active:scale-95 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Synchronizing...' : 'Update Business Cloud'}
        </button>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold text-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          Cloud synchronization successful. Changes are now reflected in invoices and reports.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <Globe className="w-6 h-6 text-[#1d70d1]" /> Business Identity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                <input 
                  type="text" 
                  value={formData.businessName} 
                  onChange={e => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1d70d1]/20 focus:border-[#1d70d1] outline-none text-gray-900 font-bold transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Venture Type</label>
                <select 
                  value={formData.ventureType}
                  onChange={e => setFormData({...formData, ventureType: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1d70d1]/20 focus:outline-none text-gray-900 font-bold transition-all"
                >
                  <option>Software & POS Solutions</option>
                  <option>Retail & Grocery</option>
                  <option>E-commerce Hub</option>
                  <option>Service Center</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Physical Address</label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1d70d1]/20 focus:outline-none h-24 resize-none text-gray-900 font-bold transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Official Mobile</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1d70d1]/20 focus:outline-none text-gray-900 font-bold transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Business Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1d70d1]/20 focus:outline-none text-gray-900 font-bold transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Bilingual Section */}
          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <Languages className="w-6 h-6 text-emerald-600" /> Bilingual Localization
            </h3>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Default UI Language</label>
                  <select 
                    value={formData.primaryLang}
                    onChange={e => setFormData({...formData, primaryLang: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option>English</option>
                    <option>Sinhala (සිංහල)</option>
                    <option>Bilingual (Hybrid)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ml-1">Welcome Note (English)</label>
                  <textarea 
                    value={formData.regWelcomeEn}
                    onChange={e => setFormData({...formData, regWelcomeEn: e.target.value})}
                    className="w-full px-5 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl h-24 text-sm font-bold resize-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Welcome Note (Sinhala)</label>
                  <textarea 
                    value={formData.regWelcomeSi}
                    onChange={e => setFormData({...formData, regWelcomeSi: e.target.value})}
                    className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl h-24 text-sm font-bold resize-none" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <h3 className="text-lg font-black text-gray-800 mb-6 w-full text-left">Brand Assets</h3>
            <div className="w-full aspect-square bg-gray-50 border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:border-blue-200 transition-all">
              {logo ? <img src={logo} className="w-full h-full object-contain p-8" alt="Logo" /> : <Upload className="w-8 h-8 text-gray-300" />}
              <input type="file" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-[#0f172a] p-8 md:p-10 rounded-[3rem] text-white shadow-2xl">
            <h3 className="text-lg font-black mb-6 flex items-center gap-3"><DollarSign className="w-6 h-6 text-emerald-400" /> Financials</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base Currency</label>
                <select 
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm font-bold"
                >
                  <option className="bg-[#0f172a]">LKR (රුපියල්)</option>
                  <option className="bg-[#0f172a]">USD ($)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tax ID / TIN</label>
                <input 
                  type="text" 
                  value={formData.tin}
                  onChange={e => setFormData({...formData, tin: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
