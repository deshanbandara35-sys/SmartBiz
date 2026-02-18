
import React, { useState } from 'react';
import { UserRole } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs } from "@firebase/firestore";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "@firebase/auth";
import { X, Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, id: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState(''); // Can be username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Check for Super Admin
      if (identifier === 'admin@smartbiz.lk' && password === 'admin123') {
        onLogin(UserRole.SUPER_ADMIN, 'ADMIN_ROOT');
        return;
      }

      let emailToAuth = identifier;

      // 2. If it's a username (no @), resolve the email from Firestore
      if (!identifier.includes('@')) {
        const ownersRef = collection(db, "businessOwners");
        const q = query(ownersRef, where("username", "==", identifier));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          emailToAuth = querySnapshot.docs[0].data().email;
        } else {
          throw new Error('Account not found. Please check your username.');
        }
      }

      // 3. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, emailToAuth, password);
      
      // 4. Verify status in Firestore
      const ownersRef = collection(db, "businessOwners");
      const qStatus = query(ownersRef, where("email", "==", emailToAuth));
      const statusSnapshot = await getDocs(qStatus);

      if (!statusSnapshot.empty) {
        const data = statusSnapshot.docs[0].data();
        if (data.status === 'Inactive') {
          setError('This account has been suspended. Please contact support.');
          await auth.signOut();
        } else {
          onLogin(UserRole.BUSINESS_OWNER, statusSnapshot.docs[0].id);
        }
      } else {
        // Fallback for direct auth users not in businessOwners
        onLogin(UserRole.BUSINESS_OWNER, userCredential.user.uid);
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = 'Invalid credentials. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Check your caps lock.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Account temporarily locked.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage(null);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ 
        type: 'success', 
        text: 'A reset link has been sent to your inbox. Please check your email.' 
      });
      // Clear email after success but keep modal open for a moment to read
      setResetEmail('');
    } catch (err: any) {
      console.error("Reset Error:", err);
      let msg = 'Failed to send reset link.';
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email address.';
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      if (err.code === 'auth/too-many-requests') msg = 'Wait a few minutes before trying again.';
      setResetMessage({ type: 'error', text: msg });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e9eff3] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10 md:p-14 min-h-[500px] flex flex-col justify-center animate-in fade-in zoom-in duration-500">
        
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-[#1d70d1] rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
            Smart<span className="text-[#1d70d1]">BIZ</span>.LK
          </h1>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-8">Log in to your account</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Username or Email</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g. deshan35 or deshan@gmail.com"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1d70d1]/20 focus:border-[#1d70d1] outline-none text-gray-900 transition-all placeholder:text-gray-300 font-bold"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Secret Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1d70d1]/20 focus:border-[#1d70d1] outline-none text-gray-900 transition-all font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center text-xs text-gray-400 pl-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded-lg border-gray-300 text-[#1d70d1] focus:ring-[#1d70d1]" />
              Keep me logged in
            </label>
          </div>

          <div className="space-y-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4.5 bg-[#1d70d1] hover:bg-[#1559a8] text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => {
                  setResetMessage(null);
                  setShowForgotModal(true);
                }}
                className="text-xs font-black text-[#1d70d1] hover:text-[#1559a8] transition-colors py-2 px-4 rounded-xl hover:bg-blue-50"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center text-[10px] text-gray-300 font-black uppercase tracking-widest">
           <span>© 2024 Secure POS Cloud</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-200">
            <button 
              onClick={() => { setShowForgotModal(false); setResetMessage(null); }}
              className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-gray-800 mb-2">Account Recovery</h3>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">Enter your registered email and we'll send a secure reset link.</p>

            {resetMessage && (
              <div className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center gap-3 animate-in slide-in-from-top-2 ${
                resetMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
              }`}>
                {resetMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {resetMessage.text}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
                <input 
                  required
                  type="email" 
                  placeholder="name@business.com"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1d70d1]/20 focus:border-[#1d70d1] outline-none text-gray-900 font-bold transition-all"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={resetLoading}
                className={`w-full py-4.5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${resetLoading ? 'opacity-70' : ''}`}
              >
                {resetLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Send Reset Instructions'}
              </button>
              
              <button 
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full text-center text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors pt-2"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
