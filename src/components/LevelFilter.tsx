import React from "react";
import { Users, TrendingUp, Zap } from "lucide-react";
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

const levelLucideIcons: Record<ChapterLevel, React.ReactNode> = {
  Beginner: <TrendingUp className="w-4 h-4" />,
  Intermediate: <Zap className="w-4 h-4" />,
  Advanced: <Zap className="w-4 h-4" />,
};

export const LevelFilter: React.FC<LevelFilterProps> = ({
  selectedLevel,
  onLevelChange,
  levelStats,
  totalChapters,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      <Button
        variant={selectedLevel === "All" ? "default" : "outline"}
        onClick={() => onLevelChange("All")}
        className="flex items-center gap-2 rounded-full"
      >
        <Users className="w-4 h-4" />
        All Levels
        <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-foreground/20 text-xs font-bold">
          {totalChapters}
        </span>
      </Button>

      {(["Beginner", "Intermediate", "Advanced"] as ChapterLevel[]).map((level) => (
        <Button
          key={level}
          variant={selectedLevel === level ? "default" : "outline"}
          onClick={() => onLevelChange(level)}
          className="flex items-center gap-2 rounded-full"
        >
          {levelLucideIcons[level]}
          {level}
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${selectedLevel === level ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"}`}>
            {levelStats[level]}
          </span>
        </Button>
      ))}
    </div>
  );
};
