// Step 1: lib/cookies.js - MINIMAL VERSION
// Start with this basic version first

// Simple cookie management without external dependencies
export const setCookie = (name, value, days = 7) => {
    if (typeof window === 'undefined') return; // Server-side safety
    
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const cookieString = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
      
      document.cookie = cookieString;
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  };
  
  export const getCookie = (name) => {
    if (typeof window === 'undefined') return null; // Server-side safety
    
    try {
      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
      
      return value ? JSON.parse(decodeURIComponent(value)) : null;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  };
  
  export const removeCookie = (name) => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };
  
  // User session functions
  export const setUserSession = (userData) => {
    const sessionData = {
      id: userData.id || Date.now().toString(),
      name: userData.name,
      email: userData.email,
      unitNumber: userData.unitNumber,
      loginTime: new Date().toISOString(),
      sessionId: Math.random().toString(36).substring(2, 15)
    };
    
    setCookie('oceanview_user', sessionData);
    return sessionData;
  };
  
  export const getUserSession = () => {
    return getCookie('oceanview_user');
  };
  
  export const clearUserSession = () => {
    removeCookie('oceanview_user');
  };
  
  export const isLoggedIn = () => {
    return getUserSession() !== null;
  };