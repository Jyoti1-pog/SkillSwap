import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      unreadNotifications: 0,
      unreadMessages: 0,

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          return { theme: newTheme };
        }),

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setUnreadNotifications: (count) => set({ unreadNotifications: count }),
      setUnreadMessages: (count) => set({ unreadMessages: count }),
      incrementNotifications: () => set((s) => ({ unreadNotifications: s.unreadNotifications + 1 })),
      incrementMessages: () => set((s) => ({ unreadMessages: s.unreadMessages + 1 })),
    }),
    { name: 'ui-storage', partialize: (s) => ({ theme: s.theme, sidebarOpen: s.sidebarOpen }) }
  )
);

export default useUIStore;
