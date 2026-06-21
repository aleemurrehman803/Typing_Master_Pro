import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, CreditCard, Coins, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const COIN_PACKAGES = [
    { id: 'pkg-starter', coins: 100, price: 1.00, bonus: 0, label: 'Starter Pack' },
    { id: 'pkg-challenger', coins: 500, price: 4.50, bonus: 10, label: 'Challenger Pack', popular: true },
    { id: 'pkg-champion', coins: 1000, price: 8.00, bonus: 20, label: 'Champion Pack' },
    { id: 'pkg-whale', coins: 5000, price: 35.00, bonus: 30, label: 'Whale Pack' }
];

export const StripeDepositModal = ({ isOpen, onClose }) => {
    const { depositCoins } = useAuthStore();
    const [selectedPkg, setSelectedPkg] = useState(COIN_PACKAGES[1]);
    const [paymentDetails, setPaymentDetails] = useState({
        cardName: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardZip: ''
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [cardBrand, setCardBrand] = useState('generic'); // 'visa' | 'mastercard' | 'generic'
    const [txnId, setTxnId] = useState('');

    const handleClose = () => {
        setError('');
        setLoading(false);
        setSuccess(false);
        setTxnId('');
        setPaymentDetails({
            cardName: '',
            cardNumber: '',
            cardExpiry: '',
            cardCvc: '',
            cardZip: ''
        });
        onClose();
    };

    // Format Card Number (adds spaces every 4 digits)
    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
        if (val.startsWith('4')) {
            setCardBrand('visa');
        } else if (val.startsWith('5')) {
            setCardBrand('mastercard');
        } else {
            setCardBrand('generic');
        }
        
        let matches = val.match(/\d{1,4}/g);
        let formatted = matches ? matches.join(' ') : '';
        setPaymentDetails({ ...paymentDetails, cardNumber: formatted.substring(0, 19) });
    };

    // Format Expiry Date (MM/YY)
    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        setPaymentDetails({ ...paymentDetails, cardExpiry: val.substring(0, 5) });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        const rawCard = paymentDetails.cardNumber.replace(/\s/g, '');
        if (rawCard.length < 16) {
            setError('Please enter a valid 16-digit card number.');
            return;
        }

        const exp = paymentDetails.cardExpiry;
        if (exp.length < 5) {
            setError('Please enter expiration date (MM/YY).');
            return;
        }

        const [month, _year] = exp.split('/');
        const mNum = parseInt(month);
        if (mNum < 1 || mNum > 12) {
            setError('Invalid expiration month.');
            return;
        }

        if (paymentDetails.cardCvc.length < 3) {
            setError('Please enter a 3 or 4 digit CVV/CVC.');
            return;
        }

        if (paymentDetails.cardZip.length < 5) {
            setError('Please enter a valid 5-digit zip code.');
            return;
        }

        setLoading(true);

        // Simulate Stripe API Latency
        setTimeout(async () => {
            const res = await depositCoins(selectedPkg.coins);
            setLoading(false);
            if (res.success) {
                setTxnId('ch_' + Math.random().toString(36).substr(2, 9));
                setSuccess(true);
            } else {
                setError('Stripe gateway rejected this transaction. Please try another card.');
            }
        }, 1800);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="stripe-overlay">
                <motion.div 
                    className="stripe-card"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    {/* Header */}
                    <div className="stripe-header">
                        <div className="flex items-center gap-2">
                            <div className="stripe-logo-icon">
                                <CreditCard size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="stripe-title">Stripe Checkout</span>
                                <span className="stripe-subtitle">Secure Coin Recharger</span>
                            </div>
                        </div>
                        <button className="stripe-close" onClick={handleClose}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="stripe-body">
                        {!success ? (
                            <form onSubmit={handleFormSubmit} className="stripe-form">
                                {/* Coin Packages Selection */}
                                <div className="stripe-section">
                                    <label className="stripe-label">Choose Packages</label>
                                    <div className="stripe-pkg-grid">
                                        {COIN_PACKAGES.map((pkg) => (
                                            <div 
                                                key={pkg.id}
                                                className={`stripe-pkg-card ${selectedPkg.id === pkg.id ? 'active' : ''} ${pkg.popular ? 'popular' : ''}`}
                                                onClick={() => setSelectedPkg(pkg)}
                                            >
                                                {pkg.popular && <span className="pkg-badge">POPULAR</span>}
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="pkg-name">{pkg.label}</span>
                                                    <span className="pkg-price">${pkg.price.toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-yellow-500 font-black">
                                                    <Coins size={14} />
                                                    <span className="text-base">{pkg.coins} Coins</span>
                                                    {pkg.bonus > 0 && (
                                                        <span className="pkg-bonus-label">+{pkg.bonus}% Bonus</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="stripe-error">
                                        <AlertCircle size={16} className="shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Billing Details */}
                                <div className="stripe-section">
                                    <label className="stripe-label">Payment Information</label>
                                    <div className="stripe-input-group">
                                        <div className="stripe-input-wrapper">
                                            <input 
                                                type="text" 
                                                className="stripe-input"
                                                placeholder="Cardholder name"
                                                required
                                                value={paymentDetails.cardName}
                                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
                                            />
                                        </div>

                                        <div className="stripe-input-wrapper relative">
                                            <input 
                                                type="text" 
                                                className="stripe-input pr-12"
                                                placeholder="Card number"
                                                required
                                                value={paymentDetails.cardNumber}
                                                onChange={handleCardNumberChange}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                {cardBrand === 'visa' && <span className="text-xs font-bold text-indigo-500">VISA</span>}
                                                {cardBrand === 'mastercard' && <span className="text-xs font-bold text-orange-500">MC</span>}
                                                {cardBrand === 'generic' && <CreditCard size={16} />}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <input 
                                                type="text" 
                                                className="stripe-input text-center"
                                                placeholder="MM/YY"
                                                required
                                                value={paymentDetails.cardExpiry}
                                                onChange={handleExpiryChange}
                                            />
                                            <input 
                                                type="password" 
                                                className="stripe-input text-center"
                                                placeholder="CVC"
                                                required
                                                maxLength="4"
                                                value={paymentDetails.cardCvc}
                                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvc: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                                            />
                                            <input 
                                                type="text" 
                                                className="stripe-input text-center"
                                                placeholder="Zip"
                                                required
                                                maxLength="5"
                                                value={paymentDetails.cardZip}
                                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardZip: e.target.value.replace(/\D/g, '').substring(0, 5) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="stripe-pay-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={16} />
                                            <span>Processing Securely...</span>
                                        </>
                                    ) : (
                                        <span>Pay ${selectedPkg.price.toFixed(2)} USD</span>
                                    )}
                                </button>

                                <div className="stripe-footer">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span>Secured by Stripe · PCI-DSS Compliant Gateway</span>
                                </div>
                            </form>
                        ) : (
                            <div className="stripe-success">
                                <motion.div 
                                    className="success-icon-wrapper"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    <CheckCircle2 size={48} className="text-emerald-400" />
                                </motion.div>
                                <h3 className="success-title">Recharge Successful!</h3>
                                <p className="success-text">
                                    Your deposit of <strong>{selectedPkg.coins} Coins</strong> has been securely credited to your wallet.
                                </p>
                                
                                <div className="success-receipt">
                                    <div className="receipt-row">
                                        <span>Status</span>
                                        <span className="text-emerald-500 font-bold">PAID</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span>Coins Added</span>
                                        <span className="text-yellow-500 font-black">+{selectedPkg.coins} COINS</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span>Paid Amount</span>
                                        <span className="text-white font-bold">${selectedPkg.price.toFixed(2)}</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span>Transaction ID</span>
                                        <span className="font-mono text-slate-400 uppercase text-[10px]">{txnId}</span>
                                    </div>
                                </div>

                                <button className="stripe-success-btn" onClick={handleClose}>
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                <style>{`
                    .stripe-overlay {
                        position: fixed; inset: 0; z-index: 9999;
                        display: flex; align-items: center; justify-content: center;
                        background: rgba(2, 6, 23, 0.75); backdrop-filter: blur(8px);
                        padding: 16px;
                    }
                    .stripe-card {
                        background: #0f172a; border-radius: 24px;
                        border: 1px solid #1e293b; width: 100%; max-width: 440px;
                        overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    }
                    .stripe-header {
                        padding: 20px 24px; border-bottom: 1px solid #1e293b;
                        display: flex; align-items: center; justify-content: space-between;
                        background: #0b0f19;
                    }
                    .stripe-logo-icon {
                        width: 32px; height: 32px; border-radius: 10px;
                        background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2);
                        display: flex; align-items: center; justify-content: center;
                        color: #6366f1;
                    }
                    .stripe-title { font-size: 15px; font-weight: 800; color: white; line-height: 1.2; }
                    .stripe-subtitle { font-size: 11px; font-weight: 500; color: #64748b; }
                    .stripe-close { color: #64748b; cursor: pointer; transition: color 0.2s; padding: 6px; border-radius: 50%; border: none; background: none; }
                    .stripe-close:hover { color: white; background: #1e293b; }
                    
                    .stripe-body { padding: 24px; }
                    .stripe-form { display: flex; flex-direction: column; gap: 20px; }
                    .stripe-section { display: flex; flex-direction: column; gap: 8px; }
                    .stripe-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; }
                    
                    .stripe-pkg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .stripe-pkg-card {
                        background: rgba(30, 41, 59, 0.2); border: 1px solid #1e293b; border-radius: 14px;
                        padding: 12px; cursor: pointer; transition: all 0.2s ease;
                        position: relative; overflow: hidden;
                    }
                    .stripe-pkg-card:hover { border-color: #334155; background: rgba(30, 41, 59, 0.4); }
                    .stripe-pkg-card.active { border-color: #6366f1; background: rgba(99, 102, 241, 0.05); }
                    .stripe-pkg-card.popular { border-color: rgba(249, 115, 22, 0.4); }
                    .stripe-pkg-card.popular.active { border-color: #f97316; background: rgba(249, 115, 22, 0.05); }
                    
                    .pkg-badge {
                        position: absolute; top: 0; right: 0;
                        background: #f97316; color: white; font-size: 8px; font-weight: 900;
                        padding: 2px 6px; border-bottom-left-radius: 8px; letter-spacing: 0.05em;
                    }
                    .pkg-name { font-size: 11px; font-weight: 700; color: #94a3b8; }
                    .pkg-price { font-size: 11px; font-weight: 800; color: white; }
                    .pkg-bonus-label {
                        font-size: 9px; font-weight: 800; color: #f97316;
                        background: rgba(249, 115, 22, 0.1); padding: 1px 4px; border-radius: 4px;
                    }
                    
                    .stripe-error {
                        background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
                        color: #ef4444; border-radius: 12px; padding: 10px 14px;
                        display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600;
                    }
                    
                    .stripe-input-group {
                        display: flex; flex-direction: column; gap: 10px;
                        background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b;
                        padding: 12px; border-radius: 16px;
                    }
                    .stripe-input {
                        width: 100%; background: #0f172a; border: 1px solid #1e293b;
                        border-radius: 10px; padding: 10px 14px; color: white; font-size: 13px;
                        outline: none; transition: border-color 0.2s;
                    }
                    .stripe-input:focus { border-color: #6366f1; }
                    
                    .stripe-pay-btn {
                        background: linear-gradient(135deg, #6366f1, #4f46e5); color: white;
                        font-size: 14px; font-weight: 800; border-radius: 14px;
                        padding: 12px; cursor: pointer; transition: all 0.2s;
                        display: flex; align-items: center; justify-content: center; gap: 8px;
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); border: none;
                    }
                    .stripe-pay-btn:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
                        background: linear-gradient(135deg, #4f46e5, #4338ca);
                    }
                    .stripe-pay-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                    
                    .stripe-footer {
                        display: flex; align-items: center; justify-content: center; gap: 6px;
                        font-size: 10px; font-weight: 600; color: #475569;
                    }
                    
                    /* Success view styles */
                    .stripe-success {
                        display: flex; flex-direction: column; align-items: center; text-align: center;
                        padding: 10px 0;
                    }
                    .success-icon-wrapper {
                        width: 72px; height: 72px; border-radius: 50%;
                        background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);
                        display: flex; align-items: center; justify-content: center;
                        margin-bottom: 16px;
                    }
                    .success-title { font-size: 20px; font-weight: 900; color: white; margin-bottom: 8px; }
                    .success-text { font-size: 13px; color: #94a3b8; margin-bottom: 24px; max-width: 320px; line-height: 1.5; }
                    
                    .success-receipt {
                        width: 100%; background: #0b0f19; border: 1px solid #1e293b;
                        border-radius: 16px; padding: 14px 18px; display: flex; flex-direction: column;
                        gap: 10px; margin-bottom: 24px;
                    }
                    .receipt-row { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; }
                    .receipt-row :first-child { color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
                    .receipt-row :last-child { color: #cbd5e1; }
                    
                    .stripe-success-btn {
                        width: 100%; background: #1e293b; color: white; border: 1px solid #334155;
                        font-size: 13px; font-weight: 700; border-radius: 12px;
                        padding: 10px; cursor: pointer; transition: all 0.2s;
                    }
                    .stripe-success-btn:hover { background: #334155; color: white; }
                `}</style>
            </div>
        </AnimatePresence>
    );
};
