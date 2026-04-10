export async function authFetch(url, options = {}) {
  const { token, onUnauthorized, headers, ...fetchOptions } = options;
  const requestHeaders = { ...(headers || {}) };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if ((response.status === 401 || response.status === 403) && typeof onUnauthorized === "function") {
    onUnauthorized(data);
  }

  return { response, data };
}