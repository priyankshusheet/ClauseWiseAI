import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, CheckCircle, AlertTriangle, LucideIcon, Trophy } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  route: string;
  features: string[];
  pros: string[];
  cons: string[];
  onNavigate: (route: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  route, 
  features, 
  pros, 
  cons, 
  onNavigate 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border bg-card hover:-translate-y-2 cursor-pointer">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Icon and Title */}
          <div className="space-y-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {features.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Top 10 Button */}
          <div className="pt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(route);
              }}
              className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors duration-200 flex items-center space-x-1.5 group/btn"
            >
              <Trophy className="w-4 h-4" />
              <span>Top 10 Trending</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          </div>

          {/* Expandable Details - Show on hover or click */}
          <div className="space-y-4 border-t border-border pt-4">
            {/* Benefits */}
            <div>
              <h4 className="font-semibold text-secondary mb-2 flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Key Benefits
              </h4>
              <ul className="space-y-1">
                {pros.slice(0, 3).map((pro, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start">
                    <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-secondary flex-shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div>
              <h4 className="font-semibold text-destructive mb-2 flex items-center text-sm">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Main Risks
              </h4>
              <ul className="space-y-1">
                {cons.slice(0, 3).map((con, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start">
                    <AlertTriangle className="w-3 h-3 mr-2 mt-0.5 text-destructive flex-shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
