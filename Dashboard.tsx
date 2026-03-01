
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Product, Sale, Order } from '../types';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales, orders }) => {
  // 1. Real-time Calculations
  const metrics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todaySales = (sales || [])
      .filter(s => new Date(s.timestamp).toDateString() === todayStr)
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    const monthlySales = (sales || [])
      .filter(s => {
        const d = new Date(s.timestamp);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    const monthlyProfit = (sales || [])
      .filter(s => {
        const d = new Date(s.timestamp);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, s) => {
        const items = s.items || [];
        const saleProfit = items.reduce((itemSum, item) => {
          const product = (products || []).find(p => p.id === item.itemCode);
          const buyingPrice = product?.buyingPrice || item.unitPrice * 0.7;
          return itemSum + ((item.unitPrice * item.quantity) - (buyingPrice * item.quantity));
        }, 0);
        // Subtract discount and add delivery fee if applicable
        return sum + (saleProfit - (s.discount || 0));
      }, 0);

    const lowStockCount = (products || []).filter(p => p.stock <= 15).length;

    // Firebase 'orders' collection metrics
    const totalOrderSales = (orders || []).reduce((sum, o) => sum + (o.amount || 0), 0);
    const orderCount = (orders || []).length;

    return { todaySales, monthlySales, monthlyProfit, lowStockCount, totalOrderSales, orderCount };
  }, [sales, products, orders]);

  // 2. Real-time Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    return last7Days.map(date => {
      const dayName = days[date.getDay()];
      const daySales = (sales || [])
        .filter(s => new Date(s.timestamp).toDateString() === date.toDateString())
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      return { name: dayName, revenue: daySales };
    });
  }, [sales]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Refined Metric Grid (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        
        {/* Card 1: Today Sales (Blue) */}
        <div className="bg-[#1d70d1] p-6 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden h-40 flex flex-col justify-between transition-transform hover:scale-[1.02]">
           <div>
             <p className="text-blue-100 text-[9px] font-bold uppercase tracking-widest opacity-80">Today Sales</p>
             <h3 className="text-xl md:text-2xl font-black mt-1">{metrics.todaySales.toLocaleString()} LKR</h3>
           </div>
           <div className="flex items-center justify-end">
              <div className="bg-white/20 p-1.5 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
           </div>
        </div>

        {/* Card 2: Total Products (Slate) */}
        <div className="bg-[#64748b] p-6 rounded-[2rem] text-white shadow-xl shadow-slate-100 relative overflow-hidden h-40 flex flex-col justify-between transition-transform hover:scale-[1.02]">
           <div>
             <p className="text-slate-200 text-[9px] font-bold uppercase tracking-widest opacity-80">Inventory</p>
             <h3 className="text-xl md:text-2xl font-black mt-1">{(products || []).length} items</h3>
           </div>
           <div className="absolute bottom-6 right-6 w-10 h-10 bg-[#ef4444] rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-red-200 animate-pulse">
             {metrics.lowStockCount}
           </div>
        </div>

        {/* Card 3: Monthly Profit (Green) */}
        <div className="bg-[#10b981] p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden h-40 flex flex-col justify-between transition-transform hover:scale-[1.02]">
           <div>
             <p className="text-emerald-50 text-[9px] font-bold uppercase tracking-widest opacity-80">Monthly Profit</p>
             <h3 className="text-xl md:text-2xl font-black mt-1">{metrics.monthlyProfit.toLocaleString()} LKR</h3>
           </div>
           <div className="flex items-center justify-end">
              <div className="bg-white/20 p-1.5 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
           </div>
        </div>

        {/* Card 4: Firebase Total Sales (Indigo) */}
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden h-40 flex flex-col justify-between transition-transform hover:scale-[1.02]">
           <div>
             <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest opacity-80">Firebase Total Sales</p>
             <h3 className="text-xl md:text-2xl font-black mt-1">{metrics.totalOrderSales.toLocaleString()} LKR</h3>
           </div>
           <div className="flex items-center justify-end">
              <div className="bg-white/20 p-1.5 rounded-xl">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
           </div>
        </div>

        {/* Card 5: Firebase Order Count (Amber) */}
        <div className="bg-amber-500 p-6 rounded-[2rem] text-white shadow-xl shadow-amber-100 relative overflow-hidden h-40 flex flex-col justify-between transition-transform hover:scale-[1.02]">
           <div>
             <p className="text-amber-50 text-[9px] font-bold uppercase tracking-widest opacity-80">Firebase Order Count</p>
             <h3 className="text-xl md:text-2xl font-black mt-1">{metrics.orderCount} Orders</h3>
           </div>
           <div className="flex items-center justify-end">
              <div className="bg-white/20 p-1.5 rounded-xl">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Analytics Chart */}
        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-black text-gray-800">Sales Analytics</h4>
            <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100">Live Reports</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={15} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px'}}
                  itemStyle={{fontWeight: 800, color: '#1d70d1'}}
                  labelStyle={{fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  dot={{r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff'}} 
                  activeDot={{r: 8, strokeWidth: 0}}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Trans Sidebar */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-black text-gray-800">Recent Trans</h4>
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center"><LayoutDashboard className="w-4 h-4 text-gray-300"/></div>
          </div>
          <div className="space-y-4 flex-1">
             {(sales || []).slice(-4).reverse().map((s, i) => (
               <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-[1.5rem] hover:bg-gray-100/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm">
                      {(s.customerName || ' ')[0]}
                    </div>
                    <div>
                       <p className="text-sm font-black text-gray-800">{s.customerName}</p>
                       <p className="text-[10px] text-emerald-500 font-black">{s.totalAmount.toLocaleString()} LKR</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
               </div>
             ))}
             {(sales || []).length === 0 && <p className="text-center py-10 text-gray-300 font-bold italic">Waiting for sales...</p>}
          </div>
          <button className="mt-8 w-full py-4.5 bg-blue-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-50 hover:bg-blue-700 active:scale-95 transition-all">View Analytics</button>
        </div>
      </div>

      {/* Recent Analytics Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-10 border-b border-gray-50">
           <h4 className="text-xl font-black text-gray-800">Recent Analytics</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-50">
                <th className="px-12 py-6">Invoice No.</th>
                <th className="px-12 py-6">Customer</th>
                <th className="px-12 py-6">Date</th>
                <th className="px-12 py-6">Amount</th>
                <th className="px-12 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(sales || []).length > 0 ? (sales || []).slice(-5).reverse().map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-12 py-7 font-black text-gray-800 text-sm tracking-tight">INV-{s.id.slice(-5).toUpperCase()}</td>
                  <td className="px-12 py-7">
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-[9px] font-black">C</div>
                       <span className="text-sm font-bold text-gray-700">{s.customerName}</span>
                    </div>
                  </td>
                  <td className="px-12 py-7 text-sm text-gray-400 font-bold tracking-tight">{new Date(s.timestamp).toLocaleDateString('en-GB')}</td>
                  <td className="px-12 py-7 text-sm font-black text-gray-800">{s.totalAmount.toLocaleString()} LKR</td>
                  <td className="px-12 py-7 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="px-5 py-2 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-50">Paid</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={5} className="px-12 py-24 text-center">
                     <div className="opacity-20 grayscale scale-75">
                        <LayoutDashboard className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-black italic">System ready for first transaction</p>
                     </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
