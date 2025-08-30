import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote, TrendingUp, Shield } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "E-commerce Plus",
      avatar: "SC",
      content: "WABAStudio saved us from a $200K disaster. Meta changed our template categories without notice, and their system caught it instantly. We went from 67% approval rate to 96% in just two weeks.",
      rating: 5,
      metric: "96% approval rate",
      industry: "E-commerce"
    },
    {
      name: "Michael Rodriguez",
      role: "CTO",
      company: "FinTech Solutions",
      avatar: "MR",
      content: "The compliance monitoring is incredible. We've had zero violations in 8 months, compared to 3 WABA warnings before WABAStudio. The real-time alerts have prevented at least 5 major incidents.",
      rating: 5,
      metric: "Zero violations",
      industry: "FinTech"
    },
    {
      name: "Emily Watson",
      role: "Operations Manager",
      company: "Healthcare Connect",
      avatar: "EW",
      content: "Template approval went from 2-3 days to under 2 hours. The AI validator catches issues we never would have seen. ROI was immediate - we saved more in the first month than the annual subscription cost.",
      rating: 5,
      metric: "2 hour approvals",
      industry: "Healthcare"
    },
    {
      name: "David Kim",
      role: "Growth Lead",
      company: "PropTech Startup",
      avatar: "DK",
      content: "We manage 50+ templates across multiple campaigns. The team collaboration features and bulk operations have cut our template management time by 80%. Game changer for scaling.",
      rating: 5,
      metric: "80% time saved",
      industry: "PropTech"
    },
    {
      name: "Lisa Thompson",
      role: "Compliance Officer",
      company: "Insurance Corp",
      avatar: "LT",
      content: "The audit trails and compliance reporting are exactly what our legal team needed. We can prove compliance to regulators with detailed logs and violation prevention records.",
      rating: 5,
      metric: "100% audit ready",
      industry: "Insurance"
    },
    {
      name: "Carlos Mendoza",
      role: "Digital Marketing Manager",
      company: "Retail Chain",
      avatar: "CM",
      content: "Before WABAStudio, we were constantly worried about template violations. Now we can focus on messaging strategy knowing the platform handles all compliance automatically. Peace of mind is priceless.",
      rating: 5,
      metric: "Complete peace of mind",
      industry: "Retail"
    }
  ];

  const stats = [
    {
      metric: "1,000+",
      description: "Businesses protected",
      icon: Shield
    },
    {
      metric: "$50M+",
      description: "Total losses prevented",
      icon: TrendingUp
    },
    {
      metric: "99.9%",
      description: "Violation prevention rate",
      icon: Star
    }
  ];

  return (
    <section id="testimonials" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Customer Success Stories
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Trusted by businesses who
            <br />
            <span className="text-primary">refuse to get banned</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From startups to Fortune 500 companies, businesses choose WABAStudio 
            to protect their WhatsApp presence and scale with confidence.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.metric}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            );
          })}
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                {/* Metric highlight */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <div className="font-semibold text-green-800">{testimonial.metric}</div>
                    <div className="text-xs text-green-600">Key improvement</div>
                  </div>
                </div>
                
                {/* Author */}
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.company} • {testimonial.industry}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Case study highlight */}
        <Card className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-2 border-blue-200">
          <CardContent className="p-8 lg:p-12">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-blue-100 text-blue-800">
                Featured Case Study
              </Badge>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                How E-commerce Plus Avoided a $200K WhatsApp Ban
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Meta silently changed their template categories during a Black Friday campaign. 
                WABAStudio's real-time monitoring caught the violation attempt in 1.7 seconds, 
                preventing 1,247 policy violations that would have resulted in immediate account suspension.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600 mb-1">1.7s</div>
                <div className="text-sm text-muted-foreground">Detection time</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-red-600 mb-1">1,247</div>
                <div className="text-sm text-muted-foreground">Violations prevented</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-green-600 mb-1">$200K</div>
                <div className="text-sm text-muted-foreground">Loss avoided</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
                <div className="text-sm text-muted-foreground">Downtime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-6">
            Join these successful businesses protecting their WhatsApp presence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              100% of our customers avoid violations
            </Badge>
            <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
              <Star className="w-3 h-3 mr-1" />
              4.9/5 average customer rating
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
