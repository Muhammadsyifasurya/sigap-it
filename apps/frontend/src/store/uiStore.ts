import { create } from 'zustand';

interface UiState {
  isNotifOpen: boolean;
  notifTab: 'PERSONAL' | 'GLOBAL';
  setIsNotifOpen: (isOpen: boolean) => void;
  setNotifTab: (tab: 'PERSONAL' | 'GLOBAL') => void;
}

export const useUiStore = create<UiState>((set) => ({
  isNotifOpen: false,
  notifTab: 'PERSONAL',
  setIsNotifOpen: (isOpen) => set({ isNotifOpen: isOpen }),
  setNotifTab: (tab) => set({ notifTab: tab }),
}));
