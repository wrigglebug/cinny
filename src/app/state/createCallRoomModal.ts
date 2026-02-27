import { atom } from 'jotai';

export type CreateCallRoomModalState = {
  spaceId?: string;
};

export const createCallRoomModalAtom = atom<CreateCallRoomModalState | undefined>(undefined);
