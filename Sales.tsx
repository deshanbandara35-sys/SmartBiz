
import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, CreditCard, DollarSign, MapPin, Tag, Truck, X, User, Package, Clock, Phone, Building2, Languages } from 'lucide-react';
import { Sale, BusinessSettings } from '../types';

interface SalesProps {
  sales: Sale[];
  businessSettings: BusinessSettings;
}

const Sales: React.FC<SalesProps> = ({ sales, businessSettings }) => {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalQty = sales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Financial Reports</h2>
          <p className="text-gray-500">Comprehensive history of all generated bills</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all">
            <Calendar className="w-4 h-4" /> Range
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><DollarSign className="w-7 h-7" /></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Sales</p><h3 className="text-2xl font-black text-gray-800">{totalRevenue.toLocaleString()} LKR</h3></div>
         </div>
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><TrendingUp className="w-7 h-7" /></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Units Moved</p><h3 className="text-2xl font-black text-gray-800">{totalQty} Units</h3></div>
         </div>
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><CreditCard className="w-7 h-7" /></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Average</p><h3 className="text-2xl font-black text-gray-800">{(totalRevenue / (sales.length || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})} LKR</h3></div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b border-gray-50 bg-gray-50/10">
          <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
          <p className="text-xs text-gray-400 italic">Click any row to view full billing details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
                <th className="px-10 py-5">Item Details</th>
                <th className="px-10 py-5">Purchased By</th>
                <th className="px-10 py-5 text-center">Qty</th>
                <th className="px-10 py-5">Adjustments</th>
                <th className="px-10 py-5 text-right">Final Total</th>
                <th className="px-10 py-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.length > 0 ? [...sales].reverse().map((s) => (
                <tr key={s.id} onClick={() => setSelectedSale(s)} className="group hover:bg-blue-50/30 cursor-pointer transition-colors">
                  <td className="px-10 py-6">
                    <p className="font-bold text-gray-800">{s.itemName}</p>
                    <p className="text-[10px] text-blue-500 font-mono font-bold">{s.itemCode}</p>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-semibold text-gray-600">{s.customerName}</p>
                    <p className="text-[10px] text-gray-400">{s.customerMobile || 'No Phone'}</p>
                  </td>
                  <td className="px-10 py-6 text-center font-bold text-gray-800">{s.quantity}</td>
                  <td className="px-10 py-6">
                     <div className="flex flex-col gap-1">
                        {s.discount > 0 && <span className="text-[10px] text-rose-500 font-bold">-{s.discount} Disc</span>}
                        {s.deliveryFee > 0 && <span className="text-[10px] text-blue-500 font-bold">+{s.deliveryFee} Del</span>}
                     </div>
                  </td>
                  <td className="px-10 py-6 text-right font-black text-emerald-600 text-lg">
                    {s.totalAmount.toLocaleString()} LKR
                  </td>
                  <td className="px-10 py-6 text-right text-gray-400 text-[11px] font-medium whitespace-nowrap">
                    {new Date(s.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-10 py-24 text-center opacity-20"><CreditCard className="w-12 h-12 mx-auto" /><p className="font-bold">No records found</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Professional Invoice Header */}
            <div className="bg-slate-900 p-10 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Registered Merchant</span>
                </div>
                <h3 className="text-3xl font-black tracking-tighter">{businessSettings.businessName}</h3>
                <div className="mt-4 space-y-1 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5"/> {businessSettings.address}</p>
                  <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5"/> {businessSettings.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center ml-auto mb-4">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-xs font-mono text-slate-500">INV-{selectedSale.id.slice(-6).toUpperCase()}</p>
                <p className="text-xs font-bold text-slate-300 mt-1">{new Date(selectedSale.timestamp).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-all"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-10 space-y-8">
              {/* Customer Info */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Billed To</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-black text-slate-800 text-lg">{selectedSale.customerName}</p>
                    <p className="text-sm text-slate-500 mt-1">{selectedSale.customerMobile}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 leading-relaxed">{selectedSale.customerAddress || 'Direct Pickup'}</p>
                  </div>
                </div>
              </div>

              {/* Item Table Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Package className="w-3.5 h-3.5"/> Item Breakdown</div>
                <div className="border-y border-slate-50 py-4 flex justify-between items-center px-2">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{selectedSale.itemName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{selectedSale.itemCode}</p>
                  </div>
                  <div className="text-center w-20">
                    <p className="text-xs text-slate-400">Qty</p>
                    <p className="font-bold text-slate-800">{selectedSale.quantity}</p>
                  </div>
                  <div className="text-right w-32">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="font-black text-slate-800">{(selectedSale.quantity * selectedSale.unitPrice).toLocaleString()} LKR</p>
                  </div>
                </div>
              </div>

              {/* Billing Math */}
              <div className="space-y-3 px-2">
                 <div className="flex justify-between text-sm text-slate-500">
                    <span>Gross Amount</span>
                    <span className="font-bold">{(selectedSale.quantity * selectedSale.unitPrice).toLocaleString()} LKR</span>
                 </div>
                 {selectedSale.discount > 0 && (
                   <div className="flex justify-between text-sm text-rose-500 font-black">
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5"/> Discount Applied</span>
                      <span>-{selectedSale.discount.toLocaleString()} LKR</span>
                   </div>
                 )}
                 {selectedSale.deliveryFee > 0 && (
                   <div className="flex justify-between text-sm text-blue-600 font-black">
                      <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5"/> Logistics Fee</span>
                      <span>+{selectedSale.deliveryFee.toLocaleString()} LKR</span>
                   </div>
                 )}
              </div>

              {/* Grand Total & Localization Note */}
              <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-2">
                    <Languages className="w-3 h-3" /> {businessSettings.primaryLang} Invoice
                  </div>
                  <p className="text-[10px] text-slate-400 italic font-medium">
                    {businessSettings.primaryLang === 'Sinhala (සිංහල)' || businessSettings.primaryLang === 'Bilingual (Hybrid)' 
                      ? businessSettings.termsSi 
                      : businessSettings.termsEn}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">{selectedSale.totalAmount.toLocaleString()} LKR</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 py-4.5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                   <Download className="w-5 h-5" /> Download PDF
                </button>
                <button onClick={() => setSelectedSale(null)} className="flex-1 py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Close Viewer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
