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

const levelBadgeClasses: Record<string, string> = {
  Beginner: "bg-secondary/15 text-secondary border-secondary/30 hover:bg-secondary/15",
  Intermediate: "bg-accent/15 text-accent border-accent/30 hover:bg-accent/15",
  Advanced: "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/15",
};

const levelNumberClasses: Record<string, string> = {
  Beginner: "bg-secondary/10 text-secondary border-secondary/20",
  Intermediate: "bg-accent/10 text-accent border-accent/20",
  Advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className="group cursor-pointer transition-all duration-300 border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-sm ${levelNumberClasses[chapter.level]}`}>
              {chapter.number}
            </div>
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className={`text-xs font-medium ${levelBadgeClasses[chapter.level]}`}>
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
        <CardContent className="flex-1 flex flex-col justify-between pt-0">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {chapter.description}
          </p>
          <div className="flex items-center gap-1.5 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <BookOpen className="w-4 h-4" />
            <span>Start Reading →</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
