import { ReactNode, useEffect } from 'react';
import { useMatch, useLocation } from 'react-router-dom';
import { ScreenSize, useScreenSizeContext } from '../hooks/useScreenSize';
import { DIRECT_PATH, EXPLORE_PATH, HOME_PATH, INBOX_PATH, SPACE_PATH } from './paths';
import { useSwipeToOpenSidebar } from '../hooks/useSwipeToOpenSidebar';

type MobileFriendlyClientNavProps = {
  children: ReactNode;
};
export function MobileFriendlyClientNav({ children }: MobileFriendlyClientNavProps) {
  const screenSize = useScreenSizeContext();
  const location = useLocation();
  const homeMatch = useMatch({ path: HOME_PATH, caseSensitive: true, end: true });
  const directMatch = useMatch({ path: DIRECT_PATH, caseSensitive: true, end: true });
  const spaceMatch = useMatch({ path: SPACE_PATH, caseSensitive: true, end: true });
  const exploreMatch = useMatch({ path: EXPLORE_PATH, caseSensitive: true, end: true });
  const inboxMatch = useMatch({ path: INBOX_PATH, caseSensitive: true, end: true });

  const { state, handlers, closeSidebar } = useSwipeToOpenSidebar();

  const isMainRoute = homeMatch || directMatch || spaceMatch || exploreMatch || inboxMatch;
  const isMobile = screenSize === ScreenSize.Mobile;

  useEffect(() => {
    if (isMobile && state.isOpen) {
      closeSidebar();
    }
  }, [location.pathname, isMobile, state.isOpen, closeSidebar]);

  if (!isMobile || isMainRoute) {
    return <>{children}</>;
  }

  const sidebarTransform = state.isDragging
    ? `translateX(${state.offset - 66}px)`
    : state.isOpen
    ? 'translateX(0)'
    : 'translateX(-66px)';

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: state.isOpen ? 999 : -1,
          pointerEvents: state.isOpen || state.isDragging ? 'auto' : 'none',
        }}
        {...handlers}
      >
        {(state.isOpen || state.isDragging) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: state.isDragging
                ? state.offset / 66
                : 1,
              transition: state.isDragging ? 'none' : 'opacity 0.2s ease-out',
            }}
            onClick={closeSidebar}
          />
        )}

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            transform: sidebarTransform,
            transition: state.isDragging ? 'none' : 'transform 0.2s ease-out',
            zIndex: 1000,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

type MobileFriendlyPageNavProps = {
  path: string;
  children: ReactNode;
};
export function MobileFriendlyPageNav({ path, children }: MobileFriendlyPageNavProps) {
  const screenSize = useScreenSizeContext();
  const exactPath = useMatch({
    path,
    caseSensitive: true,
    end: true,
  });

  if (screenSize === ScreenSize.Mobile && !exactPath) {
    return null;
  }

  return children;
}
