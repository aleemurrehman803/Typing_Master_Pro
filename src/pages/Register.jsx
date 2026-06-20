import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { validatePassword } from '../utils/validation';
import SocialLoginButtons from '../components/ui/SocialLoginButtons';
import { simulateSocialLogin } from '../services/socialAuth.jsx';
import SEOHead from '../components/SEOHead';

/**
 * Enhanced Register Page Component
 * Professional registration with password strength meter and validation
 */
const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: 'None', errors: [] });
    const [passwordMatch, setPasswordMatch] = useState(true);
    const { register, loginWithSocial, error: authError, clearError, loading } = useAuthStore();
    const navigate = useNavigate();

    // Calculate password strength in real-time
    useEffect(() => {
        if (password) {
            const validation = validatePassword(password);
            setPasswordStrength({
                strength: validation.strength,
                label: validation.strengthLabel,
                errors: validation.errors
            });
        } else {
            setPasswordStrength({ strength: 0, label: 'None', errors: [] });
        }
    }, [password]);

    // Check password match
    useEffect(() => {
        if (confirmPassword) {
            setPasswordMatch(password === confirmPassword);
        }
    }, [password, confirmPassword]);

    // Clear errors
    useEffect(() => {
        if (authError) {
            const timer = setTimeout(clearError, 5000);
            return () => clearTimeout(timer);
        }
    }, [authError, clearError]);

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        // Validate password match
        if (password !== confirmPassword) {
            return;
        }

        // Validate terms acceptance
        if (!acceptTerms) {
            return;
        }

        const result = await register(name.trim(), email.trim(), password);

        if (result.success) {
            navigate('/dashboard');
        }
    };

    /**
     * Handle social login
     */
    const handleSocialLogin = async (providerId) => {
        try {
            const socialData = await simulateSocialLogin(providerId);
            const result = await loginWithSocial(socialData);

            if (result.success) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Social login error:', error);
        }
    };

    /**
     * Get strength color
     */
    const getStrengthColor = () => {
        if (passwordStrength.strength >= 80) return 'bg-green-500';
        if (passwordStrength.strength >= 60) return 'bg-blue-500';
        if (passwordStrength.strength >= 40) return 'bg-yellow-500';
        if (passwordStrength.strength >= 20) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getStrengthTextColor = () => {
        if (passwordStrength.strength >= 80) return 'text-green-700';
        if (passwordStrength.strength >= 60) return 'text-blue-700';
        if (passwordStrength.strength >= 40) return 'text-yellow-700';
        if (passwordStrength.strength >= 20) return 'text-orange-700';
        return 'text-red-700';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-4 py-12">
            <SEOHead
                title="Sign Up - TypeMaster Pro"
                description="Create your TypeMaster Pro account to start learning touch typing, taking exams, unlocking badges, and tracking your speed improvements."
                schemaType="organization"
            />
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
                    <p className="text-slate-500 mt-2">Start your professional typing career</p>
                </div>

                {/* Error Alert */}
                {authError && (
                    <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-800 font-medium">{authError}</p>
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-400 hover:text-red-600 transition"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-700 mb-2">
                            Full Name
                        </label>
                        <input
                            id="reg-name"
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            autoComplete="name"
                            minLength={2}
                            maxLength={50}
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address
                        </label>
                        <input
                            id="reg-email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    {/* Password Field with Strength Meter */}
                    <div>
                        <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                autoComplete="new-password"
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Password Strength Meter */}
                        {password && (
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 font-medium">Password Strength:</span>
                                    <span className={`font-bold ${getStrengthTextColor()}`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                                        style={{ width: `${passwordStrength.strength}%` }}
                                    />
                                </div>
                                {passwordStrength.errors.length > 0 && (
                                    <ul className="text-xs text-slate-600 space-y-1 mt-2">
                                        {passwordStrength.errors.map((error, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span>{error}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="reg-confirm" className="block text-sm font-semibold text-slate-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="reg-confirm"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                className={`w-full px-4 py-3 pr-12 rounded-lg border-2 ${confirmPassword && !passwordMatch
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                                    } outline-none transition-all`}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                                tabIndex={-1}
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {confirmPassword && !passwordMatch && (
                            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Passwords do not match
                            </p>
                        )}
                        {confirmPassword && passwordMatch && (
                            <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Passwords match
                            </p>
                        )}
                    </div>

                    {/* Terms & Conditions */}
                    <div className="pt-2">
                        <label htmlFor="reg-terms" className="flex items-start gap-3 cursor-pointer">
                            <input
                                id="reg-terms"
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                disabled={loading}
                                className="w-4 h-4 mt-0.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                required
                            />
                            <span className="text-sm text-slate-600">
                                I agree to the{' '}
                                <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Terms of Service
                                </button>
                                {' '}and{' '}
                                <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Privacy Policy
                                </button>
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !passwordMatch || !acceptTerms || passwordStrength.strength < 40}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                {/* Social Login Buttons */}
                <SocialLoginButtons onSocialLogin={handleSocialLogin} disabled={loading} />

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-500">Already have an account?</span>
                    </div>
                </div>

                {/* Sign In Link */}
                <div className="text-center">
                    <Link
                        to="/login"
                        className="text-indigo-600 hover:text-indigo-700 font-semibold transition inline-flex items-center gap-2"
                    >
                        Sign in instead
                        <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
