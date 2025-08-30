import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Wand2,
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  FileText,
  Settings
} from "lucide-react";

interface ValidationResult {
  id: string;
  templateName: string;
  approvalProbability: number;
  status: 'safe' | 'warning' | 'danger';
  issues: Array<{
    severity: string;
    message: string;
    suggestion: string;
  }>;
  autoFixSuggestions: Array<{
    type: string;
    description: string;
    impact: string;
  }>;
  timestamp: string;
}

interface ValidationStats {
  totalValidations: number;
  avgApprovalRate: number;
  timesSaved: number;
  costAvoided: number;
  autoFixesApplied: number;
}

export default function AIValidator() {
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'anthropic'>('openai');
  const [templateText, setTemplateText] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [language, setLanguage] = useState('en');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch validation statistics
  const { data: stats } = useQuery<ValidationStats>({
    queryKey: ['/api/ai/validation/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent validations
  const { data: recentValidations } = useQuery<ValidationResult[]>({
    queryKey: ['/api/ai/validation/recent'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Validate template mutation
  const validateMutation = useMutation({
    mutationFn: async () => {
      if (!templateText.trim()) throw new Error("Please enter template content");
      const response = await apiRequest("POST", "/api/ai/validate", {
        content: templateText,
        category: templateCategory,
        language,
        provider: selectedProvider
      });
      return response.json();
    },
    onSuccess: (result) => {
      setValidationResult(result);
      queryClient.invalidateQueries({ queryKey: ['/api/ai/validation/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/validation/recent'] });
      toast({
        title: "Validation complete",
        description: `${result.approvalProbability}% approval probability with ${result.issues.length} issues found`,
      });
    },
    onError: (error) => {
      toast({
        title: "Validation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-fix mutation
  const autoFixMutation = useMutation({
    mutationFn: async () => {
      if (!validationResult) throw new Error("No validation result to fix");
      const response = await apiRequest("POST", "/api/ai/auto-fix", {
        content: templateText,
        category: templateCategory,
        language,
        provider: selectedProvider,
        issues: validationResult.issues
      });
      return response.json();
    },
    onSuccess: (result) => {
      setTemplateText(result.fixedContent);
      setValidationResult(null); // Clear to trigger re-validation
      queryClient.invalidateQueries({ queryKey: ['/api/ai/validation/stats'] });
      toast({
        title: "Auto-fix applied",
        description: `Applied ${result.appliedFixes.length} fixes to improve approval chances`,
      });
    },
    onError: (error) => {
      toast({
        title: "Auto-fix failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'danger': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getApprovalColor = (probability: number) => {
    if (probability >= 85) return 'text-green-600';
    if (probability >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header title="AI Validator" />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Validator</h1>
                <p className="text-muted-foreground">
                  Validate templates before submission with AI-powered analysis and auto-fix
                </p>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                <Brain className="w-4 h-4 mr-1" />
                AI-Powered
              </Badge>
            </div>

            {/* Statistics Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Validations</p>
                        <p className="text-2xl font-bold">{stats.totalValidations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Approval Rate</p>
                        <p className="text-2xl font-bold text-green-600">{stats.avgApprovalRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                        <p className="text-2xl font-bold">{stats.timesSaved}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Cost Avoided</p>
                        <p className="text-2xl font-bold">${stats.costAvoided}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Wand2 className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Auto-Fixes</p>
                        <p className="text-2xl font-bold">{stats.autoFixesApplied}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Validator */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <span>Template Validator</span>
                    </CardTitle>
                    <CardDescription>
                      Analyze your template for compliance and approval probability
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* AI Provider Selection */}
                    <div className="space-y-2">
                      <Label>AI Provider</Label>
                      <Select value={selectedProvider} onValueChange={(value: 'openai' | 'anthropic') => setSelectedProvider(value)}>
                        <SelectTrigger data-testid="select-ai-provider">
                          <SelectValue placeholder="Choose AI provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI GPT-5</SelectItem>
                          <SelectItem value="anthropic">Claude Sonnet 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Template Input */}
                    <div className="space-y-2">
                      <Label>Template Content</Label>
                      <Textarea
                        placeholder="Enter your WhatsApp template content here..."
                        value={templateText}
                        onChange={(e) => setTemplateText(e.target.value)}
                        className="min-h-[120px]"
                        data-testid="textarea-template-content"
                      />
                    </div>

                    {/* Template Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={templateCategory} onValueChange={setTemplateCategory}>
                          <SelectTrigger data-testid="select-template-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MARKETING">Marketing</SelectItem>
                            <SelectItem value="UTILITY">Utility</SelectItem>
                            <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger data-testid="select-language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => validateMutation.mutate()}
                        disabled={validateMutation.isPending || !templateText.trim()}
                        className="flex-1"
                        data-testid="button-validate-template"
                      >
                        {validateMutation.isPending ? (
                          <>
                            <Brain className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            Validate Template
                          </>
                        )}
                      </Button>
                      {validationResult && (
                        <Button
                          onClick={() => autoFixMutation.mutate()}
                          disabled={autoFixMutation.isPending || validationResult.issues.length === 0}
                          variant="outline"
                          data-testid="button-auto-fix"
                        >
                          {autoFixMutation.isPending ? (
                            <>
                              <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                              Fixing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Auto-Fix
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Validation Results */}
                    {validationResult && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Validation Results</h3>
                          <Badge 
                            variant={validationResult.status === 'safe' ? 'default' : 'destructive'}
                            className={validationResult.status === 'safe' ? 'bg-green-100 text-green-800' : ''}
                            data-testid="badge-validation-status"
                          >
                            {getStatusIcon(validationResult.status)}
                            <span className="ml-1">{validationResult.status.toUpperCase()}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <div className={`text-3xl font-bold ${getApprovalColor(validationResult.approvalProbability)}`}>
                                  {validationResult.approvalProbability}%
                                </div>
                                <p className="text-sm text-muted-foreground">Approval Probability</p>
                                <Progress 
                                  value={validationResult.approvalProbability} 
                                  className="mt-2"
                                  data-testid="progress-approval-probability"
                                />
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Issues Found</span>
                                  <span className="font-bold" data-testid="text-issues-count">{validationResult.issues.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Auto-Fix Available</span>
                                  <span className="font-bold" data-testid="text-autofix-count">{validationResult.autoFixSuggestions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">AI Provider</span>
                                  <span className="font-bold capitalize">{selectedProvider}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Issues List */}
                        {validationResult.issues.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Issues Found</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {validationResult.issues.map((issue, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-medium text-red-800">{issue.message}</p>
                                    <p className="text-sm text-red-600 mt-1">{issue.suggestion}</p>
                                  </div>
                                  <Badge variant="destructive" className="text-xs">
                                    {issue.severity}
                                  </Badge>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        )}

                        {/* Auto-Fix Suggestions */}
                        {validationResult.autoFixSuggestions.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Auto-Fix Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {validationResult.autoFixSuggestions.map((suggestion, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-medium text-blue-800">{suggestion.type}</p>
                                    <p className="text-sm text-blue-600 mt-1">{suggestion.description}</p>
                                    <p className="text-xs text-blue-500 mt-1">Impact: {suggestion.impact}</p>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar with Recent Validations */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Validations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentValidations?.slice(0, 5).map((validation) => (
                      <div 
                        key={validation.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => setValidationResult(validation)}
                        data-testid={`validation-item-${validation.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(validation.status)}
                          <div>
                            <p className="font-medium text-sm">{validation.templateName}</p>
                            <p className="text-xs text-muted-foreground">{validation.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${getApprovalColor(validation.approvalProbability)}`}>
                            {validation.approvalProbability}%
                          </p>
                        </div>
                      </div>
                    ))}
                    {!recentValidations?.length && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent validations
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* AI Provider Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Provider Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">OpenAI GPT-5</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          94.2% avg
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Claude Sonnet 4</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          92.8% avg
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      <p>• OpenAI: Faster processing, creative fixes</p>
                      <p>• Claude: Conservative, compliance-focused</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}