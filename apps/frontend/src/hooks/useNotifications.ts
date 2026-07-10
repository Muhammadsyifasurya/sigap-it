import { useState, useEffect, useMemo } from 'react';
import { useHelpdesk } from './useHelpdesk';
import { useAssets } from './useAssets';
import { useAuthStore } from '../store/authStore';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  link?: string;
}

export function useNotifications() {
  const { user } = useAuthStore();
  const { tickets, fetchTickets } = useHelpdesk();
  const { assets, fetchAssets } = useAssets();
  
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sigapit_read_notifications');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return [];
  });

  // Initial fetch for dashboard if not already loaded
  useEffect(() => {
    if (user) {
      fetchTickets(1, 50);
      fetchAssets(1, 50);
    }
  }, [user, fetchTickets, fetchAssets]);
  
  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem('sigapit_read_notifications', JSON.stringify(newReadIds));
  };
  
  const markAllAsRead = () => {
    const newReadIds = notifications.map(n => n.id);
    setReadIds(newReadIds);
    localStorage.setItem('sigapit_read_notifications', JSON.stringify(newReadIds));
  };

  const notifications = useMemo(() => {
    if (!user) return [];
    
    const notifs: NotificationItem[] = [];
    const isKaryawan = user.role?.id === 3;
    
    if (isKaryawan) {
      // 1. Karyawan: Tickets that are IN_PROGRESS or RESOLVED
      // We check reporter by department or just assume they own it for demo purposes, 
      // but ideally backend should filter this. For smart notifications, we use what we have.
      const myTickets = tickets; // Assuming backend returns only their tickets or we mock it
      myTickets.forEach(t => {
        if (t.status === 'IN_PROGRESS') {
          notifs.push({
            id: `ticket-${t.id}-inprogress`,
            title: 'Tiket Sedang Diproses',
            message: `Tiket ${t.ticketNumber} (${t.title}) sedang dikerjakan oleh tim IT.`,
            date: t.updatedAt || new Date().toISOString(),
            type: 'INFO',
            read: readIds.includes(`ticket-${t.id}-inprogress`),
            link: '/dashboard/helpdesk'
          });
        } else if (t.status === 'RESOLVED') {
          notifs.push({
            id: `ticket-${t.id}-resolved`,
            title: 'Tiket Selesai',
            message: `Tiket ${t.ticketNumber} (${t.title}) telah diselesaikan.`,
            date: t.resolvedAt || t.updatedAt || new Date().toISOString(),
            type: 'SUCCESS',
            read: readIds.includes(`ticket-${t.id}-resolved`),
            link: '/dashboard/helpdesk'
          });
        }
      });
      
      // 2. Karyawan: Assets assigned to them
      const myAssets = assets.filter(a => a.currentUserId === user.id);
      myAssets.forEach(a => {
        notifs.push({
          id: `asset-${a.id}-assigned`,
          title: 'Aset Baru Diberikan',
          message: `Perangkat ${a.brand} ${a.model} (${a.assetTag}) telah dicatat sebagai aset Anda.`,
          date: a.purchaseDate || new Date().toISOString(),
          type: 'INFO',
          read: readIds.includes(`asset-${a.id}-assigned`),
          link: '/dashboard/assets'
        });
      });
      
    } else {
      // 1. Admin: New tickets (OPEN)
      tickets.forEach(t => {
        if (t.status === 'OPEN') {
          notifs.push({
            id: `ticket-${t.id}-open`,
            title: 'Tiket Baru Masuk',
            message: `Tiket ${t.ticketNumber} menunggu untuk ditugaskan.`,
            date: t.createdAt || new Date().toISOString(),
            type: 'WARNING',
            read: readIds.includes(`ticket-${t.id}-open`),
            link: '/dashboard/helpdesk'
          });
        }
      });
      
      // 2. Admin: Assets in maintenance
      assets.forEach(a => {
        if (a.status === 'MAINTENANCE') {
          notifs.push({
            id: `asset-${a.id}-maintenance`,
            title: 'Aset Sedang Perbaikan',
            message: `Perangkat ${a.brand} ${a.model} (${a.assetTag}) sedang dalam perbaikan.`,
            date: new Date().toISOString(),
            type: 'WARNING',
            read: readIds.includes(`asset-${a.id}-maintenance`),
            link: '/dashboard/assets'
          });
        }
      });
    }
    
    // Sort by date desc
    return notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user, tickets, assets, readIds]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
