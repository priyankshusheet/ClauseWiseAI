
import React from "react";

interface CourseStatsProps {
  levelStats: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
  };
}

export const CourseStats: React.FC<CourseStatsProps> = ({ levelStats }) => {
  return (
    <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{levelStats.Beginner}</div>
            <div className="text-gray-600">Beginner Chapters</div>
            <div className="text-sm text-gray-500 mt-1">Days 1-10</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{levelStats.Intermediate}</div>
            <div className="text-gray-600">Intermediate Chapters</div>
            <div className="text-sm text-gray-500 mt-1">Days 11-20</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{levelStats.Advanced}</div>
            <div className="text-gray-600">Advanced Chapters</div>
            <div className="text-sm text-gray-500 mt-1">Days 21-30</div>
          </div>
        </div>
      </div>
    </div>
  );
};
