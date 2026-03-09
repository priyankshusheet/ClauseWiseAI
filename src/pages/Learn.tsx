import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Finance30Course from "@/components/Finance30Course";
import { motion } from "framer-motion";

const Learn = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <main className="pt-28 pb-16">
          <Finance30Course />
        </main>
        <Footer />
      </motion.div>
    </div>
  );
};

export default Learn;
