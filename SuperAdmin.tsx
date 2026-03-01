
import React, { useState, useEffect } from 'react';
import { BusinessOwner, SubscriptionRequest } from '../types';
import { UserPlus, Search, Mail, Phone, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, updateDoc } from "@firebase/firestore";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import Swal from 'sweetalert2';

const SuperAdmin: React.FC<{ subscriptions: SubscriptionRequest[] }> = ({ subscriptions }) => {
  const [owners, setOwners] = useState<BusinessOwner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    deliveryMethod: 'Courier Service' as 'Courier Service' | 'Post Office'
  });

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsub = onSnapshot(
      collection(db, "businessOwners"), 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data() } as BusinessOwner));
        setOwners(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("SuperAdmin Sync Error:", err);
        setError("Permission Denied: Accessing the client database requires active admin tokens.");
        setIsLoading(false);
      }
    );

    return unsub;
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const id = "owner_" + Date.now().toString();
    
    try {
      // 1. Create Formal Firebase Auth User
      // This is critical for the 'Forgot Password' feature to work
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // 2. Save Business Metadata to Firestore
      await setDoc(doc(db, "businessOwners", id), {
        id,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        // We still store password for 'legacy' check but primarily use Auth now
        password: formData.password, 
        status: 'Active',
        registeredAt: new Date().toISOString()
      });

      // 3. Create User Space
      await setDoc(doc(db, "users", id), {
        email: formData.email,
        businessName: formData.businessName,
        isSubscribed: false,
        createdAt: new Date().toISOString(),
        deliveryMethod: formData.deliveryMethod
      });

      // Initialize settings profile with delivery method
      await setDoc(doc(db, "users", id, "settings", "profile"), {
        businessName: formData.businessName,
        ventureType: 'Retail & Grocery',
        address: 'N/A',
        phone: formData.phone,
        email: formData.email,
        primaryLang: 'English',
        regWelcomeEn: 'Welcome to our business!',
        regWelcomeSi: 'අපගේ ව්‍යාපාරයට ඔබව සාදරයෙන් පිළිගනිමු!',
        termsEn: 'All sales are final. Thank you.',
        termsSi: 'සියලුම අලෙවියන් අවසාන වේ. ස්තූතියි.',
        currency: 'LKR (රුපියල්)',
        tin: '',
        logo: '',
        deliveryMethod: formData.deliveryMethod
      });

      setSuccessMsg(`Account for ${formData.businessName} is now live!`);
      setFormData({ businessName: '', ownerName: '', email: '', phone: '', username: '', password: '', deliveryMethod: 'Courier Service' });
      
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg(null);
      }, 2000);

    } catch (err: any) {
      console.error("Registration Error:", err);
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = "This email is already registered.";
      if (err.code === 'auth/weak-password') msg = "The password provided is too weak.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Revoke all licenses and delete data for ${name}? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "businessOwners", id));
        await deleteDoc(doc(db, "users", id));
      } catch (err: any) {
        alert("System Error: " + err.message);
      }
    }
  };

  const handleApproveSubscription = async (subId: string, userId: string) => {
    if (!userId) {
      return Swal.fire({
        title: 'Error!',
        text: 'User ID is missing for this request. Cannot approve.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }

    const result = await Swal.fire({
      title: 'Approve Subscription?',
      text: "This will unlock the dashboard and all premium features for this client.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Approve it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setApprovingId(subId);
      try {
        // 1. Update Subscription Status
        await updateDoc(doc(db, "subscriptions", subId), { 
          status: 'approved',
          approvedAt: new Date().toISOString()
        });

        // 2. Update User License Status
        // We update both 'isSubscribed' and 'status' to match user requirements
        await updateDoc(doc(db, "users", userId), { 
          isSubscribed: true,
          status: 'active',
          subscriptionStatus: 'approved'
        });

        // 3. Update Business Owner Status if it exists
        await updateDoc(doc(db, "businessOwners", userId), { 
          status: 'Active'
        }).catch(() => {
          // Ignore if owner doc ID is different from user ID (though they should match in this system)
          console.log("Owner doc update skipped or failed - non-critical");
        });

        Swal.fire({
          title: 'Success!',
          text: 'Subscription has been approved and the license is now active.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } catch (err: any) {
        console.error("Approval Error:", err);
        Swal.fire({
          title: 'Approval Failed',
          text: err.message || 'An unexpected error occurred during the approval process.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setApprovingId(null);
      }
    }
  };

  const filteredOwners = (owners || []).filter(owner => 
    owner.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Admin Control Center</h2>
          <p className="text-gray-500">Global license management for all business accounts.</p>
        </div>
        <button 
          onClick={() => { setError(null); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" /> Register New Client
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 text-sm animate-bounce">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Business, Owner, or Email..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            {isLoading ? 'Syncing...' : 'Live Database Sync'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-8 py-4">Business & Identity</th>
                <th className="px-8 py-4">Contact Gateway</th>
                <th className="px-8 py-4">Portal Access</th>
                <th className="px-8 py-4">License Status</th>
                <th className="px-8 py-4 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-400 font-medium tracking-tight">Accessing high-security records...</p>
                  </td>
                </tr>
              ) : (filteredOwners || []).length > 0 ? (
                filteredOwners.map(owner => (
                  <tr key={owner.id} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-800 text-base">{owner.businessName}</p>
                      <p className="text-xs text-blue-500 font-bold tracking-tight">{owner.ownerName}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[11px] text-gray-500"><Mail className="w-3 h-3 text-gray-300"/> {owner.email}</div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1"><Phone className="w-3 h-3 text-gray-300"/> {owner.phone}</div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-[10px] font-mono font-black text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{owner.username}</code>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-50">Active License</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(owner.id, owner.businessName)}
                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <Search className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-gray-400 text-sm font-bold tracking-tight">
                      {searchTerm ? `No matches for "${searchTerm}"` : 'No enterprise clients registered.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Subscription Requests Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-800 tracking-tighter">Recent Subscription Requests</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Live Requests
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-8 py-4">Client Email</th>
                <th className="px-8 py-4">Business</th>
                <th className="px-8 py-4">Plan Requested</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Requested At</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(subscriptions || []).length > 0 ? (
                [...subscriptions].sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)).map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 font-bold text-gray-800 text-sm">{sub.userEmail}</td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-bold">{sub.businessName || 'N/A'}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        {sub.planName}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-900 text-sm">Rs. {sub.price.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                        sub.status === 'pending' ? 'bg-amber-500 text-white shadow-amber-50' : 
                        sub.status === 'approved' ? 'bg-emerald-500 text-white shadow-emerald-50' : 
                        'bg-red-500 text-white shadow-red-50'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-400 font-bold">
                      {sub.timestamp?.toDate ? sub.timestamp.toDate().toLocaleString() : 'Just now'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {sub.status === 'pending' && (
                        <button 
                          onClick={() => {
                            console.log('Approve Button Clicked!', { subId: sub.id, userId: sub.userId });
                            handleApproveSubscription(sub.id!, sub.userId);
                          }}
                          disabled={approvingId === sub.id}
                          style={{ cursor: 'pointer', position: 'relative', zIndex: 9999 }}
                          className={`px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 ml-auto ${approvingId === sub.id ? 'opacity-70 cursor-wait' : ''}`}
                        >
                          {approvingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          {approvingId === sub.id ? 'Processing...' : 'Approve'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm font-bold">
                    No active subscription requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 md:p-14 shadow-2xl relative my-auto animate-in zoom-in duration-300">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-3xl font-black text-gray-800 mb-2 tracking-tighter">Create Cloud Instance</h3>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed">Deploy a dedicated business environment and secure login credentials.</p>
            
            {successMsg ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner shadow-emerald-200 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <p className="text-xl font-black text-emerald-600">{successMsg}</p>
                  <p className="text-sm text-gray-400 mt-2 font-bold uppercase tracking-widest">Encryption Sync Complete</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Business Identity</label>
                  <input required placeholder="Commercial Name" type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Proprietor Name</label>
                  <input required placeholder="Owner Full Name" type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Official Email</label>
                  <input required placeholder="auth@business.com" type="email" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Secure Contact</label>
                  <input required placeholder="07x xxxxxxx" type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Delivery Method</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-bold"
                    value={formData.deliveryMethod}
                    onChange={(e) => setFormData({...formData, deliveryMethod: e.target.value as any})}
                  >
                    <option value="Courier Service">Courier Service</option>
                    <option value="Post Office">Post Office</option>
                  </select>
                </div>
                
                <div className="col-span-1 md:col-span-2 h-px bg-gray-100 my-2"></div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ml-1">Dashboard Username</label>
                  <input required placeholder="Unique Handle" type="text" className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-black" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ml-1">Secret Password</label>
                  <input required placeholder="Min 6 Characters" type="password" className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-black" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                
                <div className="col-span-1 md:col-span-2 pt-6">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className={`w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {isSaving ? 'Encrypting Cloud Data...' : 'Authorize & Activate License'}
                  </button>
                  {error && <p className="text-red-500 text-[10px] font-bold text-center mt-4 animate-pulse uppercase tracking-widest">{error}</p>}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default SuperAdmin;
