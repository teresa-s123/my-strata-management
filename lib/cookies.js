// lib/cookies.js
// Cookie utilities for user session management
// Adapted for existing Oceanview Apartments structure

// Simple cookie management without external dependencies
const COOKIE_OPTIONS = {
    expires: 7, // 7 days
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
    sameSite: 'lax',
    path: '/'
  };
  
  const USER_COOKIE_NAME = 'oceanview_user';
  const PREFERENCES_COOKIE_NAME = 'oceanview_preferences';
  
  // Basic cookie utilities (no external library needed)
  const setCookie = (name, value, options = {}) => {
    if (typeof window === 'undefined') return; // Server-side safety
    
    const opts = { ...COOKIE_OPTIONS, ...options };
    let cookieString = `${name}=${encodeURIComponent(JSON.stringify(value))}`;
    
    if (opts.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (opts.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    
    cookieString += `; path=${opts.path}`;
    cookieString += `; samesite=${opts.sameSite}`;
    
    if (opts.secure) {
      cookieString += '; secure';
    }
    
    document.cookie = cookieString;
  };
  
  const getCookie = (name) => {
    if (typeof window === 'undefined') return null; // Server-side safety
    
    try {
      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
      
      return value ? JSON.parse(decodeURIComponent(value)) : null;
    } catch (error) {
      console.error('Error parsing cookie:', error);
      removeCookie(name);
      return null;
    }
  };
  
  const removeCookie = (name) => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };
  
  // User authentication functions
  export const setUserCookie = (userData) => {
    try {
      const userInfo = {
        id: userData.id || Math.random().toString(36).substring(7),
        name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        email: userData.email,
        unitNumber: userData.unit_number || userData.unitNumber,
        unitId: userData.unit_id || userData.unitId,
        unitType: userData.unit_type || userData.unitType || '2BR Apartment',
        loginTime: new Date().toISOString(),
        sessionId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        lastActivity: new Date().toISOString()
      };
      
      setCookie(USER_COOKIE_NAME, userInfo);
      
      // Track login in localStorage for session stats
      if (typeof window !== 'undefined') {
        const loginHistory = JSON.parse(localStorage.getItem('oceanview_login_history') || '[]');
        loginHistory.push({
          unitNumber: userInfo.unitNumber,
          loginTime: userInfo.loginTime,
          sessionId: userInfo.sessionId,
          userAgent: navigator.userAgent.substring(0, 100)
        });
        
        // Keep only last 20 logins
        if (loginHistory.length > 20) {
          loginHistory.splice(0, loginHistory.length - 20);
        }
        
        localStorage.setItem('oceanview_login_history', JSON.stringify(loginHistory));
      }
      
      return userInfo;
    } catch (error) {
      console.error('Error setting user cookie:', error);
      return null;
    }
  };
  
  export const getUserCookie = () => {
    try {
      const userData = getCookie(USER_COOKIE_NAME);
      if (!userData) return null;
      
      // Check if session is still valid (not older than 7 days)
      const loginTime = new Date(userData.loginTime);
      const now = new Date();
      const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        removeUserCookie();
        return null;
      }
      
      return userData;
    } catch (error) {
      console.error('Error getting user cookie:', error);
      removeUserCookie();
      return null;
    }
  };
  
  export const removeUserCookie = () => {
    try {
      const user = getUserCookie();
      removeCookie(USER_COOKIE_NAME);
      
      // Update login history with logout time
      if (user && typeof window !== 'undefined') {
        const loginHistory = JSON.parse(localStorage.getItem('oceanview_login_history') || '[]');
        const updatedHistory = loginHistory.map(login => 
          login.sessionId === user.sessionId 
            ? { ...login, logoutTime: new Date().toISOString() }
            : login
        );
        localStorage.setItem('oceanview_login_history', JSON.stringify(updatedHistory));
      }
      
      return true;
    } catch (error) {
      console.error('Error removing user cookie:', error);
      return false;
    }
  };
  
  export const isUserLoggedIn = () => {
    return getUserCookie() !== null;
  };
  
  // User preferences functions
  export const setPreferencesCookie = (preferences) => {
    try {
      const currentPrefs = getPreferencesCookie();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      setCookie(PREFERENCES_COOKIE_NAME, updatedPrefs);
      return updatedPrefs;
    } catch (error) {
      console.error('Error setting preferences cookie:', error);
      return null;
    }
  };
  
  export const getPreferencesCookie = () => {
    try {
      const prefs = getCookie(PREFERENCES_COOKIE_NAME);
      return prefs || {
        theme: 'light',
        notifications: true,
        language: 'en',
        dashboardLayout: 'grid',
        autoLogout: true
      };
    } catch (error) {
      console.error('Error getting preferences cookie:', error);
      return {
        theme: 'light',
        notifications: true,
        language: 'en',
        dashboardLayout: 'grid',
        autoLogout: true
      };
    }
  };
  
  export const removePreferencesCookie = () => {
    try {
      removeCookie(PREFERENCES_COOKIE_NAME);
      return true;
    } catch (error) {
      console.error('Error removing preferences cookie:', error);
      return false;
    }
  };
  
  // Session management functions
  export const updateLastActivity = () => {
    const user = getUserCookie();
    if (user) {
      user.lastActivity = new Date().toISOString();
      setCookie(USER_COOKIE_NAME, user);
    }
  };
  
  export const getSessionDuration = () => {
    const user = getUserCookie();
    if (!user || !user.loginTime) return null;
    
    const loginTime = new Date(user.loginTime);
    const now = new Date();
    const durationMs = now - loginTime;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, totalMinutes: Math.floor(durationMs / (1000 * 60)) };
  };
  
  export const getLoginHistory = () => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('oceanview_login_history') || '[]');
    } catch (error) {
      console.error('Error getting login history:', error);
      return [];
    }
  };
  
  // Auto-logout functionality
  export const setupAutoLogout = () => {
    if (typeof window === 'undefined') return;
    
    const preferences = getPreferencesCookie();
    if (!preferences.autoLogout) return;
    
    let logoutTimer;
    const LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes of inactivity
    
    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        if (isUserLoggedIn()) {
          removeUserCookie();
          window.location.href = '/login?reason=timeout';
        }
      }, LOGOUT_TIME);
      
      updateLastActivity();
    };
    
    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer(); // Start the timer
  };
  
  // Utility functions
  export const getCookieStats = () => {
    if (typeof window === 'undefined') return { totalCookies: 0, oceanviewCookies: 0 };
    
    const allCookies = document.cookie.split(';').map(cookie => cookie.trim()).filter(c => c);
    const oceanviewCookies = allCookies.filter(cookie => 
      cookie.startsWith('oceanview_') || 
      cookie.includes('oceanview')
    );
    
    return {
      totalCookies: allCookies.length,
      oceanviewCookies: oceanviewCookies.length,
      userLoggedIn: isUserLoggedIn(),
      sessionDuration: getSessionDuration(),
      loginHistory: getLoginHistory().length
    };
  };
  
  // Enhanced session validation
  export const validateSession = () => {
    const user = getUserCookie();
    if (!user) return false;
    
    try {
      // Check required fields
      const requiredFields = ['sessionId', 'loginTime', 'email'];
      for (const field of requiredFields) {
        if (!user[field]) {
          console.warn(`Invalid session: missing ${field}`);
          removeUserCookie();
          return false;
        }
      }
      
      // Check session age
      const loginTime = new Date(user.loginTime);
      const now = new Date();
      const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        console.warn('Session expired due to age');
        removeUserCookie();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      removeUserCookie();
      return false;
    }
  };
  
  // Cookie monitoring and cleanup
  export const cleanupExpiredCookies = () => {
    try {
      const user = getUserCookie();
      if (!user) return;
      
      const loginTime = new Date(user.loginTime);
      const now = new Date();
      const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        removeUserCookie();
        removePreferencesCookie();
        console.log('Expired cookies cleaned up');
      }
    } catch (error) {
      console.error('Error cleaning up cookies:', error);
    }
  };