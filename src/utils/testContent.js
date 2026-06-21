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
        { id: 'js1', title: 'Arrow Function', difficulty: 'beginner', text: "const greet = (name) => {\n  return `Hello, ${name}!`;\n};" },
        { id: 'js2', title: 'Array Filter', difficulty: 'beginner', text: "const evens = numbers.filter(n => n % 2 === 0);" },
        { id: 'js3', title: 'Async Fetch', difficulty: 'intermediate', text: "async function getData(url) {\n  const response = await fetch(url);\n  return response.json();\n}" },
        { id: 'js4', title: 'Object Destructuring', difficulty: 'beginner', text: "const { name, age } = user;\nconsole.log(`${name} is ${age}`);" },
        { id: 'js5', title: 'Promise Chain', difficulty: 'intermediate', text: "fetchData().then(data => {\n  process(data);\n}).catch(err => console.error(err));" },
        { id: 'js6', title: 'Event Emitter', difficulty: 'advanced', text: "class EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n  on(event, listener) {\n    if (!this.events[event]) this.events[event] = [];\n    this.events[event].push(listener);\n  }\n  emit(event, ...args) {\n    (this.events[event] || []).forEach(l => l(...args));\n  }\n}" },
        { id: 'js7', title: 'Debounce', difficulty: 'intermediate', text: "const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};" },
        { id: 'js8', title: 'Memoize', difficulty: 'intermediate', text: "const memoize = (fn) => {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n};" },
        { id: 'js9', title: 'Deep Clone', difficulty: 'advanced', text: 'const deepClone = (obj) => {\n  if (obj === null || typeof obj !== "object") return obj;\n  if (Array.isArray(obj)) return obj.map(deepClone);\n  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepClone(v)]));\n};' },
        { id: 'js10', title: 'Sum & Average', difficulty: 'beginner', text: "const sum = (arr) => arr.reduce((acc, val) => acc + val, 0);\nconst average = (arr) => sum(arr) / arr.length;" }
    ],
    typescript: [
        { id: 'ts1', title: 'Generic Function', difficulty: 'beginner', text: `function identity<T>(arg: T): T {\n    return arg;\n}\nconst output = identity<string>("hello");` },
        { id: 'ts2', title: 'Interface', difficulty: 'beginner', text: `interface User {\n    id: number;\n    name: string;\n    email?: string;\n}\nconst user: User = { id: 1, name: "Alice" };` },
        { id: 'ts3', title: 'Enum', difficulty: 'beginner', text: `enum Direction {\n    Up = "UP",\n    Down = "DOWN",\n    Left = "LEFT",\n    Right = "RIGHT"\n}\nconst dir: Direction = Direction.Up;` },
        { id: 'ts4', title: 'Type Guard', difficulty: 'intermediate', text: `function isString(value: unknown): value is string {\n    return typeof value === "string";\n}\nif (isString(input)) {\n    console.log(input.toUpperCase());\n}` },
        { id: 'ts5', title: 'Async/Await', difficulty: 'intermediate', text: `async function fetchUser(id: number): Promise<User> {\n    const res = await fetch(\`/api/users/\${id}\`);\n    if (!res.ok) throw new Error("Not found");\n    return res.json() as Promise<User>;\n}` },
        { id: 'ts6', title: 'DeepPartial Type', difficulty: 'advanced', text: "type DeepPartial<T> = {\n  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];\n};" },
        { id: 'ts7', title: 'Repository Interface', difficulty: 'intermediate', text: "interface Repository<T> {\n  findById(id: string): Promise<T | null>;\n  findAll(): Promise<T[]>;\n  save(entity: T): Promise<T>;\n  delete(id: string): Promise<void>;\n}" },
        { id: 'ts8', title: 'Pipe Function', difficulty: 'advanced', text: "function pipe<T>(...fns: Array<(arg: T) => T>) {\n  return (value: T): T => fns.reduce((acc, fn) => fn(acc), value);\n}" },
        { id: 'ts9', title: 'Result Type', difficulty: 'intermediate', text: "type Result<T, E = Error> =\n  | { success: true; data: T }\n  | { success: false; error: E };" },
        { id: 'ts10', title: 'Create Store', difficulty: 'advanced', text: "const createStore = <S>(initialState: S) => {\n  let state = initialState;\n  const listeners: Array<(s: S) => void> = [];\n  return {\n    getState: () => state,\n    setState: (next: Partial<S>) => { state = { ...state, ...next }; listeners.forEach(l => l(state)); },\n    subscribe: (l: (s: S) => void) => listeners.push(l),\n  };\n};" }
    ],
    html: [
        { id: 'html1', title: 'Basic Structure', difficulty: 'beginner', text: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>My First Heading</h1>\n  <p>My first paragraph.</p>\n</body>\n</html>" },
        { id: 'html2', title: 'Form Element', difficulty: 'beginner', text: "<form action='/submit' method='post'>\n  <label for='name'>Name:</label>\n  <input type='text' id='name' name='name'>\n  <input type='submit' value='Submit'>\n</form>" },
        { id: 'html3', title: 'Unordered List', difficulty: 'beginner', text: "<ul>\n  <li>Coffee</li>\n  <li>Tea</li>\n  <li>Milk</li>\n</ul>" },
        { id: 'html4', title: 'Full HTML5 Boilerplate', difficulty: 'intermediate', text: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <meta name=\"description\" content=\"Page description\" />\n  <title>Document</title>\n</head>\n<body>\n  <main id=\"root\"></main>\n</body>\n</html>" },
        { id: 'html5', title: 'Accessible Nav', difficulty: 'intermediate', text: "<nav aria-label=\"Main navigation\">\n  <ul role=\"list\">\n    <li><a href=\"/home\" aria-current=\"page\">Home</a></li>\n    <li><a href=\"/about\">About</a></li>\n    <li><a href=\"/contact\">Contact</a></li>\n  </ul>\n</nav>" },
        { id: 'html6', title: 'Data Table', difficulty: 'intermediate', text: "<table>\n  <thead>\n    <tr><th scope=\"col\">Name</th><th scope=\"col\">Age</th><th scope=\"col\">Email</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Alice</td><td>30</td><td>alice@example.com</td></tr>\n    <tr><td>Bob</td><td>25</td><td>bob@example.com</td></tr>\n  </tbody>\n</table>" },
        { id: 'html7', title: 'Semantic Section', difficulty: 'beginner', text: "<section class=\"hero\">\n  <header>\n    <h1>Welcome to TypeMaster Pro</h1>\n    <p>Master the art of typing at lightning speed.</p>\n  </header>\n  <article>\n    <h2>Features</h2>\n    <p>AI-powered drills, live analytics, and global leaderboards.</p>\n  </article>\n</section>" },
        { id: 'html8', title: 'Login Form', difficulty: 'advanced', text: "<form action=\"/login\" method=\"post\" novalidate>\n  <fieldset>\n    <legend>Sign In</legend>\n    <label for=\"email\">Email:</label>\n    <input type=\"email\" id=\"email\" name=\"email\" required autocomplete=\"email\" />\n    <label for=\"password\">Password:</label>\n    <input type=\"password\" id=\"password\" name=\"password\" required minlength=\"8\" />\n    <button type=\"submit\">Login</button>\n  </fieldset>\n</form>" },
        { id: 'html9', title: 'Responsive Picture', difficulty: 'advanced', text: "<picture>\n  <source media=\"(min-width: 1024px)\" srcset=\"hero-large.webp\" type=\"image/webp\" />\n  <source media=\"(min-width: 768px)\" srcset=\"hero-medium.webp\" type=\"image/webp\" />\n  <img src=\"hero-small.jpg\" alt=\"Hero image\" loading=\"lazy\" width=\"800\" height=\"400\" />\n</picture>" },
        { id: 'html10', title: 'Dialog Modal', difficulty: 'advanced', text: "<dialog id=\"confirm-modal\" aria-modal=\"true\" aria-labelledby=\"dialog-title\">\n  <h2 id=\"dialog-title\">Confirm Action</h2>\n  <p>Are you sure you want to delete this item?</p>\n  <menu>\n    <button autofocus>Cancel</button>\n    <button type=\"submit\" form=\"delete-form\">Delete</button>\n  </menu>\n</dialog>" }
    ],
    css: [
        { id: 'css1', title: 'Flex Center', difficulty: 'beginner', text: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  gap: 1rem;\n  padding: 1rem;\n}" },
        { id: 'css2', title: 'CSS Grid', difficulty: 'intermediate', text: ".grid-layout {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  grid-template-rows: auto;\n  gap: 2rem;\n  padding: 2rem;\n}" },
        { id: 'css3', title: 'CSS Variables', difficulty: 'intermediate', text: ":root {\n  --primary: #6366f1;\n  --secondary: #d946ef;\n  --bg: #0f172a;\n  --text: #f1f5f9;\n  --radius: 0.75rem;\n  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\n}" },
        { id: 'css4', title: 'Keyframe Animation', difficulty: 'advanced', text: "@keyframes slideIn {\n  from {\n    opacity: 0;\n    transform: translateY(-20px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n.animated { animation: slideIn 0.3s ease forwards; }" },
        { id: 'css5', title: 'Gradient Card', difficulty: 'advanced', text: ".card {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border-radius: var(--radius);\n  padding: 2rem;\n  box-shadow: var(--shadow);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n.card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 20px 40px -12px rgb(0 0 0 / 0.3);\n}" },
        { id: 'css6', title: 'Pill Button', difficulty: 'beginner', text: ".btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.75rem 1.5rem;\n  border: none;\n  border-radius: 9999px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}" },
        { id: 'css7', title: 'Media Query', difficulty: 'intermediate', text: "@media (max-width: 768px) {\n  .sidebar { display: none; }\n  .main-content { grid-column: 1 / -1; }\n  .header { flex-direction: column; gap: 1rem; }\n}" },
        { id: 'css8', title: 'Glassmorphism', difficulty: 'advanced', text: ".glass {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 1rem;\n}" },
        { id: 'css9', title: 'Focus Ring', difficulty: 'intermediate', text: ".input:focus {\n  outline: none;\n  border-color: var(--primary);\n  box-shadow: 0 0 0 3px rgb(99 102 241 / 0.2);\n  transition: border-color 0.15s ease, box-shadow 0.15s ease;\n}" },
        { id: 'css10', title: 'Spinner Loader', difficulty: 'advanced', text: ".loader {\n  width: 40px;\n  height: 40px;\n  border: 3px solid rgba(99, 102, 241, 0.2);\n  border-top-color: #6366f1;\n  border-radius: 50%;\n  animation: spin 0.8s linear infinite;\n}\n@keyframes spin { to { transform: rotate(360deg); } }" }
    ],
    python: [
        { id: 'py1', title: 'List Comprehension', difficulty: 'beginner', text: "squares = [x**2 for x in range(10)]" },
        { id: 'py2', title: 'Function Definition', difficulty: 'beginner', text: "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)" },
        { id: 'py3', title: 'Dictionary Loop', difficulty: 'beginner', text: "for key, value in my_dict.items():\n    print(f'{key}: {value}')" },
        { id: 'py4', title: 'Lambda Function', difficulty: 'beginner', text: "add = lambda x, y: x + y\nprint(add(5, 3))" },
        { id: 'py5', title: 'Class Definition', difficulty: 'intermediate', text: "class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        return 'Woof!'" },
        { id: 'py6', title: 'Property Decorator', difficulty: 'intermediate', text: "@property\ndef full_name(self):\n    return f\"{self.first_name} {self.last_name}\"\n\n@full_name.setter\ndef full_name(self, value):\n    parts = value.split(\" \", 1)\n    self.first_name = parts[0]\n    self.last_name = parts[1] if len(parts) > 1 else \"\"" },
        { id: 'py7', title: 'LRU Cache', difficulty: 'intermediate', text: "from functools import lru_cache\n\n@lru_cache(maxsize=128)\ndef fibonacci(n: int) -> int:\n    if n < 2:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)" },
        { id: 'py8', title: 'File Processing', difficulty: 'intermediate', text: "with open(\"data.json\", \"r\", encoding=\"utf-8\") as f:\n    data = json.load(f)\n\nfiltered = [item for item in data if item[\"active\"]]\n\nwith open(\"output.json\", \"w\") as f:\n    json.dump(filtered, f, indent=2)" },
        { id: 'py9', title: 'Dataclass', difficulty: 'advanced', text: "from dataclasses import dataclass, field\nfrom typing import List\n\n@dataclass\nclass User:\n    id: int\n    name: str\n    email: str\n    roles: List[str] = field(default_factory=list)\n    active: bool = True" },
        { id: 'py10', title: 'Async Gather', difficulty: 'advanced', text: "import asyncio\n\nasync def fetch_all(urls: list[str]) -> list[str]:\n    async with aiohttp.ClientSession() as session:\n        tasks = [fetch(session, url) for url in urls]\n        return await asyncio.gather(*tasks)" }
    ],
    sql: [
        { id: 'sql1', title: 'Basic SELECT', difficulty: 'beginner', text: "SELECT id, name, email\nFROM users\nWHERE active = true\nORDER BY created_at DESC\nLIMIT 10;" },
        { id: 'sql2', title: 'JOIN with Aggregation', difficulty: 'intermediate', text: "SELECT u.name, COUNT(o.id) AS order_count, SUM(o.total) AS revenue\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.status = 'completed'\nGROUP BY u.id, u.name\nHAVING COUNT(o.id) > 5\nORDER BY revenue DESC;" },
        { id: 'sql3', title: 'CTE with Window Function', difficulty: 'advanced', text: "WITH monthly_revenue AS (\n  SELECT DATE_TRUNC('month', created_at) AS month,\n         SUM(amount) AS revenue\n  FROM transactions\n  WHERE status = 'paid'\n  GROUP BY 1\n),\nrunning_total AS (\n  SELECT month, revenue,\n         SUM(revenue) OVER (ORDER BY month) AS cumulative\n  FROM monthly_revenue\n)\nSELECT * FROM running_total;" },
        { id: 'sql4', title: 'CREATE TABLE', difficulty: 'intermediate', text: "CREATE TABLE products (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),\n  stock INT DEFAULT 0,\n  category_id INT REFERENCES categories(id) ON DELETE SET NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);" },
        { id: 'sql5', title: 'UPDATE RETURNING', difficulty: 'beginner', text: "UPDATE users\nSET last_login = NOW(),\n    login_count = login_count + 1\nWHERE id = $1\nRETURNING id, name, last_login;" },
        { id: 'sql6', title: 'RANK Window Function', difficulty: 'intermediate', text: "SELECT\n  p.name AS product,\n  AVG(r.rating) AS avg_rating,\n  COUNT(r.id) AS review_count,\n  RANK() OVER (PARTITION BY p.category_id ORDER BY AVG(r.rating) DESC) AS rank\nFROM products p\nLEFT JOIN reviews r ON r.product_id = p.id\nGROUP BY p.id, p.name, p.category_id;" },
        { id: 'sql7', title: 'PL/pgSQL Block', difficulty: 'advanced', text: "DO $$\nDECLARE\n  v_user_id INT := 42;\n  v_balance DECIMAL;\nBEGIN\n  SELECT balance INTO v_balance FROM wallets WHERE user_id = v_user_id FOR UPDATE;\n  IF v_balance < 100 THEN\n    RAISE EXCEPTION 'Insufficient balance';\n  END IF;\n  UPDATE wallets SET balance = balance - 100 WHERE user_id = v_user_id;\n  INSERT INTO transactions (user_id, amount, type) VALUES (v_user_id, -100, 'debit');\n  COMMIT;\nEND $$;" },
        { id: 'sql8', title: 'Date Filter', difficulty: 'beginner', text: "SELECT * FROM orders\nWHERE created_at >= NOW() - INTERVAL '30 days'\n  AND total > 0\n  AND status IN ('pending', 'processing')\nORDER BY created_at DESC;" },
        { id: 'sql9', title: 'Partial Index', difficulty: 'intermediate', text: "CREATE INDEX CONCURRENTLY idx_orders_user_date\nON orders (user_id, created_at DESC)\nWHERE status != 'cancelled';" },
        { id: 'sql10', title: 'Pivot with CASE', difficulty: 'advanced', text: "SELECT\n  user_id,\n  SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) AS credits,\n  SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) AS debits,\n  SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) AS net_balance\nFROM transactions\nGROUP BY user_id\nORDER BY net_balance DESC;" }
    ],
    java: [
        { id: 'java1', title: 'Hello World', difficulty: 'beginner', text: "public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}" },
        { id: 'java2', title: 'Generic Stack', difficulty: 'intermediate', text: "public class Stack<T> {\n    private final List<T> items = new ArrayList<>();\n\n    public void push(T item) { items.add(item); }\n    public T pop() { return items.remove(items.size() - 1); }\n    public T peek() { return items.get(items.size() - 1); }\n    public boolean isEmpty() { return items.isEmpty(); }\n}" },
        { id: 'java3', title: 'Stream Pipeline', difficulty: 'advanced', text: "List<String> result = employees.stream()\n    .filter(e -> e.getDepartment().equals(\"Engineering\"))\n    .sorted(Comparator.comparingInt(Employee::getSalary).reversed())\n    .limit(10)\n    .map(Employee::getName)\n    .collect(Collectors.toList());" },
        { id: 'java4', title: 'Optional Chain', difficulty: 'intermediate', text: "public Optional<User> findByEmail(String email) {\n    return userRepository.findAll().stream()\n        .filter(u -> u.getEmail().equalsIgnoreCase(email))\n        .findFirst();\n}" },
        { id: 'java5', title: 'Functional Interface', difficulty: 'advanced', text: "@FunctionalInterface\npublic interface Transformer<T, R> {\n    R transform(T input);\n\n    default <V> Transformer<T, V> andThen(Transformer<R, V> after) {\n        return input -> after.transform(this.transform(input));\n    }\n}" },
        { id: 'java6', title: 'JDBC Query', difficulty: 'intermediate', text: "try (Connection conn = dataSource.getConnection();\n     PreparedStatement ps = conn.prepareStatement(\n         \"SELECT * FROM users WHERE id = ?\")) {\n    ps.setInt(1, userId);\n    ResultSet rs = ps.executeQuery();\n    if (rs.next()) return mapUser(rs);\n} catch (SQLException e) {\n    throw new DatabaseException(\"Query failed\", e);\n}" },
        { id: 'java7', title: 'Recursive Factorial', difficulty: 'beginner', text: "public int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}" },
        { id: 'java8', title: 'Spring REST Controller', difficulty: 'advanced', text: "@RestController\n@RequestMapping(\"/api/users\")\npublic class UserController {\n    @GetMapping(\"/{id}\")\n    public ResponseEntity<User> getUser(@PathVariable Long id) {\n        return userService.findById(id)\n            .map(ResponseEntity::ok)\n            .orElse(ResponseEntity.notFound().build());\n    }\n}" },
        { id: 'java9', title: 'Builder Pattern', difficulty: 'intermediate', text: "public class Builder<T> {\n    private final Map<String, Object> fields = new LinkedHashMap<>();\n\n    public Builder<T> set(String key, Object value) {\n        fields.put(key, value);\n        return this;\n    }\n}" },
        { id: 'java10', title: 'CompletableFuture', difficulty: 'advanced', text: "CompletableFuture<String> future = CompletableFuture\n    .supplyAsync(() -> fetchData(url))\n    .thenApply(data -> processData(data))\n    .thenApply(result -> formatResult(result))\n    .exceptionally(ex -> \"Error: \" + ex.getMessage());" }
    ],
    cpp: [
        { id: 'cpp1', title: 'Sort Array', difficulty: 'beginner', text: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {5, 2, 8, 1, 9};\n    int n = sizeof(arr) / sizeof(arr[0]);\n    sort(arr, arr + n);\n    for (int x : arr) cout << x << \" \";\n    return 0;\n}" },
        { id: 'cpp2', title: 'Smart Pointer', difficulty: 'intermediate', text: "template <typename T>\nclass SmartPtr {\n    T* ptr;\npublic:\n    explicit SmartPtr(T* p) : ptr(p) {}\n    ~SmartPtr() { delete ptr; }\n    T& operator*() { return *ptr; }\n    T* operator->() { return ptr; }\n};" },
        { id: 'cpp3', title: 'Variadic Template', difficulty: 'advanced', text: "template <typename... Args>\nvoid log(const std::string& fmt, Args&&... args) {\n    std::ostringstream oss;\n    ((oss << std::forward<Args>(args) << \" \"), ...);\n    std::cout << \"[LOG] \" << fmt << \": \" << oss.str() << \"\\n\";\n}" },
        { id: 'cpp4', title: 'Linked List Node', difficulty: 'intermediate', text: "struct Node {\n    int val;\n    Node* next;\n    explicit Node(int v) : val(v), next(nullptr) {}\n};\n\nvoid insert(Node*& head, int val) {\n    Node* node = new Node(val);\n    node->next = head;\n    head = node;\n}" },
        { id: 'cpp5', title: 'Thread Pool', difficulty: 'advanced', text: "class ThreadPool {\n    vector<thread> workers;\n    queue<function<void()>> tasks;\n    mutex mtx;\n    condition_variable cv;\n    bool stop = false;\npublic:\n    explicit ThreadPool(size_t n) {\n        for (size_t i = 0; i < n; ++i)\n            workers.emplace_back([this] { worker(); });\n    }\n};" },
        { id: 'cpp6', title: 'Ranges View', difficulty: 'intermediate', text: "auto nums = vector<int>{1,2,3,4,5,6,7,8,9,10};\nauto evens = nums | views::filter([](int n){ return n % 2 == 0; })\n           | views::transform([](int n){ return n * n; });\nfor (auto v : evens) cout << v << \" \";" },
        { id: 'cpp7', title: 'Abstract Class', difficulty: 'beginner', text: "class Animal {\npublic:\n    virtual string speak() const = 0;\n    virtual ~Animal() = default;\n};\nclass Dog : public Animal {\npublic:\n    string speak() const override { return \"Woof!\"; }\n};" },
        { id: 'cpp8', title: 'Concepts (C++20)', difficulty: 'advanced', text: "template <typename T>\nconcept Numeric = std::is_arithmetic_v<T>;\n\ntemplate <Numeric T>\nT clamp(T val, T lo, T hi) {\n    return std::max(lo, std::min(val, hi));\n}" },
        { id: 'cpp9', title: 'Unique Ptr Array', difficulty: 'intermediate', text: "unique_ptr<int[]> arr = make_unique<int[]>(10);\nfor (int i = 0; i < 10; ++i) arr[i] = i * i;\nauto sum = accumulate(arr.get(), arr.get() + 10, 0);\ncout << \"Sum: \" << sum << endl;" },
        { id: 'cpp10', title: 'Word Count Map', difficulty: 'beginner', text: "map<string, int> wordCount;\nstring word;\nwhile (cin >> word) wordCount[word]++;\nfor (const auto& [w, c] : wordCount)\n    cout << w << \": \" << c << \"\\n\";" }
    ],
    bash: [
        { id: 'bash1', title: 'Hello Script', difficulty: 'beginner', text: "#!/bin/bash\nNAME=${1:-\"World\"}\necho \"Hello, $NAME!\"\necho \"Running on: $(uname -s)\"\necho \"Date: $(date +%Y-%m-%d)\"" },
        { id: 'bash2', title: 'Compress Logs', difficulty: 'intermediate', text: "for file in *.log; do\n  size=$(stat -c%s \"$file\")\n  if [ \"$size\" -gt 1048576 ]; then\n    gzip \"$file\"\n    echo \"Compressed: $file\"\n  fi\ndone" },
        { id: 'bash3', title: 'Kill Node Process', difficulty: 'advanced', text: "ps aux | grep -v grep | grep node | awk '{print $2}' | xargs -I{} sh -c 'kill -9 {} && echo \"Killed PID {}\"' 2>/dev/null" },
        { id: 'bash4', title: 'Retry Function', difficulty: 'intermediate', text: "#!/bin/bash\nset -euo pipefail\n\nretry() {\n  local n=0\n  until [ \"$n\" -ge 3 ]; do\n    \"$@\" && break\n    n=$((n + 1))\n    echo \"Retry $n...\"\n    sleep 2\n  done\n}" },
        { id: 'bash5', title: 'Backup Function', difficulty: 'advanced', text: "backup() {\n  local src=\"$1\"\n  local dest=\"${2:-/backups}\"\n  local ts=$(date +%Y%m%d_%H%M%S)\n  local name=$(basename \"$src\")\n  tar -czf \"${dest}/${name}_${ts}.tar.gz\" -C \"$(dirname $src)\" \"$name\"\n  echo \"Backed up to ${dest}/${name}_${ts}.tar.gz\"\n}" },
        { id: 'bash6', title: 'Check Dependencies', difficulty: 'intermediate', text: "check_dependencies() {\n  local deps=(\"git\" \"node\" \"npm\" \"docker\")\n  for dep in \"${deps[@]}\"; do\n    if ! command -v \"$dep\" &>/dev/null; then\n      echo \"Error: $dep not found\" >&2\n      exit 1\n    fi\n  done\n  echo \"All dependencies satisfied\"\n}" },
        { id: 'bash7', title: 'Load .env File', difficulty: 'beginner', text: "if [ -f \"$HOME/.env\" ]; then\n  source \"$HOME/.env\"\n  echo \"Loaded .env from home\"\nelif [ -f \".env\" ]; then\n  source \".env\"\n  echo \"Loaded local .env\"\nelse\n  echo \"No .env file found\" >&2\nfi" },
        { id: 'bash8', title: 'File Watcher', difficulty: 'advanced', text: "watch_files() {\n  inotifywait -mr --format '%e %w%f' -e modify,create,delete \"$1\" |\n  while read -r event file; do\n    echo \"[$event] $file\"\n    if [[ \"$file\" == *.js ]]; then\n      npm run lint:fix \"$file\" 2>/dev/null\n    fi\n  done\n}" },
        { id: 'bash9', title: 'GitHub API Call', difficulty: 'intermediate', text: "JSON_OUT=$(curl -sf \"https://api.github.com/repos/$1/commits\" \\\n  -H \"Accept: application/vnd.github+json\" \\\n  -H \"Authorization: Bearer $GITHUB_TOKEN\") || { echo \"API call failed\" >&2; exit 1; }\necho \"$JSON_OUT\" | jq '.[: 5] | .[].commit.message'" },
        { id: 'bash10', title: 'Trap Cleanup', difficulty: 'beginner', text: "cleanup() {\n  echo \"Cleaning up...\"\n  rm -rf /tmp/build_$$\n  exit 0\n}\ntrap cleanup EXIT INT TERM\nmkdir -p /tmp/build_$$" }
    ],
    rust: [
        { id: 'rs1', title: 'Ownership', difficulty: 'beginner', text: `fn main() {\n    let s = String::from("hello");\n    let len = calculate_length(&s);\n    println!("Length of '{}' is {}.", s, len);\n}` },
        { id: 'rs2', title: 'Pattern Match', difficulty: 'beginner', text: `match direction {\n    Direction::North => println!("Going north!"),\n    Direction::South => println!("Going south!"),\n    _ => println!("Going elsewhere!"),\n}` },
        { id: 'rs3', title: 'Struct Impl', difficulty: 'intermediate', text: `struct Rectangle {\n    width: u32,\n    height: u32,\n}\nimpl Rectangle {\n    fn area(&self) -> u32 {\n        self.width * self.height\n    }\n}` },
        { id: 'rs4', title: 'Error Handling', difficulty: 'intermediate', text: `fn read_file(path: &str) -> Result<String, io::Error> {\n    let mut s = String::new();\n    File::open(path)?.read_to_string(&mut s)?;\n    Ok(s)\n}` },
        { id: 'rs5', title: 'Iterator Chain', difficulty: 'intermediate', text: `let sum: i32 = (1..=10)\n    .filter(|x| x % 2 == 0)\n    .map(|x| x * x)\n    .sum();` },
        { id: 'rs6', title: 'Word Frequency', difficulty: 'intermediate', text: "use std::collections::HashMap;\n\nfn word_frequency(text: &str) -> HashMap<&str, usize> {\n    let mut map = HashMap::new();\n    for word in text.split_whitespace() {\n        *map.entry(word).or_insert(0) += 1;\n    }\n    map\n}" },
        { id: 'rs7', title: 'Display Impl', difficulty: 'advanced', text: "impl<T: Display + PartialOrd> fmt::Display for MinMax<T> {\n    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {\n        write!(f, \"({}, {})\", self.0, self.1)\n    }\n}" },
        { id: 'rs8', title: 'Async HTTP Fetch', difficulty: 'advanced', text: "async fn fetch_json<T: DeserializeOwned>(url: &str) -> Result<T, reqwest::Error> {\n    reqwest::get(url).await?.json::<T>().await\n}" },
        { id: 'rs9', title: 'Config Builder', difficulty: 'advanced', text: "let config = Config::builder()\n    .set_default(\"host\", \"localhost\")?\n    .set_default(\"port\", 8080)?\n    .add_source(File::with_name(\"config\"))\n    .add_source(Environment::with_prefix(\"APP\"))\n    .build()?;" },
        { id: 'rs10', title: 'Partition Iterator', difficulty: 'intermediate', text: "fn partition<T, F>(vec: Vec<T>, f: F) -> (Vec<T>, Vec<T>)\nwhere\n    F: Fn(&T) -> bool,\n{\n    vec.into_iter().partition(f)\n}" }
    ],
    go: [
        { id: 'go1', title: 'Goroutine', difficulty: 'beginner', text: `func main() {\n    go func() {\n        fmt.Println("running in goroutine")\n    }()\n    time.Sleep(1 * time.Second)\n}` },
        { id: 'go2', title: 'Interface', difficulty: 'beginner', text: `type Animal interface {\n    Sound() string\n}\ntype Dog struct{}\nfunc (d Dog) Sound() string {\n    return "Woof"\n}` },
        { id: 'go3', title: 'Error Check', difficulty: 'beginner', text: `file, err := os.Open("test.txt")\nif err != nil {\n    log.Fatalf("failed to open: %s", err)\n}\ndefer file.Close()` },
        { id: 'go4', title: 'Channel', difficulty: 'intermediate', text: `ch := make(chan int)\ngo func() {\n    ch <- 42\n}()\nvalue := <-ch\nfmt.Println(value)` },
        { id: 'go5', title: 'Struct', difficulty: 'beginner', text: `type Person struct {\n    Name string\n    Age  int\n}\np := Person{Name: "Alice", Age: 30}\nfmt.Printf("%s is %d years old\\n", p.Name, p.Age)` },
        { id: 'go6', title: 'Memoize', difficulty: 'intermediate', text: "func memoize(fn func(int) int) func(int) int {\n    cache := make(map[int]int)\n    return func(n int) int {\n        if v, ok := cache[n]; ok {\n            return v\n        }\n        result := fn(n)\n        cache[n] = result\n        return result\n    }\n}" },
        { id: 'go7', title: 'Config Struct', difficulty: 'beginner', text: "type Config struct {\n    Host    string `json:\"host\" yaml:\"host\"`\n    Port    int    `json:\"port\" yaml:\"port\"`\n    Debug   bool   `json:\"debug\" yaml:\"debug\"`\n    Timeout int    `json:\"timeout\" yaml:\"timeout\"`\n}" },
        { id: 'go8', title: 'Worker Pool', difficulty: 'advanced', text: "func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {\n    defer wg.Done()\n    for j := range jobs {\n        results <- j * j\n        fmt.Printf(\"Worker %d processed job %d\\n\", id, j)\n    }\n}" },
        { id: 'go9', title: 'Retry Helper', difficulty: 'intermediate', text: "func Retry(attempts int, sleep time.Duration, fn func() error) error {\n    for i := 0; i < attempts; i++ {\n        if err := fn(); err != nil {\n            time.Sleep(sleep)\n            continue\n        }\n        return nil\n    }\n    return fmt.Errorf(\"failed after %d attempts\", attempts)\n}" },
        { id: 'go10', title: 'Middleware Chain', difficulty: 'advanced', text: "type Middleware func(http.HandlerFunc) http.HandlerFunc\n\nfunc Chain(f http.HandlerFunc, middlewares ...Middleware) http.HandlerFunc {\n    for _, m := range middlewares {\n        f = m(f)\n    }\n    return f\n}" }
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
    const available = ['javascript', 'typescript', 'html', 'css', 'python', 'sql', 'java', 'cpp', 'bash', 'rust', 'go'];
    const lang = available.includes(language) ? language : 'javascript';
    const snippets = CODE_SNIPPETS[lang];
    return snippets[Math.floor(Math.random() * snippets.length)];
};
