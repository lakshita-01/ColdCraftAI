/**
 * Initialize and authenticate Puter.js automatically on app load
 */
let isAuthenticating = false;
let authPromise = null;

export const initializePuterAuth = async () => {
  // Prevent multiple simultaneous auth attempts
  if (isAuthenticating && authPromise) {
    return authPromise;
  }

  isAuthenticating = true;
  
  authPromise = (async () => {
    // Wait for Puter to be available
    let attempts = 0;
    while (!window.puter && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.puter) {
      console.error('Puter.js not loaded after waiting');
      isAuthenticating = false;
      return false;
    }

    try {
      const email = import.meta.env.VITE_PUTER_EMAIL;
      const password = import.meta.env.VITE_PUTER_PASSWORD;

      if (!email || !password) {
        console.log('Puter credentials not configured, using guest mode');
        isAuthenticating = false;
        return true;
      }

      // Silent authentication
      await window.puter.auth.signIn({ username: email, password: password });
      
      // Prewarm the AI with a tiny request
      if (window.puter.ai) {
        window.puter.ai.chat('Hi').catch(() => {});
      }
      
      console.log('✅ Puter ready');
      isAuthenticating = false;
      return true;
    } catch (error) {
      console.log('⚠️ Puter continuing in guest mode');
      isAuthenticating = false;
      return true;
    }
  })();

  return authPromise;
};
