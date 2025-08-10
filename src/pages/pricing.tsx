import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Check, 
  Crown, 
  Zap, 
  Star,
  CreditCard,
  Globe,
  Shield
} from "lucide-react";
import { useState } from "react";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
  });

  const { data: creditBalance } = useQuery({
    queryKey: ['/api/credits/balance'],
    enabled: isAuthenticated,
  });

  const purchaseCreditsMutation = useMutation({
    mutationFn: async ({ amount, credits }: { amount: number; credits: number }) => {
      return apiRequest('POST', '/api/credits/purchase', { amount, credits });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credits/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/credits/transactions'] });
      toast({
        title: "Credits Purchased!",
        description: "Your credits have been added to your account.",
      });
      setIsLoading(null);
    },
    onError: () => {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
      setIsLoading(null);
    },
  });

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Zap className="w-6 h-6" />;
      case 'basic':
        return <Star className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      case 'enterprise':
        return <Shield className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'border-green-200 bg-green-50';
      case 'basic':
        return 'border-blue-200 bg-blue-50';
      case 'pro':
        return 'border-purple-200 bg-purple-50 ring-2 ring-purple-500';
      case 'enterprise':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200';
    }
  };

  const handlePurchaseCredits = async (amount: number, credits: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase credits.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(`credits-${credits}`);
    purchaseCreditsMutation.mutate({ amount, credits });
  };

  const creditPackages = [
    { credits: 50, price: 10, popular: false },
    { credits: 150, price: 25, popular: true, savings: '17%' },
    { credits: 300, price: 45, popular: false, savings: '25%' },
    { credits: 500, price: 70, popular: false, savings: '30%' },
  ];

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your WordPress content into engaging Web Stories with our flexible pricing options
        </p>
        {isAuthenticated && (
          <div className="mt-6">
            <Badge variant="outline" className="px-4 py-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Current Balance: {creditBalance?.balance || 0} Credits
            </Badge>
          </div>
        )}
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {plans?.map((plan: any) => (
          <Card key={plan.id} className={`relative ${getPlanColor(plan.name)}`}>
            {plan.name.toLowerCase() === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getPlanIcon(plan.name)}
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? 'Free' : `$${formatPrice(plan.price)}`}
                </span>
                {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {plan.creditsIncluded} credits included
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {plan.maxSites === 100 ? 'Unlimited' : plan.maxSites} WordPress sites
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {plan.maxStoriesPerMonth} stories per month
                </div>
              </div>
              
              <div className="space-y-1">
                {plan.features?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-6" 
                variant={plan.name.toLowerCase() === 'pro' ? 'default' : 'outline'}
                disabled={!isAuthenticated}
              >
                {plan.price === 0 ? 'Current Plan' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credit Packages */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Need More Credits?</h2>
          <p className="text-lg text-muted-foreground">
            Purchase additional credits for creating more Web Stories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPackages.map((pkg, index) => (
            <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Best Value</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{pkg.credits} Credits</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  {pkg.savings && (
                    <div className="text-sm text-green-600 font-medium">Save {pkg.savings}</div>
                  )}
                </div>
                <CardDescription>
                  ${(pkg.price / pkg.credits).toFixed(2)} per credit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handlePurchaseCredits(pkg.price, pkg.credits)}
                  disabled={!isAuthenticated || isLoading === `credits-${pkg.credits}`}
                >
                  {isLoading === `credits-${pkg.credits}` ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing...
                    </div>
                  ) : (
                    'Purchase Credits'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-6">Secure Payment Methods</h3>
        <div className="flex justify-center items-center space-x-8 text-muted-foreground">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 mr-2" />
            Stripe
          </div>
          <div className="flex items-center">
            <Globe className="w-6 h-6 mr-2" />
            PayPal
          </div>
          <div className="flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Local Payments
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          We support worldwide payments including Pakistan local methods (Easypaisa, JazzCash)
        </p>
      </div>

      {!isAuthenticated && (
        <div className="text-center mt-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
              <CardDescription>Log in to select your plan and start creating amazing Web Stories</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/api/login">Log In to Continue</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}