import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ComplianceEvent } from "@/types/compliance";

interface ComplianceGuardProps {
  events?: ComplianceEvent[];
}

export default function ComplianceGuard({ events }: ComplianceGuardProps) {
  const { data: complianceAlerts } = useQuery({
    queryKey: ["/api/compliance/alerts"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'danger':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="text-xs bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  const activeAlerts = complianceAlerts?.filter((alert: ComplianceEvent) => !alert.resolvedAt) || [];
  const hasActiveAlerts = activeAlerts.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Compliance Guard</span>
          </div>
          <Badge 
            variant={hasActiveAlerts ? "destructive" : "secondary"}
            className={hasActiveAlerts ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
          >
            {hasActiveAlerts ? `${activeAlerts.length} Alert${activeAlerts.length > 1 ? 's' : ''}` : 'Protected'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Overview */}
        {!hasActiveAlerts ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-green-600">All Systems Protected</p>
            <p className="text-sm text-muted-foreground">No violations detected</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-lg font-semibold text-red-600">Active Alerts</p>
            <p className="text-sm text-muted-foreground">
              {activeAlerts.length} issue{activeAlerts.length > 1 ? 's' : ''} require attention
            </p>
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Recent Activity</h4>
          
          {events && events.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.slice(0, 10).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-start space-x-2 text-sm"
                  data-testid={`compliance-event-${event.id}`}
                >
                  {getStatusIcon(event.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        {event.message}
                      </span>
                      {getSeverityBadge(event.severity)}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                      <span>{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</span>
                      {event.templateId && (
                        <span>• Template: {event.templateId.slice(-8)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground text-red-600">Active Alerts</h4>
            
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  data-testid={`active-alert-${alert.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="font-medium text-red-800 text-sm">
                          {alert.message}
                        </span>
                      </div>
                      <div className="text-xs text-red-600 mt-1 ml-6">
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600" data-testid="uptime-percentage">
              99.8%
            </p>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600" data-testid="response-time">
              2.3s
            </p>
            <p className="text-xs text-muted-foreground">Response</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1" data-testid="button-view-all-events">
            View All Events
          </Button>
          <Button size="sm" variant="outline" className="flex-1" data-testid="button-settings">
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
