import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/navigation";
import { Link } from "wouter";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedStory, setSelectedStory] = useState<string>("all");

  // Redirect if not authenticated
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

  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["/api/stories"],
    retry: false,
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Mock analytics data - in a real app, this would come from the analytics API
  const analyticsData = {
    totalViews: 45234,
    uniqueViews: 38192,
    avgTimeSpent: 287, // seconds
    completionRate: 73, // percentage
    topStories: [
      {
        id: "1",
        title: "10 Essential JavaScript Tips for Modern Development",
        views: 12456,
        completionRate: 78,
        avgTime: 245,
      },
      {
        id: "2", 
        title: "Building Responsive Web Applications with CSS Grid",
        views: 9832,
        completionRate: 82,
        avgTime: 312,
      },
      {
        id: "3",
        title: "Advanced React Hooks Patterns",
        views: 8654,
        completionRate: 69,
        avgTime: 198,
      },
    ],
    chartData: {
      views: [1200, 1350, 1800, 2100, 1950, 2200, 2400],
      engagement: [65, 68, 72, 75, 71, 78, 73],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  };

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Analytics
              </h1>
              <p className="text-gray-400">Track your Web Stories performance and engagement</p>
            </div>
            <div className="flex space-x-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/">
                <Button variant="outline" className="bg-white/10 border-white/20 text-gray-300 hover:text-white">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-wp-blue/20 to-wp-blue-light/20 border-wp-blue/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-wp-blue/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-eye text-wp-blue-light"></i>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {formatNumber(analyticsData.totalViews)}
                  </span>
                </div>
                <h3 className="text-wp-blue-light font-medium">Total Views</h3>
                <p className="text-sm text-gray-400">All time across all stories</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 border-emerald-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-emerald-400"></i>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {formatNumber(analyticsData.uniqueViews)}
                  </span>
                </div>
                <h3 className="text-emerald-400 font-medium">Unique Viewers</h3>
                <p className="text-sm text-gray-400">Individual users reached</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-400/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-orange-400"></i>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {formatDuration(analyticsData.avgTimeSpent)}
                  </span>
                </div>
                <h3 className="text-orange-400 font-medium">Avg. Time</h3>
                <p className="text-sm text-gray-400">Time spent per story</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-400/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-purple-400"></i>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {analyticsData.completionRate}%
                  </span>
                </div>
                <h3 className="text-purple-400 font-medium">Completion Rate</h3>
                <p className="text-sm text-gray-400">Stories read to the end</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="stories" className="text-gray-300 data-[state=active]:text-white">Story Performance</TabsTrigger>
              <TabsTrigger value="engagement" className="text-gray-300 data-[state=active]:text-white">Engagement</TabsTrigger>
              <TabsTrigger value="insights" className="text-gray-300 data-[state=active]:text-white">Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Views Chart */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Views Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-r from-wp-blue/10 to-emerald-500/10 rounded-lg border border-white/10 flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-chart-area text-wp-blue-light text-3xl mb-4"></i>
                        <p className="text-gray-400">Views: {analyticsData.chartData.views.join(', ')}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {analyticsData.chartData.labels.join(' • ')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Chart */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Engagement Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 rounded-lg border border-white/10 flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-heart text-emerald-400 text-3xl mb-4"></i>
                        <p className="text-gray-400">Engagement: {analyticsData.chartData.engagement.join('%, ')}%</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Average: {Math.round(analyticsData.chartData.engagement.reduce((a, b) => a + b, 0) / analyticsData.chartData.engagement.length)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-eye text-emerald-400"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Your story "JavaScript Tips" reached 1,000 views</p>
                        <p className="text-sm text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-wp-blue/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-share text-wp-blue-light"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Story "CSS Grid Guide" was shared 25 times</p>
                        <p className="text-sm text-gray-400">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-trophy text-purple-400"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">You reached 10,000 total story views milestone!</p>
                        <p className="text-sm text-gray-400">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Story Performance Tab */}
            <TabsContent value="stories" className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Top Performing Stories</CardTitle>
                    <Select value={selectedStory} onValueChange={setSelectedStory}>
                      <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="All stories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stories</SelectItem>
                        {analyticsData.topStories.map((story) => (
                          <SelectItem key={story.id} value={story.id}>
                            {story.title.substring(0, 30)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topStories.map((story, index) => (
                      <div key={story.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-wp-blue/20 to-wp-blue-light/20 rounded-lg flex items-center justify-center">
                              <span className="text-wp-blue-light font-bold">#{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white mb-2">{story.title}</h3>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-400">Views</p>
                                  <p className="text-white font-medium">{formatNumber(story.views)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Completion Rate</p>
                                  <p className="text-white font-medium">{story.completionRate}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Avg. Time</p>
                                  <p className="text-white font-medium">{formatDuration(story.avgTime)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-gray-300 hover:text-white">
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-gray-300 hover:text-white">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Engagement Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Story Completion Rate</span>
                        <span className="text-white font-medium">73%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '73%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Social Shares</span>
                        <span className="text-white font-medium">1.2K</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-wp-blue-light h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Return Visitors</span>
                        <span className="text-white font-medium">34%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-purple-400 h-2 rounded-full" style={{ width: '34%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <i className="fab fa-google text-wp-blue-light"></i>
                          <span className="text-white">Google Search</span>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          42%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-link text-orange-400"></i>
                          <span className="text-white">Direct</span>
                        </div>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          28%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <i className="fab fa-facebook text-blue-400"></i>
                          <span className="text-white">Social Media</span>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          18%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-external-link-alt text-purple-400"></i>
                          <span className="text-white">Referrals</span>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          12%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-chart-line text-emerald-400 mt-1"></i>
                        <div>
                          <h4 className="font-medium text-emerald-300 mb-1">Great Performance!</h4>
                          <p className="text-sm text-gray-300">Your stories are performing 23% better than the average.</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-wp-blue/10 border border-wp-blue/30 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-clock text-wp-blue-light mt-1"></i>
                        <div>
                          <h4 className="font-medium text-wp-blue-light mb-1">Optimal Timing</h4>
                          <p className="text-sm text-gray-300">Stories published on Tuesday get 15% more engagement.</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-mobile-alt text-orange-400 mt-1"></i>
                        <div>
                          <h4 className="font-medium text-orange-300 mb-1">Mobile Dominance</h4>
                          <p className="text-sm text-gray-300">87% of your views come from mobile devices.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-lightbulb text-yellow-400 mt-1"></i>
                        <div>
                          <h4 className="font-medium text-white mb-1">Increase Engagement</h4>
                          <p className="text-sm text-gray-300 mb-2">Add more interactive elements to keep readers engaged longer.</p>
                          <Button size="sm" className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30">
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-share-alt text-purple-400 mt-1"></i>
                        <div>
                          <h4 className="font-medium text-white mb-1">Boost Social Sharing</h4>
                          <p className="text-sm text-gray-300 mb-2">Add share prompts at the end of your stories.</p>
                          <Button size="sm" className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30">
                            Try Now
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-search text-emerald-400 mt-1"></i>
                        <div>
                          <h4 className="font-medium text-white mb-1">SEO Optimization</h4>
                          <p className="text-sm text-gray-300 mb-2">Optimize your story titles and descriptions for better discoverability.</p>
                          <Button size="sm" className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30">
                            Optimize
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style jsx>{`
        .wp-blue { color: #0073aa; }
        .wp-blue-light { color: #00a0d2; }
        .from-wp-blue { --tw-gradient-from: #0073aa; }
        .to-wp-blue-light { --tw-gradient-to: #00a0d2; }
        .border-wp-blue\\/30 { border-color: rgba(0, 115, 170, 0.3); }
        .bg-wp-blue\\/20 { background-color: rgba(0, 115, 170, 0.2); }
        .bg-wp-blue\\/10 { background-color: rgba(0, 115, 170, 0.1); }
        .text-wp-blue-light { color: #00a0d2; }
      `}</style>
    </div>
  );
}
