import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Heart, Shield, Home, TrendingUp, Coins } from 'lucide-react';

const UseCasesSection = () => {
  const navigate = useNavigate();

  const useCases = [
    {
      icon: CreditCard,
      title: 'Credit Cards',
      description: 'Decode interest rates, hidden fees, and reward terms',
      features: ['APR breakdown', 'Fee analysis', 'Reward optimization'],
      color: 'from-blue-500 to-cyan-500',
      route: '/products/credit-cards',
      pros: [
        'Build credit history with responsible usage',
        'Earn rewards and cashback on purchases',
        'Get fraud protection and purchase security'
      ],
      cons: [
        'High interest rates on unpaid balances (18-45% APR)',
        'Hidden fees like late payment, overlimit charges',
        'Easy to accumulate debt with minimum payments'
      ]
    },
    {
      icon: Heart,
      title: 'Health Insurance',
      description: 'Understand coverage, deductibles, and exclusions',
      features: ['Coverage details', 'Network providers', 'Claim process'],
      color: 'from-green-500 to-emerald-500',
      route: '/products/health-insurance',
      pros: [
        'Financial protection against medical emergencies',
        'Cashless treatment at network hospitals',
        'Tax benefits under Section 80D'
      ],
      cons: [
        'Waiting periods for pre-existing conditions',
        'Complex claim procedures and documentation',
        'Premium increases with age and claims'
      ]
    },
    {
      icon: Shield,
      title: 'Life Insurance',
      description: 'Simplify policy terms and beneficiary details',
      features: ['Payout conditions', 'Premium structure', 'Exclusions'],
      color: 'from-purple-500 to-violet-500',
      route: '/products/life-insurance',
      pros: [
        'Financial security for family after death',
        'Tax benefits on premiums and payouts',
        'Forced savings with investment-linked policies'
      ],
      cons: [
        'Low returns compared to other investments',
        'Complex terms and surrender penalties',
        'High charges in ULIP and investment plans'
      ]
    },
    {
      icon: Home,
      title: 'Loans',
      description: 'Break down EMI, processing fees, and penalties',
      features: ['Interest calculation', 'Prepayment terms', 'Default penalties'],
      color: 'from-orange-500 to-red-500',
      route: '/products/loans',
      pros: [
        'Immediate access to large amounts for goals',
        'Tax benefits on home loan interest',
        'Build credit score with timely payments'
      ],
      cons: [
        'Long-term financial commitment with EMIs',
        'High processing fees and hidden charges',
        'Penalty charges for late or missed payments'
      ]
    },
    {
      icon: TrendingUp,
      title: 'ULIPs',
      description: 'Analyze investment and insurance components',
      features: ['Fund allocation', 'Charges breakdown', 'Surrender value'],
      color: 'from-indigo-500 to-purple-500',
      route: '/products/ulips',
      pros: [
        'Dual benefit of insurance and investment',
        'Tax benefits under Section 80C and 10(10D)',
        'Flexibility to switch between funds'
      ],
      cons: [
        'High charges reduce actual investment amount',
        'Poor returns compared to mutual funds',
        'Lock-in period with surrender penalties'
      ]
    },
    {
      icon: Coins,
      title: 'Mutual Funds',
      description: 'Understand expense ratios and exit loads',
      features: ['Fee structure', 'Performance metrics', 'Tax implications'],
      color: 'from-yellow-500 to-orange-500',
      route: '/products/mutual-funds',
      pros: [
        'Professional fund management and diversification',
        'Easy to start with SIPs from ₹500/month',
        'Better returns than traditional investments'
      ],
      cons: [
        'Market risks can lead to losses',
        'Expense ratios and exit loads reduce returns',
        'Performance depends on fund manager skills'
      ]
    }
  ];

  return (
    <section id="use-cases" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            One AI for All Your Financial Documents
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From credit cards to insurance policies, ClauseWise breaks down complex terms 
            across all your financial products
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              onClick={() => navigate(useCase.route)}
              className="cursor-pointer"
            >
              <ProductCard
                title={useCase.title}
                description={useCase.description}
                icon={useCase.icon}
                color={useCase.color}
                route={useCase.route}
                features={useCase.features}
                pros={useCase.pros}
                cons={useCase.cons}
                onNavigate={navigate}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            And many more financial documents...
          </p>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
