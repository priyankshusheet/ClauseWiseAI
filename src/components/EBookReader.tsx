
import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EBookReaderProps {
  chapter: any;
  onClose: () => void;
  levelColors: Record<string, string>;
  levelIcons: Record<string, string>;
}

export const EBookReader: React.FC<EBookReaderProps> = ({ chapter, onClose, levelColors, levelIcons }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Split content into pages (roughly 800 characters per page for readability)
  const createPages = (content: string) => {
    const sections = content.split('\n\n');
    const pages: string[] = [];
    let currentPageContent = '';
    
    sections.forEach(section => {
      if (currentPageContent.length + section.length > 800 && currentPageContent.length > 0) {
        pages.push(currentPageContent.trim());
        currentPageContent = section + '\n\n';
      } else {
        currentPageContent += section + '\n\n';
      }
    });
    
    if (currentPageContent.trim()) {
      pages.push(currentPageContent.trim());
    }
    
    // Add takeaways as final page
    if (chapter.takeaways) {
      pages.push(`## Key Takeaways\n\n${chapter.takeaways.map((point: string, idx: number) => `${idx + 1}. ${point}`).join('\n\n')}`);
    }
    
    return pages;
  };

  const pages = createPages(chapter.content);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-bold mb-4 text-gray-900">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-semibold mb-3 text-gray-800 mt-6">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-medium mb-2 text-gray-700 mt-4">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-semibold mb-2 text-gray-800">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('- ')) {
        return <li key={idx} className="ml-4 mb-1 text-gray-700">{line.substring(2)}</li>;
      } else if (line.trim()) {
        return <p key={idx} className="mb-3 text-gray-700 leading-relaxed">{line}</p>;
      }
      return <br key={idx} />;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${levelColors[chapter.level]} flex items-center justify-center text-white font-bold`}>
              {chapter.number}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{chapter.title}</h2>
              <p className="text-sm text-gray-500">{levelIcons[chapter.level]} {chapter.level} • Day {chapter.number}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            <Home className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>

        {/* Book Content */}
        <div className="flex-1 flex">
          {/* Left Page */}
          <div className={`w-1/2 p-8 border-r border-gray-200 transition-all duration-300 ${isFlipping ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="h-full overflow-y-auto prose prose-sm max-w-none">
              {formatContent(pages[currentPage] || '')}
            </div>
          </div>

          {/* Right Page */}
          <div className={`w-1/2 p-8 transition-all duration-300 ${isFlipping ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="h-full overflow-y-auto prose prose-sm max-w-none">
              {currentPage + 1 < pages.length ? formatContent(pages[currentPage + 1]) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>End of Chapter</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Page {Math.floor(currentPage / 2) + 1} of {Math.ceil(pages.length / 2)}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(pages.length / 2) }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentPage / 2) === idx ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={currentPage >= pages.length - 1}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
