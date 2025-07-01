import { Upload, Search, MessageCircle, Check } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Upload',
      description: 'Drop your policy document or paste the text',
      details: 'Supports PDF, images, and text formats',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      step: '01'
    },
    {
      icon: Search,
      title: 'Analyze',
      description: 'AI scans and identifies key clauses instantly',
      details: 'Advanced NLP extracts important terms',
      color: 'bg-secondary-500',
      bgColor: 'bg-green-50',
      step: '02'
    },
    {
      icon: MessageCircle,
      title: 'Chat',
      description: 'Ask questions about specific terms or clauses',
      details: 'Get explanations in simple language',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      step: '03'
    },
    {
      icon: Check,
      title: 'Decide',
      description: 'Make informed decisions with clear insights',
      details: 'Compare alternatives and recommendations',
      color: 'bg-accent-500',
      bgColor: 'bg-yellow-50',
      step: '04'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            How ClauseWise Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get from confusion to clarity in just 4 simple steps ✨
          </p>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection lines */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 to-yellow-200"></div>
            
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={step.title} className="relative text-center group">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {step.step}
                    </div>
                  </div>

                  {/* Icon container */}
                  <div className={`w-24 h-24 ${step.bgColor} rounded-3xl flex items-center justify-center mx-auto mb-6 mt-8 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`w-12 h-12 ${step.color.replace('bg-', 'text-')}`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    <p className="text-sm text-gray-500">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-start space-x-4">
              {/* Step indicator */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white font-bold`}>
                  {step.step}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${step.bgColor} rounded-xl flex items-center justify-center`}>
                    <step.icon className={`w-5 h-5 ${step.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600">{step.description}</p>
                <p className="text-sm text-gray-500">{step.details}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Demo CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Try It Out?</h3>
            <p className="text-gray-600 mb-6">Upload a sample document and see ClauseWise in action</p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200">
              📄 Try Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
