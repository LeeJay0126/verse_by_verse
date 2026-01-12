import { useCallback } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const buildQS = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};

const request = async (path, opts = {}) => {
  const hasBody = opts.body !== undefined && opts.body !== null;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...opts,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore (non-json response)
  }

  // Handle HTTP errors
  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  // Handle app-level errors: { ok:false, error:"..." }
  if (data && typeof data === "object" && data.ok === false) {
    const err = new Error(data?.error || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
};

export const useNotesApi = () => {
  /**
   * GET /notes/list?q=&bibleId=&bookId=&chapterId=&sort=&limit=&offset=
   * -> { ok:true, notes:[...], total:number }
   */
  const listNotes = useCallback(async (params) => {
    return request(`/notes/list${buildQS(params)}`, { method: "GET" });
  }, []);

  /**
   * GET /notes/:id
   * -> { ok:true, note:{...} }
   */
  const getNote = useCallback(async (id) => {
    if (!id) throw new Error("Missing note id");
    return request(`/notes/${encodeURIComponent(id)}`, { method: "GET" });
  }, []);

  /**
   * GET /notes?bibleId=&chapterId=&rangeStart=&rangeEnd=
   * -> { ok:true, note:{...} | null }
   */
  const getScopedNote = useCallback(async (params) => {
    return request(`/notes${buildQS(params)}`, { method: "GET" });
  }, []);

  /**
   * GET /notes/exists?bibleId=&chapterId=
   * -> { ok:true, hasAnyNote:boolean }
   */
  const hasAnyNotes = useCallback(async (params) => {
    return request(`/notes/exists${buildQS(params)}`, { method: "GET" });
  }, []);

  /**
   * POST /notes
   * body: { bibleId, chapterId, rangeStart, rangeEnd, title, text }
   * -> { ok:true, note:{...} }
   */
  const createNote = useCallback(async (payload) => {
    return request(`/notes`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  }, []);

  /**
   * PUT /notes/:id
   * body: { title, text }
   * -> { ok:true, note:{...} }
   */
  const updateNote = useCallback(async (id, payload) => {
    if (!id) throw new Error("Missing note id");
    return request(`/notes/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload || {}),
    });
  }, []);

  /**
   * DELETE /notes/:id
   * -> { ok:true }
   */
  const deleteNote = useCallback(async (id) => {
    if (!id) throw new Error("Missing note id");
    await request(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  }, []);

  return {
    listNotes,
    getNote,
    getScopedNote,
    hasAnyNotes,
    createNote,
    updateNote,
    deleteNote,
  };
};
