
import React, { useState } from 'react';
import { Search, Plus, Truck, Trash2, Edit2, X, Save, Phone, Mail } from 'lucide-react';
import { Supplier } from '../types';

interface SuppliersProps {
  suppliers: Supplier[];
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, onSaveSupplier, onDeleteSupplier }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<Supplier>({
    id: '',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    balanceDue: 0
  });

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData(supplier);
    } else {
      setEditingSupplier(null);
      setFormData({
        id: Date.now().toString(),
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        balanceDue: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSupplier(formData);
    setIsModalOpen(false);
  };

  const filtered = (suppliers || []).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search suppliers..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
                <th className="px-8 py-5">Supplier Name</th>
                <th className="px-8 py-5">Contact Info</th>
                <th className="px-8 py-5">Address</th>
                <th className="px-8 py-5 text-right">Balance (LKR)</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(filtered || []).length > 0 ? (filtered || []).map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">CP: {s.contactPerson}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5"/> {s.phone}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1"><Mail className="w-3.5 h-3.5"/> {s.email}</div>
                  </td>
                  <td className="px-8 py-6 max-w-xs truncate text-xs text-gray-500">{s.address}</td>
                  <td className="px-8 py-6 text-right font-bold text-gray-800">
                    {s.balanceDue.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(s)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => onDeleteSupplier(s.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 text-sm">No suppliers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400"/></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Business Name</label>
                  <input required type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Contact Person</label>
                  <input required type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Phone</label>
                  <input required type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Email</label>
                  <input required type="email" className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Balance Due (LKR)</label>
                  <input type="number" className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none" value={formData.balanceDue} onChange={e => setFormData({...formData, balanceDue: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl">Cancel</button>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700">
                  <Save className="w-5 h-5 mr-2 inline"/> {editingSupplier ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
