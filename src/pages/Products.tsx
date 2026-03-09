import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, TrendingUp, CheckCircle, AlertTriangle, RefreshCw, Calendar, Trophy, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTop10Lists, Top10Product } from '@/hooks/useTop10Lists';
import { financialProductsData, ProductCategory, getAllProductsInCategory, ProductInfo } from '@/data/financialProductsData';
import { ListSkeleton } from '@/components/LoadingStates';
import EmptyState from '@/components/EmptyState';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const PRODUCT_METADATA: Record<string, { title: string; subtitle: string; icon: string; color: string; category: ProductCategory }> = {
  'credit-cards': {
    title: 'Top 10 Credit Cards in India',
    subtitle: 'Based on rewards, offers, and user popularity',
    icon: '💳',
    color: 'from-blue-500 to-cyan-500',
    category: 'Credit Cards' as ProductCategory,
  },
  'health-insurance': {
    title: 'Top 10 Health Insurance Plans in India',
    subtitle: 'Based on coverage, claim ratio & trust',
    icon: '🏥',
    color: 'from-green-500 to-emerald-500',
    category: 'Health Insurance' as ProductCategory,
  },
  'life-insurance': {
    title: 'Top 10 Life Insurance Companies in India',
    subtitle: 'Based on claim settlement and policy features',
    icon: '🛡️',
    color: 'from-purple-500 to-violet-500',
    category: 'Life Insurance' as ProductCategory,
  },
  'loans': {
    title: 'Top 10 Loans in India',
    subtitle: 'Most competitive rates and terms',
    icon: '🏠',
    color: 'from-orange-500 to-red-500',
    category: 'Loans' as ProductCategory,
  },
  'ulips': {
    title: 'Top 10 ULIPs in India',
    subtitle: 'Best returns with insurance coverage',
    icon: '📈',
    color: 'from-indigo-500 to-purple-500',
    category: 'ULIPs' as ProductCategory,
  },
  'mutual-funds': {
    title: 'Top 10 Mutual Funds in India',
    subtitle: 'Top performers across categories',
    icon: '💰',
    color: 'from-yellow-500 to-orange-500',
    category: 'Mutual Funds' as ProductCategory,
  },
};

const Products = () => {
  const { category } = useParams();
  const { toast } = useToast();
  const { data: top10Data, loading, error, refreshList } = useTop10Lists(category);
  const [refreshing, setRefreshing] = useState(false);

  const currentProduct = category ? PRODUCT_METADATA[category] : null;

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link to="/" className="text-primary hover:underline">Go back to home</Link>
        </div>
      </div>
    );
  }

  // Use AI-generated data if available, otherwise fall back to static data
  const hasAIData = top10Data?.products && top10Data.products.length > 0;
  
  // Fallback to static data
  const staticProductsData = getAllProductsInCategory(currentProduct.category);
  const fallbackProducts = Object.entries(staticProductsData).map(([name, data], index) => {
    const productInfo = data as ProductInfo;
    return {
      rank: index + 1,
      name,
      provider: name.split(' ')[0],
      highlight: productInfo.Pros[0] || 'Great financial product',
      rating: 4.5 - (index * 0.1),
      pros: productInfo.Pros,
      cons: productInfo.Cons,
    } as Top10Product;
  });

  const products = hasAIData ? top10Data!.products : fallbackProducts;

  const handleRefresh = async () => {
    if (!category) return;
    setRefreshing(true);
    try {
      await refreshList(category, true);
      toast({ title: 'List refreshed!', description: 'Top 10 updated with latest trends.' });
    } catch (err) {
      toast({ title: 'Refresh failed', description: 'Try again later.', variant: 'destructive' });
    } finally {
      setRefreshing(false);
    }
  };

  const lastUpdated = top10Data?.generated_at
    ? formatDistanceToNow(new Date(top10Data.generated_at), { addSuffix: true })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentProduct.color} flex items-center justify-center text-3xl`}
                >
                  {currentProduct.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{currentProduct.title}</h1>
                  <p className="text-muted-foreground mt-1">{currentProduct.subtitle}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {refreshing ? 'Updating...' : 'Refresh List'}
              </Button>
            </div>

            <div className="flex items-center flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                {hasAIData ? 'AI-curated based on current trends' : 'Based on market data'}
              </span>
              {lastUpdated && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Updated {lastUpdated}
                </span>
              )}
            </div>

            {top10Data?.metadata?.trendNote && (
              <Alert className="mt-4 bg-primary/5 border-primary/20">
                <TrendingUp className="w-4 h-4" />
                <AlertDescription>{top10Data.metadata.trendNote}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Products List */}
          {loading ? (
            <ListSkeleton count={5} />
          ) : error ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  type="documents"
                  title="Unable to load products"
                  description={error}
                >
                  <Button onClick={handleRefresh} disabled={refreshing}>
                    Try Again
                  </Button>
                </EmptyState>
              </CardContent>
            </Card>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  type="documents"
                  title="No products available"
                  description="Click refresh to generate the latest Top 10 list"
                >
                  <Button onClick={handleRefresh} disabled={refreshing}>
                    Generate List
                  </Button>
                </EmptyState>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {products.map((product, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-border bg-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Rank indicator */}
                      <div
                        className={`w-16 flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${currentProduct.color} text-white font-bold text-2xl`}
                      >
                        {product.rank || index + 1}
                      </div>

                      <div className="flex-1 p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                                {product.rank === 1 && (
                                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 gap-1">
                                    <Trophy className="w-3 h-3" />
                                    #1 Pick
                                  </Badge>
                                )}
                              </div>

                              {product.provider && (
                                <p className="text-sm text-muted-foreground mb-2">by {product.provider}</p>
                              )}

                              <p className="text-muted-foreground">{product.highlight}</p>

                              {product.bestFor && (
                                <p className="text-sm text-primary mt-2">
                                  <strong>Best for:</strong> {product.bestFor}
                                </p>
                              )}

                              <div className="flex items-center space-x-4 mt-3">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm font-medium text-foreground">
                                    {product.rating?.toFixed(1) || '4.5'}
                                  </span>
                                </div>
                                {product.keyFeatures && product.keyFeatures.length > 0 && (
                                  <div className="flex gap-2">
                                    {product.keyFeatures.slice(0, 2).map((feature, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="ml-4">
                              <Link to="/chat">
                                <Button size="sm">Analyze</Button>
                              </Link>
                            </div>
                          </div>

                          {/* Pros and Cons */}
                          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                            {/* Benefits */}
                            <div>
                              <h4 className="font-semibold text-secondary mb-2 flex items-center text-sm">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Key Benefits
                              </h4>
                              <ul className="space-y-1">
                                {product.pros.slice(0, 3).map((pro, proIndex) => (
                                  <li
                                    key={proIndex}
                                    className="text-sm text-muted-foreground flex items-start"
                                  >
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
                                {product.cons.slice(0, 3).map((con, conIndex) => (
                                  <li
                                    key={conIndex}
                                    className="text-sm text-muted-foreground flex items-start"
                                  >
                                    <AlertTriangle className="w-3 h-3 mr-2 mt-0.5 text-destructive flex-shrink-0" />
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <Card className="border-border">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Need Help Choosing?</h2>
                <p className="text-muted-foreground mb-6">
                  Chat with our AI assistant to get personalized recommendations based on your needs
                </p>
                <Link to="/chat">
                  <Button size="lg">Start AI Chat</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
