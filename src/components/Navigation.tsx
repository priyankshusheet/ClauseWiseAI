
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, Upload, MessageCircle, BookOpen, Info } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CW</span>
            </div>
            <span className="font-display font-bold text-xl text-gray-900">ClauseWise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isRoute ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center space-x-1 group ${
                    location.pathname === item.href ? 'text-primary-600' : ''
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="group-hover:underline">{item.name}</span>
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center space-x-1 group"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="group-hover:underline">{item.name}</span>
                </button>
              )
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="text-primary-600 border-primary-200 hover:bg-primary-50">
              Sign In
            </Button>
            <Link to="/chat">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
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
                      className={`flex items-center space-x-3 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 py-2 text-left ${
                        location.pathname === item.href ? 'text-primary-600' : ''
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 py-2 text-left"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                ))}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Button variant="outline" className="w-full text-primary-600 border-primary-200">
                    Sign In
                  </Button>
                  <Link to="/chat">
                    <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
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
