import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Palette, Music, Keyboard, Lock, Check, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useSettingsStore from '../../store/useSettingsStore';

const ArenaShop = () => {
    const navigate = useNavigate();
    const { user, spendCoins } = useAuthStore();
    const { setSoundProfile, soundProfile } = useSettingsStore();

    // Live coins count from localStorage or user state
    const [coins, setCoins] = useState(() => parseInt(localStorage.getItem('arena_coins') || '0'));
    const [purchasedItems, setPurchasedItems] = useState(() => JSON.parse(localStorage.getItem('purchased_items') || '[]'));
    const [equippedItems, setEquippedItems] = useState(() => {
        return JSON.parse(localStorage.getItem('equipped_items') || '{"visuals": null, "audio": null, "skins": null}');
    });
    const [notification, setNotification] = useState(null);

    // Sync coins on custom event
    useEffect(() => {
        const handleCoinsUpdate = () => {
            setCoins(parseInt(localStorage.getItem('arena_coins') || '0'));
        };
        window.addEventListener('arena-coins-updated', handleCoinsUpdate);
        return () => window.removeEventListener('arena-coins-updated', handleCoinsUpdate);
    }, []);

    // Dismiss notifications automatically
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const categories = [
        { id: 'visuals', name: 'Visual FX', icon: Palette, color: 'text-pink-400' },
        { id: 'audio', name: 'Sound Packs', icon: Music, color: 'text-indigo-400' },
        { id: 'skins', name: 'Keyboards', icon: Keyboard, color: 'text-emerald-400' },
    ];

    const items = [
        { id: 1, category: 'visuals', name: 'Matrix Rain Trail', price: 500, label: 'matrix' },
        { id: 2, category: 'visuals', name: 'Fire Spatter', price: 750, label: 'fire' },
        { id: 3, category: 'audio', name: 'Typewriter Pack', price: 300, label: 'typewriter' },
        { id: 4, category: 'audio', name: 'Sci-Fi Beeps', price: 450, label: 'retro' },
        { id: 5, category: 'skins', name: 'Neon Cyber Board', price: 1000, label: 'neon' },
        { id: 6, category: 'skins', name: 'Golden Keys', price: 2500, label: 'gold' },
    ];

    const handlePurchase = async (item) => {
        if (coins < item.price) {
            setNotification({ type: 'error', message: 'Insufficient coins! Win matches to earn more.' });
            return;
        }

        const res = await spendCoins(item.price);
        if (res.success) {
            const updatedPurchased = [...purchasedItems, item.id];
            setPurchasedItems(updatedPurchased);
            localStorage.setItem('purchased_items', JSON.stringify(updatedPurchased));

            // Auto-equip the item
            handleEquip(item);
            
            setNotification({ type: 'success', message: `Successfully purchased and equipped ${item.name}! 🪙` });
        } else {
            setNotification({ type: 'error', message: res.error || 'Failed to complete transaction.' });
        }
    };

    const handleEquip = (item) => {
        const newEquipped = { ...equippedItems, [item.category]: item.id };
        setEquippedItems(newEquipped);
        localStorage.setItem('equipped_items', JSON.stringify(newEquipped));

        // Direct integration with sound engine
        if (item.category === 'audio') {
            setSoundProfile(item.label);
        }
        
        setNotification({ type: 'success', message: `${item.name} equipped!` });
    };

    const handleUnequip = (category, itemName) => {
        const newEquipped = { ...equippedItems, [category]: null };
        setEquippedItems(newEquipped);
        localStorage.setItem('equipped_items', JSON.stringify(newEquipped));

        // Disable typing sounds if unequipped
        if (category === 'audio') {
            setSoundProfile('silent');
        }

        setNotification({ type: 'success', message: `${itemName} unequipped.` });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto relative">
                
                {/* Floating Notification */}
                {notification && (
                    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-3 transition-all transform animate-in slide-in-from-top duration-300 ${
                        notification.type === 'success' 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 backdrop-blur-md' 
                            : 'bg-rose-500/20 border-rose-500 text-rose-400 backdrop-blur-md'
                    }`}>
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        {notification.message}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/arena')}
                            className="p-3 bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black italic uppercase flex items-center gap-3">
                                <ShoppingBag className="w-8 h-8 text-amber-400 animate-pulse" />
                                The Armory
                            </h1>
                            <p className="text-slate-400 font-medium">Spend your hard-earned Arena Coins</p>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-slate-900 rounded-2xl border border-amber-500/20 flex items-center gap-3 shadow-lg shadow-amber-500/5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-black">$</div>
                        <div className="text-2xl font-black text-amber-400">{coins}</div>
                    </div>
                </div>

                {/* Categories Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-default group">
                            <div className={`w-12 h-12 rounded-xl bg-slate-800 ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-700/50`}>
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold uppercase">{cat.name}</h3>
                            <p className="text-slate-500 text-sm mt-1">
                                {equippedItems[cat.id] 
                                    ? `Equipped: ${items.find(i => i.id === equippedItems[cat.id])?.name}`
                                    : 'Nothing equipped'
                                }
                            </p>
                        </div>
                    ))}
                </div>

                {/* Items Grid */}
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                    <span className="text-indigo-500">///</span> Shop Arrivals
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => {
                        const isPurchased = purchasedItems.includes(item.id);
                        const isEquipped = equippedItems[item.category] === item.id;
                        const canAfford = coins >= item.price;

                        return (
                            <div key={item.id} className={`relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-1 overflow-hidden group border ${
                                isEquipped ? 'border-indigo-500/60' : 'border-slate-800 hover:border-slate-700'
                            }`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                <div className="relative bg-slate-950/90 h-full rounded-xl p-6 flex flex-col justify-between">
                                    <div className="flex-1 flex items-center justify-center py-8">
                                        <div className="text-6xl opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                            {item.category === 'visuals' ? '✨' : item.category === 'audio' ? '🔊' : '⌨️'}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{item.name}</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{item.category}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-amber-400 font-bold flex items-center gap-1">
                                                <span>{item.price}</span>
                                                <span className="text-xs opacity-70">COINS</span>
                                            </div>
                                            
                                            {isPurchased ? (
                                                isEquipped ? (
                                                    <button 
                                                        onClick={() => handleUnequip(item.category, item.name)}
                                                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm font-bold text-emerald-400 flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Equipped
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleEquip(item)}
                                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold text-slate-200 transition-colors"
                                                    >
                                                        Equip
                                                    </button>
                                                )
                                            ) : (
                                                <button 
                                                    onClick={() => handlePurchase(item)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md ${
                                                        canAfford 
                                                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black hover:scale-105'
                                                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                                    }`}
                                                >
                                                    Buy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ArenaShop;
