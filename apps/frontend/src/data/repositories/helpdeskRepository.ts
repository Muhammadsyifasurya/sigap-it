import { apiClient } from '../apiClient';
import { TicketResponse, Ticket, CreateTicketDto, UpdateTicketDto } from '../../domain/models/Helpdesk';

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
    const response = await apiClient.post<{ success: boolean; data: Ticket }>('/helpdesk/tickets', data);
    return response.data;
  },

  assignTicket: async (id: number) => {
    const response = await apiClient.patch<{ success: boolean; data: Ticket }>(`/helpdesk/tickets/${id}/assign`);
    return response.data;
  },

  resolveTicket: async (id: number, data: UpdateTicketDto) => {
    const response = await apiClient.patch<{ success: boolean; data: Ticket }>(`/helpdesk/tickets/${id}/resolve`, data);
    return response.data;
  },
};
