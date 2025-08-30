import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, TrendingUp, CheckCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Announcement badge */}
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
            <Shield className="w-4 h-4 mr-2" />
            99.9% Violation Prevention Rate
          </div>
          
          {/* Main headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
            <span className="block">WhatsApp Template</span>
            <span className="block text-primary">Compliance Intelligence</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The only WhatsApp Business platform that <strong className="text-foreground">guarantees approval</strong> and 
            protects you from bans — with advanced AI validation, real-time compliance monitoring, and team collaboration.
          </p>
          
          {/* Value proposition */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              94% AI Validation Accuracy
            </div>
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              &lt;5 Second Violation Prevention
            </div>
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              $50K+ Average Savings
            </div>
          </div>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg font-semibold"
              asChild
              data-testid="button-start-free-trial"
            >
              <a href="/api/login">Start Free Trial</a>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 text-lg font-semibold"
              data-testid="button-watch-demo"
            >
              Watch Demo
            </Button>
          </div>
          
          {/* Social proof */}
          <p className="text-sm text-muted-foreground mb-8">
            Trusted by 1,000+ businesses who've never been banned
          </p>
        </div>
        
        {/* Hero dashboard preview */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Dashboard header */}
            <div className="bg-muted/50 border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">WABAStudio Dashboard</span>
                </div>
                <div className="compliance-safe px-3 py-1 rounded-full text-sm font-medium border">
                  <span className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Protected
                  </span>
                </div>
              </div>
            </div>
            
            {/* Dashboard content */}
            <div className="p-6">
              {/* Metrics grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Templates</p>
                      <p className="text-2xl font-bold text-foreground">47</p>
                    </div>
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approval Rate</p>
                      <p className="text-2xl font-bold text-green-600">94%</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Compliance</p>
                      <p className="text-2xl font-bold text-green-600">98.5</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Saved</p>
                      <p className="text-2xl font-bold text-blue-600">$52K</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Critical save notification */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-800 mb-1">VIOLATION PREVENTED - 2 hours ago</h3>
                    <p className="text-sm text-green-700 mb-2">
                      Template "order_followup" was changed UTILITY → MARKETING by Meta without notice!
                    </p>
                    <div className="text-xs text-green-600">
                      ✅ Blocked 247 messages • ✅ Prevented WABA restriction • ✅ $50K+ loss avoided
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
