import React, { useState } from 'react';
import { OAUTH_PROVIDERS, simulateSocialLogin } from '../../services/socialAuth.jsx';
import { Loader2 } from 'lucide-react';

/**
 * Social Login Buttons Component
 * Displays Google, Facebook, and GitHub login options
 */
const SocialLoginButtons = ({ onSocialLogin, disabled = false }) => {
    const [loadingProvider, setLoadingProvider] = useState(null);

    const handleSocialClick = async (providerId) => {
        if (disabled || loadingProvider) return;

        try {
            setLoadingProvider(providerId);
            await onSocialLogin(providerId);
        } catch (error) {
            console.error('Social login error:', error);
        } finally {
            setLoadingProvider(null);
        }
    };

    return (
        <div className="space-y-3">
            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
                </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-3">
                {Object.values(OAUTH_PROVIDERS).map((provider) => (
                    <button
                        key={provider.id}
                        onClick={() => handleSocialClick(provider.id)}
                        disabled={disabled || loadingProvider !== null}
                        className={`
                            relative flex items-center justify-center px-4 py-3 
                            border-2 rounded-lg font-medium transition-all
                            ${provider.color} ${provider.textColor}
                            ${disabled || loadingProvider !== null ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                            ${loadingProvider === provider.id ? 'ring-2 ring-indigo-500' : ''}
                        `}
                        title={`Sign in with ${provider.name}`}
                    >
                        {loadingProvider === provider.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            provider.icon
                        )}
                    </button>
                ))}
            </div>

            {/* Loading message */}
            {loadingProvider && (
                <p className="text-center text-sm text-slate-500 animate-pulse">
                    Connecting to {OAUTH_PROVIDERS[loadingProvider].name}...
                </p>
            )}
        </div>
    );
};

export default SocialLoginButtons;
