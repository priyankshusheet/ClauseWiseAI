import { Card, CardContent } from '@/components/ui/card';

const UseCasesSection = () => {
  const useCases = [
    {
      icon: '💳',
      title: 'Credit Cards',
      description: 'Decode interest rates, hidden fees, and reward terms',
      features: ['APR breakdown', 'Fee analysis', 'Reward optimization'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🏥',
      title: 'Health Insurance',
      description: 'Understand coverage, deductibles, and exclusions',
      features: ['Coverage details', 'Network providers', 'Claim process'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🛡️',
      title: 'Life Insurance',
      description: 'Simplify policy terms and beneficiary details',
      features: ['Payout conditions', 'Premium structure', 'Exclusions'],
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: '🏠',
      title: 'Loans',
      description: 'Break down EMI, processing fees, and penalties',
      features: ['Interest calculation', 'Prepayment terms', 'Default penalties'],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '📈',
      title: 'ULIPs',
      description: 'Analyze investment and insurance components',
      features: ['Fund allocation', 'Charges breakdown', 'Surrender value'],
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '💰',
      title: 'Mutual Funds',
      description: 'Understand expense ratios and exit loads',
      features: ['Fee structure', 'Performance metrics', 'Tax implications'],
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            One AI for All Your Financial Documents
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From credit cards to insurance policies, ClauseWise breaks down complex terms 
            across all your financial products 🎯
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card 
              key={useCase.title}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Icon and Title */}
                  <div className="space-y-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                      {useCase.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {useCase.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-4">
                    <button className="text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors duration-200 group-hover:underline">
                      Try with {useCase.title} →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <span>And many more financial documents...</span>
            <span className="text-2xl">📄</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
