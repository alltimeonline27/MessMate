/* eslint-disable react-refresh/only-export-components */

import { createContext, useState } from "react";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    setNotifications((previousNotifications) => [
      ...previousNotifications,
      notification,
    ]);
  };

  const markAsRead = (notificationId) => {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}