import OpenAI from "openai";
import type { Template } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface ValidationResult {
  approvalProbability: number;
  confidence: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    suggestion?: string;
  }>;
  suggestions: Array<{
    type: string;
    message: string;
    implementation?: string;
  }>;
  autoFixesApplied: Array<{
    type: string;
    before: string;
    after: string;
    reason: string;
  }>;
  processingTime: number;
}

interface AutoFixResult {
  components: any;
  fixesApplied: Array<{
    type: string;
    before: string;
    after: string;
    reason: string;
  }>;
}

export class OpenAIService {
  // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
  private readonly model = "gpt-5";

  async validateTemplate(template: Template): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const prompt = `You are a WhatsApp Business API expert with deep knowledge of Meta's template approval guidelines. 
      
Analyze this template for approval probability and compliance issues:

Template Details:
- Name: ${template.name}
- Category: ${template.category}
- Language: ${template.language}
- Components: ${JSON.stringify(template.components, null, 2)}

Please analyze for:
1. Approval probability (0-100%)
2. Policy compliance issues
3. Format validation
4. Category appropriateness
5. Variable usage
6. Content quality

Return a detailed analysis in JSON format with:
- approvalProbability: number (0-100)
- confidence: number (0-1)
- issues: array of issues with type, severity, message, suggestion
- suggestions: array of improvement suggestions
- predictedOutcome: string describing likely approval result

Focus on real WhatsApp Business API guidelines from 2024.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert WhatsApp Business API compliance analyzer. Respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(response.choices[0].message.content!);
      const processingTime = Date.now() - startTime;

      return {
        approvalProbability: Math.max(0, Math.min(100, result.approvalProbability || 0)),
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        issues: result.issues || [],
        suggestions: result.suggestions || [],
        autoFixesApplied: [], // No auto-fixes in validation
        processingTime
      };

    } catch (error) {
      console.error("OpenAI validation error:", error);
      
      // Fallback validation using rules-based approach
      return this.fallbackValidation(template, Date.now() - startTime);
    }
  }

  async autoFixTemplate(template: Template): Promise<AutoFixResult> {
    try {
      const prompt = `You are a WhatsApp Business API template optimization expert. 

Fix this template to maximize approval probability while maintaining functionality:

Template:
- Name: ${template.name}
- Category: ${template.category}
- Components: ${JSON.stringify(template.components, null, 2)}

Common fixes needed:
1. Variable positioning (must start with text before variables)
2. Proper variable numbering (sequential: {{1}}, {{2}}, {{3}})
3. Category optimization based on content
4. Format compliance (character limits, structure)
5. Content improvements for better approval rates

Return JSON with:
- fixedComponents: the corrected components object
- fixesApplied: array of fixes with before/after/reason

Ensure the fixed template maintains original intent while being compliant.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert at fixing WhatsApp Business templates. Return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content!);

      return {
        components: result.fixedComponents || template.components,
        fixesApplied: result.fixesApplied || []
      };

    } catch (error) {
      console.error("OpenAI auto-fix error:", error);
      
      // Fallback auto-fix using rules-based approach
      return this.fallbackAutoFix(template);
    }
  }

  async generateTemplateContent(requirements: {
    purpose: string;
    category: string;
    variables?: string[];
    tone?: string;
    industry?: string;
  }): Promise<{
    name: string;
    components: any;
    category: string;
  }> {
    try {
      const prompt = `Create a WhatsApp Business template with these requirements:

Purpose: ${requirements.purpose}
Category: ${requirements.category}
Variables needed: ${requirements.variables?.join(', ') || 'none'}
Tone: ${requirements.tone || 'professional'}
Industry: ${requirements.industry || 'general'}

Generate a compliant template with:
1. Appropriate template name (lowercase, underscores only)
2. Correct category for the purpose
3. Well-structured components (header, body, footer, buttons if needed)
4. Proper variable usage
5. High approval probability content

Return JSON with name, components, and category.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert WhatsApp Business template creator. Create compliant, high-quality templates. Return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content!);

      return {
        name: result.name || 'generated_template',
        components: result.components || {},
        category: result.category || requirements.category
      };

    } catch (error) {
      console.error("OpenAI template generation error:", error);
      throw new Error("Failed to generate template content");
    }
  }

  private fallbackValidation(template: Template, processingTime: number): ValidationResult {
    const issues = [];
    let approvalProbability = 100;

    // Basic validation rules
    if (!template.name || template.name.length === 0) {
      issues.push({
        type: 'name_required',
        severity: 'critical' as const,
        message: 'Template name is required',
        suggestion: 'Add a descriptive name using lowercase letters and underscores'
      });
      approvalProbability -= 50;
    }

    if (template.name.includes(' ') || /[A-Z]/.test(template.name)) {
      issues.push({
        type: 'name_format',
        severity: 'high' as const,
        message: 'Template name must be lowercase with underscores only',
        suggestion: 'Use format like "order_confirmation" or "welcome_message"'
      });
      approvalProbability -= 30;
    }

    // Check body component
    const bodyComponent = template.components?.body;
    if (!bodyComponent?.text) {
      issues.push({
        type: 'body_required',
        severity: 'critical' as const,
        message: 'Template body text is required',
        suggestion: 'Add meaningful body content for your template'
      });
      approvalProbability -= 40;
    }

    return {
      approvalProbability: Math.max(0, approvalProbability),
      confidence: 0.7,
      issues,
      suggestions: [
        {
          type: 'general',
          message: 'Consider adding personalization with variables',
          implementation: 'Use {{1}}, {{2}} for dynamic content'
        }
      ],
      autoFixesApplied: [],
      processingTime
    };
  }

  private fallbackAutoFix(template: Template): AutoFixResult {
    const fixesApplied = [];
    let components = { ...template.components };

    // Fix template name
    if (template.name.includes(' ') || /[A-Z]/.test(template.name)) {
      const originalName = template.name;
      const fixedName = template.name.toLowerCase().replace(/\s+/g, '_');
      fixesApplied.push({
        type: 'name_format',
        before: originalName,
        after: fixedName,
        reason: 'Template names must be lowercase with underscores only'
      });
    }

    // Fix variable positioning in body
    if (components.body?.text) {
      const originalText = components.body.text;
      let fixedText = originalText;

      // Ensure text before first variable
      if (fixedText.startsWith('{{')) {
        fixedText = `Hi ${fixedText}`;
        fixesApplied.push({
          type: 'variable_positioning',
          before: originalText,
          after: fixedText,
          reason: 'Variables cannot be at the start of the message'
        });
      }

      components.body.text = fixedText;
    }

    return {
      components,
      fixesApplied
    };
  }
}

export const openaiService = new OpenAIService();
