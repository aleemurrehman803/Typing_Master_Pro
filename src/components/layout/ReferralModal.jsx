import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Copy, Share2, Check, Users, Coins, Zap } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const ReferralModal = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const [copied, setCopied] = useState(false);
    
    // Generate a unique referral code if not exists
    const [referralCode] = useState(() => {
        return user?.referralCode || `${user?.name?.split(' ')[0]?.toUpperCase() || 'PRO'}-${Math.floor(1000 + Math.random() * 9000)}`;
    });
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        { label: 'WhatsApp', color: 'bg-emerald-500', action: () => window.open(`https://wa.me/?text=Join me on TypeMaster Pro! Use my link to get 50 bonus Arena Coins: ${referralLink}`, '_blank') },
        { label: 'Discord', color: 'bg-indigo-500', action: () => window.open(`https://discord.com/`, '_blank') }, // Discord usually requires the app/clipboard
        { label: 'X (Twitter)', color: 'bg-slate-900', action: () => window.open(`https://twitter.com/intent/tweet?text=Level up your typing speed on TypeMaster Pro! 🚀 Get 50 bonus coins here: ${referralLink}`, '_blank') }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        {/* Header Image/Icon */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pattern-noise" />
                            <motion.div 
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="inline-flex p-4 bg-white/20 rounded-2xl backdrop-blur-md mb-4"
                            >
                                <Gift className="w-10 h-10" />
                            </motion.div>
                            <h2 className="text-3xl font-black mb-2 tracking-tight">Refer & Earn</h2>
                            <p className="text-indigo-100 text-sm font-medium">Invite your friends and grow the elite community</p>
                            
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center group transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
                                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">50</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                                        <Coins className="w-3 h-3" /> Coins for You
                                    </div>
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center group transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
                                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">25</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                                        <Zap className="w-3 h-3" /> Coins for Friend
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Your Referral Link</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-600 dark:text-slate-300 truncate leading-relaxed">
                                        {referralLink}
                                    </div>
                                    <button 
                                        onClick={handleCopy}
                                        className={`px-4 rounded-xl flex items-center justify-center transition-all active:scale-95 ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-indigo-600 text-white hover:shadow-lg'}`}
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Quick Share</label>
                                <div className="flex flex-wrap gap-3">
                                    {shareOptions.map(option => (
                                        <button
                                            key={option.label}
                                            onClick={option.action}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 ${option.color} text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-md`}
                                        >
                                            <Share2 className="w-4 h-4" />
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Referral Stats */}
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                        <Users className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        You've invited <span className="text-indigo-600 dark:text-indigo-400 font-bold">{user?.referralCount || 0} friends</span>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Earned: {user?.referralCoins || 0} Coins
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReferralModal;
