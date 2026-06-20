import { describe, it, expect, beforeEach } from 'vitest';
import useSettingsStore from './useSettingsStore';

describe('Settings Store (Zustand)', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset store state manually to match default initializers
        useSettingsStore.setState({
            caretStyle: 'block',
            language: 'en',
            soundProfile: 'silent',
            visualTheme: 'default',
            keyboardLayout: 'qwerty',
            emulateLayout: false
        });
    });

    it('should initialize with default settings values', () => {
        const state = useSettingsStore.getState();
        expect(state.caretStyle).toBe('block');
        expect(state.language).toBe('en');
        expect(state.soundProfile).toBe('silent');
        expect(state.visualTheme).toBe('default');
        expect(state.keyboardLayout).toBe('qwerty');
        expect(state.emulateLayout).toBe(false);
    });

    it('should update caret style and persist to localStorage', () => {
        const store = useSettingsStore.getState();
        store.setCaretStyle('underline');

        expect(useSettingsStore.getState().caretStyle).toBe('underline');
        expect(localStorage.getItem('caretStyle')).toBe('underline');
    });

    it('should update language and persist to localStorage', () => {
        const store = useSettingsStore.getState();
        store.setLanguage('es');

        expect(useSettingsStore.getState().language).toBe('es');
        expect(localStorage.getItem('language')).toBe('es');
    });

    it('should update sound profile and persist to localStorage', () => {
        const store = useSettingsStore.getState();
        store.setSoundProfile('mechanical');

        expect(useSettingsStore.getState().soundProfile).toBe('mechanical');
        expect(localStorage.getItem('soundProfile')).toBe('mechanical');
    });

    it('should update visual theme and persist to localStorage', () => {
        const store = useSettingsStore.getState();
        store.setVisualTheme('matrix');

        expect(useSettingsStore.getState().visualTheme).toBe('matrix');
        expect(localStorage.getItem('visualTheme')).toBe('matrix');
    });

    it('should update keyboard layout and persist to localStorage', () => {
        const store = useSettingsStore.getState();
        store.setKeyboardLayout('dvorak');

        expect(useSettingsStore.getState().keyboardLayout).toBe('dvorak');
        expect(localStorage.getItem('keyboardLayout')).toBe('dvorak');
    });

    it('should update emulate layout and persist to localStorage', () => {
        const store = useSettingsStore.getState();
        store.setEmulateLayout(true);

        expect(useSettingsStore.getState().emulateLayout).toBe(true);
        expect(localStorage.getItem('emulateLayout')).toBe('true');

        store.setEmulateLayout(false);
        expect(useSettingsStore.getState().emulateLayout).toBe(false);
        expect(localStorage.getItem('emulateLayout')).toBe('false');
    });
});
