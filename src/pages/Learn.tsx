import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Finance30Course from "@/components/Finance30Course";
import { FadeIn } from "@/components/PageTransition";

const Learn = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 pb-10">
        <FadeIn>
          <Finance30Course />
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;
