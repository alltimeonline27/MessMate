import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/notifications");

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error.response?.data || error.message
      );
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "meal_poll":
        return "🍽️";
      case "payment":
        return "💰";
      case "bill":
        return "🧾";
      case "bazar":
        return "🛒";
      case "general":
      default:
        return "🔔";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "meal_poll":
        return "Meal Poll";
      case "payment":
        return "Payment";
      case "bill":
        return "Bill";
      case "bazar":
        return "Bazar";
      case "general":
      default:
        return "General";
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="notifications-loading">
            <div className="notifications-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">

        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-heading">
            <div className="notifications-icon">
              🔔
            </div>

            <div>
              <h1>Notifications</h1>

              <p>
                Stay updated with important mess activities and alerts.
              </p>
            </div>
          </div>

          <div className="notifications-header-actions">
            <div className="notification-count">
              <span>{unreadCount}</span>
              <small>Unread</small>
            </div>

            <button
              className="notification-refresh-btn"
              onClick={() => loadNotifications(true)}
              disabled={refreshing}
            >
              <span className={refreshing ? "refresh-spin" : ""}>
                ↻
              </span>

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="notifications-error">
            <div className="notifications-error-icon">
              !
            </div>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button onClick={() => loadNotifications()}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              🔔
            </div>

            <h2>No notifications yet</h2>

            <p>
              You don't have any notifications at the moment.
              We'll show important updates here.
            </p>

            <button
              className="notification-empty-refresh"
              onClick={() => loadNotifications(true)}
              disabled={refreshing}
            >
              ↻ Refresh Notifications
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="notifications-summary">
              <div>
                <span className="summary-dot unread-dot"></span>
                <span>
                  {unreadCount} unread
                </span>
              </div>

              <div>
                <span className="summary-dot read-dot"></span>
                <span>
                  {notifications.length - unreadCount} read
                </span>
              </div>
            </div>

            {/* Notification List */}
            <div className="notifications-list">
              {notifications.map((notification, index) => (
                <div
                  key={notification._id}
                  className={`notification-card ${
                    notification.isRead
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                  }}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <div className="notification-card-icon">
                    {getIcon(notification.type)}
                  </div>

                  <div className="notification-card-content">
                    <div className="notification-card-top">
                      <div>
                        <span className="notification-type">
                          {getTypeLabel(notification.type)}
                        </span>

                        <h3>{notification.title}</h3>
                      </div>

                      {!notification.isRead && (
                        <span className="notification-unread-badge">
                          <span></span>
                          UNREAD
                        </span>
                      )}
                    </div>

                    <p className="notification-message">
                      {notification.message}
                    </p>

                    <div className="notification-card-bottom">
                      <span className="notification-date">
                        🕒{" "}
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </span>

                      {!notification.isRead && (
                        <span className="notification-read-hint">
                          Click to mark as read
                        </span>
                      )}

                      {notification.isRead && (
                        <span className="notification-read-status">
                          ✓ Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Notifications;