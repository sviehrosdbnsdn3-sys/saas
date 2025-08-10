import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-wp-blue to-wp-blue-light rounded-lg flex items-center justify-center">
                <i className="fas fa-magic text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">StoryForge</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleLogin}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-gradient-to-r from-wp-blue to-wp-blue-light hover:shadow-lg transition-all"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <i className="fas fa-rocket text-emerald-400"></i>
            <span className="text-sm text-gray-300">Transform your WordPress content instantly</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Convert WordPress Posts to
            <span className="bg-gradient-to-r from-wp-blue-light to-wp-blue bg-clip-text text-transparent"> Web Stories</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Automatically transform your WordPress blog posts into engaging Google Web Stories with AI-powered content optimization, customizable templates, and seamless publishing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-wp-blue to-wp-blue-light hover:shadow-2xl hover:scale-105 transition-all text-lg px-8 py-4"
            >
              <i className="fas fa-play mr-2"></i>
              Start Converting
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all text-lg px-8 py-4"
            >
              <i className="fas fa-video mr-2"></i>
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Everything you need to create stunning Web Stories
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From WordPress integration to AI-powered optimization, StoryForge provides all the tools you need to transform your content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* WordPress Integration */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-wp-blue to-wp-blue-light rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fab fa-wordpress text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">WordPress Integration</h3>
                <p className="text-gray-400 mb-6">Seamlessly connect multiple WordPress sites using REST API, OAuth2, or direct credentials with automatic health monitoring.</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Multi-site management</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Real-time sync</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Connection validation</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI-Powered Conversion */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-robot text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Conversion</h3>
                <p className="text-gray-400 mb-6">Automatically optimize content for Web Stories with AI text summarization, SEO optimization, and smart slide segmentation.</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Content optimization</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> SEO enhancement</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Auto slide creation</li>
                </ul>
              </CardContent>
            </Card>

            {/* Template Library */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-palette text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Template Library</h3>
                <p className="text-gray-400 mb-6">Choose from dozens of professionally designed templates with customizable layouts, animations, and styling options.</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> 50+ templates</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Custom animations</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Brand customization</li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics & Performance */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-chart-line text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Analytics & Performance</h3>
                <p className="text-gray-400 mb-6">Track story performance with detailed analytics, view time, engagement metrics, and Google Analytics integration.</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Real-time analytics</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Engagement tracking</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Performance insights</li>
                </ul>
              </CardContent>
            </Card>

            {/* SEO Optimization */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-search text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">SEO Optimization</h3>
                <p className="text-gray-400 mb-6">Automatically generate SEO-optimized metadata, structured data, and social media previews for maximum discoverability.</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Auto meta tags</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Schema markup</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Social previews</li>
                </ul>
              </CardContent>
            </Card>

            {/* Bulk Operations */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-layer-group text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Bulk Operations</h3>
                <p className="text-gray-400 mb-6">Convert multiple posts simultaneously with batch processing, scheduled publishing, and automated workflows.</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Batch conversion</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Scheduled publishing</li>
                  <li className="flex items-center"><i className="fas fa-check text-emerald-400 mr-2"></i> Automation workflows</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-wp-blue/10 via-wp-blue-light/10 to-emerald-500/10 border-wp-blue/20">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to transform your WordPress content?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of content creators who are already using StoryForge to create engaging Web Stories from their WordPress posts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="bg-gradient-to-r from-wp-blue to-wp-blue-light hover:shadow-2xl hover:scale-105 transition-all text-lg px-8 py-4"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Start Free Trial
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all text-lg px-8 py-4"
                >
                  <i className="fas fa-calendar mr-2"></i>
                  Book Demo
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-wp-blue to-wp-blue-light rounded-lg flex items-center justify-center">
                  <i className="fas fa-magic text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">StoryForge</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">Transform your WordPress content into engaging Google Web Stories with AI-powered optimization and beautiful templates.</p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0 bg-white/10 hover:bg-white/20">
                  <i className="fab fa-twitter text-gray-300"></i>
                </Button>
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0 bg-white/10 hover:bg-white/20">
                  <i className="fab fa-github text-gray-300"></i>
                </Button>
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0 bg-white/10 hover:bg-white/20">
                  <i className="fab fa-linkedin text-gray-300"></i>
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 StoryForge. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .wp-blue { color: #0073aa; }
        .wp-blue-light { color: #00a0d2; }
        .from-wp-blue { --tw-gradient-from: #0073aa; }
        .to-wp-blue-light { --tw-gradient-to: #00a0d2; }
        .from-wp-blue-light { --tw-gradient-from: #00a0d2; }
        .to-wp-blue { --tw-gradient-to: #0073aa; }
        .border-wp-blue\\/20 { border-color: rgba(0, 115, 170, 0.2); }
        .border-wp-blue\\/30 { border-color: rgba(0, 115, 170, 0.3); }
        .from-wp-blue\\/10 { --tw-gradient-from: rgba(0, 115, 170, 0.1); }
        .via-wp-blue-light\\/10 { --tw-gradient-via: rgba(0, 160, 210, 0.1); }
      `}</style>
    </div>
  );
}
