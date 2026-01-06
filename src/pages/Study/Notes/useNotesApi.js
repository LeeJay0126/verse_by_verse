import { useCallback } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const jsonFetch = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
};

export const useNotesApi = () => {
  const listNotes = useCallback(async (params) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      qs.set(k, String(v));
    });
    return jsonFetch(`/notes/list?${qs.toString()}`);
  }, []);

  const getNote = useCallback(async (id) => {
    return jsonFetch(`/notes/${encodeURIComponent(id)}`);
  }, []);

  const getScopedNote = useCallback(async (params) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      qs.set(k, String(v));
    });
    return jsonFetch(`/notes?${qs.toString()}`);
  }, []);

  const createNote = useCallback(async (payload) => {
    return jsonFetch(`/notes`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  }, []);

  // edit existing note by id
  const updateNote = useCallback(async (id, payload) => {
    return jsonFetch(`/notes/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload || {}),
    });
  }, []);

  const deleteNote = useCallback(async (id) => {
    return jsonFetch(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
  }, []);

  return { listNotes, getNote, getScopedNote, createNote, updateNote, deleteNote };
};
