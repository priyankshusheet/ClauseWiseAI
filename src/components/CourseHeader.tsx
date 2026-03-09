import React from "react";
import { BookOpen } from "lucide-react";

export const CourseHeader: React.FC = () => {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5 border border-primary/20">
        <BookOpen className="w-4 h-4" />
        Financial Literacy Course
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
        30-Day Finance Mastery
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Transform your financial future with our comprehensive course based on proven strategies from the world's best finance books.
      </p>
    </div>
  );
};
