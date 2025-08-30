import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  LayoutDashboard, 
  FileText, 
  Shield, 
  BarChart3, 
  Users, 
  Zap,
  Settings
} from "lucide-react";

const navigation = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: LayoutDashboard,
    description: "Overview & metrics"
  },
  { 
    name: "Template Studio", 
    href: "/templates", 
    icon: FileText,
    description: "Manage templates"
  },
  { 
    name: "AI Validator", 
    href: "/ai-validator", 
    icon: Zap,
    description: "Validate & optimize"
  },
  { 
    name: "Compliance Guard", 
    href: "/compliance", 
    icon: Shield,
    description: "Monitor compliance"
  },
  { 
    name: "Analytics", 
    href: "/analytics", 
    icon: BarChart3,
    description: "Performance insights"
  },
  { 
    name: "Team", 
    href: "/team", 
    icon: Users,
    description: "Team collaboration"
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-sm">
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="flex items-center h-16 px-6 border-b border-border">
          <Link href="/" className="flex items-center space-x-3" data-testid="link-logo">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">WABAStudio</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                    isActive
                      ? "sidebar-link active"
                      : "sidebar-link"
                  )}
                  data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs opacity-75 mt-0.5">{item.description}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
            <button 
              className="p-1 rounded-md hover:bg-accent"
              data-testid="button-user-settings"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
