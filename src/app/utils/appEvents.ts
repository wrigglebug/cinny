type VoidListener = () => void;
type VisibilityListener = (isVisible: boolean) => void;

function createEvent<T extends (...args: any[]) => void>() {
  const listeners = new Set<T>();
  return {
    add(listener: T) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit(...args: Parameters<T>) {
      listeners.forEach((fn) => {
        try {
          fn(...args);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('appEvents listener failed', e);
        }
      });
    },
    clear() {
      listeners.clear();
    },

    size() {
      return listeners.size;
    },
  };
}

export const appEvents = {
  visibilityHidden: createEvent<VoidListener>(),
  visibilityChange: createEvent<VisibilityListener>(),
  appForeground: createEvent<VoidListener>(),
  appFocus: createEvent<VoidListener>(),
  networkOnline: createEvent<VoidListener>(),
};
