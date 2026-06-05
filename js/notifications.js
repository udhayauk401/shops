/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* NOTIFICATION MANAGEMENT */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Fetch user notifications from database
 */
async function fetchUserNotifications() {
  const user = getCurrentUser();

  if (!user) {
    return [];
  }

  try {
    const result = await apiCall(`/notifications/${user._id}`);
    const notifications = Array.isArray(result) ? result : (result.data || result);

    // Cache in localStorage for faster access
    localStorage.setItem("notifications", JSON.stringify(notifications));

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);

    // Fall back to cached notifications
    const cached = localStorage.getItem("notifications");
    return cached ? JSON.parse(cached) : [];
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);

  if (secondsAgo < 60) return "just now";
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;

  return date.toLocaleDateString();
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
  switch (type) {
    case "order":
      return "📦";
    case "payment":
      return "💳";
    case "shipping":
      return "🚚";
    case "delivery":
      return "✓";
    default:
      return "📬";
  }
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
  try {
    await markNotificationAsReadAPI(notificationId);

    // Update localStorage
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    const notif = notifications.find((n) => n._id === notificationId);
    if (notif) {
      notif.isRead = true;
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }

    updateNotificationBadge();
    renderNotifications();

    showSuccessToast("Notification marked as read");
  } catch (error) {
    console.error("Error marking notification as read:", error);
    showErrorToast("Failed to update notification");
  }
}

/**
 * Delete notification
 */
async function deleteNotification(notificationId) {
  try {
    await deleteNotificationAPI(notificationId);

    // Update localStorage
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    const filtered = notifications.filter((n) => n._id !== notificationId);
    localStorage.setItem("notifications", JSON.stringify(filtered));

    updateNotificationBadge();
    renderNotifications();

    showToast("Notification deleted");
  } catch (error) {
    console.error("Error deleting notification:", error);
    showErrorToast("Failed to delete notification");
  }
}

/**
 * Render notifications
 */
function renderNotifications(notifications = null) {
  const container = document.getElementById("notifications-container");

  if (!container) return;

  if (!notifications) {
    notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  }

  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔔</div>
        <h2>No notifications</h2>
        <p>You're all caught up!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notifications
    .map(
      (notif) => `
    <div class="card notification-item" style="border-left: 4px solid ${notif.isRead ? "var(--border)" : "var(--primary)"}; margin-bottom: 1rem; ${!notif.isRead ? "background-color: var(--blush);" : ""}">
      <div style="display: flex; gap: 1rem; align-items: flex-start;">
        <span style="font-size: 1.5rem;">${getNotificationIcon(notif.type || "default")}</span>
        <div style="flex: 1;">
          <p style="margin: 0; color: var(--dark); line-height: 1.5;">${notif.message}</p>
          <p style="margin: 0.5rem 0 0 0; color: var(--gray); font-size: 0.85rem;">${getRelativeTime(notif.createdAt)}</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          ${
            !notif.isRead
              ? `<button class="btn btn-small btn-outline" onclick="markAsRead('${notif._id}')" style="padding: 6px 12px; font-size: 0.85rem;">Mark as read</button>`
              : ""
          }
          <button class="btn btn-small btn-outline" onclick="deleteNotification('${notif._id}')" style="padding: 6px 12px; font-size: 0.85rem; color: #d32f2f; border-color: #d32f2f;">Delete</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * Create notification (called after important actions)
 */
async function createNotification(userId, message, type = "default") {
  try {
    const notification = {
      userId,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await apiCall('/notifications', 'POST', notification);

    // Update localStorage
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    notifications.unshift(notification);
    localStorage.setItem("notifications", JSON.stringify(notifications));

    updateNotificationBadge();

    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Initialize notifications page
 */
async function initNotificationsPage() {
  requireAuth();

  const notifications = await fetchUserNotifications();
  renderNotifications(notifications);

  updateCartBadge();
  updateNotificationBadge();

  // Mark all as read button (optional)
  const markAllBtn = document.getElementById("mark-all-read-btn");
  if (markAllBtn) {
    markAllBtn.addEventListener("click", async () => {
      const unread = notifications.filter((n) => !n.isRead);
      for (const notif of unread) {
        await updateOne("notifications", { _id: { $oid: notif._id } }, { $set: { isRead: true } });
      }
      await fetchUserNotifications();
      renderNotifications();
      updateNotificationBadge();
      showSuccessToast("All notifications marked as read");
    });
  }
}
