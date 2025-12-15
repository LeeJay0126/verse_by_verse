import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch } from "../utils/ApiFetch";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch("/notifications?unread=true");
      const data = await res.json();
      setUnreadCount((data.notifications || []).length);
    } catch (e) {
      setUnreadCount(0);
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
