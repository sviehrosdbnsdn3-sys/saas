import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/navigation";
import WordPressConnectionWizard from "@/components/wordpress-connection-wizard";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ["/api/wordpress/sites"],
    retry: false,
  });

  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["/api/stories"],
    retry: false,
  });

  const { data: creditBalance } = useQuery({
    queryKey: ["/api/credits/balance"],
    retry: false,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: realtimeMetrics } = useQuery({
    queryKey: ["/api/analytics/realtime"],
    retry: false,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-gray-400">Welcome back! Here's an overview of your WordPress to Web Stories journey.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30">
                <i className="fas fa-coins mr-2 text-yellow-400"></i>
                {creditBalance?.balance || 0} Credits
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link href="/pricing" className="text-white hover:text-white">
                  <i className="fas fa-plus mr-2"></i>
                  Buy Credits
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-wp-blue/20 to-wp-blue-light/20 border-wp-blue/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-wp-blue/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-globe text-wp-blue-light"></i>
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{stats?.connectedSites || 0}</span>
                  )}
                </div>
                <h3 className="text-wp-blue-light font-medium">Connected Sites</h3>
                <p className="text-sm text-gray-400">WordPress websites</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 border-emerald-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-book-open text-emerald-400"></i>
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{stats?.storiesCreated || 0}</span>
                  )}
                </div>
                <h3 className="text-emerald-400 font-medium">Stories Created</h3>
                <p className="text-sm text-gray-400">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-400/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-eye text-orange-400"></i>
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{stats?.totalViews?.toLocaleString() || '0'}</span>
                  )}
                </div>
                <h3 className="text-orange-400 font-medium">Total Views</h3>
                <p className="text-sm text-gray-400">All time</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-400/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-purple-400"></i>
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{Math.floor((stats?.avgEngagement || 0) / 60)}m</span>
                  )}
                </div>
                <h3 className="text-purple-400 font-medium">Avg. Time</h3>
                <p className="text-sm text-gray-400">Per story</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-pink-400/20 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-bar text-red-400"></i>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {realtimeMetrics?.length || 0}
                  </span>
                </div>
                <h3 className="text-red-400 font-medium">Live Events</h3>
                <p className="text-sm text-gray-400">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                    Real-time
                  </div>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* WordPress Connections */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">WordPress Connections</h3>
              <WordPressConnectionWizard />
            </div>

            {sitesLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sites && sites.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {sites.map((site: any) => (
                  <Card key={site.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-wp-blue to-wp-blue-light rounded-lg flex items-center justify-center">
                            <i className="fab fa-wordpress text-white text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{site.name}</h4>
                            <p className="text-sm text-gray-400">{new URL(site.url).hostname}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                          Connected
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Posts Available</span>
                          <span className="text-white">{site.postsCount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Stories Created</span>
                          <span className="text-white">{site.storiesCount || 0}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10 flex space-x-2">
                        <Link href="/posts" className="flex-1">
                          <Button className="w-full bg-wp-blue/20 border-wp-blue/30 text-wp-blue-light hover:bg-wp-blue/30">
                            View Posts
                          </Button>
                        </Link>
                        <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-gray-300 hover:text-white">
                          <i className="fas fa-cog"></i>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add new connection card */}
                <Card className="bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 hover:border-wp-blue/50 hover:bg-wp-blue/5 transition-all cursor-pointer group">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <div className="w-16 h-16 bg-wp-blue/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-wp-blue/30 transition-colors">
                      <i className="fas fa-plus text-wp-blue-light text-xl"></i>
                    </div>
                    <h4 className="font-medium text-white mb-2">Connect New Site</h4>
                    <p className="text-sm text-gray-400">Add your WordPress website to start creating stories</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-wp-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fab fa-wordpress text-wp-blue-light text-2xl"></i>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">No WordPress sites connected</h4>
                  <p className="text-gray-400 mb-6">Connect your first WordPress site to start creating Web Stories</p>
                  <WordPressConnectionWizard />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Stories */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Stories</h3>
              <div className="flex space-x-2">
                <Link href="/posts">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:shadow-lg">
                    <i className="fas fa-magic mr-2"></i>
                    Create Story
                  </Button>
                </Link>
              </div>
            </div>

            {storiesLoading ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : stories && stories.length > 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr className="text-left">
                          <th className="px-6 py-4 text-sm font-medium text-gray-300">Story</th>
                          <th className="px-6 py-4 text-sm font-medium text-gray-300">Status</th>
                          <th className="px-6 py-4 text-sm font-medium text-gray-300">Created</th>
                          <th className="px-6 py-4 text-sm font-medium text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {stories.slice(0, 5).map((story: any) => (
                          <tr key={story.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-wp-blue/20 to-wp-blue-light/20 rounded-lg flex items-center justify-center">
                                  <i className="fas fa-mobile-alt text-wp-blue-light"></i>
                                </div>
                                <div>
                                  <h4 className="font-medium text-white">{story.title}</h4>
                                  <p className="text-sm text-gray-400">{story.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge 
                                className={
                                  story.status === 'published' 
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                }
                              >
                                {story.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-400 text-sm">
                                {new Date(story.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <Link href={`/builder/${story.id}`}>
                                  <Button size="sm" className="bg-wp-blue/20 border-wp-blue/30 text-wp-blue-light hover:bg-wp-blue/30">
                                    <i className="fas fa-edit mr-1"></i>
                                    Edit
                                  </Button>
                                </Link>
                                <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-gray-300 hover:text-white">
                                  <i className="fas fa-eye"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-book-open text-emerald-400 text-2xl"></i>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">No stories created yet</h4>
                  <p className="text-gray-400 mb-6">Start by converting your WordPress posts into engaging Web Stories</p>
                  <Link href="/posts">
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:shadow-lg">
                      <i className="fas fa-magic mr-2"></i>
                      Create Your First Story
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .wp-blue { color: #0073aa; }
        .wp-blue-light { color: #00a0d2; }
        .from-wp-blue { --tw-gradient-from: #0073aa; }
        .to-wp-blue-light { --tw-gradient-to: #00a0d2; }
        .from-wp-blue-light { --tw-gradient-from: #00a0d2; }
        .to-wp-blue { --tw-gradient-to: #0073aa; }
        .border-wp-blue\\/30 { border-color: rgba(0, 115, 170, 0.3); }
        .bg-wp-blue\\/20 { background-color: rgba(0, 115, 170, 0.2); }
        .bg-wp-blue\\/30 { background-color: rgba(0, 115, 170, 0.3); }
        .text-wp-blue-light { color: #00a0d2; }
      `}</style>
    </div>
  );
}
