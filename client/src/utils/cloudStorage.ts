export function isCloudStorageAvailable() {
  return !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage);
}

export function getCloudItem(key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (isCloudStorageAvailable()) {
      window.Telegram.WebApp.CloudStorage.getItem(key, (err: any, value: string | null) => {
        if (err) reject(err);
        else resolve(value ?? null);
      });
    } else {
      resolve(localStorage.getItem(key));
    }
  });
}

export function setCloudItem(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isCloudStorageAvailable()) {
      window.Telegram.WebApp.CloudStorage.setItem(key, value, (err: any, ok: boolean) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      localStorage.setItem(key, value);
      resolve();
    }
  });
} 