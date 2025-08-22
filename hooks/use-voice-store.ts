import { create } from "zustand";

type VoiceState = {
  connected: boolean;
  roomId: string | null;
  isMicMuted: boolean;
  isCamMuted: boolean;
  setConnected: (connected: boolean) => void;
  setRoomId: (roomId: string | null) => void;
  setMicMuted: (muted: boolean) => void;
  setCamMuted: (muted: boolean) => void;
};

export const useVoiceStore = create<VoiceState>((set) => ({
  connected: false,
  roomId: null,
  isMicMuted: false,
  isCamMuted: false,
  setConnected: (connected) => set({ connected }),
  setRoomId: (roomId) => set({ roomId }),
  setMicMuted: (isMicMuted) => set({ isMicMuted }),
  setCamMuted: (isCamMuted) => set({ isCamMuted }),
}));


