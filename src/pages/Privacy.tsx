import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, Trash2, Mail, Database, Globe, Bell, UserCheck, Server, FileCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              {/* Introduction */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-primary" />
                  Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  ClauseWise ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial document analysis platform and related services (collectively, the "Service").
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using ClauseWise, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the Service.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-primary" />
                  Information We Collect
                </h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Personal Information</h3>
                <p className="text-muted-foreground mb-4">We collect information you provide directly to us, including:</p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li><strong className="text-foreground">Account Information:</strong> Full name, email address, and password when you create an account.</li>
                  <li><strong className="text-foreground">Profile Information:</strong> Occupation, preferred language, financial literacy level, and primary use case preferences collected during onboarding.</li>
                  <li><strong className="text-foreground">Communication Data:</strong> Information in emails, support requests, or feedback you send to us.</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Document Data</h3>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li><strong className="text-foreground">Uploaded Documents:</strong> Financial documents you upload for analysis, including PDFs, Word documents, and images.</li>
                  <li><strong className="text-foreground">Analysis Results:</strong> AI-generated risk assessments, clause identifications, and summaries derived from your documents.</li>
                  <li><strong className="text-foreground">Document Metadata:</strong> File names, sizes, types, and upload timestamps.</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Usage Information</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Chat Conversations:</strong> Messages exchanged with our AI assistant.</li>
                  <li><strong className="text-foreground">Feature Usage:</strong> Information about how you interact with our Service, including pages visited, features used, and actions taken.</li>
                  <li><strong className="text-foreground">Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
                  <li><strong className="text-foreground">Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience. See our Cookie section below.</li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Database className="w-6 h-6 mr-3 text-primary" />
                  How We Use Your Information
                </h2>
                <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li><strong className="text-foreground">Provide Services:</strong> Process and analyze your documents, generate risk assessments, and deliver AI-powered insights.</li>
                  <li><strong className="text-foreground">Personalize Experience:</strong> Customize content, recommendations, and AI responses based on your preferences and usage patterns.</li>
                  <li><strong className="text-foreground">Improve Our Service:</strong> Analyze usage patterns to enhance features, fix bugs, and develop new capabilities.</li>
                  <li><strong className="text-foreground">Communicate:</strong> Send service-related notifications, security alerts, and support messages.</li>
                  <li><strong className="text-foreground">Ensure Security:</strong> Detect, prevent, and respond to fraud, abuse, or security incidents.</li>
                  <li><strong className="text-foreground">Legal Compliance:</strong> Comply with applicable laws, regulations, and legal processes.</li>
                </ul>
              </section>

              {/* Data Storage and Security */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Server className="w-6 h-6 mr-3 text-primary" />
                  Data Storage and Security
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement robust security measures to protect your information:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li><strong className="text-foreground">Encryption:</strong> All data is encrypted in transit using TLS/SSL and at rest using AES-256 encryption.</li>
                  <li><strong className="text-foreground">Access Controls:</strong> Strict access controls ensure only authorized personnel can access user data.</li>
                  <li><strong className="text-foreground">Infrastructure:</strong> Our services are hosted on secure, SOC 2 compliant cloud infrastructure.</li>
                  <li><strong className="text-foreground">Regular Audits:</strong> We conduct regular security assessments and vulnerability testing.</li>
                  <li><strong className="text-foreground">Password Protection:</strong> Leaked password protection is enabled to prevent use of compromised credentials.</li>
                </ul>
              </section>

              {/* Data Retention */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-primary" />
                  Data Retention
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We retain your information for as long as necessary to provide our services and fulfill the purposes described in this policy:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li><strong className="text-foreground">Account Data:</strong> Retained for the duration of your account plus 30 days after deletion request.</li>
                  <li><strong className="text-foreground">Document Analyses:</strong> Stored according to your configurable retention policy (default: 365 days).</li>
                  <li><strong className="text-foreground">Chat History:</strong> Retained until you delete the conversation or your account.</li>
                  <li><strong className="text-foreground">Audit Logs:</strong> Maintained for compliance purposes (typically 2-7 years depending on jurisdiction).</li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-primary" />
                  Data Sharing and Disclosure
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li><strong className="text-foreground">Service Providers:</strong> With trusted third-party vendors who assist in operating our Service (e.g., cloud hosting, AI processing), under strict confidentiality agreements.</li>
                  <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, subpoena, or legal process, or to protect our rights and safety.</li>
                  <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with notice to you.</li>
                  <li><strong className="text-foreground">With Your Consent:</strong> When you explicitly authorize us to share specific information.</li>
                </ul>
              </section>

              {/* Your Rights */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <UserCheck className="w-6 h-6 mr-3 text-primary" />
                  Your Rights (GDPR & Global Privacy)
                </h2>
                <p className="text-muted-foreground mb-4">You have the following rights regarding your personal data:</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li><strong className="text-foreground">Right to Access:</strong> Request a copy of all personal data we hold about you.</li>
                  <li><strong className="text-foreground">Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                  <li><strong className="text-foreground">Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten").</li>
                  <li><strong className="text-foreground">Right to Portability:</strong> Receive your data in a structured, machine-readable format.</li>
                  <li><strong className="text-foreground">Right to Object:</strong> Object to processing of your data for specific purposes.</li>
                  <li><strong className="text-foreground">Right to Restrict Processing:</strong> Request limitation of how we use your data.</li>
                  <li><strong className="text-foreground">Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, visit <Link to="/settings" className="text-primary hover:underline">Settings → Privacy (GDPR)</Link> or contact us at <a href="mailto:privacy@clausewise.com" className="text-primary hover:underline">privacy@clausewise.com</a>.
                </p>
              </section>

              {/* Cookies */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <FileCheck className="w-6 h-6 mr-3 text-primary" />
                  Cookies and Tracking Technologies
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• Keep you signed in to your account</li>
                  <li>• Remember your preferences and settings</li>
                  <li>• Understand how you use our Service</li>
                  <li>• Improve performance and user experience</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  You can control cookies through your browser settings. Disabling certain cookies may limit functionality of the Service.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  ClauseWise is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href="mailto:privacy@clausewise.com" className="text-primary hover:underline">privacy@clausewise.com</a>.
                </p>
              </section>

              {/* International Transfers */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by relevant data protection authorities, to protect your information in compliance with applicable laws.
                </p>
              </section>

              {/* Changes to Policy */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Bell className="w-6 h-6 mr-3 text-primary" />
                  Changes to This Privacy Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated "Last updated" date, and where appropriate, notify you via email. Your continued use of the Service after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact */}
              <section className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-3 text-primary" />
                  Contact Us
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:privacy@clausewise.com" className="text-primary hover:underline">privacy@clausewise.com</a></p>
                  <p><strong className="text-foreground">Support:</strong> <a href="mailto:support@clausewise.com" className="text-primary hover:underline">support@clausewise.com</a></p>
                </div>
                <p className="text-muted-foreground mt-4">
                  For GDPR-related inquiries, our Data Protection Officer can be reached at <a href="mailto:dpo@clausewise.com" className="text-primary hover:underline">dpo@clausewise.com</a>.
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
