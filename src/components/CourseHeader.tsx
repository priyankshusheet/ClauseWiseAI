
import React from "react";
import { BookOpen } from "lucide-react";

export const CourseHeader: React.FC = () => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          30-Day Finance Mastery
        </h2>
      </div>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Transform your financial future with our comprehensive course based on proven strategies from the world's best finance books
      </p>
    </div>
  );
};
