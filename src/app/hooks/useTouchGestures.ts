import { TouchEventHandler, useEffect, useRef, useState } from 'react';
import { Pan } from './usePan';

export type TouchGesturesState = {
  scale: number;
  pan: Pan;
};

const INITIAL_STATE: TouchGesturesState = {
  scale: 1,
  pan: { translateX: 0, translateY: 0 },
};

export const useTouchGestures = (
  active: boolean,
  onZoomChange?: (scale: number) => void,
  minScale = 0.1,
  maxScale = 5
) => {
  const [state, setState] = useState<TouchGesturesState>(INITIAL_STATE);
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const initialPinchCenter = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!active) {
      setState(INITIAL_STATE);
      lastTouchDistance.current = null;
      lastTouchCenter.current = null;
      initialPinchCenter.current = null;
    }
  }, [active]);

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const handleTouchStart: TouchEventHandler<HTMLElement> = (evt) => {
    if (!active) return;
    
    if (evt.touches.length === 2) {

      const distance = getTouchDistance(evt.touches[0], evt.touches[1]);
      const center = getTouchCenter(evt.touches[0], evt.touches[1]);
      lastTouchDistance.current = distance;
      lastTouchCenter.current = center;
      initialPinchCenter.current = center;
    } else if (evt.touches.length === 1) {

      lastTouchCenter.current = {
        x: evt.touches[0].clientX,
        y: evt.touches[0].clientY,
      };
    }
  };

  const handleTouchMove: TouchEventHandler<HTMLElement> = (evt) => {
    if (!active) return;

    if (evt.touches.length === 2 && lastTouchDistance.current !== null) {

      evt.preventDefault();
      
      const distance = getTouchDistance(evt.touches[0], evt.touches[1]);
      const center = getTouchCenter(evt.touches[0], evt.touches[1]);
      
      const scaleChange = distance / lastTouchDistance.current;
      
      setState((prevState) => {
        const newScale = Math.max(minScale, Math.min(maxScale, prevState.scale * scaleChange));
        
        let newPan = { ...prevState.pan };
        if (lastTouchCenter.current) {
          const dx = center.x - lastTouchCenter.current.x;
          const dy = center.y - lastTouchCenter.current.y;
          newPan = {
            translateX: prevState.pan.translateX + dx,
            translateY: prevState.pan.translateY + dy,
          };
        }

        if (onZoomChange) {
          onZoomChange(newScale);
        }

        return {
          scale: newScale,
          pan: newPan,
        };
      });

      lastTouchDistance.current = distance;
      lastTouchCenter.current = center;
    } else if (evt.touches.length === 1 && lastTouchCenter.current !== null) {

      if (state.scale > 1) {
        evt.preventDefault();
        
        const currentTouch = {
          x: evt.touches[0].clientX,
          y: evt.touches[0].clientY,
        };

        setState((prevState) => {
          const dx = currentTouch.x - lastTouchCenter.current!.x;
          const dy = currentTouch.y - lastTouchCenter.current!.y;

          return {
            ...prevState,
            pan: {
              translateX: prevState.pan.translateX + dx,
              translateY: prevState.pan.translateY + dy,
            },
          };
        });

        lastTouchCenter.current = currentTouch;
      }
    }
  };

  const handleTouchEnd: TouchEventHandler<HTMLElement> = () => {
    lastTouchDistance.current = null;
    lastTouchCenter.current = null;
    initialPinchCenter.current = null;
  };

  return {
    scale: state.scale,
    pan: state.pan,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};
