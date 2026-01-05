import { useCallback, useMemo } from "react";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

export const useNotesApi = () => {
  const request = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
    });

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
  }, []);

  const listNotes = useCallback(
    async ({
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
      return request(`/notes/list?${params.toString()}`, { method: "GET" });
    },
    [request]
  );

  const getNote = useCallback((id) => request(`/notes/${id}`, { method: "GET" }), [request]);

  const updateNote = useCallback(
    (id, payload) =>
      request(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload || {}),
      }),
    [request]
  );

  const deleteNote = useCallback((id) => request(`/notes/${id}`, { method: "DELETE" }), [request]);

  const upsertNote = useCallback(
    (payload) =>
      request(`/notes`, {
        method: "PUT",
        body: JSON.stringify(payload || {}),
      }),
    [request]
  );

  return useMemo(
    () => ({ listNotes, getNote, upsertNote, updateNote, deleteNote }),
    [listNotes, getNote, upsertNote, updateNote, deleteNote]
  );
};
