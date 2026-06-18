import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Palette, Music, Keyboard, Lock } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const ArenaShop = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const coins = parseInt(localStorage.getItem('arena_coins') || '0');

    const categories = [
        { id: 'visuals', name: 'Visual FX', icon: Palette, color: 'text-pink-400' },
        { id: 'audio', name: 'Sound Packs', icon: Music, color: 'text-indigo-400' },
        { id: 'skins', name: 'Keyboards', icon: Keyboard, color: 'text-emerald-400' },
    ];

    const items = [
        { id: 1, category: 'visuals', name: 'Matrix Rain Trail', price: 500, locked: true },
        { id: 2, category: 'visuals', name: 'Fire Spatter', price: 750, locked: true },
        { id: 3, category: 'audio', name: 'Typewriter Pack', price: 300, locked: true },
        { id: 4, category: 'audio', name: 'Sci-Fi Beeps', price: 450, locked: true },
        { id: 5, category: 'skins', name: 'Neon Cyber Board', price: 1000, locked: true },
        { id: 6, category: 'skins', name: 'Golden Keys', price: 2500, locked: true },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/arena')}
                            className="p-3 bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black italic uppercase flex items-center gap-3">
                                <ShoppingBag className="w-8 h-8 text-amber-400" />
                                The Armory
                            </h1>
                            <p className="text-slate-400 font-medium">Spend your hard-earned Arena Coins</p>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-slate-900 rounded-2xl border border-amber-500/20 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-black">$</div>
                        <div className="text-2xl font-black text-amber-400">{coins}</div>
                    </div>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group">
                            <div className={`w-12 h-12 rounded-xl bg-slate-800 ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold uppercase">{cat.name}</h3>
                            <p className="text-slate-500 text-sm mt-1">Browse Collection</p>
                        </div>
                    ))}
                </div>

                {/* Featured Items Grid */}
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                    <span className="text-indigo-500">///</span> Featured Arrivals
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <div key={item.id} className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-1 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                            <div className="relative bg-slate-950/90 h-full rounded-xl p-6 flex flex-col">
                                <div className="flex-1 flex items-center justify-center py-8">
                                    <div className="text-6xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
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
                                        <button disabled={true} className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-bold text-slate-400 flex items-center gap-2 cursor-not-allowed">
                                            <Lock className="w-3 h-3" /> Locked
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArenaShop;
