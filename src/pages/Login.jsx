import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import { secureStorage } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Keyboard, LogIn, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import SocialLoginButtons from '../components/ui/SocialLoginButtons';
import { simulateSocialLogin } from '../services/socialAuth.jsx';
import Captcha from '../components/security/Captcha';
import SEOHead from '../components/SEOHead';

/**
 * Enhanced Login Page Component
 * Professional authentication with social login, validation, and error handling
 */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, loginWithSocial, error: authError, clearError, loading } = useAuthStore();
    const navigate = useNavigate();
    const captchaRef = useRef(null);

    // Clear errors when component unmounts or inputs change
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

        // 3️⃣ CAPTCHA CHECK (Checklist Item 3)
        // Validate CAPTCHA before proceeding
        if (captchaRef.current && !captchaRef.current.validate()) {
            return;
        }

        const result = await login(email.trim(), password);

        if (result.success) {
            // Save remember me preference securely
            if (rememberMe) {
                // In a real app, this would be a persistent token. 
                // For this architecture, we store the email securely.
                secureStorage.setItem('remember_email', email.trim());
            } else {
                secureStorage.removeItem('remember_email');
            }
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

    // Auto-fill remembered email
    useEffect(() => {
        const rememberedEmail = secureStorage.getItem('remember_email');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4">
            <SEOHead
                title="Sign In - TypeMaster Pro"
                description="Sign in to your TypeMaster Pro account to resume typing practice, lessons, competitive arenas, and access your profile stats."
                schemaType="organization"
            />
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Keyboard className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
                    <p className="text-slate-500 mt-2">Sign in to continue your typing journey</p>
                </div>

                {/* Error Alert */}
                {authError && (
                    <div role="alert" aria-live="assertive" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-800 font-medium">{authError}</p>
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-400 hover:text-red-600 transition"
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <div>
                        <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            autoComplete="email"
                            aria-label="Email address"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                autoComplete="current-password"
                                aria-label="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="login-remember" className="flex items-center gap-2 cursor-pointer">
                            <input
                                id="login-remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={loading}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-600">Remember me</span>
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* CAPTCHA Component */}
                    <Captcha ref={captchaRef} />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Sign In
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
                        <span className="px-4 bg-white text-slate-500">New to TypeMaster?</span>
                    </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                    <Link
                        to="/register"
                        className="text-indigo-600 hover:text-indigo-700 font-semibold transition inline-flex items-center gap-2"
                    >
                        Create your free account
                        <span aria-hidden="true">→</span>
                    </Link>
                </div>

                {/* Demo Info */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 text-center">
                        💡 <strong>Demo Tip:</strong> Create an account to save your progress and track your improvement!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
