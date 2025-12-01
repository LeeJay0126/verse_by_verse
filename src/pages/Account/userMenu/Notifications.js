// src/notifications/Notifications.jsx
import { useEffect } from "react";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { useNotifications } from "../../../component/context/NotificationContext";
import "../Account.css";

const fakeNotifications = [
  {
    id: 1,
    title: "New reply in Romans Study",
    body: "Someone commented on your post in Romans 8.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    title: "New community created",
    body: "“Morning Psalms Reading” just opened. Come join!",
    time: "Yesterday",
    unread: true,
  },
  {
    id: 3,
    title: "Reminder: Mark 1 reading",
    body: "Don’t forget today’s passage: Mark 1:1–20.",
    time: "2 days ago",
    unread: false,
  },
];

const Notifications = () => {
  const { unreadCount, markAllRead } = useNotifications();

  // When user visits this page, clear the global unread badge
  useEffect(() => {
    if (unreadCount > 0) {
      markAllRead();
    }
  }, [unreadCount, markAllRead]);

  return (
    <section className="Account">
      <PageHeader />
      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Notifications</h1>
          <p className="account-subtitle">
            Stay up-to-date with your communities and studies.
          </p>

          <ul className="notifications-list">
            {fakeNotifications.map((n) => (
              <li
                key={n.id}
                className={`notification-item ${
                  n.unread ? "notification-item--unread" : ""
                }`}
              >
                <div className="notification-main">
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-body">{n.body}</div>
                </div>
                <div className="notification-meta">
                  <span className="notification-time">{n.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default Notifications;
