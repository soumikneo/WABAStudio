import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import LivePreview from "@/components/templates/live-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Save, Send, Zap, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { Template } from "@/types/template";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required").regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed"),
  category: z.enum(["UTILITY", "MARKETING", "AUTHENTICATION"]),
  language: z.string().default("en_US"),
  bodyText: z.string().min(1, "Body text is required"),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().url().optional().or(z.literal("")),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function TemplateEditor() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sendMessage } = useWebSocket();
  const templateId = params.id;
  const isEditing = templateId !== "new" && templateId !== undefined;
  
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { data: template, isLoading } = useQuery({
    queryKey: ["/api/templates", templateId],
    enabled: isEditing,
  });

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      category: "UTILITY",
      language: "en_US",
      bodyText: "",
      headerText: "",
      footerText: "",
      buttonText: "",
      buttonUrl: "",
    },
  });

  useEffect(() => {
    if (template && isEditing) {
      form.reset({
        name: template.name,
        category: template.category,
        language: template.language,
        bodyText: template.components?.body?.text || "",
        headerText: template.components?.header?.text || "",
        footerText: template.components?.footer?.text || "",
        buttonText: template.components?.buttons?.[0]?.text || "",
        buttonUrl: template.components?.buttons?.[0]?.url || "",
      });

      // Join template editing room for real-time collaboration (disabled in dev)
      if (template.id && process.env.NODE_ENV !== 'development') {
        sendMessage({
          type: 'join_room',
          data: { room: `template:${template.id}` }
        });
      }
    }
  }, [template, isEditing, form, sendMessage]);

  const saveMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const templateData = {
        name: data.name,
        category: data.category,
        language: data.language,
        wabaId: "default_waba", // This would come from user context
        createdBy: "default_user", // This would come from auth context
        components: {
          body: { text: data.bodyText },
          ...(data.headerText && { header: { text: data.headerText } }),
          ...(data.footerText && { footer: { text: data.footerText } }),
          ...(data.buttonText && {
            buttons: [{
              type: "URL",
              text: data.buttonText,
              url: data.buttonUrl || "https://example.com"
            }]
          })
        }
      };

      if (isEditing && templateId !== "new" && template?.id) {
        const response = await apiRequest("PUT", `/api/templates/${template.id}`, {
          ...templateData,
          updatedBy: "default_user"
        });
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/templates", templateData);
        return response.json();
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: isEditing ? "Template updated" : "Template created",
        description: `Template "${result.name}" has been ${isEditing ? "updated" : "created"} successfully.`,
      });
      
      if (!isEditing) {
        navigate(`/templates/${result.id}/edit`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      if (!template?.id || templateId === "new") throw new Error("Template must be saved before validation");
      const response = await apiRequest("POST", `/api/templates/${template.id}/validate`, {
        provider: 'openai'
      });
      return response.json();
    },
    onSuccess: (result) => {
      setValidationResult(result);
      toast({
        title: "Validation complete",
        description: `AI analysis: ${result.approvalProbability}% approval probability`,
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


  const autoFixMutation = useMutation({
    mutationFn: async () => {
      if (!template?.id || templateId === "new") throw new Error("Template must be saved before auto-fix");
      const response = await apiRequest("POST", `/api/templates/${template.id}/auto-fix`, {
        provider: 'openai',
        issues: validationResult?.issues || []
      });
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates", templateId] });
      toast({
        title: "Auto-fix applied",
        description: "AI has optimized your template for better approval chances.",
      });
      // Clear validation result to trigger re-validation
      setValidationResult(null);
    },
    onError: (error) => {
      toast({
        title: "Auto-fix failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: async () => {
      if (!template?.id) throw new Error("Template not saved yet");
      const response = await apiRequest("POST", "/api/whatsapp/submit-template", {
        templateId: template.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Submitted for approval",
        description: "Template has been submitted to WhatsApp for approval.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: TemplateFormData) => {
    saveMutation.mutate(data);
  };

  const handleValidate = () => {
    setIsValidating(true);
    validateMutation.mutate();
    setIsValidating(false);
  };

  const getValidationIcon = () => {
    if (!validationResult) return null;
    
    const probability = validationResult.approvalProbability;
    if (probability >= 90) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (probability >= 70) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getValidationColor = () => {
    if (!validationResult) return "bg-gray-50 text-gray-700";
    
    const probability = validationResult.approvalProbability;
    if (probability >= 90) return "bg-green-50 text-green-700";
    if (probability >= 70) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
  };

  if (isLoading && isEditing) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title={isEditing ? "Edit Template" : "Create Template"}
          subtitle={isEditing ? `Editing: ${template?.name}` : "Create a new WhatsApp Business template"}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate("/templates")} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {isEditing && templateId !== "new" && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleValidate}
                    disabled={isValidating || validateMutation.isPending}
                    data-testid="button-validate"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validate with AI
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => autoFixMutation.mutate()}
                    disabled={autoFixMutation.isPending}
                    data-testid="button-auto-fix"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Auto-Fix
                  </Button>
                </>
              )}
            </div>
          }
        />

        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Panel */}
            <div className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Template Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Template Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., order_confirmation" 
                                  {...field}
                                  data-testid="input-template-name"
                                />
                              </FormControl>
                              <FormDescription>
                                Use lowercase letters, numbers, and underscores only. Examples: order_confirmation, welcome_message, payment_reminder
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-template-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="UTILITY">Utility (Order updates, shipping notifications)</SelectItem>
                                  <SelectItem value="MARKETING">Marketing (Promotions, newsletters)</SelectItem>
                                  <SelectItem value="AUTHENTICATION">Authentication (OTP, login codes)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose the appropriate category for your template's purpose
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-template-language">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en_US">English (US)</SelectItem>
                                <SelectItem value="en_GB">English (UK)</SelectItem>
                                <SelectItem value="es_ES">Spanish</SelectItem>
                                <SelectItem value="fr_FR">French</SelectItem>
                                <SelectItem value="de_DE">German</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Template Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="headerText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Header (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Order Update, Welcome!"
                                {...field}
                                data-testid="input-header-text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bodyText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Body Text *</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={6}
                                placeholder="Hi {{1}}, your order #{{2}} has been confirmed!"
                                className="font-mono text-sm"
                                {...field}
                                data-testid="textarea-body-text"
                              />
                            </FormControl>
                            <FormDescription>
                              Use {`{{1}}, {{2}}, etc.`} for dynamic variables. Example: Hi {`{{1}}`}, your order #{`{{2}}`} has been confirmed!
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footerText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Footer (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Thanks for choosing us!, Reply STOP to opt out"
                                {...field}
                                data-testid="input-footer-text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Call-to-Action Button (Optional)</h4>
                        
                        <FormField
                          control={form.control}
                          name="buttonText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button Text</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Track Order"
                                  {...field}
                                  data-testid="input-button-text"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="buttonUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://yourdomain.com/track-order?id={{2}}"
                                  {...field}
                                  data-testid="input-button-url"
                                />
                              </FormControl>
                              <FormDescription>
                                Complete URL where the button will redirect. Can include variables like {`{{1}}, {{2}}`}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button 
                      type="submit" 
                      disabled={saveMutation.isPending}
                      data-testid="button-save-template"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveMutation.isPending ? "Saving..." : "Save Template"}
                    </Button>

                    {isEditing && template?.status === "draft" && (
                      <Button 
                        onClick={() => submitForApprovalMutation.mutate()}
                        disabled={submitForApprovalMutation.isPending}
                        data-testid="button-submit-approval"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit for Approval
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              <LivePreview 
                formData={form.watch()}
                validationResult={validationResult}
              />

              {/* Validation Results */}
              {validationResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getValidationIcon()}
                      <span>Validation Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className={`p-4 rounded-lg ${getValidationColor()}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Approval Probability</span>
                        <span className="text-2xl font-bold">
                          {validationResult.approvalProbability}%
                        </span>
                      </div>
                    </div>

                    {validationResult.issues?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Issues Found</h4>
                        {validationResult.issues.map((issue: any, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-muted rounded">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium">{issue.message}</p>
                              {issue.suggestion && (
                                <p className="text-muted-foreground">{issue.suggestion}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {validationResult.suggestions?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Suggestions</h4>
                        {validationResult.suggestions.map((suggestion: any, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                            <p className="text-sm text-blue-800">{suggestion.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
