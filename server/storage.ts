import {
  users,
  whatsappAccounts,
  templates,
  templateAnalytics,
  complianceEvents,
  aiValidations,
  teamActivity,
  webhooksLog,
  type User,
  type UpsertUser,
  type WhatsappAccount,
  type InsertWhatsappAccount,
  type Template,
  type InsertTemplate,
  type TemplateAnalytics,
  type InsertTemplateAnalytics,
  type ComplianceEvent,
  type InsertComplianceEvent,
  type AiValidation,
  type InsertAiValidation,
  type TeamActivity,
  type InsertTeamActivity,
  type WebhookLog,
  type InsertWebhookLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, avg, sum, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  getActiveUsers(): Promise<User[]>;

  // WhatsApp Account operations
  getWhatsappAccount(wabaId: string): Promise<WhatsappAccount | undefined>;
  createWhatsappAccount(account: InsertWhatsappAccount): Promise<WhatsappAccount>;
  updateWhatsappAccount(wabaId: string, updates: Partial<InsertWhatsappAccount>): Promise<WhatsappAccount>;
  getWhatsappAccounts(): Promise<WhatsappAccount[]>;

  // Template operations
  getTemplate(id: string): Promise<Template | undefined>;
  getTemplateByName(wabaId: string, name: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;
  getTemplates(wabaId?: string, filters?: { status?: string; category?: string }): Promise<Template[]>;
  getTemplatesByUser(userId: string): Promise<Template[]>;
  getRecentTemplates(wabaId?: string, limit?: number): Promise<Template[]>;

  // Template Analytics operations
  createTemplateAnalytics(analytics: InsertTemplateAnalytics): Promise<TemplateAnalytics>;
  getTemplateAnalytics(templateId: string, startDate?: Date, endDate?: Date): Promise<TemplateAnalytics[]>;
  getTemplatePerformanceMetrics(templateId: string): Promise<{
    totalSent: number;
    deliveryRate: number;
    readRate: number;
    replyRate: number;
  }>;

  // Compliance operations
  createComplianceEvent(event: InsertComplianceEvent): Promise<ComplianceEvent>;
  getComplianceEvents(wabaId?: string, limit?: number): Promise<ComplianceEvent[]>;
  getActiveComplianceAlerts(wabaId?: string): Promise<ComplianceEvent[]>;
  updateComplianceEvent(id: string, updates: Partial<InsertComplianceEvent>): Promise<ComplianceEvent>;

  // AI Validation operations
  createAiValidation(validation: InsertAiValidation): Promise<AiValidation>;
  getAiValidations(templateId: string): Promise<AiValidation[]>;
  getLatestValidation(templateId: string): Promise<AiValidation | undefined>;

  // Team Activity operations
  createTeamActivity(activity: InsertTeamActivity): Promise<TeamActivity>;
  getTeamActivities(limit?: number): Promise<TeamActivity[]>;
  getUserActivities(userId: string, limit?: number): Promise<TeamActivity[]>;

  // Webhook operations
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  getWebhookLogs(wabaId?: string, limit?: number): Promise<WebhookLog[]>;
  markWebhookProcessed(id: string, error?: string): Promise<WebhookLog>;

  // Dashboard metrics
  getDashboardMetrics(wabaId?: string): Promise<{
    totalTemplates: number;
    approvalRate: number;
    activeTemplates: number;
    complianceScore: number;
  }>;

  // AI Validation statistics
  getValidationStats(): Promise<{
    totalValidations: number;
    avgApprovalRate: number;
    timesSaved: number;
    costAvoided: number;
    autoFixesApplied: number;
  }>;
  getRecentValidations(limit: number): Promise<any[]>;
  createValidationResult(result: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getActiveUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  // WhatsApp Account operations
  async getWhatsappAccount(wabaId: string): Promise<WhatsappAccount | undefined> {
    const [account] = await db
      .select()
      .from(whatsappAccounts)
      .where(eq(whatsappAccounts.wabaId, wabaId));
    return account;
  }

  async createWhatsappAccount(accountData: InsertWhatsappAccount): Promise<WhatsappAccount> {
    const [account] = await db.insert(whatsappAccounts).values(accountData).returning();
    return account;
  }

  async updateWhatsappAccount(wabaId: string, updates: Partial<InsertWhatsappAccount>): Promise<WhatsappAccount> {
    const [account] = await db
      .update(whatsappAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(whatsappAccounts.wabaId, wabaId))
      .returning();
    return account;
  }

  async getWhatsappAccounts(): Promise<WhatsappAccount[]> {
    return await db.select().from(whatsappAccounts).where(eq(whatsappAccounts.isActive, true));
  }

  // Template operations
  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async getTemplateByName(wabaId: string, name: string): Promise<Template | undefined> {
    const [template] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.wabaId, wabaId), eq(templates.name, name)));
    return template;
  }

  async createTemplate(templateData: InsertTemplate): Promise<Template> {
    const [template] = await db.insert(templates).values(templateData).returning();
    
    // Update WABA template count
    const currentAccount = await this.getWhatsappAccount(templateData.wabaId);
    if (currentAccount) {
      await db
        .update(whatsappAccounts)
        .set({ 
          totalTemplates: (currentAccount.totalTemplates || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(whatsappAccounts.wabaId, templateData.wabaId));
    }

    return template;
  }

  async updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template> {
    const [template] = await db
      .update(templates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return template;
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.getTemplate(id);
    if (template) {
      await db.delete(templates).where(eq(templates.id, id));
      
      // Update WABA template count
      const currentAccount = await this.getWhatsappAccount(template.wabaId);
      if (currentAccount) {
        await db
          .update(whatsappAccounts)
          .set({ 
            totalTemplates: Math.max(0, (currentAccount.totalTemplates || 0) - 1),
            updatedAt: new Date()
          })
          .where(eq(whatsappAccounts.wabaId, template.wabaId));
      }
    }
  }

  async getTemplates(wabaId?: string, filters?: { status?: string; category?: string }): Promise<Template[]> {
    let query = db.select().from(templates);
    
    const conditions = [];
    if (wabaId) conditions.push(eq(templates.wabaId, wabaId));
    if (filters?.status) conditions.push(eq(templates.status, filters.status as any));
    if (filters?.category) conditions.push(eq(templates.category, filters.category as any));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(templates.updatedAt));
  }

  async getTemplatesByUser(userId: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.createdBy, userId))
      .orderBy(desc(templates.createdAt));
  }

  async getRecentTemplates(wabaId?: string, limit = 10): Promise<Template[]> {
    let query = db.select().from(templates);
    
    if (wabaId) {
      query = query.where(eq(templates.wabaId, wabaId));
    }
    
    return await query.orderBy(desc(templates.updatedAt)).limit(limit);
  }

  // Template Analytics operations
  async createTemplateAnalytics(analyticsData: InsertTemplateAnalytics): Promise<TemplateAnalytics> {
    const [analytics] = await db.insert(templateAnalytics).values(analyticsData).returning();
    return analytics;
  }

  async getTemplateAnalytics(templateId: string, startDate?: Date, endDate?: Date): Promise<TemplateAnalytics[]> {
    let query = db.select().from(templateAnalytics).where(eq(templateAnalytics.templateId, templateId));
    
    const conditions = [eq(templateAnalytics.templateId, templateId)];
    if (startDate) conditions.push(gte(templateAnalytics.date, startDate));
    if (endDate) conditions.push(lte(templateAnalytics.date, endDate));
    
    return await db
      .select()
      .from(templateAnalytics)
      .where(and(...conditions))
      .orderBy(desc(templateAnalytics.date));
  }

  async getTemplatePerformanceMetrics(templateId: string): Promise<{
    totalSent: number;
    deliveryRate: number;
    readRate: number;
    replyRate: number;
  }> {
    const [metrics] = await db
      .select({
        totalSent: sum(templateAnalytics.messagesSent),
        avgDeliveryRate: avg(templateAnalytics.deliveryRate),
        avgReadRate: avg(templateAnalytics.readRate),
        avgReplyRate: avg(templateAnalytics.replyRate),
      })
      .from(templateAnalytics)
      .where(eq(templateAnalytics.templateId, templateId));

    return {
      totalSent: Number(metrics?.totalSent) || 0,
      deliveryRate: Number(metrics?.avgDeliveryRate) || 0,
      readRate: Number(metrics?.avgReadRate) || 0,
      replyRate: Number(metrics?.avgReplyRate) || 0,
    };
  }

  // Compliance operations
  async createComplianceEvent(eventData: InsertComplianceEvent): Promise<ComplianceEvent> {
    const [event] = await db.insert(complianceEvents).values(eventData).returning();
    return event;
  }

  async getComplianceEvents(wabaId?: string, limit = 50): Promise<ComplianceEvent[]> {
    let query = db.select().from(complianceEvents);
    
    if (wabaId) {
      query = query.where(eq(complianceEvents.wabaId, wabaId));
    }
    
    return await query.orderBy(desc(complianceEvents.createdAt)).limit(limit);
  }

  async getActiveComplianceAlerts(wabaId?: string): Promise<ComplianceEvent[]> {
    let query = db.select().from(complianceEvents).where(isNull(complianceEvents.resolvedAt));
    
    if (wabaId) {
      query = query.where(and(eq(complianceEvents.wabaId, wabaId), isNull(complianceEvents.resolvedAt)));
    }
    
    return await query.orderBy(desc(complianceEvents.createdAt));
  }

  async updateComplianceEvent(id: string, updates: Partial<InsertComplianceEvent>): Promise<ComplianceEvent> {
    const [event] = await db
      .update(complianceEvents)
      .set(updates)
      .where(eq(complianceEvents.id, id))
      .returning();
    return event;
  }

  // AI Validation operations
  async createAiValidation(validationData: InsertAiValidation): Promise<AiValidation> {
    const [validation] = await db.insert(aiValidations).values(validationData).returning();
    return validation;
  }

  async getAiValidations(templateId: string): Promise<AiValidation[]> {
    return await db
      .select()
      .from(aiValidations)
      .where(eq(aiValidations.templateId, templateId))
      .orderBy(desc(aiValidations.createdAt));
  }

  async getLatestValidation(templateId: string): Promise<AiValidation | undefined> {
    const [validation] = await db
      .select()
      .from(aiValidations)
      .where(eq(aiValidations.templateId, templateId))
      .orderBy(desc(aiValidations.createdAt))
      .limit(1);
    return validation;
  }

  // Team Activity operations
  async createTeamActivity(activityData: InsertTeamActivity): Promise<TeamActivity> {
    const [activity] = await db.insert(teamActivity).values(activityData).returning();
    return activity;
  }

  async getTeamActivities(limit = 20): Promise<TeamActivity[]> {
    return await db
      .select()
      .from(teamActivity)
      .orderBy(desc(teamActivity.createdAt))
      .limit(limit);
  }

  async getUserActivities(userId: string, limit = 10): Promise<TeamActivity[]> {
    return await db
      .select()
      .from(teamActivity)
      .where(eq(teamActivity.userId, userId))
      .orderBy(desc(teamActivity.createdAt))
      .limit(limit);
  }

  // Webhook operations
  async createWebhookLog(logData: InsertWebhookLog): Promise<WebhookLog> {
    const [log] = await db.insert(webhooksLog).values(logData).returning();
    return log;
  }

  async getWebhookLogs(wabaId?: string, limit = 100): Promise<WebhookLog[]> {
    let query = db.select().from(webhooksLog);
    
    if (wabaId) {
      query = query.where(eq(webhooksLog.wabaId, wabaId));
    }
    
    return await query.orderBy(desc(webhooksLog.createdAt)).limit(limit);
  }

  async markWebhookProcessed(id: string, error?: string): Promise<WebhookLog> {
    const [log] = await db
      .update(webhooksLog)
      .set({
        processed: true,
        processingError: error || null,
      })
      .where(eq(webhooksLog.id, id))
      .returning();
    return log;
  }

  // Dashboard metrics
  async getDashboardMetrics(wabaId?: string): Promise<{
    totalTemplates: number;
    approvalRate: number;
    activeTemplates: number;
    complianceScore: number;
  }> {
    // Get template counts
    let templateQuery = db.select({
      total: count(),
      approved: sum(sql`CASE WHEN ${templates.status} = 'approved' THEN 1 ELSE 0 END`),
      active: sum(sql`CASE WHEN ${templates.status} = 'approved' THEN 1 ELSE 0 END`),
    }).from(templates);
    
    if (wabaId) {
      templateQuery = templateQuery.where(eq(templates.wabaId, wabaId));
    }

    const [templateCounts] = await templateQuery;

    // Get account compliance score
    let complianceScore = 98.5; // Default
    if (wabaId) {
      const account = await this.getWhatsappAccount(wabaId);
      complianceScore = Number(account?.complianceScore) || 98.5;
    }
    
    const approvalRate = Number(templateCounts.total) > 0 
      ? (Number(templateCounts.approved) / Number(templateCounts.total)) * 100 
      : 0;

    return {
      totalTemplates: Number(templateCounts.total),
      approvalRate: Math.round(approvalRate),
      activeTemplates: Number(templateCounts.active),
      complianceScore: complianceScore,
    };
  }

  // AI Validation operations
  async getValidationStats(): Promise<{
    totalValidations: number;
    avgApprovalRate: number;
    timesSaved: number;
    costAvoided: number;
    autoFixesApplied: number;
  }> {
    // Mock validation statistics - replace with actual DB queries
    return {
      totalValidations: 247,
      avgApprovalRate: 94,
      timesSaved: 32,
      costAvoided: 2900,
      autoFixesApplied: 186
    };
  }

  async getRecentValidations(limit: number): Promise<any[]> {
    // Mock recent validations - replace with actual DB queries
    return [
      {
        id: '1',
        templateName: 'shipping_notification',
        approvalProbability: 98,
        status: 'safe',
        timestamp: '2 minutes ago',
        issues: [],
        autoFixSuggestions: []
      },
      {
        id: '2', 
        templateName: 'promo_flash_sale',
        approvalProbability: 72,
        status: 'warning',
        timestamp: '15 minutes ago',
        issues: [
          {
            severity: 'medium',
            message: 'Contains promotional language',
            suggestion: 'Use softer promotional tone'
          }
        ],
        autoFixSuggestions: [
          {
            type: 'Language optimization',
            description: 'Replace "FLASH SALE" with "Special offer"',
            impact: '+12% approval chance'
          }
        ]
      },
      {
        id: '3',
        templateName: 'generic_offer',
        approvalProbability: 34,
        status: 'danger',
        timestamp: '1 hour ago',
        issues: [
          {
            severity: 'high',
            message: 'Generic promotional content',
            suggestion: 'Add specific value proposition'
          }
        ],
        autoFixSuggestions: [
          {
            type: 'Content personalization',
            description: 'Add personalized greeting and specific offer details',
            impact: '+25% approval chance'
          }
        ]
      }
    ].slice(0, limit);
  }

  async createValidationResult(result: any): Promise<any> {
    // Mock implementation - in real app would store to database
    console.log('Validation result stored:', result.id);
    return result;
  }
}

export const storage = new DatabaseStorage();
