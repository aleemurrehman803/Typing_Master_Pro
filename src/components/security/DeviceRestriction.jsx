import React, { useEffect, useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

const DeviceRestriction = ({ children }) => {
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            const userAgent = navigator.userAgent.toLowerCase();

            // Check for mobile user agents
            const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

            // Strict Desktop Enforcement: 
            // 1. User Agent must not be mobile
            // 2. Screen width should be at least 1024px (standard laptop/desktop breakpoint)
            // Note: We allow resizing windows on desktop, so the resize check logic is lenient, 
            // but the initial load or strict UA check blocks real mobile devices.

            if (isMobileUA || (width < 768 && 'ontouchstart' in window)) {
                setIsBlocked(true);
            } else {
                setIsBlocked(false);
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    if (isBlocked) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-6 p-6 bg-red-500/10 rounded-full border-4 border-red-500 animate-pulse">
                    <Smartphone className="w-16 h-16 text-red-500" />
                </div>
                <h1 className="text-4xl font-black uppercase mb-4 tracking-wider">Desktop Only</h1>
                <p className="text-xl text-slate-400 max-w-lg mb-8">
                    TypeMaster Pro requires a physical keyboard and a desktop environment for certification-grade accuracy.
                </p>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 uppercase tracking-widest border px-4 py-2 rounded-lg border-slate-700">
                    <Monitor className="w-4 h-4" /> Please use a PC or Laptop
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default DeviceRestriction;
