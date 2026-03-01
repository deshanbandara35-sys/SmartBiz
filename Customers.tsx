
import React, { useState } from 'react';
import { Search, Phone, MapPin, X, PlusCircle, Calculator, History, Printer, Download, Package, CreditCard, Languages, CheckSquare, Square, FileSpreadsheet, Pencil } from 'lucide-react';
import { Customer, Product, Sale, BusinessSettings, SaleItem } from '../types';
import { generateWaybillPDF } from '../lib/pdfGenerator';
import Swal from 'sweetalert2';

interface CustomersProps {
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  businessSettings: BusinessSettings;
  onRegisterSale: (sale: Sale) => void;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, products, sales, businessSettings, onRegisterSale, onSaveCustomer, onDeleteCustomer }) => {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  const toggleCustomerSelection = (id: string) => {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedCustomerIds.length === (filtered || []).length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds((filtered || []).map(c => c.id));
    }
  };

  const handleBulkPrintLabels = () => {
    const selectedCustomers = customers.filter(c => selectedCustomerIds.includes(c.id));
    if (selectedCustomers.length === 0) return alert("Please select at least one customer to print labels.");
    generateWaybillPDF(selectedCustomers, businessSettings, sales);
  };

  const handleExport = () => {
    if (selectedCustomerIds.length === 0) {
      return alert("Please select at least one customer to export.");
    }

    const selectedCustomers = customers.filter(c => selectedCustomerIds.includes(c.id));

    // Exact Column Headers required by Sri Lankan courier portals (Koombiyo, Domex, etc.)
    const headers = [
      "Reference_Number",
      "Recipient_Name",
      "Address",
      "City",
      "Mobile_1",
      "Mobile_2",
      "COD_Amount",
      "Remarks"
    ];

    const csvRows = [
      headers.join(','),
      ...selectedCustomers.map(c => {
        // Find latest sale for this customer to get COD amount and items
        const customerSales = sales.filter(s => s.customerMobile === c.mobile || s.customerName === c.name);
        const latestSale = customerSales.length > 0 ? customerSales[customerSales.length - 1] : null;

        /**
         * Reference Number Logic:
         * We use 'SB-' prefix + the unique sale timestamp ID.
         * This ID allows the user to track the parcel back in our system 
         * when the courier provides status updates or delivery confirmations.
         */
        const refNumber = latestSale 
          ? `SB-${latestSale.id.replace('sale_', '')}` 
          : `SB-CUST-${c.id.replace('cust_', '')}`;

        // Data Cleaning: Remove commas to prevent CSV breakage and wrap in quotes for Excel compatibility
        const cleanName = (c.name || '').replace(/,/g, ' ').replace(/"/g, '""');
        const cleanAddress = (c.address || '').replace(/,/g, ' ').replace(/"/g, '""');
        const cleanCity = (c.city || '').replace(/,/g, ' ').replace(/"/g, '""');
        const remarks = latestSale 
          ? latestSale.items.map(i => `${i.itemName} (x${i.quantity})`).join(' | ').replace(/,/g, ' ').replace(/"/g, '""')
          : "Customer Profile Export";

        return [
          refNumber,
          `"${cleanName}"`,
          `"${cleanAddress}"`,
          `"${cleanCity}"`,
          `"${c.mobile || ''}"`, // Wrapped in quotes to preserve leading zero in Excel
          `"${c.mobile2 || ''}"`,
          latestSale ? latestSale.totalAmount : 0,
          `"${remarks}"`
        ].join(',');
      })
    ];

    // UTF-8 BOM (\uFEFF) ensures Excel and Courier Portals recognize the encoding correctly
    const csvContent = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SB_Courier_Bulk_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintInvoice = (sale: Sale) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${sale.id}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #1e293b; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .business-info h1 { margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; }
            .business-info p { margin: 5px 0; font-size: 12px; color: #64748b; font-weight: 600; }
            .invoice-details { text-align: right; }
            .invoice-details h2 { margin: 0; font-size: 20px; font-weight: 900; color: #2563eb; }
            .invoice-details p { margin: 5px 0; font-size: 12px; font-weight: 700; }
            .client-section { margin-bottom: 30px; }
            .client-section h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 10px; }
            .client-info p { margin: 2px 0; font-size: 14px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; background: #f8fafc; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .grand-total { border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 10px; font-size: 18px; font-weight: 900; color: #0f172a; }
            .footer { margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .thank-you { font-size: 16px; font-weight: 800; color: #2563eb; margin-bottom: 5px; }
            .footer-note { font-size: 10px; color: #94a3b8; font-weight: 600; }
            @media print { .no-print { display: none; } }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="business-info">
                <h1>${businessSettings.businessName}</h1>
                <p>${businessSettings.address}</p>
                <p>Tel: ${businessSettings.phone}</p>
                <p>${businessSettings.email}</p>
              </div>
              <div class="invoice-details">
                <h2>INVOICE</h2>
                <p>#INV-${sale.id.slice(-6).toUpperCase()}</p>
                <p>Date: ${new Date(sale.timestamp).toLocaleDateString()}</p>
              </div>
            </div>

            <div class="client-section">
              <h3>Billed To</h3>
              <div class="client-info">
                <p>${sale.customerName}</p>
                <p>${sale.customerMobile}</p>
                <p>${sale.customerAddress || 'N/A'}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(sale.items || []).map(item => `
                  <tr>
                    <td>${item.itemName} (${item.itemCode})</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${item.unitPrice.toLocaleString()} LKR</td>
                    <td style="text-align: right;">${(item.quantity * item.unitPrice).toLocaleString()} LKR</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${(sale.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()} LKR</span>
              </div>
              ${sale.discount > 0 ? `
              <div class="total-row" style="color: #ef4444;">
                <span>Discount</span>
                <span>-${sale.discount.toLocaleString()} LKR</span>
              </div>` : ''}
              ${sale.deliveryFee > 0 ? `
              <div class="total-row">
                <span>Delivery Fee</span>
                <span>+${sale.deliveryFee.toLocaleString()} LKR</span>
              </div>` : ''}
              <div class="total-row grand-total">
                <span>Total</span>
                <span>${sale.totalAmount.toLocaleString()} LKR</span>
              </div>
            </div>

            <div class="footer">
              <p class="thank-you">Thank you for your business!</p>
              <p class="footer-note">This is a computer-generated invoice. No signature required.</p>
              <p class="footer-note" style="margin-top: 10px;">${businessSettings.primaryLang === 'Sinhala (සිංහල)' || businessSettings.primaryLang === 'Bilingual (Hybrid)' ? businessSettings.termsSi : businessSettings.termsEn}</p>
            </div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintLabel = (sale: Sale) => {
    generateWaybillPDF([sale], businessSettings);
  };
  
  const [saleData, setSaleData] = useState({
    customerName: '',
    customerAddress: '',
    customerCity: '',
    customerMobile: '',
    customerMobile2: '',
    itemCode: '',
    quantity: 1,
    discount: 0,
    deliveryFee: 0
  });

  const handleSale = (e: React.FormEvent) => {
    e.preventDefault();
    if ((cart || []).length === 0) return alert("Cart is empty! Please add items to the list first.");

    const finalTotal = (cart || []).reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) - (saleData.discount || 0) + (saleData.deliveryFee || 0);

    const sale: Sale = {
      id: "sale_" + Date.now(),
      customerName: saleData.customerName,
      customerAddress: saleData.customerAddress,
      customerCity: saleData.customerCity,
      customerMobile: saleData.customerMobile,
      customerMobile2: saleData.customerMobile2,
      items: cart,
      discount: saleData.discount || 0,
      deliveryFee: saleData.deliveryFee || 0,
      totalAmount: finalTotal,
      timestamp: new Date().toISOString(),
      status: 'Pending'
    };

    onRegisterSale(sale);
    setShowSaleModal(false);
    setCart([]);
    setSaleData({ customerName: '', customerAddress: '', customerCity: '', customerMobile: '', customerMobile2: '', itemCode: '', quantity: 1, discount: 0, deliveryFee: 0 });
    
    Swal.fire({
      title: 'Order Placed!',
      text: 'The transaction has been recorded and inventory updated.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleNameChange = (name: string) => {
    const existing = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    setSaleData({
      ...saleData,
      customerName: name,
      customerAddress: existing ? existing.address : saleData.customerAddress,
      customerCity: existing ? existing.city || '' : saleData.customerCity,
      customerMobile: existing ? existing.mobile : saleData.customerMobile,
      customerMobile2: existing ? existing.mobile2 || '' : saleData.customerMobile2
    });
  };

  const addToCart = () => {
    const product = products.find(p => p.id === saleData.itemCode);
    if (!product) return alert("Please select a product first!");
    if (product.stock < saleData.quantity) return alert("Insufficient stock!");

    const newItem: SaleItem = {
      itemCode: product.id,
      itemName: product.name,
      quantity: saleData.quantity,
      unitPrice: product.sellingPrice
    };

    setCart([...cart, newItem]);
    // Reset item selection but keep customer info
    setSaleData({ ...saleData, itemCode: '', quantity: 1 });
  };

  const removeFromCart = (index: number) => {
    setCart((cart || []).filter((_, i) => i !== index));
  };

  const calculateCartTotal = () => {
    return (cart || []).reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const calculatePreview = () => {
    const cartTotal = calculateCartTotal();
    return cartTotal - (saleData.discount || 0) + (saleData.deliveryFee || 0);
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      onSaveCustomer(editingCustomer);
      setEditingCustomer(null);
      Swal.fire({
        title: 'Updated!',
        text: 'Customer profile has been updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const filtered = (customers || []).filter(c => 
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
           <button 
            onClick={handleBulkPrintLabels}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-2xl transition-all shadow-lg ${selectedCustomerIds.length > 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <Printer className="w-5 h-5" /> Print Selected Labels ({selectedCustomerIds.length})
          </button>
          {businessSettings.deliveryMethod !== 'Post Office' && (
            <button 
              onClick={handleExport}
              disabled={selectedCustomerIds.length === 0}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-2xl transition-all shadow-lg ${
                selectedCustomerIds.length > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" /> Export for Courier
            </button>
          )}
          <button onClick={() => setShowSaleModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg transition-all">
            <PlusCircle className="w-5 h-5" /> New Billing
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
           <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Find customer..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
           {selectedCustomerIds.length > 0 && (
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                {selectedCustomerIds.length} Selected
              </span>
            )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
                <th className="px-6 py-5 text-center">
                  <button onClick={toggleAllSelection} className="p-1 hover:bg-gray-200 rounded-md transition-all">
                    {selectedCustomerIds.length === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-8 py-5">Identity</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Address</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(filtered || []).map((c) => (
                <tr key={c.id} className={`hover:bg-gray-50 group transition-colors ${selectedCustomerIds.includes(c.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-6 text-center">
                    <button onClick={() => toggleCustomerSelection(c.id)} className="p-1 hover:bg-gray-200 rounded-md transition-all">
                      {selectedCustomerIds.includes(c.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">{(c.name || ' ')[0]}</div>
                      <span className="font-bold text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6"><div className="text-sm font-semibold text-gray-700">{c.mobile}</div></td>
                  <td className="px-8 py-6 text-xs text-gray-400 truncate max-w-xs">{c.address}</td>
                  <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setEditingCustomer(c)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Customer"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: 'Are you sure?',
                          text: "Do you want to delete this customer profile?",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#ef4444',
                          cancelButtonColor: '#64748b',
                          confirmButtonText: 'Yes, Delete',
                          cancelButtonText: 'Cancel'
                        });

                        if (result.isConfirmed) {
                          onDeleteCustomer(c.id);
                          Swal.fire({
                            title: 'Deleted!',
                            text: 'Customer profile has been removed.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                          });
                        }
                      }} 
                      className="p-2 text-gray-300 hover:text-red-500 transition-all"
                      title="Delete Customer"
                    >
                      <X className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomerHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center font-black text-xl">{(selectedCustomerHistory.name || ' ')[0]}</div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{selectedCustomerHistory.name}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedCustomerHistory.mobile}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomerHistory(null)} className="p-2 text-slate-400 hover:text-white transition-all"><X className="w-6 h-6"/></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-black text-slate-800">Transaction History</h4>
                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {(sales || []).filter(s => s.customerMobile === selectedCustomerHistory.mobile).length} Records Found
                </div>
              </div>

              <div className="space-y-4">
                {(sales || []).filter(s => s.customerMobile === selectedCustomerHistory.mobile).length > 0 ? (
                  (sales || []).filter(s => s.customerMobile === selectedCustomerHistory.mobile).reverse().map(sale => (
                    <div key={sale.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800">
                            {(sale.items || []).length > 1 ? `${sale.items?.[0]?.itemName || 'Item'} + ${sale.items.length - 1} more` : sale.items?.[0]?.itemName || 'No Items'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                            {(sale.items || []).length > 1 ? 'Multiple Items' : sale.items?.[0]?.itemCode || 'N/A'} • {new Date(sale.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                          <p className="text-xl font-black text-slate-900">{sale.totalAmount.toLocaleString()} LKR</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <button 
                            onClick={() => handlePrintInvoice(sale)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all"
                          >
                            <Printer className="w-4 h-4" /> Invoice
                          </button>
                          <button 
                            onClick={() => handlePrintLabel(sale)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                          >
                            <MapPin className="w-4 h-4" /> Print Full Page Label
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-20">
                    <CreditCard className="w-16 h-16 mx-auto mb-4" />
                    <p className="font-black text-xl uppercase tracking-widest">No Transactions Yet</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button onClick={() => setSelectedCustomerHistory(null)} className="px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all">Close History</button>
            </div>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setEditingCustomer(null)} className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-600 transition-all"><X/></button>
            <h3 className="text-2xl font-black text-gray-800 mb-8">Edit Customer Profile</h3>
            
            <form onSubmit={handleUpdateCustomer} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" 
                  value={editingCustomer.name} 
                  onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" 
                  value={editingCustomer.mobile} 
                  onChange={e => setEditingCustomer({...editingCustomer, mobile: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Address</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all resize-none" 
                  value={editingCustomer.address} 
                  onChange={e => setEditingCustomer({...editingCustomer, address: e.target.value})} 
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Primary Mobile (Required)</label>
                      <input required placeholder="07XXXXXXXX" type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" value={saleData.customerMobile} onChange={e => setSaleData({...saleData, customerMobile: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Alternative Mobile (Optional)</label>
                      <input placeholder="07XXXXXXXX" type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" value={saleData.customerMobile2} onChange={e => setSaleData({...saleData, customerMobile2: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City</label>
                      <input placeholder="e.g. Colombo" type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" value={saleData.customerCity} onChange={e => setSaleData({...saleData, customerCity: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Delivery/Billing Address</label>
                    <input placeholder="Enter full address" type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" value={saleData.customerAddress} onChange={e => setSaleData({...saleData, customerAddress: e.target.value})} />
                 </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product</label>
                      <select className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" value={saleData.itemCode} onChange={e => setSaleData({...saleData, itemCode: e.target.value})}>
                        <option value="">Select Item</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name} ({p.sellingPrice} LKR)</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                      <input type="number" min="1" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold transition-all" value={saleData.quantity} onChange={e => setSaleData({...saleData, quantity: parseInt(e.target.value) || 1})} />
                    </div>
                    <button 
                      type="button" 
                      onClick={addToCart}
                      className="py-3.5 bg-blue-50 text-blue-600 font-black rounded-2xl hover:bg-blue-100 transition-all border border-blue-200 flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" /> Add to List
                    </button>
                  </div>

                  {/* Cart Display */}
                  {cart.length > 0 && (
                    <div className="bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-100/50 text-gray-400 uppercase font-black tracking-widest">
                            <th className="px-6 py-3">Item</th>
                            <th className="px-6 py-3 text-center">Qty</th>
                            <th className="px-6 py-3 text-right">Price</th>
                            <th className="px-6 py-3 text-right">Total</th>
                            <th className="px-6 py-3 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {cart.map((item, idx) => (
                            <tr key={idx} className="bg-white/50">
                              <td className="px-6 py-3 font-bold text-gray-800">{item.itemName}</td>
                              <td className="px-6 py-3 text-center font-bold">{item.quantity}</td>
                              <td className="px-6 py-3 text-right font-bold">{item.unitPrice.toLocaleString()}</td>
                              <td className="px-6 py-3 text-right font-black text-blue-600">{(item.unitPrice * item.quantity).toLocaleString()}</td>
                              <td className="px-6 py-3 text-right">
                                <button type="button" onClick={() => removeFromCart(idx)} className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition-all">
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-blue-50/30">
                            <td colSpan={3} className="px-6 py-3 text-right font-black uppercase tracking-widest text-blue-600">Subtotal</td>
                            <td className="px-6 py-3 text-right font-black text-blue-700 text-sm">{calculateCartTotal().toLocaleString()} LKR</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

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

                                   <button 
                    type="submit" 
                    disabled={cart.length === 0}
                    className={`w-full py-5 text-[22px] font-bold rounded-2xl shadow-xl transition-all duration-200 ${cart.length > 0 ? 'bg-gray-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Place Order & Update Inventory
                  </button>

              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
