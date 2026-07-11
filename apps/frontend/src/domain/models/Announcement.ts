export interface Announcement {
  id: number;
  title: string;
  message: string;
  isActive: boolean;
  updatedAt: string;
}

export interface UpdateAnnouncementDto {
  title: string;
  message: string;
  isActive: boolean;
}
