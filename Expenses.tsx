
import React, { useState } from 'react';
import { Search, Plus, Wallet, Trash2, Edit2, X, Save, Calendar, Tag } from 'lucide-react';
import { Expense } from '../types';

interface ExpensesProps {
  expenses: Expense[];
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, onSaveExpense, onDeleteExpense }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState<Expense>({
    id: '',
    description: '',
    category: 'Utilities',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Paid'
  });

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData(expense);
    } else {
      setEditingExpense(null);
      setFormData({
        id: Date.now().toString(),
        description: '',
        category: 'Utilities',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'Paid'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveExpense(formData);
    setIsModalOpen(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Record Expense
          </button>
        </div>
        
        <div className="bg-blue-600 p-6 rounded-[1.5rem] text-white shadow-xl shadow-blue-100 flex items-center justify-between">
           <div>
             <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Total Monthly</p>
             <h3 className="text-2xl font-black">{totalExpenses.toLocaleString()} LKR</h3>
           </div>
           <Wallet className="w-10 h-10 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5 text-center">Date</th>
                <th className="px-8 py-5 text-right">Amount (LKR)</th>
                <th className="px-8 py-5 text-right">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.length > 0 ? expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-8 py-6 font-bold text-gray-800">{e.description}</td>
                  <td className="px-8 py-6">
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase">{e.category}</span>
                  </td>
                  <td className="px-8 py-6 text-center text-xs text-gray-400">{e.date}</td>
                  <td className="px-8 py-6 text-right font-black text-rose-500">
                    -{e.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${e.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(e)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => onDeleteExpense(e.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 text-sm">No expenses recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingExpense ? 'Edit Expense' : 'New Expense'}</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <input required type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none" value={formData.description} onChange={o => setFormData({...formData, description: o.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border rounded-2xl text-sm" value={formData.category} onChange={o => setFormData({...formData, category: o.target.value})}>
                    <option>Utilities</option>
                    <option>Rent</option>
                    <option>Salary</option>
                    <option>Supplies</option>
                    <option>Marketing</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                  <input required type="date" className="w-full px-4 py-3 bg-gray-50 border rounded-2xl text-sm" value={formData.date} onChange={o => setFormData({...formData, date: o.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-rose-500">Amount (LKR)</label>
                  <input required type="number" className="w-full px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl outline-none font-bold" value={formData.amount} onChange={o => setFormData({...formData, amount: parseFloat(o.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border rounded-2xl text-sm" value={formData.status} onChange={o => setFormData({...formData, status: o.target.value as any})}>
                    <option>Paid</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl">Cancel</button>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
