// src/component/context/NotificationContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  // For now: simple unread count. Later you can fetch from API.
  const [unreadCount, setUnreadCount] = useState(0);

  const hasUnread = unreadCount > 0;

  // Example: fake initial fetch (replace with real API later)
  useEffect(() => {
    // TODO: replace with fetch(`/api/notifications/unread-count`)
    // For now, just pretend there are 3 unread
    setUnreadCount(3);
  }, []);

  function markAllRead() {
    setUnreadCount(0);
    // TODO: call backend to mark all as read
  }

  function addDummyNotification() {
    // helper for testing
    setUnreadCount((c) => c + 1);
  }

  const value = {
    unreadCount,
    hasUnread,
    setUnreadCount,
    markAllRead,
    addDummyNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
