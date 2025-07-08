
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  title: string;
  description: string;
  icon: string;
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
  icon, 
  color, 
  route, 
  features, 
  pros, 
  cons, 
  onNavigate 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:-translate-y-2 cursor-pointer">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Icon and Title */}
          <div className="space-y-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {features.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Learn More Button */}
          <div className="pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Learn More</span>
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showDetails ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="space-y-4 border-t pt-4 animate-in slide-in-from-top-2 duration-300">
              {/* Pros */}
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Benefits
                </h4>
                <ul className="space-y-1">
                  {pros.map((pro, index) => (
                    <li key={index} className="text-sm text-green-800 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Risks to Consider
                </h4>
                <ul className="space-y-1">
                  {cons.map((con, index) => (
                    <li key={index} className="text-sm text-red-800 flex items-start">
                      <span className="text-red-500 mr-2">⚠</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              {/* View More Button */}
              <button
                onClick={() => onNavigate(route)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                View Top 10 {title} →
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
