import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebSocketProvider } from "@/lib/websocket-client";
import { useAuth } from "@/hooks/use-auth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Templates from "@/pages/templates";
import TemplateEditor from "@/pages/template-editor";
import WhatsAppSetup from "@/pages/whatsapp-setup";
import Compliance from "@/pages/compliance";
import Analytics from "@/pages/analytics";
import Team from "@/pages/team";
import AIValidator from "@/pages/ai-validator";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/templates" component={Templates} />
          <Route path="/templates/:id/edit" component={TemplateEditor} />
          <Route path="/templates/new" component={TemplateEditor} />
          <Route path="/settings/whatsapp" component={WhatsAppSetup} />
          <Route path="/compliance" component={Compliance} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/ai-validator" component={AIValidator} />
          <Route path="/team" component={Team} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
