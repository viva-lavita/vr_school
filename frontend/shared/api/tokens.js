const ACCESS_COOKIE = "access";
const REFRESH_COOKIE = "refresh";

function setCookie(name, value, maxAgeSeconds) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${Math.max(maxAgeSeconds, 0)}; samesite=lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function removeCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function getTokenExpirySeconds(token) {
  try {
    const payload = token.split(".")[1];
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return exp - Math.floor(Date.now() / 1000);
  } catch {
    return 0;
  }
}

export function getAccessToken() {
  return getCookie(ACCESS_COOKIE);
}

export function getRefreshToken() {
  return getCookie(REFRESH_COOKIE);
}

export function setTokens({ access, refresh }) {
  if (access) setCookie(ACCESS_COOKIE, access, getTokenExpirySeconds(access));
  if (refresh) setCookie(REFRESH_COOKIE, refresh, getTokenExpirySeconds(refresh));
}

export function clearTokens() {
  removeCookie(ACCESS_COOKIE);
  removeCookie(REFRESH_COOKIE);
}
