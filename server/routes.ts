import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { whatsappService } from "./services/whatsapp";
import { openaiService } from "./services/openai";
import { aiProviderFactory } from "./services/ai-provider-factory";
import { setupWebSocket } from "./services/websocket";
import { setupAuth, isAuthenticated } from "./replit-auth";
import { insertTemplateSchema, insertComplianceEventSchema, insertTeamActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const { wabaId, status, category } = req.query;
      const templates = await storage.getTemplates(
        wabaId as string,
        { status: status as string, category: category as string }
      );
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templateData = insertTemplateSchema.parse({
        ...req.body,
        createdBy: userId,
        wabaId: req.body.wabaId || "default_waba",
      });
      
      const template = await storage.createTemplate(templateData);
      
      // Log team activity
      await storage.createTeamActivity({
        userId: userId,
        activityType: 'template_created',
        resourceId: template.id,
        resourceType: 'template',
        description: `Created template "${template.name}"`,
      });

      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const templateId = req.params.id;
      if (!templateId || templateId === 'undefined') {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const userId = req.user.claims.sub;
      const updates = { ...req.body, updatedBy: userId };
      const template = await storage.updateTemplate(templateId, updates);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Log team activity
      await storage.createTeamActivity({
        userId: userId,
        activityType: 'template_updated',
        resourceId: template.id,
        resourceType: 'template',
        description: `Updated template "${template.name}"`,
      });

      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // AI Validation routes
  app.post("/api/templates/:id/validate", isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const provider = req.body.provider || 'openai';
      const validation = await aiProviderFactory.validateTemplate(template, provider);
      const aiValidation = await storage.createAiValidation({
        templateId: template.id,
        validationType: 'pre_submit',
        approvalProbability: validation.approvalProbability.toString(),
        issues: validation.issues,
        suggestions: validation.suggestions,
        autoFixesApplied: validation.autoFixesApplied || [],
        confidence: (validation.confidence || 0).toString(),
        processingTime: validation.processingTime || 0,
        aiProvider: validation.provider,
      });

      res.json(aiValidation);
    } catch (error) {
      console.error("Error validating template:", error);
      res.status(500).json({ message: "Failed to validate template" });
    }
  });

  app.post("/api/templates/:id/auto-fix", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const provider = req.body.provider || 'openai';
      const issues = req.body.issues || [];
      const fixResult = await aiProviderFactory.autoFixTemplate(template, issues, provider);
      
      if (fixResult.success) {
        const updatedTemplate = await storage.updateTemplate(template.id, {
          components: fixResult.components || fixResult.fixedTemplate?.components,
          updatedBy: userId,
        });

        // Log auto-fix activity
        await storage.createTeamActivity({
          userId: userId,
          activityType: 'auto_fix_applied',
          resourceId: template.id,
          resourceType: 'template',
          description: `Auto-fix applied using ${fixResult.provider} to template "${template.name}"`,
          metadata: { 
            provider: fixResult.provider,
            fixesApplied: fixResult.fixesApplied || fixResult.changesApplied 
          }
        });

        res.json({
          template: updatedTemplate,
          fixResult
        });
      } else {
        res.status(400).json({ message: "Auto-fix failed", details: fixResult });
      }
    } catch (error) {
      console.error("Error auto-fixing template:", error);
      res.status(500).json({ message: "Failed to auto-fix template" });
    }
  });

  // AI Provider comparison route
  app.post("/api/templates/:id/compare-providers", isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const comparison = await aiProviderFactory.compareProviders(template);
      res.json(comparison);
    } catch (error) {
      console.error("Error comparing AI providers:", error);
      res.status(500).json({ message: "Failed to compare AI providers" });
    }
  });

  // WhatsApp API routes
  app.post("/api/whatsapp/submit-template", isAuthenticated, async (req, res) => {
    try {
      const { templateId } = req.body;
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const result = await whatsappService.submitTemplate(template);
      
      // Update template with Meta response
      await storage.updateTemplate(templateId, {
        metaTemplateId: result.id,
        status: 'pending',
        submittedAt: new Date(),
      });

      res.json(result);
    } catch (error) {
      console.error("Error submitting template to WhatsApp:", error);
      res.status(500).json({ message: "Failed to submit template" });
    }
  });

  // Webhook verification endpoint for Meta
  app.get("/api/webhooks/whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Verify webhook subscription
    if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      res.status(200).send(challenge);
    } else {
      console.log("Failed webhook verification");
      res.status(403).send("Forbidden");
    }
  });

  // Webhook endpoint for Meta
  app.post("/api/webhooks/whatsapp", async (req, res) => {
    try {
      const payload = req.body;
      
      // Log webhook
      const webhookLog = await storage.createWebhookLog({
        wabaId: payload.entry?.[0]?.id || 'unknown',
        webhookType: payload.object || 'unknown',
        payload: payload,
      });

      // Process webhook
      const processingResult = await whatsappService.processWebhook(payload);
      
      // Mark as processed
      await storage.markWebhookProcessed(webhookLog.id);

      res.status(200).send("OK");
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // Compliance routes
  app.get("/api/compliance/events", async (req, res) => {
    try {
      const { wabaId } = req.query;
      const events = await storage.getComplianceEvents(wabaId as string);
      res.json(events);
    } catch (error) {
      console.error("Error fetching compliance events:", error);
      res.status(500).json({ message: "Failed to fetch compliance events" });
    }
  });

  app.get("/api/compliance/alerts", async (req, res) => {
    try {
      const { wabaId } = req.query;
      const alerts = await storage.getActiveComplianceAlerts(wabaId as string);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching compliance alerts:", error);
      res.status(500).json({ message: "Failed to fetch compliance alerts" });
    }
  });

  app.post("/api/compliance/events", isAuthenticated, async (req, res) => {
    try {
      const eventData = insertComplianceEventSchema.parse(req.body);
      const event = await storage.createComplianceEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating compliance event:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create compliance event" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const { wabaId } = req.query;
      const metrics = await storage.getDashboardMetrics(wabaId as string);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/analytics/templates/:id", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await storage.getTemplateAnalytics(
        req.params.id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching template analytics:", error);
      res.status(500).json({ message: "Failed to fetch template analytics" });
    }
  });

  app.get("/api/analytics/templates/:id/performance", async (req, res) => {
    try {
      const metrics = await storage.getTemplatePerformanceMetrics(req.params.id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching template performance:", error);
      res.status(500).json({ message: "Failed to fetch template performance" });
    }
  });

  // AI Validator routes
  app.get("/api/ai/validation/stats", async (req, res) => {
    try {
      const stats = await storage.getValidationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching validation stats:", error);
      res.status(500).json({ message: "Failed to fetch validation stats" });
    }
  });

  app.get("/api/ai/validation/recent", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const validations = await storage.getRecentValidations(parseInt(limit as string));
      res.json(validations);
    } catch (error) {
      console.error("Error fetching recent validations:", error);
      res.status(500).json({ message: "Failed to fetch recent validations" });
    }
  });

  app.post("/api/ai/validate", isAuthenticated, async (req, res) => {
    try {
      const { content, category, language, provider } = req.body;
      
      if (!content?.trim()) {
        return res.status(400).json({ message: "Template content is required" });
      }

      // Simulate AI validation (replace with actual AI API call)
      const issues = [];
      let approvalProbability = 85;

      // Basic validation checks
      if (content.length > 1024) {
        issues.push({
          severity: "high",
          message: "Template content exceeds recommended length",
          suggestion: "Reduce content to under 1024 characters for better approval chances"
        });
        approvalProbability -= 15;
      }

      if (!content.includes("{{")) {
        issues.push({
          severity: "medium", 
          message: "No personalization variables found",
          suggestion: "Add variables like {{1}} for user personalization"
        });
        approvalProbability -= 10;
      }

      const result = {
        id: Date.now().toString(),
        templateName: `template_${Date.now()}`,
        approvalProbability: Math.max(20, approvalProbability),
        status: approvalProbability >= 85 ? 'safe' : approvalProbability >= 70 ? 'warning' : 'danger',
        issues,
        autoFixSuggestions: issues.map(issue => ({
          type: "Content optimization",
          description: issue.suggestion,
          impact: `+${Math.floor(Math.random() * 15 + 5)}% approval chance`
        })),
        timestamp: new Date().toISOString()
      };

      // Store validation result
      await storage.createValidationResult(result);
      
      res.json(result);
    } catch (error) {
      console.error("Error validating template:", error);
      res.status(500).json({ message: "Failed to validate template" });
    }
  });

  app.post("/api/ai/auto-fix", isAuthenticated, async (req, res) => {
    try {
      const { content, category, language, provider, issues } = req.body;
      
      if (!content?.trim()) {
        return res.status(400).json({ message: "Template content is required" });
      }

      // Simulate auto-fix (replace with actual AI API call)
      let fixedContent = content;
      const appliedFixes = [];

      // Apply basic fixes
      if (content.length > 1024) {
        fixedContent = content.substring(0, 1000) + "...";
        appliedFixes.push({
          type: "Length optimization",
          description: "Shortened content to meet length requirements",
          impact: "+15% approval chance"
        });
      }

      if (!content.includes("{{")) {
        fixedContent = `Hi {{1}}, ${fixedContent}`;
        appliedFixes.push({
          type: "Personalization added",
          description: "Added greeting with user variable",
          impact: "+10% approval chance"
        });
      }

      res.json({
        fixedContent,
        appliedFixes,
        originalLength: content.length,
        newLength: fixedContent.length
      });
    } catch (error) {
      console.error("Error auto-fixing template:", error);
      res.status(500).json({ message: "Failed to auto-fix template" });
    }
  });

  // Team routes
  app.get("/api/team/users", async (req, res) => {
    try {
      const users = await storage.getActiveUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/team/activity", async (req, res) => {
    try {
      const { limit } = req.query;
      const activities = await storage.getTeamActivities(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activities);
    } catch (error) {
      console.error("Error fetching team activities:", error);
      res.status(500).json({ message: "Failed to fetch team activities" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // WhatsApp Account routes (New endpoints for frontend)\n  app.get(\"/api/whatsapp/accounts\", async (req, res) => {\n    try {\n      const accounts = await storage.getWhatsappAccounts();\n      res.json(accounts);\n    } catch (error) {\n      console.error(\"Error fetching WhatsApp accounts:\", error);\n      res.status(500).json({ message: \"Failed to fetch WhatsApp accounts\" });\n    }\n  });\n\n  app.post(\"/api/whatsapp/accounts\", isAuthenticated, async (req, res) => {\n    try {\n      const accountData = {\n        ...req.body,\n        isActive: true,\n        complianceScore: 98.5,\n        createdAt: new Date(),\n        updatedAt: new Date(),\n      };\n      \n      const account = await storage.createWhatsappAccount(accountData);\n      res.status(201).json(account);\n    } catch (error) {\n      console.error(\"Error creating WhatsApp account:\", error);\n      res.status(500).json({ message: \"Failed to create WhatsApp account\" });\n    }\n  });\n\n  // Legacy WhatsApp Account routes
  app.get("/api/whatsapp-accounts", async (req, res) => {
    try {
      const accounts = await storage.getWhatsappAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching WhatsApp accounts:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp accounts" });
    }
  });

  // Webhook logs for debugging
  app.get("/api/webhooks/logs", async (req, res) => {
    try {
      const { wabaId } = req.query;
      const logs = await storage.getWebhookLogs(wabaId as string);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
      res.status(500).json({ message: "Failed to fetch webhook logs" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupWebSocket(wss, storage);

  return httpServer;
}
