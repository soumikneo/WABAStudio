import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { ComplianceEvent } from '@/types/compliance';

export function useComplianceEvents(wabaId?: string) {
  return useQuery({
    queryKey: ['/api/compliance/events', wabaId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (wabaId) params.append('wabaId', wabaId);
      
      const response = await fetch(`/api/compliance/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch compliance events');
      return response.json();
    },
  });
}

export function useComplianceAlerts(wabaId?: string) {
  return useQuery({
    queryKey: ['/api/compliance/alerts', wabaId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (wabaId) params.append('wabaId', wabaId);
      
      const response = await fetch(`/api/compliance/alerts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch compliance alerts');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time alerts
  });
}

export function useCreateComplianceEvent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: Omit<ComplianceEvent, 'id' | 'createdAt'>) => {
      const response = await apiRequest('POST', '/api/compliance/events', eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/alerts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create compliance event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useResolveComplianceEvent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest('PUT', `/api/compliance/events/${eventId}`, {
        resolvedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/alerts'] });
      toast({
        title: 'Event resolved',
        description: 'Compliance event has been marked as resolved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to resolve event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useComplianceMetrics(wabaId?: string) {
  return useQuery({
    queryKey: ['/api/compliance/metrics', wabaId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (wabaId) params.append('wabaId', wabaId);
      
      // This would need to be implemented on the backend
      const response = await fetch(`/api/compliance/metrics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch compliance metrics');
      return response.json();
    },
  });
}
