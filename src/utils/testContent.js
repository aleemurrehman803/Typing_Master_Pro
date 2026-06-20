/**
 * Test Content Utility
 * Contains paragraphs for typing tests categorized by difficulty and a general list for selection.
 */

export const PARAGRAPHS = [
    {
        id: 1,
        title: "The Art of Programming",
        text: "Programming is the art of telling another human what one wants the computer to do. It is not just about writing code that compiles and runs, but about creating systems that are maintainable, scalable, and easy to understand. Good code reads like a story, guiding the reader through the logic and intent of the developer."
    },
    {
        id: 2,
        title: "Nature's Beauty",
        text: "The beauty of nature is all around us, from the smallest flower to the tallest mountain. Taking time to appreciate the world we live in can bring a sense of peace and tranquility. The rustling leaves, the chirping birds, and the flowing water all compose a symphony that soothes the soul."
    },
    {
        id: 3,
        title: "Technology's Impact",
        text: "Technology has revolutionized the way we live, work, and communicate. It has bridged gaps between continents and made information accessible to everyone. However, it also brings challenges such as privacy concerns and the need for digital balance in our lives."
    },
    {
        id: 4,
        title: "The Joy of Reading",
        text: "Reading opens doors to new worlds and perspectives. It allows us to travel through time and space without leaving our chairs. Whether it is fiction or non-fiction, every book holds the potential to teach us something new and expand our horizons."
    },
    {
        id: 5,
        title: "Healthy Living",
        text: "Maintaining a healthy lifestyle is crucial for physical and mental well-being. Regular exercise, a balanced diet, and adequate sleep are the pillars of good health. Small, consistent changes in our daily habits can lead to significant long-term benefits."
    },
    {
        id: 6,
        title: "Space Exploration",
        text: "Space exploration pushes the boundaries of human knowledge and capability. From the first steps on the moon to the rovers on Mars, our quest to understand the universe continues to inspire generations. Who knows what mysteries lie waiting to be discovered in the vastness of space?"
    },
    {
        id: 7,
        title: "The Power of Music",
        text: "Music has the power to evoke deep emotions and connect people across cultures. It transcends language barriers and speaks directly to the heart. Whether it is a classical symphony or a modern pop song, music is a universal language that unites us all."
    },
    {
        id: 8,
        title: "History's Lessons",
        text: "Studying history helps us understand the present and prepare for the future. By learning from the mistakes and triumphs of the past, we can make better decisions today. History is not just a collection of dates and names, but a rich tapestry of human experience."
    },
    {
        id: 9,
        title: "Artificial Intelligence",
        text: "Artificial Intelligence is transforming industries and reshaping our future. From autonomous vehicles to personalized recommendations, AI is becoming an integral part of our daily lives. As we advance, ethical considerations must guide the development of these powerful technologies."
    },
    {
        id: 10,
        title: "Mindfulness",
        text: "Mindfulness is the practice of being present in the moment. In our fast-paced world, it is easy to get caught up in worries about the future or regrets about the past. Mindfulness teaches us to appreciate the here and now, reducing stress and enhancing our quality of life."
    }
];

export const DIFFICULTY_TEXTS = {
    beginner: [
        "The sun rises in the east and sets in the west.",
        "Cats and dogs are popular pets in many homes.",
        "Apples are red, green, or yellow and taste sweet.",
        "I like to play games with my friends after school.",
        "Reading books is a fun way to learn new things.",
        "The sky is blue and the grass is green.",
        "Birds fly high in the sky and sing songs.",
        "Water is essential for all living things on Earth.",
        "Trees give us shade and fresh air to breathe.",
        "Walking in the park is a nice way to relax.",
        "Rain falls from the clouds and waters the plants.",
        "Flowers bloom in spring and smell very nice.",
        "Fish swim in rivers, lakes, and oceans worldwide.",
        "The moon shines bright in the dark night sky.",
        "Children play together and share their favorite toys.",
        "Summer brings warm weather and long sunny days.",
        "Bees collect nectar from flowers to make honey.",
        "Snow falls softly and covers the ground in white.",
        "Friends help each other when they need support.",
        "Stars twinkle at night like diamonds in the sky."
    ],
    intermediate: [
        "The quick brown fox jumps over the lazy dog multiple times.",
        "Programming requires logical thinking and attention to detail.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "To be or not to be, that is the question asked by Hamlet.",
        "A journey of a thousand miles begins with a single step forward.",
        "Consistency is the key to mastering any new skill you choose.",
        "The internet has connected the world in ways we never imagined.",
        "Climate change is a pressing issue that requires global action.",
        "Learning a new language opens up new opportunities for travel.",
        "Creativity is intelligence having fun, as Einstein once said.",
        "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        "Innovation distinguishes between a leader and a follower in any field.",
        "The only way to do great work is to love what you do passionately.",
        "Quality is not an act, it is a habit we develop over time.",
        "Believe you can and you are halfway there to achieving your dreams.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "Challenges are what make life interesting and overcoming them is what makes life meaningful.",
        "The best time to plant a tree was twenty years ago. The second best time is now.",
        "Education is the most powerful weapon which you can use to change the world.",
        "The mind is everything. What you think you become, so think positive thoughts."
    ],
    hard: [
        "Sphinx of black quartz, judge my vow! The five boxing wizards jump quickly.",
        "Pack my box with five dozen liquor jugs. The quick onyx goblin jumps over the lazy dwarf.",
        "Jaded zombies acted quaintly but kept driving their oxen forward.",
        "A wizard's job is to vex chumps quickly in fog. Watch 'Jeopardy!', Alex Trebek's fun TV quiz game.",
        "The complex syntax of modern programming languages can be daunting for beginners.",
        "Quantum mechanics describes the behavior of matter and energy at atomic scales.",
        "Photosynthesis is the process by which green plants use sunlight to synthesize foods.",
        "Cryptocurrency relies on blockchain technology to ensure secure and decentralized transactions.",
        "Neuroplasticity refers to the brain's ability to reorganize itself by forming new neural connections.",
        "Anthropogenic climate change is driven primarily by emissions of greenhouse gases.",
        "Electromagnetic radiation encompasses radio waves, microwaves, infrared, visible light, ultraviolet rays, X-rays, and gamma rays.",
        "The mitochondria, often referred to as the powerhouse of the cell, generates adenosine triphosphate through cellular respiration.",
        "Deoxyribonucleic acid contains the genetic instructions for the development, functioning, growth, and reproduction of all known organisms.",
        "Machine learning algorithms can identify patterns in vast datasets and make predictions with remarkable accuracy.",
        "The epistemological framework underpinning modern science emphasizes empirical evidence and falsifiability as cornerstones of knowledge.",
        "Thermodynamic entropy represents the degree of disorder or randomness in a closed system and always increases over time.",
        "Superconductivity occurs when certain materials exhibit zero electrical resistance below a characteristic critical temperature.",
        "The Heisenberg uncertainty principle states that the position and momentum of a particle cannot be simultaneously measured with arbitrary precision.",
        "Polymerase chain reaction enables the amplification of specific DNA sequences, revolutionizing molecular biology and forensic science.",
        "Biodiversity encompasses the variety of life at genetic, species, and ecosystem levels, forming the foundation of ecological resilience."
    ]
};

// --- NEW FEATURE: CODE MODE SNIPPETS ---
export const CODE_SNIPPETS = {
    javascript: [
        { id: 'js1', title: 'Arrow Function', text: "const greet = (name) => {\n  return `Hello, ${name}!`;\n};" },
        { id: 'js2', title: 'Array Filter', text: "const evens = numbers.filter(n => n % 2 === 0);" },
        { id: 'js3', title: 'Async Fetch', text: "async function getData(url) {\n  const response = await fetch(url);\n  return response.json();\n}" },
        { id: 'js4', title: 'Object Destructuring', text: "const { name, age } = user;\nconsole.log(`${name} is ${age}`);" },
        { id: 'js5', title: 'Promise Chain', text: "fetchData().then(data => {\n  process(data);\n}).catch(err => console.error(err));" }
    ],
    python: [
        { id: 'py1', title: 'List Comprehension', text: "squares = [x**2 for x in range(10)]" },
        { id: 'py2', title: 'Function Definition', text: "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)" },
        { id: 'py3', title: 'Dictionary Loop', text: "for key, value in my_dict.items():\n    print(f'{key}: {value}')" },
        { id: 'py4', title: 'Lambda Function', text: "add = lambda x, y: x + y\nprint(add(5, 3))" },
        { id: 'py5', title: 'Class Definition', text: "class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        return 'Woof!'" }
    ],
    html: [
        { id: 'html1', title: 'Basic Structure', text: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>My First Heading</h1>\n  <p>My first paragraph.</p>\n</body>\n</html>" },
        { id: 'html2', title: 'Form Element', text: "<form action='/submit' method='post'>\n  <label for='name'>Name:</label>\n  <input type='text' id='name' name='name'>\n  <input type='submit' value='Submit'>\n</form>" },
        { id: 'html3', title: 'Unordered List', text: "<ul>\n  <li>Coffee</li>\n  <li>Tea</li>\n  <li>Milk</li>\n</ul>" }
    ],
    rust: [
        { id: 'rs1', title: 'Ownership', text: `fn main() {\n    let s = String::from("hello");\n    let len = calculate_length(&s);\n    println!("Length of '{}' is {}.", s, len);\n}` },
        { id: 'rs2', title: 'Pattern Match', text: `match direction {\n    Direction::North => println!("Going north!"),\n    Direction::South => println!("Going south!"),\n    _ => println!("Going elsewhere!"),\n}` },
        { id: 'rs3', title: 'Struct Impl', text: `struct Rectangle {\n    width: u32,\n    height: u32,\n}\nimpl Rectangle {\n    fn area(&self) -> u32 {\n        self.width * self.height\n    }\n}` },
        { id: 'rs4', title: 'Error Handling', text: `fn read_file(path: &str) -> Result<String, io::Error> {\n    let mut s = String::new();\n    File::open(path)?.read_to_string(&mut s)?;\n    Ok(s)\n}` },
        { id: 'rs5', title: 'Iterator', text: `let sum: i32 = (1..=10)\n    .filter(|x| x % 2 == 0)\n    .map(|x| x * x)\n    .sum();` }
    ],
    go: [
        { id: 'go1', title: 'Goroutine', text: `func main() {\n    go func() {\n        fmt.Println("running in goroutine")\n    }()\n    time.Sleep(1 * time.Second)\n}` },
        { id: 'go2', title: 'Interface', text: `type Animal interface {\n    Sound() string\n}\ntype Dog struct{}\nfunc (d Dog) Sound() string {\n    return "Woof"\n}` },
        { id: 'go3', title: 'Error Check', text: `file, err := os.Open("test.txt")\nif err != nil {\n    log.Fatalf("failed to open: %s", err)\n}\ndefer file.Close()` },
        { id: 'go4', title: 'Channel', text: `ch := make(chan int)\ngo func() {\n    ch <- 42\n}()\nvalue := <-ch\nfmt.Println(value)` },
        { id: 'go5', title: 'Struct', text: `type Person struct {\n    Name string\n    Age  int\n}\np := Person{Name: "Alice", Age: 30}\nfmt.Printf("%s is %d years old\\n", p.Name, p.Age)` }
    ],
    typescript: [
        { id: 'ts1', title: 'Generic Function', text: `function identity<T>(arg: T): T {\n    return arg;\n}\nconst output = identity<string>("hello");` },
        { id: 'ts2', title: 'Interface', text: `interface User {\n    id: number;\n    name: string;\n    email?: string;\n}\nconst user: User = { id: 1, name: "Alice" };` },
        { id: 'ts3', title: 'Enum', text: `enum Direction {\n    Up = "UP",\n    Down = "DOWN",\n    Left = "LEFT",\n    Right = "RIGHT"\n}\nconst dir: Direction = Direction.Up;` },
        { id: 'ts4', title: 'Type Guard', text: `function isString(value: unknown): value is string {\n    return typeof value === "string";\n}\nif (isString(input)) {\n    console.log(input.toUpperCase());\n}` },
        { id: 'ts5', title: 'Async/Await', text: `async function fetchUser(id: number): Promise<User> {\n    const res = await fetch(\`/api/users/\${id}\`);\n    if (!res.ok) throw new Error("Not found");\n    return res.json() as Promise<User>;\n}` }
    ]
};

// Drills for speed and accuracy training
export const TYPING_DRILLS = {
    beginner: [
        { id: 'd1', title: 'Home Row Drill', text: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl;', type: 'drill', difficulty: 'beginner' },
        { id: 'd2', title: 'Top Row Drill', text: 'qwer tyui op qwer tyui op qwer tyui op qwer tyui op', type: 'drill', difficulty: 'beginner' },
        { id: 'd3', title: 'Bottom Row Drill', text: 'zxcv bnm, zxcv bnm, zxcv bnm, zxcv bnm, zxcv bnm,', type: 'drill', difficulty: 'beginner' },
        { id: 'd4', title: 'Letter Pairs', text: 'ab cd ef gh ij kl mn op qr st uv wx yz', type: 'drill', difficulty: 'beginner' },
        { id: 'd5', title: 'Common Bigrams', text: 'th he in er an re on at en nd', type: 'drill', difficulty: 'beginner' }
    ],
    intermediate: [
        { id: 'd6', title: 'Common Trigrams', text: 'the and ing ion tio for ent con ati tha', type: 'drill', difficulty: 'intermediate' },
        { id: 'd7', title: 'Number Row Practice', text: '1234567890 0987654321 1357924680 2468013579', type: 'drill', difficulty: 'intermediate' },
        { id: 'd8', title: 'Shift Key Practice', text: 'The Quick Brown Fox Jumps Over The Lazy Dog Every Day', type: 'drill', difficulty: 'intermediate' },
        { id: 'd9', title: 'Special Characters', text: '!@#$%^&*() []{}\\|;:",.<>?/', type: 'drill', difficulty: 'intermediate' },
        { id: 'd10', title: 'Mixed Case Words', text: 'TypeScript JavaScript Python Java Ruby Swift Kotlin', type: 'drill', difficulty: 'intermediate' }
    ],
    advanced: [
        { id: 'd11', title: 'Code Symbols', text: '=> () {} [] <> != == === >= <= && || ?? ?: +=', type: 'drill', difficulty: 'advanced' },
        { id: 'd12', title: 'Alt Characters', text: '™ © ® € £ ¥ § ¶ † ‡ • ° ± × ÷ ≠ ≈', type: 'drill', difficulty: 'advanced' },
        { id: 'd13', title: 'Programming Patterns', text: 'if() while() for() switch() try{} catch() async await return', type: 'drill', difficulty: 'advanced' },
        { id: 'd14', title: 'Complex Punctuation', text: 'Hello, world! How are you? I\'m fine, thank you; what about you?', type: 'drill', difficulty: 'advanced' },
        { id: 'd15', title: 'Speed Burst', text: 'type fast very quick rapid speed swift hasty prompt brisk fleet nimble agile', type: 'drill', difficulty: 'advanced' }
    ]
};

// Typing games for engaging practice
export const TYPING_GAMES = [
    {
        id: 'g1',
        title: 'Word Race',
        description: 'Type words as they appear before they disappear!',
        difficulty: 'beginner',
        type: 'game'
    },
    {
        id: 'g3',
        title: 'Code Battle',
        description: 'Type code snippets accurately under time pressure',
        difficulty: 'advanced',
        type: 'game'
    },
    {
        id: 'g6',
        title: 'Neon Overdrive',
        description: 'High-velocity cyberpunk typing simulation',
        difficulty: 'intermediate',
        type: 'game'
    },
    {
        id: 'g7',
        title: 'Zen Garden Flow',
        description: 'Mindful endurance typing simulation for focus',
        difficulty: 'intermediate',
        type: 'game'
    },
    {
        id: 'g4',
        title: 'Story Builder',
        description: 'Type words to build an engaging story',
        difficulty: 'beginner',
        type: 'game'
    },
    {
        id: 'g5',
        title: 'Speed Demon',
        description: 'Race against the clock to beat your high score',
        difficulty: 'intermediate',
        type: 'game'
    }
];

// AI-Generated Typing Questions (Adaptive difficulty)
export const AI_TYPING_QUESTIONS = [
    {
        id: 'ai1',
        question: 'What is the capital of France?',
        answer: 'Paris',
        category: 'Geography',
        difficulty: 'beginner'
    },
    {
        id: 'ai2',
        question: 'Who wrote Romeo and Juliet?',
        answer: 'William Shakespeare',
        category: 'Literature',
        difficulty: 'beginner'
    },
    {
        id: 'ai3',
        question: 'What is the largest planet in our solar system?',
        answer: 'Jupiter',
        category: 'Science',
        difficulty: 'beginner'
    },
    {
        id: 'ai4',
        question: 'In what year did World War II end?',
        answer: '1945',
        category: 'History',
        difficulty: 'intermediate'
    },
    {
        id: 'ai5',
        question: 'What is the chemical symbol for gold?',
        answer: 'Au',
        category: 'Science',
        difficulty: 'intermediate'
    },
    {
        id: 'ai6',
        question: 'Who developed the theory of relativity?',
        answer: 'Albert Einstein',
        category: 'Science',
        difficulty: 'intermediate'
    },
    {
        id: 'ai7',
        question: 'What programming paradigm emphasizes immutability and pure functions?',
        answer: 'Functional programming',
        category: 'Technology',
        difficulty: 'advanced'
    },
    {
        id: 'ai8',
        question: 'What is the time complexity of binary search?',
        answer: 'O(log n)',
        category: 'Computer Science',
        difficulty: 'advanced'
    },
    {
        id: 'ai9',
        question: 'Which organelle is responsible for photosynthesis?',
        answer: 'Chloroplast',
        category: 'Biology',
        difficulty: 'advanced'
    },
    {
        id: 'ai10',
        question: 'What is the pH of pure water at 25 degrees Celsius?',
        answer: '7',
        category: 'Chemistry',
        difficulty: 'intermediate'
    }
];

export const getRandomText = (difficulty) => {
    const texts = DIFFICULTY_TEXTS[difficulty] || DIFFICULTY_TEXTS.beginner;
    return texts[Math.floor(Math.random() * texts.length)];
};

export const getParagraphById = (id) => {
    return PARAGRAPHS.find(p => p.id === parseInt(id));
};

export const getRandomDrill = (difficulty) => {
    const drills = TYPING_DRILLS[difficulty] || TYPING_DRILLS.beginner;
    return drills[Math.floor(Math.random() * drills.length)];
};

export const getRandomGame = () => {
    return TYPING_GAMES[Math.floor(Math.random() * TYPING_GAMES.length)];
};

export const getRandomAIQuestion = (difficulty) => {
    const questions = difficulty
        ? AI_TYPING_QUESTIONS.filter(q => q.difficulty === difficulty)
        : AI_TYPING_QUESTIONS;
    return questions[Math.floor(Math.random() * questions.length)];
};

export const getCodeSnippet = (language) => {
    const available = ['javascript', 'python', 'html', 'rust', 'go', 'typescript'];
    const lang = available.includes(language) ? language : 'javascript';
    const snippets = CODE_SNIPPETS[lang];
    return snippets[Math.floor(Math.random() * snippets.length)];
};
