import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Template, TemplateFormData } from '@/types/template';

interface UseTemplatesOptions {
  wabaId?: string;
  status?: string;
  category?: string;
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  return useQuery({
    queryKey: ['/api/templates', options.wabaId, options.status, options.category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.wabaId) params.append('wabaId', options.wabaId);
      if (options.status) params.append('status', options.status);
      if (options.category) params.append('category', options.category);
      
      const response = await fetch(`/api/templates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['/api/templates', id],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${id}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      return response.json();
    },
    enabled: !!id && id !== 'new',
  });
}

export function useCreateTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Template>) => {
      const response = await apiRequest('POST', '/api/templates', data);
      return response.json();
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Template created',
        description: `Template "${template.name}" has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Template> }) => {
      const response = await apiRequest('PUT', `/api/templates/${id}`, data);
      return response.json();
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates', template.id] });
      toast({
        title: 'Template updated',
        description: `Template "${template.name}" has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Template deleted',
        description: 'Template has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useValidateTemplate() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest('POST', `/api/templates/${templateId}/validate`);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: 'Validation complete',
        description: `Approval probability: ${result.approvalProbability}%`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Validation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAutoFixTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, userId }: { templateId: string; userId: string }) => {
      const response = await apiRequest('POST', `/api/templates/${templateId}/auto-fix`, { userId });
      return response.json();
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates', template.id] });
      toast({
        title: 'Auto-fix applied',
        description: 'Template has been automatically optimized.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Auto-fix failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSubmitTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest('POST', '/api/whatsapp/submit-template', { templateId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Submitted for approval',
        description: 'Template has been submitted to WhatsApp for approval.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
