import { useEffect, useState, useCallback } from "react";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { useNotifications } from "../../../component/context/NotificationContext";
import "../Account.css";

const Notifications = () => {
  const {
    unreadCount,
    refreshUnreadCount,   
  } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null); 
  const [bulkLoading, setBulkLoading] = useState(false);

  // --- Load notifications from server ---
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:4000/notifications", {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load notifications");
      }

      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("[notifications fetch error]", err);
      setError(err.message || "Error loading notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --- Per-notification action (accept / decline) ---
  async function handleNotificationAction(id, action) {
    if (!id) return;
    if (!["accept", "decline"].includes(action)) return;

    try {
      setActingId(id);

      const res = await fetch(`http://localhost:4000/notifications/${id}/act`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to update notification");
      }

      // Update the item in local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? data.notification : n))
      );

      // unread count might have changed
      refreshUnreadCount();
    } catch (err) {
      console.error("[notification act error]", err);
      setError(err.message || "Failed to update notification");
    } finally {
      setActingId(null);
    }
  }

  // --- Mark all as read (server + context) ---
  async function handleMarkAllRead() {
    try {
      setBulkLoading(true);
      setError("");

      const res = await fetch("http://localhost:4000/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to mark all as read");
      }

      // update local list
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt || now,
          status: n.status || n.status, // leave status alone
        }))
      );

      // sync global badge
      refreshUnreadCount();
    } catch (err) {
      console.error("[notifications mark-all-read error]", err);
      setError(err.message || "Failed to mark all as read");
    } finally {
      setBulkLoading(false);
    }
  }

  // --- Delete all notifications ---
  async function handleDeleteAll() {
    try {
      setBulkLoading(true);
      setError("");

      const res = await fetch("http://localhost:4000/notifications", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to delete notifications");
      }

      setNotifications([]);
      refreshUnreadCount();
    } catch (err) {
      console.error("[notifications delete-all error]", err);
      setError(err.message || "Failed to delete notifications");
    } finally {
      setBulkLoading(false);
    }
  }

  const isUnread = (n) => !n.readAt;
  const isPendingAction = (n) =>
    n.status === "pending" &&
    (n.type === "COMMUNITY_INVITE" || n.type === "COMMUNITY_JOIN_REQUEST");

  return (
    <section className="Account">
      <PageHeader />
      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Notifications</h1>
          <p className="account-subtitle">
            Stay up-to-date with your communities and studies.
          </p>

          <div className="notifications-toolbar">
            <button
              type="button"
              className="notifications-toolbar-btn"
              onClick={handleMarkAllRead}
              disabled={bulkLoading || notifications.length === 0}
            >
              Mark all as read
            </button>
            <button
              type="button"
              className="notifications-toolbar-btn notifications-toolbar-btn--danger"
              onClick={handleDeleteAll}
              disabled={bulkLoading || notifications.length === 0}
            >
              Delete all
            </button>
          </div>

          {loading && <p>Loading notifications…</p>}
          {error && <p className="account-error">{error}</p>}

          {!loading && notifications.length === 0 && (
            <p className="account-subtitle">You don’t have any notifications yet.</p>
          )}

          <ul className="notifications-list">
            {notifications.map((n) => {
              const id = n._id || n.id;
              return (
                <li
                  key={id}
                  className={`notification-item ${
                    isUnread(n) ? "notification-item--unread" : ""
                  }`}
                >
                  <div className="notification-main">
                    <div className="notification-title">{n.message}</div>
                    {/* you can later have a subtitle based on type */}
                    {/* <div className="notification-body">More details...</div> */}
                  </div>
                  <div className="notification-meta">
                    {/* For now just show createdAt short; you can plug your Time() util later */}
                    <span className="notification-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>

                    {isPendingAction(n) && (
                      <div className="notification-actions">
                        <button
                          type="button"
                          className="notification-action-btn"
                          disabled={actingId === id}
                          onClick={() => handleNotificationAction(id, "accept")}
                        >
                          {actingId === id ? "Accepting…" : "Accept"}
                        </button>
                        <button
                          type="button"
                          className="notification-action-btn notification-action-btn--secondary"
                          disabled={actingId === id}
                          onClick={() => handleNotificationAction(id, "decline")}
                        >
                          {actingId === id ? "Declining…" : "Decline"}
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default Notifications;
