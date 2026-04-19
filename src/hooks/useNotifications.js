import { useEffect, useRef, useState } from "react";
import { sendRequest } from "../utils/sendRequest";
import { API_BASE_URL } from "../constants";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await sendRequest({ url: "/notifications" });
        setNotifications(response.notifications ?? []);
      } catch (error) {
        console.error(error);
      }
    }

    fetchNotifications();
  }, []);

  // open sse connection
  useEffect(() => {
    if (!API_BASE_URL) return;

    const eventSource = new EventSource(`${API_BASE_URL}/notifications/stream`, {
      withCredentials: true,
    });

    eventSourceRef.current = eventSource;
    eventSource.addEventListener("connected", () => setConnected(true));

    // new notification arrives
    eventSource.addEventListener("notification", (e) => {
      const notification = JSON.parse(e.data);
      setNotifications((prev) => [notification, ...prev]);
    });

    // a notification is marked a read from other tab or device
    eventSource.addEventListener("notification:read", (e) => {
      const { id } = JSON.parse(e.data);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      );
    });

    eventSource.onerror = () => setConnected(false);

    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, []);

  async function markRead(id) {
    const notsSnapshot = notifications;
    try {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      );
      await sendRequest({ url: `/notifications/${id}/read`, method: "patch" });
    } catch (error) {
      console.error(error);
      setNotifications(notsSnapshot);
    }
  }

  return {
    notifications,
    connected,
    markRead,
    unreadCount: notifications.filter((n) => !n.readAt).length,
  };
}
