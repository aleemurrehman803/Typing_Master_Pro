/**
 * Keyboard Layout Emulation Maps
 * Maps physical/QWERTY keystrokes to alternative layouts (Dvorak and Colemak)
 */

export const QWERTY_TO_DVORAK = {
    'q': '\'', 'w': ',', 'e': '.', 'r': 'p', 't': 'y', 'y': 'f', 'u': 'g', 'i': 'c', 'o': 'r', 'p': 'l', '[': '/', ']': '=',
    'a': 'a', 's': 'o', 'd': 'e', 'f': 'u', 'g': 'i', 'h': 'd', 'j': 'h', 'k': 't', 'l': 'n', ';': 's', '\'': '-',
    'z': ';', 'x': 'q', 'c': 'j', 'v': 'k', 'b': 'x', 'n': 'b', 'm': 'm', ',': 'w', '.': 'v', '/': 'z',
    'Q': '"', 'W': '<', 'E': '>', 'R': 'P', 'T': 'Y', 'Y': 'F', 'U': 'G', 'I': 'C', 'O': 'R', 'P': 'L', '{': '?', '}': '+',
    'A': 'A', 'S': 'O', 'D': 'E', 'F': 'U', 'G': 'I', 'H': 'D', 'J': 'H', 'K': 'T', 'L': 'N', ':': 'S', '"': '_',
    'Z': ':', 'X': 'Q', 'C': 'J', 'V': 'K', 'B': 'X', 'N': 'B', 'M': 'M', '<': 'W', '>': 'V', '?': 'Z'
};

export const QWERTY_TO_COLEMAK = {
    'e': 'f', 'r': 'p', 't': 'g', 'y': 'j', 'u': 'l', 'i': 'u', 'o': 'y', 'p': ';',
    's': 'r', 'd': 's', 'f': 't', 'g': 'd', 'j': 'n', 'k': 'e', 'l': 'i', ';': 'o',
    'n': 'k',
    'E': 'F', 'R': 'P', 'T': 'G', 'Y': 'J', 'U': 'L', 'I': 'U', 'O': 'Y', 'P': ':',
    'S': 'R', 'D': 'S', 'F': 'T', 'G': 'D', 'J': 'N', 'K': 'E', 'L': 'I', ':': 'O',
    'N': 'K'
};

/**
 * Translates a character typed on a QWERTY keyboard to the target layout character.
 * @param {string} char - Input character
 * @param {'qwerty'|'dvorak'|'colemak'} targetLayout - Target layout
 * @returns {string} Mapped character
 */
export const translateChar = (char, targetLayout) => {
    if (!targetLayout || targetLayout === 'qwerty') return char;
    const map = targetLayout === 'dvorak' ? QWERTY_TO_DVORAK : QWERTY_TO_COLEMAK;
    return map[char] || char;
};
