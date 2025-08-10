import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { insertWordpressSiteSchema } from "@shared/schema";
import { z } from "zod";

interface WordPressConnectionWizardProps {
  trigger?: React.ReactNode;
}

export default function WordPressConnectionWizard({ 
  trigger 
}: WordPressConnectionWizardProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [connectionType, setConnectionType] = useState<string>("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    connectionType: "",
    credentials: {} as any,
  });

  const createSiteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertWordpressSiteSchema> & { userId: string }) => {
      const response = await apiRequest("POST", "/api/wordpress/sites", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wordpress/sites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "WordPress site connected successfully",
      });
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
        title: "Error",
        description: "Failed to connect WordPress site",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setStep(1);
    setConnectionType("");
    setConnectionStatus(null);
    setFormData({
      name: "",
      url: "",
      connectionType: "",
      credentials: {},
    });
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.url)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.3;
      
      setConnectionStatus({
        success,
        message: success 
          ? "Connection successful! Your WordPress site is accessible."
          : "Connection failed. Please check your credentials and try again."
      });
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: "Connection test failed. Please check your settings."
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = () => {
    const siteData = {
      ...formData,
      connectionType,
    };

    try {
      insertWordpressSiteSchema.parse(siteData);
      createSiteMutation.mutate(siteData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
    }
  };

  const connectionTypes = [
    {
      id: "rest_api",
      name: "REST API",
      description: "Connect using WordPress REST API with application password",
      icon: "fas fa-key",
      recommended: true,
    },
    {
      id: "oauth2",
      name: "OAuth2",
      description: "Secure OAuth2 authentication (requires plugin)",
      icon: "fas fa-shield-alt",
      recommended: false,
    },
    {
      id: "credentials",
      name: "Username/Password",
      description: "Connect with WordPress admin credentials",
      icon: "fas fa-user-lock",
      recommended: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-wp-blue to-wp-blue-light hover:shadow-lg">
            <i className="fas fa-plus mr-2"></i>
            Connect Site
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-800/95 backdrop-blur-md border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Connect WordPress Site
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= num 
                      ? "bg-wp-blue text-white" 
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div 
                    className={`w-12 h-px ${
                      step > num ? "bg-wp-blue" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Site Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site-name" className="text-gray-300">Site Name</Label>
                  <Input
                    id="site-name"
                    placeholder="My WordPress Site"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="site-url" className="text-gray-300">Site URL</Label>
                  <Input
                    id="site-url"
                    placeholder="https://mywordpresssite.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Connection Method */}
          {step === 2 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Connection Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {connectionTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        connectionType === type.id
                          ? "border-wp-blue bg-wp-blue/10"
                          : "border-white/20 hover:border-white/40"
                      }`}
                      onClick={() => setConnectionType(type.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-wp-blue/20 rounded-lg flex items-center justify-center">
                          <i className={`${type.icon} text-wp-blue-light`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-white">{type.name}</h3>
                            {type.recommended && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Credentials */}
          {step === 3 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={connectionType} className="w-full">
                  <TabsContent value="rest_api" className="space-y-4">
                    <div>
                      <Label htmlFor="app-username" className="text-gray-300">Username</Label>
                      <Input
                        id="app-username"
                        placeholder="WordPress username"
                        value={formData.credentials.username || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          credentials: { ...formData.credentials, username: e.target.value }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="app-password" className="text-gray-300">Application Password</Label>
                      <Input
                        id="app-password"
                        type="password"
                        placeholder="Application password from WordPress"
                        value={formData.credentials.applicationPassword || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          credentials: { ...formData.credentials, applicationPassword: e.target.value }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-sm text-blue-300">
                        <i className="fas fa-info-circle mr-2"></i>
                        Generate an application password in your WordPress admin under Users → Profile → Application Passwords
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="oauth2" className="space-y-4">
                    <div>
                      <Label htmlFor="client-id" className="text-gray-300">Client ID</Label>
                      <Input
                        id="client-id"
                        placeholder="OAuth2 Client ID"
                        value={formData.credentials.clientId || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          credentials: { ...formData.credentials, clientId: e.target.value }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-secret" className="text-gray-300">Client Secret</Label>
                      <Input
                        id="client-secret"
                        type="password"
                        placeholder="OAuth2 Client Secret"
                        value={formData.credentials.clientSecret || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          credentials: { ...formData.credentials, clientSecret: e.target.value }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="credentials" className="space-y-4">
                    <div>
                      <Label htmlFor="wp-username" className="text-gray-300">WordPress Username</Label>
                      <Input
                        id="wp-username"
                        placeholder="Admin username"
                        value={formData.credentials.username || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          credentials: { ...formData.credentials, username: e.target.value }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wp-password" className="text-gray-300">WordPress Password</Label>
                      <Input
                        id="wp-password"
                        type="password"
                        placeholder="Admin password"
                        value={formData.credentials.password || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          credentials: { ...formData.credentials, password: e.target.value }
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                      <p className="text-sm text-orange-300">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Not recommended for production. Use application passwords or OAuth2 instead.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Connection Test */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white">Test Connection</h4>
                    <Button
                      onClick={testConnection}
                      disabled={isTestingConnection}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-gray-300 hover:text-white"
                    >
                      {isTestingConnection ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Testing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-link mr-2"></i>
                          Test Connection
                        </>
                      )}
                    </Button>
                  </div>

                  {connectionStatus && (
                    <div className={`p-3 rounded-lg border ${
                      connectionStatus.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/10 border-red-500/30 text-red-300"
                    }`}>
                      <div className="flex items-center space-x-2">
                        <i className={`fas ${connectionStatus.success ? "fa-check-circle" : "fa-times-circle"}`}></i>
                        <span className="text-sm">{connectionStatus.message}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {step > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-gray-300 hover:text-white"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </Button>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setOpen(false)}
                variant="outline"
                className="bg-white/10 border-white/20 text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-wp-blue to-wp-blue-light hover:shadow-lg"
                  disabled={step === 2 && !connectionType}
                >
                  Next
                  <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createSiteMutation.isPending || !connectionStatus?.success}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:shadow-lg"
                >
                  {createSiteMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Connect Site
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
