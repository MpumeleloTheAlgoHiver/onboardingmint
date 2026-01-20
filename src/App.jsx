import { useEffect, useState, useRef } from "react";
import { supabase } from "./lib/supabase.js";

import Preloader from "./components/Preloader.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import UserOnboardingPage from "./pages/UserOnboardingPage.jsx";

const initialHash = window.location.hash;
const isRecoveryMode = initialHash.includes('type=recovery');

const getTokensFromHash = (hash) => {
  if (!hash) return null;
  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken) {
    return { accessToken, refreshToken: refreshToken || accessToken };
  }
  return null;
};

const recoveryTokens = isRecoveryMode ? getTokensFromHash(initialHash) : null;

const App = () => {
  const [showPreloader, setShowPreloader] = useState(true);
  const [currentPage, setCurrentPage] = useState(isRecoveryMode ? "auth" : "welcome");
  const [authStep, setAuthStep] = useState(isRecoveryMode ? "newPassword" : "email");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const recoveryHandled = useRef(false);

  useEffect(() => {
    const setupRecoverySession = async () => {
      if (isRecoveryMode && recoveryTokens && supabase) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: recoveryTokens.accessToken,
            refresh_token: recoveryTokens.refreshToken
          });
          
          if (!error) {
            setSessionReady(true);
          }
        } catch (err) {
          console.error('Error setting recovery session:', err);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setIsCheckingAuth(false);
    };
    
    if (isRecoveryMode) {
      setupRecoverySession();
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase || isRecoveryMode) {
      return;
    }
    
    const handleRecoveryFlow = () => {
      if (recoveryHandled.current) return;
      recoveryHandled.current = true;
      setAuthStep("newPassword");
      setCurrentPage("auth");
      window.history.replaceState({}, document.title, window.location.pathname);
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        handleRecoveryFlow();
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return;
    
    setShowPreloader(true);
    const timeoutId = setTimeout(() => {
      setShowPreloader(false);
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [currentPage, isCheckingAuth]);

  if (showPreloader) {
    return <Preloader />;
  }

  const openAuthFlow = (step) => {
    setAuthStep(step);
    setCurrentPage("auth");
  };

  if (currentPage === "welcome") {
    return (
      <OnboardingPage
        onCreateAccount={() => openAuthFlow("email")}
        onLogin={() => openAuthFlow("loginEmail")}
      />
    );
  }

  if (currentPage === "home") {
    return <HomePage />;
  }

  if (currentPage === "userOnboarding") {
    return <UserOnboardingPage onComplete={() => setCurrentPage("home")} />;
  }

  return (
    <AuthPage
      initialStep={authStep}
      onSignupComplete={() => setCurrentPage("userOnboarding")}
      onLoginComplete={() => setCurrentPage("home")}
    />
  );
};

export default App;
