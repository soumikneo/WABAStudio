import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Cpu,
  Clock,
  DollarSign
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Template Studio",
      description: "Advanced template creation with drag-and-drop visual editor, live preview, and team collaboration.",
      benefits: ["Visual editor", "Live preview", "Version control", "Bulk operations"],
      color: "blue"
    },
    {
      icon: Zap,
      title: "AI Validator & Auto-Fix",
      description: "Predict approval likelihood with 94% accuracy and automatically fix common template issues.",
      benefits: ["94% accuracy", "Auto-fix engine", "Instant validation", "Smart suggestions"],
      color: "purple"
    },
    {
      icon: Shield,
      title: "Compliance Guard",
      description: "Real-time webhook monitoring prevents policy violations in under 5 seconds.",
      benefits: ["<5s response", "99.9% prevention", "24/7 monitoring", "Emergency alerts"],
      color: "green"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track delivery rates, read rates, and reply rates across all your templates.",
      benefits: ["Delivery insights", "Read analytics", "Reply tracking", "Performance trends"],
      color: "yellow"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Multi-user template management with approval workflows and activity tracking.",
      benefits: ["Team workspace", "Approval flows", "Activity logs", "Role management"],
      color: "indigo"
    },
    {
      icon: Cpu,
      title: "Meta API Integration",
      description: "Seamless sync with WhatsApp Business Management API for real-time template status.",
      benefits: ["Real-time sync", "Status updates", "Webhook handling", "Bulk sync"],
      color: "pink"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", icon: "text-blue-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", icon: "text-purple-600" },
      green: { bg: "bg-green-100", text: "text-green-600", icon: "text-green-600" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600", icon: "text-yellow-600" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600", icon: "text-indigo-600" },
      pink: { bg: "bg-pink-100", text: "text-pink-600", icon: "text-pink-600" }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Core Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything you need to master
            <br />
            <span className="text-primary">WhatsApp Business templates</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From creation to compliance, our platform provides enterprise-grade tools 
            that ensure your templates are approved, compliant, and performing.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = getColorClasses(feature.color);
            
            return (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Key differentiators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Instant Violation Prevention
              </h3>
              <p className="text-green-700 text-sm mb-3">
                Our system detects and prevents violations in under 5 seconds, 
                protecting your business from costly WABA restrictions.
              </p>
              <div className="text-2xl font-bold text-green-600">&lt;5 seconds</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                AI-Powered Accuracy
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Our machine learning models, trained on 100K+ templates, 
                predict approval with industry-leading accuracy.
              </p>
              <div className="text-2xl font-bold text-blue-600">94% accuracy</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Guaranteed ROI
              </h3>
              <p className="text-purple-700 text-sm mb-3">
                Our customers save an average of $75K+ by avoiding WABA 
                restrictions and compliance violations.
              </p>
              <div className="text-2xl font-bold text-purple-600">$75K+ saved</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
