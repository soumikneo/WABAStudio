import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  MessageSquare,
  Eye,
  Reply,
  Send,
  Download,
  Filter,
  Calendar
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedTemplate, setSelectedTemplate] = useState("all");
  const [metricType, setMetricType] = useState("delivery");

  const { data: dashboardMetrics } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Mock analytics data - in production this would come from the API
  const performanceData = [
    { date: '2024-01-01', sent: 1200, delivered: 1150, read: 980, replied: 245 },
    { date: '2024-01-02', sent: 1350, delivered: 1290, read: 1100, replied: 290 },
    { date: '2024-01-03', sent: 1100, delivered: 1045, read: 890, replied: 210 },
    { date: '2024-01-04', sent: 1450, delivered: 1380, read: 1200, replied: 320 },
    { date: '2024-01-05', sent: 1300, delivered: 1235, read: 1050, replied: 275 },
    { date: '2024-01-06', sent: 1600, delivered: 1520, read: 1320, replied: 380 },
    { date: '2024-01-07', sent: 1250, delivered: 1190, read: 1000, replied: 260 },
  ];

  const templatePerformance = [
    { name: 'order_confirmation', sent: 2847, delivered: 97, read: 94, replied: 23, category: 'UTILITY' },
    { name: 'shipping_update', sent: 1923, delivered: 96, read: 89, replied: 12, category: 'UTILITY' },
    { name: 'payment_reminder', sent: 756, delivered: 94, read: 76, replied: 31, category: 'MARKETING' },
    { name: 'welcome_message', sent: 1234, delivered: 98, read: 91, replied: 18, category: 'UTILITY' },
    { name: 'cart_abandonment', sent: 889, delivered: 92, read: 78, replied: 25, category: 'MARKETING' },
  ];

  const categoryData = [
    { name: 'UTILITY', value: 68, color: '#3b82f6' },
    { name: 'MARKETING', value: 28, color: '#8b5cf6' },
    { name: 'AUTHENTICATION', value: 4, color: '#10b981' },
  ];

  const timeData = [
    { hour: '06:00', deliveryRate: 85, readRate: 72 },
    { hour: '09:00', deliveryRate: 94, readRate: 89 },
    { hour: '12:00', deliveryRate: 96, readRate: 91 },
    { hour: '15:00', deliveryRate: 98, readRate: 94 },
    { hour: '18:00', deliveryRate: 92, readRate: 88 },
    { hour: '21:00', deliveryRate: 89, readRate: 83 },
    { hour: '00:00', deliveryRate: 78, readRate: 65 },
  ];

  const getMetricColor = (value: number, type: string) => {
    const thresholds = {
      delivery: { excellent: 95, good: 90, poor: 80 },
      read: { excellent: 85, good: 75, poor: 60 },
      reply: { excellent: 30, good: 20, poor: 10 }
    };
    
    const threshold = thresholds[type as keyof typeof thresholds] || thresholds.delivery;
    
    if (value >= threshold.excellent) return "text-green-600";
    if (value >= threshold.good) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4" />;
  };

  const currentPeriodStats = {
    totalSent: 45623,
    deliveryRate: 95.2,
    readRate: 87.4,
    replyRate: 24.8,
    previousDeliveryRate: 94.1,
    previousReadRate: 85.2,
    previousReplyRate: 23.1
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Analytics Dashboard"
          subtitle="Template performance insights and messaging analytics"
          actions={
            <div className="flex items-center space-x-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32" data-testid="select-date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" data-testid="button-export-data">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          }
        />

        <main className="p-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-total-sent">
                      {currentPeriodStats.totalSent.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+12% vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-delivery-rate">
                      {currentPeriodStats.deliveryRate}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {getPerformanceIcon(currentPeriodStats.deliveryRate, currentPeriodStats.previousDeliveryRate)}
                  <span className={`text-sm font-medium ml-1 ${getMetricColor(currentPeriodStats.deliveryRate, 'delivery')}`}>
                    {currentPeriodStats.deliveryRate > currentPeriodStats.previousDeliveryRate ? '+' : ''}
                    {(currentPeriodStats.deliveryRate - currentPeriodStats.previousDeliveryRate).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Read Rate</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-read-rate">
                      {currentPeriodStats.readRate}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {getPerformanceIcon(currentPeriodStats.readRate, currentPeriodStats.previousReadRate)}
                  <span className={`text-sm font-medium ml-1 ${getMetricColor(currentPeriodStats.readRate, 'read')}`}>
                    {currentPeriodStats.readRate > currentPeriodStats.previousReadRate ? '+' : ''}
                    {(currentPeriodStats.readRate - currentPeriodStats.previousReadRate).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reply Rate</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-reply-rate">
                      {currentPeriodStats.replyRate}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Reply className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {getPerformanceIcon(currentPeriodStats.replyRate, currentPeriodStats.previousReplyRate)}
                  <span className={`text-sm font-medium ml-1 ${getMetricColor(currentPeriodStats.replyRate, 'reply')}`}>
                    {currentPeriodStats.replyRate > currentPeriodStats.previousReplyRate ? '+' : ''}
                    {(currentPeriodStats.replyRate - currentPeriodStats.previousReplyRate).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="templates">Template Performance</TabsTrigger>
              <TabsTrigger value="timing">Timing Analysis</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Performance Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Performance Trends</span>
                      <Select value={metricType} onValueChange={setMetricType}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delivery">Delivery Rate</SelectItem>
                          <SelectItem value="read">Read Rate</SelectItem>
                          <SelectItem value="reply">Reply Rate</SelectItem>
                          <SelectItem value="volume">Message Volume</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                          formatter={(value: any, name: string) => [
                            `${value}${name === 'sent' ? '' : '%'}`, 
                            name.charAt(0).toUpperCase() + name.slice(1)
                          ]}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="delivered" 
                          stackId="1" 
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.6} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="read" 
                          stackId="1" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.6} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="replied" 
                          stackId="1" 
                          stroke="#f59e0b" 
                          fill="#f59e0b" 
                          fillOpacity={0.6} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">2.3x</div>
                      <div className="text-sm text-muted-foreground mb-2">Higher engagement</div>
                      <div className="text-xs text-muted-foreground">Templates with emojis perform better</div>
                    </div>
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">10-2 PM</div>
                      <div className="text-sm text-muted-foreground mb-2">Peak performance window</div>
                      <div className="text-xs text-muted-foreground">Best time for message delivery</div>
                    </div>
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">15%</div>
                      <div className="text-sm text-muted-foreground mb-2">Boost with CTA buttons</div>
                      <div className="text-xs text-muted-foreground">Templates with call-to-action</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {templatePerformance.map((template, index) => (
                      <div key={template.name} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                            <div>
                              <h4 className="font-medium text-foreground">{template.name}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {template.sent.toLocaleString()} sends
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Delivered</span>
                              <span className={`text-sm font-medium ${getMetricColor(template.delivered, 'delivery')}`}>
                                {template.delivered}%
                              </span>
                            </div>
                            <Progress value={template.delivered} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Read</span>
                              <span className={`text-sm font-medium ${getMetricColor(template.read, 'read')}`}>
                                {template.read}%
                              </span>
                            </div>
                            <Progress value={template.read} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Replied</span>
                              <span className={`text-sm font-medium ${getMetricColor(template.replied, 'reply')}`}>
                                {template.replied}%
                              </span>
                            </div>
                            <Progress value={template.replied} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Optimal Timing Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: any) => [`${value}%`, '']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="deliveryRate" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Delivery Rate"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="readRate" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Read Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">💡 Timing Recommendations</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Best performance window: 10 AM - 2 PM</li>
                      <li>• Avoid late evening sends (after 9 PM)</li>
                      <li>• Weekend mornings show 15% higher engagement</li>
                      <li>• Schedule utility messages for business hours</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value}%`, 'Share']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {categoryData.map((category) => (
                        <div key={category.name}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">{category.name}</span>
                            <Badge 
                              variant="outline" 
                              style={{ borderColor: category.color, color: category.color }}
                            >
                              {category.value}% share
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Avg. Delivery</div>
                              <div className="font-medium">
                                {category.name === 'UTILITY' ? '96.2%' :
                                 category.name === 'MARKETING' ? '92.8%' : '98.1%'}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Avg. Read</div>
                              <div className="font-medium">
                                {category.name === 'UTILITY' ? '89.4%' :
                                 category.name === 'MARKETING' ? '78.2%' : '94.5%'}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Avg. Reply</div>
                              <div className="font-medium">
                                {category.name === 'UTILITY' ? '18.7%' :
                                 category.name === 'MARKETING' ? '28.3%' : '8.9%'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
