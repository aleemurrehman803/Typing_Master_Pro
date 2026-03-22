# 🧪 TYPEMASTER PRO - REGRESSION TESTING FRAMEWORK

**Created**: January 15, 2026  
**Status**: ✅ READY TO IMPLEMENT

---

## 📊 OVERVIEW

This document outlines the complete regression testing framework for TypeMaster Pro, including unit tests, integration tests, E2E tests, and CI/CD pipeline configuration.

---

## 🏗️ TESTING ARCHITECTURE

### Technology Stack
- **Test Runner**: Jest 29.x
- **React Testing**: React Testing Library
- **E2E Testing**: Playwright
- **Coverage**: Istanbul (via Jest)
- **CI/CD**: GitHub Actions
- **Mocking**: MSW (Mock Service Worker)

### Test Types
1. **Unit Tests** - Individual functions/components
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Full user flows
4. **Visual Regression** - Screenshot comparison
5. **Performance Tests** - Load time, bundle size

---

## 📁 PROJECT STRUCTURE

```
TypeMasterPro/
├── tests/
│   ├── unit/
│   │   ├── utils/
│   │   │   ├── featureFlags.test.js
│   │   │   ├── levelSystem.test.js
│   │   │   ├── hashChain.test.js
│   │   │   └── achievements.test.js
│   │   ├── hooks/
│   │   │   ├── useTypingEngine.test.js
│   │   │   └── useVoiceDictation.test.js
│   │   └── components/
│   │       ├── SpeedChallenge.test.jsx
│   │       ├── DeviceRestriction.test.jsx
│   │       └── Captcha.test.jsx
│   ├── integration/
│   │   ├── auth-flow.test.jsx
│   │   ├── profile-completion.test.jsx
│   │   ├── typing-test.test.jsx
│   │   └── level-progression.test.jsx
│   ├── e2e/
│   │   ├── login.spec.ts
│   │   ├── profile.spec.ts
│   │   ├── typing-test.spec.ts
│   │   └── speed-challenge.spec.ts
│   ├── mocks/
│   │   ├── handlers.js
│   │   ├── server.js
│   │   └── data.js
│   └── setup/
│       ├── jest.config.js
│       ├── jest.setup.js
│       └── playwright.config.ts
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── e2e.yml
└── package.json (updated with test scripts)
```

---

## 🔧 CONFIGURATION FILES

### 1. jest.config.js
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.d.ts',
    '!src/test/**'
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx}',
    '<rootDir>/tests/integration/**/*.test.{js,jsx}'
  ]
};
```

### 2. jest.setup.js
```javascript
import '@testing-library/jest-dom';
import { server } from '../mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

### 3. playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 🧪 UNIT TESTS

### Example: featureFlags.test.js
```javascript
import { isFeatureEnabled, FLAGS } from '../../src/utils/featureFlags';

describe('Feature Flags', () => {
  test('should return correct flag value', () => {
    expect(isFeatureEnabled('ENABLE_ACCURACY_LOCK')).toBe(true);
    expect(isFeatureEnabled('VOICE_DICTATION')).toBe(false);
  });

  test('should return false for non-existent flag', () => {
    expect(isFeatureEnabled('NON_EXISTENT_FLAG')).toBe(false);
  });

  test('should have all required Level 1 flags', () => {
    expect(FLAGS.ENABLE_ACCURACY_LOCK).toBeDefined();
    expect(FLAGS.ENABLE_SLOW_MODE).toBeDefined();
    expect(FLAGS.ENABLE_VISUAL_GUIDES).toBeDefined();
    expect(FLAGS.ENABLE_SOFT_ERRORS).toBeDefined();
    expect(FLAGS.DISABLE_COMPETITION).toBeDefined();
  });
});
```

### Example: levelSystem.test.js
```javascript
import {
  calculateUserLevel,
  checkLevelUnlock,
  calculateXP,
  LEVELS
} from '../../src/utils/levelSystem';

describe('Level System', () => {
  const mockUserStats = {
    history: [
      { wpm: 45, accuracy: 92 },
      { wpm: 48, accuracy: 91 },
      { wpm: 42, accuracy: 93 },
      { wpm: 50, accuracy: 90 },
      { wpm: 47, accuracy: 94 },
      { wpm: 46, accuracy: 91 },
      { wpm: 49, accuracy: 92 },
      { wpm: 44, accuracy: 90 },
      { wpm: 51, accuracy: 93 },
      { wpm: 48, accuracy: 91 }
    ],
    integrityViolations: 0
  };

  test('should calculate Level 2 for qualifying user', () => {
    const level = calculateUserLevel(mockUserStats);
    expect(level).toBe(LEVELS.INTERMEDIATE);
  });

  test('should calculate Level 1 for new user', () => {
    const newUserStats = { history: [], integrityViolations: 0 };
    const level = calculateUserLevel(newUserStats);
    expect(level).toBe(LEVELS.BEGINNER);
  });

  test('should check level unlock correctly', () => {
    const unlock = checkLevelUnlock(mockUserStats, LEVELS.BEGINNER);
    expect(unlock.canUnlock).toBe(true);
    expect(unlock.nextLevel).toBe(LEVELS.INTERMEDIATE);
  });

  test('should calculate XP correctly', () => {
    const testResult = { wpm: 60, accuracy: 95, duration: 60 };
    const xp = calculateXP(testResult);
    expect(xp).toBeGreaterThan(0);
  });

  test('should give bonus XP for perfect accuracy', () => {
    const perfectTest = { wpm: 60, accuracy: 100, duration: 60 };
    const normalTest = { wpm: 60, accuracy: 95, duration: 60 };
    expect(calculateXP(perfectTest)).toBeGreaterThan(calculateXP(normalTest));
  });
});
```

### Example: SpeedChallenge.test.jsx
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import SpeedChallenge from '../../src/components/features/SpeedChallenge';

describe('SpeedChallenge Component', () => {
  const mockOnTargetSelect = jest.fn();

  test('renders without crashing', () => {
    render(<SpeedChallenge currentWpm={0} onTargetSelect={mockOnTargetSelect} />);
    expect(screen.getByText('Speed Challenge')).toBeInTheDocument();
  });

  test('shows empty state when no target selected', () => {
    render(<SpeedChallenge currentWpm={0} onTargetSelect={mockOnTargetSelect} selectedTarget={null} />);
    expect(screen.getByText('No target selected')).toBeInTheDocument();
  });

  test('displays target selection grid when expanded', () => {
    render(<SpeedChallenge currentWpm={0} onTargetSelect={mockOnTargetSelect} />);
    const selectButton = screen.getByText('Select Target');
    fireEvent.click(selectButton);
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  test('calls onTargetSelect when target is clicked', () => {
    render(<SpeedChallenge currentWpm={0} onTargetSelect={mockOnTargetSelect} />);
    fireEvent.click(screen.getByText('Select Target'));
    const target50 = screen.getByText('50');
    fireEvent.click(target50.closest('button'));
    expect(mockOnTargetSelect).toHaveBeenCalledWith(50);
  });

  test('calculates progress percentage correctly', () => {
    render(<SpeedChallenge currentWpm={30} onTargetSelect={mockOnTargetSelect} selectedTarget={60} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('shows motivational message based on progress', () => {
    render(<SpeedChallenge currentWpm={55} onTargetSelect={mockOnTargetSelect} selectedTarget={60} />);
    expect(screen.getByText(/Almost there/i)).toBeInTheDocument();
  });
});
```

---

## 🔗 INTEGRATION TESTS

### Example: auth-flow.test.jsx
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/App';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('Authentication Flow', () => {
  test('complete login flow with CAPTCHA', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to login
    const loginButton = screen.getByText(/Login/i);
    fireEvent.click(loginButton);

    // Verify CAPTCHA is shown
    expect(screen.getByText(/Enter CAPTCHA/i)).toBeInTheDocument();

    // Enter CAPTCHA
    const captchaInput = screen.getByPlaceholderText(/Enter code/i);
    fireEvent.change(captchaInput, { target: { value: 'ABC123' } });

    // Click login
    const submitButton = screen.getByRole('button', { name: /Login/i });
    fireEvent.click(submitButton);

    // Wait for redirect to profile
    await waitFor(() => {
      expect(screen.getByText(/Complete Your Profile/i)).toBeInTheDocument();
    });
  });

  test('blocks mobile devices', () => {
    // Mock mobile user agent
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/Desktop Only/i)).toBeInTheDocument();
  });
});
```

### Example: profile-completion.test.jsx
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../../src/pages/Profile';
import useAuthStore from '../../src/store/useAuthStore';

describe('Profile Completion Flow', () => {
  beforeEach(() => {
    // Reset auth store
    useAuthStore.setState({
      user: {
        id: '1',
        name: '',
        email: 'test@example.com',
        status: 'restricted',
        profile: {}
      }
    });
  });

  test('shows profile completion progress indicator', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Open edit modal
    fireEvent.click(screen.getByText(/Edit Profile/i));

    // Verify progress indicator is shown
    expect(screen.getByText(/Profile Completion/i)).toBeInTheDocument();
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
  });

  test('updates progress as fields are filled', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Edit Profile/i));

    // Fill name
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    // Progress should update
    await waitFor(() => {
      expect(screen.queryByText(/0%/i)).not.toBeInTheDocument();
    });
  });

  test('changes status to active after completion', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Fill all required fields
    // ... (fill all fields)

    // Submit
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      const user = useAuthStore.getState().user;
      expect(user.status).toBe('active');
    });
  });
});
```

---

## 🎭 E2E TESTS (Playwright)

### Example: login.spec.ts
```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should complete full login flow', async ({ page }) => {
    await page.goto('/');

    // Click login button
    await page.click('text=Login');

    // Verify CAPTCHA is shown
    await expect(page.locator('text=Enter CAPTCHA')).toBeVisible();

    // Enter CAPTCHA (mock will auto-verify)
    await page.fill('[placeholder="Enter code"]', 'ABC123');

    // Select Google login
    await page.click('text=Continue with Google');

    // Should redirect to profile page
    await expect(page).toHaveURL(/.*profile/);
    await expect(page.locator('text=Complete Your Profile')).toBeVisible();
  });

  test('should block mobile devices', async ({ page, context }) => {
    // Set mobile user agent
    await context.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    });

    await page.goto('/');

    // Should show desktop-only message
    await expect(page.locator('text=Desktop Only')).toBeVisible();
  });
});
```

### Example: typing-test.spec.ts
```typescript
import { test, expect } from '@playwright/test';

test.describe('Typing Test', () => {
  test.beforeEach(async ({ page }) => {
    // Login and complete profile
    await page.goto('/');
    // ... login flow
    // ... complete profile
  });

  test('should start and complete typing test', async ({ page }) => {
    await page.goto('/test');

    // Select paragraph
    await page.selectOption('select', 'b1');

    // Start typing
    await page.keyboard.type('The cat sat on the mat');

    // Verify WPM updates
    const wpmElement = page.locator('text=/WPM/');
    await expect(wpmElement).toBeVisible();

    // Verify accuracy updates
    const accuracyElement = page.locator('text=/%/');
    await expect(accuracyElement).toBeVisible();
  });

  test('should trigger accuracy lock at 90%', async ({ page }) => {
    await page.goto('/test');

    // Type with intentional errors
    await page.keyboard.type('Thx cxt sxt xn thx mxt');

    // Should show accuracy alert modal
    await expect(page.locator('text=Accuracy Alert')).toBeVisible();
  });

  test('should show speed challenge for Level 2 users', async ({ page }) => {
    // Set user to Level 2
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        level: 2,
        status: 'active'
      }));
    });

    await page.goto('/test');

    // Speed challenge should be visible
    await expect(page.locator('text=Speed Challenge')).toBeVisible();
  });
});
```

---

## 🤖 CI/CD PIPELINE

### GitHub Actions: .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Generate coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

    - name: Build project
      run: npm run build

    - name: Check bundle size
      run: npm run size-limit
```

### E2E Tests: .github/workflows/e2e.yml
```yaml
name: E2E Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  e2e:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright
      run: npx playwright install --with-deps

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

---

## 📦 PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "lint": "eslint src --ext .js,.jsx",
    "lint:fix": "eslint src --ext .js,.jsx --fix",
    "size-limit": "size-limit"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "@playwright/test": "^1.40.1",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "msw": "^2.0.11",
    "size-limit": "^11.0.1",
    "@size-limit/preset-app": "^11.0.1"
  }
}
```

---

## ✅ TEST COVERAGE GOALS

| Category | Target | Current |
|----------|--------|---------|
| Overall | 80% | TBD |
| Utils | 90% | TBD |
| Components | 75% | TBD |
| Hooks | 85% | TBD |
| Pages | 70% | TBD |

---

## 🎯 TESTING CHECKLIST

### Unit Tests
- [ ] Feature flags utility
- [ ] Level system calculations
- [ ] HashChain cryptography
- [ ] Achievement logic
- [ ] useTypingEngine hook
- [ ] SpeedChallenge component
- [ ] DeviceRestriction component
- [ ] Captcha component
- [ ] ProfileProgressIndicator component

### Integration Tests
- [ ] Complete auth flow
- [ ] Profile completion flow
- [ ] Typing test submission
- [ ] Level progression
- [ ] Speed challenge interaction
- [ ] Accuracy lock trigger

### E2E Tests
- [ ] Login with CAPTCHA
- [ ] Mobile device blocking
- [ ] Profile completion
- [ ] Typing test flow
- [ ] Speed challenge selection
- [ ] Battle Arena navigation

### Performance Tests
- [ ] Initial load time < 2s
- [ ] Route navigation < 500ms
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 90

---

## 📝 NEXT STEPS

1. **Install dependencies**: `npm install --save-dev @testing-library/react @testing-library/jest-dom jest @playwright/test`
2. **Create test files**: Follow the structure above
3. **Write unit tests**: Start with utils, then components
4. **Write integration tests**: Test complete flows
5. **Write E2E tests**: Test user journeys
6. **Setup CI/CD**: Configure GitHub Actions
7. **Run tests**: `npm run test`
8. **Monitor coverage**: Aim for 80%+

---

**Document Version**: 1.0  
**Status**: ✅ READY TO IMPLEMENT  
**Estimated Setup Time**: 1 week
