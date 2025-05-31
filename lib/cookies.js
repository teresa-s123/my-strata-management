// lib/cookies.js
// Cookie utilities for user session management

import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // CSRF protection
  path: '/' // Available across entire site
};

const USER_COOKIE_NAME = 'strata_user';
const PREFERENCES_COOKIE_NAME = 'strata_preferences';

// User authentication functions
export const setUserCookie = (userData) => {
  try {
    const userInfo = {
      id: userData.id,
      name: `${userData.first_name} ${userData.last_name}`,
      email: userData.email,
      unitNumber: userData.units?.unit_number || userData.unit_number,
      unitId: userData.unit_id || userData.units?.id,
      unitType: userData.units?.unit_type || userData.unit_type,
      loginTime: new Date().toISOString(),
      sessionId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      lastActivity: new Date().toISOString()
    };
    
    Cookies.set(USER_COOKIE_NAME, JSON.stringify(userInfo), COOKIE_OPTIONS);
    
    // Track login in localStorage for session stats
    const loginHistory = JSON.parse(localStorage.getItem('strata_login_history') || '[]');
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
    
    localStorage.setItem('strata_login_history', JSON.stringify(loginHistory));
    
    return userInfo;
  } catch (error) {
    console.error('Error setting user cookie:', error);
    return null;
  }
};

export const getUserCookie = () => {
  try {
    const userCookie = Cookies.get(USER_COOKIE_NAME);
    if (!userCookie) return null;
    
    const userData = JSON.parse(userCookie);
    
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
    removeUserCookie(); // Clear corrupted cookie
    return null;
  }
};

export const removeUserCookie = () => {
  try {
    const user = getUserCookie();
    
    Cookies.remove(USER_COOKIE_NAME, { path: '/' });
    
    // Update login history with logout time
    if (user) {
      const loginHistory = JSON.parse(localStorage.getItem('strata_login_history') || '[]');
      const updatedHistory = loginHistory.map(login => 
        login.sessionId === user.sessionId 
          ? { ...login, logoutTime: new Date().toISOString() }
          : login
      );
      localStorage.setItem('strata_login_history', JSON.stringify(updatedHistory));
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
    
    Cookies.set(PREFERENCES_COOKIE_NAME, JSON.stringify(updatedPrefs), COOKIE_OPTIONS);
    return updatedPrefs;
  } catch (error) {
    console.error('Error setting preferences cookie:', error);
    return null;
  }
};

export const getPreferencesCookie = () => {
  try {
    const prefsCookie = Cookies.get(PREFERENCES_COOKIE_NAME);
    if (!prefsCookie) {
      // Default preferences
      return {
        theme: 'light',
        notifications: true,
        language: 'en',
        dashboardLayout: 'grid',
        autoLogout: true
      };
    }
    
    return JSON.parse(prefsCookie);
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
    Cookies.remove(PREFERENCES_COOKIE_NAME, { path: '/' });
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
    Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), COOKIE_OPTIONS);
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
  try {
    return JSON.parse(localStorage.getItem('strata_login_history') || '[]');
  } catch (error) {
    console.error('Error getting login history:', error);
    return [];
  }
};

// Auto-logout functionality
export const setupAutoLogout = () => {
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

// Utility functions for the assignment demonstration
export const getCookieStats = () => {
  const allCookies = document.cookie.split(';').map(cookie => cookie.trim()).filter(c => c);
  const strataCookies = allCookies.filter(cookie => 
    cookie.startsWith('strata_') || 
    cookie.includes('strata')
  );
  
  return {
    totalCookies: allCookies.length,
    strataCookies: strataCookies.length,
    userLoggedIn: isUserLoggedIn(),
    sessionDuration: getSessionDuration(),
    loginHistory: getLoginHistory().length
  };
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

// Enhanced session validation
export const validateSession = () => {
  const user = getUserCookie();
  if (!user) return false;
  
  try {
    // Check required fields
    const requiredFields = ['sessionId', 'loginTime', 'email', 'unitNumber'];
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