import { create } from 'zustand';

const useSettingsStore = create((set) => ({
    caretStyle: localStorage.getItem('caretStyle') || 'block', // 'block', 'beam', 'underline', 'smooth'
    language: localStorage.getItem('language') || 'en', // 'en', 'es', 'ur'
    soundProfile: localStorage.getItem('soundProfile') || 'silent', // 'silent', 'mechanical', 'typewriter', 'soft', 'retro'
    visualTheme: localStorage.getItem('visualTheme') || 'default', // 'default', 'matrix', 'stars'
    
    setCaretStyle: (style) => {
        localStorage.setItem('caretStyle', style);
        set({ caretStyle: style });
    },

    setLanguage: (lang) => {
        localStorage.setItem('language', lang);
        set({ language: lang });
    },

    setSoundProfile: (sound) => {
        localStorage.setItem('soundProfile', sound);
        set({ soundProfile: sound });
    },

    setVisualTheme: (theme) => {
        localStorage.setItem('visualTheme', theme);
        set({ visualTheme: theme });
    }
}));

export default useSettingsStore;

