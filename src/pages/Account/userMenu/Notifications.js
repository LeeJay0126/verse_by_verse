import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { useNotifications } from "../../../component/context/NotificationContext";
import "../Account.css";
import { FaTrash } from "react-icons/fa";
import { apiFetch, getApiBase } from "../../../component/utils/ApiFetch";

const REQUEST_TIMEOUT_MS = 10000;

const Notifications = () => {
  const navigate = useNavigate();
  const { refreshUnreadCount } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [phase, setPhase] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [error, setError] = useState("");

  const [actingId, setActingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchWithTimeout = async (path, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await apiFetch(path, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const fetchNotifications = useCallback(async () => {
    setPhase("loading");
    setError("");

    try {
      console.log("[Notifications] API_BASE =", getApiBase());
      console.log("[Notifications] GET /notifications");

      const res = await fetchWithTimeout("/notifications");
      const data = await safeJson(res);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to load notifications (${res.status})`);
      }

      if (!mountedRef.current) return;

      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setPhase("success");
    } catch (err) {
      if (!mountedRef.current) return;

      const isAbort =
        err?.name === "AbortError" ||
        String(err?.message || "").toLowerCase().includes("aborted");

      setNotifications([]);
      setError(
        isAbort
          ? `Request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)}s. Check API_BASE / server / CORS.`
          : err?.message || "Error loading notifications"
      );
      setPhase("error");
      console.error("[notifications fetch error]", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const isUnread = useCallback((n) => !n?.readAt, []);
  const isPendingAction = useCallback(
    (n) =>
      n?.status === "pending" &&
      (n?.type === "COMMUNITY_INVITE" || n?.type === "COMMUNITY_JOIN_REQUEST"),
    []
  );

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const ta = new Date(a?.createdAt || 0).getTime();
      const tb = new Date(b?.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [notifications]);

  const hasAny = notifications.length > 0;

  async function handleDeleteOne(id) {
    if (!id) return;

    try {
      setDeletingId(id);
      setError("");

      const res = await fetchWithTimeout(`/notifications/${id}`, { method: "DELETE" });
      const data = await safeJson(res);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to delete notification (${res.status})`);
      }

      setNotifications((prev) => prev.filter((n) => (n?._id || n?.id) !== id));
      refreshUnreadCount();
    } catch (e) {
      console.error("[notification delete-one error]", e);
      setError(e?.message || "Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleOpenNotification(n) {
    const id = n?._id || n?.id;
    if (!id) return;
    if (bulkLoading || deletingId || actingId) return;

    const communityId = n?.community ? String(n.community) : "";
    const postId =
      n?.target?.kind === "COMMUNITY_POST" && n?.target?.id ? String(n.target.id) : "";

    // Navigate first (feels snappy), then delete in background.
    if (n?.type === "COMMUNITY_NEW_POST" && communityId && postId) {
      navigate(`/community/${communityId}/posts/${postId}`);
    }

    // Cascade delete by community when possible, otherwise delete just one.
    try {
      setDeletingId(id);
      setError("");

      const url =
        communityId ? `/notifications/${id}?cascade=community` : `/notifications/${id}`;

      const res = await fetchWithTimeout(url, { method: "DELETE" });
      const data = await safeJson(res);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to delete notification (${res.status})`);
      }

      setNotifications((prev) => {
        if (communityId) {
          return prev.filter((x) => String(x?.community || "") !== communityId);
        }
        return prev.filter((x) => (x?._id || x?.id) !== id);
      });

      refreshUnreadCount();
    } catch (e) {
      console.error("[notification open+delete error]", e);
      setError(e?.message || "Failed to remove notification");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleNotificationAction(id, action) {
    if (!id) return;
    if (!["accept", "decline"].includes(action)) return;

    try {
      setActingId(id);
      setError("");

      const res = await fetchWithTimeout(`/notifications/${id}/act`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await safeJson(res);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to update notification (${res.status})`);
      }

      setNotifications((prev) =>
        prev.map((n) => ((n?._id || n?.id) === id ? data.notification : n))
      );

      refreshUnreadCount();
    } catch (err) {
      console.error("[notification act error]", err);
      setError(err?.message || "Failed to update notification");
    } finally {
      setActingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!hasAny) return;

    try {
      setBulkLoading(true);
      setError("");

      const res = await fetchWithTimeout("/notifications/read-all", { method: "POST" });
      const data = await safeJson(res);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to mark all as read (${res.status})`);
      }

      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n?.readAt || now })));
      refreshUnreadCount();
    } catch (err) {
      console.error("[notifications mark-all-read error]", err);
      setError(err?.message || "Failed to mark all as read");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (!hasAny) return;

    try {
      setBulkLoading(true);
      setError("");

      const res = await fetchWithTimeout("/notifications", { method: "DELETE" });
      const data = await safeJson(res);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to delete notifications (${res.status})`);
      }

      setNotifications([]);
      refreshUnreadCount();
    } catch (err) {
      console.error("[notifications delete-all error]", err);
      setError(err?.message || "Failed to delete notifications");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <section className="Account">
      <PageHeader />
      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Notifications</h1>
          <p className="account-subtitle">Stay up-to-date with your communities and studies.</p>

          {phase === "loading" && <p>Loading notifications…</p>}

          {phase === "error" && (
            <>
              <p className="account-error">{error}</p>
              <button
                type="button"
                className="notifications-toolbar-btn"
                onClick={fetchNotifications}
                disabled={phase === "loading"}
              >
                Retry
              </button>
            </>
          )}

          {phase === "success" && !hasAny && (
            <p className="account-subtitle">You don’t have any notifications yet.</p>
          )}

          {hasAny && (
            <ul className="notifications-list">
              {sortedNotifications.map((n) => {
                const id = n?._id || n?.id;
                const pending = isPendingAction(n);

                return (
                  <li
                    key={id}
                    className={`notification-item ${
                      isUnread(n) ? "notification-item--unread" : ""
                    }`}
                    onClick={() => handleOpenNotification(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleOpenNotification(n);
                    }}
                  >
                    <div className="notification-main">
                      <div className="notification-title">{n?.message}</div>
                    </div>

                    <div className="notification-meta">
                      <span className="notification-time">
                        {n?.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                      </span>

                      {pending && (
                        <div
                          className="notification-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="notification-action-btn"
                            disabled={actingId === id || bulkLoading}
                            onClick={() => handleNotificationAction(id, "accept")}
                          >
                            {actingId === id ? "Accepting…" : "Accept"}
                          </button>
                          <button
                            type="button"
                            className="notification-action-btn notification-action-btn--secondary"
                            disabled={actingId === id || bulkLoading}
                            onClick={() => handleNotificationAction(id, "decline")}
                          >
                            {actingId === id ? "Declining…" : "Decline"}
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        className="notification-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOne(id);
                        }}
                        disabled={deletingId === id || bulkLoading}
                        aria-label="Delete notification"
                        title="Delete notification"
                      >
                        {deletingId === id ? "…" : <FaTrash />}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="notifications-toolbar">
            <button
              type="button"
              className="notifications-toolbar-btn"
              onClick={handleMarkAllRead}
              disabled={bulkLoading || !hasAny}
            >
              {bulkLoading ? "Working…" : "Mark all as read"}
            </button>
            <button
              type="button"
              className="notifications-toolbar-btn notifications-toolbar-btn--danger"
              onClick={handleDeleteAll}
              disabled={bulkLoading || !hasAny}
            >
              {bulkLoading ? "Working…" : "Delete all"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default Notifications;