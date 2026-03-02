import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Home, Type, Moon, Sun, Coffee, Minus, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EBookReaderProps {
  chapter: any;
  onClose: () => void;
  levelColors: Record<string, string>;
  levelIcons: Record<string, string>;
}

type Theme = 'light' | 'sepia' | 'dark';

export const EBookReader: React.FC<EBookReaderProps> = ({ chapter, onClose, levelColors, levelIcons }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [theme, setTheme] = useState<Theme>('sepia');
  const [fontSize, setFontSize] = useState(18);

  // Persistence for reader settings
  useEffect(() => {
    const savedTheme = localStorage.getItem('ebook-theme') as Theme;
    const savedFontSize = localStorage.getItem('ebook-font-size');
    if (savedTheme) setTheme(savedTheme);
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, []);

  useEffect(() => {
    localStorage.setItem('ebook-theme', theme);
    localStorage.setItem('ebook-font-size', fontSize.toString());
  }, [theme, fontSize]);

  // Split content into pages (roughly 600-800 characters depending on font size)
  const createPages = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const pages: string[] = [];
    let currentPageContent = '';
    
    // Adjust character limit based on font size to avoid overflow
    const charLimit = Math.max(400, 800 - (fontSize - 16) * 20);
    
    paragraphs.forEach(paragraph => {
      if (currentPageContent.length + paragraph.length > charLimit && currentPageContent.length > 0) {
        pages.push(currentPageContent.trim());
        currentPageContent = paragraph + '\n\n';
      } else {
        currentPageContent += paragraph + '\n\n';
      }
    });
    
    if (currentPageContent.trim()) {
      pages.push(currentPageContent.trim());
    }
    
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
      }, 250);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 250);
    }
  };

  const themeClasses = {
    light: "bg-[#ffffff] text-slate-900 border-slate-200",
    sepia: "bg-[#f4ecd8] text-[#5b4636] border-[#e1d3b3]",
    dark: "bg-[#1a1a1a] text-[#d1d1d1] border-[#333333]"
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl md:text-4xl font-bold mb-8 font-display">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl md:text-3xl font-semibold mb-6 mt-10 border-b border-current pb-2">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl md:text-2xl font-medium mb-4 mt-8 italic">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-bold mb-4 opacity-90">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('> ')) {
        return <blockquote key={idx} className="border-l-4 border-current pl-6 py-2 my-6 italic opacity-80 text-xl font-serif">"{line.substring(2)}"</blockquote>;
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={idx} className="ml-8 mb-3 list-disc opacity-90">{line.substring(2)}</li>;
      } else if (line.match(/^\d+\.\s/)) {
        return <li key={idx} className="ml-8 mb-3 list-decimal opacity-90">{line.replace(/^\d+\.\s/, '')}</li>;
      } else if (line.startsWith('🔥') || line.startsWith('💡') || line.startsWith('✅') || line.startsWith('❌') || line.startsWith('💰') || line.startsWith('🧠')) {
        return <div key={idx} className="my-6 p-6 rounded-xl bg-current/5 border border-current/10 font-medium leading-relaxed italic">
          {line}
        </div>;
      } else if (line.trim()) {
        return <p key={idx} className="mb-6 leading-relaxed opacity-90">{line}</p>;
      }
      return <div key={idx} className="h-4" />;
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-black/95' : 'bg-slate-900/40 backdrop-blur-sm'}`}>
      <div className={`${themeClasses[theme]} w-full h-full md:max-w-5xl md:h-[95vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 border`}>
        {/* Modern Navbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-current/10 transition-colors"
              title="Return Home"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold uppercase tracking-widest opacity-60">Day {chapter.number}</h1>
              <p className="text-lg font-bold truncate max-w-[300px]">{chapter.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Controls */}
            <div className="flex items-center bg-current/5 rounded-lg px-2 mr-2">
              <button onClick={() => setFontSize(prev => Math.max(14, prev - 2))} className="p-2 hover:bg-current/10 rounded-md">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm">Aa</span>
              <button onClick={() => setFontSize(prev => Math.min(28, prev + 2))} className="p-2 hover:bg-current/10 rounded-md">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex bg-current/5 rounded-lg p-1">
              <button 
                onClick={() => setTheme('light')}
                className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white shadow-sm text-blue-600' : 'opacity-60'}`}
              >
                <Sun className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setTheme('sepia')}
                className={`p-2 rounded-md transition-all ${theme === 'sepia' ? 'bg-[#f4ecd8] shadow-sm text-[#5b4636]' : 'opacity-60'}`}
              >
                <Coffee className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-zinc-800 shadow-sm text-zinc-100' : 'opacity-60'}`}
              >
                <Moon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reader Body */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className={`h-full overflow-y-auto px-8 md:px-20 py-10 font-serif transition-opacity duration-300 ${isFlipping ? 'opacity-0' : 'opacity-100'}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className="max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {formatContent(pages[currentPage] || 'Content not available')}
            </div>
          </div>
          
          {/* Side Progress Indicators (Desktop) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
            {pages.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentPage ? 'h-6 bg-current' : 'bg-current/20'}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 hover:bg-current/10 font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="text-center">
            <p className="text-sm font-bold opacity-60">
              {currentPage + 1} of {totalPages}
            </p>
            <div className="w-32 h-1 bg-current/10 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-current transition-all duration-500"
                style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-2 hover:bg-current/10 font-bold"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
