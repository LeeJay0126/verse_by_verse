import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const NotesContext = createContext(null);

const buildStorageKey = (user) => {
    const id = user?._id || user?.id || "guest";
    return `versebyverse:notes:${id}`;
};

export const NotesProvider = ({ children }) => {
    const { user } = useAuth();

    const [notesByChapter, setNotesByChapter] = useState({});

    useEffect(() => {
        const key = buildStorageKey(user);
        try {
            const raw = localStorage.getItem(key);
            if (!raw) {
                setNotesByChapter({});
                return;
            }
            const parsed = JSON.parse(raw);
            setNotesByChapter(parsed && typeof parsed === "object" ? parsed : {});
        } catch (e) {
            console.warn("Failed to load notes from localStorage", e);
            setNotesByChapter({});
        }
    }, [user]);

    useEffect(() => {
        const key = buildStorageKey(user);
        try {
            localStorage.setItem(key, JSON.stringify(notesByChapter));
        } catch (e) {
            console.warn("Failed to save notes to localStorage", e);
        }
    }, [notesByChapter, user]);

    const getChapterNote = useCallback(
        (chapterId) => {
            if (!chapterId) return { title: "", text: "" };
            const entry = notesByChapter[chapterId];
            return {
                title: entry?.title || "",
                text: entry?.text || "",
            };
        },
        [notesByChapter]
    );

    const saveChapterNote = useCallback((chapterId, payload) => {
        if (!chapterId) return;

        const nextTitle = (payload?.title ?? "").toString();
        const nextText = (payload?.text ?? "").toString();

        setNotesByChapter((prev) => ({
            ...prev,
            [chapterId]: { title: nextTitle, text: nextText },
        }));
    }, []);

    const deleteChapterNote = useCallback((chapterId) => {
        if (!chapterId) return;
        setNotesByChapter((prev) => {
            const next = { ...prev };
            delete next[chapterId];
            return next;
        });
    }, []);

    const clearAllNotes = useCallback(() => {
        setNotesByChapter({});
    }, []);

    const value = useMemo(
        () => ({
            notesByChapter,
            getChapterNote,
            saveChapterNote,
            deleteChapterNote,
            clearAllNotes,
        }),
        [notesByChapter, getChapterNote, saveChapterNote, deleteChapterNote, clearAllNotes]
    );

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = () => {
    const ctx = useContext(NotesContext);
    if (!ctx) {
        throw new Error("useNotes must be used within a NotesProvider");
    }
    return ctx;
};
