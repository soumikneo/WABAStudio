import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  jsonb, 
  integer, 
  boolean, 
  decimal,
  pgEnum,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const templateStatusEnum = pgEnum('template_status', [
  'draft', 'pending', 'approved', 'rejected', 'paused'
]);

export const templateCategoryEnum = pgEnum('template_category', [
  'UTILITY', 'MARKETING', 'AUTHENTICATION'
]);

export const complianceStatusEnum = pgEnum('compliance_status', [
  'safe', 'warning', 'danger'
]);

export const activityTypeEnum = pgEnum('activity_type', [
  'template_created', 'template_updated', 'template_approved', 'template_rejected',
  'compliance_alert', 'team_member_added', 'validation_run', 'auto_fix_applied'
]);

export const aiProviderEnum = pgEnum('ai_provider', [
  'openai', 'anthropic'
]);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("member"), // admin, manager, member
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WhatsApp Business Accounts
export const whatsappAccounts = pgTable("whatsapp_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wabaId: varchar("waba_id").notNull().unique(),
  phoneNumberId: varchar("phone_number_id").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  displayName: varchar("display_name"),
  accessToken: text("access_token"),
  webhookVerifyToken: varchar("webhook_verify_token"),
  isActive: boolean("is_active").default(true),
  complianceScore: decimal("compliance_score", { precision: 5, scale: 2 }).default("98.5"),
  totalTemplates: integer("total_templates").default(0),
  approvedTemplates: integer("approved_templates").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Templates
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wabaId: varchar("waba_id").notNull(),
  metaTemplateId: varchar("meta_template_id"),
  name: varchar("name").notNull(),
  category: templateCategoryEnum("category").notNull(),
  language: varchar("language").default("en_US"),
  status: templateStatusEnum("status").default("draft"),
  components: jsonb("components").notNull(), // Header, body, footer, buttons
  variables: jsonb("variables"), // Variable definitions and sample data
  approvalProbability: decimal("approval_probability", { precision: 5, scale: 2 }),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  rejectionReason: text("rejection_reason"),
  lastValidatedAt: timestamp("last_validated_at"),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  createdBy: varchar("created_by").notNull(),
  updatedBy: varchar("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Template Analytics
export const templateAnalytics = pgTable("template_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  date: timestamp("date").notNull(),
  messagesSent: integer("messages_sent").default(0),
  messagesDelivered: integer("messages_delivered").default(0),
  messagesRead: integer("messages_read").default(0),
  messagesReplied: integer("messages_replied").default(0),
  deliveryRate: decimal("delivery_rate", { precision: 5, scale: 2 }),
  readRate: decimal("read_rate", { precision: 5, scale: 2 }),
  replyRate: decimal("reply_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance Events
export const complianceEvents = pgTable("compliance_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wabaId: varchar("waba_id").notNull(),
  templateId: varchar("template_id"),
  eventType: varchar("event_type").notNull(), // webhook_received, violation_detected, auto_fix_applied
  status: complianceStatusEnum("status").notNull(),
  severity: varchar("severity").notNull(), // low, medium, high, critical
  message: text("message").notNull(),
  metadata: jsonb("metadata"), // Event-specific data
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Validations
export const aiValidations = pgTable("ai_validations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  validationType: varchar("validation_type").notNull(), // pre_submit, periodic, auto_fix
  aiProvider: aiProviderEnum("ai_provider").default("openai"),
  approvalProbability: decimal("approval_probability", { precision: 5, scale: 2 }).notNull(),
  issues: jsonb("issues"), // Array of detected issues
  suggestions: jsonb("suggestions"), // AI suggestions for improvement
  autoFixesApplied: jsonb("auto_fixes_applied"), // Fixes automatically applied
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  processingTime: integer("processing_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Team Activity
export const teamActivity = pgTable("team_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  activityType: activityTypeEnum("activity_type").notNull(),
  resourceId: varchar("resource_id"), // template_id, compliance_event_id, etc.
  resourceType: varchar("resource_type"), // template, compliance_event, etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhooks Log
export const webhooksLog = pgTable("webhooks_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wabaId: varchar("waba_id").notNull(),
  webhookType: varchar("webhook_type").notNull(),
  payload: jsonb("payload").notNull(),
  processed: boolean("processed").default(false),
  processingError: text("processing_error"),
  responseTime: integer("response_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(templates),
  activities: many(teamActivity),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  creator: one(users, {
    fields: [templates.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [templates.updatedBy],
    references: [users.id],
  }),
  analytics: many(templateAnalytics),
  validations: many(aiValidations),
  complianceEvents: many(complianceEvents),
}));

export const templateAnalyticsRelations = relations(templateAnalytics, ({ one }) => ({
  template: one(templates, {
    fields: [templateAnalytics.templateId],
    references: [templates.id],
  }),
}));

export const complianceEventsRelations = relations(complianceEvents, ({ one }) => ({
  template: one(templates, {
    fields: [complianceEvents.templateId],
    references: [templates.id],
  }),
}));

export const aiValidationsRelations = relations(aiValidations, ({ one }) => ({
  template: one(templates, {
    fields: [aiValidations.templateId],
    references: [templates.id],
  }),
}));

export const teamActivityRelations = relations(teamActivity, ({ one }) => ({
  user: one(users, {
    fields: [teamActivity.userId],
    references: [users.id],
  }),
}));

// Zod schemas for Replit Auth
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertWhatsappAccountSchema = createInsertSchema(whatsappAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateAnalyticsSchema = createInsertSchema(templateAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceEventSchema = createInsertSchema(complianceEvents).omit({
  id: true,
  createdAt: true,
});

export const insertAiValidationSchema = createInsertSchema(aiValidations).omit({
  id: true,
  createdAt: true,
});

export const insertTeamActivitySchema = createInsertSchema(teamActivity).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookLogSchema = createInsertSchema(webhooksLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type WhatsappAccount = typeof whatsappAccounts.$inferSelect;
export type InsertWhatsappAccount = z.infer<typeof insertWhatsappAccountSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type TemplateAnalytics = typeof templateAnalytics.$inferSelect;
export type InsertTemplateAnalytics = z.infer<typeof insertTemplateAnalyticsSchema>;

export type ComplianceEvent = typeof complianceEvents.$inferSelect;
export type InsertComplianceEvent = z.infer<typeof insertComplianceEventSchema>;

export type AiValidation = typeof aiValidations.$inferSelect;
export type InsertAiValidation = z.infer<typeof insertAiValidationSchema>;

export type TeamActivity = typeof teamActivity.$inferSelect;
export type InsertTeamActivity = z.infer<typeof insertTeamActivitySchema>;

export type WebhookLog = typeof webhooksLog.$inferSelect;
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
