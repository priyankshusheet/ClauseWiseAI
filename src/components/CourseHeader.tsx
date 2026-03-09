import React from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const CourseHeader: React.FC = () => {
  return (
    <motion.div 
      className="text-center mb-14"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12 }}
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5 border border-primary/20">
        <Sparkles className="w-4 h-4" />
        30 Chapters · Self-Paced
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
        Finance Mastery Course
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Transform your financial future with proven strategies from the world's best finance books.
      </p>
    </motion.div>
  );
};
