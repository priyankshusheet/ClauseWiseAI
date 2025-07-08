
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

  // Split content into pages (roughly 600 characters per page for better readability)
  const createPages = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const pages: string[] = [];
    let currentPageContent = '';
    
    paragraphs.forEach(paragraph => {
      // If adding this paragraph would make the page too long, start a new page
      if (currentPageContent.length + paragraph.length > 600 && currentPageContent.length > 0) {
        pages.push(currentPageContent.trim());
        currentPageContent = paragraph + '\n\n';
      } else {
        currentPageContent += paragraph + '\n\n';
      }
    });
    
    // Add the last page if it has content
    if (currentPageContent.trim()) {
      pages.push(currentPageContent.trim());
    }
    
    // Add takeaways as final page if they exist
    if (chapter.takeaways && chapter.takeaways.length > 0) {
      pages.push(`## Key Takeaways\n\n${chapter.takeaways.map((point: string, idx: number) => `${idx + 1}. ${point}`).join('\n\n')}`);
    }
    
    return pages.length > 0 ? pages : ['Content not available'];
  };

  const pages = createPages(chapter.content);
  const totalPages = pages.length;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
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
        return <h1 key={idx} className="text-3xl font-bold mb-6 text-gray-900">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-semibold mb-4 text-gray-800 mt-8">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-medium mb-3 text-gray-700 mt-6">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-semibold mb-3 text-gray-800">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={idx} className="ml-6 mb-2 text-gray-700 list-disc">{line.substring(2)}</li>;
      } else if (line.match(/^\d+\.\s/)) {
        return <li key={idx} className="ml-6 mb-2 text-gray-700 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
      } else if (line.startsWith('🔥') || line.startsWith('💡') || line.startsWith('✅') || line.startsWith('❌')) {
        return <p key={idx} className="mb-3 text-gray-700 leading-relaxed font-medium bg-blue-50 p-3 rounded-lg">{line}</p>;
      } else if (line.trim()) {
        return <p key={idx} className="mb-4 text-gray-700 leading-relaxed text-lg">{line}</p>;
      }
      return <br key={idx} />;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${levelColors[chapter.level]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {chapter.number}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{chapter.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{levelIcons[chapter.level]} {chapter.level} • Day {chapter.number}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose} className="hover:bg-gray-100">
            <Home className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>

        {/* Book Content */}
        <div className="flex-1 p-8 overflow-hidden">
          <div className={`h-full transition-all duration-300 ${isFlipping ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="h-full overflow-y-auto prose prose-lg max-w-none">
              {formatContent(pages[currentPage] || 'Content not available')}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600 font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 10) }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                    currentPage === idx ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentPage(idx)}
                />
              ))}
              {totalPages > 10 && <span className="text-gray-400 ml-2">...</span>}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
