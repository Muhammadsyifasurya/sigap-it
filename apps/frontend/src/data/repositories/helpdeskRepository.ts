import { apiClient } from '../apiClient';
import { TicketResponse, Ticket, CreateTicketDto, UpdateTicketDto, TicketComment } from '../../domain/models/Helpdesk';

export const helpdeskRepository = {
  getTickets: async (page: number = 1, limit: number = 10): Promise<TicketResponse> => {
    const response = await apiClient.get<TicketResponse>(`/helpdesk/tickets`, {
      params: { page, limit },
    });
    return response.data;
  },

  getTicketById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: Ticket }>(`/helpdesk/tickets/${id}`);
    return response.data;
  },

  createTicket: async (data: CreateTicketDto) => {
    let payload: any = data;
    let headers = {};
    if (data.file) {
      const formData = new FormData();
      formData.append('ticketNumber', data.ticketNumber);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('ticketType', data.ticketType);
      formData.append('priority', data.priority);
      if (data.category) formData.append('category', data.category);
      formData.append('file', data.file);
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await apiClient.post<{ success: boolean; data: Ticket }>('/helpdesk/tickets', payload, { headers });
    return response.data;
  },

  addComment: async (ticketId: number, message: string) => {
    const response = await apiClient.post<{ success: boolean; data: TicketComment }>(`/helpdesk/tickets/${ticketId}/comments`, { message });
    return response.data;
  },

  assignTicket: async (id: number, assigneeId?: number) => {
    const response = await apiClient.patch<{ success: boolean; data: Ticket }>(`/helpdesk/tickets/${id}/assign`, { assigneeId });
    return response.data;
  },

  resolveTicket: async (id: number, data: UpdateTicketDto) => {
    const response = await apiClient.patch<{ success: boolean; data: Ticket }>(`/helpdesk/tickets/${id}/resolve`, data);
    return response.data;
  },
};
