/* eslint-disable no-unused-vars, react-hooks/purity, react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, Send, Search, BellOff, Bell, Pin, ShieldAlert,
    Ban, Smile, Image, Share2, MoreVertical, X, Plus, Volume2,
    VolumeX, Shield, Crown, ArrowLeft, Check, CheckCheck, SmilePlus,
    MessageCircle, Trash2, Flag, Eye, Settings, Filter, Users, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import SEOHead from '../components/SEOHead';

// Pre-seeded chat rooms, direct messages, and groups
const INITIAL_ROOMS = [
    { id: 'global', name: 'Global Lobby', description: 'General typing chatter for all operatives.', type: 'room', unread: 0, pinnedCount: 2, slowMode: 0 },
    { id: 'bronze', name: 'Bronze Room', description: 'Warmup room for beginners (under 40 WPM).', type: 'room', unread: 0, pinnedCount: 0, slowMode: 0 },
    { id: 'gold', name: 'Gold Room', description: 'Intense speed chat for advanced typists (60+ WPM).', type: 'room', unread: 0, pinnedCount: 1, slowMode: 2 },
    { id: 'diamond', name: 'Diamond Lounge', description: 'Operatives with 100+ WPM only. Ultra-premium vibes.', type: 'room', unread: 0, pinnedCount: 3, slowMode: 5 },
    { id: 'code-ninja', name: '#code-ninja', description: 'CSS/JS/Python snippets and syntax optimization.', type: 'room', unread: 0, pinnedCount: 1, slowMode: 0 },
    { id: 'galactic', name: '#galactic-typist', description: 'Astroid defense protocols and wave patterns.', type: 'room', unread: 0, pinnedCount: 0, slowMode: 0 }
];

const INITIAL_DMS = [
    { id: 'dm-neo', name: 'Neo_V2', description: 'Elite Operative | 156 WPM', type: 'dm', online: true, unread: 1, avatarColor: 'from-amber-400 to-yellow-500', isBlocked: false },
    { id: 'dm-cipher', name: 'Cipher_Queen', description: 'Grandmaster | 142 WPM', type: 'dm', online: true, unread: 0, avatarColor: 'from-fuchsia-400 to-pink-600', isBlocked: false },
    { id: 'dm-glitch', name: 'Glitch0', description: 'Master | 138 WPM', type: 'dm', online: false, unread: 0, avatarColor: 'from-orange-400 to-red-500', isBlocked: false }
];

const INITIAL_GROUPS = [
    { id: 'grp-apex', name: 'Apex Typists', description: 'Private speed-running collective (5 members)', type: 'group', unread: 0, members: ['You', 'Neo_V2', 'Cipher_Queen', 'Glitch0', 'SpeedyGonzales'], avatarColor: 'from-indigo-500 via-purple-500 to-pink-500' },
    { id: 'grp-css', name: 'CSS Hackers', description: 'Flexbox & Grid alignment unit (3 members)', type: 'group', unread: 0, members: ['You', 'FlexBoxKing', 'GridMaster'], avatarColor: 'from-cyan-400 to-blue-500' }
];

const MOCK_ONLINE_MEMBERS = [
    { name: 'Neo_V2', wpm: 156, level: 32, rank: 'Legendary', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { name: 'Cipher_Queen', wpm: 142, level: 28, rank: 'Grandmaster', color: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10' },
    { name: 'Glitch0', wpm: 138, level: 25, rank: 'Master', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    { name: 'SpeedyGonzales', wpm: 110, level: 19, rank: 'Diamond', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
    { name: 'FlexBoxKing', wpm: 92, level: 15, rank: 'Platinum', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
    { name: 'GridMaster', wpm: 88, level: 12, rank: 'Gold', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' }
];

const MOCK_GIFS = [
    { name: 'keyboard smash', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejcxa3ozb3pjNWwzNTFldXZudHBhNHRiaTFidWgyNmF0MTUzMG5wNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13HgwGsXF0ATHG/giphy.gif' },
    { name: 'super fast typing', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHIyb2s4ajdxeWZlOGNsdjRjcXkydjA4anN3ZHY0OWZtazl2NmpyeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Dh5q0sShJSCxG/giphy.gif' },
    { name: 'hackerman coding', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3Q5azBnbmlmcmN3aW1rNDhldXhrOW5ubXlhYWN6ZWhscWpxOHlscCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MM0Jrc8BHKZ3y/giphy.gif' },
    { name: 'matrix code', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNThnOHRmdnQ5eTFyMHprN3FqOGU1MDM5c2U3azg4Z3R2enF6MWdzdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3rVfBUeJg8HpPECpGY/giphy.gif' },
    { name: 'mind blown success', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmNsbzhndXFvMHNrbHlycjEwaGN4MXp6aHY3MXlydWd3bDR1N3ZnaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif' },
    { name: 'cat typing fast', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2RmeWN5bzRndThqOHM0ZXoxOTU3NmNpd3V0eXg1Zm5ubGptc3FkayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JIX9t2j0ZTN9S/giphy.gif' },
    { name: 'gaming gamer concentrate', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHcyMTh1bzQyNG0ycWc4MXQ1M3N3a3ZudmtsczRnbjRxam5rMDcxYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d3mlE7uhX8KFgEmY/giphy.gif' }
];

const PRE_SEEDED_MESSAGES = {
    'global': [
        { id: 1, sender: 'Neo_V2', content: 'Welcome to the global grid! Let me know if anyone wants to challenge my 156 WPM score.', time: '10:02 AM', status: 'read', reactions: { '🔥': 2, '⚡': 3 } },
        { id: 2, sender: 'Cipher_Queen', content: 'I am getting closer, Neo. Hit 142 WPM in the Gold Room yesterday. No mistakes!', time: '10:05 AM', status: 'read', reactions: { '💯': 2 } },
        { id: 3, sender: 'Glitch0', content: 'Anyone notice how the CSS mode is super clean now? Best layout addition.', time: '10:12 AM', status: 'read', reactions: { '👍': 1 } }
    ],
    'gold': [
        { id: 1, sender: 'Cipher_Queen', content: 'This speed test has zero delay now. Perfect for competitive runs.', time: 'Yesterday', status: 'read', reactions: { '⚡': 2 } }
    ],
    'diamond': [
        { id: 1, sender: 'Neo_V2', content: 'Elite operatives only in this channel. Focus, rhythm, speed.', time: '9:00 AM', status: 'read', reactions: { '👑': 3 } }
    ],
    'code-ninja': [
        { id: 1, sender: 'FlexBoxKing', content: 'Who can type this CSS flexbox grid centering code in under 15 seconds?', time: 'Yesterday', status: 'read', codeSnippet: 'display: flex;\njustify-content: center;\nalign-items: center;' }
    ],
    'dm-neo': [
        { id: 1, sender: 'Neo_V2', content: 'Hey! Ready for a 1v1 typing duel? Let me know when you host the lobby.', time: 'Yesterday', status: 'read', reactions: {} }
    ]
};

const PROFANITY_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'crap', 'dick'];

export default function CommunityChat() {
    const { user } = useAuthStore();
    const stats = user?.stats || { testsTaken: 0, avgWpm: 0, bestWpm: 0, accuracy: 0, history: [] };

    // Chat navigation states
    const [rooms, setRooms] = useState(() => {
        const cached = localStorage.getItem('tmp_chat_rooms');
        return cached ? JSON.parse(cached) : INITIAL_ROOMS;
    });
    const [dms, setDms] = useState(() => {
        const cached = localStorage.getItem('tmp_chat_dms');
        return cached ? JSON.parse(cached) : INITIAL_DMS;
    });
    const [groups, setGroups] = useState(() => {
        const cached = localStorage.getItem('tmp_chat_groups');
        return cached ? JSON.parse(cached) : INITIAL_GROUPS;
    });

    const [activeChat, setActiveChat] = useState(() => {
        return INITIAL_ROOMS[0]; // Default to Global Lobby
    });

    const [messages, setMessages] = useState(() => {
        const cached = localStorage.getItem('tmp_chat_messages');
        return cached ? JSON.parse(cached) : PRE_SEEDED_MESSAGES;
    });

    // Sub-menus & Features
    const [searchQuery, setSearchQuery] = useState('');
    const [msgSearchQuery, setMsgSearchQuery] = useState('');
    const [isSearchingMsg, setIsSearchingMsg] = useState(false);
    const [inputText, setInputText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [slowModeSeconds, setSlowModeSeconds] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isDnd, setIsDnd] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [selectedMsgForReport, setSelectedMsgForReport] = useState(null);
    const [reportReason, setReportReason] = useState('spam');
    const [typingUser, setTypingUser] = useState(null);

    // Group Modal inputs
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [groupColor, setGroupColor] = useState('from-indigo-500 to-pink-500');

    // Auto-scroll ref
    const messagesEndRef = useRef(null);

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('tmp_chat_rooms', JSON.stringify(rooms));
    }, [rooms]);
    useEffect(() => {
        localStorage.setItem('tmp_chat_dms', JSON.stringify(dms));
    }, [dms]);
    useEffect(() => {
        localStorage.setItem('tmp_chat_groups', JSON.stringify(groups));
    }, [groups]);
    useEffect(() => {
        localStorage.setItem('tmp_chat_messages', JSON.stringify(messages));
    }, [messages]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Reset unread count for current active chat
        const updateUnreads = (list, setter) => {
            setter(prev => prev.map(item => item.id === activeChat.id ? { ...item, unread: 0 } : item));
        };
        if (activeChat.type === 'room') updateUnreads(rooms, setRooms);
        if (activeChat.type === 'dm') updateUnreads(dms, setDms);
        if (activeChat.type === 'group') updateUnreads(groups, setGroups);
    }, [activeChat, messages]);

    // Filter profanity helper
    const sanitizeMessage = (text) => {
        let cleaned = text;
        PROFANITY_WORDS.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            cleaned = cleaned.replace(regex, '***');
        });
        return cleaned;
    };

    // Slow mode timer check
    useEffect(() => {
        if (slowModeSeconds > 0) {
            const timer = setTimeout(() => setSlowModeSeconds(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [slowModeSeconds]);

    // Trigger typing indicator and reply animation
    const triggerBotResponse = (chatId, userMsg) => {
        // Random reply delay (2.5s)
        const chatType = activeChat.type;
        const chatName = activeChat.name;

        setTimeout(() => {
            setTypingUser(chatName === 'Neo_V2' ? 'Neo_V2' : 'Cipher_Queen');
            setTimeout(() => {
                setTypingUser(null);
                const botResponses = [
                    'Excellent speed test stats! Let\'s go for a speed duel soon.',
                    'Did you try the deep focus mode in the typing test? Overclocks concentration.',
                    'Impressive rhythm! Keep maintaining that high accuracy combo.',
                    'Syntax slicing in HTML/CSS feels amazing with custom key-sound setups.',
                    'Check the Wallet Dashboard - unlocked a new rank multiplier recently.'
                ];
                const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                const newMsg = {
                    id: Date.now(),
                    sender: chatType === 'dm' ? chatName : (chatName === 'Apex Typists' ? 'Neo_V2' : 'System_Bot'),
                    content: `Replying to your point: "${userMsg.substring(0, 30)}..." - ${randomResponse}`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'read',
                    reactions: {}
                };

                setMessages(prev => ({
                    ...prev,
                    [chatId]: [...(prev[chatId] || []), newMsg]
                }));

                // Trigger audio beep if not muted or DND
                if (!isMuted && !isDnd) {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav');
                    audio.volume = 0.15;
                    audio.play().catch(() => {});
                }
            }, 1800);
        }, 1200);
    };

    // Send Message handler
    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!inputText.trim()) return;
        if (slowModeSeconds > 0) return;

        const cleanedContent = sanitizeMessage(inputText);

        const newMsg = {
            id: Date.now(),
            sender: user?.name || 'You',
            content: cleanedContent,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            reactions: {},
            replyTo: replyTo ? { sender: replyTo.sender, content: replyTo.content } : null
        };

        const chatId = activeChat.id;
        setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), newMsg]
        }));

        setInputText('');
        setReplyTo(null);

        // Apply slow mode if active
        if (activeChat.slowMode > 0) {
            setSlowModeSeconds(activeChat.slowMode);
        }

        // Trigger bot reply logic
        triggerBotResponse(chatId, cleanedContent);
    };

    // Send Shared Score Card
    const handleShareScore = () => {
        const bestWpm = stats.bestWpm || 65;
        const avgAcc = stats.accuracy || 98;
        const newMsg = {
            id: Date.now(),
            sender: user?.name || 'You',
            content: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            reactions: {},
            scoreCard: {
                wpm: bestWpm,
                accuracy: avgAcc,
                mode: 'Code Mode (CSS)',
                timestamp: Date.now()
            }
        };

        const chatId = activeChat.id;
        setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), newMsg]
        }));
        triggerBotResponse(chatId, `Shared score: ${bestWpm} WPM`);
    };

    // Emoji reaction toggle
    const handleReaction = (msgId, emoji) => {
        const chatId = activeChat.id;
        setMessages(prev => {
            const chatMsgs = prev[chatId] || [];
            const updated = chatMsgs.map(m => {
                if (m.id === msgId) {
                    const reactions = { ...(m.reactions || {}) };
                    if (reactions[emoji]) {
                        reactions[emoji] += 1;
                    } else {
                        reactions[emoji] = 1;
                    }
                    return { ...m, reactions };
                }
                return m;
            });
            return { ...prev, [chatId]: updated };
        });
    };

    // Pinned Message action
    const handlePinMessage = (msg) => {
        const chatId = activeChat.id;
        setMessages(prev => {
            const chatMsgs = prev[chatId] || [];
            const updated = chatMsgs.map(m => {
                if (m.id === msg.id) {
                    return { ...m, isPinned: !m.isPinned };
                }
                return m;
            });
            return { ...prev, [chatId]: updated };
        });
        
        // Update pinned count in lists
        const increment = msg.isPinned ? -1 : 1;
        setRooms(prev => prev.map(r => r.id === chatId ? { ...r, pinnedCount: Math.max(0, r.pinnedCount + increment) } : r));
    };

    // Direct Message initiator from online panel
    const handleStartDM = (memberName) => {
        const existingDM = dms.find(d => d.name === memberName);
        if (existingDM) {
            setActiveChat(existingDM);
        } else {
            const newDM = {
                id: `dm-${memberName.toLowerCase()}`,
                name: memberName,
                description: `Operative | Active`,
                type: 'dm',
                online: true,
                unread: 0,
                avatarColor: 'from-cyan-400 to-indigo-500',
                isBlocked: false
            };
            setDms(prev => [...prev, newDM]);
            setActiveChat(newDM);
        }
    };

    // Toggle Block Operative
    const handleToggleBlockUser = (dmId) => {
        setDms(prev => prev.map(d => d.id === dmId ? { ...d, isBlocked: !d.isBlocked } : d));
        if (activeChat.id === dmId) {
            setActiveChat(prev => ({ ...prev, isBlocked: !prev.isBlocked }));
        }
    };

    // Create Group Handler
    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        const newGroup = {
            id: `grp-${Date.now()}`,
            name: newGroupName,
            description: `${selectedMembers.length + 1} members`,
            type: 'group',
            unread: 0,
            members: ['You', ...selectedMembers],
            avatarColor: groupColor
        };

        setGroups(prev => [...prev, newGroup]);
        setActiveChat(newGroup);
        setShowGroupModal(false);
        setNewGroupName('');
        setSelectedMembers([]);
    };

    // Report submission
    const handleSubmitReport = () => {
        alert(`Message reported successfully. Reason: ${reportReason.toUpperCase()}. Our moderators will review it.`);
        setShowReportModal(false);
        setSelectedMsgForReport(null);
    };

    // Send GIF
    const handleSendGif = (gifUrl) => {
        const chatId = activeChat.id;
        const newMsg = {
            id: Date.now(),
            sender: user?.name || 'You',
            content: '',
            gifUrl: gifUrl,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            reactions: {}
        };
        setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), newMsg]
        }));
        setShowGifPicker(false);
        triggerBotResponse(chatId, 'Sent a GIF');
    };

    // Filter public channels, dms, and groups
    const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredDms = dms.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Active room message feed
    const activeMessages = messages[activeChat.id] || [];
    const filteredActiveMessages = activeMessages.filter(m => 
        m.content.toLowerCase().includes(msgSearchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
            <SEOHead
                title="Community Chat - TypeMaster Pro"
                description="Live typing grids, 1v1 dms, custom groups, and speed sharing."
                schemaType="webApplication"
            />

            {/* Main Layout Grid */}
            <div className="flex-1 flex h-[calc(100vh-64px)] relative overflow-hidden">
                
                {/* 1. SIDEBAR (Left Panel) */}
                <div className="w-[320px] bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-20 shrink-0">
                    
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-slate-800/80">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-6 h-6 text-indigo-400" />
                                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">CHAT GRID</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsDnd(!isDnd)}
                                    title={isDnd ? 'Disable DND' : 'Enable Do Not Disturb'}
                                    className={`p-2 rounded-xl transition ${isDnd ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'}`}
                                >
                                    {isDnd ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setShowGroupModal(true)}
                                    title="Create Private Group"
                                    className="p-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl transition flex items-center justify-center border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search rooms, DMs, or groups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
                        
                        {/* Section A: Public Channels */}
                        <div>
                            <div className="flex items-center justify-between px-2 mb-2">
                                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Public Grids</span>
                                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">{filteredRooms.length}</span>
                            </div>
                            <div className="space-y-1">
                                {filteredRooms.map(room => (
                                    <button
                                        key={room.id}
                                        onClick={() => setActiveChat(room)}
                                        className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between transition-all duration-200 ${activeChat.id === room.id ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300' : 'hover:bg-slate-800/40 text-slate-400 border border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 border border-slate-700">
                                                #
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-slate-200">{room.name}</div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[170px]">{room.description}</div>
                                            </div>
                                        </div>
                                        {room.pinnedCount > 0 && <Pin className="w-3 h-3 text-amber-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section B: Groups */}
                        <div>
                            <div className="flex items-center justify-between px-2 mb-2">
                                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">My Squads</span>
                                <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-full">{filteredGroups.length}</span>
                            </div>
                            <div className="space-y-1">
                                {filteredGroups.map(group => (
                                    <button
                                        key={group.id}
                                        onClick={() => setActiveChat(group)}
                                        className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between transition-all duration-200 ${activeChat.id === group.id ? 'bg-pink-500/10 border border-pink-500/30 text-pink-300' : 'hover:bg-slate-800/40 text-slate-400 border border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${group.avatarColor} flex items-center justify-center font-black text-[10px] text-white`}>
                                                {group.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-slate-200">{group.name}</div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[170px]">{group.description}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section C: Direct Messages */}
                        <div>
                            <div className="flex items-center justify-between px-2 mb-2">
                                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Direct Transmissions</span>
                                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-full">{filteredDms.length}</span>
                            </div>
                            <div className="space-y-1">
                                {filteredDms.map(dm => (
                                    <button
                                        key={dm.id}
                                        onClick={() => setActiveChat(dm)}
                                        className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between transition-all duration-200 ${activeChat.id === dm.id ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300' : 'hover:bg-slate-800/40 text-slate-400 border border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${dm.avatarColor} flex items-center justify-center font-black text-xs text-white`}>
                                                    {dm.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                {dm.online && (
                                                    <span className="w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full absolute -bottom-0.5 -right-0.5 animate-pulse" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                                                    {dm.name}
                                                    {dm.isBlocked && <span className="text-[8px] bg-red-500/20 text-red-400 px-1 rounded">Blocked</span>}
                                                </div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{dm.description}</div>
                                            </div>
                                        </div>
                                        {dm.unread > 0 && (
                                            <span className="bg-cyan-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">
                                                {dm.unread}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* 2. CHAT WINDOW (Middle Panel) */}
                <div className="flex-1 bg-slate-950 flex flex-col relative">
                    
                    {/* Header */}
                    <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                                    {activeChat.type === 'room' ? '#' : ''} {activeChat.name}
                                    {activeChat.slowMode > 0 && (
                                        <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                                            Slow Mode: {activeChat.slowMode}s
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">{activeChat.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Message Search toggler */}
                            <div className="relative flex items-center">
                                <AnimatePresence>
                                    {isSearchingMsg && (
                                        <motion.input
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: 160, opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            type="text"
                                            placeholder="Find in this chat..."
                                            value={msgSearchQuery}
                                            onChange={(e) => setMsgSearchQuery(e.target.value)}
                                            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none mr-2"
                                        />
                                    )}
                                </AnimatePresence>
                                <button
                                    onClick={() => setIsSearchingMsg(!isSearchingMsg)}
                                    className={`p-2 rounded-xl transition ${isSearchingMsg ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'}`}
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Pinned Messages Button */}
                            <button
                                onClick={() => setShowPinModal(true)}
                                className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 rounded-xl transition flex items-center gap-1.5"
                                title="View Pinned Messages"
                            >
                                <Pin className="w-4 h-4" />
                            </button>

                            {/* Mute Notification Toggle */}
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-2 rounded-xl transition ${isMuted ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'}`}
                                title={isMuted ? 'Unmute Room' : 'Mute Room'}
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>

                            {/* Block button for DMs */}
                            {activeChat.type === 'dm' && (
                                <button
                                    onClick={() => handleToggleBlockUser(activeChat.id)}
                                    className={`p-2 rounded-xl transition ${activeChat.isBlocked ? 'bg-red-600 text-white' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                    title={activeChat.isBlocked ? 'Unblock User' : 'Block User'}
                                >
                                    <Ban className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Messages List Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                        {filteredActiveMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                <MessageSquare className="w-12 h-12 mb-2 stroke-[1.5]" />
                                <p className="text-sm">No transmissions recorded yet.</p>
                                <p className="text-[10px] uppercase tracking-wider mt-1">Initiate typing combo below</p>
                            </div>
                        ) : (
                            filteredActiveMessages.map((msg) => {
                                const isSelf = msg.sender === (user?.name || 'You');
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                                        
                                        {/* Avatar + Sender Info */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-slate-400">{msg.sender}</span>
                                            <span className="text-[9px] text-slate-600">{msg.time}</span>
                                        </div>

                                        {/* Reply Quote Preview inside message bubble */}
                                        <div className="group relative max-w-[70%]">
                                            
                                            {/* Reactions picker popup on hover */}
                                            <div className={`absolute -top-7 ${isSelf ? 'right-0' : 'left-0'} hidden group-hover:flex items-center bg-slate-900 border border-slate-800 rounded-full px-2 py-1 gap-1.5 shadow-xl z-30`}>
                                                {['👍', '❤️', '😂', '🔥', '⚡', '💯', '👑'].map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => handleReaction(msg.id, emoji)}
                                                        className="hover:scale-125 transition text-xs"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        setSelectedMsgForReport(msg);
                                                        setShowReportModal(true);
                                                    }}
                                                    className="p-0.5 hover:text-red-400 text-slate-500 transition ml-1"
                                                    title="Report Message"
                                                >
                                                    <Flag className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handlePinMessage(msg)}
                                                    className={`p-0.5 transition ${msg.isPinned ? 'text-amber-500' : 'text-slate-500 hover:text-amber-400'}`}
                                                    title={msg.isPinned ? 'Unpin Message' : 'Pin Message'}
                                                >
                                                    <Pin className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setReplyTo(msg)}
                                                    className="p-0.5 text-slate-500 hover:text-indigo-400 transition"
                                                    title="Reply"
                                                >
                                                    <Share2 className="w-3.5 h-3.5 rotate-180" />
                                                </button>
                                            </div>

                                            {/* Message Content Bubble */}
                                            <div className={`p-3.5 rounded-2xl border backdrop-blur-md ${
                                                isSelf
                                                    ? 'bg-gradient-to-br from-indigo-600/80 to-purple-600/80 border-indigo-500/30 text-white rounded-tr-none'
                                                    : 'bg-slate-900/80 border-slate-800/80 text-slate-200 rounded-tl-none'
                                            } ${msg.isPinned ? 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.05)]' : ''}`}>
                                                
                                                {/* Reply Quote bar */}
                                                {msg.replyTo && (
                                                    <div className="mb-2 p-2 bg-slate-950/60 border-l-2 border-indigo-500 rounded text-[10px] text-slate-400 flex flex-col">
                                                        <span className="font-bold text-indigo-400 mb-0.5">{msg.replyTo.sender}</span>
                                                        <span className="truncate">{msg.replyTo.content}</span>
                                                    </div>
                                                )}

                                                {/* Text Content */}
                                                {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                                                {/* Code Snippet content */}
                                                {msg.codeSnippet && (
                                                    <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400">
                                                        {msg.codeSnippet}
                                                    </pre>
                                                )}

                                                {/* Shared Score Card */}
                                                {msg.scoreCard && (
                                                    <div className="bg-gradient-to-br from-indigo-950/90 to-slate-900 border border-indigo-500/40 rounded-xl p-3 shadow-lg max-w-[280px]">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Crown className="w-4 h-4 text-amber-400" />
                                                            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">OPERATIVE COMBAT REPORT</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 mb-2 bg-slate-950/60 p-2 rounded-lg border border-slate-900">
                                                            <div>
                                                                <span className="block text-[8px] font-bold text-slate-500 uppercase">BEST WPM</span>
                                                                <span className="text-base font-black text-white font-mono">{msg.scoreCard.wpm}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[8px] font-bold text-slate-500 uppercase">ACCURACY</span>
                                                                <span className="text-base font-black text-emerald-400 font-mono">{msg.scoreCard.accuracy}%</span>
                                                            </div>
                                                        </div>
                                                        <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-2">MODE: {msg.scoreCard.mode}</span>
                                                        <button
                                                            onClick={() => alert('Starting simulation duel invite...')}
                                                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold tracking-wider uppercase text-white rounded-lg transition"
                                                        >
                                                            Challenge Me
                                                        </button>
                                                    </div>
                                                )}

                                                {/* GIF Embed */}
                                                {msg.gifUrl && (
                                                    <div className="rounded-xl overflow-hidden border border-slate-800 max-w-[250px] shadow-lg">
                                                        <img src={msg.gifUrl} alt="GIF payload" className="w-full h-auto object-cover" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Reactions Display */}
                                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                                                        <span
                                                            key={emoji}
                                                            className="bg-slate-900 border border-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 text-slate-400"
                                                        >
                                                            <span>{emoji}</span>
                                                            <span>{count}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Active typing indicator */}
                    {typingUser && (
                        <div className="px-6 py-2 bg-slate-950/80 border-t border-slate-900 flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold">{typingUser} is typing</span>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}

                    {/* Reply quote bar above input */}
                    {replyTo && (
                        <div className="px-6 py-2.5 bg-indigo-950/40 border-t border-slate-900 flex items-center justify-between">
                            <div className="flex flex-col text-xs">
                                <span className="font-bold text-indigo-400">Replying to {replyTo.sender}</span>
                                <span className="text-slate-400 truncate max-w-[400px]">{replyTo.content}</span>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Message Input Bar */}
                    <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 backdrop-blur-md">
                        {activeChat.isBlocked ? (
                            <div className="w-full py-3 bg-red-950/30 border border-red-500/20 rounded-xl text-center text-xs font-bold text-red-400 flex items-center justify-center gap-2">
                                <Ban className="w-4 h-4" /> TRANSMISSIONS DEACTIVATED: OPERATIVE BLOCKED
                            </div>
                        ) : (
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                
                                {/* Emoji toggle */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEmojiPicker(!showEmojiPicker);
                                            setShowGifPicker(false);
                                        }}
                                        className={`p-2.5 rounded-xl transition ${showEmojiPicker ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'}`}
                                        title="Pick Emoji"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>

                                    {/* Mini inline emoji picker */}
                                    <AnimatePresence>
                                        {showEmojiPicker && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute bottom-12 left-0 bg-slate-900 border border-slate-800 rounded-2xl p-3 grid grid-cols-6 gap-2 shadow-2xl z-50 w-52"
                                            >
                                                {['👍', '❤️', '😂', '🔥', '⚡', '💯', '👑', '🎉', '😮', '💻', '💡', '🏆'].map(em => (
                                                    <button
                                                        key={em}
                                                        type="button"
                                                        onClick={() => {
                                                            setInputText(prev => prev + em);
                                                            setShowEmojiPicker(false);
                                                        }}
                                                        className="hover:scale-125 transition text-base"
                                                    >
                                                        {em}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* GIF panel toggle */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowGifPicker(!showGifPicker);
                                            setShowEmojiPicker(false);
                                        }}
                                        className={`p-2.5 rounded-xl transition ${showGifPicker ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'}`}
                                        title="Send GIF"
                                    >
                                        <Image className="w-5 h-5" />
                                    </button>

                                    {/* GIFs Popover Panel */}
                                    <AnimatePresence>
                                        {showGifPicker && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute bottom-12 left-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 w-72"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-black uppercase text-indigo-400">SELECT GIF PAYLOAD</span>
                                                    <button type="button" onClick={() => setShowGifPicker(false)} className="text-slate-500 hover:text-white">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 h-48 overflow-y-auto custom-scrollbar">
                                                    {MOCK_GIFS.map(g => (
                                                        <button
                                                            key={g.name}
                                                            type="button"
                                                            onClick={() => handleSendGif(g.url)}
                                                            className="rounded-lg overflow-hidden border border-slate-800 hover:border-indigo-500 transition group h-20 relative"
                                                        >
                                                            <img src={g.url} alt={g.name} className="w-full h-full object-cover" />
                                                            <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] py-0.5 text-center font-bold truncate opacity-0 group-hover:opacity-100 transition">
                                                                {g.name}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Share stats button */}
                                <button
                                    type="button"
                                    onClick={handleShareScore}
                                    className="p-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 rounded-xl transition"
                                    title="Share Speed Result Card"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>

                                {/* Main Textarea */}
                                <textarea
                                    rows={1}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    disabled={slowModeSeconds > 0}
                                    placeholder={slowModeSeconds > 0 ? `Slow mode active. Wait ${slowModeSeconds}s...` : "Transmit message..."}
                                    className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none max-h-24 custom-scrollbar"
                                />

                                {/* Send Button */}
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || slowModeSeconds > 0}
                                    className={`p-2.5 rounded-xl transition flex items-center justify-center ${
                                        inputText.trim() && slowModeSeconds === 0
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-500/30 text-white shadow-lg shadow-indigo-500/10 hover:scale-105 active:scale-95'
                                            : 'bg-slate-800/40 border border-transparent text-slate-600 cursor-not-allowed'
                                    }`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* 3. MEMBER PANEL (Right Sidebar) */}
                <div className="w-[240px] bg-slate-900/60 backdrop-blur-xl border-l border-slate-800/80 flex flex-col z-20 shrink-0">
                    <div className="p-4 border-b border-slate-800/80">
                        <h3 className="font-extrabold text-xs tracking-widest text-slate-500 uppercase flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-400" /> ONLINE COHORTS ({MOCK_ONLINE_MEMBERS.length})
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {MOCK_ONLINE_MEMBERS.map(member => (
                            <button
                                key={member.name}
                                onClick={() => handleStartDM(member.name)}
                                className="w-full text-left p-2 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800/50 flex items-center gap-3 transition group"
                            >
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400">
                                        {member.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full absolute -bottom-0.5 -right-0.5 animate-pulse" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                                        <span className="truncate">{member.name}</span>
                                        <span className="text-[9px] text-slate-500 font-mono">{member.wpm} WPM</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[8px] font-extrabold uppercase px-1 rounded border ${member.color}`}>
                                            {member.rank}
                                        </span>
                                        <span className="text-[9px] text-slate-600 font-bold">Lvl {member.level}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CREATE PRIVATE GROUP MODAL */}
            {showGroupModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setShowGroupModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-400" /> Assemble Private Squad
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Create an encrypted direct connection with selected operatives.</p>
                        
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Squad Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="e.g. Speed Seekers"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            {/* Color Selector */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Squad Badge Accent</label>
                                <div className="flex gap-2">
                                    {[
                                        'from-indigo-500 to-pink-500',
                                        'from-cyan-400 to-blue-500',
                                        'from-emerald-400 to-teal-600',
                                        'from-amber-400 to-orange-500'
                                    ].map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setGroupColor(color)}
                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} border-2 ${groupColor === color ? 'border-white scale-105' : 'border-transparent hover:scale-105'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Members select list */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Select Members</label>
                                <div className="max-h-36 overflow-y-auto custom-scrollbar border border-slate-800 rounded-xl p-2 bg-slate-950 space-y-1">
                                    {MOCK_ONLINE_MEMBERS.map(member => {
                                        const isSelected = selectedMembers.includes(member.name);
                                        return (
                                            <button
                                                key={member.name}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedMembers(prev => prev.filter(m => m !== member.name));
                                                    } else {
                                                        setSelectedMembers(prev => [...prev, member.name]);
                                                    }
                                                }}
                                                className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition ${
                                                    isSelected ? 'bg-indigo-500/10 text-indigo-300' : 'hover:bg-slate-900 text-slate-400'
                                                }`}
                                            >
                                                <span>{member.name}</span>
                                                {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-lg shadow-indigo-500/10"
                            >
                                Initiate Squad
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* REPORT MESSAGE MODAL */}
            {showReportModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setShowReportModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-500" /> Report Transmission
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Flag offensive content or spam for operative review.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Reason</label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="spam">Spam / Bots</option>
                                    <option value="harassment">Harassment / Bullying</option>
                                    <option value="toxic">Toxic Language / Hate speech</option>
                                    <option value="other">Other Violation</option>
                                </select>
                            </div>
                            <button
                                onClick={handleSubmitReport}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-lg shadow-red-500/10"
                            >
                                Submit Incident Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PINNED MESSAGES MODAL */}
            {showPinModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
                        <button
                            onClick={() => setShowPinModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                            <Pin className="w-5 h-5 text-amber-500" /> Pinned Grids ({rooms.find(r => r.id === activeChat.id)?.pinnedCount || 0})
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Operative bookmarks for this grid channel.</p>

                        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                            {activeMessages.filter(m => m.isPinned).length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">No pinned transmissions found in this channel.</p>
                            ) : (
                                activeMessages.filter(m => m.isPinned).map(msg => (
                                    <div key={msg.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-indigo-400">{msg.sender}</span>
                                                <span className="text-[8px] text-slate-600">{msg.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-300 whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <button
                                            onClick={() => handlePinMessage(msg)}
                                            className="text-slate-500 hover:text-red-400 p-1"
                                            title="Unpin"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
