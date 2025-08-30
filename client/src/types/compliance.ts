export interface ComplianceEvent {
  id: string;
  wabaId: string;
  templateId?: string;
  eventType: string;
  status: 'safe' | 'warning' | 'danger';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata?: any;
  resolvedAt?: string;
  createdAt: string;
}

export interface ComplianceMetrics {
  totalEvents: number;
  activeAlerts: number;
  complianceScore: number;
  violationsPrevented: number;
  lastIncidentDate?: string;
}

export interface WebhookLog {
  id: string;
  wabaId: string;
  webhookType: string;
  payload: any;
  processed: boolean;
  processingError?: string;
  responseTime?: number;
  createdAt: string;
}
