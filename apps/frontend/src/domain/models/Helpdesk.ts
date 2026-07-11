export interface TicketReporter {
  name: string;
  email: string;
  department: {
    name: string;
  };
}

export interface TicketAssignee {
  name: string;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  user: {
    name: string;
    roleId: number;
  };
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  attachmentUrl: string | null;
  ticketType: 'INCIDENT' | 'SERVICE_REQUEST';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reporter: TicketReporter;
  assignee: TicketAssignee | null;
  downtimeMinutes: number | null;
  rootCause: string | null;
  resolutionNotes: string | null;
  comments?: TicketComment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface TicketResponse {
  success: boolean;
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTicketDto {
  ticketNumber: string;
  title: string;
  description: string;
  ticketType: 'INCIDENT' | 'SERVICE_REQUEST';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  file?: File | null;
}

export interface UpdateTicketDto {
  downtimeMinutes?: number;
  rootCause?: string;
  resolutionNotes: string;
}
