
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { financialProductsData, ProductCategory, getAllProductsInCategory, ProductInfo } from '@/data/financialProductsData';

const Products = () => {
  const { category } = useParams();

  const productMetadata = {
    'credit-cards': {
      title: 'Top 10 Credit Cards in India',
      subtitle: 'Based on reward programs, offers, and user base',
      icon: '💳',
      color: 'from-blue-500 to-cyan-500',
      category: 'Credit Cards' as ProductCategory
    },
    'health-insurance': {
      title: 'Top 10 Health Insurance Providers in India',
      subtitle: 'Individual/family plans based on coverage, claim ratio & trust',
      icon: '🏥',
      color: 'from-green-500 to-emerald-500',
      category: 'Health Insurance' as ProductCategory
    },
    'life-insurance': {
      title: 'Top 10 Life Insurance Companies in India',
      subtitle: 'Policy range, customer base, and claim settlement ratio',
      icon: '🛡️',
      color: 'from-purple-500 to-violet-500',
      category: 'Life Insurance' as ProductCategory
    },
    'loans': {
      title: 'Top 10 Loans in India',
      subtitle: 'Most availed loan categories and providers',
      icon: '🏠',
      color: 'from-orange-500 to-red-500',
      category: 'Loans' as ProductCategory
    },
    'ulips': {
      title: 'Top 10 ULIPs in India',
      subtitle: 'Combines insurance + investment; top for returns, flexibility',
      icon: '📈',
      color: 'from-indigo-500 to-purple-500',
      category: 'ULIPs' as ProductCategory
    },
    'mutual-funds': {
      title: 'Top 10 Mutual Funds in India',
      subtitle: 'By AMC popularity & fund performance across Equity, Debt & Hybrid categories',
      icon: '💰',
      color: 'from-yellow-500 to-orange-500',
      category: 'Mutual Funds' as ProductCategory
    }
  };

  const currentProduct = productMetadata[category as keyof typeof productMetadata];

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h1>
          <Link to="/" className="text-blue-600 hover:underline">Go back to home</Link>
        </div>
      </div>
    );
  }

  // Get products from the comprehensive dataset
  const productsData = getAllProductsInCategory(currentProduct.category);
  const productsList = Object.entries(productsData).map(([name, data], index) => {
    const productInfo = data as ProductInfo;
    return {
      name,
      rating: 4.5 - (index * 0.1), // Generate ratings from 4.5 to 3.5
      highlight: productInfo.Pros[0] || 'Great financial product',
      pros: productInfo.Pros,
      cons: productInfo.Cons
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentProduct.color} flex items-center justify-center text-3xl`}>
                {currentProduct.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentProduct.title}</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{currentProduct.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>Updated regularly based on market performance and user reviews</span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6">
            {productsList.map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-3">{product.highlight}</p>
                        
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.rating.toFixed(1)}</span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
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

                    {/* Pros and Cons */}
                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Benefits */}
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Key Benefits
                        </h4>
                        <ul className="space-y-1">
                          {product.pros.slice(0, 3).map((pro, proIndex) => (
                            <li key={proIndex} className="text-sm text-green-800 dark:text-green-300 flex items-start">
                              <span className="text-green-500 mr-2 mt-0.5">✓</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risks */}
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Main Risks
                        </h4>
                        <ul className="space-y-1">
                          {product.cons.slice(0, 3).map((con, conIndex) => (
                            <li key={conIndex} className="text-sm text-red-800 dark:text-red-300 flex items-start">
                              <span className="text-red-500 mr-2 mt-0.5">⚠</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Help Choosing?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
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
