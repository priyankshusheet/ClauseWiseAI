import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FileText, AlertTriangle, Scale, Users } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Scale className="w-6 h-6 mr-3 text-primary" />
                  Acceptance of Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using ClauseWise, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-primary" />
                  Description of Service
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  ClauseWise provides AI-powered financial document analysis services. Our platform helps users 
                  understand complex financial documents, identify potential risks, and make informed decisions.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our services include document analysis, AI chat assistance, and educational content about 
                  financial products and terms.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibilities</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li>You must provide accurate information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must not upload documents containing malicious content</li>
                  <li>You must not use the service for any illegal purposes</li>
                  <li>You must not attempt to reverse engineer or exploit the platform</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border border-l-4 border-l-accent">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-accent" />
                  Important Disclaimer
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">ClauseWise is not a substitute for professional legal or financial advice.</strong>{' '}
                  Our AI analysis is designed to help you understand financial documents, but it should not be 
                  relied upon as legal, financial, or professional advice. We recommend consulting with qualified 
                  professionals for important financial decisions.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content, features, and functionality of ClauseWise are owned by us and are protected by 
                  intellectual property laws. You retain ownership of documents you upload, but grant us a 
                  limited license to process them for providing our services.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, ClauseWise shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages arising from your use of the service. 
                  Our total liability shall not exceed the amount paid by you for the service.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of significant 
                  changes via email or through the platform. Continued use of the service after changes 
                  constitutes acceptance of the modified terms.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:legal@clausewise.com" className="text-primary hover:underline">legal@clausewise.com</a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
