import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { tapFeedback } from '@/utils/haptics';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'mr', name: 'मराठी' },
  { code: 'bn', name: 'বাংলা' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (code: string) => {
    tapFeedback();
    i18n.changeLanguage(code);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 hover:bg-muted transition-colors duration-200">
          <Languages className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider">{currentLanguage.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-background/95 backdrop-blur-md border-border shadow-xl">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer transition-colors duration-200 ${
              i18n.language === lang.code ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
            }`}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
