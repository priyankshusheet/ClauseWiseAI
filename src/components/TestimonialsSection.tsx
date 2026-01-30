import { Card, CardContent } from '@/components/ui/card';
import { FileSearch, MessageSquare, BookOpen } from 'lucide-react';

const TestimonialsSection = () => {
  const valueProps = [
    {
      icon: FileSearch,
      title: 'Analyze Documents',
      description: 'Upload your financial documents and get clear explanations of complex terms'
    },
    {
      icon: MessageSquare,
      title: 'Chat with AI',
      description: 'Ask questions about your finances and get personalized guidance'
    },
    {
      icon: BookOpen,
      title: 'Learn Finance',
      description: 'Access our structured course to build financial literacy'
    }
  ];

  const userGroups = [
    { icon: BookOpen, label: 'Student Friendly' },
    { icon: FileSearch, label: 'Professional Ready' },
    { icon: MessageSquare, label: 'Family First' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-muted/50 to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Simplifying Finance for Everyone
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            From students to professionals, everyone deserves clear financial guidance
          </p>
          
          {/* User group badges */}
          <div className="flex flex-wrap justify-center gap-4">
            {userGroups.map((group, index) => (
              <div key={index} className="flex items-center space-x-2 bg-card rounded-full px-4 py-2 shadow-sm border border-border">
                <group.icon className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">{group.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Value proposition cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <prop.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">{prop.title}</h3>
                <p className="text-muted-foreground">{prop.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
