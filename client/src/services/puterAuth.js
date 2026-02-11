/**
 * Initialize and authenticate Puter.js automatically on app load
 */
export const initializePuterAuth = async () => {
  if (!window.puter) {
    console.error('Puter.js not loaded');
    return false;
  }

  try {
    const email = import.meta.env.VITE_PUTER_EMAIL;
    const password = import.meta.env.VITE_PUTER_PASSWORD;

    if (!email || !password) {
      console.log('Puter credentials not configured, using guest mode');
      return true;
    }

    await window.puter.auth.signIn({ username: email, password: password });
    console.log('✅ Puter authenticated successfully');
    return true;
  } catch (error) {
    console.log('⚠️ Puter auth failed, continuing in guest mode:', error.message);
    return true;
  }
};
