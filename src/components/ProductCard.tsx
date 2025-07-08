
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Star, CheckCircle, AlertTriangle } from 'lucide-react';
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
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:-translate-y-2 cursor-pointer">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Icon and Title */}
          <div className="space-y-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {features.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Learn More Button */}
          <div className="pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Learn More</span>
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showDetails ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4 animate-in slide-in-from-top-2 duration-300">
              {/* Benefits */}
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Key Benefits
                </h4>
                <ul className="space-y-1">
                  {pros.slice(0, 3).map((pro, index) => (
                    <li key={index} className="text-sm text-green-800 dark:text-green-300 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Main Risks
                </h4>
                <ul className="space-y-1">
                  {cons.slice(0, 3).map((con, index) => (
                    <li key={index} className="text-sm text-red-800 dark:text-red-300 flex items-start">
                      <span className="text-red-500 mr-2">⚠</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              {/* View Top 10 Button */}
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
