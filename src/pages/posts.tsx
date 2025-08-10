import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/navigation";
import PostConverter from "@/components/post-converter";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function Posts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSite, setFilterSite] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

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

  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ["/api/wordpress/sites"],
    retry: false,
  });

  const { data: allPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/wordpress/posts"],
    queryFn: async () => {
      if (!sites || sites.length === 0) return [];
      
      const allPosts = [];
      for (const site of sites) {
        try {
          const posts = await fetch(`/api/wordpress/sites/${site.id}/posts`, {
            credentials: "include",
          }).then(res => res.json());
          
          allPosts.push(...posts.map((post: any) => ({ ...post, siteName: site.name })));
        } catch (error) {
          console.error(`Failed to fetch posts for site ${site.name}:`, error);
        }
      }
      return allPosts;
    },
    enabled: !!sites && sites.length > 0,
    retry: false,
  });

  const syncPostsMutation = useMutation({
    mutationFn: async (siteId: string) => {
      const response = await apiRequest("POST", `/api/wordpress/sites/${siteId}/sync`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wordpress/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wordpress/sites"] });
      toast({
        title: "Success",
        description: "Posts synced successfully",
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
        description: "Failed to sync posts",
        variant: "destructive",
      });
    },
  });

  // Filter posts based on search and filters
  const filteredPosts = allPosts?.filter((post: any) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = filterSite === "all" || post.siteId === filterSite;
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    
    return matchesSearch && matchesSite && matchesStatus;
  }) || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(filteredPosts.map((post: any) => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts([...selectedPosts, postId]);
    } else {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    }
  };

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                WordPress Posts
              </h1>
              <p className="text-gray-400">Select posts to convert into engaging Web Stories</p>
            </div>
            <div className="flex space-x-3">
              {selectedPosts.length > 0 && (
                <PostConverter
                  postIds={selectedPosts}
                  onSuccess={() => setSelectedPosts([])}
                  trigger={
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:shadow-lg">
                      <i className="fas fa-magic mr-2"></i>
                      Convert Selected ({selectedPosts.length})
                    </Button>
                  }
                />
              )}
              <Link href="/">
                <Button variant="outline" className="bg-white/10 border-white/20 text-gray-300 hover:text-white">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Search Posts</label>
                  <Input
                    placeholder="Search by title or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Site</label>
                  <Select value={filterSite} onValueChange={setFilterSite}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All sites" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      {sites?.map((site: any) => (
                        <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setFilterSite("all");
                      setFilterStatus("all");
                    }}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-gray-300 hover:text-white"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Site Sync Actions */}
          {sites && sites.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Sync Posts</h3>
                    <p className="text-gray-400">Sync latest posts from your WordPress sites</p>
                  </div>
                  <div className="flex space-x-2">
                    {sites.map((site: any) => (
                      <Button
                        key={site.id}
                        onClick={() => syncPostsMutation.mutate(site.id)}
                        disabled={syncPostsMutation.isPending}
                        className="bg-wp-blue/20 border-wp-blue/30 text-wp-blue-light hover:bg-wp-blue/30"
                      >
                        {syncPostsMutation.isPending ? (
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                          <i className="fas fa-sync mr-2"></i>
                        )}
                        Sync {site.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts Table */}
          {postsLoading || sitesLoading ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ) : filteredPosts.length > 0 ? (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr className="text-left">
                        <th className="px-6 py-4 text-sm font-medium text-gray-300">
                          <Checkbox
                            checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                            onCheckedChange={handleSelectAll}
                            className="border-white/20"
                          />
                        </th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-300">Post</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-300">Site</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-300">Status</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-300">Published</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredPosts.map((post: any) => (
                        <tr key={post.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <Checkbox
                              checked={selectedPosts.includes(post.id)}
                              onCheckedChange={(checked) => handleSelectPost(post.id, checked as boolean)}
                              className="border-white/20"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {post.featuredImage ? (
                                <img 
                                  src={post.featuredImage} 
                                  alt="Featured" 
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-wp-blue/20 to-wp-blue-light/20 rounded-lg flex items-center justify-center">
                                  <i className="fas fa-file-alt text-wp-blue-light"></i>
                                </div>
                              )}
                              <div>
                                <h4 className="font-medium text-white">{post.title}</h4>
                                <p className="text-sm text-gray-400 max-w-md truncate">
                                  {post.excerpt || "No excerpt available"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300">{post.siteName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              className={
                                post.status === 'published' 
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : post.status === 'draft'
                                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              }
                            >
                              {post.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-400 text-sm">
                              {post.publishedAt 
                                ? new Date(post.publishedAt).toLocaleDateString()
                                : 'Not published'
                              }
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <PostConverter
                                postIds={[post.id]}
                                trigger={
                                  <Button size="sm" className="bg-wp-blue/20 border-wp-blue/30 text-wp-blue-light hover:bg-wp-blue/30">
                                    <i className="fas fa-magic mr-1"></i>
                                    Convert
                                  </Button>
                                }
                              />
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-white/10 border-white/20 text-gray-300 hover:text-white"
                              >
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
          ) : sites && sites.length > 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-wp-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-alt text-wp-blue-light text-2xl"></i>
                </div>
                <h4 className="text-lg font-medium text-white mb-2">No posts found</h4>
                <p className="text-gray-400 mb-6">
                  {searchTerm || filterSite !== "all" || filterStatus !== "all" 
                    ? "Try adjusting your filters or search terms"
                    : "Sync your WordPress sites to see posts here"
                  }
                </p>
                {(!searchTerm && filterSite === "all" && filterStatus === "all") && (
                  <div className="flex justify-center space-x-2">
                    {sites.map((site: any) => (
                      <Button
                        key={site.id}
                        onClick={() => syncPostsMutation.mutate(site.id)}
                        disabled={syncPostsMutation.isPending}
                        className="bg-wp-blue/20 border-wp-blue/30 text-wp-blue-light hover:bg-wp-blue/30"
                      >
                        {syncPostsMutation.isPending ? (
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                          <i className="fas fa-sync mr-2"></i>
                        )}
                        Sync {site.name}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-wp-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fab fa-wordpress text-wp-blue-light text-2xl"></i>
                </div>
                <h4 className="text-lg font-medium text-white mb-2">No WordPress sites connected</h4>
                <p className="text-gray-400 mb-6">Connect your WordPress sites first to see and convert posts</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-wp-blue to-wp-blue-light hover:shadow-lg">
                    <i className="fas fa-plus mr-2"></i>
                    Connect WordPress Site
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style jsx>{`
        .wp-blue { color: #0073aa; }
        .wp-blue-light { color: #00a0d2; }
        .from-wp-blue { --tw-gradient-from: #0073aa; }
        .to-wp-blue-light { --tw-gradient-to: #00a0d2; }
        .border-wp-blue\\/30 { border-color: rgba(0, 115, 170, 0.3); }
        .bg-wp-blue\\/20 { background-color: rgba(0, 115, 170, 0.2); }
        .bg-wp-blue\\/30 { background-color: rgba(0, 115, 170, 0.3); }
        .text-wp-blue-light { color: #00a0d2; }
      `}</style>
    </div>
  );
}
