import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Home, 
  Upload, 
  MessageCircle, 
  BookOpen, 
  Info, 
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
import { SUPPORTED_LANGUAGES } from '@/i18n/config';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('clausewise_language', lang);
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const publicNavItems = [
    { name: t('nav.home'), href: '/', icon: Home, isRoute: true },
    { name: t('nav.aiChat'), href: '/chat', icon: MessageCircle, isRoute: true },
    { name: t('nav.upload'), href: '/upload', icon: Upload, isRoute: true },
    { name: t('nav.learn'), href: '/learn', icon: BookOpen, isRoute: true },
    { name: t('nav.faq'), href: '#faq', icon: Info, isRoute: false },
  ];

  const authNavItems = [
    { name: t('nav.portfolio'), href: '/portfolio', icon: FolderOpen, isRoute: true },
    { name: t('nav.compare'), href: '/compare', icon: GitCompare, isRoute: true },
    { name: t('nav.settings'), href: '/settings', icon: Settings, isRoute: true },
    { name: t('nav.history'), href: '/history', icon: History, isRoute: true },
  ];

  const visibleNavItems = user 
    ? [...publicNavItems, ...authNavItems]
    : publicNavItems;

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

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
                  key={item.href}
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
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 flex items-center space-x-1.5 group py-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="group-hover:underline">{item.name}</span>
                </button>
              )
            ))}
            
            {/* Language Selector */}
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-auto h-8 text-xs border-border/50 bg-transparent gap-1 px-2">
                <SelectValue>{currentLang.nativeName}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-xs">
                    {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2 pl-2 border-l border-border">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={handleToggleTheme}
                className="data-[state=checked]:bg-primary"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-3">
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
                    {t('nav.history')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navFeedback(); navigate('/portfolio'); }}>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    {t('nav.portfolio')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navFeedback(); navigate('/settings'); }}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('nav.settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth" onClick={() => navFeedback()}>
                  <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/5">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/upload" onClick={() => navFeedback()}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md">
                    {t('nav.tryFree')}
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
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{t('nav.signIn')}</p>
                    </div>
                  </div>
                )}

                {visibleNavItems.map((item) => (
                  item.isRoute ? (
                    <Link
                      key={item.href}
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
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className="flex items-center space-x-3 text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 py-3 px-2 rounded-lg hover:bg-muted text-left"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                ))}

                {/* Mobile Language Selector */}
                <div className="flex items-center justify-between py-3 px-2 border-t border-border mt-2">
                  <span className="text-muted-foreground font-medium text-sm">{t('settings.language')}</span>
                  <Select value={i18n.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-auto h-8 text-xs">
                      <SelectValue>{currentLang.nativeName}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code} className="text-xs">
                          {lang.nativeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {canInstall && (
                  <button
                    onClick={handleInstall}
                    className="flex items-center space-x-3 text-primary font-medium transition-colors duration-200 py-3 px-2 rounded-lg hover:bg-primary/10 border border-primary/20 mt-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>{t('nav.installApp')}</span>
                  </button>
                )}
                {isInstalled && (
                  <div className="flex items-center space-x-3 text-muted-foreground py-3 px-2 rounded-lg bg-muted/30 mt-2">
                    <Download className="w-5 h-5 text-secondary" />
                    <span className="text-sm">{t('nav.appInstalled')}</span>
                  </div>
                )}
                
                {/* Mobile Dark Mode Toggle */}
                <div className="flex items-center justify-between py-3 px-2 border-t border-border mt-4">
                  <span className="text-muted-foreground font-medium">{t('nav.darkMode')}</span>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={handleToggleTheme}
                      className="data-[state=checked]:bg-primary"
                    />
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border space-y-3">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.signOut')}
                    </Button>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => { navFeedback(); setIsOpen(false); }}>
                        <Button variant="outline" className="w-full border-primary/30 text-primary">
                          {t('nav.signIn')}
                        </Button>
                      </Link>
                      <Link to="/upload" onClick={() => { navFeedback(); setIsOpen(false); }}>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          {t('nav.tryFree')}
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
