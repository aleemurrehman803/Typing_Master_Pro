import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import useTypingEngine from '../hooks/useTypingEngine';
import TypingArea from '../components/features/TypingArea';
import StatsDisplay from '../components/features/StatsDisplay';
import SpeedChallenge from '../components/features/SpeedChallenge';
import { checkAchievements } from '../utils/achievements';
import { getLessonById } from '../utils/lessons';
import useAuthStore from '../store/useAuthStore';
import useSettingsStore from '../store/useSettingsStore';
import JennyAI from '../utils/JennyAI';
import jennyReal from '../assets/jenny_real.jpg';
import { useVoiceDictation } from '../hooks/useVoiceDictation';
import { isFeatureEnabled } from '../utils/featureFlags';
import { RefreshCw, Trophy, ArrowLeft, BookOpen, Edit3, List, Code, EyeOff, Sparkles, Skull, Mic, MicOff, Terminal, Volume2, VolumeX, Flame } from 'lucide-react';
import { CODE_SNIPPETS } from '../utils/testContent';
import { getAdaptiveText, getAdaptiveDifficulty, getDifficultyMeta } from '../utils/adaptiveDifficulty';
import KeyboardVisualization from '../components/features/KeyboardVisualization';
import { MULTI_LANG_PARAGRAPHS } from '../utils/languageContent';
import { secureStorage } from '../utils/security';
import { calculateNextDrill } from '../utils/tutor';
import { detectKeyboardPolling } from '../utils/hardware';
import { ShieldCheck, ShieldAlert, Zap, Cpu, BrainCircuit, Loader2, Wand2, Keyboard, ToggleLeft } from 'lucide-react';
import { generateAIParagraph, saveAIDrill, loadSavedDrills } from '../utils/aiGenerator';
import { soundEngine } from '../utils/soundEngine';
import DynamicBackground from '../components/features/DynamicBackground';
import SEOHead from '../components/SEOHead';

// --- EXPANDED 42 CURATED PARAGRAPHS (varied lengths per difficulty) ---
const PRESET_PARAGRAPHS = {
    beginner: [
        { id: 'b1', title: 'The Cat', text: "The cat sat on the mat. It was a sunny day outside. The cat looked happy and content." },
        { id: 'b2', title: 'My Dog', text: "My dog loves to run in the park every morning. He chases a red ball and barks at the birds." },
        { id: 'b3', title: 'Apples', text: "Apples are red and green. They taste sweet and are full of vitamins that are good for you." },
        { id: 'b4', title: 'The Sun', text: "The sun rises in the east and sets in the west. It gives us light, warmth, and energy every single day." },
        { id: 'b5', title: 'Reading', text: "I like reading books before bed. Stories carry me to new places and introduce me to amazing characters." },
        { id: 'b6', title: 'Coffee', text: "Coffee smells wonderful in the morning. Many people drink it to wake up and start their day feeling alert." },
        { id: 'b7', title: 'Rain', text: "Rain falls from dark clouds above. It waters the plants, fills the rivers, and makes the grass bright green." },
        { id: 'b8', title: 'The Ocean', text: "The ocean is deep and wide. Waves crash on the shore while seagulls fly above and fish swim far below the surface." },
        { id: 'b9', title: 'Cooking', text: "Cooking at home is fun and saves money. You can make fresh meals with vegetables, pasta, and spices you enjoy." },
        { id: 'b10', title: 'Seasons', text: "There are four seasons in a year. Spring brings flowers, summer brings heat, autumn brings falling leaves, and winter brings snow." },
        { id: 'b11', title: 'Music', text: "Music makes everyday tasks more enjoyable. Listening to your favorite songs while working can lift your mood and boost your energy." },
        { id: 'b12', title: 'Bicycles', text: "Riding a bicycle is great exercise. It helps you stay fit, explore your neighborhood, and reduces pollution in the city." },
        { id: 'b13', title: 'The Moon', text: "The moon glows softly at night. It reflects sunlight and moves through phases from a thin crescent to a bright full circle." },
        { id: 'b14', title: 'Gardens', text: "Gardens are peaceful places. Growing tomatoes, herbs, and flowers teaches patience and gives you fresh produce for the kitchen table." },
        { id: 'b15', title: 'Friends', text: "True friends support you when life gets hard. They listen, make you laugh, and remind you of your worth when you forget." }
    ],
    intermediate: [
        { id: 'i1', title: 'Technology', text: "Technology fundamentally changes how we live and work. Computers and smartphones connect billions of people instantly, reshaping commerce, education, and communication across every corner of the globe." },
        { id: 'i2', title: 'Travel', text: "Traveling to new countries is a deeply enriching experience. Immersing yourself in different cultures, cuisines, and languages broadens your perspective and challenges assumptions you never knew you held." },
        { id: 'i3', title: 'Music Theory', text: "Music has the remarkable power to alter our emotional state within seconds. Tempo, harmony, and melody work together to evoke joy, nostalgia, or melancholy without a single spoken word being needed." },
        { id: 'i4', title: 'Space', text: "Space is incomprehensibly vast and largely unexplored. Astronomers estimate the observable universe contains over two trillion galaxies, each holding hundreds of billions of stars with planets orbiting them." },
        { id: 'i5', title: 'Forests', text: "Forests are the ecological backbone of our planet. Beyond producing oxygen, they regulate rainfall patterns, shelter millions of species, and store enormous quantities of carbon that would otherwise warm our atmosphere." },
        { id: 'i6', title: 'History', text: "Studying history equips us to understand the forces shaping the present. Examining past revolutions, innovations, and conflicts reveals repeating patterns that help us navigate contemporary political and social challenges." },
        { id: 'i7', title: 'Sports Science', text: "Modern sports science has transformed athletic performance. Data analytics, nutrition protocols, and sleep optimization allow athletes today to routinely surpass records that previous generations considered the absolute limits of human capability." },
        { id: 'i8', title: 'Psychology', text: "Human psychology is far more complex than we typically acknowledge. Cognitive biases, emotional regulation, and social influences shape our decisions in profound ways that we are largely unaware of in the moment." },
        { id: 'i9', title: 'Economics', text: "Markets are decentralized information-processing systems of remarkable efficiency. Prices aggregate the dispersed knowledge of millions of participants into a single signal that guides production, allocation, and consumption across entire economies." },
        { id: 'i10', title: 'Architecture', text: "Great architecture solves multiple problems simultaneously. A well-designed building must be structurally sound, energy efficient, aesthetically pleasing, and responsive to the lives and movements of the people who inhabit it daily." },
        { id: 'i11', title: 'Nutrition', text: "The food we eat acts as information for our cells. Whole foods rich in micronutrients, fiber, and antioxidants support brain function, hormone balance, and immune resilience in ways that processed alternatives simply cannot replicate." },
        { id: 'i12', title: 'Entrepreneurship', text: "Building a startup requires navigating relentless uncertainty with limited resources. The most successful founders combine genuine customer empathy with rigorous experimentation, treating each failure as a data point rather than a verdict." },
        { id: 'i13', title: 'Climate', text: "Climate change is the defining environmental challenge of our era. Transitioning energy systems from fossil fuels to renewable sources demands unprecedented coordination across governments, corporations, and billions of individual consumers worldwide." },
        { id: 'i14', title: 'Neuroscience', text: "The brain contains approximately eighty-six billion neurons forming trillions of synaptic connections. This electrochemical network generates consciousness, memory, language, and creativity through mechanisms that neuroscience is only beginning to decode." },
        { id: 'i15', title: 'Philosophy', text: "Philosophy trains the mind to examine assumptions most people accept without question. Rigorous analysis of concepts like justice, knowledge, and consciousness reveals hidden complexities that have profound practical implications for how we organize society." }
    ],
    hard: [
        { id: 'h1', title: 'Quantum Mechanics', text: "Quantum mechanics describes the behavior of particles at subatomic scales where classical intuitions completely break down. Wave-particle duality, superposition, and entanglement reveal a universe fundamentally probabilistic rather than deterministic in nature, challenging every philosophical assumption about reality." },
        { id: 'h2', title: 'Socratic Method', text: "The Socratic method uses disciplined questioning to expose hidden assumptions within seemingly confident beliefs. By pursuing relentless logical examination of foundational concepts, Socrates demonstrated that wisdom begins with acknowledging the precise boundaries of what one genuinely does not know." },
        { id: 'h3', title: 'Machine Learning', text: "Modern machine learning systems discover statistical patterns in vast datasets without explicit programming. Backpropagation through deep neural networks adjusts millions of parameters iteratively, enabling models to recognize images, translate languages, and generate coherent text with superhuman accuracy on narrow benchmarks." },
        { id: 'h4', title: 'Climate Systems', text: "Earth's climate system consists of interlocking feedback loops spanning the atmosphere, oceans, ice sheets, and biosphere. Anthropogenic greenhouse gas emissions are disrupting these finely balanced cycles at geologically unprecedented rates, with cascading consequences that are difficult to model with precision." },
        { id: 'h5', title: 'Macroeconomics', text: "Macroeconomic systems emerge from the aggregate interactions of billions of individual decisions, making them inherently complex and resistant to simple interventions. Central banks navigate the tension between controlling inflation and sustaining employment using imperfect models that capture only a fraction of real economic dynamics." },
        { id: 'h6', title: 'Neuroplasticity', text: "The brain exhibits remarkable plasticity throughout life, continually reorganizing its synaptic architecture in response to experience and learning. Hebbian strengthening of frequently activated neural pathways underlies skill acquisition, while competitive pruning eliminates connections that fall into disuse, sculpting expertise from repetition." },
        { id: 'h7', title: 'Cryptography', text: "Modern public-key cryptography rests on the computational asymmetry between multiplying large prime numbers and factoring their product. RSA encryption exploits this mathematical trapdoor to secure digital communications, though the advent of sufficiently powerful quantum computers would render existing protocols obsolete overnight." },
        { id: 'h8', title: 'Thermodynamics', text: "The second law of thermodynamics states that entropy in a closed system never spontaneously decreases. This profound constraint implies a thermodynamic arrow of time, explains why engines cannot achieve perfect efficiency, and underpins our understanding of why complexity and order are thermodynamically costly to maintain." },
        { id: 'h9', title: 'Evolutionary Biology', text: "Natural selection acts on heritable variation in reproductive fitness, accumulating adaptive traits across generations without foresight or design. The extraordinary complexity of biological systems from the genetic code to the vertebrate eye emerges from this blind iterative process operating over millions of years of geological time." },
        { id: 'h10', title: 'General Relativity', text: "Einstein's general relativity describes gravity not as a force but as the curvature of spacetime caused by mass and energy. Massive objects warp the fabric of spacetime around them, and other bodies follow geodesic paths through this curved geometry, an effect we experience as gravitational attraction between objects." },
        { id: 'h11', title: 'Linguistics', text: "Noam Chomsky's universal grammar hypothesis proposes that the capacity for language is biologically innate, with all human languages sharing a deep generative structure. Children acquire complex syntax with minimal explicit instruction, suggesting the brain contains specialized neural machinery dedicated to linguistic computation from birth." },
        { id: 'h12', title: 'Distributed Systems', text: "Building reliable distributed systems requires confronting the fundamental impossibility results of computer science. The CAP theorem proves no distributed data store can simultaneously guarantee consistency, availability, and partition tolerance, forcing architects to make deliberate tradeoffs based on specific application requirements and failure scenarios." }
    ]
};

// --- Duration-to-target-character-count mapping ---
const DURATION_CHAR_TARGETS = { 30: 250, 60: 500, 180: 1500, 300: 2500 };

const scaleTextToDuration = (text, duration) => {
    const target = DURATION_CHAR_TARGETS[duration] || 500;
    if (text.length >= target) return text;
    // Repeat/concatenate text until we meet the target length
    let scaled = text;
    while (scaled.length < target) {
        scaled += ' ' + text;
    }
    return scaled.trim();
};

const Test = () => {
    const { user, addAchievement, updateStats, updateLessonProgress, currentLevel } = useAuthStore();
    const { 
        caretStyle, setCaretStyle, 
        language, setLanguage, 
        soundProfile, setSoundProfile, 
        visualTheme, setVisualTheme,
        keyboardLayout, setKeyboardLayout,
        emulateLayout, setEmulateLayout
    } = useSettingsStore();

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const lessonId = searchParams.get('lesson');
    const lesson = lessonId ? getLessonById(lessonId) : null;
    const adaptiveText = location.state?.adaptiveText;

    const [duration, setDuration] = useState(lesson ? 3600 : 60); // 3600s = 1 hour for lessons (unlimited learning)
    const [mode, setMode] = useState(adaptiveText ? 'custom' : 'preset'); // 'preset', 'custom', 'code'
    const [difficulty, setDifficulty] = useState('beginner'); // or language in code mode
    const [selectedParagraphId, setSelectedParagraphId] = useState('b1');
    const [customText, setCustomText] = useState(adaptiveText || '');
    
    // Feature 6: AI Generation State
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiGeneratedText, setAiGeneratedText] = useState('');
    const [savedDrills, setSavedDrills] = useState(() => loadSavedDrills());
    const [showSavedDrills, setShowSavedDrills] = useState(false);
    const [aiSaveSuccess, setAiSaveSuccess] = useState(false);

    // Paragraph deduplication history
    const playedIdsRef = useRef([]);

    const [isFocusMode, setIsFocusMode] = useState(false);

    // Deep Focus: toggle body CSS class so non-essential UI dims out
    useEffect(() => {
        if (isFocusMode) {
            document.body.classList.add('typing-focus-active');
        } else {
            document.body.classList.remove('typing-focus-active');
        }
        return () => document.body.classList.remove('typing-focus-active');
    }, [isFocusMode]);

    // Feature 13: Hardware Stats State
    const [hardware, setHardware] = useState(null);

    useEffect(() => {
        detectKeyboardPolling().then(stats => setHardware(stats));
    }, []);

    // Sudden Death States
    const [isSuddenDeath, setIsSuddenDeath] = useState(false);
    const [failedSuddenDeath, setFailedSuddenDeath] = useState(false);
    const [failedAccuracy, setFailedAccuracy] = useState(false); // 🔒 Level 1: Accuracy Lock State

    // 👻 Feature 2: Ghost Typing Mode
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [ghostIndex, setGhostIndex] = useState(-1);

    // 💀 Feature 28: Survival Boss Mode
    const [isBossMode, setIsBossMode] = useState(false);
    const [bossIndex, setBossIndex] = useState(-1);
    const [failedBossFight, setFailedBossFight] = useState(false);

    // 🎯 Level 2: Adaptive Difficulty
    const [isAdaptiveMode, setIsAdaptiveMode] = useState(false);
    const [adaptiveDiff, setAdaptiveDiff] = useState('beginner');

    // Update adaptive difficulty whenever user stats change
    useEffect(() => {
        if (isAdaptiveMode && user?.stats) {
            const diff = getAdaptiveDifficulty(user.stats);
            setAdaptiveDiff(diff);
        }
    }, [isAdaptiveMode, user?.stats]);

    // 🎯 Level 2: Speed Challenge State
    const [speedTarget, setSpeedTarget] = useState(null);

    // Feature 38: Initialize Sound Engine
    useEffect(() => {
        soundEngine.init();
        soundEngine.setProfile(soundProfile);
    }, [soundProfile]);

    const caretStyles = ['beam', 'block', 'underline', 'smooth'];
    const handleCaretCycle = () => {
        const nextIndex = (caretStyles.indexOf(caretStyle) + 1) % caretStyles.length;
        setCaretStyle(caretStyles[nextIndex]);
    };

    const visualThemes = ['default', 'matrix', 'stars'];
    const handleThemeCycle = () => {
        const nextIndex = (visualThemes.indexOf(visualTheme) + 1) % visualThemes.length;
        setVisualTheme(visualThemes[nextIndex]);
    };

    const soundProfiles = ['silent', 'mechanical', 'soft', 'retro'];
    const handleSoundCycle = () => {
        const nextIndex = (soundProfiles.indexOf(soundProfile) + 1) % soundProfiles.length;
        setSoundProfile(soundProfiles[nextIndex]);
    };

    const keyboardLayouts = ['qwerty', 'dvorak', 'colemak'];
    const handleLayoutCycle = () => {
        const nextIndex = (keyboardLayouts.indexOf(keyboardLayout) + 1) % keyboardLayouts.length;
        setKeyboardLayout(keyboardLayouts[nextIndex]);
    };

    // Determine current text — with duration-based scaling for preset mode
    const getCurrentText = useCallback(() => {
        if (lesson) return lesson.content || lesson.text || "";
        if (mode === 'custom') return customText || "Please enter some custom text to begin.";
        if (mode === 'ai') return aiGeneratedText || "AI generated text will appear here.";
        if (mode === 'adaptive') return getAdaptiveText(user?.stats) || "Practice text not available.";

        if (mode === 'code') {
            const lang = ['javascript', 'python', 'html', 'css', 'rust', 'go', 'typescript', 'sql', 'java', 'cpp', 'bash'].includes(difficulty) ? difficulty : 'javascript';
            const snippets = CODE_SNIPPETS[lang];
            const s = snippets ? snippets.find(p => p.id === selectedParagraphId) : null;
            return s ? (s.content || s.text) : (snippets ? (snippets[0].content || snippets[0].text) : "Code snippet not found.");
        }

        // Feature 4: Multi-Language Switcher
        const sourceParagraphs = language === 'en' ? PRESET_PARAGRAPHS : MULTI_LANG_PARAGRAPHS[language];
        const allParagraphs = [...(sourceParagraphs.beginner||[]), ...(sourceParagraphs.intermediate||[]), ...(sourceParagraphs.hard||[])];
        const p = allParagraphs.find(p => p.id === selectedParagraphId);
        const baseText = p ? (p.content || p.text) : (sourceParagraphs.beginner ? (sourceParagraphs.beginner[0].content || sourceParagraphs.beginner[0].text) : "No content found.");
        // Apply duration-based scaling for preset paragraphs
        return scaleTextToDuration(baseText, duration);
    }, [lesson, mode, customText, selectedParagraphId, difficulty, language, user?.stats, duration]);

    const currentText = getCurrentText();

    const {
        timeLeft,
        isActive,
        isFinished,
        typedText,
        wpm,
        accuracy,
        errors,
        failedByAccuracy, // 🔒 Level 1
        integrity,
        nGrams,
        keystrokes,
        handleInput: onInput,
        resetTest,
        startTest,
        finishTest // Feature: Manual Finish
    } = useTypingEngine(currentText, duration);

    // Feature 38: Wrapped Input for Sound Engine
    const handleInput = useCallback((val) => {
        // Trigger Sound Engine
        soundEngine.playClick(val.endsWith(' '));
        onInput(val);
    }, [onInput]);

    // Feature 6: Generation Handler — now calls real HF API
    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGeneratingAI(true);
        try {
            const result = await generateAIParagraph(aiPrompt);
            setAiGeneratedText(result);
            setMode('ai');
        } catch (error) {
            console.error("AI Generation Error:", error);
            setAiGeneratedText("Unable to generate text at this time. Please try again.");
            setMode('ai');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Save current AI drill
    const handleSaveAIDrill = useCallback(() => {
        if (!aiGeneratedText || !aiPrompt) return;
        const ok = saveAIDrill(aiPrompt, aiGeneratedText);
        if (ok) {
            setSavedDrills(loadSavedDrills());
            setAiSaveSuccess(true);
            setTimeout(() => setAiSaveSuccess(false), 2000);
        }
    }, [aiGeneratedText, aiPrompt]);

    // Load a saved drill back into the test
    const handleLoadSavedDrill = useCallback((drill) => {
        setAiPrompt(drill.prompt);
        setAiGeneratedText(drill.text);
        setMode('ai');
        setShowSavedDrills(false);
        setTimeout(() => { resetTest(); startTest(); }, 50);
    }, [resetTest, startTest]);

    // AI Prompt style pill presets
    const AI_STYLE_PILLS = [
        { label: '📘 Academic', suffix: ' in academic essay style' },
        { label: '🚀 Sci-Fi', suffix: ' set in a futuristic sci-fi universe' },
        { label: '⚕️ Medical', suffix: ' using medical and clinical terminology' },
        { label: '🎸 Creative', suffix: ' in a vivid, creative storytelling style' },
        { label: '📊 Business', suffix: ' in a professional business context' },
        { label: '🧪 Scientific', suffix: ' with scientific precision and vocabulary' },
        { label: '🗺️ Historical', suffix: ' from a historical perspective' },
        { label: '💻 Technical', suffix: ' for software developers' },
    ];

    // Feature: Voice Dictation Integration (Phase 6)
    const {
        isListening,
        isSupported: isVoiceSupported,
        startListening,
        stopListening
    } = useVoiceDictation((text) => {
        // Append voice text to current input, ensuring we don't append if finished
        if (!isFinished) {
            handleInput(typedText + text);
        }
    });

    // Feature 15: Calculate Heatmap Data
    const getHeatMapData = useCallback(() => {
        if (!isFinished || !typedText) return null;
        
        const stats = {};
        for(let i=0; i<typedText.length; i++) {
            const expected = currentText[i];
            const actual = typedText[i];
            if (!expected) continue;
            
            const c = expected.toLowerCase();
            if (!stats[c]) stats[c] = { total: 0, errors: 0 };
            stats[c].total++;
            if (actual !== expected) {
                stats[c].errors++;
            }
        }
        const heatMap = {};
        for(const c in stats) {
            heatMap[c] = stats[c].errors / stats[c].total;
        }
        return heatMap;
    }, [isFinished, typedText, currentText]);

    // 👻 Ghost Mode Logic
    useEffect(() => {
        let ghostInterval;
        if (isActive && !isFinished && isGhostMode) {
            const ghostWPM = user?.stats?.highestWPM || 40;
            const charsPerSecond = (ghostWPM * 5) / 60;
            const updateRateMs = 100; // Update 10x per second
            const charsPerUpdate = charsPerSecond / (1000 / updateRateMs);

            ghostInterval = setInterval(() => {
                setGhostIndex(prev => {
                    const next = prev < 0 ? 0 : prev + charsPerUpdate;
                    return Math.min(next, currentText.length);
                });
            }, updateRateMs);
        } else if (!isActive) {
            setGhostIndex(-1);
        }

        return () => clearInterval(ghostInterval);
    }, [isActive, isFinished, isGhostMode, user, currentText.length]);

    // 💀 Feature 28: Survival Boss Mode Logic
    useEffect(() => {
        let bossInterval;
        if (isActive && !isFinished && isBossMode) {
            const bossWPM = (user?.stats?.highestWPM || 40) + 5; // Boss is relentless
            const charsPerSecond = (bossWPM * 5) / 60;
            const updateRateMs = 100;
            const charsPerUpdate = charsPerSecond / (1000 / updateRateMs);

            bossInterval = setInterval(() => {
                setBossIndex(prev => {
                    const next = prev < 0 ? 0 : prev + charsPerUpdate;
                    return Math.min(next, currentText.length);
                });
            }, updateRateMs);
        } else if (!isActive) {
            setBossIndex(-1);
            setFailedBossFight(false);
        }
        return () => clearInterval(bossInterval);
    }, [isActive, isFinished, isBossMode, user, currentText.length]);

    // 💀 Feature 28: Survival Kill Condition
    useEffect(() => {
        if (isBossMode && isActive && !isFinished && !failedSuddenDeath && !failedAccuracy) {
            if (typedText.length > 2 && Math.floor(bossIndex) > typedText.length) {
                setFailedBossFight(true);
                finishTest(); 
            }
        }
    }, [bossIndex, typedText.length, isBossMode, isActive, isFinished, finishTest, failedSuddenDeath, failedAccuracy]);

    // 🔒 Level 1: Accuracy Lock Logic
    useEffect(() => {
        if (failedByAccuracy) {
            setFailedAccuracy(true);
        }
    }, [failedByAccuracy]);

    // Feature 13: Minimalist / Deep Focus Mode
    useEffect(() => {
        if (isActive && !isFinished) {
            document.body.classList.add('deep-focus-mode');
        } else {
            document.body.classList.remove('deep-focus-mode');
        }
        return () => document.body.classList.remove('deep-focus-mode');
    }, [isActive, isFinished]);

    useEffect(() => {
        if (isSuddenDeath && errors > 0) {
            setFailedSuddenDeath(true);
            resetTest();
        }
    }, [isSuddenDeath, errors, resetTest]);

    // SECURITY & UX: Disable scroll and lock focus during active test (Section 7)
    useEffect(() => {
        if (isActive && !isFinished) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isActive, isFinished]);

    const [customMinutes, setCustomMinutes] = useState('');

    // Update time left when duration changes
    useEffect(() => {
        resetTest();
    }, [duration, resetTest]);

    const handleCustomDurationSubmit = () => {
        const mins = parseInt(customMinutes);
        if (!isNaN(mins) && mins > 0) {
            setDuration(mins * 60);
            setCustomMinutes('');
        }
    };

    const [showResult, setShowResult] = useState(false);
    const [_newBadges, setNewBadges] = useState([]);



    // Auto-rotate paragraph on restart — never repeat the last played one
    const getNextParagraphId = useCallback((currentDiff) => {
        const sourceParagraphs = language === 'en' ? PRESET_PARAGRAPHS : (MULTI_LANG_PARAGRAPHS[language] || PRESET_PARAGRAPHS);
        const pool = sourceParagraphs[currentDiff] || sourceParagraphs.beginner || [];
        if (pool.length <= 1) return pool[0]?.id || 'b1';
        const played = playedIdsRef.current;
        const unplayed = pool.filter(p => !played.includes(p.id));
        const candidates = unplayed.length > 0 ? unplayed : pool;
        const next = candidates[Math.floor(Math.random() * candidates.length)];
        playedIdsRef.current = [...played, next.id].slice(-5); // Keep last 5
        return next.id;
    }, [language]);

    const handleRestart = useCallback(() => {
        setShowResult(false);
        setNewBadges([]);
        setFailedSuddenDeath(false);
        setFailedAccuracy(false);
        // Auto-rotate to a new paragraph on restart
        if (mode === 'preset') {
            setSelectedParagraphId(getNextParagraphId(difficulty));
        }
        resetTest();
    }, [resetTest, mode, difficulty, getNextParagraphId]);

    // Handle Paragraph Selection
    const handleParagraphSelect = (id) => {
        setSelectedParagraphId(id);
        setTimeout(() => {
            resetTest();
            startTest();
        }, 50);
    };

    // Handle Difficulty Change
    const _handleDifficultyChange = (diff) => {
        setDifficulty(diff);
        if (PRESET_PARAGRAPHS[diff] && PRESET_PARAGRAPHS[diff].length > 0) {
            setSelectedParagraphId(PRESET_PARAGRAPHS[diff][0].id);
        }
        resetTest();
    };

    const resultsProcessed = useRef(false);
    const latestStats = useRef({ wpm, accuracy, user, lesson, isSuddenDeath, errors, nGrams, integrity, keystrokes });

    useEffect(() => {
        latestStats.current = { wpm, accuracy, user, lesson, isSuddenDeath, errors, nGrams, integrity, keystrokes };
    }, [wpm, accuracy, user, lesson, isSuddenDeath, errors, nGrams, integrity, keystrokes]);

    useEffect(() => {
        if (!isFinished) {
            resultsProcessed.current = false;
        } else {
            // Debug Log
            console.log('🏁 Test Logic Finished. Errors:', errors, 'SuddenDeath:', failedSuddenDeath);
        }
    }, [isFinished, errors, failedSuddenDeath]);

    useEffect(() => {
        if (isFinished && !resultsProcessed.current && !failedSuddenDeath) {
            // Read from ref to avoid capturing stale values without triggering effect restarts
            const currentStats = latestStats.current;

            // Prevent success processing if Sudden Death failed on the last character
            if (currentStats.isSuddenDeath && currentStats.errors > 0) return;

            console.log('📊 Processing Results...');
            resultsProcessed.current = true;

            const timeoutId = setTimeout(() => {
                setShowResult(true);
                
                // 🔊 Feature: Celebratory success sound
                soundEngine.playSuccess();

                // Fetch latest fresh stats again right before action
                const freshStats = latestStats.current;

                if (freshStats.user) {
                    try {
                        // Feature 19: Apply Spaced Repetition (SRS) to weak keys
                        Object.keys(freshStats.nGrams).forEach(pair => {
                            if (freshStats.nGrams[pair].avg > 250) { // If bigram is slow (>250ms)
                                calculateNextDrill(pair, Math.max(0, 5 - (freshStats.nGrams[pair].avg / 100)));
                            }
                        });

                        const resultData = {
                            wpm: freshStats.wpm,
                            accuracy: freshStats.accuracy,
                            date: new Date().toISOString(),
                            integrityScore: freshStats.integrity.score
                        };

                        // Feature 20: Persist to secure encrypted storage
                        secureStorage.set('last_session', resultData);

                        updateStats(resultData);

                        // Fix: Pass correct arguments to checkAchievements
                        const badges = checkAchievements(freshStats.wpm, freshStats.accuracy, freshStats.user.badges);

                        // Add Survivor badge if in Sudden Death mode
                        if (freshStats.isSuddenDeath && !freshStats.user.badges.includes('survivor')) {
                            badges.push('survivor');
                        }

                        if (badges.length > 0) {
                            badges.forEach(badge => addAchievement(badge));
                            setNewBadges(badges);
                        }

                        if (freshStats.lesson) {
                            // Calculate star rating (1-3)
                            let earnedStars = 1;
                            if (freshStats.accuracy >= 98 && freshStats.wpm >= 45) earnedStars = 3;
                            else if (freshStats.accuracy >= 90 && freshStats.wpm >= 25) earnedStars = 2;
                            else if (freshStats.accuracy >= 70) earnedStars = 1;
                            else earnedStars = 0;

                            updateLessonProgress(freshStats.lesson.id, earnedStars, true);
                        }
                    } catch (e) {
                        console.error("Result Processing Error:", e);
                    }
                }
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [isFinished, failedSuddenDeath, updateStats, addAchievement, updateLessonProgress]); // Removed rapidly changing deps like nGrams to avoid canceling the timeout


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans transition-colors duration-300">
            <SEOHead
                title="Typing Speed Test & Practice - TypeMaster Pro"
                description="Test your typing speed (WPM) and accuracy. Practice touch typing with adaptive difficulty levels, keyboard guides, and custom drills."
                schemaType="webApplication"
            />
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Header */}
                {!isFocusMode && (
                    <div className="test-unimportant flex items-center justify-between mb-8 animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                    {location.state?.customTitle ? location.state.customTitle : (lesson ? `Lesson: ${lesson.title}` : 'Professional Typing Test')}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {location.state?.customTitle ? 'Generated based on your weak keys performance' : (lesson ? 'Complete the lesson to advance' : 'Test your speed and accuracy')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <button
                                onClick={handleSoundCycle}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors capitalize"
                                title="Change Sound Profile"
                            >
                                {soundProfile === 'silent' ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                <span className="hidden lg:inline">Sound: {soundProfile}</span>
                            </button>
                            <button
                                onClick={handleCaretCycle}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors capitalize"
                                title="Change Cursor Style"
                            >
                                <Terminal className="w-5 h-5" />
                                <span className="hidden lg:inline">Cursor: {caretStyle}</span>
                            </button>
                            <button
                                onClick={handleThemeCycle}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors capitalize"
                                title="Change Atmospheric Theme"
                            >
                                <Wand2 className="w-5 h-5" />
                                <span className="hidden lg:inline">Theme: {visualTheme}</span>
                            </button>
                            {currentLevel >= 3 && (
                                <>
                                    <button
                                        onClick={handleLayoutCycle}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors capitalize"
                                        title="Change Keyboard Layout"
                                    >
                                        <Keyboard className="w-5 h-5" />
                                        <span className="hidden lg:inline">Layout: {keyboardLayout}</span>
                                    </button>
                                    <button
                                        onClick={() => setEmulateLayout(!emulateLayout)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                                            emulateLayout
                                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 ring-2 ring-amber-500'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                        title="Emulate layout output using physical QWERTY"
                                    >
                                        <ToggleLeft className="w-5 h-5" />
                                        <span className="hidden lg:inline">Emulate</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setIsFocusMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                                <EyeOff className="w-5 h-5" />
                                <span>Focus Mode</span>
                            </button>
                            <button
                                onClick={() => setIsGhostMode(!isGhostMode)}
                                className={`flex items-center gap-2 px-4 py-2 ml-3 rounded-xl font-medium transition-colors ${isGhostMode
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 ring-2 ring-purple-500'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                                    }`}
                                title={`Race against your PR: ${user?.stats?.highestWPM || 40} WPM!`}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span className="hidden xl:inline">Ghost</span>
                            </button>
                            <button
                                onClick={() => setIsBossMode(!isBossMode)}
                                className={`flex items-center gap-2 px-4 py-2 ml-3 rounded-xl font-medium transition-colors ${isBossMode
                                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 ring-2 ring-amber-500'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                                    }`}
                                title={`Survival Mode! Text disappears at ${(user?.stats?.highestWPM || 40) + 5} WPM`}
                            >
                                <Flame className="w-5 h-5" />
                                <span className="hidden xl:inline">Survival</span>
                            </button>
                            <button
                                onClick={() => setIsSuddenDeath(!isSuddenDeath)}
                                className={`flex items-center gap-2 px-4 py-2 ml-3 rounded-xl font-medium transition-colors ${isSuddenDeath
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                                    }`}
                                title="One mistake and it's over!"
                            >
                                <Skull className="w-5 h-5" />
                                <span>Sudden Death</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Focus Mode Exit Button */}
                {isFocusMode && (
                    <div className="fixed top-4 right-4 z-50">
                        <button
                            onClick={() => setIsFocusMode(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-slate-600 dark:text-slate-300 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all"
                        >
                            <EyeOff className="w-4 h-4" />
                            Exit Focus
                        </button>
                    </div>
                )}

                {/* Controls */}
                {!lesson && !isFocusMode && (
                    <div className="test-unimportant bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 mb-8 animate-in slide-in-from-top-4">
                        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Duration:
                            </label>
                            {[30, 60, 180, 300].map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setDuration(time)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${duration === time
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {time === 30 ? '30s' : time === 60 ? '1m' : time === 180 ? '3m' : '5m'}
                                </button>
                            ))}
                            <div className="flex items-center gap-2 ml-2 border-l pl-4 border-slate-200 dark:border-slate-600">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Min"
                                    value={customMinutes}
                                    onChange={(e) => setCustomMinutes(e.target.value)}
                                    className="w-16 px-2 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button
                                    onClick={handleCustomDurationSubmit}
                                    className="px-3 py-2 bg-slate-900 dark:bg-slate-600 text-white rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors"
                                >
                                    Set
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <button
                                onClick={() => { setMode('preset'); setDifficulty('beginner'); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${mode === 'preset' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <List className="w-4 h-4" /> Preset Paragraphs
                            </button>
                            <button
                                onClick={() => { setMode('code'); setDifficulty('javascript'); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${mode === 'code' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <Code className="w-4 h-4" /> Code Mode
                            </button>
                            {/* 🎯 Level 2: Adaptive Mode button — only shown for Level 2+ users */}
                            {currentLevel >= 2 && (
                                <button
                                    id="test-adaptive-mode-btn"
                                    onClick={() => {
                                        setMode('adaptive');
                                        setIsAdaptiveMode(true);
                                        if (user?.stats) setAdaptiveDiff(getAdaptiveDifficulty(user.stats));
                                        resetTest();
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${
                                        mode === 'adaptive'
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'text-slate-500 border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700'
                                    }`}
                                    title="Auto-picks difficulty based on your last 10 tests"
                                >
                                    <Wand2 className="w-4 h-4" /> Adaptive
                                    {mode === 'adaptive' && (() => {
                                        const meta = getDifficultyMeta(adaptiveDiff);
                                        return (
                                            <span style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}44` }}
                                                className="text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                                                {meta.emoji} {meta.label}
                                            </span>
                                        );
                                    })()}
                                </button>
                            )}
                            <button
                                onClick={() => setMode('custom')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${mode === 'custom' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <Edit3 className="w-4 h-4" /> Custom Text
                            </button>

                            {/* Phase 6: Voice Dictation Button */}
                            {isVoiceSupported && (
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${isListening
                                        ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 animate-pulse'
                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}`}
                                    title="Dictate to Type (Experimental)"
                                >
                                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    {isListening ? 'Stop Mic' : 'Dictate'}
                                </button>
                            )}

                            {/* Feature 6: AI Mode Choice */}
                            <button
                                onClick={() => setMode('ai_setup')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${mode === 'ai' || mode === 'ai_setup' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-100'}`}
                            >
                                <BrainCircuit className="w-4 h-4" /> AI Prompt
                            </button>

                            {/* Feature 4: Language Selection */}
                            <div className="ml-auto flex items-center gap-2">
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        setLanguage(e.target.value);
                                        setMode('preset');
                                        setDifficulty('beginner');
                                        setSelectedParagraphId(e.target.value === 'en' ? 'b1' : `${e.target.value}_b1`);
                                    }}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                    title="Keyboard Language"
                                >
                                    <option value="en">English 🇺🇸</option>
                                    <option value="es">Español 🇪🇸</option>
                                    <option value="ur">اردو 🇵🇰</option>
                                </select>
                            </div>
                        </div>

                        {/* Feature 6: AI Prompt Input Area with Style Pills + Save/Load */}
                        {mode === 'ai_setup' ? (
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                                {/* Style Pill Presets */}
                                <div className="flex flex-wrap gap-2">
                                    {AI_STYLE_PILLS.map((pill) => (
                                        <button
                                            key={pill.label}
                                            onClick={() => setAiPrompt(prev => prev.endsWith(pill.suffix) ? prev : prev.replace(/( in .*)$/, '') + pill.suffix)}
                                            className="px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                        >
                                            {pill.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter a topic (e.g. 'Cyberpunk 2077', 'The French Revolution', 'How to code in React')..."
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200 transition-all font-medium"
                                    />
                                    <button
                                        onClick={handleAIGenerate}
                                        disabled={isGeneratingAI || !aiPrompt.trim()}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
                                    >
                                        {isGeneratingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                                        {isGeneratingAI ? 'Thinking...' : 'Generate Drill'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="flex-1 text-xs text-slate-500 font-medium ml-1 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-indigo-400" />
                                        Powered by Hugging Face AI — infinite practice content based on your imagination.
                                    </p>
                                    {aiGeneratedText && (
                                        <button
                                            onClick={handleSaveAIDrill}
                                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                aiSaveSuccess
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200'
                                            }`}
                                            title="Save this AI drill for later"
                                        >
                                            ⭐ {aiSaveSuccess ? 'Saved!' : 'Save Drill'}
                                        </button>
                                    )}
                                    {savedDrills.length > 0 && (
                                        <button
                                            onClick={() => setShowSavedDrills(!showSavedDrills)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            📚 My Drills ({savedDrills.length})
                                        </button>
                                    )}
                                </div>
                                {/* Saved Drills Dropdown */}
                                {showSavedDrills && savedDrills.length > 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Saved AI Drills</p>
                                        {savedDrills.map((drill) => (
                                            <button
                                                key={drill.id}
                                                onClick={() => handleLoadSavedDrill(drill)}
                                                className="w-full text-left px-3 py-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors group"
                                            >
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 truncate">{drill.prompt}</p>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{drill.text}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : mode === 'custom' ? (
                            <div className="animate-in fade-in">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Paste your custom text here:
                                </label>
                                <textarea
                                    value={customText}
                                    onChange={(e) => {
                                        setCustomText(e.target.value);
                                        resetTest();
                                    }}
                                    className="w-full h-32 p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm resize-none"
                                    placeholder="Type or paste something here to practice..."
                                />
                            </div>
                        ) : (mode === 'preset' || mode === 'code') ? (
                            <div className="space-y-4">
                                <div className="flex gap-3 mb-4">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                                        {mode === 'code' ? 'Language:' : 'Difficulty:'}
                                    </label>
                                    {(mode === 'code'
                                        ? ['javascript', 'typescript', 'python', 'html', 'css', 'sql', 'java', 'cpp', 'rust', 'go', 'bash']
                                        : ['beginner', 'intermediate', 'hard']
                                    ).map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setDifficulty(option)}
                                            className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${difficulty === option
                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                                }`}
                                        >
                                            {mode === 'code' && option === 'javascript' ? 'JS'
                                                : mode === 'code' && option === 'typescript' ? 'TS'
                                                : mode === 'code' && option === 'html' ? 'HTML'
                                                : mode === 'code' && option === 'rust' ? '🦀 Rust'
                                                : mode === 'code' && option === 'go' ? '🐹 Go'
                                                : mode === 'code' && option === 'python' ? '🐍 Py'
                                                : option}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        {mode === 'code' ? 'Select Snippet:' : 'Select Paragraph:'}
                                    </label>
                                    <select
                                        value={selectedParagraphId}
                                        onChange={(e) => handleParagraphSelect(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer hover:border-indigo-300"
                                    >
                                        {(mode === 'code'
                                            ? CODE_SNIPPETS[difficulty] || []
                                            : (language === 'en' ? PRESET_PARAGRAPHS[difficulty] : MULTI_LANG_PARAGRAPHS[language][difficulty]) || []
                                        ).map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Stats & Timer */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatsDisplay
                        label={lesson || adaptiveText ? "Mode" : "Time Left"}
                        value={lesson || adaptiveText ? "No Limit" : `${timeLeft}s`}
                        icon={<RefreshCw className={`w-6 h-6 text-indigo-600 ${isActive && !(lesson || adaptiveText) ? 'animate-spin' : ''}`} />}
                        colorClass="bg-indigo-100 dark:bg-indigo-900/30"
                    />
                    <StatsDisplay
                        label="WPM"
                        value={wpm}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-yellow-600"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>}
                        colorClass="bg-yellow-100 dark:bg-yellow-900/30"
                    />
                    <StatsDisplay
                        label="Accuracy"
                        value={`${accuracy}%`}
                        icon={<Trophy className="w-6 h-6 text-emerald-600" />}
                        colorClass="bg-emerald-100 dark:bg-emerald-900/30"
                    />
                    <StatsDisplay
                        label="Errors"
                        value={errors}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-red-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>}
                        colorClass="bg-red-100 dark:bg-red-900/30"
                    />
                </div>

                {/* 🎯 Level 2: Speed Challenge Component */}
                {isFeatureEnabled('ENABLE_SPEED_CHALLENGES') && !lesson && !isFocusMode && (
                    <div className="mb-8 animate-in slide-in-from-bottom-4">
                        <SpeedChallenge
                            currentWpm={wpm}
                            selectedTarget={speedTarget}
                            onTargetSelect={setSpeedTarget}
                        />
                    </div>
                )}

                {/* Typing Area */}
                <div className="mb-8 relative">
                    {/* Visual Indicator for Sudden Death */}
                    {isSuddenDeath && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse z-10">
                            SUDDEN DEATH ACTIVE
                        </div>
                    )}
                    <div className={isSuddenDeath ? "ring-2 ring-red-500 rounded-xl" : ""}>
                        <TypingArea
                            text={currentText}
                            typedText={typedText}
                            onInput={handleInput}
                            disabled={isFinished || (mode === 'custom' && !customText) || failedSuddenDeath || failedBossFight}
                            ghostIndex={isGhostMode ? ghostIndex : -1}
                            invisibleIndex={isBossMode ? bossIndex : -1}
                            isRTL={language === 'ur' && mode !== 'code'}
                        />
                    </div>
                </div>

                {/* Jenny AI Tutor Feedback */}
                {isFinished && !failedSuddenDeath && !failedAccuracy && !failedBossFight && (() => {
                    const jennyInstance = new JennyAI(user);
                    const detailedErrors = jennyInstance.analyzeErrors(typedText, currentText);
                    const weakFingers = jennyInstance.detectWeakFingers(detailedErrors);
                    const drillWords = jennyInstance.generateCustomDrill(detailedErrors);
                    const coachingMsg = jennyInstance.generateCoachingMessage({
                        wpm,
                        accuracy,
                        testComplete: true
                    });

                    const handleStartDrill = () => {
                        if (drillWords.length > 0) {
                            const drillText = drillWords.join(' ') + ' ' + drillWords.join(' ');
                            setMode('custom');
                            setCustomText(drillText);
                            setTimeout(() => {
                                handleRestart();
                            }, 50);
                        }
                    };

                    return (
                        <div className="mb-8 w-full max-w-4xl mx-auto bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-md rounded-3xl p-6 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row gap-6 items-center md:items-start animate-in fade-in slide-in-from-bottom-4">
                            <img src={jennyReal} alt="Jenny AI" className="w-16 h-16 rounded-full border-2 border-indigo-500 object-cover shadow-lg" />
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-indigo-950 dark:text-indigo-400">Jenny's Coaching Feedback</h4>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium italic">"{coachingMsg}"</p>
                                </div>

                                {weakFingers.length > 0 && (
                                    <div className="text-sm">
                                        <span className="font-bold text-slate-500 mr-2">Weak Fingers Detected:</span>
                                        <span className="inline-flex gap-2">
                                            {weakFingers.map(([finger, count]) => (
                                                <span key={finger} className="bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-lg text-xs font-bold uppercase">
                                                    {finger} ({count} errors)
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                )}

                                {drillWords.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Recommended Drill Words</span>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                                            {drillWords.map((word, idx) => (
                                                <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {drillWords.length > 0 && (
                                <button
                                    onClick={handleStartDrill}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap self-stretch md:self-center"
                                >
                                    🎯 Start Weak Keys Drill
                                </button>
                            )}
                        </div>
                    );
                })()}

                {/* Feature 15: Post-Test Heatmap */}
                {isFinished && !failedSuddenDeath && !failedAccuracy && !failedBossFight && (
                    <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 flex justify-center w-full max-w-4xl mx-auto">
                        <KeyboardVisualization currentChar={null} heatMapData={getHeatMapData()} />
                    </div>
                )}

                {/* Restart & Finish Buttons */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={finishTest}
                        disabled={!isActive}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trophy className="w-5 h-5" />
                        Finish Early
                    </button>
                    <button
                        onClick={handleRestart}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Restart Test
                    </button>
                </div>

                {/* Level 1: Accuracy Lock Failure Modal */}
                {failedAccuracy && (
                    <div className="fixed inset-0 bg-yellow-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border-4 border-yellow-500">
                            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <ShieldAlert className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h2 className="text-3xl font-black text-yellow-600 dark:text-yellow-500 mb-2 uppercase tracking-wide">
                                Accuracy Alert!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 font-medium text-lg mb-8">
                                Master, your accuracy dropped below 90%. Focus on precision before speed.
                            </p>
                            <button
                                onClick={handleRestart}
                                className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-yellow-200 dark:shadow-none transition-all hover:scale-105"
                            >
                                Try Again (Calm Down)
                            </button>
                        </div>
                    </div>
                )}

                {/* Sudden Death Failure Modal */}
                {failedSuddenDeath && (
                    <div className="fixed inset-0 bg-red-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border-4 border-red-500">
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <Skull className="w-12 h-12 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-3xl font-black text-red-600 dark:text-red-500 mb-2 uppercase tracking-wide">
                                Game Over!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 font-medium text-lg mb-8">
                                Sudden Death Mode expects perfection. You made a mistake.
                            </p>
                            <button
                                onClick={handleRestart}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 dark:shadow-none transition-all hover:scale-105"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Feature 28: Boss Fight Failure Modal */}
                {failedBossFight && (
                    <div className="fixed inset-0 bg-amber-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border-4 border-amber-500">
                            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <Flame className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h2 className="text-3xl font-black text-amber-600 dark:text-amber-500 mb-2 uppercase tracking-wide">
                                Eaten by the Void!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 font-medium text-lg mb-8">
                                You typed too slowly. The void caught up and consumed you!
                            </p>
                            <button
                                onClick={handleRestart}
                                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-200 dark:shadow-none transition-all hover:scale-105"
                            >
                                Try Again Faster
                            </button>
                        </div>
                    </div>
                )}

                {/* Success Result Modal - Only show if NOT failed sudden death or boss fight */}
                {showResult && !failedSuddenDeath && !failedBossFight && (
                    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-indigo-900/50 to-purple-900/50 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in p-4">
                        <div className="relative bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-950 p-10 rounded-3xl shadow-2xl max-w-2xl w-full text-center border-4 border-yellow-400 dark:border-yellow-500 transform scale-100 animate-in zoom-in-95 duration-500">

                            <div className="absolute top-4 right-4">
                                <button onClick={() => setShowResult(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                <div className="text-6xl animate-bounce">🎉</div>
                            </div>

                            <div className="relative w-32 h-32 mx-auto mb-6 animate-in zoom-in-50 duration-700">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-200">
                                    <Trophy className="w-16 h-16 text-white drop-shadow-lg" />
                                </div>
                            </div>

                            <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-3 animate-in slide-in-from-bottom-4 duration-500">
                                Congratulations! 🎊
                            </h2>
                            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 font-medium">
                                You've completed the typing test!
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase font-bold text-xs mb-1">WPM</p>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{wpm}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase font-bold text-xs mb-1">Accuracy</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{accuracy}%</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase font-bold text-xs mb-1">Errors</p>
                                    <p className="text-2xl font-bold text-red-500 dark:text-red-400">{errors}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase font-bold text-xs mb-1">Score</p>
                                    <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">{Math.round(wpm * (accuracy / 100))}</p>
                                </div>
                            </div>

                            {/* Feature 17: Anti-Cheat Verification Display */}
                            <div className={`mb-8 p-4 rounded-2xl flex items-center justify-between border ${integrity.isBot
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${integrity.isBot ? 'bg-red-100 dark:bg-red-900/40 text-red-600' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'}`}>
                                        {integrity.isBot ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-sm font-bold ${integrity.isBot ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                            {integrity.isBot ? 'Integrity Suspicious' : 'Session Verified'}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
                                            Anti-Cheat Cadence Score: {integrity.score}% (v4.0)
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-slate-400">
                                    IKI-Jitters: {integrity.variance}ms
                                </div>
                            </div>

                            {/* Feature 17: N-Gram Insights (Phase 3) */}
                            <div className="mb-8 grid grid-cols-2 gap-4">
                                {Object.keys(nGrams).sort((a, b) => nGrams[b].avg - nGrams[a].avg).slice(0, 2).map((pair, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Zap className="w-3 h-3 text-yellow-500" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Slow Transition</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-lg font-black text-slate-700 dark:text-slate-200 font-mono tracking-tighter">"{pair}"</span>
                                            <span className="text-xs font-bold text-red-500">{Math.round(nGrams[pair].avg)}ms</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Feature 13: Hardware Capabilities (Phase 5) */}
                            {hardware && (
                                <div className="mb-8 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Cpu className="w-5 h-5 text-indigo-500" />
                                        <div className="text-left">
                                            <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Hardware Profile</div>
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                {hardware.advantageIndex === 'HIGH' ? 'Pro-Grade Mechanical' : 'Standard USB Input'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 rounded bg-white dark:bg-slate-800 text-[10px] font-black text-slate-500 border border-slate-200 dark:border-slate-700">
                                        HID-READY
                                    </div>
                                </div>
                            )}




                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleRestart}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105"
                                >
                                    Test Again
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-8 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all"
                                >
                                    Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Test;
