/**
 * Phase 6: Voice Dictation Hook
 * 
 * Provides an interface to the native Web Speech API (SpeechRecognition).
 * Safe-guarded by browser support checks.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { isFeatureEnabled } from '../utils/featureFlags';

export const useVoiceDictation = (onResult) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!isFeatureEnabled('VOICE_DICTATION')) return;

        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                        onResult?.(event.results[i][0].transcript); // Send final chunk to callback
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript(interimTranscript || finalTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('[Voice] Error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [onResult]);

    const startListening = useCallback(() => {
        if (!isSupported || !recognitionRef.current) return;
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            console.error(e);
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (!isSupported || !recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsListening(false);
    }, [isSupported]);

    return {
        isListening,
        isSupported,
        transcript,
        startListening,
        stopListening
    };
};
