import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FileText, AlertTriangle, Scale, Users, Shield, Gavel, CreditCard, Ban, RefreshCw, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  const lastUpdated = 'March 9, 2026';

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
              <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              {/* Acceptance of Terms */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Scale className="w-6 h-6 mr-3 text-primary" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Welcome to ClauseWise. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and ClauseWise ("Company," "we," "our," or "us") governing your access to and use of the ClauseWise platform, website, and related services (collectively, the "Service").
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By creating an account, accessing, or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. If you do not agree to these Terms, you must not access or use the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You must be at least 18 years old and have the legal capacity to enter into these Terms. If you are using the Service on behalf of an organization, you represent and warrant that you have authority to bind that organization to these Terms.
                </p>
              </section>

              {/* Description of Service */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-primary" />
                  2. Description of Service
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  ClauseWise provides an AI-powered platform for analyzing financial documents, including but not limited to:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• <strong className="text-foreground">Document Analysis:</strong> AI-powered review of financial documents to identify clauses, risks, and key terms</li>
                  <li>• <strong className="text-foreground">Risk Assessment:</strong> Automated risk scoring and classification of document terms</li>
                  <li>• <strong className="text-foreground">AI Chat Assistant:</strong> Conversational AI to answer questions about financial documents and terminology</li>
                  <li>• <strong className="text-foreground">Document Comparison:</strong> Side-by-side comparison of multiple documents</li>
                  <li>• <strong className="text-foreground">Educational Content:</strong> Financial literacy resources and learning modules</li>
                  <li>• <strong className="text-foreground">Portfolio Management:</strong> Organization and tracking of analyzed documents</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.
                </p>
              </section>

              {/* Important Disclaimer */}
              <section className="bg-card rounded-xl p-8 border border-border border-l-4 border-l-destructive">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-destructive" />
                  3. Important Disclaimer - Not Professional Advice
                </h2>
                <div className="bg-destructive/10 rounded-lg p-4 mb-4">
                  <p className="text-foreground font-semibold">
                    CLAUSEWISE IS AN EDUCATIONAL AND INFORMATIONAL TOOL ONLY. IT IS NOT A SUBSTITUTE FOR PROFESSIONAL LEGAL, FINANCIAL, TAX, OR OTHER PROFESSIONAL ADVICE.
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The analysis, risk scores, clause identification, and AI-generated insights provided by ClauseWise are intended for general informational and educational purposes only. They should not be relied upon as:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• Legal advice or legal opinions</li>
                  <li>• Financial or investment advice</li>
                  <li>• Tax advice</li>
                  <li>• A complete or exhaustive review of any document</li>
                  <li>• A guarantee of document accuracy or completeness</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">You should always consult with qualified legal, financial, or other professional advisors</strong> before making important decisions based on the content of any financial document. ClauseWise does not create any attorney-client, financial advisor-client, or other professional relationship.
                </p>
              </section>

              {/* User Accounts */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-primary" />
                  4. User Accounts and Security
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To access certain features of the Service, you must create an account. When creating an account, you agree to:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• Provide accurate, current, and complete information</li>
                  <li>• Maintain and promptly update your account information</li>
                  <li>• Keep your password secure and confidential</li>
                  <li>• Not share your account credentials with any third party</li>
                  <li>• Immediately notify us of any unauthorized access or security breach</li>
                  <li>• Accept responsibility for all activities under your account</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our sole discretion.
                </p>
              </section>

              {/* Acceptable Use */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Ban className="w-6 h-6 mr-3 text-primary" />
                  5. Acceptable Use Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Upload documents containing malware, viruses, or harmful code</li>
                  <li>• Upload documents you do not have the right to share or analyze</li>
                  <li>• Use the Service for any illegal or unauthorized purpose</li>
                  <li>• Attempt to gain unauthorized access to any part of the Service</li>
                  <li>• Interfere with or disrupt the Service or servers</li>
                  <li>• Reverse engineer, decompile, or attempt to extract source code</li>
                  <li>• Use automated systems to access the Service without permission</li>
                  <li>• Impersonate any person or entity or misrepresent your affiliation</li>
                  <li>• Use the Service to harass, abuse, or harm others</li>
                  <li>• Violate any applicable laws or regulations</li>
                  <li>• Circumvent any security features or access controls</li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Gavel className="w-6 h-6 mr-3 text-primary" />
                  6. Intellectual Property Rights
                </h2>
                <h3 className="text-lg font-semibold text-foreground mt-4 mb-3">Our Content</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Service, including all content, features, functionality, software, text, graphics, logos, and trademarks, is owned by ClauseWise or its licensors and is protected by intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service without our express written permission.
                </p>
                
                <h3 className="text-lg font-semibold text-foreground mt-4 mb-3">Your Content</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You retain ownership of all documents and content you upload to the Service ("User Content"). By uploading User Content, you grant us a limited, non-exclusive, royalty-free license to process, analyze, and store your content solely for the purpose of providing the Service to you.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You represent and warrant that you have all necessary rights to upload and share your User Content and that it does not violate any third-party rights or applicable laws.
                </p>
              </section>

              {/* Payment Terms */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-primary" />
                  7. Payment Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Certain features of the Service may require payment. If you choose a paid subscription:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• You agree to pay all fees associated with your chosen plan</li>
                  <li>• Fees are billed in advance on a recurring basis (monthly or annually)</li>
                  <li>• All payments are non-refundable except as required by law</li>
                  <li>• You authorize us to charge your payment method automatically</li>
                  <li>• We may change pricing with 30 days' notice before your next billing cycle</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
                </p>
                <ul className="space-y-3 text-muted-foreground mb-4">
                  <li><strong className="text-foreground">No Consequential Damages:</strong> ClauseWise shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill.</li>
                  <li><strong className="text-foreground">Liability Cap:</strong> Our total liability for any claims arising from or related to the Service shall not exceed the greater of (a) the amount you paid us in the 12 months preceding the claim, or (b) $100.</li>
                  <li><strong className="text-foreground">No Warranty:</strong> The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Some jurisdictions do not allow limitations on implied warranties or exclusion of certain damages. In such jurisdictions, our liability is limited to the maximum extent permitted by law.
                </p>
              </section>

              {/* Indemnification */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless ClauseWise and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from or related to: (a) your use of the Service; (b) your User Content; (c) your violation of these Terms; or (d) your violation of any rights of another party.
                </p>
              </section>

              {/* Termination */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <RefreshCw className="w-6 h-6 mr-3 text-primary" />
                  10. Termination
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Either party may terminate this agreement at any time:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• <strong className="text-foreground">By You:</strong> You may delete your account at any time through Settings or by contacting us.</li>
                  <li>• <strong className="text-foreground">By Us:</strong> We may suspend or terminate your access if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive termination (including intellectual property, limitation of liability, and indemnification) shall survive.
                </p>
              </section>

              {/* Governing Law */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-primary" />
                  11. Governing Law and Dispute Resolution
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Any disputes arising from these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration or in the courts of competent jurisdiction, as applicable in your location.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on this page with a new "Last updated" date, and where appropriate, notifying you via email. Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
                </p>
              </section>

              {/* Severability */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">13. Severability and Waiver</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
                </p>
              </section>

              {/* Contact */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-3 text-primary" />
                  14. Contact Information
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:legal@clausewise.com" className="text-primary hover:underline">legal@clausewise.com</a></p>
                  <p><strong className="text-foreground">Support:</strong> <a href="mailto:support@clausewise.com" className="text-primary hover:underline">support@clausewise.com</a></p>
                </div>
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
