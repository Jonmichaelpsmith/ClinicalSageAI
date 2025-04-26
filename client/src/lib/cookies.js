/**
 * TrialSage Cookie Utilities
 * 
 * Provides functions for handling cookies with security best practices.
 */

// Get a cookie by name
export const getCookie = (name) => {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const matches = document.cookie.match(new RegExp(
    `(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`
  ));
  
  return matches ? decodeURIComponent(matches[1]) : null;
};

// Set a cookie with security options
export const setCookie = (name, value, options = {}) => {
  if (typeof document === 'undefined') {
    return false;
  }
  
  // Default security settings
  const secureOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    ...options
  };
  
  // Set expiration if specified
  if (options.expires) {
    if (typeof options.expires === 'number') {
      secureOptions.expires = new Date(Date.now() + options.expires * 1000).toUTCString();
    } else {
      secureOptions.expires = options.expires.toUTCString();
    }
  }
  
  // Build the cookie string
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  for (const [key, val] of Object.entries(secureOptions)) {
    cookieString += `; ${key}`;
    
    if (val !== true) {
      cookieString += `=${val}`;
    }
  }
  
  // Set the cookie
  document.cookie = cookieString;
  return true;
};

// Delete a cookie
export const deleteCookie = (name, options = {}) => {
  return setCookie(name, '', {
    expires: -1,
    path: '/',
    ...options
  });
};

// Get all cookies as an object
export const getAllCookies = () => {
  if (typeof document === 'undefined') {
    return {};
  }
  
  return document.cookie
    .split('; ')
    .reduce((acc, cookie) => {
      const [name, value] = cookie.split('=').map(decodeURIComponent);
      acc[name] = value;
      return acc;
    }, {});
};

// Check if cookies are enabled
export const areCookiesEnabled = () => {
  if (typeof document === 'undefined') {
    return false;
  }
  
  // Try to set and get a test cookie
  setCookie('__test_cookie', '1');
  const enabled = getCookie('__test_cookie') === '1';
  deleteCookie('__test_cookie');
  
  return enabled;
};

// Set a secure HttpOnly cookie via API
export const setSecureCookie = async (name, value, options = {}) => {
  try {
    const response = await fetch('/api/cookies/set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        value,
        options
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error setting secure cookie:', error);
    return false;
  }
};

// Check if a cookie exists
export const hasCookie = (name) => {
  return getCookie(name) !== null;
};