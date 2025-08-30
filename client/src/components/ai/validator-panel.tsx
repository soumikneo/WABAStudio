import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";

export default function ValidatorPanel() {
  const [selectedValidation, setSelectedValidation] = useState<string | null>(null);

  // Mock data - in real app this would come from API
  const validationStats = {
    totalValidations: 247,
    timesSaved: 32,
    costAvoided: 2900,
    accuracyRate: 94
  };

  const recentValidations = [
    {
      id: '1',
      templateName: 'shipping_notification',
      probability: 98,
      status: 'safe',
      timestamp: '2 minutes ago'
    },
    {
      id: '2',
      templateName: 'promo_flash_sale',
      probability: 72,
      status: 'warning',
      timestamp: '15 minutes ago'
    },
    {
      id: '3',
      templateName: 'generic_offer',
      probability: 34,
      status: 'danger',
      timestamp: '1 hour ago'
    }
  ];

  const autoFixes = [
    {
      id: '1',
      type: 'Variable positioning',
      description: 'Added "Hi" before {{1}} variable',
      status: 'applied'
    },
    {
      id: '2',
      type: 'Category optimization',
      description: 'Changed from UTILITY to MARKETING',
      status: 'applied'
    },
    {
      id: '3',
      type: 'Variable sequence',
      description: 'Renumbered {{3}} to {{2}}',
      status: 'applied'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'danger':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>AI Validator & Auto-Fix</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            {validationStats.accuracyRate}% Accuracy
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary" data-testid="stat-validations">
              {validationStats.totalValidations}
            </div>
            <div className="text-xs text-muted-foreground">Issues Prevented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600" data-testid="stat-time-saved">
              {validationStats.timesSaved}hrs
            </div>
            <div className="text-xs text-muted-foreground">Time Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-cost-avoided">
              ${validationStats.costAvoided}
            </div>
            <div className="text-xs text-muted-foreground">Cost Avoided</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600" data-testid="stat-accuracy">
              {validationStats.accuracyRate}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
        </div>

        {/* Recent Validations */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Recent Validations</h4>
          
          <div className="space-y-3">
            {recentValidations.map((validation) => (
              <div 
                key={validation.id} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setSelectedValidation(validation.id)}
                data-testid={`validation-item-${validation.id}`}
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(validation.status)}
                  <div>
                    <div className="font-mono text-sm font-medium">
                      {validation.templateName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {validation.timestamp}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getStatusColor(validation.status)}`}>
                    {validation.probability}% approval
                  </div>
                  <div className="text-xs text-muted-foreground">
                    chance
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Fix Results */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Recent Auto-Fixes</h4>
          
          <div className="space-y-3">
            {autoFixes.map((fix) => (
              <div 
                key={fix.id} 
                className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                data-testid={`auto-fix-${fix.id}`}
              >
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-800 text-sm">
                      {fix.type}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {fix.description}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Applied
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button size="sm" data-testid="button-validate-all">
            <Zap className="w-4 h-4 mr-2" />
            Validate All Templates
          </Button>
          <Button variant="outline" size="sm" data-testid="button-view-reports">
            View Reports
          </Button>
        </div>

        {/* Performance Indicator */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI Performance</span>
            <span className="text-sm text-green-600">{validationStats.accuracyRate}%</span>
          </div>
          <Progress value={validationStats.accuracyRate} className="h-2" />
          <div className="text-xs text-muted-foreground mt-2">
            Based on {validationStats.totalValidations} validations this month
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
