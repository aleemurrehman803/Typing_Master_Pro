import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send, Mic, MicOff, Plus, Minus, FileText, Heart, Volume2, VolumeX, Image as ImageIcon } from 'lucide-react';

import useAuthStore from '../store/useAuthStore';
import JennyAI from '../utils/JennyAI';

// Import the real Jenny image
import jennyReal from '../assets/jenny_real.jpg';

const LiveChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewState, setViewState] = useState('normal');
    const [autoSpeak, setAutoSpeak] = useState(true); // Default to auto-speaking

    const { user } = useAuthStore();
    const jennyAI = new JennyAI(user);

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'jenny',
            text: "Hi there! 😘 I'm Jenny, your personal Typing Coach!\n\nI'm here to help you master your lessons, fix those mistakes, and boost your WPM! 🚀",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && viewState !== 'minimized') {
            inputRef.current?.focus();
        }
    }, [isOpen, viewState]);

    // --- SOUND ENGINE ---
    const speakMessage = (text) => {
        // Stop any current speech first to prevent overlap
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.1; // Slightly higher pitch for a female voice

        // Try to find a high-quality female voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice =>
            voice.name.includes('Google US English') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Female')
        );
        if (femaleVoice) utterance.voice = femaleVoice;

        window.speechSynthesis.speak(utterance);
    };

    // Auto-speak effect for new Jenny messages
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (autoSpeak && lastMessage && lastMessage.sender === 'jenny') {
            speakMessage(lastMessage.text);
        }
    }, [messages, autoSpeak]);

    // Stop speech when chat closes
    useEffect(() => {
        if (!isOpen) {
            window.speechSynthesis.cancel();
        }
    }, [isOpen]);

    // Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleVoiceInput = () => {
        if (!recognitionRef.current) return alert('Voice input not supported in this browser! 🎤');
        isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
        setIsListening(!isListening);
    };

    // File Upload Handler
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileUrl = event.target.result;
            const isImage = file.type.startsWith('image/');
            const isPdf = file.type === 'application/pdf';

            const userMsg = {
                id: Date.now(),
                sender: 'user',
                text: isPdf ? `I uploaded a PDF: ${file.name} 📄` : "Here's an image! 📸",
                image: isImage ? fileUrl : null,
                fileType: isPdf ? 'pdf' : 'image',
                fileName: file.name,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMsg]);

            setIsTyping(true);
            setTimeout(() => {
                const jennyMsg = {
                    id: Date.now() + 1,
                    sender: 'jenny',
                    text: isPdf ? "Thanks for the PDF! 📄 I'll analyze it right away." : "Wow, nice picture! 📸 You look great!",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, jennyMsg]);
                setIsTyping(false);
            }, 1500);
        };
        reader.readAsDataURL(file);
    };

    // --- JENNY'S EXPERT KNOWLEDGE BASE ---
    const typingAdvice = {
        wpm: [
            "To increase your WPM, focus on rhythm! 🎵 Don't rush. Smooth is fast!",
            "Keep your hands floating above the keys! 🎹",
            "Look ahead at the next word while typing the current one. It's a pro secret! 🤫"
        ],
        accuracy: [
            "Accuracy is WAY more important than speed! 🎯 If you make mistakes, you lose time fixing them.",
            "Aim for 100% accuracy first. Speed will come naturally. ✨",
            "If you keep missing a key, practice just that letter. You got this! 💪"
        ],
        mistakes: [
            "Mistakes are just learning opportunities! 📚",
            "Slow down a tiny bit to get that perfect score! 🌟",
            "Analyze your mistakes: are they mostly on the left hand or right hand? 🤔"
        ],
        lessons: [
            "Consistency is key! 🗝️ 10 minutes a day works wonders.",
            "Have you tried the advanced lessons yet? They are tough but rewarding! 🏆",
            "Remember to stretch your fingers! 🧘‍♀️"
        ],
        flirty_support: [
            "You're doing amazing! I'm so proud of you! 💖",
            "Keep going! I love seeing you improve! 🔥",
            "You're my favorite student! 🤫😉",
            "Wow, your dedication is attractive! 😍"
        ]
    };

    const getJennyResponse = (input) => {
        const text = input.toLowerCase();

        if (text.includes('who are you')) return "I'm Jenny! 💁‍♀️ Your sweet, smart, and supportive typing assistant.";
        if (text.includes('love you')) return "Aww, stop it! You're making me blush! 😊";
        if (text.includes('beautiful') || text.includes('hot') || text.includes('pretty')) return "You're so sweet! 🥰 I try my best!";
        if (text.includes('hi') || text.includes('hello')) return "Hey there, handsome! ...I mean, student! 😉 Ready to type?";

        if (text.includes('wpm') || text.includes('speed')) return typingAdvice.wpm[Math.floor(Math.random() * typingAdvice.wpm.length)];
        if (text.includes('accuracy') || text.includes('mistake')) return typingAdvice.accuracy[Math.floor(Math.random() * typingAdvice.accuracy.length)];
        if (text.includes('lesson')) return typingAdvice.lessons[Math.floor(Math.random() * typingAdvice.lessons.length)];

        if (text.includes('how did i do') || text.includes('score')) return "I'm looking at your stats... 🧐 You're improving! Let's try one more test together? 🎉";

        return typingAdvice.flirty_support[Math.floor(Math.random() * typingAdvice.flirty_support.length)];
    };

    // AI-Powered Performance Analysis
    const analyzeMyPerformance = () => {
        const recentTests = JSON.parse(localStorage.getItem('recent_tests') || '[]')
            .filter(test => test.userId === user?.id)
            .slice(-10);

        if (recentTests.length === 0) {
            return "I don't see any recent tests! 📊 Take a typing test so I can analyze your performance!";
        }

        const latestTest = recentTests[recentTests.length - 1];
        const prediction = jennyAI.predictFuturePerformance(recentTests);
        const weakFingers = jennyAI.detectWeakFingers(latestTest.errors || []);
        const commonMistakes = jennyAI.findCommonMistakes(recentTests);

        let response = `📊 **Performance Analysis**\n\n`;
        response += `Latest: ${latestTest.wpm} WPM @ ${latestTest.accuracy}% accuracy\n\n`;

        if (prediction) {
            response += `📈 Trend: Your speed is ${prediction.wpmTrend}!\n`;
            response += `🎯 Next Milestone: ${prediction.nextMilestone} WPM in ~${prediction.daysToMilestone || '?'} days\n\n`;
        }

        if (weakFingers.length > 0) {
            response += `👆 Weak Fingers: ${weakFingers.map(([f]) => f).join(', ')}\n`;
        }

        if (commonMistakes.length > 0) {
            response += `❌ Common Mistakes: ${commonMistakes.slice(0, 3).map(m => m.pattern).join(', ')}\n\n`;
        }

        response += `💡 Keep practicing! You're doing great! 🚀`;
        return response;
    };

    const generateDrillForMe = () => {
        const recentTests = JSON.parse(localStorage.getItem('recent_tests') || '[]')
            .filter(test => test.userId === user?.id)
            .slice(-5);

        if (recentTests.length === 0) {
            return "Take a test first, then I'll create a custom drill for you! 💪";
        }

        const allErrors = recentTests.flatMap(t => t.errors || []);
        const weakWords = jennyAI.generateCustomDrill(allErrors, []);

        if (weakWords.length === 0) {
            return "You're perfect! No mistakes to practice! 🌟 (Or take more tests!)";
        }

        return `🎯 **Custom Drill**\n\nPractice these words you struggled with:\n\n${weakWords.slice(0, 10).join(', ')}\n\nType each word 10 times slowly, then speed up! 💪`;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: inputMessage, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        const currentMessage = inputMessage;
        setInputMessage('');
        setIsTyping(true);

        setTimeout(() => {
            let response;

            // Check for AI commands
            if (currentMessage.toLowerCase().includes('analyze') || currentMessage.toLowerCase().includes('how am i doing')) {
                response = analyzeMyPerformance();
            } else if (currentMessage.toLowerCase().includes('drill') || currentMessage.toLowerCase().includes('practice')) {
                response = generateDrillForMe();
            } else if (currentMessage.toLowerCase().includes('goal') || currentMessage.toLowerCase().includes('predict')) {
                const recentTests = JSON.parse(localStorage.getItem('recent_tests') || '[]')
                    .filter(test => test.userId === user?.id)
                    .slice(-10);
                const prediction = jennyAI.predictFuturePerformance(recentTests);
                response = prediction
                    ? `🔮 Based on your progress, you'll hit ${prediction.nextMilestone} WPM in about ${prediction.daysToMilestone || '?'} days! Keep it up! 🚀`
                    : "Take more tests so I can predict your future! 🔮";
            } else {
                response = getJennyResponse(currentMessage);
            }

            const jennyMsg = { id: Date.now() + 1, sender: 'jenny', text: response, timestamp: new Date() };
            setMessages(prev => [...prev, jennyMsg]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000);
    };

    // UI Classes
    const getContainerClasses = () => {
        if (viewState === 'minimized') return 'fixed bottom-6 right-6 w-80 h-16 rounded-2xl';
        if (viewState === 'expanded') return 'fixed inset-4 md:inset-10 rounded-2xl z-50';
        return 'fixed bottom-6 right-6 w-96 h-[600px] rounded-2xl';
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 group">
                <div className="relative">
                    <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-pink-500 to-rose-600 text-white p-1 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 border-4 border-white">
                        <img src={jennyReal} alt="Jenny" className="w-14 h-14 rounded-full object-cover" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce border-2 border-white">
                        1
                    </div>
                </div>
            </button>
        );
    }

    return (
        <>
            {viewState === 'expanded' && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setViewState('normal')} />}

            <div className={`${getContainerClasses()} bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-pink-200 dark:border-pink-900 overflow-hidden transition-all duration-300 z-50 flex flex-col font-sans`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 p-4 flex items-center justify-between shrink-0 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer">
                            <img src={jennyReal} alt="Jenny" className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg flex items-center gap-1 tracking-wide">
                                Jenny <Heart className="w-4 h-4 text-pink-200 fill-pink-200 animate-pulse" />
                            </h3>
                            <p className="text-xs text-pink-100 font-medium opacity-90">Your Typing Coach 🚀</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Auto-Speak Toggle */}
                        <button
                            onClick={() => setAutoSpeak(!autoSpeak)}
                            className={`p-1.5 rounded-full transition-colors ${autoSpeak ? 'text-white bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                            title={autoSpeak ? "Mute Voice" : "Enable Voice"}
                        >
                            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>

                        <div className="h-6 w-px bg-white/20 mx-1"></div>

                        {viewState !== 'minimized' && <button onClick={() => setViewState('minimized')} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Minus className="w-5 h-5" /></button>}
                        {viewState === 'minimized' ?
                            <button onClick={() => setViewState('normal')} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Maximize2 className="w-5 h-5" /></button> :
                            viewState === 'normal' ?
                                <button onClick={() => setViewState('expanded')} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Maximize2 className="w-5 h-5" /></button> :
                                <button onClick={() => setViewState('normal')} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Minimize2 className="w-5 h-5" /></button>
                        }
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Chat Area */}
                {viewState !== 'minimized' && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50 dark:bg-slate-800/50 scroll-smooth">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
                                    {message.sender === 'jenny' && (
                                        <img src={jennyReal} alt="Jenny" className="w-9 h-9 rounded-full border border-pink-200 shadow-sm self-end mb-1 object-cover" />
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm relative group transition-all hover:shadow-md ${message.sender === 'user'
                                        ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-br-sm'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm border border-slate-100 dark:border-slate-700'
                                        }`}>
                                        {message.image && (
                                            <img src={message.image} alt="Uploaded" className="rounded-xl mb-3 max-w-full border border-white/20" />
                                        )}
                                        {message.fileType === 'pdf' && (
                                            <div className="flex items-center gap-3 bg-black/5 p-3 rounded-xl mb-3">
                                                <FileText className="w-8 h-8 opacity-70" />
                                                <span className="text-sm font-medium truncate opacity-90">{message.fileName}</span>
                                            </div>
                                        )}
                                        <p className="text-[15px] leading-relaxed whitespace-pre-line tracking-wide">{message.text}</p>

                                        {/* Manual Play Button (Hidden unless hovered) */}
                                        <button
                                            onClick={() => speakMessage(message.text)}
                                            className={`absolute -right-8 bottom-0 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 ${message.sender === 'user' ? 'hidden' : 'bg-white shadow-sm text-pink-500'
                                                }`}
                                            title="Replay Voice"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-3 animate-pulse">
                                    <img src={jennyReal} alt="Jenny" className="w-9 h-9 rounded-full border border-pink-200 shadow-sm self-end mb-1 object-cover" />
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-t border-pink-100 dark:border-slate-600">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => {
                                        const analysis = analyzeMyPerformance();
                                        setMessages(prev => [...prev,
                                        { id: Date.now(), sender: 'user', text: 'Analyze my performance', timestamp: new Date() },
                                        { id: Date.now() + 1, sender: 'jenny', text: analysis, timestamp: new Date() }
                                        ]);
                                    }}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 rounded-full text-sm font-bold hover:shadow-md transition-all whitespace-nowrap border border-pink-200 dark:border-pink-900 hover:scale-105"
                                >
                                    📊 Analyze Performance
                                </button>
                                <button
                                    onClick={() => {
                                        const drill = generateDrillForMe();
                                        setMessages(prev => [...prev,
                                        { id: Date.now(), sender: 'user', text: 'Generate drill', timestamp: new Date() },
                                        { id: Date.now() + 1, sender: 'jenny', text: drill, timestamp: new Date() }
                                        ]);
                                    }}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 rounded-full text-sm font-bold hover:shadow-md transition-all whitespace-nowrap border border-purple-200 dark:border-purple-900 hover:scale-105"
                                >
                                    🎯 Custom Drill
                                </button>
                                <button
                                    onClick={() => {
                                        const warmup = jennyAI.getDailyWarmup(user?.stats?.bestWpm || 0);
                                        setMessages(prev => [...prev,
                                        { id: Date.now(), sender: 'user', text: 'Daily warmup', timestamp: new Date() },
                                        { id: Date.now() + 1, sender: 'jenny', text: `🌅 **Daily Warm-Up**\n\nType this slowly 3 times:\n\n${warmup.join('\n')}\n\nThen speed up! 🔥`, timestamp: new Date() }
                                        ]);
                                    }}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-bold hover:shadow-md transition-all whitespace-nowrap border border-indigo-200 dark:border-indigo-900 hover:scale-105"
                                >
                                    🌅 Daily Warm-Up
                                </button>
                            </div>
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex gap-3 items-center bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-pink-500/50 focus-within:border-pink-500 transition-all shadow-inner">
                                {/* Plus Button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 rounded-full text-slate-500 hover:bg-white hover:text-pink-500 hover:shadow-sm transition-all duration-300"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFileUpload}
                                />

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-0 px-2 py-2 focus:ring-0 text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                                />

                                <button type="button" onClick={toggleVoiceInput} className={`p-2.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md' : 'text-slate-400 hover:text-pink-500 hover:bg-white'}`}>
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>

                                <button type="submit" disabled={!inputMessage.trim()} className="p-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:scale-105 active:scale-95">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </>
    );
};

export default LiveChat;
