import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { 
    Search,
    Keyboard, 
    LayoutDashboard, 
    User, 
    Trophy, 
    Gamepad2, 
    Moon, 
    Sun, 
    LogOut,
    Code,
    Swords,
    BookOpen,
    MessageSquare
} from 'lucide-react';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout, updateSettings } = useAuthStore();

    // Toggle Command Palette on Ctrl/Cmd + K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            // Close on escape
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Also close on background click, managed later.
    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuery('');
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Command List Definition
    const commands = [
        {
            category: 'Navigation',
            items: [
                { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
                { id: 'nav-test', label: 'Start Typing Test', icon: Keyboard, action: () => navigate('/test') },
                { id: 'nav-learn', label: 'Interactive Lessons', icon: BookOpen, action: () => navigate('/learn') },
                { id: 'nav-gamification', label: 'Play Mini-Games', icon: Gamepad2, action: () => navigate('/gamification') },
                { id: 'nav-chat', label: 'Community Chat Grid', icon: MessageSquare, action: () => navigate('/community/chat') },
                { id: 'nav-arena', label: 'Arena Leaderboard', icon: Trophy, action: () => navigate('/arena') },
                { id: 'nav-profile', label: 'View Profile', icon: User, action: () => navigate('/profile') }
            ]
        },
        {
            category: 'Quick Actions',
            items: [
                { id: 'action-code', label: 'Practice Code (JavaScript)', icon: Code, action: () => navigate('/test', { state: { targetMode: 'code' } }) },
                { id: 'action-sudden-death', label: 'Start Sudden Death Mode', icon: Swords, action: () => navigate('/test', { state: { autoStartSuddenDeath: true } }) },
            ]
        },
        {
            category: 'Settings & Account',
            items: [
                { 
                    id: 'theme-toggle', 
                    label: `Enable ${user?.settings?.theme === 'dark' ? 'Light' : 'Dark'} Mode`, 
                    icon: user?.settings?.theme === 'dark' ? Sun : Moon, 
                    action: () => updateSettings({ theme: user?.settings?.theme === 'dark' ? 'light' : 'dark' }) 
                },
                { id: 'auth-logout', label: 'Sign Out', icon: LogOut, action: () => { logout(); navigate('/'); } }
            ]
        }
    ];

    // Filter logic
    const filteredCommands = commands.map(group => ({
        ...group,
        items: group.items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
    })).filter(group => group.items.length > 0);

    // Flatten for keyboard navigation
    const flatItems = filteredCommands.flatMap(g => g.items);

    // Reset selected index if query changes and index is out of bounds
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedIndex(0);
    }, [query]);

    // Handle Keyboard Navigation within the Palette
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % flatItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selectedItem = flatItems[selectedIndex];
            if (selectedItem) {
                selectedItem.action();
                setIsOpen(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 px-4 backdrop-blur-sm bg-slate-900/40 dark:bg-black/60 transition-opacity animate-in fade-in duration-200">
            {/* Click away layer */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <div 
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Search Input Area */}
                <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
                    <Search className="w-6 h-6 text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full px-4 py-5 bg-transparent border-0 focus:ring-0 outline-none text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 command-palette-input"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-expanded={isOpen}
                        role="combobox"
                    />
                    <div className="shrink-0 flex items-center gap-1 opacity-50">
                        <kbd className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-mono font-bold">{"ESC"}</kbd>
                    </div>
                </div>

                {/* Results Area */}
                <div className="max-h-[60vh] overflow-y-auto pattern-noise py-2" role="listbox">
                    {filteredCommands.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            <p className="text-lg font-medium">No commands found</p>
                            <p className="text-sm mt-1">Try a different search term.</p>
                        </div>
                    ) : (
                        filteredCommands.map((group, _groupIdx) => (
                            <div key={group.category} className="mb-4 last:mb-0">
                                <div className="px-4 py-2 text-xs font-semibold tracking-wider text-indigo-500 uppercase">
                                    {group.category}
                                </div>
                                <ul>
                                    {group.items.map((item) => {
                                        const globalIndex = flatItems.findIndex(i => i.id === item.id);
                                        const isSelected = globalIndex === selectedIndex;
                                        const Icon = item.icon;

                                        return (
                                            <li
                                                key={item.id}
                                                role="option"
                                                aria-selected={isSelected}
                                                onClick={() => {
                                                    item.action();
                                                    setIsOpen(false);
                                                }}
                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                className={`
                                                    flex items-center gap-4 px-4 py-3 mx-2 rounded-xl cursor-pointer transition-colors
                                                    ${isSelected 
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    p-2 rounded-lg 
                                                    ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}
                                                `}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium flex-grow">{item.label}</span>
                                                {isSelected && (
                                                    <kbd className="hidden sm:inline-block text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400 font-mono shadow-sm">
                                                        Enter
                                                    </kbd>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Footer Guide */}
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
                        <span className="flex items-center gap-1"><kbd>Enter</kbd> to select</span>
                    </div>
                    <div>
                        <span className="font-semibold text-indigo-500">TypeMaster Pro</span> Command Center
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
