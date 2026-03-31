const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiFetch = async (endpoint, options = {}) => {
  let token = localStorage.getItem("accessToken");

  // 🔁 function to make request
  const makeRequest = async (customToken = token) => {
    console.log("➡️ API CALL:", `${BASE_URL}${endpoint}`);
    console.log("🔐 TOKEN:", customToken);

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(customToken && { Authorization: `Bearer ${customToken}` }),
        ...options.headers,
      },
      credentials: "include", // 🔥 needed for refresh cookie
    });

    console.log("📡 STATUS:", res.status);

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    console.log("📦 RESPONSE:", data);

    return { res, data };
  };

  // 🔹 FIRST REQUEST
  let { res, data } = await makeRequest();

  // 🔥 HANDLE 401 → try refresh
  if (res.status === 401) {
    console.log("⚠️ 401 detected → trying refresh...");

    try {
      const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      console.log("🔄 REFRESH STATUS:", refreshRes.status);

      if (!refreshRes.ok) {
        throw new Error("Refresh failed");
      }

      const refreshData = await refreshRes.json();

      console.log("✅ REFRESH SUCCESS:", refreshData);

      const newToken = refreshData.accessToken;

      // ✅ store new token
      localStorage.setItem("accessToken", newToken);

      // ✅ update AuthContext instantly
      window.dispatchEvent(
        new CustomEvent("tokenRefreshed", {
          detail: newToken,
        }),
      );

      // 🔁 retry original request
      const retry = await makeRequest(newToken);

      if (!retry.res.ok) {
        throw {
          status: retry.res.status,
          message:
            retry.data?.message || "Retry request failed after token refresh",
          data: retry.data,
        };
      }

      return retry.data;
    } catch (err) {
      console.log("🚨 FINAL AUTH FAILURE:", err);

      // ❗ clear token
      localStorage.removeItem("accessToken");

      // ✅ tell whole app logout happened
      window.dispatchEvent(new CustomEvent("logout"));

      throw {
        status: 401,
        message: "Session expired. Please login again.",
      };
    }
  }

  // 🔥 NORMAL ERROR HANDLING
  if (!res.ok) {
    throw {
      status: res.status,
      message:
        data?.message ||
        (data?.errors ? JSON.stringify(data.errors) : "Something went wrong"),
      data,
    };
  }

  return data;
};
