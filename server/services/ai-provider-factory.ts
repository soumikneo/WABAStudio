import { openaiService } from './openai';
import { validateWhatsAppTemplate as anthropicValidate, autoFixTemplate as anthropicAutoFix } from './anthropic';
import type { Template } from '@shared/schema';

export type AIProvider = 'openai' | 'anthropic';

export interface ValidationResult {
  approvalProbability: number;
  confidence?: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    field?: string;
    suggestion?: string;
  }>;
  suggestions: Array<{
    type?: string;
    message: string;
    implementation?: string;
  }>;
  complianceScore?: number;
  autoFixesApplied?: Array<{
    type: string;
    before: string;
    after: string;
    reason: string;
  }>;
  processingTime?: number;
  provider: AIProvider;
}

export interface AutoFixResult {
  success: boolean;
  components?: any;
  fixedTemplate?: any;
  fixesApplied?: Array<{
    type?: string;
    field?: string;
    before: string;
    after: string;
    reason: string;
  }>;
  changesApplied?: Array<{
    field: string;
    original: string;
    fixed: string;
    reason: string;
  }>;
  improvementScore?: number;
  provider: AIProvider;
}

export class AIProviderFactory {
  async validateTemplate(template: Template, provider: AIProvider = 'openai'): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      if (provider === 'anthropic') {
        const result = await anthropicValidate(template);
        return {
          ...result,
          provider: 'anthropic',
          processingTime: Date.now() - startTime,
          confidence: result.complianceScore ? result.complianceScore / 100 : undefined,
          suggestions: result.suggestions.map(s => ({ message: s }))
        };
      } else {
        const result = await openaiService.validateTemplate(template);
        return {
          ...result,
          provider: 'openai'
        };
      }
    } catch (error) {
      console.error(`${provider} validation failed:`, error);
      
      // Fallback to the other provider
      if (provider === 'anthropic') {
        console.log('Falling back to OpenAI...');
        const result = await openaiService.validateTemplate(template);
        return { ...result, provider: 'openai' };
      } else {
        console.log('Falling back to Anthropic...');
        const result = await anthropicValidate(template);
        return {
          ...result,
          provider: 'anthropic',
          processingTime: Date.now() - startTime,
          confidence: result.complianceScore ? result.complianceScore / 100 : undefined,
          suggestions: result.suggestions.map(s => ({ message: s }))
        };
      }
    }
  }

  async autoFixTemplate(template: Template, issues: any[] = [], provider: AIProvider = 'openai'): Promise<AutoFixResult> {
    try {
      if (provider === 'anthropic') {
        const result = await anthropicAutoFix(template, issues);
        return {
          ...result,
          provider: 'anthropic',
          fixesApplied: result.changesApplied?.map(change => ({
            field: change.field,
            before: change.original,
            after: change.fixed,
            reason: change.reason
          }))
        };
      } else {
        const result = await openaiService.autoFixTemplate(template);
        return {
          success: true,
          components: result.components,
          fixesApplied: result.fixesApplied,
          provider: 'openai'
        };
      }
    } catch (error) {
      console.error(`${provider} auto-fix failed:`, error);
      
      // Fallback to the other provider
      if (provider === 'anthropic') {
        console.log('Falling back to OpenAI for auto-fix...');
        const result = await openaiService.autoFixTemplate(template);
        return {
          success: true,
          components: result.components,
          fixesApplied: result.fixesApplied,
          provider: 'openai'
        };
      } else {
        console.log('Falling back to Anthropic for auto-fix...');
        const result = await anthropicAutoFix(template, issues);
        return {
          ...result,
          provider: 'anthropic',
          fixesApplied: result.changesApplied?.map(change => ({
            field: change.field,
            before: change.original,
            after: change.fixed,
            reason: change.reason
          }))
        };
      }
    }
  }

  async generateTemplate(requirements: {
    purpose: string;
    category: string;
    variables?: string[];
    tone?: string;
    industry?: string;
  }, provider: AIProvider = 'openai'): Promise<{
    name: string;
    components: any;
    category: string;
    provider: AIProvider;
  }> {
    try {
      // Currently only OpenAI supports template generation
      // Can extend Anthropic support later if needed
      const result = await openaiService.generateTemplateContent(requirements);
      return {
        ...result,
        provider: 'openai'
      };
    } catch (error) {
      console.error(`Template generation failed:`, error);
      throw new Error("Failed to generate template content");
    }
  }

  async compareProviders(template: Template): Promise<{
    openai: ValidationResult;
    anthropic: ValidationResult;
    consensus: {
      averageApprovalProbability: number;
      commonIssues: Array<{ message: string; severity: string; }>;
      discrepancies: Array<{ issue: string; openaiView: string; anthropicView: string; }>;
      recommendation: AIProvider;
    };
  }> {
    try {
      const [openaiResult, anthropicResult] = await Promise.all([
        this.validateTemplate(template, 'openai'),
        this.validateTemplate(template, 'anthropic')
      ]);

      const averageApprovalProbability = Math.round((openaiResult.approvalProbability + anthropicResult.approvalProbability) / 2);
      
      // Find common issues
      const commonIssues = openaiResult.issues.filter(openaiIssue =>
        anthropicResult.issues.some(anthropicIssue => 
          anthropicIssue.message.toLowerCase().includes(openaiIssue.message.toLowerCase()) ||
          openaiIssue.message.toLowerCase().includes(anthropicIssue.message.toLowerCase())
        )
      );

      // Recommend provider based on confidence and agreement
      const recommendation: AIProvider = Math.abs(openaiResult.approvalProbability - anthropicResult.approvalProbability) < 10
        ? (openaiResult.confidence && openaiResult.confidence > 0.8 ? 'openai' : 'anthropic')
        : (openaiResult.approvalProbability > anthropicResult.approvalProbability ? 'openai' : 'anthropic');

      return {
        openai: openaiResult,
        anthropic: anthropicResult,
        consensus: {
          averageApprovalProbability,
          commonIssues: commonIssues.map(issue => ({
            message: issue.message,
            severity: issue.severity
          })),
          discrepancies: [], // Could be enhanced to find specific discrepancies
          recommendation
        }
      };
    } catch (error) {
      console.error('Provider comparison failed:', error);
      throw new Error('Failed to compare AI providers');
    }
  }
}

export const aiProviderFactory = new AIProviderFactory();