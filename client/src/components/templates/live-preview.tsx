import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, Smartphone } from "lucide-react";
import type { TemplateFormData } from "@/types/template";

interface LivePreviewProps {
  formData: TemplateFormData;
  validationResult?: {
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
    }>;
  };
}

export default function LivePreview({ formData, validationResult }: LivePreviewProps) {
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

  const renderPreviewText = (text: string) => {
    // Replace variables with sample data
    return text
      .replace(/\{\{1\}\}/g, "John")
      .replace(/\{\{2\}\}/g, "#12345")
      .replace(/\{\{3\}\}/g, "Dec 18, 2024")
      .replace(/\{\{4\}\}/g, "$99.99");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5" />
          <span>Live Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phone Mockup */}
        <div className="bg-background border border-border rounded-2xl p-4 shadow-sm max-w-sm mx-auto">
          <div className="bg-muted/30 rounded-lg p-1 mb-2">
            <div className="text-xs text-muted-foreground text-center">WhatsApp Business</div>
          </div>
          
          <div className="space-y-2">
            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg max-w-[280px]">
              {/* Header */}
              {formData.headerText && (
                <div className="font-semibold text-sm mb-2 text-foreground">
                  {renderPreviewText(formData.headerText)}
                </div>
              )}
              
              {/* Body */}
              {formData.bodyText && (
                <div className="text-sm text-foreground leading-relaxed">
                  {renderPreviewText(formData.bodyText)}
                </div>
              )}
              
              {/* Footer */}
              {formData.footerText && (
                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-green-500/20">
                  {renderPreviewText(formData.footerText)}
                </div>
              )}
              
              {/* Button */}
              {formData.buttonText && (
                <div className="mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-xs border-green-600 text-green-600 hover:bg-green-50"
                  >
                    {formData.buttonText}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              Delivered • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Template Details</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <div className="font-mono text-foreground mt-1">
                {formData.name || "untitled_template"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <div className="mt-1">
                <Badge variant="outline" className="text-xs">
                  {formData.category}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Language:</span>
              <div className="font-mono text-foreground mt-1">
                {formData.language}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Components:</span>
              <div className="mt-1 space-x-1">
                {formData.headerText && <Badge variant="secondary" className="text-xs">Header</Badge>}
                <Badge variant="secondary" className="text-xs">Body</Badge>
                {formData.footerText && <Badge variant="secondary" className="text-xs">Footer</Badge>}
                {formData.buttonText && <Badge variant="secondary" className="text-xs">Button</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Validation Results</span>
              {getValidationIcon()}
            </div>
            
            <div className={`p-4 rounded-lg ${getValidationColor()}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Approval Probability</span>
                <span className="text-2xl font-bold">
                  {Math.round(validationResult.approvalProbability)}%
                </span>
              </div>
            </div>

            {validationResult.issues && validationResult.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Issues Found</h4>
                <div className="space-y-2">
                  {validationResult.issues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-muted rounded text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-muted-foreground text-xs mt-1">{issue.suggestion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Suggestions</h4>
                <div className="space-y-2">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-800">{suggestion.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Character Count */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Body: {formData.bodyText.length}/1024 characters</div>
            {formData.headerText && (
              <div>Header: {formData.headerText.length}/60 characters</div>
            )}
            {formData.footerText && (
              <div>Footer: {formData.footerText.length}/60 characters</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
