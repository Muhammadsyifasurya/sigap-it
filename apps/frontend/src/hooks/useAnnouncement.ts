import { useState, useEffect } from 'react';
import { announcementRepository } from '../data/repositories/announcementRepository';
import { Announcement, UpdateAnnouncementDto } from '../domain/models/Announcement';

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncement = async () => {
    try {
      const data = await announcementRepository.getActiveAnnouncement();
      if (data && Object.keys(data).length > 0) {
        setAnnouncement(data);
      } else {
        setAnnouncement(null);
      }
    } catch (error) {
      console.error('Failed to fetch announcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnnouncement = async (data: UpdateAnnouncementDto) => {
    try {
      const success = await announcementRepository.updateAnnouncement(data);
      if (success) {
        await fetchAnnouncement();
        return true;
      }
    } catch (error) {
      console.error('Failed to update announcement:', error);
    }
    return false;
  };

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  return { announcement, isLoading, fetchAnnouncement, updateAnnouncement };
}
