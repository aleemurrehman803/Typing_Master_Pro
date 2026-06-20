import { describe, it, expect } from 'vitest';
import { translateChar, QWERTY_TO_DVORAK, QWERTY_TO_COLEMAK } from './keyboardLayouts';

describe('Keyboard Layout Translation Utils', () => {
    describe('translateChar', () => {
        it('should return the original character if target layout is QWERTY', () => {
            expect(translateChar('q', 'qwerty')).toBe('q');
            expect(translateChar('a', 'qwerty')).toBe('a');
            expect(translateChar('1', 'qwerty')).toBe('1');
            expect(translateChar(' ', 'qwerty')).toBe(' ');
        });

        it('should map characters to Dvorak correctly', () => {
            expect(translateChar('q', 'dvorak')).toBe('\'');
            expect(translateChar('w', 'dvorak')).toBe(',');
            expect(translateChar('e', 'dvorak')).toBe('.');
            expect(translateChar('r', 'dvorak')).toBe('p');
            expect(translateChar('t', 'dvorak')).toBe('y');
            expect(translateChar('y', 'dvorak')).toBe('f');
            
            // Home Row
            expect(translateChar('s', 'dvorak')).toBe('o');
            expect(translateChar('d', 'dvorak')).toBe('e');
            expect(translateChar('f', 'dvorak')).toBe('u');
            expect(translateChar('g', 'dvorak')).toBe('i');
        });

        it('should map characters to Colemak correctly', () => {
            expect(translateChar('q', 'colemak')).toBe('q'); // remains same
            expect(translateChar('e', 'colemak')).toBe('f');
            expect(translateChar('r', 'colemak')).toBe('p');
            expect(translateChar('t', 'colemak')).toBe('g');
            expect(translateChar('y', 'colemak')).toBe('j');
            
            // Home Row
            expect(translateChar('s', 'colemak')).toBe('r');
            expect(translateChar('d', 'colemak')).toBe('s');
            expect(translateChar('f', 'colemak')).toBe('t');
        });

        it('should preserve casing for mapped layouts', () => {
            // Dvorak upper case
            expect(translateChar('Q', 'dvorak')).toBe('"');
            expect(translateChar('W', 'dvorak')).toBe('<');
            expect(translateChar('E', 'dvorak')).toBe('>');
            expect(translateChar('R', 'dvorak')).toBe('P');
            
            // Colemak upper case
            expect(translateChar('E', 'colemak')).toBe('F');
            expect(translateChar('R', 'colemak')).toBe('P');
            expect(translateChar('S', 'colemak')).toBe('R');
        });

        it('should return original character for unmapped symbols or space', () => {
            expect(translateChar(' ', 'dvorak')).toBe(' ');
            expect(translateChar(' ', 'colemak')).toBe(' ');
            expect(translateChar('1', 'dvorak')).toBe('1');
            expect(translateChar('1', 'colemak')).toBe('1');
        });
    });
});
