import { useCallback } from "react";
import { apiFetch } from "../../../component/utils/ApiFetch";
import { createNotesApi } from "@verse/shared";

const notesApi = createNotesApi({ apiFetch });

export const useNotesApi = () => {
  const listNotes = useCallback((params) => notesApi.listNotes(params), []);
  const getNote = useCallback((id) => notesApi.getNote(id), []);
  const getScopedNote = useCallback((params) => notesApi.getScopedNote(params), []);
  const hasAnyNotes = useCallback((params) => notesApi.hasAnyNotes(params), []);
  const createNote = useCallback((payload) => notesApi.createNote(payload), []);
  const updateNote = useCallback((id, payload) => notesApi.updateNote(id, payload), []);
  const deleteNote = useCallback((id) => notesApi.deleteNote(id), []);

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
