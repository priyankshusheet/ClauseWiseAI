
import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Finance30Course from "@/components/Finance30Course";

const Learn = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Navigation />
      <main className="flex-1 pb-10">
        <Finance30Course />
      </main>
      <Footer />
    </div>
  );
};

export default Learn;
