// Browser Notification utility for order updates

export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendBrowserNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '🍽️',
      badge: '🍽️',
      tag: 'order-update', // replaces any existing notification
      requireInteraction: false,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Click to focus the tab
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

export function getStatusChangeMessage(
  oldStatus: string,
  newStatus: string
): { title: string; body: string; emoji: string } | null {
  if (oldStatus === newStatus) return null;

  if (newStatus === 'preparing' && oldStatus === 'pending') {
    return {
      title: '👨‍🍳 Order Being Prepared!',
      body: 'The kitchen has started working on your order',
      emoji: '👨‍🍳',
    };
  }

  if (newStatus === 'ready' && oldStatus === 'preparing') {
    return {
      title: '✅ Order Ready for Pickup!',
      body: 'Head to the cafeteria counter to collect your food',
      emoji: '✅',
    };
  }

  if (newStatus === 'picked_up' && oldStatus === 'ready') {
    return {
      title: '📦 Order Picked Up',
      body: 'Enjoy your meal! Thank you for ordering with Campus Bites',
      emoji: '📦',
    };
  }

  return null;
}
