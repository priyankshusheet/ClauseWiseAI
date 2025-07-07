
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Heart, Shield, Home, TrendingUp, PiggyBank } from 'lucide-react';
import { Link } from 'react-router-dom';

const UseCasesSection = () => {
  const useCases = [
    {
      icon: CreditCard,
      title: "Credit Cards",
      description: "Compare top credit cards, rewards programs, and find the best match for your spending habits.",
      color: "from-blue-500 to-blue-700",
      link: "/products#creditCards"
    },
    {
      icon: Heart,
      title: "Health Insurance",
      description: "Discover comprehensive health insurance plans with best coverage and claim settlement ratios.",
      color: "from-red-500 to-red-700",
      link: "/products#healthInsurance"
    },
    {
      icon: Shield,
      title: "Life Insurance",
      description: "Explore life insurance policies that provide financial security for your loved ones.",
      color: "from-green-500 to-green-700",
      link: "/products#lifeInsurance"
    },
    {
      icon: Home,
      title: "Loans",
      description: "Find the best home loans, personal loans with competitive interest rates and quick approval.",
      color: "from-orange-500 to-orange-700",
      link: "/products#loans"
    },
    {
      icon: TrendingUp,
      title: "ULIPs",
      description: "Unit Linked Insurance Plans that combine insurance protection with investment opportunities.",
      color: "from-purple-500 to-purple-700",
      link: "/products#ulips"
    },
    {
      icon: PiggyBank,
      title: "Mutual Funds",
      description: "Discover top-performing mutual funds across equity, debt, and hybrid categories.",
      color: "from-indigo-500 to-indigo-700",
      link: "/products#mutualFunds"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Top Financial Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover India's best financial products across different categories, carefully ranked and analyzed for your financial success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const IconComponent = useCase.icon;
            return (
              <Link key={index} to={useCase.link}>
                <Card className="group h-full cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-l-4" 
                      style={{ borderLeftColor: useCase.color.split(' ')[1].replace('to-', '') }}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${useCase.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {useCase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 leading-relaxed">
                      {useCase.description}
                    </p>
                    <div className="mt-4 text-blue-600 font-medium group-hover:underline">
                      Explore Top 10 →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need Personalized Recommendations?</h3>
            <p className="text-lg mb-6 opacity-90">
              Upload your financial documents and get AI-powered analysis and recommendations tailored to your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/upload" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Upload Documents
              </Link>
              <Link 
                to="/chat" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Chat with AI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
