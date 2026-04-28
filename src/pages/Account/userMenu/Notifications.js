import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { useNotifications } from "../../../component/context/NotificationContext";
import "../Account.css";
import { FaTrash } from "react-icons/fa";
import { apiFetch, getApiBase } from "../../../component/utils/ApiFetch";

const REQUEST_TIMEOUT_MS = 10000;
const NOTIFICATIONS_PER_PAGE = 10;

const Notifications = () => {
  const navigate = useNavigate();
  const { refreshUnreadCount } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");

  const [actingId, setActingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

  const mountedRef = useRef(true);
  const bulkActionInFlightRef = useRef(false);
  const actedNotificationIdsRef = useRef(new Set());
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
  const isNotificationBusy = bulkLoading || Boolean(deletingId) || Boolean(actingId);
  const totalPages = Math.max(
    1,
    Math.ceil(sortedNotifications.length / NOTIFICATIONS_PER_PAGE)
  );
  const safePage = Math.min(page, totalPages);
  const pagedNotifications = useMemo(() => {
    const start = (safePage - 1) * NOTIFICATIONS_PER_PAGE;
    return sortedNotifications.slice(start, start + NOTIFICATIONS_PER_PAGE);
  }, [safePage, sortedNotifications]);
  const pageStart = hasAny ? (safePage - 1) * NOTIFICATIONS_PER_PAGE + 1 : 0;
  const pageEnd = hasAny
    ? Math.min(safePage * NOTIFICATIONS_PER_PAGE, sortedNotifications.length)
    : 0;

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const getNotificationRoute = useCallback((n) => {
    const communityId = n?.community ? String(n.community) : "";
    const kind = n?.target?.kind ? String(n.target.kind) : "";
    const message = String(n?.message || "").toLowerCase();

    const postId = kind === "COMMUNITY_POST" && n?.target?.id ? String(n.target.id) : "";

    if (n?.type === "COMMUNITY_NEW_POST" && communityId && postId) {
      return `/community/${communityId}/posts/${postId}`;
    }

    if (n?.type === "COMMUNITY_JOIN_REQUEST" && communityId) {
      return `/community/${communityId}/members/manage`;
    }

    if (n?.type === "COMMUNITY_ROLE_PROMOTION" && communityId) {
      return `/community/${communityId}/members/manage`;
    }

    if (n?.type === "COMMUNITY_ROLE_DEMOTION" && communityId) {
      return `/community/${communityId}/members/manage`;
    }

    if (n?.type === "COMMUNITY_JOIN_REQUEST_RESULT" && communityId) {
      return message.includes("declined")
        ? `/community/${communityId}/info`
        : `/community/${communityId}/my-posts`;
    }

    if (kind === "COMMUNITY_MANAGE" && communityId) {
      return `/community/${communityId}/members/manage`;
    }

    if (communityId) {
      return `/community/${communityId}/my-posts`;
    }

    return "";
  }, []);

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
    if ((!id && !getNotificationRoute(n)) || bulkLoading || deletingId || actingId) return;

    const route = getNotificationRoute(n);
    const isCurrentlyUnread = isUnread(n);

    try {
      setError("");

      if (id && isCurrentlyUnread) {
        const res = await fetchWithTimeout(`/notifications/${id}/read`, { method: "POST" });
        const data = await safeJson(res);

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || `Failed to mark notification as read (${res.status})`);
        }

        const readAt = data.notification?.readAt || new Date().toISOString();
        setNotifications((prev) =>
          prev.map((item) =>
            (item?._id || item?.id) === id ? { ...item, readAt } : item
          )
        );
        refreshUnreadCount();
      }
    } catch (e) {
      console.error("[notification open+read error]", e);
      setError(e?.message || "Failed to mark notification as read");
    }

    if (route) navigate(route);
  }

  async function handleNotificationAction(id, action) {
    if (!id) return;
    if (!["accept", "decline"].includes(action)) return;
    if (bulkLoading || deletingId || actingId || actedNotificationIdsRef.current.has(id)) return;

    const currentNotification = notifications.find((n) => (n?._id || n?.id) === id);
    if (!isPendingAction(currentNotification)) return;

    actedNotificationIdsRef.current.add(id);

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
      actedNotificationIdsRef.current.delete(id);
      console.error("[notification act error]", err);
      setError(err?.message || "Failed to update notification");
    } finally {
      setActingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!hasAny || isNotificationBusy || bulkActionInFlightRef.current) return;

    bulkActionInFlightRef.current = true;

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
      bulkActionInFlightRef.current = false;
      setBulkLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (!hasAny || isNotificationBusy || bulkActionInFlightRef.current) return;

    bulkActionInFlightRef.current = true;

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
      bulkActionInFlightRef.current = false;
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
              {pagedNotifications.map((n) => {
                const id = n?._id || n?.id;
                const pending = isPendingAction(n);

                return (
                  <li
                    key={id}
                    className={`notification-item ${isUnread(n) ? "notification-item--unread" : ""}`}
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
                        <div className="notification-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="notification-action-btn"
                            disabled={isNotificationBusy}
                            onClick={() => handleNotificationAction(id, "accept")}
                          >
                            {actingId === id ? "Accepting…" : "Accept"}
                          </button>
                          <button
                            type="button"
                            className="notification-action-btn notification-action-btn--secondary"
                            disabled={isNotificationBusy}
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

          {hasAny && totalPages > 1 && (
            <div className="notifications-pager-wrap">
              <div className="notifications-pager-meta">
                Showing {pageStart}-{pageEnd} of {sortedNotifications.length}
              </div>
              <div className="notifications-pager">
                <button
                  type="button"
                  className="notifications-pager-btn"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage <= 1 || isNotificationBusy}
                >
                  Prev
                </button>
                <span className="notifications-pager-status">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="notifications-pager-btn"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safePage >= totalPages || isNotificationBusy}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div className="notifications-toolbar">
            <button
              type="button"
              className="notifications-toolbar-btn"
              onClick={handleMarkAllRead}
              disabled={isNotificationBusy || !hasAny}
            >
              {bulkLoading ? "Working…" : "Mark all as read"}
            </button>
            <button
              type="button"
              className="notifications-toolbar-btn notifications-toolbar-btn--danger"
              onClick={handleDeleteAll}
              disabled={isNotificationBusy || !hasAny}
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
