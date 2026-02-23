export type PushNotificationSettings = {
  showPushNotificationContent?: boolean;
  openDirectOnPush?: boolean;
};

export function pushSessionToSW(
  baseUrl?: string,
  accessToken?: string,
  userId?: string,
  notificationSettings?: PushNotificationSettings
) {
  if (!('serviceWorker' in navigator)) return;
  const post = () => {
    navigator.serviceWorker.controller?.postMessage({
      type: 'setSession',
      accessToken,
      baseUrl,
      userId,
      notificationSettings,
    });
  };

  if (navigator.serviceWorker.controller) {
    post();
    return;
  }

  navigator.serviceWorker.ready.then(post).catch(() => {
    // ignore if SW isn't available yet
  });
}
