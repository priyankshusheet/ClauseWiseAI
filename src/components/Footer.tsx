import { Link } from 'react-router-dom';

const Footer = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'How it Works', href: '#how-it-works', content: 'Learn how ClauseWise AI analyzes your financial documents' },
        { name: 'Use Cases', href: '#use-cases', content: 'Discover all the ways ClauseWise can help you' },
        { name: 'FAQ', href: '#faq', content: 'Find answers to commonly asked questions' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#help', content: 'Get comprehensive support and guidance' },
        { name: 'FAQ', href: '#faq', content: 'Quick answers to your questions' },
        { name: 'Contact Us', href: '#contact', content: 'Reach out to our support team' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#privacy', content: 'How we protect and handle your data' },
        { name: 'Terms of Service', href: '#terms', content: 'Terms and conditions for using ClauseWise' }
      ]
    }
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      switch (href) {
        case '#how-it-works':
        case '#use-cases':
        case '#faq':
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
          break;
        default:
          break;
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
              <div className="space-y-2 text-sm text-background/70">
                <p>🔒 Top Class security for your documents</p>
                <p>⚡ Instant analysis in seconds</p>
                <p>🎯 Great accuracy in document analysis</p>
                <p>🏆 Trusted by many users</p>
              </div>
            </div>

            {/* Links sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="font-semibold text-lg text-background">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-background/70 hover:text-background transition-colors duration-200 text-left"
                        title={link.content}
                      >
                        {link.name}
                      </button>
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
              © 2025 ClauseWise. All rights reserved. Made with ❤️ for better financial literacy.
            </div>
            <div className="flex items-center space-x-6 text-sm text-background/70">
              <span>🔒 Your data is secure</span>
              <span>•</span>
              <span>⚡ Fast & reliable</span>
              <span>•</span>
              <span>🌟 AI-powered</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
