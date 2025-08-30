import { useEffect, useCallback } from 'react';
import { useWebSocket as useWebSocketContext } from '@/lib/websocket-client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  data: any;
  room?: string;
  userId?: string;
}

export function useWebSocket() {
  const { sendMessage, lastMessage, isConnected, connectionState } = useWebSocketContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'template_update':
        // Invalidate template queries when templates are updated by other users
        queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
        toast({
          title: 'Template Updated',
          description: `Template "${lastMessage.data.templateId}" was updated by another user`,
        });
        break;

      case 'compliance_alert':
        // Show compliance alerts
        toast({
          title: 'Compliance Alert',
          description: lastMessage.data.message,
          variant: 'destructive',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/compliance'] });
        break;

      case 'activity_update':
        // Refresh team activity
        queryClient.invalidateQueries({ queryKey: ['/api/team/activity'] });
        break;

      case 'user_online':
      case 'user_offline':
        // Update user status (could be used for presence indicators)
        break;

      case 'validation_result':
        // Handle validation results
        toast({
          title: 'Validation Complete',
          description: `Approval probability: ${lastMessage.data.approvalProbability}%`,
        });
        break;

      case 'auto_fix_applied':
        // Handle auto-fix results
        toast({
          title: 'Auto-fix Applied',
          description: 'Template has been automatically optimized',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
        break;

      case 'error':
        toast({
          title: 'Connection Error',
          description: lastMessage.data.message,
          variant: 'destructive',
        });
        break;

      default:
        console.log('Unhandled WebSocket message:', lastMessage);
    }
  }, [lastMessage, toast, queryClient]);

  const joinRoom = useCallback((room: string) => {
    sendMessage({
      type: 'join_room',
      data: { room }
    });
  }, [sendMessage]);

  const leaveRoom = useCallback((room: string) => {
    sendMessage({
      type: 'leave_room',
      data: { room }
    });
  }, [sendMessage]);

  const sendTemplateUpdate = useCallback((templateId: string, changes: any) => {
    sendMessage({
      type: 'template_editing',
      data: {
        templateId,
        changes
      }
    });
  }, [sendMessage]);

  const sendCursorPosition = useCallback((templateId: string, position: any) => {
    sendMessage({
      type: 'cursor_position',
      data: {
        templateId,
        position
      }
    });
  }, [sendMessage]);

  const reportComplianceIssue = useCallback((wabaId: string, templateId: string, message: string, severity: string) => {
    sendMessage({
      type: 'compliance_alert',
      data: {
        wabaId,
        templateId,
        message,
        severity
      }
    });
  }, [sendMessage]);

  const logActivity = useCallback((activityType: string, resourceId: string, resourceType: string, description: string, metadata?: any) => {
    sendMessage({
      type: 'team_activity',
      data: {
        activityType,
        resourceId,
        resourceType,
        description,
        metadata
      }
    });
  }, [sendMessage]);

  return {
    isConnected,
    connectionState,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendTemplateUpdate,
    sendCursorPosition,
    reportComplianceIssue,
    logActivity
  };
}
