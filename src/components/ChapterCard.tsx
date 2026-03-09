import React from "react";
import { ChevronRight, Clock, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ChapterCardProps {
  chapter: any;
  levelColors: Record<string, string>;
  levelIcons: Record<string, string>;
  onClick: () => void;
}

const levelBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Beginner: "secondary",
  Intermediate: "default",
  Advanced: "destructive",
};

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onClick }) => {
  const badgeVariant = levelBadgeVariant[chapter.level] ?? "outline";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className="group cursor-pointer hover:shadow-lg transition-shadow duration-300 border border-border bg-card h-full flex flex-col"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {chapter.number}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant={badgeVariant} className="text-xs">
              {chapter.level}
            </Badge>
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {chapter.readTime}
            </span>
          </div>
          <CardTitle className="text-base leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
            {chapter.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {chapter.description}
          </p>
          <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
            <BookOpen className="w-4 h-4" />
            <span>Start Reading</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
