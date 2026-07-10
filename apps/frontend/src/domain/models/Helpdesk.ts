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

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  ticketType: 'INCIDENT' | 'SERVICE_REQUEST';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reporter: TicketReporter;
  assignee: TicketAssignee | null;
  downtimeMinutes: number | null;
  rootCause: string | null;
  resolutionNotes: string | null;
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
}

export interface UpdateTicketDto {
  downtimeMinutes?: number;
  rootCause?: string;
  resolutionNotes: string;
}
