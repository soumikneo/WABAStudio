import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Star, Shield, Users, Zap } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for testing and small projects",
      features: [
        "3 templates maximum",
        "Basic template editor",
        "1 team member",
        "Community support",
        "Template creation",
      ],
      limitations: [
        "No compliance protection",
        "No AI validation",
        "No analytics",
        "No team collaboration"
      ],
      cta: "Get Started Free",
      popular: false,
      color: "gray"
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Most popular for growing businesses",
      features: [
        "Unlimited templates",
        "Advanced editor + collaboration",
        "5 team members",
        "🛡️ FULL COMPLIANCE PROTECTION",
        "Real-time webhook monitoring",
        "Automatic violation prevention",
        "24-hour window tracking",
        "Risk scoring & alerts",
        "Analytics dashboard",
        "Email support",
        "💰 SAVES $50K+ in potential WABA bans"
      ],
      limitations: [],
      cta: "Start 14-Day Trial",
      popular: true,
      color: "blue",
      savings: "$50K+ in avoided restrictions"
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "/month",
      description: "Advanced features for large organizations",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "🛡️ ENTERPRISE COMPLIANCE",
        "Audit trails & reporting",
        "Custom compliance rules",
        "Dedicated compliance manager",
        "SLA guarantee (99.9% violation prevention)",
        "Custom integrations",
        "Priority support + compliance hotline",
        "SSO & advanced security",
        "💰 SAVES $100K+ in compliance costs"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      color: "purple",
      savings: "$100K+ in compliance costs"
    }
  ];

  const getCardClasses = (plan: any) => {
    if (plan.popular) {
      return "border-2 border-primary relative scale-105 shadow-xl";
    }
    return "border border-border";
  };

  const getButtonVariant = (plan: any) => {
    if (plan.popular) return "default";
    return "outline";
  };

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Pricing Plans
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Compliance protection that
            <br />
            <span className="text-primary">pays for itself</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your business. All paid plans include 
            our industry-leading compliance protection that has saved customers $50M+ in WABA restrictions.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={getCardClasses(plan)}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                <div className="py-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                {plan.savings && (
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                    💰 {plan.savings}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent>
                <Button 
                  className="w-full mb-6" 
                  variant={getButtonVariant(plan)}
                  size="lg"
                  data-testid={`button-${plan.name.toLowerCase()}-plan`}
                >
                  {plan.cta}
                </Button>
                
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <div key={limitationIndex} className="flex items-start space-x-2">
                      <X className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Value proposition by segment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">SMB E-commerce</h3>
            <p className="text-sm text-muted-foreground mb-3">
              "Never lose your WhatsApp Business account to policy violations. 
              Our customers have never been banned - guaranteed."
            </p>
            <div className="text-lg font-bold text-green-600">Save $75K average</div>
            <div className="text-xs text-muted-foreground">in avoided WABA restrictions</div>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Marketing Agencies</h3>
            <p className="text-sm text-muted-foreground mb-3">
              "Protect all your clients' WABA accounts with enterprise-grade 
              compliance monitoring. White-label available."
            </p>
            <div className="text-lg font-bold text-green-600">Avoid losing $500K+</div>
            <div className="text-xs text-muted-foreground">in client accounts</div>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Enterprise</h3>
            <p className="text-sm text-muted-foreground mb-3">
              "The only WhatsApp platform with real-time compliance protection 
              and audit trails your legal team requires."
            </p>
            <div className="text-lg font-bold text-green-600">Avoid $1M+</div>
            <div className="text-xs text-muted-foreground">in business disruption costs</div>
          </Card>
        </div>

        {/* FAQ section */}
        <div className="bg-card rounded-2xl p-8 lg:p-12">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                What makes your compliance protection different?
              </h4>
              <p className="text-sm text-muted-foreground">
                We're the only platform with real-time Meta webhook monitoring that 
                prevents violations in under 5 seconds. Other platforms only react after damage is done.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                How much can I really save?
              </h4>
              <p className="text-sm text-muted-foreground">
                Our customers save an average of $75K+ by avoiding WABA restrictions. 
                A single violation can cost months of lost revenue and account recovery.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Do you offer a money-back guarantee?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes! We offer a 30-day money-back guarantee. If we don't prevent 
                violations or improve your approval rate, we'll refund your subscription.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Can I upgrade or downgrade anytime?
              </h4>
              <p className="text-sm text-muted-foreground">
                Absolutely. You can change plans anytime, and we'll prorate the billing. 
                Upgrades take effect immediately, downgrades at the next billing cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to protect your WhatsApp Business?
          </h3>
          <p className="text-muted-foreground mb-6">
            Join 1,000+ businesses who trust WABAStudio for compliance protection
          </p>
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg font-semibold"
            asChild
            data-testid="button-start-trial-footer"
          >
            <a href="/api/login">Start Your Free Trial</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
