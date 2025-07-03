
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'How it Works', href: '#how-it-works' },
        { name: 'Use Cases', href: '#use-cases' },
        { name: 'FAQ', href: '#faq' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#help' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Contact Us', href: '#contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' }
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated with ClauseWise</h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Get the latest tips on financial literacy and product updates 📧
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

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
            </div>

            {/* Links sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="font-semibold text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
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
              © 2024 ClauseWise. All rights reserved. Made with ❤️ for better financial literacy.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>🔒 Your data is secure</span>
              <span>•</span>
              <span>⚡ Fast & reliable</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
