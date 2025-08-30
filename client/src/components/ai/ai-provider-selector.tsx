import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, GitCompare, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIProvider = 'openai' | 'anthropic';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  showComparison?: boolean;
  comparisonData?: {
    openai: { approvalProbability: number; confidence?: number; };
    anthropic: { approvalProbability: number; complianceScore?: number; };
    recommendation: AIProvider;
  };
}

export function AIProviderSelector({ 
  selectedProvider, 
  onProviderChange, 
  showComparison = false,
  comparisonData 
}: AIProviderSelectorProps) {
  const [activeTab, setActiveTab] = useState('selector');

  const providerInfo = {
    openai: {
      name: 'OpenAI GPT-5',
      description: 'Latest GPT model with enhanced reasoning and template analysis',
      strengths: ['Fast processing', 'Detailed suggestions', 'Template generation'],
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    anthropic: {
      name: 'Claude Sonnet 4',
      description: 'Advanced AI with strong compliance analysis and safety features',
      strengths: ['Compliance expertise', 'Safety analysis', 'Conservative recommendations'],
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  };

  return (
    <Card data-testid="ai-provider-selector">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Provider Selection
        </CardTitle>
        <CardDescription>
          Choose your preferred AI model for template validation and optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="selector" data-testid="tab-selector">Select Provider</TabsTrigger>
            <TabsTrigger 
              value="comparison" 
              disabled={!showComparison}
              data-testid="tab-comparison"
            >
              Compare Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="selector" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(providerInfo) as AIProvider[]).map((provider) => {
                const info = providerInfo[provider];
                const isSelected = selectedProvider === provider;
                
                return (
                  <Card
                    key={provider}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-gray-50"
                    )}
                    onClick={() => onProviderChange(provider)}
                    data-testid={`provider-card-${provider}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {info.icon}
                          <CardTitle className="text-lg">{info.name}</CardTitle>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" data-testid="selected-indicator" />
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {info.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Key Strengths:</div>
                        <div className="flex flex-wrap gap-1">
                          {info.strengths.map((strength, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className={cn("text-xs", info.color)}
                              data-testid={`strength-${provider}-${index}`}
                            >
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="h-4 w-4" />
              <span>You can switch providers anytime or compare results from both models</span>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            {comparisonData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card data-testid="comparison-openai">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        <CardTitle className="text-lg">OpenAI Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Approval Probability:</span>
                          <Badge 
                            variant={comparisonData.openai.approvalProbability >= 80 ? "default" : "destructive"}
                            data-testid="openai-approval-probability"
                          >
                            {comparisonData.openai.approvalProbability}%
                          </Badge>
                        </div>
                        {comparisonData.openai.confidence && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Confidence:</span>
                            <Badge variant="outline" data-testid="openai-confidence">
                              {Math.round(comparisonData.openai.confidence * 100)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="comparison-anthropic">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <CardTitle className="text-lg">Anthropic Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Approval Probability:</span>
                          <Badge 
                            variant={comparisonData.anthropic.approvalProbability >= 80 ? "default" : "destructive"}
                            data-testid="anthropic-approval-probability"
                          >
                            {comparisonData.anthropic.approvalProbability}%
                          </Badge>
                        </div>
                        {comparisonData.anthropic.complianceScore && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Compliance Score:</span>
                            <Badge variant="outline" data-testid="anthropic-compliance-score">
                              {comparisonData.anthropic.complianceScore}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card data-testid="comparison-recommendation">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <GitCompare className="h-5 w-5" />
                      AI Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {providerInfo[comparisonData.recommendation].icon}
                      <div>
                        <div className="font-medium">
                          Recommended: {providerInfo[comparisonData.recommendation].name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Based on approval probability and model confidence levels
                        </div>
                      </div>
                      {comparisonData.recommendation !== selectedProvider && (
                        <Button 
                          size="sm" 
                          onClick={() => onProviderChange(comparisonData.recommendation)}
                          data-testid="btn-use-recommendation"
                        >
                          Use This Provider
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    <GitCompare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div>Run comparison to see results from both providers</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}