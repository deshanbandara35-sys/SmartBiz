
import React, { useState } from 'react';
import { Search, UserPlus, Phone, MapPin, X, PlusCircle, Calculator } from 'lucide-react';
import { Customer, Product, Sale } from '../types';

interface CustomersProps {
  customers: Customer[];
  products: Product[];
  onRegisterSale: (sale: Sale) => void;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, products, onRegisterSale, onSaveCustomer, onDeleteCustomer }) => {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [saleData, setSaleData] = useState({
    customerName: '',
    customerAddress: '',
    customerMobile: '',
    itemCode: '',
    quantity: 1,
    discount: 0,
    deliveryFee: 0
  });

  const [customerData, setCustomerData] = useState<Customer>({
    id: '',
    name: '',
    address: '',
    mobile: ''
  });

  const handleSale = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === saleData.itemCode);
    if (!product) return alert("Product not found!");
    if (product.stock < saleData.quantity) return alert("Insufficient stock!");

    const subtotal = product.sellingPrice * saleData.quantity;
    const finalTotal = subtotal - (saleData.discount || 0) + (saleData.deliveryFee || 0);

    const sale: Sale = {
      id: "sale_" + Date.now(),
      customerName: saleData.customerName,
      customerAddress: saleData.customerAddress,
      customerMobile: saleData.customerMobile,
      itemCode: product.id,
      itemName: product.name,
      quantity: saleData.quantity,
      unitPrice: product.sellingPrice,
      discount: saleData.discount || 0,
      deliveryFee: saleData.deliveryFee || 0,
      totalAmount: finalTotal,
      timestamp: new Date().toISOString()
    };

    onRegisterSale(sale);
    setShowSaleModal(false);
    setSaleData({ customerName: '', customerAddress: '', customerMobile: '', itemCode: '', quantity: 1, discount: 0, deliveryFee: 0 });
  };

  const handleNameChange = (name: string) => {
    const existing = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    setSaleData({
      ...saleData,
      customerName: name,
      customerAddress: existing ? existing.address : saleData.customerAddress,
      customerMobile: existing ? existing.mobile : saleData.customerMobile
    });
  };

  const calculatePreview = () => {
    const product = products.find(p => p.id === saleData.itemCode);
    if (!product) return 0;
    return (product.sellingPrice * saleData.quantity) - (saleData.discount || 0) + (saleData.deliveryFee || 0);
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobile.includes(searchTerm)
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Customer CRM</h2>
          <p className="text-gray-500">Secure relationship management & billing</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setShowCustomerModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all">
            <UserPlus className="w-5 h-5" /> Add Profile
          </button>
          <button onClick={() => setShowSaleModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg transition-all">
            <PlusCircle className="w-5 h-5" /> New Billing
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
           <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Find customer..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
                <th className="px-8 py-5">Identity</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Address</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">{c.name[0]}</div>
                      <span className="font-bold text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6"><div className="text-sm font-semibold text-gray-700">{c.mobile}</div></td>
                  <td className="px-8 py-6 text-xs text-gray-400 truncate max-w-xs">{c.address}</td>
                  <td className="px-8 py-6 text-right"><button onClick={() => onDeleteCustomer(c.id)} className="p-2 text-gray-300 hover:text-red-500 transition-all"><X className="w-5 h-5"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSaleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-200 overflow-y-auto max-h-[95vh]">
              <button onClick={() => setShowSaleModal(false)} className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-600 transition-all"><X/></button>
              <h3 className="text-2xl font-black text-gray-800 mb-8">Process New Transaction</h3>
              
              <form onSubmit={handleSale} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                      <input required list="customer-list" placeholder="Full Name" type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" value={saleData.customerName} onChange={e => handleNameChange(e.target.value)} />
                      <datalist id="customer-list">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                      <input required placeholder="07XXXXXXXX" type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" value={saleData.customerMobile} onChange={e => setSaleData({...saleData, customerMobile: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Delivery/Billing Address</label>
                    <input placeholder="Enter full address" type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" value={saleData.customerAddress} onChange={e => setSaleData({...saleData, customerAddress: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product</label>
                      <select required className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" value={saleData.itemCode} onChange={e => setSaleData({...saleData, itemCode: e.target.value})}>
                        <option value="">Select Item</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name} ({p.sellingPrice} LKR)</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                      <input required type="number" min="1" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" value={saleData.quantity} onChange={e => setSaleData({...saleData, quantity: parseInt(e.target.value) || 1})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">Discount (LKR)</label>
                      <input type="number" placeholder="0" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 text-gray-900 font-bold transition-all" value={saleData.discount} onChange={e => setSaleData({...saleData, discount: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest ml-1">Delivery Fee (LKR)</label>
                      <input type="number" placeholder="0" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 font-bold transition-all" value={saleData.deliveryFee} onChange={e => setSaleData({...saleData, deliveryFee: parseFloat(e.target.value) || 0})} />
                    </div>
                 </div>

                 <div className="p-6 bg-blue-600 rounded-[1.5rem] text-white flex items-center justify-between shadow-xl shadow-blue-100">
                    <div className="flex items-center gap-3">
                       <Calculator className="w-6 h-6 opacity-40" />
                       <span className="text-sm font-bold uppercase tracking-widest tracking-widest">Grand Total</span>
                    </div>
                    <span className="text-3xl font-black">{calculatePreview().toLocaleString()} LKR</span>
                 </div>

                 <button type="submit" className="w-full py-4.5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all">Generate Bill & Update Inventory</button>
              </form>
           </div>
        </div>
      )}

      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-200">
              <button onClick={() => setShowCustomerModal(false)} className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-600 transition-all"><X/></button>
              <h3 className="text-2xl font-black text-gray-800 mb-8">Customer Profile</h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  onSaveCustomer({ ...customerData, id: customerData.id || "cust_" + Date.now() });
                  setShowCustomerModal(false);
                  setCustomerData({ id: '', name: '', address: '', mobile: '' });
                }} 
                className="space-y-6"
              >
                 <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label><input required type="text" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl text-gray-900 font-bold" value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})} /></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</label><input required type="text" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl text-gray-900 font-bold" value={customerData.mobile} onChange={e => setCustomerData({...customerData, mobile: e.target.value})} /></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Address</label><textarea required className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl h-24 text-gray-900 font-bold" value={customerData.address} onChange={e => setCustomerData({...customerData, address: e.target.value})} /></div>
                 <button type="submit" className="w-full py-4.5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all">Save Customer Data</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
