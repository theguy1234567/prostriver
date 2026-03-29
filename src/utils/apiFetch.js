const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiFetch = async (endpoint, options = {}) => {
  let token = localStorage.getItem("accessToken");

  const makeRequest = async (customToken = token) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(customToken && { Authorization: `Bearer ${customToken}` }),
        ...options.headers,
      },
      credentials: "include", // required for refresh cookie
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return { res, data };
  };

  // 🔹 First request
  let { res, data } = await makeRequest();

  // 🔥 HANDLE 401 → refresh token
  if (res.status === 401) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      const refreshText = await refreshRes.text();

      let refreshData;
      try {
        refreshData = JSON.parse(refreshText);
      } catch {
        throw new Error("Invalid refresh response");
      }

      if (!refreshRes.ok) throw new Error("Refresh failed");

      // ✅ store new token
      localStorage.setItem("accessToken", refreshData.accessToken);

      // 🔁 retry original request with new token
      const retry = await makeRequest(refreshData.accessToken);

      if (!retry.res.ok) {
        throw {
          status: retry.res.status,
          message:
            retry.data?.message ||
            JSON.stringify(retry.data?.errors) ||
            "Retry failed",
        };
      }

      return retry.data;
    } catch (err) {
      // ❌ refresh failed → logout user
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
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
