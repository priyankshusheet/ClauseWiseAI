import { Link } from 'react-router-dom';
import { Shield, Zap, Lock } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'How it Works', href: '/#how-it-works', isHash: true },
        { name: 'Use Cases', href: '/#use-cases', isHash: true },
        { name: 'FAQ', href: '/#faq', isHash: true }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help', isHash: false },
        { name: 'FAQ', href: '/#faq', isHash: true },
        { name: 'Contact Us', href: '/contact', isHash: false }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy', isHash: false },
        { name: 'Terms of Service', href: '/terms', isHash: false }
      ]
    }
  ];

  const handleHashLink = (href: string) => {
    const hash = href.split('#')[1];
    if (hash) {
      // If we're on the home page, scroll directly
      if (window.location.pathname === '/') {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to home page with hash
        window.location.href = href;
      }
    }
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Main footer content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Brand section */}
            <div className="lg:col-span-2 space-y-6">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">CW</span>
                </div>
                <span className="font-display font-bold text-xl text-background">ClauseWise</span>
              </Link>
              <p className="text-background/70 leading-relaxed max-w-sm">
                Making financial documents understandable for everyone. 
                Your AI companion for smarter financial decisions.
              </p>
              <div className="space-y-3 text-sm text-background/70">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Enterprise-grade security for your documents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Fast analysis powered by advanced AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Your data is never stored permanently</span>
                </div>
              </div>
            </div>

            {/* Links sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="font-semibold text-lg text-background">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.isHash ? (
                        <button
                          onClick={() => handleHashLink(link.href)}
                          className="text-background/70 hover:text-background transition-colors duration-200 text-left"
                        >
                          {link.name}
                        </button>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-background/70 hover:text-background transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-background/70 text-sm">
              © {new Date().getFullYear()} ClauseWise. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-background/70">
              <div className="flex items-center space-x-2">
                <Lock className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3" />
                <span>Fast</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3" />
                <span>Private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
