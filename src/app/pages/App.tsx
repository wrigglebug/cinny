import React, { useEffect, useRef } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { OverlayContainerProvider, PopOutContainerProvider, TooltipContainerProvider } from 'folds';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ClientConfigLoader } from '../components/ClientConfigLoader';
import { ClientConfigProvider } from '../hooks/useClientConfig';
import { ConfigConfigError, ConfigConfigLoading } from './ConfigConfig';
import { FeatureCheck } from './FeatureCheck';
import { createRouter } from './Router';
import { ScreenSizeProvider, useScreenSize } from '../hooks/useScreenSize';
import { useCompositionEndTracking } from '../hooks/useComposingCheck';

const queryClient = new QueryClient();

function cleanupStuckUi(portalContainer?: HTMLElement | null) {
  // Undo common global locks that can survive BFCache restores
  document.documentElement.style.removeProperty('overflow');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('position');
  document.body.style.removeProperty('top');
  document.body.style.removeProperty('left');
  document.body.style.removeProperty('right');
  document.body.style.removeProperty('touch-action');
  document.body.style.removeProperty('pointer-events');

  (document.activeElement as HTMLElement | null)?.blur?.();

  if (!portalContainer) return;

  // If anything in portalContainer is a fixed, full-screen, pointer-blocking layer, clear it.
  const maybeBlocking = Array.from(portalContainer.children).some((child) => {
    const el = child as HTMLElement;
    const style = window.getComputedStyle(el);
    if (style.pointerEvents === 'none') return false;
    if (style.position !== 'fixed') return false;

    // Treat “covers screen” as: inset: 0 OR top/left/right/bottom all 0
    const coversScreen =
      style.inset === '0px' ||
      (style.top === '0px' &&
        style.left === '0px' &&
        style.right === '0px' &&
        style.bottom === '0px');

    // Common scrims are semi-transparent
    const hasBackdrop =
      (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') ||
      style.backdropFilter !== 'none';

    return coversScreen && hasBackdrop;
  });

  if (maybeBlocking) {
    portalContainer.replaceChildren();
  }
}

function App() {
  const screenSize = useScreenSize();
  useCompositionEndTracking();

  const portalRef = useRef<HTMLElement | null>(null);
  if (portalRef.current === null) {
    portalRef.current = document.getElementById('portalContainer');
  }
  const portalContainer = portalRef.current ?? undefined;

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      // Only do the heavy cleanup when iOS restores from BFCache
      if (e.persisted) cleanupStuckUi(portalRef.current);
    };
    const onPopState = () => cleanupStuckUi(portalRef.current);

    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return (
    <TooltipContainerProvider value={portalContainer}>
      <PopOutContainerProvider value={portalContainer}>
        <OverlayContainerProvider value={portalContainer}>
          <ScreenSizeProvider value={screenSize}>
            <FeatureCheck>
              <ClientConfigLoader
                fallback={() => <ConfigConfigLoading />}
                error={(err, retry, ignore) => (
                  <ConfigConfigError error={err} retry={retry} ignore={ignore} />
                )}
              >
                {(clientConfig) => (
                  <ClientConfigProvider value={clientConfig}>
                    <QueryClientProvider client={queryClient}>
                      <JotaiProvider>
                        <RouterProvider router={createRouter(clientConfig, screenSize)} />
                      </JotaiProvider>
                      <ReactQueryDevtools initialIsOpen={false} />
                    </QueryClientProvider>
                  </ClientConfigProvider>
                )}
              </ClientConfigLoader>
            </FeatureCheck>
          </ScreenSizeProvider>
        </OverlayContainerProvider>
      </PopOutContainerProvider>
    </TooltipContainerProvider>
  );
}

export default App;
