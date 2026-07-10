import { useState, useCallback } from 'react';
import { helpdeskRepository } from '../data/repositories/helpdeskRepository';
import { Ticket, CreateTicketDto, UpdateTicketDto } from '../domain/models/Helpdesk';

export const useHelpdesk = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await helpdeskRepository.getTickets(page, limit);
      setTickets(response.data);
      setTotal(response.meta.total);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data tiket');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTicketById = async (id: number) => {
    try {
      const res = await helpdeskRepository.getTicketById(id);
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Gagal mengambil detail tiket');
    }
  };

  const createTicket = async (data: CreateTicketDto) => {
    try {
      await helpdeskRepository.createTicket(data);
      // Refresh list after create
      fetchTickets();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat tiket');
      return false;
    }
  };

  const assignTicket = async (id: number) => {
    try {
      await helpdeskRepository.assignTicket(id);
      fetchTickets();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal assign tiket');
      return false;
    }
  };

  const resolveTicket = async (id: number, data: UpdateTicketDto) => {
    try {
      await helpdeskRepository.resolveTicket(id, data);
      fetchTickets();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal resolve tiket');
      return false;
    }
  };

  return {
    tickets,
    total,
    isLoading,
    error,
    fetchTickets,
    fetchTicketById,
    createTicket,
    assignTicket,
    resolveTicket,
  };
};
