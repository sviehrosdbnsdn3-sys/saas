import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface StoryTemplatesProps {
  selectedTemplateId?: string;
  onTemplateSelect?: (templateId: string) => void;
  className?: string;
}

export default function StoryTemplates({ 
  selectedTemplateId, 
  onTemplateSelect,
  className = "" 
}: StoryTemplatesProps) {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/story-templates"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <Skeleton className="aspect-[9/16] w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-3" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-palette text-purple-400 text-2xl"></i>
          </div>
          <h4 className="text-lg font-medium text-white mb-2">No templates available</h4>
          <p className="text-gray-400">Templates are being loaded...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {templates.map((template: any) => (
        <Card
          key={template.id}
          className={`cursor-pointer transition-all border-2 group ${
            selectedTemplateId === template.id
              ? "border-wp-blue bg-wp-blue/10 scale-105"
              : "bg-white/5 border-white/10 hover:border-white/30 hover:scale-102"
          } ${onTemplateSelect ? "cursor-pointer" : ""}`}
          onClick={() => onTemplateSelect?.(template.id)}
        >
          <CardContent className="p-6">
            {/* Template Preview */}
            <div className="aspect-[9/16] rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
              <div 
                className="absolute inset-0"
                style={{
                  background: template.config?.backgroundColor || 'linear-gradient(135deg, #0073aa, #00a0d2)',
                }}
              >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 h-full flex flex-col justify-between p-4 text-white">
                  {/* Title area */}
                  <div className="space-y-2">
                    <div 
                      className="h-4 bg-white/40 rounded"
                      style={{ 
                        width: '75%',
                        fontFamily: template.config?.fontFamily || 'Inter'
                      }}
                    ></div>
                    <div className="h-3 bg-white/30 rounded w-1/2"></div>
                  </div>
                  
                  {/* Content area */}
                  <div className="space-y-2">
                    <div className="h-3 bg-white/30 rounded w-full"></div>
                    <div className="h-3 bg-white/25 rounded w-4/5"></div>
                    <div className="h-2 bg-white/20 rounded w-2/3"></div>
                  </div>
                  
                  {/* CTA area */}
                  <div className="text-center">
                    <div 
                      className="h-8 bg-white/30 rounded-lg mx-auto"
                      style={{ 
                        width: '60%',
                        backgroundColor: template.config?.accentColor || 'rgba(255,255,255,0.3)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-wp-blue rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <i className="fas fa-eye text-white"></i>
                </div>
              </div>
            </div>

            {/* Template Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white group-hover:text-wp-blue-light transition-colors">
                  {template.name}
                </h3>
                <Badge className="bg-wp-blue/20 text-wp-blue-light border-wp-blue/30">
                  {template.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
            </div>

            {/* Template Features */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <i className="fas fa-palette text-wp-blue-light"></i>
                <span>Custom styling</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <i className="fas fa-magic text-emerald-400"></i>
                <span>
                  {template.config?.animations?.length || 0} animations
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <i className="fas fa-mobile-alt text-purple-400"></i>
                <span>Mobile optimized</span>
              </div>
              {template.config?.fontFamily && (
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <i className="fas fa-font text-orange-400"></i>
                  <span>{template.config.fontFamily}</span>
                </div>
              )}
            </div>

            {/* Usage Stats (mock) */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <i className="fas fa-heart"></i>
                <span>{Math.floor(Math.random() * 100) + 50}</span>
              </span>
              <span className="flex items-center space-x-1">
                <i className="fas fa-download"></i>
                <span>{Math.floor(Math.random() * 1000) + 200}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
