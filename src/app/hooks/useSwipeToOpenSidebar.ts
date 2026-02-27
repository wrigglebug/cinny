import { TouchEventHandler, useCallback, useRef, useState } from 'react';

export type SwipeState = {
  isOpen: boolean;
  offset: number;
  isDragging: boolean;
};

const SWIPE_THRESHOLD = 66;
const SWIPE_START_ZONE = 20;
const VELOCITY_THRESHOLD = 0.3;

export const useSwipeToOpenSidebar = (sidebarWidth = 66) => {
  const [state, setState] = useState<SwipeState>({
    isOpen: false,
    offset: 0,
    isDragging: false,
  });

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);
  const isSwipeGesture = useRef<boolean>(false);

  const handleTouchStart: TouchEventHandler<HTMLElement> = useCallback((evt) => {
    const touch = evt.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    lastTouchX.current = touch.clientX;

    if (touch.clientX <= SWIPE_START_ZONE || state.isOpen) {
      isSwipeGesture.current = true;
    } else {
      isSwipeGesture.current = false;
    }
  }, [state.isOpen]);

  const handleTouchMove: TouchEventHandler<HTMLElement> = useCallback((evt) => {
    if (!isSwipeGesture.current || touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const touch = evt.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      evt.preventDefault();

      setState((prevState) => {
        let newOffset: number;

        if (prevState.isOpen) {
          newOffset = Math.max(0, Math.min(sidebarWidth, sidebarWidth + deltaX));
        } else {
          newOffset = Math.max(0, Math.min(sidebarWidth, deltaX));
        }

        return {
          ...prevState,
          offset: newOffset,
          isDragging: true,
        };
      });

      lastTouchX.current = touch.clientX;
    }
  }, [sidebarWidth]);

  const handleTouchEnd: TouchEventHandler<HTMLElement> = useCallback(() => {
    if (!isSwipeGesture.current || touchStartX.current === null || touchStartTime.current === null) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchStartTime.current = null;
      lastTouchX.current = null;
      isSwipeGesture.current = false;
      return;
    }

    const deltaTime = Date.now() - touchStartTime.current;
    const deltaX = (lastTouchX.current ?? touchStartX.current) - touchStartX.current;
    const velocity = Math.abs(deltaX) / deltaTime;

    setState((prevState) => {
      let shouldOpen: boolean;

      if (prevState.isDragging) {
        if (velocity > VELOCITY_THRESHOLD) {
          shouldOpen = deltaX > 0;
        } else {
          shouldOpen = prevState.offset > sidebarWidth / 2;
        }
      } else {
        shouldOpen = prevState.isOpen;
      }

      return {
        isOpen: shouldOpen,
        offset: 0,
        isDragging: false,
      };
    });

    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
    lastTouchX.current = null;
    isSwipeGesture.current = false;
  }, [sidebarWidth]);

  const closeSidebar = useCallback(() => {
    setState({
      isOpen: false,
      offset: 0,
      isDragging: false,
    });
  }, []);

  const openSidebar = useCallback(() => {
    setState({
      isOpen: true,
      offset: 0,
      isDragging: false,
    });
  }, []);

  return {
    state,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    closeSidebar,
    openSidebar,
  };
};
