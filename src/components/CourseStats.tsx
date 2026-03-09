import React from "react";
import { TrendingUp, Zap, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CourseStatsProps {
  levelStats: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
  };
}

const stats = [
  {
    key: "Beginner" as const,
    label: "Beginner Chapters",
    sublabel: "Days 1–10",
    icon: TrendingUp,
    colorClass: "text-secondary",
    bgClass: "bg-secondary/10",
    borderClass: "border-secondary/20",
  },
  {
    key: "Intermediate" as const,
    label: "Intermediate Chapters",
    sublabel: "Days 11–20",
    icon: Zap,
    colorClass: "text-accent",
    bgClass: "bg-accent/10",
    borderClass: "border-accent/20",
  },
  {
    key: "Advanced" as const,
    label: "Advanced Chapters",
    sublabel: "Days 21–30",
    icon: Award,
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/20",
  },
];

export const CourseStats: React.FC<CourseStatsProps> = ({ levelStats }) => {
  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Course Overview</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map(({ key, label, sublabel, icon: Icon, colorClass, bgClass, borderClass }) => (
          <Card key={key} className={`border ${borderClass} bg-card`}>
            <CardContent className="pt-6 text-center">
              <div className={`w-12 h-12 rounded-xl ${bgClass} border ${borderClass} flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
              </div>
              <div className={`text-3xl font-bold ${colorClass} mb-1`}>{levelStats[key]}</div>
              <div className="text-sm font-medium text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
