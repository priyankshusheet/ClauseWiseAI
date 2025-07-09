
import { Button } from '@/components/ui/button';
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
      // Handle different sections
      switch (href) {
        case '#how-it-works':
          const howItWorksElement = document.querySelector('#how-it-works');
          if (howItWorksElement) {
            howItWorksElement.scrollIntoView({ behavior: 'smooth' });
          }
          break;
        case '#use-cases':
          const useCasesElement = document.querySelector('#use-cases');
          if (useCasesElement) {
            useCasesElement.scrollIntoView({ behavior: 'smooth' });
          }
          break;
        case '#faq':
          const faqElement = document.querySelector('#faq');
          if (faqElement) {
            faqElement.scrollIntoView({ behavior: 'smooth' });
          }
          break;
        case '#help':
          // Show help modal or redirect to help page
          alert('Help Center: Get comprehensive support for using ClauseWise AI. Our team is here to help you understand complex financial documents and make informed decisions.');
          break;
        case '#contact':
          // Show contact modal or redirect to contact page
          alert('Contact Us: Reach out to our support team at support@clausewise.ai or through our chat feature. We\'re here to help you 24/7.');
          break;
        case '#privacy':
          // Show privacy policy modal or redirect
          alert('Privacy Policy: We take your privacy seriously. ClauseWise uses industry-standard encryption to protect your financial documents and personal information. We never share your data with third parties.');
          break;
        case '#terms':
          // Show terms of service modal or redirect
          alert('Terms of Service: By using ClauseWise, you agree to our terms of service. Our AI provides analysis for informational purposes only and should not replace professional financial advice.');
          break;
        default:
          break;
      }
    }
  };

  return (
    <footer className="bg-gray-900 dark:bg-black text-white">

      {/* Main footer content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Brand section */}
            <div className="lg:col-span-2 space-y-6">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CW</span>
                </div>
                <span className="font-display font-bold text-xl">ClauseWise</span>
              </Link>
              <p className="text-gray-400 leading-relaxed max-w-sm">
                Making financial documents understandable for everyone. 
                Your AI companion for smarter financial decisions. 🤖💡
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>🔒 Top Class security for your documents</p>
                <p>⚡ Instant analysis in seconds</p>
                <p>🎯 Great accuracy in document analysis</p>
                <p>🏆 Trusted by many users</p>
              </div>
            </div>

            {/* Links sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="font-semibold text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
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
      <div className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 ClauseWise. All rights reserved. Made with ❤️ for better financial literacy.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
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
