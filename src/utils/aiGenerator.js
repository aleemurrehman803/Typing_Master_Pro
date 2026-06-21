/**
 * AI Paragraph Generation Service
 * Uses Hugging Face Serverless Inference API (keyless, free tier)
 * Falls back to an expanded 50-topic local library if network is unavailable.
 */

// ─── Local Fallback Library (50 topics across categories) ────────────────────
const FALLBACK_LIBRARY = {
    technology: [
        "React revolutionized frontend development by introducing a declarative, component-based architecture. Developers compose reusable UI pieces that update efficiently through a virtual DOM diffing algorithm, reducing costly browser repaints and delivering smooth user experiences at scale.",
        "Cloud computing has dissolved traditional infrastructure boundaries. Serverless architectures let teams deploy functions in milliseconds, auto-scaling instantly from zero to millions of requests, while paying only for the exact compute time consumed during each invocation.",
        "WebAssembly enables near-native performance inside the browser sandbox. Languages like Rust and C++ compile to a compact binary format that JavaScript engines execute at speeds previously impossible on the web platform, unlocking real-time video processing and physics simulations.",
        "TypeScript adds a powerful static type system on top of JavaScript, catching entire classes of bugs at compile time. Generics, discriminated unions, and conditional types allow developers to model complex domains precisely, making large codebases far more maintainable and refactorable.",
        "GraphQL replaces REST by letting clients request exactly the data they need in a single round-trip. A strongly-typed schema serves as a contract between frontend and backend teams, enabling automatic documentation, field-level deprecation tracking, and intelligent code generation."
    ],
    artificial_intelligence: [
        "Large language models are trained on trillions of tokens of text, learning statistical correlations between words and concepts. Through transformer attention mechanisms, they generate coherent responses by predicting the most likely next token given the full context of a conversation.",
        "Reinforcement learning from human feedback, or RLHF, fine-tunes language models to follow instructions and avoid harmful outputs. Human raters compare model responses, training a reward model whose signal guides policy optimization toward helpful, harmless, and honest behavior.",
        "Retrieval-augmented generation combines a vector database with a language model. Documents are embedded into high-dimensional semantic space, retrieved by similarity search at inference time, and injected as context, dramatically reducing hallucinations on factual queries.",
        "Neural networks learn hierarchical representations through layers of parameterized matrix multiplications and non-linear activations. Backpropagation computes gradients through the computational graph, and gradient descent iteratively adjusts weights to minimize a differentiable loss objective.",
        "Computer vision models trained on ImageNet learn to detect edges, textures, and shapes in shallow layers, composing them into object parts and full semantic categories in deeper layers, enabling applications from medical image analysis to autonomous vehicle perception systems."
    ],
    science: [
        "Quantum entanglement allows two particles to share a correlated quantum state regardless of the distance separating them. Measuring one particle instantly determines the state of its partner, a phenomenon Einstein famously called spooky action at a distance, now experimentally confirmed.",
        "CRISPR-Cas9 acts as molecular scissors that cut DNA at precise genomic locations specified by a guide RNA. After the cut, cells repair the break through natural mechanisms, allowing scientists to disable genes, correct mutations, or insert new sequences with unprecedented accuracy.",
        "Black holes are regions of spacetime where gravity curves so strongly that not even light escapes. The event horizon marks the point of no return, while Hawking radiation predicts that quantum effects cause black holes to slowly evaporate over astronomical timescales.",
        "Photosynthesis converts solar energy into chemical energy stored in glucose. Chlorophyll molecules in the thylakoid membranes absorb red and blue light, driving the splitting of water molecules and the reduction of carbon dioxide through the Calvin cycle in the stroma.",
        "Plate tectonics describes the slow movement of Earth's lithospheric plates driven by convection currents in the mantle. Collisions build mountain ranges, diverging plates form oceanic ridges, and subducting slabs trigger earthquakes and fuel volcanic activity along their descent."
    ],
    history: [
        "The printing press, invented by Gutenberg around 1440, democratized knowledge by making books affordable for the first time. Within decades, millions of copies circulated across Europe, accelerating the Renaissance, fueling the Protestant Reformation, and laying groundwork for the Scientific Revolution.",
        "The Silk Road connected Han China with Rome through 4,000 miles of overland and maritime trade routes. Merchants exchanged silk, spices, glassware, and precious metals, while scholars simultaneously transmitted religions, philosophies, mathematical concepts, and devastating plagues between civilizations.",
        "The Manhattan Project assembled the greatest concentration of scientific talent in history at Los Alamos, New Mexico. Within three years, physicists and engineers designed and tested the first atomic weapon, fundamentally transforming geopolitical power, deterrence theory, and the ethics of scientific research.",
        "The Industrial Revolution shifted England from agrarian subsistence to mechanized manufacturing between 1760 and 1840. Steam engines, mechanized looms, and iron production concentrated workers in factory cities, creating the modern working class and laying the economic foundation for global capitalism.",
        "Ancient Alexandria's Library served as the intellectual center of the Hellenistic world, housing scrolls from across the Mediterranean. Scholars like Euclid, Archimedes, and Eratosthenes worked there, measuring the Earth's circumference and establishing foundations of geometry, physics, and astronomy."
    ],
    philosophy: [
        "Plato's allegory of the cave depicts prisoners chained to face a wall, mistaking the shadows of objects behind them for reality. The philosopher, escaping to see actual sunlight, represents the intellectual journey from sensory opinion to rational knowledge of the eternal forms.",
        "Kant's categorical imperative demands we act only according to maxims we could will to become universal laws. This deontological framework grounds morality in reason rather than consequences, arguing that treating persons as ends in themselves, never merely as means, is the foundation of ethics.",
        "Existentialism holds that existence precedes essence, meaning humans first exist and then define themselves through choices. Sartre argued that radical freedom makes us completely responsible for who we become, and the anxiety of this boundless responsibility is an inescapable feature of human consciousness.",
        "Stoics taught that virtue is the only genuine good and that externals like health, wealth, and reputation are indifferent. By focusing attention exclusively on judgments and actions within our control, practitioners cultivate equanimity toward hardship and freedom from destructive emotional reactions.",
        "The trolley problem asks whether it is moral to divert a runaway trolley to kill one person and save five. Responses reveal deep tensions between utilitarian thinking, which maximizes outcomes, and deontological constraints against using individuals as mere instruments for collective benefit."
    ],
    nature: [
        "Coral reefs, built from calcium carbonate secreted by tiny polyps over millennia, shelter one quarter of all marine species. Ocean warming bleaches corals by expelling their symbiotic algae, stripping the reef of both color and the photosynthetic energy that sustains the entire ecosystem.",
        "Mycorrhizal networks extend beneath forests, connecting trees through fungal threads that exchange nutrients and carbon. A single mature tree may support seedlings in deep shade by transferring sugars through this wood wide web, fundamentally challenging our individualistic view of competition in nature.",
        "Migration routes of monarch butterflies span three thousand miles between Canadian breeding grounds and Mexican wintering forests. Navigating by a time-compensated sun compass calibrated to an internal circadian clock, they locate the same mountain groves their great-grandparents used.",
        "Deep hydrothermal vents on the ocean floor support thriving ecosystems powered entirely by chemosynthesis. Tube worms, shrimp, and clams depend on bacteria that oxidize hydrogen sulfide from superheated water, proving that complex life can exist without any input of solar energy.",
        "The Amazon basin recycles its own rainfall. Trees transpire vast quantities of moisture that condense into clouds and fall again as rain hundreds of miles inland, creating atmospheric rivers that sustain agriculture across South America far beyond the forest's physical boundaries."
    ],
    programming: [
        "Test-driven development inverts the traditional workflow by writing failing tests before any production code. This discipline forces developers to define precise specifications upfront, results in highly modular designs that are easy to test in isolation, and provides a safety net enabling fearless refactoring.",
        "Clean code reads like well-written prose. Functions should do one thing, have descriptive names, and accept as few parameters as possible. Avoiding deeply nested conditionals and magic numbers, and extracting meaningful abstractions, transforms a codebase from a liability into a strategic asset.",
        "The SOLID principles guide object-oriented design toward flexible, maintainable systems. Single responsibility, open-closed, Liskov substitution, interface segregation, and dependency inversion collectively reduce coupling, increase cohesion, and make systems far easier to extend without breaking existing functionality.",
        "Microservices decompose a monolith into small, independently deployable services communicating over APIs. Each service owns its data store and can be scaled, updated, and redeployed in isolation, accelerating release cadence but introducing distributed systems complexity around consistency and observability.",
        "Functional programming treats computation as the evaluation of mathematical functions without side effects. Immutable data, pure functions, and function composition allow developers to reason locally about program behavior and enable parallel execution without data races or complex synchronization primitives."
    ],
    business: [
        "Compound interest is the eighth wonder of the world. Reinvesting returns generates returns on returns, causing wealth to grow exponentially over decades. Even a modest annual rate of seven percent doubles an investment every ten years through the relentless mathematical power of compounding.",
        "Lean startup methodology validates business ideas through rapid experimentation rather than elaborate planning. Building minimal viable products, measuring genuine customer behavior, and iterating based on validated learning reduces the enormous waste of building products that no one actually wants.",
        "Network effects emerge when a product becomes more valuable as more people use it. Telephone networks, social platforms, and payment systems all exhibit this property, creating powerful winner-take-most dynamics where early market leaders enjoy durable competitive moats.",
        "Supply chain disruptions during the pandemic exposed the fragility of just-in-time manufacturing systems. Companies optimized for efficiency had eliminated safety stock, leaving them unable to absorb sudden demand spikes or supplier failures without cascading production shutdowns across entire industries.",
        "Behavioral economics reveals systematic cognitive biases that cause humans to deviate from rational choice theory. Loss aversion, anchoring, and present bias explain patterns from retirement savings decisions to consumer purchasing behavior, informing better product design and policy interventions."
    ],
    creative: [
        "The craft of fiction rests on showing rather than telling. Instead of stating a character is angry, the writer reveals clenched fists, clipped sentences, and a deliberate turn away from the window. Concrete sensory detail creates emotional resonance that abstract description can never achieve.",
        "Film editing is the invisible art. Audiences never consciously notice a cut that works, experiencing the film as a seamless emotional journey. The editor's craft lies in selecting the precise frame where one shot ends and another begins to create rhythm, tension, and narrative momentum.",
        "The Golden Ratio appears throughout Renaissance painting, Gothic architecture, and natural spirals. This proportion, approximately 1.618, creates visual harmony that the human eye finds effortlessly pleasing, though whether its beauty is intrinsic or culturally learned remains a fascinating open question.",
        "Jazz improvisation represents a form of spontaneous composition within agreed harmonic structures. Musicians negotiate in real time, listening deeply, responding to each other's phrases, building tension through rhythmic displacement and chromatic tension before resolving to moments of satisfying harmonic rest.",
        "Great architecture solves multiple problems simultaneously. A staircase must move people between floors, but it can also create drama through double-height voids, admit natural light through skylights, and serve as the social heart where residents pause to interact."
    ],
    health: [
        "Sleep consolidates memories by replaying neural activity patterns from the day during slow-wave and REM stages. The glymphatic system simultaneously flushes metabolic waste products including amyloid-beta proteins linked to Alzheimer's disease, explaining why chronic sleep deprivation accelerates cognitive decline.",
        "High-intensity interval training triggers greater cardiovascular adaptation than steady-state exercise in half the time. Short bursts at maximal effort create oxygen debt that the body repays over hours, elevating metabolic rate and stimulating mitochondrial biogenesis throughout the recovery period.",
        "The gut microbiome contains trillions of bacteria that produce neurotransmitters, regulate immune responses, and metabolize nutrients the human body cannot digest alone. Disrupting this ecosystem through antibiotics or highly processed diets has measurable effects on mood, inflammation, and metabolic health.",
        "Meditation physically reshapes the brain through neuroplasticity. Regular practitioners show increased cortical thickness in regions governing attention and interoception, while the amygdala, the brain's alarm system, shows reduced reactivity to stressors after just eight weeks of consistent practice.",
        "Zone two aerobic training builds the mitochondrial infrastructure that underlies all athletic performance. Training at conversational pace maximizes fat oxidation efficiency and capillary density, creating the aerobic base upon which higher-intensity work can be stacked without accumulating excessive fatigue."
    ]
};

// ─── Topic Keyword Matching ───────────────────────────────────────────────────
const KEYWORD_MAP = [
    { keys: ['react', 'vue', 'angular', 'javascript', 'typescript', 'web', 'frontend', 'css', 'html', 'node', 'api', 'cloud', 'devops', 'code', 'programming', 'software', 'developer', 'tech', 'computer', 'data'], category: 'technology' },
    { keys: ['ai', 'artificial intelligence', 'machine learning', 'neural', 'llm', 'gpt', 'model', 'deep learning', 'nlp', 'robot', 'automation'], category: 'artificial_intelligence' },
    { keys: ['science', 'physics', 'quantum', 'chemistry', 'biology', 'space', 'nasa', 'dna', 'gene', 'atom', 'universe', 'planet', 'climate'], category: 'science' },
    { keys: ['history', 'ancient', 'war', 'empire', 'century', 'revolution', 'medieval', 'renaissance', 'civilization', 'historical'], category: 'history' },
    { keys: ['philosophy', 'ethics', 'logic', 'socrates', 'plato', 'kant', 'morality', 'consciousness', 'existence', 'stoic'], category: 'philosophy' },
    { keys: ['nature', 'forest', 'ocean', 'animal', 'plant', 'environment', 'ecosystem', 'wildlife', 'jungle', 'mountain', 'river'], category: 'nature' },
    { keys: ['business', 'startup', 'finance', 'economy', 'market', 'investment', 'money', 'company', 'product', 'entrepreneur', 'strategy'], category: 'business' },
    { keys: ['creative', 'art', 'music', 'film', 'design', 'writing', 'story', 'poem', 'paint', 'architecture', 'novel'], category: 'creative' },
    { keys: ['health', 'fitness', 'sleep', 'exercise', 'diet', 'nutrition', 'mental', 'wellness', 'meditation', 'yoga', 'body'], category: 'health' },
];

const detectCategory = (prompt) => {
    const lower = (prompt || '').toLowerCase();
    for (const entry of KEYWORD_MAP) {
        if (entry.keys.some(k => lower.includes(k))) return entry.category;
    }
    return 'programming';
};

const getFallbackText = (prompt) => {
    const category = detectCategory(prompt);
    const texts = FALLBACK_LIBRARY[category] || FALLBACK_LIBRARY.technology;
    return texts[Math.floor(Math.random() * texts.length)];
};

// ─── Hugging Face Serverless Inference ───────────────────────────────────────
const HF_MODELS = [
    'Qwen/Qwen2.5-7B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'HuggingFaceH4/zephyr-7b-beta'
];

const buildPrompt = (userPrompt) =>
    `Write a single paragraph for a typing speed test about: "${userPrompt}". ` +
    `Requirements: exactly 2-4 sentences, 250-450 characters total, ` +
    `no line breaks, no bullet points, no special symbols except commas and periods, ` +
    `professional tone. Return ONLY the paragraph text with no introduction or labels.`;

const tryHuggingFace = async (prompt) => {
    const model = HF_MODELS[Math.floor(Math.random() * HF_MODELS.length)];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inputs: buildPrompt(prompt),
                    parameters: { max_new_tokens: 200, temperature: 0.7, do_sample: true }
                }),
                signal: controller.signal
            }
        );
        clearTimeout(timeoutId);

        if (!res.ok) return null;
        const data = await res.json();

        let text = Array.isArray(data)
            ? (data[0]?.generated_text || '')
            : (data?.generated_text || '');

        // Strip any echoed prompt prefix
        const marker = buildPrompt(prompt);
        if (text.startsWith(marker)) text = text.slice(marker.length).trim();

        // Validate output: must be a real paragraph (>100 chars, no weird symbols)
        text = text.trim().split('\n')[0].trim();
        if (text.length >= 100 && /^[A-Za-z]/.test(text)) return text;
        return null;
    } catch {
        clearTimeout(timeoutId);
        return null;
    }
};

// ─── Saved Drills Storage ────────────────────────────────────────────────────
export const saveAIDrill = (prompt, text) => {
    try {
        const existing = JSON.parse(localStorage.getItem('tm_ai_saved_drills') || '[]');
        const newDrill = { id: Date.now(), prompt, text, savedAt: new Date().toISOString() };
        const updated = [newDrill, ...existing].slice(0, 20); // Max 20 saved
        localStorage.setItem('tm_ai_saved_drills', JSON.stringify(updated));
        return true;
    } catch { return false; }
};

export const loadSavedDrills = () => {
    try {
        return JSON.parse(localStorage.getItem('tm_ai_saved_drills') || '[]');
    } catch { return []; }
};

export const deleteSavedDrill = (id) => {
    try {
        const existing = JSON.parse(localStorage.getItem('tm_ai_saved_drills') || '[]');
        localStorage.setItem('tm_ai_saved_drills', JSON.stringify(existing.filter(d => d.id !== id)));
        return true;
    } catch { return false; }
};

// ─── Main Export ─────────────────────────────────────────────────────────────
/**
 * Generate an AI typing paragraph from a user prompt.
 * Tries Hugging Face Serverless API first; falls back to curated local library.
 * @param {string} prompt - User topic/prompt
 * @returns {Promise<string>} - Plain text paragraph ready for typing test
 */
export const generateAIParagraph = async (prompt) => {
    // Simulate minimal thinking delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    // Try live AI generation
    const aiText = await tryHuggingFace(prompt);
    if (aiText) return aiText;

    // Graceful fallback to curated library
    return getFallbackText(prompt);
};
