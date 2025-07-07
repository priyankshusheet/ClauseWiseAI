
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Heart, Shield, Home, TrendingUp, PiggyBank, ArrowLeft, Star, Award, Users } from 'lucide-react';

type ProductCategory = 'creditCards' | 'healthInsurance' | 'lifeInsurance' | 'loans' | 'ulips' | 'mutualFunds';

interface Product {
  name: string;
  description: string;
  rating?: number;
  highlight?: string;
}

const financialProductsData = {
  creditCards: {
    title: "Top 10 Credit Cards in India",
    subtitle: "Based on reward programs, offers, and user base",
    icon: CreditCard,
    color: "from-blue-500 to-blue-700",
    products: [
      { name: "HDFC Regalia Credit Card", description: "Premium rewards and travel benefits", rating: 4.5, highlight: "Best for Travel" },
      { name: "SBI Card ELITE", description: "Exclusive lifestyle privileges", rating: 4.4, highlight: "Premium Lifestyle" },
      { name: "Axis Bank ACE Credit Card", description: "High cashback on bill payments", rating: 4.3, highlight: "Cashback King" },
      { name: "ICICI Amazon Pay Credit Card", description: "Amazon shopping rewards", rating: 4.2, highlight: "E-commerce" },
      { name: "American Express Membership Rewards Card", description: "Global acceptance and rewards", rating: 4.4, highlight: "International" },
      { name: "HDFC Millennia Credit Card", description: "Online shopping benefits", rating: 4.1, highlight: "Digital Rewards" },
      { name: "Standard Chartered Super Value Titanium Card", description: "Value-focused benefits", rating: 4.0, highlight: "Value for Money" },
      { name: "Citi PremierMiles Credit Card", description: "Air miles accumulation", rating: 4.2, highlight: "Travel Miles" },
      { name: "Flipkart Axis Bank Credit Card", description: "Flipkart shopping rewards", rating: 4.0, highlight: "E-commerce Focused" },
      { name: "IndusInd Bank Platinum Aura Credit Card", description: "Lifestyle and dining benefits", rating: 3.9, highlight: "Dining & Lifestyle" }
    ]
  },
  healthInsurance: {
    title: "Top 10 Health Insurance Providers in India",
    subtitle: "Individual/family plans based on coverage, claim ratio & trust",
    icon: Heart,
    color: "from-red-500 to-red-700",
    products: [
      { name: "Star Health & Allied Insurance", description: "Comprehensive health coverage", rating: 4.3, highlight: "Best Coverage" },
      { name: "HDFC ERGO Health Insurance", description: "Innovative health solutions", rating: 4.2, highlight: "Innovation Leader" },
      { name: "Niva Bupa (formerly Max Bupa)", description: "Global healthcare expertise", rating: 4.1, highlight: "Global Standards" },
      { name: "Care Health Insurance", description: "Affordable health protection", rating: 4.0, highlight: "Affordable Plans" },
      { name: "ICICI Lombard Health Insurance", description: "Digital-first health insurance", rating: 4.1, highlight: "Digital Experience" },
      { name: "Tata AIG Health Insurance", description: "Trusted health partner", rating: 4.0, highlight: "Trust & Reliability" },
      { name: "ManipalCigna Health Insurance", description: "Healthcare network advantage", rating: 3.9, highlight: "Network Coverage" },
      { name: "Aditya Birla Health Insurance", description: "Wellness-focused insurance", rating: 3.8, highlight: "Wellness Programs" },
      { name: "Reliance General Health Insurance", description: "Comprehensive health solutions", rating: 3.8, highlight: "Comprehensive Care" },
      { name: "New India Assurance (Govt-owned)", description: "Government-backed security", rating: 3.7, highlight: "Government Backed" }
    ]
  },
  lifeInsurance: {
    title: "Top 10 Life Insurance Companies in India",
    subtitle: "Policy range, customer base, and claim settlement ratio",
    icon: Shield,
    color: "from-green-500 to-green-700",
    products: [
      { name: "Life Insurance Corporation of India (LIC)", description: "India's largest life insurer", rating: 4.5, highlight: "Market Leader" },
      { name: "HDFC Life Insurance", description: "Premium life insurance solutions", rating: 4.3, highlight: "Premium Solutions" },
      { name: "ICICI Prudential Life Insurance", description: "Comprehensive life coverage", rating: 4.2, highlight: "Comprehensive Plans" },
      { name: "SBI Life Insurance", description: "Trusted life insurance partner", rating: 4.1, highlight: "Banking Trust" },
      { name: "Max Life Insurance", description: "Customer-centric life insurance", rating: 4.0, highlight: "Customer Focus" },
      { name: "Tata AIA Life Insurance", description: "Global expertise, local presence", rating: 4.0, highlight: "Global Expertise" },
      { name: "Bajaj Allianz Life Insurance", description: "Innovative life insurance products", rating: 3.9, highlight: "Innovation" },
      { name: "Aditya Birla Sun Life Insurance", description: "Flexible life insurance plans", rating: 3.8, highlight: "Flexibility" },
      { name: "PNB MetLife India Insurance", description: "Banking partnership advantage", rating: 3.8, highlight: "Banking Network" },
      { name: "Kotak Mahindra Life Insurance", description: "Modern life insurance solutions", rating: 3.7, highlight: "Modern Solutions" }
    ]
  },
  loans: {
    title: "Top 10 Loans in India",
    subtitle: "Most availed loan categories and providers",
    icon: Home,
    color: "from-orange-500 to-orange-700",
    products: [
      { name: "HDFC Ltd. Home Loan", description: "India's leading home loan provider", rating: 4.4, highlight: "Home Loan Leader" },
      { name: "SBI Home Loan", description: "Government bank reliability", rating: 4.3, highlight: "Bank Trust" },
      { name: "ICICI Bank Home Loan", description: "Quick processing and approval", rating: 4.2, highlight: "Quick Processing" },
      { name: "Axis Bank Home Loan", description: "Competitive interest rates", rating: 4.1, highlight: "Best Rates" },
      { name: "LIC Housing Finance", description: "Insurance-backed home loans", rating: 4.0, highlight: "Insurance Backed" },
      { name: "Bajaj Finserv Personal Loan", description: "Instant personal loans", rating: 4.2, highlight: "Instant Approval" },
      { name: "HDFC Bank Personal Loan", description: "Pre-approved personal loans", rating: 4.1, highlight: "Pre-approved" },
      { name: "Fullerton India Personal Loan", description: "Flexible personal financing", rating: 4.0, highlight: "Flexible Terms" },
      { name: "IDFC FIRST Bank Personal Loan", description: "Digital-first personal loans", rating: 3.9, highlight: "Digital Experience" },
      { name: "Tata Capital Personal Loan", description: "Tata group reliability", rating: 3.8, highlight: "Group Reliability" }
    ]
  },
  ulips: {
    title: "Top 10 ULIPs in India",
    subtitle: "Unit Linked Insurance Plans - combines insurance + investment",
    icon: TrendingUp,
    color: "from-purple-500 to-purple-700",
    products: [
      { name: "HDFC Life Click 2 Wealth", description: "Flexible investment-cum-insurance", rating: 4.3, highlight: "Flexibility Leader" },
      { name: "ICICI Prudential LifeTime Classic", description: "Long-term wealth creation", rating: 4.2, highlight: "Wealth Creation" },
      { name: "Bajaj Allianz Future Gain", description: "Future-focused investment plan", rating: 4.1, highlight: "Future Focused" },
      { name: "SBI Life eWealth Insurance", description: "Digital wealth building", rating: 4.0, highlight: "Digital Platform" },
      { name: "Max Life Fast Track Super Plan", description: "Accelerated wealth accumulation", rating: 3.9, highlight: "Fast Accumulation" },
      { name: "Tata AIA Fortune Pro", description: "Professional wealth management", rating: 3.9, highlight: "Professional Management" },
      { name: "Aditya Birla Sun Life Wealth Assure", description: "Assured wealth protection", rating: 3.8, highlight: "Wealth Assurance" },
      { name: "Kotak e-Invest Plan", description: "Online investment platform", rating: 3.8, highlight: "Online Platform" },
      { name: "PNB MetLife Smart Platinum", description: "Smart investment choices", rating: 3.7, highlight: "Smart Choices" },
      { name: "Canara HSBC Invest 4G", description: "Next-gen investment solutions", rating: 3.7, highlight: "Next-gen Solutions" }
    ]
  },
  mutualFunds: {
    title: "Top 10 Mutual Funds in India",
    subtitle: "By AMC popularity & fund performance across Equity, Debt & Hybrid categories",
    icon: PiggyBank,
    color: "from-indigo-500 to-indigo-700",
    products: [
      { name: "SBI Bluechip Fund", description: "Large-cap equity fund by SBI MF", rating: 4.4, highlight: "Blue Chip Leader" },
      { name: "Axis Bluechip Fund", description: "Consistent large-cap performance", rating: 4.3, highlight: "Consistent Performance" },
      { name: "Mirae Asset Large Cap Fund", description: "Korean expertise in Indian markets", rating: 4.2, highlight: "Global Expertise" },
      { name: "ICICI Prudential Bluechip Fund", description: "Diversified large-cap portfolio", rating: 4.1, highlight: "Diversified Portfolio" },
      { name: "HDFC Top 100 Fund", description: "Top 100 companies investment", rating: 4.0, highlight: "Top Companies" },
      { name: "Nippon India Small Cap Fund", description: "Small-cap growth opportunities", rating: 4.2, highlight: "Growth Potential" },
      { name: "Kotak Flexicap Fund", description: "Flexible market cap allocation", rating: 4.1, highlight: "Flexible Strategy" },
      { name: "Parag Parikh Flexi Cap Fund", description: "Value-focused flexi cap fund", rating: 4.3, highlight: "Value Focus" },
      { name: "UTI Nifty Index Fund", description: "Passive index fund tracking Nifty", rating: 4.0, highlight: "Index Tracking" },
      { name: "Canara Robeco Emerging Equities Fund", description: "Emerging companies focus", rating: 3.9, highlight: "Emerging Focus" }
    ]
  }
};

const FinancialProducts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  if (selectedCategory) {
    const categoryData = financialProductsData[selectedCategory];
    const IconComponent = categoryData.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </Button>
          </div>

          <div className="text-center mb-12">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${categoryData.color} flex items-center justify-center mx-auto mb-4`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryData.title}</h1>
            <p className="text-xl text-gray-600">{categoryData.subtitle}</p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {categoryData.products.map((product, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${categoryData.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  {product.highlight && (
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${categoryData.color}`}>
                      {product.highlight}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Award className="w-4 h-4" />
                      Top Rated
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Top Financial Products in India
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the best financial products across different categories to make informed decisions for your financial future
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(financialProductsData).map(([key, category]) => {
          const IconComponent = category.icon;
          return (
            <Card
              key={key}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-l-4"
              style={{ borderLeftColor: category.color.split(' ')[1].replace('to-', '') }}
              onClick={() => setSelectedCategory(key as ProductCategory)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {category.title.replace('Top 10 ', '').replace(' in India', '')}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {category.subtitle}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    Top 10 Products
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.2+</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-blue-600 transition-colors">
                  View All Products
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Why These Rankings Matter</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our rankings are based on comprehensive analysis of user reviews, expert opinions, market performance, and customer satisfaction ratings.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">60+</div>
            <div className="text-gray-600">Products Analyzed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
            <div className="text-gray-600">User Reviews</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
            <div className="text-gray-600">Accuracy Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinancialProducts;
