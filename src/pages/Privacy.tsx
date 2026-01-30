import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, Trash2, Mail } from 'lucide-react';

const Privacy = () => {
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-primary" />
                  Our Commitment to Privacy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  ClauseWise is committed to protecting your privacy. This policy explains how we collect, 
                  use, and safeguard your information when you use our financial document analysis platform.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-primary" />
                  Information We Collect
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li><strong className="text-foreground">Account Information:</strong> Email address and name when you create an account.</li>
                  <li><strong className="text-foreground">Document Data:</strong> Documents you upload for analysis are processed in real-time and are not stored permanently on our servers.</li>
                  <li><strong className="text-foreground">Usage Data:</strong> Anonymous analytics about how you use the platform to improve our services.</li>
                  <li><strong className="text-foreground">Chat Conversations:</strong> Conversations with our AI assistant may be stored to improve your experience and our service quality.</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li>To provide and improve our document analysis services</li>
                  <li>To communicate with you about your account and our services</li>
                  <li>To ensure the security of our platform</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use industry-standard encryption (TLS/SSL) to protect data in transit. 
                  Your documents are processed securely and are not permanently stored on our servers. 
                  We implement appropriate technical and organizational measures to protect your personal data.
                </p>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Trash2 className="w-6 h-6 mr-3 text-primary" />
                  Your Rights
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
                  <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate data</li>
                  <li><strong className="text-foreground">Deletion:</strong> Request deletion of your data</li>
                  <li><strong className="text-foreground">Portability:</strong> Request your data in a portable format</li>
                  <li><strong className="text-foreground">Objection:</strong> Object to processing of your data</li>
                </ul>
              </section>

              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-3 text-primary" />
                  Contact Us
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us at <a href="mailto:privacy@clausewise.com" className="text-primary hover:underline">privacy@clausewise.com</a>
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

export default Privacy;
