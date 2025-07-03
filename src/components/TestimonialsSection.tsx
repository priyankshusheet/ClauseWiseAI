
import { Card, CardContent } from '@/components/ui/card';

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Simplifying Finance for Everyone
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            From students to professionals, everyone deserves clear financial guidance 💝
          </p>
          
          {/* Generation badges */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <span className="text-2xl">🎓</span>
              <span className="font-semibold text-gray-800">Student Friendly</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <span className="text-2xl">💼</span>
              <span className="font-semibold text-gray-800">Professional Ready</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              <span className="font-semibold text-gray-800">Family First</span>
            </div>
          </div>
        </div>

        {/* Simple value proposition cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-semibold text-lg mb-2">Analyze Documents</h3>
              <p className="text-gray-600">Upload your financial documents and get clear explanations of complex terms</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-semibold text-lg mb-2">Chat with AI</h3>
              <p className="text-gray-600">Ask questions about your finances and get personalized advice</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-semibold text-lg mb-2">Learn Finance</h3>
              <p className="text-gray-600">Access our 30-day course to build financial literacy</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
