import { useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { createCallRoomModalAtom, CreateCallRoomModalState } from '../createCallRoomModal';

export const useCreateCallRoomModalState = (): CreateCallRoomModalState | undefined => {
  const data = useAtomValue(createCallRoomModalAtom);

  return data;
};

type CloseCallback = () => void;
export const useCloseCreateCallRoomModal = (): CloseCallback => {
  const setSettings = useSetAtom(createCallRoomModalAtom);

  const close: CloseCallback = useCallback(() => {
    setSettings(undefined);
  }, [setSettings]);

  return close;
};

type OpenCallback = (space?: string) => void;
export const useOpenCreateCallRoomModal = (): OpenCallback => {
  const setSettings = useSetAtom(createCallRoomModalAtom);

  const open: OpenCallback = useCallback(
    (spaceId) => {
      setSettings({ spaceId });
    },
    [setSettings]
  );

  return open;
};
