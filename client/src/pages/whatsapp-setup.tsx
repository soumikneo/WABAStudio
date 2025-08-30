import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/auth-utils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  CheckCircle, 
  AlertTriangle, 
  Smartphone, 
  Key, 
  Globe, 
  Shield,
  Copy,
  ExternalLink 
} from "lucide-react";

const whatsappAccountSchema = z.object({
  wabaId: z.string().min(1, "WhatsApp Business Account ID is required"),
  accessToken: z.string().min(1, "Access token is required"),
  phoneNumberId: z.string().min(1, "Phone number ID is required"),
  webhookVerifyToken: z.string().min(1, "Webhook verify token is required"),
  businessName: z.string().min(1, "Business name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

type WhatsAppAccountForm = z.infer<typeof whatsappAccountSchema>;

export default function WhatsAppSetup() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [webhookUrl, setWebhookUrl] = useState("");

  // Generate webhook URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setWebhookUrl(`${baseUrl}/api/webhooks/whatsapp`);
    }
  }, []);

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

  const form = useForm<WhatsAppAccountForm>({
    resolver: zodResolver(whatsappAccountSchema),
    defaultValues: {
      wabaId: "",
      accessToken: "",
      phoneNumberId: "",
      webhookVerifyToken: "",
      businessName: "",
      phoneNumber: "",
    },
  });

  const connectAccountMutation = useMutation({
    mutationFn: async (data: WhatsAppAccountForm) => {
      const response = await apiRequest("POST", "/api/whatsapp/accounts", data);
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/accounts"] });
      toast({
        title: "WhatsApp Business Account Connected!",
        description: `Successfully connected ${result.businessName}. You can now create templates.`,
      });
      setStep(4); // Success step
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Webhook URL copied successfully.",
    });
  };

  const onSubmit = (data: WhatsAppAccountForm) => {
    connectAccountMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Connect WhatsApp Business"
          subtitle="Set up your WhatsApp Business API integration"
        />

        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[
                  { num: 1, title: "Meta App Setup", icon: Globe },
                  { num: 2, title: "Webhook Configuration", icon: Shield },
                  { num: 3, title: "Account Details", icon: Smartphone },
                  { num: 4, title: "Connected!", icon: CheckCircle }
                ].map((stepItem, index) => {
                  const Icon = stepItem.icon;
                  const isActive = step === stepItem.num;
                  const isCompleted = step > stepItem.num;
                  
                  return (
                    <div key={stepItem.num} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isCompleted 
                          ? "bg-green-500 border-green-500 text-white" 
                          : isActive 
                            ? "border-primary bg-primary text-white" 
                            : "border-gray-300 text-gray-400"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < 3 && (
                        <div className={`h-0.5 w-20 mx-4 ${
                          step > stepItem.num ? "bg-green-500" : "bg-gray-300"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Step 1: Create Meta App & Get Credentials
                  </CardTitle>
                  <CardDescription>
                    Set up your Meta app to get the required API credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You'll need to create a Meta app with WhatsApp Business API permissions. This requires a Meta Developer account.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">1. Go to Meta Developers Console</h4>
                      <p className="text-sm text-muted-foreground">Visit developers.facebook.com and create a new app</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">2. Add WhatsApp Business Product</h4>
                      <p className="text-sm text-muted-foreground">Add the WhatsApp Business API product to your app</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">3. Generate Access Token</h4>
                      <p className="text-sm text-muted-foreground">Create a permanent access token with whatsapp_business_messaging permissions</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">4. Get Phone Number ID</h4>
                      <p className="text-sm text-muted-foreground">Find your phone number ID in the WhatsApp Business API settings</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => window.open("https://developers.facebook.com/", "_blank")}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Meta Developers
                    </Button>
                    <Button onClick={() => setStep(2)} data-testid="button-next-step">
                      Continue to Webhook Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Step 2: Configure Webhooks
                  </CardTitle>
                  <CardDescription>
                    Set up webhooks to receive real-time updates from Meta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Webhook URL</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={webhookUrl}
                        readOnly
                        className="font-mono text-sm"
                        data-testid="input-webhook-url"
                      />
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(webhookUrl)}
                        data-testid="button-copy-webhook"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Copy this URL and configure it in your Meta app's webhook settings
                    </p>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Webhook Events to Subscribe</Label>
                    <div className="mt-2 space-y-2">
                      <Badge variant="outline">message_template_status_update</Badge>
                      <Badge variant="outline">message_template_category_update</Badge>
                      <Badge variant="outline">account_update</Badge>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Make sure to set the webhook verify token in the next step. This ensures secure communication between Meta and your platform.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} data-testid="button-next-account">
                      Configure Account Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Step 3: Enter Account Details
                  </CardTitle>
                  <CardDescription>
                    Connect your WhatsApp Business Account with the API credentials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Business Name" {...field} data-testid="input-business-name" />
                              </FormControl>
                              <FormDescription>
                                Display name for your WhatsApp Business Account
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+1234567890" {...field} data-testid="input-phone-number" />
                              </FormControl>
                              <FormDescription>
                                Your WhatsApp Business phone number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="wabaId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp Business Account ID</FormLabel>
                              <FormControl>
                                <Input placeholder="1234567890123456" {...field} data-testid="input-waba-id" />
                              </FormControl>
                              <FormDescription>
                                Found in your Meta app's WhatsApp Business settings
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phoneNumberId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number ID</FormLabel>
                              <FormControl>
                                <Input placeholder="9876543210987654" {...field} data-testid="input-phone-id" />
                              </FormControl>
                              <FormDescription>
                                Unique ID for your WhatsApp phone number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="accessToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Permanent Access Token</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="EAAxxxxxxxxxxxxx" 
                                {...field} 
                                data-testid="input-access-token"
                              />
                            </FormControl>
                            <FormDescription>
                              Your permanent WhatsApp Business API access token
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="webhookVerifyToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook Verify Token</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your-verify-token-here" 
                                {...field} 
                                data-testid="input-verify-token"
                              />
                            </FormControl>
                            <FormDescription>
                              Create a secure token for webhook verification (use this in Meta app webhook settings)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setStep(2)}
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={connectAccountMutation.isPending}
                          data-testid="button-connect-account"
                        >
                          {connectAccountMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Connecting...
                            </>
                          ) : (
                            "Connect WhatsApp Business Account"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    WhatsApp Business Account Connected!
                  </CardTitle>
                  <CardDescription>
                    Your account is now ready to create and manage templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      🎉 Success! Your WhatsApp Business Account is connected and webhooks are configured. 
                      You can now create templates and receive real-time compliance updates.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={() => window.location.href = "/dashboard"}
                      data-testid="button-go-dashboard"
                    >
                      Go to Dashboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = "/templates/new"}
                      data-testid="button-create-template"
                    >
                      Create Your First Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}