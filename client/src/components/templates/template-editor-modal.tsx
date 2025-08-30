import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import LivePreview from "./live-preview";
import { Save, Send, X } from "lucide-react";
import type { Template, TemplateFormData } from "@/types/template";

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

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: Template;
  onSave: (data: TemplateFormData) => void;
  onSubmit?: (data: TemplateFormData) => void;
  isSaving?: boolean;
  isSubmitting?: boolean;
}

export default function TemplateEditorModal({
  isOpen,
  onClose,
  template,
  onSave,
  onSubmit,
  isSaving,
  isSubmitting
}: TemplateEditorModalProps) {
  const [validationResult, setValidationResult] = useState<any>(null);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name || "",
      category: template?.category || "UTILITY",
      language: template?.language || "en_US",
      bodyText: template?.components?.body?.text || "",
      headerText: template?.components?.header?.text || "",
      footerText: template?.components?.footer?.text || "",
      buttonText: template?.components?.buttons?.[0]?.text || "",
      buttonUrl: template?.components?.buttons?.[0]?.url || "",
    },
  });

  const handleSave = (data: TemplateFormData) => {
    onSave(data);
  };

  const handleSubmit = (data: TemplateFormData) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {template ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Editor Panel */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                {/* Template Details */}
                <div className="space-y-4">
                  <h3 className="font-medium">Template Details</h3>
                  
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
                            Use lowercase letters, numbers, and underscores only
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
                              <SelectItem value="UTILITY">Utility</SelectItem>
                              <SelectItem value="MARKETING">Marketing</SelectItem>
                              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                            </SelectContent>
                          </Select>
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
                </div>

                <Separator />

                {/* Template Content */}
                <div className="space-y-4">
                  <h3 className="font-medium">Template Content</h3>

                  <FormField
                    control={form.control}
                    name="headerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Header text"
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
                          Use {`{{1}}, {{2}}, etc.`} for dynamic variables
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
                            placeholder="Footer text"
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
                              placeholder="https://example.com/track"
                              {...field}
                              data-testid="input-button-url"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between pt-6 border-t border-border">
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    data-testid="button-save-template"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Template"}
                  </Button>

                  {template?.status === "draft" && onSubmit && (
                    <Button 
                      type="button"
                      onClick={form.handleSubmit(handleSubmit)}
                      disabled={isSubmitting}
                      data-testid="button-submit-approval"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit for Approval"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Preview Panel */}
          <div className="w-80 p-6 bg-muted/30 overflow-y-auto">
            <LivePreview 
              formData={form.watch()}
              validationResult={validationResult}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
