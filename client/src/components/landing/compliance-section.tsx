import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Clock,
  Activity,
  TrendingUp,
  Bell
} from "lucide-react";

export default function ComplianceSection() {
  return (
    <section id="compliance" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-green-50 text-green-700 border-green-200">
            🛡️ Compliance Protection
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            The <span className="text-red-600">$50K violation</span> that
            <br />
            <span className="text-green-600">never happened</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real story: Meta silently changed a template from UTILITY to MARKETING. 
            Our system caught it in 2.3 seconds and prevented 247 violations that would have 
            cost this business their WhatsApp account.
          </p>
        </div>

        {/* Main compliance demo */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-br from-red-50 via-white to-green-50 border-2 border-red-200">
            <CardContent className="p-8">
              {/* Timeline header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  Live Compliance Event - Case Study
                </h3>
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  CRITICAL SAVE
                </Badge>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                {/* Event 1 */}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-red-800">13:45:23</span>
                      <span className="text-sm text-red-600">Meta webhook received</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Template "order_followup" category changed: UTILITY → MARKETING
                    </p>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-yellow-800">13:45:24</span>
                      <span className="text-sm text-yellow-600">Auto-response triggered</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      247 queued messages blocked, team alerts sent
                    </p>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-green-800">13:45:35</span>
                      <span className="text-sm text-green-600">Violation prevented</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Replacement template created, business continues safely
                    </p>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-4">Protection Results</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">247</div>
                    <div className="text-sm text-green-700">Violations Prevented</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">12s</div>
                    <div className="text-sm text-green-700">Total Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$52K</div>
                    <div className="text-sm text-green-700">Estimated Loss Avoided</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Real-time monitoring */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Real-Time Monitoring</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                24/7 webhook monitoring with Meta API integration detects template changes, 
                policy updates, and compliance risks instantly.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Template status changes detected in &lt;5 seconds</span>
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Automatic violation prevention before sending</span>
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>24-hour customer window tracking per contact</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Proactive alerts */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Proactive Intelligence</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                AI-powered risk scoring and policy change alerts keep you ahead 
                of compliance issues before they impact your business.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Daily sync with Meta API for template status</span>
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>AI-powered compliance risk scoring</span>
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Policy change alerts before they affect you</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats section */}
        <div className="bg-muted/50 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Industry-Leading Protection
            </h3>
            <p className="text-muted-foreground">
              Our customers have never been banned. Here's why.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-sm font-medium text-foreground mb-1">Violation Prevention Rate</div>
              <div className="text-xs text-muted-foreground">Industry average: 67%</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2.3s</div>
              <div className="text-sm font-medium text-foreground mb-1">Average Response Time</div>
              <div className="text-xs text-muted-foreground">Emergency protection activated</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">$50M+</div>
              <div className="text-sm font-medium text-foreground mb-1">Total Loss Prevented</div>
              <div className="text-xs text-muted-foreground">Across all customer accounts</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg font-semibold"
            asChild
            data-testid="button-start-protection"
          >
            <a href="/api/login">Start Your Protection Today</a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Join 1,000+ businesses who trust WABAStudio for compliance protection
          </p>
        </div>
      </div>
    </section>
  );
}
