import { createContext, useContext, useEffect, useState, useCallback } from "react";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await fetch(
        "http://localhost:4000/notifications?unread=true",
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load unread notifications");

      setUnreadCount((data.notifications || []).length);
    } catch (err) {
      console.error("[refreshUnreadCount error]", err);
      // optional: keep previous count
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const value = {
    unreadCount,
    hasUnread: unreadCount > 0,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
