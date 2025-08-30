export interface Template {
  id: string;
  wabaId: string;
  metaTemplateId?: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  language: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paused';
  components: {
    header?: {
      type?: string;
      text?: string;
      format?: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    buttons?: Array<{
      type: string;
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  };
  variables?: any;
  approvalProbability?: number;
  qualityScore?: number;
  rejectionReason?: string;
  lastValidatedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateAnalytics {
  id: string;
  templateId: string;
  date: string;
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesReplied: number;
  deliveryRate: number;
  readRate: number;
  replyRate: number;
  createdAt: string;
}

export interface AiValidation {
  id: string;
  templateId: string;
  validationType: string;
  approvalProbability: number;
  issues?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    suggestion?: string;
  }>;
  suggestions?: Array<{
    type: string;
    message: string;
    implementation?: string;
  }>;
  autoFixesApplied?: Array<{
    type: string;
    before: string;
    after: string;
    reason: string;
  }>;
  confidence: number;
  processingTime: number;
  createdAt: string;
}

export interface TemplateFormData {
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  language: string;
  bodyText: string;
  headerText?: string;
  footerText?: string;
  buttonText?: string;
  buttonUrl?: string;
}
