import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Clock,
  Filter,
  RefreshCw,
  Download,
  Settings,
  Zap,
  TrendingUp,
  Search
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { ComplianceEvent } from "@/types/compliance";

export default function Compliance() {
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complianceEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/compliance/events"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: activeAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/compliance/alerts"],
    refetchInterval: 10000, // Refresh every 10 seconds for active alerts
  });

  const { data: webhookLogs } = useQuery({
    queryKey: ["/api/webhooks/logs"],
    refetchInterval: 30000,
  });

  const resolveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("PUT", `/api/compliance/events/${eventId}`, {
        resolvedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/alerts"] });
      toast({
        title: "Event resolved",
        description: "Compliance event has been marked as resolved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to resolve event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'danger':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string, resolved: boolean) => {
    if (resolved) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">Resolved</Badge>;
    }
    
    switch (status) {
      case 'safe':
        return <Badge variant="default" className="bg-green-100 text-green-800">Safe</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'danger':
        return <Badge variant="destructive">Danger</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredEvents = complianceEvents?.filter((event: ComplianceEvent) => {
    const matchesSeverity = filterSeverity === "all" || event.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && !event.resolvedAt) ||
      (filterStatus === "resolved" && event.resolvedAt) ||
      event.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      event.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesSearch;
  }) || [];

  const complianceStats = {
    totalEvents: complianceEvents?.length || 0,
    activeAlerts: activeAlerts?.length || 0,
    resolvedToday: complianceEvents?.filter((e: ComplianceEvent) => 
      e.resolvedAt && 
      new Date(e.resolvedAt).toDateString() === new Date().toDateString()
    ).length || 0,
    complianceScore: 98.5
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Compliance Guard"
          subtitle="Real-time WhatsApp Business API compliance monitoring and violation prevention"
          actions={
            <div className="flex items-center space-x-4">
              <div className="compliance-safe px-3 py-1 rounded-full text-sm font-medium border">
                <span className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Protected Status
                </span>
              </div>
              <Button variant="outline" data-testid="button-download-report">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" data-testid="button-settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          }
        />

        <main className="p-8">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-total-events">
                      {complianceStats.totalEvents}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <TrendingUp className="w-3 h-3 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">24h tracking</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-active-alerts">
                      {complianceStats.activeAlerts}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${complianceStats.activeAlerts > 0 ? 'bg-red-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                    {complianceStats.activeAlerts > 0 ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className={`text-sm font-medium ${complianceStats.activeAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {complianceStats.activeAlerts > 0 ? 'Requires attention' : 'All clear'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-resolved-today">
                      {complianceStats.resolvedToday}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-sm text-green-600 font-medium">Response efficiency</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-compliance-score">
                      {complianceStats.complianceScore}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-sm text-green-600 font-medium">Excellent rating</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Compliance Events</TabsTrigger>
              <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
              <TabsTrigger value="webhooks">Webhook Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-events"
                  />
                </div>
                
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-severity-filter">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="safe">Safe</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="danger">Danger</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/compliance"] })} data-testid="button-refresh">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {/* Events List */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Events</CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || filterSeverity !== "all" || filterStatus !== "all"
                          ? "Try adjusting your filters"
                          : "Your compliance monitoring is active and no events have been recorded"
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents.map((event: ComplianceEvent) => (
                        <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(event.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-foreground">{event.eventType.replace(/_/g, ' ')}</h4>
                                {getSeverityBadge(event.severity)}
                                {getStatusBadge(event.status, !!event.resolvedAt)}
                              </div>
                              {!event.resolvedAt && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" data-testid={`button-resolve-${event.id}`}>
                                      Resolve
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Resolve Compliance Event</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to mark this compliance event as resolved? 
                                        This action will remove it from active alerts.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => resolveEventMutation.mutate(event.id)}>
                                        Resolve Event
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                            <p className="text-sm text-foreground mb-2">{event.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                              </span>
                              {event.templateId && (
                                <span>Template: {event.templateId.slice(-8)}</span>
                              )}
                              {event.resolvedAt && (
                                <span className="text-green-600">
                                  Resolved {formatDistanceToNow(new Date(event.resolvedAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Active Compliance Alerts</span>
                    <Badge variant="destructive">{activeAlerts?.length || 0}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 border border-red-200 rounded-lg animate-pulse">
                          <div className="h-4 bg-muted rounded mb-2" />
                          <div className="h-3 bg-muted rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : !activeAlerts || activeAlerts.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Active Alerts</h3>
                      <p className="text-muted-foreground">
                        All compliance events have been resolved. Your system is protected.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeAlerts.map((alert: ComplianceEvent) => (
                        <div key={alert.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                              <h4 className="font-medium text-red-800">{alert.eventType.replace(/_/g, ' ')}</h4>
                              {getSeverityBadge(alert.severity)}
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                  Resolve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Resolve Alert</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Mark this compliance alert as resolved? This will remove it from active monitoring.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => resolveEventMutation.mutate(alert.id)}>
                                    Resolve Alert
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <p className="text-sm text-red-700 mb-2">{alert.message}</p>
                          <div className="text-xs text-red-600">
                            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>Webhook Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {webhookLogs && webhookLogs.length > 0 ? (
                    <div className="space-y-4">
                      {webhookLogs.slice(0, 20).map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${log.processed ? 'bg-green-400' : log.processingError ? 'bg-red-400' : 'bg-yellow-400'}`} />
                            <div>
                              <div className="font-medium text-sm">{log.webhookType}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {log.responseTime && (
                              <div className="text-xs text-muted-foreground">
                                {log.responseTime}ms
                              </div>
                            )}
                            <Badge variant={log.processed ? "default" : log.processingError ? "destructive" : "secondary"}>
                              {log.processed ? "Processed" : log.processingError ? "Error" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Webhook Activity</h3>
                      <p className="text-muted-foreground">
                        Webhook logs will appear here when WhatsApp sends notifications.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
