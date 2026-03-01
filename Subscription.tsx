
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Zap, ShieldCheck, Rocket, Star, Loader2, MessageCircle, Clock } from 'lucide-react';
import { BusinessSettings } from '../types';

interface SubscriptionProps {
  settings: BusinessSettings;
  onSubscribe: (plan: string, price: number) => Promise<void>;
  onBack: () => void;
  isSubscribed: boolean;
}

const Subscription: React.FC<SubscriptionProps> = ({ settings, onSubscribe, onBack, isSubscribed }) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const currentPlan = settings.subscriptionPlan || 'None';
  const isPending = settings.subscriptionStatus === 'pending_verification';
  const isActive = isSubscribed;

  const plans = [
    {
      name: 'Premium All-in-One',
      price: '1,500',
      period: '/mo',
      description: 'සියලුම පහසුකම් ඇතුළත් එකම පැකේජය.',
      icon: Star,
      color: 'blue',
      popular: true,
      features: [
        'Unlimited Inventory & Lifetime History',
        'Professional Waybills & Courier Integration',
        'Expense & Profit Management',
        'Customer Database & Staff Logins',
        'SmartBiz Mobile App Support'
      ]
    }
  ];

  const handleSubscribeClick = async (planName: string, priceStr: string) => {
    if (planName === currentPlan && (isActive || isPending)) return;
    setLoadingPlan(planName);
    const price = parseInt(priceStr.replace(/,/g, ''));
    await onSubscribe(planName, price);
    setLoadingPlan(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-4 hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">එකම එක පැකේජයයි - සියලුම පහසුකම්!</h2>
          <p className="text-slate-500 mt-2 text-lg">Simple Pricing - All Features Included.</p>
        </div>
        
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-3 bg-blue-50 px-6 py-4 rounded-3xl border border-blue-100">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Status: {isActive ? 'Active' : isPending ? 'Pending' : 'Free'}</p>
              <p className="text-xl font-black text-blue-900">{currentPlan}</p>
            </div>
          </div>
          {isPending && (
            <div className="flex items-center gap-2 text-amber-600 font-bold text-[11px] bg-amber-50 px-4 py-2 rounded-full border border-amber-100 animate-pulse">
              <Clock className="w-3 h-3" /> Waiting for payment verification
            </div>
          )}
        </div>
      </motion.div>

      {/* Pricing Grid */}
      <div className="flex justify-center">
        {plans.map((plan, index) => {
          const isSelected = currentPlan === plan.name;
          const isCurrentPending = isSelected && isPending;
          const isCurrentActive = isSelected && isActive;

          return (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 md:p-12 rounded-[3.5rem] transition-all duration-500 max-w-lg w-full bg-slate-900 text-white shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)] border-2 border-blue-500/30`}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/40">
                Premium Choice
              </div>

              <div className="flex items-center justify-between mb-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/10">
                  <plan.icon className="w-8 h-8 text-blue-400" />
                </div>
                {(isCurrentActive || isCurrentPending) && (
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                    isCurrentActive ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'
                  }`}>
                    {isCurrentActive ? 'Active' : 'Pending Approval'}
                  </span>
                )}
              </div>

              <h3 className="text-3xl font-black mb-2">{plan.name}</h3>
              <p className="text-sm mb-10 text-slate-400">{plan.description}</p>
              
              <div className="mb-12">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">
                    LKR {plan.price}
                  </span>
                  <span className="text-sm font-bold text-slate-500">{plan.period}</span>
                </div>
                <p className="text-xs font-bold text-blue-400 mt-2 tracking-wide uppercase">No hidden fees. Cancel anytime</p>
              </div>

              <div className="space-y-5 mb-12">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-blue-500 text-white">
                      <Check className="w-3.5 h-3.5" strokeWidth={4} />
                    </div>
                    <span className="text-base font-bold text-slate-200">{feature}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={!(loadingPlan !== null || isCurrentActive || isCurrentPending) ? { scale: 1.02 } : {}}
                whileTap={!(loadingPlan !== null || isCurrentActive || isCurrentPending) ? { scale: 0.98 } : {}}
                onClick={() => handleSubscribeClick(plan.name, plan.price)}
                disabled={loadingPlan !== null || isCurrentActive || isCurrentPending}
                className={`w-full py-6 rounded-2xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                  isCurrentActive 
                    ? 'bg-emerald-500 text-white cursor-default'
                    : isCurrentPending
                    ? 'bg-amber-100 text-amber-600 cursor-default border border-amber-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]'
                } ${loadingPlan === plan.name ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loadingPlan === plan.name ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isCurrentActive ? (
                  'Active Plan'
                ) : isCurrentPending ? (
                  <>
                    <Clock className="w-5 h-5" /> Pending Approval
                  </>
                ) : (
                  <>
                    Start 7-Day Free Trial
                  </>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Manual Payment Help Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900">Manual Activation via WhatsApp</h4>
            <p className="text-slate-500 font-bold mt-1">Once you request a plan, send your deposit receipt to our support team for instant activation.</p>
          </div>
        </div>
        <button 
          onClick={() => window.open('https://wa.me/+94774748157', '_blank')}
          className="px-10 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" /> Chat with Support
        </button>
      </motion.div>
    </div>
  );
};

export default Subscription;
