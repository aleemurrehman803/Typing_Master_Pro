/**
 * Curriculum Data
 * Contains the structured content for all typing courses and lessons.
 */

export const COURSES = {
    '1': {
        title: 'Beginner Touch Typing',
        description: 'Learn the fundamentals of touch typing and proper hand positioning.',
        lessons: [
            {
                id: 1,
                title: 'Home Row Keys (ASDF JKL;)',
                content: 'The home row is your foundation. Place your fingers on ASDF (left hand) and JKL; (right hand).',
                exercise: 'asdf jkl; asdf jkl; asdf jkl; adds fall jads skall all fall'
            },
            {
                id: 2,
                title: 'Simple Words',
                content: 'Practice common words using home row keys.',
                exercise: 'sad lad fall all dad jak asklass dass flask'
            },
            {
                id: 3,
                title: 'Top Row Practice',
                content: 'Now reach up to the top row: QWERTY UIOP',
                exercise: 'type quit power tower query your water outer'
            },
            {
                id: 4,
                title: 'Mixed Rows',
                content: 'Combine home and top rows smoothly.',
                exercise: 'the quick fast feet were yours try power of words'
            },
            {
                id: 5,
                title: 'Bottom Row Keys',
                content: 'Practice bottom row: ZXCV BNM',
                exercise: 'zoom box cave van barn mango next zone many'
            },
            {
                id: 6,
                title: 'Full Keyboard Practice',
                content: 'Use all rows together.',
                exercise: 'The quick brown fox jumps over the lazy dog every day'
            },
        ]
    },
    '2': {
        title: 'Speed Building Techniques',
        description: 'Advanced drills to increase typing speed.',
        lessons: [
            {
                id: 1,
                title: 'Common Bigrams',
                content: 'Practice letter pairs that appear frequently.',
                exercise: 'the and for you with that this have from they are'
            },
            {
                id: 2,
                title: 'Rhythm Drills',
                content: 'Type in steady rhythm for speed.',
                exercise: 'can you type fast when you practice every single day'
            },
            {
                id: 3,
                title: 'Word Combinations',
                content: 'Practice common word patterns.',
                exercise: 'in the of to and a is that it was for on are'
            },
            {
                id: 4,
                title: 'Speed Test',
                content: 'Full sentence practice at speed.',
                exercise: 'Practice makes perfect when you type every day with focus and dedication'
            },
        ]
    },
    '3': {
        title: 'Accuracy Mastery',
        description: 'Focus on precision and reducing errors.',
        lessons: [
            {
                id: 1,
                title: 'Precision Training',
                content: 'Focus on accuracy over speed.',
                exercise: 'type slowly and carefully to build muscle memory'
            },
            {
                id: 2,
                title: 'Difficult Keys',
                content: 'Practice challenging letters.',
                exercise: 'quick fix jump zero apex quiz prove oxygen'
            },
            {
                id: 3,
                title: 'Punctuation Practice',
                content: 'Master punctuation marks.',
                exercise: 'Hello, how are you? I am fine! Thank you.'
            },
            {
                id: 4,
                title: 'Capital Letters',
                content: 'Practice shift key usage.',
                exercise: 'John Smith lives in New York City on Main Street'
            },
        ]
    },
    '4': {
        title: 'Professional Typing',
        description: 'Master advanced patterns.',
        lessons: [
            {
                id: 1,
                title: 'Email Format',
                content: 'Professional email typing.',
                exercise: 'Dear Sir, Thank you for your email. Best regards,'
            },
            {
                id: 2,
                title: 'Numbers Practice',
                content: 'Master number row.',
                exercise: '123 456 789 0 1234567890 phone number is 555-0123'
            },
            {
                id: 3,
                title: 'Special Characters',
                content: 'Symbols and special keys.',
                exercise: 'email@domain.com path/to/file $100 50% #hashtag'
            },
            {
                id: 4,
                title: 'Advanced Speed',
                content: 'Professional-level typing.',
                exercise: 'The professional developer types code quickly and accurately with minimal errors every single time'
            },
        ]
    }
};

export const getCourseById = (id) => COURSES[id] || null;
