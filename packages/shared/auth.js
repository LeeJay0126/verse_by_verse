const getJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const createAuthApi = ({ apiFetch }) => {
  if (typeof apiFetch !== "function") {
    throw new Error("createAuthApi requires apiFetch");
  }

  const getCurrentUser = async () => {
    const response = await apiFetch("/auth/me");
    const data = await getJsonSafely(response);

    return {
      response,
      data,
      user: response.ok && data?.ok && data?.user ? data.user : null,
    };
  };

  const login = async (identifier, password) => {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Login failed");
      error.code = data?.code;
      error.email = data?.email;
      throw error;
    }

    return data.user;
  };

  const logout = async () => {
    return apiFetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  };

  const signup = async (payload) => {
    const response = await apiFetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });

    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Sign up failed");
      error.code = data?.code;
      throw error;
    }

    return data;
  };

  const forgotPassword = async (email) => {
    const response = await apiFetch("/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to send reset link");
      error.code = data?.code;
      throw error;
    }

    return data;
  };

  const resendVerification = async (email) => {
    const response = await apiFetch("/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to resend verification email");
      error.code = data?.code;
      throw error;
    }

    return data;
  };

  const resetPassword = async ({ email, token, newPassword }) => {
    const response = await apiFetch("/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, newPassword }),
    });

    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to reset password");
      error.code = data?.code;
      throw error;
    }

    return data;
  };

  return {
    getCurrentUser,
    login,
    logout,
    signup,
    resendVerification,
    forgotPassword,
    resetPassword,
  };
};

module.exports = {
  createAuthApi,
};
