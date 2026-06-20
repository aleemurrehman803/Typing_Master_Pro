import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowRight, CheckCircle, AlertCircle, Loader, ShieldCheck } from 'lucide-react';
import { secureStorage, hashPassword, verifyPassword } from '../utils/auth';
import { validatePassword } from '../utils/validation';
import SEOHead from '../components/SEOHead';

/**
 * ForgotPassword Page Component
 * Secure password recovery flow using security questions
 */
const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Security Questions, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);
    const [answers, setAnswers] = useState({});
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Clear error when step changes
    useEffect(() => {
        setError('');
        setSuccess('');
    }, [step]);

    /**
     * Step 1: Verify Email
     */
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay for security (prevent enumeration timing attacks)
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const users = secureStorage.getItem('users') || {};
            const normalizedEmail = email.toLowerCase().trim();
            const foundUser = users[normalizedEmail];

            if (foundUser) {
                if (foundUser.securityQuestions && foundUser.securityQuestions.length > 0) {
                    setUser(foundUser);
                    setStep(2);
                } else {
                    setError('Account exists but has no security questions set. Please contact support.');
                }
            } else {
                // Generic message to prevent user enumeration
                setError('If an account exists with this email, you will be prompted for security questions.');
                // In a real app, we might send an email here even if user not found (to the entered email saying "someone tried to reset...")
            }
        } catch (err) {
            console.error('Error verifying email:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Step 2: Verify Security Questions
     */
    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            let isCorrect = true;
            // Check all questions
            for (let i = 0; i < user.securityQuestions.length; i++) {
                const sq = user.securityQuestions[i];
                const userAnswer = answers[i]?.toLowerCase().trim();

                // Use verifyPassword to check answer against hash (answers are hashed like passwords)
                if (!userAnswer || !verifyPassword(userAnswer, sq.answerHash, sq.salt)) {
                    isCorrect = false;
                    break;
                }
            }

            if (isCorrect) {
                setStep(3);
            } else {
                setError('Incorrect answers. Please try again.');
            }
        } catch (err) {
            console.error('Error verifying answers:', err);
            setError('Failed to verify answers.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Step 3: Reset Password
     */
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const validation = validatePassword(newPassword);
        if (validation.strength < 40) { // Require at least moderate strength
            setError('Password is too weak. Please use a stronger password.');
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const users = secureStorage.getItem('users') || {};
            const normalizedEmail = user.email.toLowerCase();

            if (users[normalizedEmail]) {
                // Hash new password
                const { hash, salt } = hashPassword(newPassword);

                // Update user record
                users[normalizedEmail].passwordHash = hash;
                users[normalizedEmail].salt = salt;

                // Save back to storage
                secureStorage.setItem('users', users);

                setStep(4);
            } else {
                setError('User account not found. It may have been deleted.');
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4">
            <SEOHead
                title="Reset Password - TypeMaster Pro"
                description="Recover your TypeMaster Pro account. Answer your security questions to securely reset your password."
                schemaType="organization"
            />
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Password Recovery</h2>
                    <p className="text-slate-500 mt-2">
                        {step === 1 && "Enter your email to find your account"}
                        {step === 2 && "Answer your security questions"}
                        {step === 3 && "Create a new secure password"}
                        {step === 4 && "Password reset successful!"}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                )}

                {/* Step 1: Email Form */}
                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                        >
                            {loading ? <Loader className="animate-spin w-5 h-5" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                )}

                {/* Step 2: Security Questions */}
                {step === 2 && user && (
                    <form onSubmit={handleSecuritySubmit} className="space-y-5">
                        {user.securityQuestions.map((q, index) => (
                            <div key={index}>
                                <label htmlFor={`security-answer-${index}`} className="block text-sm font-semibold text-slate-700 mb-2">
                                    {q.question}
                                </label>
                                <input
                                    id={`security-answer-${index}`}
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Your answer"
                                    value={answers[index] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                        ))}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                        >
                            {loading ? <Loader className="animate-spin w-5 h-5" /> : <>Verify Answers <ShieldCheck className="w-5 h-5" /></>}
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handlePasswordReset} className="space-y-5">
                        <div>
                            <label htmlFor="reset-password" className="block text-sm font-semibold text-slate-700 mb-2">
                                New Password
                            </label>
                            <input
                                id="reset-password"
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="New strong password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label htmlFor="reset-confirm" className="block text-sm font-semibold text-slate-700 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="reset-confirm"
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                        >
                            {loading ? <Loader className="animate-spin w-5 h-5" /> : <>Reset Password <CheckCircle className="w-5 h-5" /></>}
                        </button>
                    </form>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-slate-600 mb-6">
                            Your password has been successfully updated. You can now log in with your new password.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}

                {/* Back to Login Link */}
                {step !== 4 && (
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-indigo-600 hover:text-indigo-700 font-medium transition"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
