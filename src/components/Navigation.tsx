
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Home, Upload, MessageCircle, BookOpen, Info, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      // Handle anchor links
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  const navItems = [
    { name: 'Home', href: '/', icon: Home, isRoute: true },
    { name: 'AI Chat', href: '/chat', icon: MessageCircle, isRoute: true },
    { name: 'Upload & Analyze', href: '/upload', icon: Upload, isRoute: true },
    { name: 'Learn', href: '/learn', icon: BookOpen, isRoute: true },
    { name: 'FAQ', href: '#faq', icon: Info, isRoute: false },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CW</span>
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">ClauseWise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isRoute ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 flex items-center space-x-1 group ${
                    location.pathname === item.href ? 'text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="group-hover:underline">{item.name}</span>
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 flex items-center space-x-1 group"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="group-hover:underline">{item.name}</span>
                </button>
              )
            ))}
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-blue-600"
              />
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20">
                Sign In
              </Button>
            </Link>
            <Link to="/chat">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Start Chat
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  item.isRoute ? (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 py-2 text-left ${
                        location.pathname === item.href ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 py-2 text-left"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                ))}
                
                {/* Mobile Dark Mode Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Dark Mode</span>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <Link to="/auth">
                    <Button variant="outline" className="w-full text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-700">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/chat">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Start Chat
                    </Button>
                  </Link>
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
