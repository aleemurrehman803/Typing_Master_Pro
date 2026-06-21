import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import { useEffect, Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import DeviceRestriction from './components/security/DeviceRestriction';
import SecurityHeaders from './components/SecurityHeaders';
import { analytics } from './utils/analytics';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Test = lazy(() => import('./pages/Test'));
const Profile = lazy(() => import('./pages/Profile'));
const Learn = lazy(() => import('./pages/Learn'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Exams = lazy(() => import('./pages/Exams'));
const Gamification = lazy(() => import('./pages/Gamification'));
const CommunityChat = lazy(() => import('./pages/CommunityChat'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Verify = lazy(() => import('./pages/Verify'));

// Games
const GalacticTypist = lazy(() => import('./pages/games/GalacticTypist'));
const CodeNinja = lazy(() => import('./pages/games/CodeNinja'));
const RhythmTyper = lazy(() => import('./pages/games/RhythmTyper'));
const NeonOverdrive = lazy(() => import('./pages/games/NeonOverdrive'));
const ZenGarden = lazy(() => import('./pages/games/ZenGarden'));
const TypingDuels = lazy(() => import('./pages/games/TypingDuel'));

// Arena
const ArenaLanding = lazy(() => import('./components/arena/ArenaLanding'));
const NoviceDojo = lazy(() => import('./components/arena/NoviceDojo'));
const BattleUI = lazy(() => import('./components/arena/BattleUI'));
const CompetitiveLeague = lazy(() => import('./components/arena/CompetitiveLeague'));
const ProCircuit = lazy(() => import('./components/arena/ProCircuit'));
const ArenaShop = lazy(() => import('./components/arena/ArenaShop'));

// Heavy Root components
const LiveChat = lazy(() => import('./components/LiveChat'));
const LevelUnlockModal = lazy(() => import('./components/ui/LevelUnlockModal'));

// Loader
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <Layout>{children}</Layout>;
};

// Page Tracker for route tracking
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

function App() {
  const { initAuth, user } = useAuthStore();

  useEffect(() => {
    // Wrap initAuth in safe block
    const safeInit = async () => {
      try {
        await initAuth();
      } catch (e) {
        console.error("Critical Auth Init Failure:", e);
      }
    };
    safeInit();
  }, []);

  // Dark Mode Handler
  useEffect(() => {
    if (user?.settings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.settings?.theme]);

  return (
    <ErrorBoundary>
      <SecurityHeaders />
      <Router>
        <PageTracker />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify/:certificateId" element={<Verify />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
            <Route path="/course/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
            <Route path="/gamification" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
            <Route path="/community/chat" element={<ProtectedRoute><CommunityChat /></ProtectedRoute>} />

            {/* Games & Arena routes */}
            <Route path="/game/galactic-typist" element={<GalacticTypist />} />
            <Route path="/game/code-ninja" element={<CodeNinja />} />
            <Route path="/game/rhythm-typer" element={<RhythmTyper />} />
            <Route path="/game/neon-overdrive" element={<NeonOverdrive />} />
            <Route path="/game/zen-garden" element={<ZenGarden />} />
            <Route path="/game/duels" element={<TypingDuels />} />

            <Route path="/arena" element={<ProtectedRoute><ArenaLanding /></ProtectedRoute>} />
            <Route path="/arena/dojo" element={<ProtectedRoute><NoviceDojo /></ProtectedRoute>} />
            <Route path="/arena/battle" element={<ProtectedRoute><BattleUI /></ProtectedRoute>} />
            <Route path="/arena/competitive" element={<ProtectedRoute><CompetitiveLeague /></ProtectedRoute>} />
            <Route path="/arena/pro" element={<ProtectedRoute><ProCircuit /></ProtectedRoute>} />
            <Route path="/arena/shop" element={<ProtectedRoute><ArenaShop /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <Suspense fallback={null}>
          <LiveChat />
        </Suspense>
        {/* Global Level Unlock Celebration Modal */}
        <Suspense fallback={null}>
          <LevelUnlockModal />
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
