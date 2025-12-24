const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

/**
 * Notes API wrapper.
 * Assumes session auth cookie -> uses credentials: "include"
 */
export const useNotesApi = () => {
  const request = async (path, opts = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
      ...opts,
    });

    // Handle unauth
    if (res.status === 401) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = data?.error || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  };

  const listNotes = async ({
    q = "",
    bibleId = "",
    bookId = "",
    sort = "updatedAt:desc",
    limit = 50,
    offset = 0,
  } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (bibleId) params.set("bibleId", bibleId);
    if (bookId) params.set("bookId", bookId);
    if (sort) params.set("sort", sort);
    params.set("limit", String(limit));
    params.set("offset", String(offset));

    // expected: { ok:true, notes:[...], total:number }
    return request(`/notes/list?${params.toString()}`, { method: "GET" });
  };

  const getNote = async (id) => {
    // expected: { ok:true, note:{...} }
    return request(`/notes/${id}`, { method: "GET" });
  };

  const updateNote = async (id, payload) => {
    // expected: { ok:true, note:{...} }
    return request(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload || {}),
    });
  };

  const deleteNote = async (id) => {
    // expected: { ok:true }
    return request(`/notes/${id}`, { method: "DELETE" });
  };

  return { listNotes, getNote, updateNote, deleteNote };
};
