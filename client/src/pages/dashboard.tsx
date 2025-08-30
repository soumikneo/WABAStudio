import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import RecentTemplates from "@/components/dashboard/recent-templates";
import ValidatorPanel from "@/components/ai/validator-panel";
import ComplianceGuard from "@/components/compliance/compliance-guard";
import TeamActivity from "@/components/team/team-activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, BarChart3, Shield, Settings, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    enabled: isAuthenticated,
  });

  const { data: recentTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/templates", "recent", 5],
    enabled: isAuthenticated,
  });

  const { data: complianceEvents } = useQuery({
    queryKey: ["/api/compliance/events", "recent", 10],
    enabled: isAuthenticated,
  });

  const { data: whatsappAccounts } = useQuery({
    queryKey: ["/api/whatsapp/accounts"],
    enabled: isAuthenticated,
  });

  const hasConnectedWABA = whatsappAccounts && whatsappAccounts.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Dashboard"
          subtitle="Monitor your WhatsApp Business templates and compliance"
          actions={
            <div className="flex items-center space-x-4">
              {!hasConnectedWABA && (
                <Link href="/settings/whatsapp">
                  <Button variant="outline" size="sm" data-testid="button-connect-whatsapp">
                    <Settings className="w-4 h-4 mr-2" />
                    Connect WhatsApp
                  </Button>
                </Link>
              )}
              <Badge variant={metrics?.complianceScore >= 95 ? "default" : "destructive"} className="px-3 py-1">
                <span className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Compliant
                </span>
              </Badge>
              <Link href="/templates/new">
                <Button data-testid="button-new-template">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </Link>
            </div>
          }
        />

        <main className="p-8">
          <MetricsGrid metrics={metrics} isLoading={metricsLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <RecentTemplates 
                templates={recentTemplates} 
                isLoading={templatesLoading} 
              />
              
              <ValidatorPanel />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ComplianceGuard events={complianceEvents} />
              
              <TeamActivity />
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/templates/new">
                    <Button 
                      className="w-full justify-start" 
                      variant="default"
                      data-testid="button-new-template-quick"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Template
                    </Button>
                  </Link>
                  
                  <Link href="/templates">
                    <Button 
                      className="w-full justify-start" 
                      variant="secondary"
                      data-testid="button-view-templates"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Templates
                    </Button>
                  </Link>
                  
                  <Link href="/analytics">
                    <Button 
                      className="w-full justify-start" 
                      variant="secondary"
                      data-testid="button-view-analytics"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
