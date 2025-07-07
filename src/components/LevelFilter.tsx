
import React from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChapterLevel = "Beginner" | "Intermediate" | "Advanced";

interface LevelFilterProps {
  selectedLevel: ChapterLevel | "All";
  onLevelChange: (level: ChapterLevel | "All") => void;
  levelStats: Record<ChapterLevel, number>;
  totalChapters: number;
  levelIcons: Record<ChapterLevel, string>;
  levelColors: Record<ChapterLevel, string>;
}

export const LevelFilter: React.FC<LevelFilterProps> = ({
  selectedLevel,
  onLevelChange,
  levelStats,
  totalChapters,
  levelIcons,
  levelColors
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      <Button
        variant={selectedLevel === "All" ? "default" : "outline"}
        onClick={() => onLevelChange("All")}
        className="flex items-center gap-2"
      >
        <Users className="w-4 h-4" />
        All Levels ({totalChapters})
      </Button>
      {(["Beginner", "Intermediate", "Advanced"] as ChapterLevel[]).map((level) => (
        <Button
          key={level}
          variant={selectedLevel === level ? "default" : "outline"}
          onClick={() => onLevelChange(level)}
          className={`flex items-center gap-2 ${
            selectedLevel === level 
              ? `bg-gradient-to-r ${levelColors[level]} text-white border-0` 
              : ""
          }`}
        >
          <span>{levelIcons[level]}</span>
          {level} ({levelStats[level]})
        </Button>
      ))}
    </div>
  );
};
