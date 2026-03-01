
import React, { useState } from 'react';
import { Search, Plus, Package, Trash2, Edit2, X, Save } from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onSaveProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    stock: 0,
    buyingPrice: 0,
    sellingPrice: 0
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        id: product.id,
        name: product.name,
        stock: product.stock,
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice
      });
    } else {
      setEditingProduct(null);
      setFormData({ id: '', name: '', stock: 0, buyingPrice: 0, sellingPrice: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const status = formData.stock === 0 ? 'Out of Stock' : formData.stock <= 15 ? 'Low Stock' : 'In Stock';
    const newProduct: Product = { ...formData, status };
    onSaveProduct(newProduct);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this item?')) {
      onDeleteProduct(id);
    }
  };

  const filtered = (products || []).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-12 pr-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium focus:outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl md:rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      <div className="bg-white rounded-xl md:rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-widest border-b">
                <th className="px-6 md:px-8 py-4 md:py-5">Code</th>
                <th className="px-6 md:px-8 py-4 md:py-5">Name</th>
                <th className="px-6 md:px-8 py-4 md:py-5 text-center">Stock</th>
                <th className="px-6 md:px-8 py-4 md:py-5">Prices (LKR)</th>
                <th className="px-6 md:px-8 py-4 md:py-5">Status</th>
                <th className="px-6 md:px-8 py-4 md:py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(filtered || []).length > 0 ? (filtered || []).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <span className="font-mono text-[10px] md:text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">{p.id}</span>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 text-blue-600 rounded-lg md:rounded-xl flex items-center justify-center">
                        <Package className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <span className="font-bold text-gray-800 text-sm md:text-base">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                    <span className={`font-bold text-sm md:text-base ${p.stock <= 15 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock}</span>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <p className="text-[10px] md:text-xs text-gray-400">Buy: {p.buyingPrice.toLocaleString()}</p>
                    <p className="text-xs md:text-sm text-blue-600 font-bold">Sell: {p.sellingPrice.toLocaleString()}</p>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <span className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'In Stock' ? 'bg-emerald-500 text-white' : 
                      p.status === 'Low Stock' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                    <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 text-sm font-medium">No items found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-600 transition-all hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-black text-gray-800 mb-2">{editingProduct ? 'Edit Item' : 'Add Item'}</h3>
            <p className="text-sm text-gray-400 mb-8 border-b pb-4">Define product details for your inventory system.</p>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Item Code</label>
                  <input required placeholder="SKU-001" type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingProduct} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Stock Qty</label>
                  <input required type="number" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input required placeholder="Enter product name" type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Buy Price (LKR)</label>
                  <input required type="number" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold" value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sell Price (LKR)</label>
                  <input required type="number" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-all">Cancel</button>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Save className="w-5 h-5"/> {editingProduct ? 'Update Stock' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
