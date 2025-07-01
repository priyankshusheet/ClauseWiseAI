import { Card, CardContent } from '@/components/ui/card';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      age: '28, Marketing Professional',
      avatar: '👩🏻‍💼',
      quote: 'Finally understand my health insurance! ClauseWise explained everything in terms I could actually understand. No more calling customer service for hours! 🙌',
      generation: 'Millennial'
    },
    {
      name: 'Michael Rodriguez',
      age: '35, Small Business Owner',
      avatar: '👨🏽‍💼',
      quote: 'Saved me thousands on my business loan. The AI caught hidden fees that I completely missed. Worth every penny - though it\'s free! 💰',
      generation: 'Millennial'
    },
    {
      name: 'Emma Thompson',
      age: '22, College Student',
      avatar: '👩🏼‍🎓',
      quote: 'OMG this app is a lifesaver! Got my first credit card and ClauseWise made sure I didn\'t fall into any traps. So user-friendly! 🎯',
      generation: 'Gen-Z'
    },
    {
      name: 'Robert Johnson',
      age: '58, Retired Teacher',
      avatar: '👨🏾‍🏫',
      quote: 'At my age, I thought I\'d seen it all. This tool helped me better understand my life insurance policy and found better options for my family.',
      generation: 'Boomer'
    },
    {
      name: 'Priya Patel',
      age: '31, Software Engineer',
      avatar: '👩🏽‍💻',
      quote: 'The AI is incredibly smart. It not only explained my ULIP terms but also suggested better investment alternatives. Tech that actually helps! 🚀',
      generation: 'Millennial'
    },
    {
      name: 'Jake Morrison',
      age: '24, Content Creator',
      avatar: '👨🏻‍🎨',
      quote: 'Used it for my freelancer insurance. The explanations are so clear, even my mom could understand them. Game changer for sure! 🔥',
      generation: 'Gen-Z'
    }
  ];

  const generationColors = {
    'Gen-Z': 'bg-gradient-to-r from-coral-500 to-accent-500',
    'Millennial': 'bg-gradient-to-r from-primary-500 to-secondary-500',
    'Boomer': 'bg-gradient-to-r from-purple-500 to-indigo-500'
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Loved Across All Generations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            From Gen-Z to Boomers, everyone finds value in simple, clear financial guidance 💝
          </p>
          
          {/* Generation badges */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <span className="text-2xl">🔥</span>
              <span className="font-semibold text-gray-800">Gen-Z Approved</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <span className="text-2xl">💼</span>
              <span className="font-semibold text-gray-800">Millennial Favorite</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              <span className="font-semibold text-gray-800">Boomer Friendly</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{testimonial.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.age}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${generationColors[testimonial.generation]}`}>
                      {testimonial.generation}
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-gray-700 leading-relaxed italic">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Rating */}
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">⭐</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary-600">50K+</div>
            <div className="text-gray-600">Documents Analyzed</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-secondary-600">4.9/5</div>
            <div className="text-gray-600">User Rating</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-accent-600">$2M+</div>
            <div className="text-gray-600">Hidden Fees Found</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-coral-600">18-65</div>
            <div className="text-gray-600">Age Range</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
