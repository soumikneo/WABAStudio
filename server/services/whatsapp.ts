import type { Template, WhatsappAccount } from "@shared/schema";
import { storage } from "../storage";

interface WhatsAppTemplateComponent {
  type: string;
  text?: string;
  format?: string;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

interface WhatsAppTemplate {
  name: string;
  category: string;
  language: string;
  components: WhatsAppTemplateComponent[];
}

export class WhatsAppService {
  private readonly baseUrl = "https://graph.facebook.com/v18.0";
  private readonly accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_TOKEN || "default_token";

  async submitTemplate(template: Template): Promise<{ id: string; status: string }> {
    try {
      const account = await storage.getWhatsappAccount(template.wabaId);
      if (!account) {
        throw new Error("WhatsApp Business Account not found");
      }

      const whatsappTemplate = this.convertToWhatsAppFormat(template);
      
      const response = await fetch(
        `${this.baseUrl}/${account.wabaId}/message_templates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(whatsappTemplate),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("WhatsApp API error:", error);
        throw new Error(`WhatsApp API error: ${error.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Log compliance event
      await storage.createComplianceEvent({
        wabaId: template.wabaId,
        templateId: template.id,
        eventType: 'template_submitted',
        status: 'safe',
        severity: 'low',
        message: `Template "${template.name}" submitted to WhatsApp for approval`,
        metadata: { metaTemplateId: result.id },
      });

      return {
        id: result.id,
        status: result.status || 'PENDING'
      };

    } catch (error) {
      console.error("Error submitting template to WhatsApp:", error);
      
      // Log compliance event for submission failure
      await storage.createComplianceEvent({
        wabaId: template.wabaId,
        templateId: template.id,
        eventType: 'template_submission_failed',
        status: 'danger',
        severity: 'high',
        message: `Failed to submit template "${template.name}": ${error.message}`,
        metadata: { error: error.message },
      });

      throw error;
    }
  }

  async getTemplateStatus(wabaId: string, templateId: string): Promise<{
    id: string;
    name: string;
    status: string;
    category: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${wabaId}/message_templates/${templateId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get template status: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data[0] || result;

    } catch (error) {
      console.error("Error getting template status:", error);
      throw error;
    }
  }

  async processWebhook(payload: any): Promise<void> {
    try {
      const entry = payload.entry?.[0];
      if (!entry) return;

      const wabaId = entry.id;
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field === 'message_template_status_update') {
          await this.handleTemplateStatusUpdate(wabaId, change.value);
        } else if (change.field === 'message_template_category_update') {
          await this.handleTemplateCategoryUpdate(wabaId, change.value);
        }
      }

    } catch (error) {
      console.error("Error processing webhook:", error);
      throw error;
    }
  }

  private async handleTemplateStatusUpdate(wabaId: string, data: any): Promise<void> {
    try {
      const { message_template_id, message_template_name, event } = data;
      
      // Find our template by name and WABA ID
      const template = await storage.getTemplateByName(wabaId, message_template_name);
      if (!template) {
        console.log(`Template not found: ${message_template_name} in WABA ${wabaId}`);
        return;
      }

      // Update template status
      const statusMap: { [key: string]: string } = {
        'APPROVED': 'approved',
        'REJECTED': 'rejected',
        'PENDING': 'pending',
        'PAUSED': 'paused'
      };

      const newStatus = statusMap[event] || event.toLowerCase();
      
      await storage.updateTemplate(template.id, {
        status: newStatus as any,
        metaTemplateId: message_template_id,
        approvedAt: event === 'APPROVED' ? new Date() : undefined,
        rejectionReason: event === 'REJECTED' ? data.reason : undefined,
      });

      // Create compliance event
      const severityMap: { [key: string]: string } = {
        'APPROVED': 'low',
        'REJECTED': 'medium',
        'PENDING': 'low',
        'PAUSED': 'medium'
      };

      const statusColorMap: { [key: string]: string } = {
        'APPROVED': 'safe',
        'REJECTED': 'danger',
        'PENDING': 'warning',
        'PAUSED': 'warning'
      };

      await storage.createComplianceEvent({
        wabaId,
        templateId: template.id,
        eventType: 'template_status_update',
        status: statusColorMap[event] as any,
        severity: severityMap[event] as any,
        message: `Template "${message_template_name}" status changed to ${event}`,
        metadata: {
          previousStatus: template.status,
          newStatus,
          metaTemplateId: message_template_id,
          reason: data.reason,
        },
      });

      // Log team activity
      await storage.createTeamActivity({
        userId: template.createdBy,
        activityType: event === 'APPROVED' ? 'template_approved' : 'template_rejected',
        resourceId: template.id,
        resourceType: 'template',
        description: `Template "${template.name}" ${event.toLowerCase()} by WhatsApp`,
        metadata: { event, reason: data.reason },
      });

      console.log(`Template ${message_template_name} status updated to ${event}`);

    } catch (error) {
      console.error("Error handling template status update:", error);
    }
  }

  private async handleTemplateCategoryUpdate(wabaId: string, data: any): Promise<void> {
    try {
      const { message_template_id, message_template_name, previous_category, new_category } = data;
      
      // Find our template
      const template = await storage.getTemplateByName(wabaId, message_template_name);
      if (!template) {
        console.log(`Template not found: ${message_template_name} in WABA ${wabaId}`);
        return;
      }

      // Update template category
      await storage.updateTemplate(template.id, {
        category: new_category.toLowerCase() as any,
      });

      // Create critical compliance event - category changes can break compliance
      await storage.createComplianceEvent({
        wabaId,
        templateId: template.id,
        eventType: 'template_category_update',
        status: 'warning',
        severity: 'high',
        message: `CRITICAL: Template "${message_template_name}" category changed from ${previous_category} to ${new_category} by WhatsApp`,
        metadata: {
          previousCategory: previous_category,
          newCategory: new_category,
          metaTemplateId: message_template_id,
          riskLevel: 'HIGH',
          requiresAction: true,
        },
      });

      // This is a critical event that requires immediate attention
      console.log(`CRITICAL: Template category change detected for ${message_template_name}`);

    } catch (error) {
      console.error("Error handling template category update:", error);
    }
  }

  private convertToWhatsAppFormat(template: Template): WhatsAppTemplate {
    const components: WhatsAppTemplateComponent[] = [];

    // Convert components from our format to WhatsApp format
    const templateComponents = template.components as any;

    if (templateComponents.header) {
      components.push({
        type: 'HEADER',
        format: templateComponents.header.format || 'TEXT',
        text: templateComponents.header.text,
      });
    }

    if (templateComponents.body) {
      components.push({
        type: 'BODY',
        text: templateComponents.body.text,
      });
    }

    if (templateComponents.footer) {
      components.push({
        type: 'FOOTER',
        text: templateComponents.footer.text,
      });
    }

    if (templateComponents.buttons && templateComponents.buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: templateComponents.buttons.map((btn: any) => ({
          type: btn.type || 'URL',
          text: btn.text,
          url: btn.url,
          phone_number: btn.phone_number,
        })),
      });
    }

    return {
      name: template.name,
      category: template.category,
      language: template.language,
      components,
    };
  }

  async getAccountInfo(wabaId: string): Promise<{
    id: string;
    name: string;
    status: string;
    phone_numbers: Array<{
      id: string;
      phone_number: string;
      display_name: string;
    }>;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${wabaId}?fields=id,name,account_review_status,phone_numbers`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get account info: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error("Error getting account info:", error);
      throw error;
    }
  }

  async sendTemplateMessage(phoneNumberId: string, to: string, template: Template, parameters?: any): Promise<{
    messaging_product: string;
    contacts: Array<{ input: string; wa_id: string }>;
    messages: Array<{ id: string }>;
  }> {
    try {
      const message = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: template.name,
          language: {
            code: template.language
          },
          components: this.buildTemplateParameters(template, parameters),
        },
      };

      const response = await fetch(
        `${this.baseUrl}/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhatsApp messaging error: ${error.error?.message || 'Unknown error'}`);
      }

      return await response.json();

    } catch (error) {
      console.error("Error sending template message:", error);
      throw error;
    }
  }

  private buildTemplateParameters(template: Template, parameters: any): any[] {
    const components = [];
    const templateComponents = template.components as any;

    if (templateComponents.body && parameters?.body) {
      components.push({
        type: "body",
        parameters: parameters.body.map((value: string) => ({
          type: "text",
          text: value,
        })),
      });
    }

    return components;
  }
}

export const whatsappService = new WhatsAppService();
