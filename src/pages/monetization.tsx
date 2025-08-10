import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { 
  DollarSign, 
  TrendingUp, 
  Settings,
  Code,
  Eye,
  BarChart3,
  Percent,
  Globe
} from "lucide-react";
import { useEffect } from "react";

export default function Monetization() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/monetization/settings'],
    enabled: isAuthenticated,
  });

  const { data: realtimeMetrics } = useQuery({
    queryKey: ['/api/analytics/realtime'],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const form = useForm({
    defaultValues: {
      adsenseEnabled: false,
      adsensePublisherId: '',
      adsterraEnabled: false,
      adsterraPublisherId: '',
      customAdsEnabled: false,
      customAdsCode: '',
      revenueShare: 70,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/monetization/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/monetization/settings'] });
      toast({
        title: "Settings Updated",
        description: "Your monetization settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update monetization settings.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateSettingsMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access monetization settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/api/login">Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedRevenue = realtimeMetrics?.reduce((acc: number, metric: any) => {
    // Simple revenue estimation based on views and clicks
    if (metric.eventType === 'view') return acc + 0.001;
    if (metric.eventType === 'click') return acc + 0.05;
    return acc;
  }, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monetization Hub</h1>
          <p className="text-muted-foreground">Maximize your revenue with advanced ad integration</p>
        </div>
        <Badge variant="default" className="px-3 py-1">
          <DollarSign className="w-4 h-4 mr-1" />
          Revenue Share: {settings?.revenueShare || 70}%
        </Badge>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estimatedRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeMetrics?.filter((m: any) => m.eventType === 'view').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Real-time tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Clicks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeMetrics?.filter((m: any) => m.eventType === 'click').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeMetrics && realtimeMetrics.length > 0 
                ? ((realtimeMetrics.filter((m: any) => m.eventType === 'click').length / 
                   realtimeMetrics.filter((m: any) => m.eventType === 'view').length) * 100).toFixed(1)
                : '0.0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Click-through rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="adsense" className="space-y-4">
        <TabsList>
          <TabsTrigger value="adsense">Google AdSense</TabsTrigger>
          <TabsTrigger value="adsterra">Adsterra</TabsTrigger>
          <TabsTrigger value="custom">Custom Ads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="adsense">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Google AdSense Integration
              </CardTitle>
              <CardDescription>
                Connect your AdSense account to display high-quality ads in your Web Stories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable AdSense</Label>
                  <div className="text-sm text-muted-foreground">
                    Show Google AdSense ads in your stories
                  </div>
                </div>
                <Switch
                  checked={form.watch('adsenseEnabled')}
                  onCheckedChange={(checked) => form.setValue('adsenseEnabled', checked)}
                />
              </div>

              {form.watch('adsenseEnabled') && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adsensePublisherId">AdSense Publisher ID</Label>
                    <Input
                      id="adsensePublisherId"
                      placeholder="pub-1234567890123456"
                      {...form.register('adsensePublisherId')}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Find your Publisher ID in your AdSense account
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">AdSense Benefits</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• High-quality, relevant ads</li>
                      <li>• Automatic optimization</li>
                      <li>• Global advertiser network</li>
                      <li>• Detailed revenue reporting</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adsterra">
          <Card>
            <CardHeader>
              <CardTitle>Adsterra Network</CardTitle>
              <CardDescription>
                High-performing ad network with competitive rates and global coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Adsterra</Label>
                  <div className="text-sm text-muted-foreground">
                    Display Adsterra ads for higher revenue potential
                  </div>
                </div>
                <Switch
                  checked={form.watch('adsterraEnabled')}
                  onCheckedChange={(checked) => form.setValue('adsterraEnabled', checked)}
                />
              </div>

              {form.watch('adsterraEnabled') && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adsterraPublisherId">Adsterra Publisher ID</Label>
                    <Input
                      id="adsterraPublisherId"
                      placeholder="Your Adsterra Publisher ID"
                      {...form.register('adsterraPublisherId')}
                    />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Adsterra Advantages</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Higher CPM rates</li>
                      <li>• Worldwide traffic monetization</li>
                      <li>• Multiple ad formats</li>
                      <li>• Fast payments</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Custom Ad Code
              </CardTitle>
              <CardDescription>
                Add your own ad codes from any advertising network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Custom Ads</Label>
                  <div className="text-sm text-muted-foreground">
                    Use custom HTML/JavaScript ad codes
                  </div>
                </div>
                <Switch
                  checked={form.watch('customAdsEnabled')}
                  onCheckedChange={(checked) => form.setValue('customAdsEnabled', checked)}
                />
              </div>

              {form.watch('customAdsEnabled') && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customAdsCode">Custom Ad Code</Label>
                    <Textarea
                      id="customAdsCode"
                      placeholder="Paste your ad code here..."
                      rows={8}
                      {...form.register('customAdsCode')}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports HTML and JavaScript ad codes from any network
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Ensure ad codes are AMP-compatible</li>
                      <li>• Test ads before publishing stories</li>
                      <li>• Follow ad network policies</li>
                      <li>• Monitor performance regularly</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Track your monetization performance in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                    <h3 className="font-semibold mb-2">Today's Revenue</h3>
                    <div className="text-2xl font-bold">${(estimatedRevenue * 0.1).toFixed(2)}</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 text-white">
                    <h3 className="font-semibold mb-2">This Month</h3>
                    <div className="text-2xl font-bold">${estimatedRevenue.toFixed(2)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Activity</h4>
                  <div className="space-y-2">
                    {realtimeMetrics?.slice(0, 10).map((metric: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {metric.eventType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {metric.country || 'Unknown'}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )) || (
                      <p className="text-muted-foreground text-center py-8">
                        No recent activity to display
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revenue Share Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Share</CardTitle>
          <CardDescription>
            Understand how revenue is shared between you and the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Your Share</span>
              <Badge variant="default">{settings?.revenueShare || 70}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Platform Fee</span>
              <Badge variant="outline">{100 - (settings?.revenueShare || 70)}%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Revenue share may vary based on your subscription plan and total earnings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateSettingsMutation.isPending}
          className="min-w-32"
        >
          {updateSettingsMutation.isPending ? (
            <div className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Saving...
            </div>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}