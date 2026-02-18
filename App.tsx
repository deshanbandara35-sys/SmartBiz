
import React, { useState, useEffect } from 'react';
import { AppView, UserRole, Product, Customer, Supplier, Expense, Sale, BusinessSettings } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import SuperAdmin from './pages/SuperAdmin';
import { db } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from "@firebase/firestore";

const defaultSettings: BusinessSettings = {
  businessName: 'SmartBiz Solutions',
  ventureType: 'Retail & Grocery',
  address: 'No 123, Galle Road, Colombo 03',
  phone: '+94 112 345 678',
  email: 'contact@smartbiz.lk',
  primaryLang: 'English',
  regWelcomeEn: 'Welcome to our business!',
  regWelcomeSi: 'අපගේ ව්‍යාපාරයට ඔබව සාදරයෙන් පිළිගනිමු!',
  termsEn: 'All sales are final. Thank you.',
  termsSi: 'සියලුම අලෙවියන් අවසාන වේ. ස්තූතියි.',
  currency: 'LKR (රුපියල්)',
  tin: ''
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Per-user State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);

  useEffect(() => {
    if (!isAuthenticated || !userId || userRole === UserRole.SUPER_ADMIN) {
      setProducts([]); setCustomers([]); setSales([]); setSuppliers([]); setExpenses([]);
      return;
    }

    setPermissionError(null);
    const userPath = doc(db, "users", userId);
    const handleError = (error: any) => {
      console.error("Firestore Error:", error);
      if (error.code === 'permission-denied') setPermissionError("Access Denied.");
    };

    const unsubProducts = onSnapshot(collection(userPath, "products"), snapshot => setProducts(snapshot.docs.map(doc => ({ ...doc.data() } as Product))), handleError);
    const unsubCustomers = onSnapshot(collection(userPath, "customers"), snapshot => setCustomers(snapshot.docs.map(doc => ({ ...doc.data() } as Customer))), handleError);
    const unsubSales = onSnapshot(collection(userPath, "sales"), snapshot => setSales(snapshot.docs.map(doc => ({ ...doc.data() } as Sale))), handleError);
    const unsubSuppliers = onSnapshot(collection(userPath, "suppliers"), snapshot => setSuppliers(snapshot.docs.map(doc => ({ ...doc.data() } as Supplier))), handleError);
    const unsubExpenses = onSnapshot(collection(userPath, "expenses"), snapshot => setExpenses(snapshot.docs.map(doc => ({ ...doc.data() } as Expense))), handleError);
    const unsubSettings = onSnapshot(doc(userPath, "settings", "profile"), docSnap => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as BusinessSettings);
      }
    }, handleError);

    return () => {
      unsubProducts(); unsubCustomers(); unsubSales(); unsubSuppliers(); unsubExpenses(); unsubSettings();
    };
  }, [isAuthenticated, userId, userRole]);

  const handleLogin = (role: UserRole, id: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    setCurrentView(role === UserRole.SUPER_ADMIN ? AppView.SUPER_ADMIN : AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setPermissionError(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleRegisterSale = async (sale: Sale) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, "users", userId, "sales", sale.id), sale);
      
      const existingCustomer = customers.find(c => c.name.toLowerCase() === sale.customerName.toLowerCase());
      if (existingCustomer) {
        if ((sale.customerAddress && sale.customerAddress !== existingCustomer.address) || 
            (sale.customerMobile && sale.customerMobile !== existingCustomer.mobile)) {
          await updateDoc(doc(db, "users", userId, "customers", existingCustomer.id), {
            address: sale.customerAddress || existingCustomer.address,
            mobile: sale.customerMobile || existingCustomer.mobile
          });
        }
      } else {
        const newCustId = "cust_" + Date.now();
        const newCustomer: Customer = {
          id: newCustId,
          name: sale.customerName,
          address: sale.customerAddress || "N/A",
          mobile: sale.customerMobile || "N/A"
        };
        await setDoc(doc(db, "users", userId, "customers", newCustId), newCustomer);
      }

      const product = products.find(p => p.id === sale.itemCode);
      if (product) {
        const newStock = Math.max(0, product.stock - sale.quantity);
        const status = newStock === 0 ? 'Out of Stock' : newStock <= 15 ? 'Low Stock' : 'In Stock';
        await updateDoc(doc(db, "users", userId, "products", product.id), { stock: newStock, status });
      }
    } catch (e) {
      console.error("Sale failed:", e);
    }
  };

  const handleSaveSettings = async (newSettings: BusinessSettings) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, "users", userId, "settings", "profile"), newSettings);
    } catch (e) {
      console.error("Settings save failed:", e);
    }
  };

  const renderContent = () => {
    if (permissionError) return <div className="p-10 text-center font-bold text-red-500">{permissionError}</div>;
    if (userRole === UserRole.SUPER_ADMIN) return <SuperAdmin />;

    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard products={products} sales={sales} />;
      case AppView.SALES: return <Sales sales={sales} businessSettings={settings} />;
      case AppView.INVENTORY: return <Inventory products={products} onSaveProduct={async (p) => await setDoc(doc(db, "users", userId!, "products", p.id), p)} onDeleteProduct={async (id) => await deleteDoc(doc(db, "users", userId!, "products", id))} />;
      case AppView.CUSTOMERS: return <Customers customers={customers} products={products} onRegisterSale={handleRegisterSale} onSaveCustomer={(c) => setDoc(doc(db, "users", userId!, "customers", c.id), c)} onDeleteCustomer={(id) => deleteDoc(doc(db, "users", userId!, "customers", id))} />;
      case AppView.SUPPLIERS: return <Suppliers suppliers={suppliers} onSaveSupplier={(s) => setDoc(doc(db, "users", userId!, "suppliers", s.id), s)} onDeleteSupplier={(id) => deleteDoc(doc(db, "users", userId!, "suppliers", id))} />;
      case AppView.EXPENSES: return <Expenses expenses={expenses} onSaveExpense={(e) => setDoc(doc(db, "users", userId!, "expenses", e.id), e)} onDeleteExpense={(id) => deleteDoc(doc(db, "users", userId!, "expenses", id))} />;
      case AppView.SETTINGS: return <Settings currentSettings={settings} onSaveSettings={handleSaveSettings} />;
      default: return <Dashboard products={products} sales={sales} />;
    }
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <Sidebar currentView={currentView} setView={(view) => { setCurrentView(view); setIsSidebarOpen(false); }} userRole={userRole!} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentView={currentView} onLogout={handleLogout} userRole={userRole!} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
