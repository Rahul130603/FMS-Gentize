import { useCallback, useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../context/AuthContext';

const POLL_MS = 20000;

/**
 * Polls unread notifications for the logged-in user (admins get notified
 * when a query is raised; employees get notified when theirs is resolved).
 * Polling only runs while a user is signed in.
 */
export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.list(20),
        notificationApi.unreadCount(),
      ]);
      setItems(listRes.data);
      setUnreadCount(countRes.data.count);
    } catch {
      // Silently ignore — notifications are a convenience, not core flow.
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [user, refresh]);

  const markRead = useCallback(async (id) => {
    await notificationApi.markRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return { items, unreadCount, refresh, markRead, markAllRead };
}
