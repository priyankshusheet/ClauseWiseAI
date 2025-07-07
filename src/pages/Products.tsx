
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const Products = () => {
  const { category } = useParams();

  const productData = {
    'credit-cards': {
      title: 'Top 10 Credit Cards in India',
      subtitle: 'Based on reward programs, offers, and user base',
      icon: '💳',
      color: 'from-blue-500 to-cyan-500',
      products: [
        { name: 'HDFC Regalia Credit Card', rating: 4.5, highlight: 'Premium rewards & travel benefits' },
        { name: 'SBI Card ELITE', rating: 4.4, highlight: 'Comprehensive lifestyle benefits' },
        { name: 'Axis Bank ACE Credit Card', rating: 4.3, highlight: 'Cashback on online spends' },
        { name: 'ICICI Amazon Pay Credit Card', rating: 4.2, highlight: 'Amazon shopping rewards' },
        { name: 'American Express Membership Rewards Card', rating: 4.4, highlight: 'Global acceptance & rewards' },
        { name: 'HDFC Millennia Credit Card', rating: 4.1, highlight: 'Online shopping benefits' },
        { name: 'Standard Chartered Super Value Titanium Card', rating: 4.0, highlight: 'Fuel surcharge waiver' },
        { name: 'Citi PremierMiles Credit Card', rating: 4.2, highlight: 'Travel miles accumulation' },
        { name: 'Flipkart Axis Bank Credit Card', rating: 4.0, highlight: 'Flipkart exclusive benefits' },
        { name: 'IndusInd Bank Platinum Aura Credit Card', rating: 3.9, highlight: 'Movie & dining offers' }
      ]
    },
    'health-insurance': {
      title: 'Top 10 Health Insurance Providers in India',
      subtitle: 'Individual/family plans based on coverage, claim ratio & trust',
      icon: '🏥',
      color: 'from-green-500 to-emerald-500',
      products: [
        { name: 'Star Health & Allied Insurance', rating: 4.3, highlight: 'Largest health insurer in India' },
        { name: 'HDFC ERGO Health Insurance', rating: 4.2, highlight: 'Quick claim settlement' },
        { name: 'Niva Bupa (formerly Max Bupa)', rating: 4.1, highlight: 'Comprehensive coverage options' },
        { name: 'Care Health Insurance', rating: 4.0, highlight: 'Affordable premium rates' },
        { name: 'ICICI Lombard Health Insurance', rating: 4.2, highlight: 'Digital-first approach' },
        { name: 'Tata AIG Health Insurance', rating: 4.0, highlight: 'Wide network of hospitals' },
        { name: 'ManipalCigna Health Insurance', rating: 3.9, highlight: 'Preventive care focus' },
        { name: 'Aditya Birla Health Insurance', rating: 3.8, highlight: 'Wellness programs included' },
        { name: 'Reliance General Health Insurance', rating: 3.9, highlight: 'Flexible policy options' },
        { name: 'New India Assurance (Govt-owned)', rating: 3.7, highlight: 'Trusted government backing' }
      ]
    },
    'life-insurance': {
      title: 'Top 10 Life Insurance Companies in India',
      subtitle: 'Policy range, customer base, and claim settlement ratio',
      icon: '🛡️',
      color: 'from-purple-500 to-violet-500',
      products: [
        { name: 'Life Insurance Corporation of India (LIC)', rating: 4.1, highlight: 'Largest life insurer in India' },
        { name: 'HDFC Life Insurance', rating: 4.3, highlight: 'High claim settlement ratio' },
        { name: 'ICICI Prudential Life Insurance', rating: 4.2, highlight: 'Innovative product portfolio' },
        { name: 'SBI Life Insurance', rating: 4.0, highlight: 'Strong distribution network' },
        { name: 'Max Life Insurance', rating: 4.1, highlight: 'Customer-centric approach' },
        { name: 'Tata AIA Life Insurance', rating: 4.0, highlight: 'International expertise' },
        { name: 'Bajaj Allianz Life Insurance', rating: 3.9, highlight: 'Diverse product range' },
        { name: 'Aditya Birla Sun Life Insurance', rating: 3.8, highlight: 'Digital innovation leader' },
        { name: 'PNB MetLife India Insurance', rating: 3.9, highlight: 'Bancassurance strength' },
        { name: 'Kotak Mahindra Life Insurance', rating: 3.8, highlight: 'Unit-linked plans specialist' }
      ]
    },
    'loans': {
      title: 'Top 10 Loans in India',
      subtitle: 'Most availed loan categories and providers',
      icon: '🏠',
      color: 'from-orange-500 to-red-500',
      products: [
        { name: 'HDFC Ltd. (Home Loan)', rating: 4.4, highlight: 'Lowest interest rates' },
        { name: 'SBI Home Loan', rating: 4.2, highlight: 'Flexible repayment options' },
        { name: 'ICICI Bank Home Loan', rating: 4.1, highlight: 'Quick processing time' },
        { name: 'Axis Bank Home Loan', rating: 4.0, highlight: 'Competitive interest rates' },
        { name: 'LIC Housing Finance', rating: 3.9, highlight: 'Higher loan amounts available' },
        { name: 'Bajaj Finserv Personal Loan', rating: 4.3, highlight: 'Instant approval process' },
        { name: 'HDFC Bank Personal Loan', rating: 4.2, highlight: 'Pre-approved offers' },
        { name: 'Fullerton India Personal Loan', rating: 4.0, highlight: 'Flexible eligibility criteria' },
        { name: 'IDFC FIRST Bank Personal Loan', rating: 3.9, highlight: 'Attractive interest rates' },
        { name: 'Tata Capital Personal Loan', rating: 3.8, highlight: 'Quick disbursal' }
      ]
    },
    'ulips': {
      title: 'Top 10 ULIPs in India',
      subtitle: 'Combines insurance + investment; top for returns, flexibility',
      icon: '📈',
      color: 'from-indigo-500 to-purple-500',
      products: [
        { name: 'HDFC Life Click 2 Wealth', rating: 4.2, highlight: 'High fund performance' },
        { name: 'ICICI Prudential LifeTime Classic', rating: 4.1, highlight: 'Low charges structure' },
        { name: 'Bajaj Allianz Future Gain', rating: 4.0, highlight: 'Flexible premium payment' },
        { name: 'SBI Life eWealth Insurance', rating: 3.9, highlight: 'Multiple fund options' },
        { name: 'Max Life Fast Track Super Plan', rating: 4.0, highlight: 'Quick policy issuance' },
        { name: 'Tata AIA Fortune Pro', rating: 3.8, highlight: 'Global investment expertise' },
        { name: 'Aditya Birla Sun Life Wealth Assure', rating: 3.9, highlight: 'Guaranteed additions' },
        { name: 'Kotak e-Invest Plan', rating: 3.7, highlight: 'Online convenience' },
        { name: 'PNB MetLife Smart Platinum', rating: 3.8, highlight: 'Loyalty additions' },
        { name: 'Canara HSBC Invest 4G', rating: 3.6, highlight: 'Four generation coverage' }
      ]
    },
    'mutual-funds': {
      title: 'Top 10 Mutual Funds in India',
      subtitle: 'By AMC popularity & fund performance across Equity, Debt & Hybrid categories',
      icon: '💰',
      color: 'from-yellow-500 to-orange-500',
      products: [
        { name: 'SBI Bluechip Fund – SBI Mutual Fund', rating: 4.3, highlight: 'Consistent large-cap performance' },
        { name: 'Axis Bluechip Fund – Axis Mutual Fund', rating: 4.2, highlight: 'Strong risk-adjusted returns' },
        { name: 'Mirae Asset Large Cap Fund', rating: 4.4, highlight: 'Best-in-class fund management' },
        { name: 'ICICI Prudential Bluechip Fund', rating: 4.1, highlight: 'Diversified blue-chip portfolio' },
        { name: 'HDFC Top 100 Fund', rating: 4.0, highlight: 'Long-term wealth creation' },
        { name: 'Nippon India Small Cap Fund', rating: 4.2, highlight: 'High growth potential' },
        { name: 'Kotak Flexicap Fund', rating: 4.1, highlight: 'Flexible investment approach' },
        { name: 'Parag Parikh Flexi Cap Fund', rating: 4.3, highlight: 'International diversification' },
        { name: 'UTI Nifty Index Fund', rating: 4.0, highlight: 'Low-cost index tracking' },
        { name: 'Canara Robeco Emerging Equities Fund', rating: 3.9, highlight: 'Emerging opportunities focus' }
      ]
    }
  };

  const currentProduct = productData[category as keyof typeof productData];

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/" className="text-blue-600 hover:underline">Go back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentProduct.color} flex items-center justify-center text-3xl`}>
                {currentProduct.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentProduct.title}</h1>
                <p className="text-gray-600 mt-1">{currentProduct.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>Updated regularly based on market performance and user reviews</span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6">
            {currentProduct.products.map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{product.highlight}</p>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Based on user reviews and market performance
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help Choosing?</h2>
              <p className="text-gray-600 mb-6">
                Chat with our AI assistant to get personalized recommendations based on your needs
              </p>
              <Link to="/chat">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                  Start AI Chat
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;
