import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Type guard for user properties
  const typedUser = user as any;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/posts", label: "Posts", icon: "fas fa-file-alt" },
    { path: "/analytics", label: "Analytics", icon: "fas fa-chart-line" },
    { path: "/pricing", label: "Pricing", icon: "fas fa-tags" },
    { path: "/monetization", label: "Monetization", icon: "fas fa-dollar-sign" },
  ];

  const adminNavItems = [
    { path: "/admin", label: "Admin", icon: "fas fa-cog" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-wp-blue to-wp-blue-light rounded-lg flex items-center justify-center">
                <i className="fas fa-magic text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                StoryForge
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    location === item.path
                      ? "text-wp-blue-light"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </button>
              </Link>
            ))}
            {typedUser?.role === 'admin' && adminNavItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    location === item.path
                      ? "text-red-400"
                      : "text-gray-300 hover:text-red-400"
                  }`}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </button>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={typedUser?.profileImageUrl || ""} 
                      alt={typedUser?.firstName || "User"} 
                    />
                    <AvatarFallback className="bg-wp-blue text-white">
                      {typedUser?.firstName?.[0] || typedUser?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800/90 backdrop-blur-md border-white/20" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {typedUser?.firstName && (
                      <p className="font-medium text-white">
                        {typedUser.firstName} {typedUser.lastName}
                      </p>
                    )}
                    {typedUser?.email && (
                      <p className="w-[200px] truncate text-sm text-gray-300">
                        {typedUser.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                  <i className="fas fa-user mr-2"></i>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                  <i className="fas fa-cog mr-2"></i>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                  <i className="fas fa-question-circle mr-2"></i>
                  Help
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem 
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-white/20">
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`flex flex-col items-center space-y-1 text-xs transition-colors ${
                    location === item.path
                      ? "text-wp-blue-light"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
