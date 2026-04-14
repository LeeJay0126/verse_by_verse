const buildQS = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    qs.set(key, String(value));
  });
  const queryString = qs.toString();
  return queryString ? `?${queryString}` : "";
};

const parseResponseData = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const createNotesApi = ({ apiFetch }) => {
  if (typeof apiFetch !== "function") {
    throw new Error("createNotesApi requires apiFetch");
  }

  const request = async (path, options = {}) => {
    const hasBody = options.body !== undefined && options.body !== null;

    const response = await apiFetch(path, {
      ...options,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      const error = new Error(data?.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (data && typeof data === "object" && data.ok === false) {
      const error = new Error(data?.error || "Request failed");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  };

  return {
    listNotes: async (params) => request(`/notes/list${buildQS(params)}`, { method: "GET" }),
    getNote: async (id) => {
      if (!id) throw new Error("Missing note id");
      return request(`/notes/${encodeURIComponent(id)}`, { method: "GET" });
    },
    getScopedNote: async (params) => request(`/notes${buildQS(params)}`, { method: "GET" }),
    hasAnyNotes: async (params) => request(`/notes/exists${buildQS(params)}`, { method: "GET" }),
    createNote: async (payload) =>
      request("/notes", {
        method: "POST",
        body: JSON.stringify(payload || {}),
      }),
    updateNote: async (id, payload) => {
      if (!id) throw new Error("Missing note id");
      return request(`/notes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload || {}),
      });
    },
    deleteNote: async (id) => {
      if (!id) throw new Error("Missing note id");
      await request(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
      return true;
    },
  };
};

module.exports = {
  createNotesApi,
};
