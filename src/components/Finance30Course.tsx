
import React, { useState } from "react";
import { CourseHeader } from "./CourseHeader";
import { LevelFilter } from "./LevelFilter";
import { ChapterCard } from "./ChapterCard";
import { CourseStats } from "./CourseStats";
import { EBookReader } from "./EBookReader";
import { chapters, levelColors, levelIcons, ChapterLevel } from "../data/courseChapters";

export const Finance30Course: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ChapterLevel | "All">("All");

  const filteredChapters = selectedLevel === "All" 
    ? chapters 
    : chapters.filter(ch => ch.level === selectedLevel);

  const levelStats = {
    Beginner: chapters.filter(ch => ch.level === "Beginner").length,
    Intermediate: chapters.filter(ch => ch.level === "Intermediate").length,
    Advanced: chapters.filter(ch => ch.level === "Advanced").length,
  };

  if (selectedChapter !== null) {
    const chapter = chapters.find(ch => ch.number === selectedChapter);
    if (!chapter) return null;

    return (
      <EBookReader 
        chapter={chapter} 
        onClose={() => setSelectedChapter(null)}
        levelColors={levelColors}
        levelIcons={levelIcons}
      />
    );
  }

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <CourseHeader />

      <LevelFilter
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        levelStats={levelStats}
        totalChapters={chapters.length}
        levelIcons={levelIcons}
        levelColors={levelColors}
      />

      {/* Chapter Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChapters.map((chapter) => (
          <ChapterCard
            key={chapter.number}
            chapter={chapter}
            levelColors={levelColors}
            levelIcons={levelIcons}
            onClick={() => setSelectedChapter(chapter.number)}
          />
        ))}
      </div>

      <CourseStats levelStats={levelStats} />
    </section>
  );
};

export default Finance30Course;
