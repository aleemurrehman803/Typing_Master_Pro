/**
 * Social Authentication Service
 * Simulated OAuth for Google, Facebook, and GitHub
 * Easy to swap with real OAuth later
 */

export const OAUTH_PROVIDERS = {
    google: {
        id: 'google',
        name: 'Google',
        color: 'bg-white hover:bg-gray-50 border-gray-300',
        textColor: 'text-gray-700',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
        )
    },
    facebook: {
        id: 'facebook',
        name: 'Facebook',
        color: 'bg-[#1877F2] hover:bg-[#166FE5] border-[#1877F2]',
        textColor: 'text-white',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        )
    },
    phone: {
        id: 'phone',
        name: 'Phone',
        color: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500',
        textColor: 'text-white',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
        )
    }
};

/**
 * Simulate OAuth login flow
 * In production, replace this with actual OAuth calls
 */
export const simulateSocialLogin = async (providerId) => {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            try {
                const provider = OAUTH_PROVIDERS[providerId];

                let identifier = null;
                if (typeof window !== 'undefined' && window.prompt) {
                    identifier = window.prompt(`Enter your mock ${provider.name} email or phone number to simulate OAuth login:`, `${providerId}_user@example.com`);
                }

                // If user cancels or inputs empty, use fallback
                if (!identifier) {
                    identifier = `${providerId}_user@example.com`;
                }

                // If phone number is input, format as unique email format
                let email = identifier.toLowerCase().trim();
                let name = `${provider.name} User`;

                if (!email.includes('@')) {
                    // It's a phone number
                    const digits = email.replace(/\D/g, '');
                    email = `phone_${digits || 'default'}@phone.com`;
                    name = `Phone User (${digits})`;
                } else {
                    // Extract name from email if possible
                    const parts = email.split('@');
                    if (parts[0]) {
                        name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ` (${provider.name})`;
                    }
                }

                const mockUserData = {
                    provider: providerId,
                    providerId: `${providerId}_${email}`,
                    name: name,
                    email: email,
                    picture: null,
                    verified: true
                };

                resolve(mockUserData);
            } catch (error) {
                reject(new Error(`Failed to login with ${providerId}`));
            }
        }, 1000); // Simulate network delay
    });
};

/**
 * Security questions for password recovery
 */
export const SECURITY_QUESTIONS = [
    'What city were you born in?',
    'What is your mother\'s maiden name?',
    'What was the name of your first pet?',
    'What was the name of your elementary school?',
    'What is your favorite movie?',
    'What was your childhood nickname?'
];

/**
 * Generate a random security question
 */
export const getRandomSecurityQuestions = (count = 2) => {
    const shuffled = [...SECURITY_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
