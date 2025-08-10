import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/navigation";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function StoryBuilder() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

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

  const { data: story, isLoading: storyLoading } = useQuery({
    queryKey: ["/api/stories", id],
    retry: false,
    enabled: !!id,
  });

  const updateStoryMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PUT", `/api/stories/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories", id] });
      toast({
        title: "Success",
        description: "Story updated successfully",
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
        description: "Failed to update story",
        variant: "destructive",
      });
    },
  });

  const publishStoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/stories/${id}`, {
        status: "published",
        publishedAt: new Date().toISOString(),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories", id] });
      toast({
        title: "Success",
        description: "Story published successfully",
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
        description: "Failed to publish story",
        variant: "destructive",
      });
    },
  });

  const currentSlide = story?.slides?.[currentSlideIndex];

  const updateSlide = (slideIndex: number, updates: any) => {
    if (!story) return;
    
    const updatedSlides = [...story.slides];
    updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], ...updates };
    
    updateStoryMutation.mutate({ slides: updatedSlides });
  };

  const updateSlideContent = (content: any) => {
    updateSlide(currentSlideIndex, { content });
  };

  const updateSlideStyle = (style: any) => {
    updateSlide(currentSlideIndex, { 
      style: { ...currentSlide.style, ...style }
    });
  };

  const addNewSlide = () => {
    if (!story) return;

    const newSlide = {
      id: String(story.slides.length + 1),
      type: 'content',
      content: {
        title: 'New Slide',
        text: 'Add your content here...',
      },
      style: {
        backgroundColor: 'linear-gradient(135deg, #0073aa, #00a0d2)',
        textColor: '#ffffff',
        fontFamily: 'Inter',
        animation: 'fade',
        duration: 4,
      }
    };

    const updatedSlides = [...story.slides, newSlide];
    updateStoryMutation.mutate({ slides: updatedSlides });
  };

  const deleteSlide = (slideIndex: number) => {
    if (!story || story.slides.length <= 1) return;

    const updatedSlides = story.slides.filter((_: any, index: number) => index !== slideIndex);
    
    // Adjust current slide index if necessary
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1);
    }

    updateStoryMutation.mutate({ slides: updatedSlides });
  };

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  if (storyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Navigation />
        <div className="pt-20 px-6">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-64 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Navigation />
        <div className="pt-20 px-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
                </div>
                <h4 className="text-lg font-medium text-white mb-2">Story not found</h4>
                <p className="text-gray-400 mb-6">The story you're looking for doesn't exist or you don't have access to it.</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-wp-blue to-wp-blue-light hover:shadow-lg">
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
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
                Story Builder
              </h1>
              <div className="flex items-center space-x-4">
                <p className="text-gray-400">{story.title}</p>
                <Badge 
                  className={
                    story.status === 'published'
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  }
                >
                  {story.status}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => updateStoryMutation.mutate({ status: 'draft' })}
                disabled={updateStoryMutation.isPending}
                className="bg-wp-blue/20 border border-wp-blue/30 text-wp-blue-light hover:bg-wp-blue/30"
              >
                <i className="fas fa-save mr-2"></i>
                Save Draft
              </Button>
              <Button 
                onClick={() => {}}
                variant="outline"
                className="bg-white/10 border-white/20 text-gray-300 hover:text-white"
              >
                <i className="fas fa-eye mr-2"></i>
                Preview
              </Button>
              <Button
                onClick={() => publishStoryMutation.mutate()}
                disabled={publishStoryMutation.isPending}
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:shadow-lg"
              >
                {publishStoryMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Publishing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      Slide {currentSlideIndex + 1} of {story.slides?.length || 0}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className="w-8 h-8 p-0 bg-white/10 border-white/20"
                    >
                      <i className="fas fa-chevron-left text-xs"></i>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentSlideIndex(Math.min(story.slides.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === story.slides.length - 1}
                      className="w-8 h-8 p-0 bg-white/10 border-white/20"
                    >
                      <i className="fas fa-chevron-right text-xs"></i>
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={addNewSlide}
                    className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Add Slide
                  </Button>
                  {story.slides.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSlide(currentSlideIndex)}
                      className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Canvas Area */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-900 border-white/20">
                <CardContent className="p-8 flex items-center justify-center min-h-96">
                  {currentSlide && (
                    <div className="w-full max-w-xs mx-auto">
                      {/* Mobile Story Preview */}
                      <div 
                        className="rounded-2xl p-8 text-center aspect-[9/16] relative overflow-hidden"
                        style={{
                          background: currentSlide.style?.backgroundColor || 'linear-gradient(135deg, #0073aa, #00a0d2)',
                          color: currentSlide.style?.textColor || '#ffffff',
                          fontFamily: currentSlide.style?.fontFamily || 'Inter',
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          {currentSlide.type === 'title' && (
                            <div className="space-y-4 flex-1 flex flex-col justify-center">
                              <h1 className="text-xl font-bold leading-tight">
                                {currentSlide.content?.title || 'Title'}
                              </h1>
                              {currentSlide.content?.subtitle && (
                                <p className="text-sm opacity-90">
                                  {currentSlide.content.subtitle}
                                </p>
                              )}
                            </div>
                          )}

                          {currentSlide.type === 'content' && (
                            <div className="space-y-4 flex-1 flex flex-col justify-center">
                              {currentSlide.content?.title && (
                                <h2 className="text-lg font-bold leading-tight">
                                  {currentSlide.content.title}
                                </h2>
                              )}
                              {currentSlide.content?.text && (
                                <div className="bg-white/20 rounded-lg p-3">
                                  <p className="text-xs leading-relaxed">
                                    {currentSlide.content.text}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {currentSlide.type === 'cta' && (
                            <div className="space-y-4 flex-1 flex flex-col justify-center">
                              <h2 className="text-lg font-bold">
                                {currentSlide.content?.title || 'Call to Action'}
                              </h2>
                              {currentSlide.content?.subtitle && (
                                <p className="text-sm opacity-90">
                                  {currentSlide.content.subtitle}
                                </p>
                              )}
                              <div className="bg-white/30 rounded-lg py-2 px-4 inline-block">
                                <span className="text-sm font-medium">
                                  {currentSlide.content?.buttonText || 'Learn More'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Progress indicator */}
                          <div className="flex justify-center space-x-1 mt-4">
                            {story.slides.map((_: any, index: number) => (
                              <div
                                key={index}
                                className={`h-1 rounded-full transition-all ${
                                  index === currentSlideIndex 
                                    ? 'w-8 bg-white' 
                                    : 'w-2 bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Slide Timeline */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {story.slides?.map((slide: any, index: number) => (
                      <div
                        key={slide.id}
                        className={`min-w-24 h-32 rounded-lg border-2 cursor-pointer transition-all ${
                          index === currentSlideIndex
                            ? "border-wp-blue bg-wp-blue/10"
                            : "border-white/20 hover:border-white/40"
                        }`}
                        onClick={() => setCurrentSlideIndex(index)}
                      >
                        <div 
                          className="w-full h-full rounded-lg p-2 text-xs text-white flex flex-col justify-between"
                          style={{
                            background: slide.style?.backgroundColor || 'linear-gradient(135deg, #0073aa, #00a0d2)',
                          }}
                        >
                          <div className="truncate">
                            {slide.content?.title || `Slide ${index + 1}`}
                          </div>
                          <div className="text-center opacity-75">
                            {slide.type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel */}
            <div className="space-y-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/10">
                  <TabsTrigger value="content" className="text-gray-300 data-[state=active]:text-white">Content</TabsTrigger>
                  <TabsTrigger value="style" className="text-gray-300 data-[state=active]:text-white">Style</TabsTrigger>
                  <TabsTrigger value="animation" className="text-gray-300 data-[state=active]:text-white">Animation</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-white">Content</h3>
                      
                      {currentSlide?.type === 'title' && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300">Title</Label>
                            <Input
                              value={currentSlide.content?.title || ''}
                              onChange={(e) => updateSlideContent({ 
                                ...currentSlide.content, 
                                title: e.target.value 
                              })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Subtitle</Label>
                            <Textarea
                              value={currentSlide.content?.subtitle || ''}
                              onChange={(e) => updateSlideContent({ 
                                ...currentSlide.content, 
                                subtitle: e.target.value 
                              })}
                              className="bg-white/10 border-white/20 text-white"
                              rows={3}
                            />
                          </div>
                        </div>
                      )}

                      {currentSlide?.type === 'content' && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300">Title</Label>
                            <Input
                              value={currentSlide.content?.title || ''}
                              onChange={(e) => updateSlideContent({ 
                                ...currentSlide.content, 
                                title: e.target.value 
                              })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Content</Label>
                            <Textarea
                              value={currentSlide.content?.text || ''}
                              onChange={(e) => updateSlideContent({ 
                                ...currentSlide.content, 
                                text: e.target.value 
                              })}
                              className="bg-white/10 border-white/20 text-white"
                              rows={5}
                            />
                          </div>
                        </div>
                      )}

                      {currentSlide?.type === 'cta' && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300">Title</Label>
                            <Input
                              value={currentSlide.content?.title || ''}
                              onChange={(e) => updateSlideContent({ 
                                ...currentSlide.content, 
                                title: e.target.value 
                              })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Subtitle</Label>
                            <Textarea
                              value={currentSlide.content?.subtitle || ''}
                              onChange={(e) => updateSlideContent({ 
                                ...currentSlide.content, 
                                subtitle: e.target.value 
                              })}
                              className="bg-white/10 border-white/20 text-white"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Button Text</Label>
                            <Input
                              value={currentSlide.content?.buttonText || ''}
                              onChange={(e) => updateSlideContent({ 
                                ...currentSlide.content, 
                                buttonText: e.target.value 
                              })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Button URL</Label>
                            <Input
                              value={currentSlide.content?.buttonUrl || ''}
                              onChange={(e) => updateSlideContent({ 
                                ...currentSlide.content, 
                                buttonUrl: e.target.value 
                              })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Style Tab */}
                <TabsContent value="style" className="space-y-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-white">Style</h3>
                      
                      <div>
                        <Label className="text-gray-300 mb-2 block">Background</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            'linear-gradient(135deg, #0073aa, #00a0d2)',
                            'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            'linear-gradient(135deg, #10b981, #3b82f6)',
                            'linear-gradient(135deg, #f59e0b, #ef4444)',
                            'linear-gradient(135deg, #1f2937, #374151)',
                            'linear-gradient(135deg, #7c3aed, #2563eb)',
                          ].map((bg, index) => (
                            <div
                              key={index}
                              className={`w-full h-12 rounded border-2 cursor-pointer ${
                                currentSlide?.style?.backgroundColor === bg
                                  ? 'border-white'
                                  : 'border-white/20'
                              }`}
                              style={{ background: bg }}
                              onClick={() => updateSlideStyle({ backgroundColor: bg })}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300">Font Family</Label>
                        <Select 
                          value={currentSlide?.style?.fontFamily || 'Inter'}
                          onValueChange={(value) => updateSlideStyle({ fontFamily: value })}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-2 block">Text Color</Label>
                        <div className="flex space-x-2">
                          {['#ffffff', '#000000', '#0073aa', '#00a0d2', '#10b981', '#f59e0b'].map((color) => (
                            <div
                              key={color}
                              className={`w-8 h-8 rounded border-2 cursor-pointer ${
                                currentSlide?.style?.textColor === color
                                  ? 'border-white'
                                  : 'border-white/20'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateSlideStyle({ textColor: color })}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Animation Tab */}
                <TabsContent value="animation" className="space-y-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-white">Animation</h3>
                      
                      <div>
                        <Label className="text-gray-300">Animation Type</Label>
                        <Select 
                          value={currentSlide?.style?.animation || 'fade'}
                          onValueChange={(value) => updateSlideStyle({ animation: value })}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fade">Fade In</SelectItem>
                            <SelectItem value="slide">Slide Up</SelectItem>
                            <SelectItem value="zoom">Zoom In</SelectItem>
                            <SelectItem value="typewriter">Typewriter</SelectItem>
                            <SelectItem value="bounce">Bounce</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-2 block">
                          Duration: {currentSlide?.style?.duration || 4}s
                        </Label>
                        <Slider
                          value={[currentSlide?.style?.duration || 4]}
                          onValueChange={([value]) => updateSlideStyle({ duration: value })}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>1s</span>
                          <span>10s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Quick Actions */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      onClick={addNewSlide}
                      className="w-full bg-white/10 border border-white/20 text-left hover:bg-white/20 justify-start"
                    >
                      <i className="fas fa-plus text-emerald-400 mr-3"></i>
                      <span className="text-white">Add Slide</span>
                    </Button>
                    <Button 
                      onClick={() => {
                        const duplicatedSlide = { 
                          ...currentSlide, 
                          id: String(story.slides.length + 1)
                        };
                        const updatedSlides = [...story.slides, duplicatedSlide];
                        updateStoryMutation.mutate({ slides: updatedSlides });
                      }}
                      className="w-full bg-white/10 border border-white/20 text-left hover:bg-white/20 justify-start"
                    >
                      <i className="fas fa-copy text-wp-blue-light mr-3"></i>
                      <span className="text-white">Duplicate Slide</span>
                    </Button>
                    {story.slides.length > 1 && (
                      <Button 
                        onClick={() => deleteSlide(currentSlideIndex)}
                        className="w-full bg-white/10 border border-white/20 text-left hover:bg-white/20 justify-start"
                      >
                        <i className="fas fa-trash text-red-400 mr-3"></i>
                        <span className="text-white">Delete Slide</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
