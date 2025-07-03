import React, { useState } from "react";
import { BookOpen, ChevronRight, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Chapter level theme colors
const levelColors: Record<"Beginner" | "Intermediate" | "Advanced", string> = {
  Beginner: "from-green-500 to-emerald-600",
  Intermediate: "from-yellow-500 to-orange-600", 
  Advanced: "from-red-500 to-rose-600",
};

const levelIcons: Record<"Beginner" | "Intermediate" | "Advanced", string> = {
  Beginner: "🌱",
  Intermediate: "🚀", 
  Advanced: "🎯",
};

type ChapterLevel = "Beginner" | "Intermediate" | "Advanced";

// Simplified chapters data
const chapters = [
  {
    number: 1,
    level: "Beginner" as ChapterLevel,
    title: "Why Financial Education Matters More Than Ever",
    description: "Explore why money isn't taught in schools, the cost of financial ignorance, and how mindsets shape our wealth journey.",
    readTime: "15 min",
    content: `Money is one of life's most important skills, yet most schools do not teach it. "Rich Dad Poor Dad" and "The Barefoot Investor" stress that the lack of financial literacy keeps people trapped in cycles of debt, missed opportunities, or dependency.

**The Cost of Financial Ignorance:** Not knowing how to manage money often leads to poor decisions—overborrowing, under-saving, or emotional spending. Financial education empowers you to avoid mistakes, build assets, and seize opportunities.

**Mindsets:** Are you behaving as:
- An *Employee* (seeking stability/regular paycheck)?
- An *Entrepreneur* (looking to build and grow)?
- An *Investor* (seeking to make your money work for you)?

Most people internalize only one perspective—but understanding all three expands your options.`,
    takeaways: [
      "Recognize the impact of financial education on your future.",
      "Consider your own mindset about money and career.",
      "Reflect: Are you open to acting like an entrepreneur or investor?",
    ],
  },
  {
    number: 2,
    level: "Beginner" as ChapterLevel,
    title: "The Psychology Behind Money",
    description: "Understand how emotions like fear and greed can distort money decisions, and why patience trumps intelligence.",
    readTime: "12 min",
    content: `Morgan Housel ("The Psychology of Money") teaches that most financial decisions are emotional, not rational. Fear and greed are common drivers. Doing well with money is more about how you behave than what you know—patience, self-control, and a long-term mindset beat IQ.

Understanding your biases—envy, impatience, fear—helps you act in your own best interests.

**Building Patience:** The market rewards those who wait and penalizes those who panic. Cultivate patience through habits (e.g., automatic investing), setting goals, and learning from your emotional triggers.`,
    takeaways: [
      "Recognize your emotional habits around money.",
      "Practice patience, especially during market swings.",
      "Remember: Long-term thinking builds wealth.",
    ],
  },
  // Add more simplified chapters here - keeping first 2 for brevity
];

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
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedChapter(null)}
          className="mb-6"
        >
          ← Back to Course
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${levelColors[chapter.level]} flex items-center justify-center text-white text-lg font-bold`}>
                {chapter.number}
              </div>
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                  {levelIcons[chapter.level]} {chapter.level} • Day {chapter.number}
                </div>
                <CardTitle className="text-2xl">{chapter.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue max-w-none mb-8">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {chapter.content}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Key Takeaways</h4>
              <ul className="space-y-2">
                {chapter.takeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-blue-800">
                    <span className="text-blue-600 mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
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

      {/* Level Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button
          variant={selectedLevel === "All" ? "default" : "outline"}
          onClick={() => setSelectedLevel("All")}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          All Levels ({chapters.length})
        </Button>
        {(["Beginner", "Intermediate", "Advanced"] as ChapterLevel[]).map((level) => (
          <Button
            key={level}
            variant={selectedLevel === level ? "default" : "outline"}
            onClick={() => setSelectedLevel(level)}
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

      {/* Chapter Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChapters.map((chapter) => (
          <Card
            key={chapter.number}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4"
            style={{
              borderLeftColor: chapter.level === "Beginner" ? "#10b981" : 
                              chapter.level === "Intermediate" ? "#f59e0b" : "#ef4444"
            }}
            onClick={() => setSelectedChapter(chapter.number)}
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
                  Start Learning →
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course Stats */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{levelStats.Beginner}</div>
              <div className="text-gray-600">Beginner Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{levelStats.Intermediate}</div>
              <div className="text-gray-600">Intermediate Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{levelStats.Advanced}</div>
              <div className="text-gray-600">Advanced Chapters</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Finance30Course;
