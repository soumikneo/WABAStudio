import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  CheckCircle, 
  Zap, 
  Shield,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface DashboardMetrics {
  totalTemplates: number;
  approvalRate: number;
  activeTemplates: number;
  complianceScore: number;
}

interface MetricsGridProps {
  metrics?: DashboardMetrics;
  isLoading: boolean;
}

export default function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="flex items-center mt-4">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-20 ml-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Templates",
      value: metrics.totalTemplates,
      change: "+12%",
      changeType: "positive" as const,
      icon: FileText,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Approval Rate",
      value: `${metrics.approvalRate}%`,
      change: "+8%",
      changeType: "positive" as const,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Active Templates",
      value: metrics.activeTemplates,
      change: `${Math.round((metrics.activeTemplates / metrics.totalTemplates) * 100)}%`,
      changeType: "neutral" as const,
      icon: Zap,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Compliance Score",
      value: metrics.complianceScore.toFixed(1),
      change: "Excellent",
      changeType: "positive" as const,
      icon: Shield,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.changeType === 'positive' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground" data-testid={`metric-${index}`}>
                    {metric.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span 
                  className={`text-sm font-medium ${
                    metric.changeType === 'positive' 
                      ? 'text-green-600' 
                      : metric.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                >
                  {metric.changeType !== 'neutral' && (
                    <TrendIcon className="w-3 h-3 inline mr-1" />
                  )}
                  {metric.change}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  {metric.changeType === 'neutral' ? 'of total' : 'from last month'}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
