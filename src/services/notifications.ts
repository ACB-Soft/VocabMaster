export class NotificationService {
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  static getPermissionState(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  static sendNotification(title: string, options?: NotificationOptions): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/icon.svg',
            badge: '/pwa-192x192.png',
            ...({ vibrate: [100, 50, 100] } as any),
            ...options
          });
        });
      } else {
        new Notification(title, {
          icon: '/icon.svg',
          ...options
        });
      }
    } catch (e) {
      console.error('Failed to trigger notification:', e);
    }
  }

  static scheduleDailyReminder(time: string = '20:00'): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    // Send a test confirmation notification immediately so user knows it works
    this.sendNotification('VocabMaster Hatırlatıcı Aktif! 🔔', {
      body: `Günlük İngilizce kelime çalışma hatırlatıcınız her gün ${time} için ayarlandı.`,
      tag: 'vocabmaster-reminder-active'
    });
  }
}
