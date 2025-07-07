
import React from "react";
import { ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChapterCardProps {
  chapter: any;
  levelColors: Record<string, string>;
  levelIcons: Record<string, string>;
  onClick: () => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, levelColors, levelIcons, onClick }) => {
  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4"
      style={{
        borderLeftColor: chapter.level === "Beginner" ? "#10b981" : 
                        chapter.level === "Intermediate" ? "#f59e0b" : "#ef4444"
      }}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${levelColors[chapter.level]} flex items-center justify-center text-white font-bold text-sm`}>
            {chapter.number}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${levelColors[chapter.level]}`}>
              {levelIcons[chapter.level]} {chapter.level}
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {chapter.readTime}
            </span>
          </div>
          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
            {chapter.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm leading-relaxed">
          {chapter.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-blue-600 text-sm font-medium group-hover:underline">
            Start Reading →
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
