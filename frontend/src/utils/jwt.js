function decodeBase64Url(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

export function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 < Date.now();
}