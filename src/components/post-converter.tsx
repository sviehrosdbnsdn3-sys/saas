import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface PostConverterProps {
  postIds: string[];
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function PostConverter({ 
  postIds, 
  trigger, 
  onSuccess 
}: PostConverterProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/story-templates"],
    retry: false,
  });

  const convertPostsMutation = useMutation({
    mutationFn: async ({ postId, templateId }: { postId: string; templateId: string }) => {
      const response = await apiRequest("POST", `/api/stories/convert/${postId}`, {
        templateId,
        customizations: {},
      });
      return await response.json();
    },
    onSuccess: (story) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      if (postIds.length === 1) {
        // Single post - redirect to story builder
        setLocation(`/builder/${story.id}`);
      } else {
        // Multiple posts - show success and stay on page
        toast({
          title: "Success",
          description: `Successfully converted ${postIds.length} posts to stories`,
        });
      }
      
      setOpen(false);
      onSuccess?.();
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
        description: "Failed to convert posts to stories",
        variant: "destructive",
      });
    },
  });

  const handleConvert = async () => {
    if (!selectedTemplateId) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const postId of postIds) {
        await convertPostsMutation.mutateAsync({ postId, templateId: selectedTemplateId });
      }
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-slate-800/95 backdrop-blur-md border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Convert {postIds.length === 1 ? 'Post' : `${postIds.length} Posts`} to Web {postIds.length === 1 ? 'Story' : 'Stories'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-400">
              Choose a template to convert your {postIds.length === 1 ? 'post' : 'posts'} into engaging Web {postIds.length === 1 ? 'Story' : 'Stories'}
            </p>
          </div>

          {/* Template Selection */}
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates?.map((template: any) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedTemplateId === template.id
                      ? "border-wp-blue bg-wp-blue/10"
                      : "bg-white/5 border-white/10 hover:border-white/30"
                  }`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <CardContent className="p-6">
                    {/* Template Preview */}
                    <div className="aspect-[9/16] bg-gradient-to-br from-wp-blue/20 to-wp-blue-light/20 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                      {/* Mock story preview based on template config */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: template.config?.backgroundColor || 'linear-gradient(135deg, #0073aa, #00a0d2)',
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between p-4 text-white">
                          <div className="space-y-2">
                            <div className="h-4 bg-white/30 rounded w-3/4"></div>
                            <div className="h-3 bg-white/20 rounded w-1/2"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-white/30 rounded w-full"></div>
                            <div className="h-3 bg-white/20 rounded w-4/5"></div>
                            <div className="h-2 bg-white/10 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                      {selectedTemplateId === template.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-wp-blue rounded-full flex items-center justify-center">
                          <i className="fas fa-check text-white text-xs"></i>
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">{template.name}</h3>
                        <Badge className="bg-wp-blue/20 text-wp-blue-light border-wp-blue/30">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{template.description}</p>
                    </div>

                    {/* Template Features */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <i className="fas fa-palette"></i>
                        <span>Custom colors</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <i className="fas fa-magic"></i>
                        <span>Animations</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <i className="fas fa-mobile-alt"></i>
                        <span>Mobile optimized</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Conversion Options */}
          {selectedTemplateId && (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Conversion Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-300">Features Included:</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center">
                        <i className="fas fa-check text-emerald-400 mr-2"></i>
                        Auto-generated slides from content
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-emerald-400 mr-2"></i>
                        SEO-optimized metadata
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-emerald-400 mr-2"></i>
                        Mobile-first responsive design
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-emerald-400 mr-2"></i>
                        Social media sharing
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-300">Estimated Output:</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center">
                        <i className="fas fa-layer-group text-wp-blue-light mr-2"></i>
                        5-10 slides per story
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-clock text-wp-blue-light mr-2"></i>
                        3-5 second slide duration
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-mobile-alt text-wp-blue-light mr-2"></i>
                        AMP-compliant format
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-search text-wp-blue-light mr-2"></i>
                        Google-indexable
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="bg-white/10 border-white/20 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              disabled={!selectedTemplateId || convertPostsMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:shadow-lg"
            >
              {convertPostsMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Converting...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Convert {postIds.length === 1 ? 'Post' : `${postIds.length} Posts`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
