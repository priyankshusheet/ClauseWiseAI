import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { 
  Home, 
  Upload, 
  MessageCircle, 
  BookOpen, 
  Moon, 
  Sun, 
  History, 
  LogOut,
  Menu,
  FolderOpen,
  GitCompare,
  Settings,
  Download
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { tapFeedback, toggleFeedback, navFeedback, successFeedback } from '@/utils/haptics';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const { canInstall, isInstalled, install } = usePWAInstall();

  const handleNavigation = (href: string) => {
    navFeedback();
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    tapFeedback();
    await signOut();
    navigate('/');
  };

  const handleInstall = async () => {
    tapFeedback();
    const accepted = await install();
    if (accepted) {
      successFeedback();
    }
  };

  const handleToggleTheme = () => {
    toggleFeedback();
    toggleTheme();
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  // Public nav items - core features always visible
  const publicNavItems = [
    { name: 'Home', href: '/', icon: Home, isRoute: true },
    { name: 'AI Chat', href: '/chat', icon: MessageCircle, isRoute: true },
    { name: 'Upload', href: '/upload', icon: Upload, isRoute: true },
    { name: 'Learn', href: '/learn', icon: BookOpen, isRoute: true },
  ];

  // Auth-only nav items - feature pages
  const authNavItems = [
    { name: 'Portfolio', href: '/portfolio', icon: FolderOpen, isRoute: true },
    { name: 'Compare', href: '/compare', icon: GitCompare, isRoute: true },
    { name: 'History', href: '/history', icon: History, isRoute: true },
  ];

  const visibleNavItems = user 
    ? [...publicNavItems, ...authNavItems]
    : publicNavItems;

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-lg border-b border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group" onClick={() => navFeedback()}>
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <span className="text-primary-foreground font-bold text-sm">CW</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">ClauseWise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {publicNavItems.map((item) => (
              item.isRoute ? (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => navFeedback()}
                  className={`text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 flex items-center space-x-1.5 group py-2 ${
                    location.pathname === item.href ? 'text-primary' : ''
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="relative">
                    {item.name}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${
                      location.pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </span>
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 flex items-center space-x-1.5 group py-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="group-hover:underline">{item.name}</span>
                </button>
              )
            ))}
            
            {/* Dark Mode Toggle - Prominent Icon Button */}
            <button
              onClick={handleToggleTheme}
              className="relative ml-2 p-2 rounded-full bg-muted hover:bg-accent/20 border border-border transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <Sun className={`h-4 w-4 text-accent transition-all duration-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
              <Moon className={`h-4 w-4 text-primary transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
            </button>
          </div>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {/* PWA Install Button - Always show on desktop when available */}
            {canInstall && !isInstalled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstall}
                className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </Button>
            )}
            {isInstalled && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Download className="w-3 h-3 text-secondary" />
                Installed
              </span>
            )}
            {loading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded-lg" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2" onClick={() => tapFeedback()}>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                      {user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => { navFeedback(); navigate('/history'); }}>
                    <History className="w-4 h-4 mr-2" />
                    Analysis History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navFeedback(); navigate('/portfolio'); }}>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navFeedback(); navigate('/settings'); }}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth" onClick={() => navFeedback()}>
                  <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/5">
                    Sign In
                  </Button>
                </Link>
                <Link to="/upload" onClick={() => navFeedback()}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md">
                    Try Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => tapFeedback()}>
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <div className="flex flex-col space-y-2 mt-8">
                {/* User info on mobile */}
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">Signed in</p>
                    </div>
                  </div>
                )}

                {visibleNavItems.map((item) => (
                  item.isRoute ? (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => { navFeedback(); setIsOpen(false); }}
                      className={`flex items-center space-x-3 text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 py-3 px-2 rounded-lg hover:bg-muted ${
                        location.pathname === item.href ? 'text-primary bg-primary/5' : ''
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="flex items-center space-x-3 text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 py-3 px-2 rounded-lg hover:bg-muted text-left"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                ))}

                {/* Install App Button */}
                {canInstall && (
                  <button
                    onClick={handleInstall}
                    className="flex items-center space-x-3 text-primary font-medium transition-colors duration-200 py-3 px-2 rounded-lg hover:bg-primary/10 border border-primary/20 mt-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Install App</span>
                  </button>
                )}
                {isInstalled && (
                  <div className="flex items-center space-x-3 text-muted-foreground py-3 px-2 rounded-lg bg-muted/30 mt-2">
                    <Download className="w-5 h-5 text-secondary" />
                    <span className="text-sm">App Installed ✓</span>
                  </div>
                )}
                
                {/* Mobile Dark Mode Toggle */}
                <div className="flex items-center justify-between py-3 px-2 border-t border-border mt-4">
                  <span className="text-muted-foreground font-medium">Dark Mode</span>
                  <button
                    onClick={handleToggleTheme}
                    className="relative p-2.5 rounded-full bg-muted hover:bg-accent/20 border border-border transition-all duration-300"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    <Sun className={`h-5 w-5 text-accent transition-all duration-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                    <Moon className={`h-5 w-5 text-primary transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
                  </button>
                </div>
                
                <div className="pt-4 border-t border-border space-y-3">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => { navFeedback(); setIsOpen(false); }}>
                        <Button variant="outline" className="w-full border-primary/30 text-primary">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/upload" onClick={() => { navFeedback(); setIsOpen(false); }}>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          Try Free
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
