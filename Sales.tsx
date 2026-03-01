
import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, CreditCard, DollarSign, MapPin, Tag, Truck, X, User, Package, Clock, Phone, Building2, Languages, Printer, CheckSquare, Square, FileSpreadsheet, CheckCircle2, FileText } from 'lucide-react';
import { Sale, BusinessSettings, Expense } from '../types';
import { generateWaybillPDF, generateFinancialReportPDF } from '../lib/pdfGenerator';

interface SalesProps {
  sales: Sale[];
  expenses: Expense[];
  businessSettings: BusinessSettings;
  onUpdateSaleStatus?: (saleIds: string[], status: 'Dispatched') => void;
}

const Sales: React.FC<SalesProps> = ({ sales, expenses, businessSettings, onUpdateSaleStatus }) => {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedSalesIds, setSelectedSalesIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredSales = (sales || []).filter(sale => {
    if (!startDate && !endDate) return true;
    const saleDate = new Date(sale.timestamp).toISOString().split('T')[0];
    if (startDate && saleDate < startDate) return false;
    if (endDate && saleDate > endDate) return false;
    return true;
  });

  const filteredExpenses = (expenses || []).filter(expense => {
    if (!startDate && !endDate) return true;
    const expenseDate = expense.date; // Assuming YYYY-MM-DD
    if (startDate && expenseDate < startDate) return false;
    if (endDate && expenseDate > endDate) return false;
    return true;
  });

  const totalRevenue = (filteredSales || []).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalExpenses = (filteredExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalQty = (filteredSales || []).reduce((sum, s) => sum + (s.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0);

  const handleGenerateReport = () => {
    generateFinancialReportPDF(filteredSales, filteredExpenses, businessSettings, { start: startDate, end: endDate });
  };

  const toggleSaleSelection = (id: string) => {
    setSelectedSalesIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedSalesIds.length === (filteredSales || []).length) {
      setSelectedSalesIds([]);
    } else {
      setSelectedSalesIds((filteredSales || []).map(s => s.id));
    }
  };

  const handlePrintLabel = (sale: Sale) => {
    generateWaybillPDF([sale], businessSettings);
  };

  const handleBulkPrint = () => {
    const selectedSales = sales.filter(s => selectedSalesIds.includes(s.id));
    if (selectedSales.length === 0) return alert("Please select at least one order to print.");
    generateWaybillPDF(selectedSales, businessSettings);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Financial Reports</h2>
          <p className="text-gray-500">Comprehensive history of all generated bills</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" className="text-xs font-bold outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="text-gray-300">to</span>
            <input type="date" className="text-xs font-bold outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button 
            onClick={handleGenerateReport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-2xl transition-all shadow-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FileText className="w-4 h-4" /> Generate Report
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
            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Average</p><h3 className="text-2xl font-black text-gray-800">{(totalRevenue / ((sales || []).length || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})} LKR</h3></div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b border-gray-50 bg-gray-50/10">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
            {selectedSalesIds.length > 0 && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                {selectedSalesIds.length} Selected
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 italic">Click any row to view full billing details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
                <th className="px-6 py-5 text-center">
                  <button onClick={toggleAllSelection} className="p-1 hover:bg-gray-200 rounded-md transition-all">
                    {selectedSalesIds.length === filteredSales.length && filteredSales.length > 0 ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-10 py-5">Item Details</th>
                <th className="px-10 py-5">Purchased By</th>
                <th className="px-10 py-5 text-center">Qty</th>
                <th className="px-10 py-5">Status</th>
                <th className="px-10 py-5 text-right">Final Total</th>
                <th className="px-10 py-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.length > 0 ? [...filteredSales].reverse().map((s) => (
                <tr key={s.id} className={`group hover:bg-blue-50/30 transition-colors ${selectedSalesIds.includes(s.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-6 text-center">
                    <button onClick={() => toggleSaleSelection(s.id)} className="p-1 hover:bg-gray-200 rounded-md transition-all">
                      {selectedSalesIds.includes(s.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-10 py-6 cursor-pointer" onClick={() => setSelectedSale(s)}>
                    <p className="font-bold text-gray-800">
                      {(s.items || []).length > 1 ? `${s.items?.[0]?.itemName || 'Item'} + ${s.items.length - 1} more` : s.items?.[0]?.itemName || 'No Items'}
                    </p>
                    <p className="text-[10px] text-blue-500 font-mono font-bold">
                      {(s.items || []).length > 1 ? 'Multiple Items' : s.items?.[0]?.itemCode || 'N/A'}
                    </p>
                  </td>
                  <td className="px-10 py-6 cursor-pointer" onClick={() => setSelectedSale(s)}>
                    <p className="text-sm font-semibold text-gray-600">{s.customerName}</p>
                    <p className="text-[10px] text-gray-400">{s.customerCity || 'No City'} • {s.customerMobile || 'No Phone'}</p>
                  </td>
                  <td className="px-10 py-6 text-center font-bold text-gray-800">
                    {(s.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)}
                  </td>
                  <td className="px-10 py-6">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                       s.status === 'Dispatched' ? 'bg-blue-50 text-blue-600' : 
                       s.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 
                       s.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' : 
                       'bg-gray-50 text-gray-400'
                     }`}>
                       {s.status || 'Pending'}
                     </span>
                  </td>
                  <td className="px-10 py-6 text-right font-black text-emerald-600 text-lg">
                    {s.totalAmount.toLocaleString()} LKR
                  </td>
                  <td className="px-10 py-6 text-right text-gray-400 text-[11px] font-medium whitespace-nowrap">
                    {new Date(s.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-10 py-24 text-center opacity-20"><CreditCard className="w-12 h-12 mx-auto" /><p className="font-bold">No records found</p></td></tr>
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
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedSale.customerMobile}
                      {selectedSale.customerMobile2 ? ` / ${selectedSale.customerMobile2}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 leading-relaxed">{selectedSale.customerAddress || 'Direct Pickup'}</p>
                  </div>
                </div>
              </div>

              {/* Item Table Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Package className="w-3.5 h-3.5"/> Item Breakdown</div>
                <div className="divide-y divide-slate-50">
                  {(selectedSale.items || []).map((item, idx) => (
                    <div key={idx} className="py-4 flex justify-between items-center px-2">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{item.itemName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.itemCode}</p>
                      </div>
                      <div className="text-center w-20">
                        <p className="text-xs text-slate-400">Qty</p>
                        <p className="font-bold text-slate-800">{item.quantity}</p>
                      </div>
                      <div className="text-right w-32">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="font-black text-slate-800">{(item.quantity * item.unitPrice).toLocaleString()} LKR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Math */}
              <div className="space-y-3 px-2">
                 <div className="flex justify-between text-sm text-slate-500">
                    <span>Gross Amount</span>
                    <span className="font-bold">{(selectedSale.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()} LKR</span>
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
                <button 
                  onClick={() => handlePrintLabel(selectedSale)}
                  className="flex-1 py-4.5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                   <Download className="w-5 h-5" /> Download PDF
                </button>
                <button 
                  onClick={() => handlePrintLabel(selectedSale)}
                  className="flex-1 py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                   <MapPin className="w-5 h-5" /> Print Label
                </button>
              </div>
              <button onClick={() => setSelectedSale(null)} className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all mt-4">Close Viewer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
