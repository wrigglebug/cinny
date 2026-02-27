import { useEffect } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import { useAtom } from 'jotai';
import { togglePusher } from '../features/settings/notifications/PushNotifications';
import { appEvents } from '../utils/appEvents';
import { useClientConfig } from './useClientConfig';
import { useSetting } from '../state/hooks/settings';
import { settingsAtom } from '../state/settings';
import { pushSubscriptionAtom } from '../state/pushSubscription';
import { SlidingSyncController } from '../../client/SlidingSyncController';

export function useAppVisibility(mx: MatrixClient | undefined) {
  const clientConfig = useClientConfig();
  const [usePushNotifications] = useSetting(settingsAtom, 'usePushNotifications');
  const pushSubAtom = useAtom(pushSubscriptionAtom);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      appEvents.visibilityChange.emit(isVisible);
      if (isVisible) appEvents.appForeground.emit();
      else appEvents.visibilityHidden.emit();
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      // iOS BFCache restore often lands here without a clean visibilitychange
      if (e.persisted || document.visibilityState === 'visible') {
        appEvents.visibilityChange.emit(true);
        appEvents.appForeground.emit();
      }
    };

    const handleFocus = () => {
      appEvents.appFocus.emit();
      appEvents.appForeground.emit();
    };

    const handleOnline = () => {
      appEvents.networkOnline.emit();
      appEvents.appForeground.emit();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!mx) return;

    const handleVisibilityForNotifications = (isVisible: boolean) => {
      togglePusher(mx, clientConfig, isVisible, usePushNotifications, pushSubAtom);
    };

    return appEvents.visibilityChange.add(handleVisibilityForNotifications);
  }, [mx, clientConfig, usePushNotifications, pushSubAtom]);

  useEffect(() => {
    if (!mx) return;

    const controller = SlidingSyncController.getInstance();
    const resume = () => {
      if (!SlidingSyncController.isSupportedOnServer) return;
      void controller.resumeFromAppForeground();
    };

    const unsub1 = appEvents.appForeground.add(resume);
    const unsub2 = appEvents.appFocus.add(resume);
    const unsub3 = appEvents.networkOnline.add(resume);

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [mx]);
}
