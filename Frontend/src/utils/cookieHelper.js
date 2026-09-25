// Cookie Helper Utilities

/**
 * Set a cookie with a name, value, and expiration in hours
 * @param {string} name 
 * @param {string} value 
 * @param {number} hours 
 */
export const setCookie = (name, value, hours = 24) => {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  const encodedValue = encodeURIComponent(typeof value === 'object' ? JSON.stringify(value) : value);
  document.cookie = `${name}=${encodedValue}${expires}; path=/; SameSite=Lax`;
};

/**
 * Get a cookie by name
 * @param {string} name 
 * @returns {string|null}
 */
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const val = decodeURIComponent(c.substring(nameEQ.length, c.length));
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
  }
  return null;
};

/**
 * Remove a cookie by name
 * @param {string} name 
 */
export const removeCookie = (name) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};
