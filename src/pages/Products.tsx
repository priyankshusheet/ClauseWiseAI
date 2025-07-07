
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FinancialProducts from '@/components/FinancialProducts';

const Products = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <main className="pt-16">
        <FinancialProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Products;
