/**
 * AI Paragraph Generation Service
 * Simulates high-quality AI generation for specialized typing drills.
 */

const TOPIC_TEMPLATES = {
    tech: [
        "In the rapidly evolving world of software development, React has emerged as a cornerstone for building dynamic user interfaces. By leveraging a declarative approach and a powerful component-based architecture, developers can create modular code that is both maintainable and highly performant.",
        "Cloud computing has fundamentally changed how organizations deploy and scale their applications. With the rise of serverless architectures and microservices, the traditional boundaries of infrastructure have dissolved, allowing for unprecedented agility and global reach.",
        "Artificial Intelligence is no longer a futuristic concept but a present-day reality integrated into our daily tools. From large language models to complex neural networks, the ability of machines to process and interpret data is reshuffling every industry on the planet."
    ],
    nature: [
        "The Amazon Rainforest, often referred to as the lungs of the Earth, is a vibrant tapestry of biological diversity. Within its dense canopy, millions of species coexist in a delicate equilibrium that is vital for the global carbon cycle and climate stability.",
        "Deep beneath the ocean's surface lies a world of mystery and darkness, where bioluminescent creatures thrive in extreme pressures. The hydrothermal vents found on the sea floor support unique ecosystems that challenge our understanding of life itself.",
        "Deserts are not merely barren wastelands but ecosystems of incredible resilience and adaptation. From the shifting dunes of the Sahara to the rocky plateaus of the Gobi, life has found ingenious ways to conserve water and survive in the harshest conditions."
    ],
    history: [
        "The Industrial Revolution marked a pivotal turning point in human history, transitioning societies from agrarian economies to manufacturing powerhouses. This era of massive innovation brought about steam engines, mechanization, and the rapid growth of urban centers.",
        "Ancient Egypt's architectural legacy remains a testament to human ingenuity and spiritual devotion. The Great Pyramids and the Sphinx stand as silent witnesses to a civilization that mastered monumental construction and complex social organization.",
        "The Silk Road was more than just a trade route; it was a conduit for cultural exchange and the spread of ideas across continents. By connecting the East and West, it facilitated the movement of spices, textiles, philosophy, and scientific knowledge."
    ]
};

/**
 * Simulates an AI generation call
 * @param {string} prompt - User defined prompt
 * @returns {Promise<string>} - The generated paragraph
 */
export const generateAIParagraph = async (prompt) => {
    // Simulate network delay for "AI Thinking" feel
    await new Promise(resolve => setTimeout(resolve, 2500));

    const lowPrompt = (prompt || "").toLowerCase();
    
    // Smart Keyword Detection
    let category = 'tech'; // Default
    if (lowPrompt.includes('nature') || lowPrompt.includes('animal') || lowPrompt.includes('environment')) category = 'nature';
    if (lowPrompt.includes('history') || lowPrompt.includes('ancient') || lowPrompt.includes('war') || lowPrompt.includes('century')) category = 'history';
    if (lowPrompt.includes('code') || lowPrompt.includes('programming') || lowPrompt.includes('web') || lowPrompt.includes('ai')) category = 'tech';

    const templates = TOPIC_TEMPLATES[category];
    const baseText = templates[Math.floor(Math.random() * templates.length)];

    // Inject the prompt slightly into the text to make it feel real (Simple AI Simulation)
    return `Generated Insight for "${prompt}": ${baseText}`;
};
