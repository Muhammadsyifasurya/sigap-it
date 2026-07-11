import { apiClient } from '../apiClient';
import { Announcement, UpdateAnnouncementDto } from '../../domain/models/Announcement';

export const announcementRepository = {
  getActiveAnnouncement: async (): Promise<Announcement | null> => {
    const response = await apiClient.get<Announcement>('/announcements/active');
    return response.data;
  },

  updateAnnouncement: async (data: UpdateAnnouncementDto): Promise<boolean> => {
    const response = await apiClient.put('/announcements', data);
    return response.status >= 200 && response.status < 300;
  },
};
