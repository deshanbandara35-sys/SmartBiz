
export enum AppView {
  DASHBOARD = 'Dashboard',
  SALES = 'Sales',
  INVENTORY = 'Inventory',
  CUSTOMERS = 'Customers',
  SUPPLIERS = 'Suppliers',
  SETTINGS = 'Settings',
  EXPENSES = 'Expenses',
  LOGIN = 'Login',
  SUPER_ADMIN = 'Super Admin Panel'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER'
}

export interface BusinessSettings {
  businessName: string;
  ventureType: string;
  address: string;
  phone: string;
  email: string;
  primaryLang: string;
  regWelcomeEn: string;
  regWelcomeSi: string;
  termsEn: string;
  termsSi: string;
  currency: string;
  tin: string;
}

export interface Product {
  id: string; // Item Code
  name: string;
  stock: number;
  buyingPrice: number;
  sellingPrice: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  category?: string;
}

export interface BusinessOwner {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  mobile: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName: string;
  customerAddress?: string;
  customerMobile?: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  balanceDue: number;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
}
