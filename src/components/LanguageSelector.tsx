import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { Globe, Check, Settings } from 'lucide-react';
import { 
  supportedLanguages, 
  getCurrentLanguage, 
  setLanguage,
  getEnabledLanguages,
  Language
} from '../data/languages';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

export default function LanguageSelector({ 
  className, 
  showLabel = true, 
  variant = 'default' 
}: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getCurrentLanguage());
  const enabledLanguages = getEnabledLanguages();

  const handleLanguageChange = (languageId: string) => {
    setLanguage(languageId);
    setCurrentLanguage(supportedLanguages.find(lang => lang.id === languageId) || currentLanguage);
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'compact':
        return (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Globe className="h-4 w-4" />
          </Button>
        );
      case 'minimal':
        return (
          <div className="flex items-center gap-2 cursor-pointer hover:bg-grey-100 rounded-md px-2 py-1">
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="text-sm font-medium text-grey-700">
              {currentLanguage.id.toUpperCase()}
            </span>
          </div>
        );
      default:
        return (
          <Button variant="outline" className="gap-2">
            <Globe className="h-4 w-4" />
            {showLabel && (
              <>
                <span>{currentLanguage.nativeName}</span>
                <span className="text-grey-500">({currentLanguage.name})</span>
              </>
            )}
          </Button>
        );
    }
  };

  const renderLanguageItem = (language: Language) => (
    <DropdownMenuItem
      key={language.id}
      onClick={() => handleLanguageChange(language.id)}
      className="flex items-center gap-3 cursor-pointer"
    >
      <div className="flex items-center gap-3 flex-1">
        <span className="text-lg">{language.flag}</span>
        <div className="flex-1 text-left">
          <div className="font-medium">{language.nativeName}</div>
          <div className="text-xs text-grey-500">{language.name}</div>
        </div>
      </div>
      
      {currentLanguage.id === language.id && (
        <Check className="h-4 w-4 text-grey-600" />
      )}
      
      {!language.enabled && (
        <Badge variant="secondary" className="text-xs">
          Coming Soon
        </Badge>
      )}
    </DropdownMenuItem>
  );

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {renderTrigger()}
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Select Language
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Enabled Languages */}
          {enabledLanguages.map(renderLanguageItem)}
          
          {enabledLanguages.length < supportedLanguages.length && (
            <>
              <DropdownMenuSeparator />
              
              {/* Coming Soon Languages */}
              <DropdownMenuLabel className="text-xs text-grey-500">
                Coming Soon
              </DropdownMenuLabel>
              
              {supportedLanguages
                .filter(lang => !lang.enabled)
                .map(renderLanguageItem)}
            </>
          )}
          
          <DropdownMenuSeparator />
          
          {/* Language Settings */}
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Language Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Hook for using translations in components
export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getCurrentLanguage());
  
  const changeLanguage = (languageId: string) => {
    setLanguage(languageId);
    setCurrentLanguage(supportedLanguages.find(lang => lang.id === languageId) || currentLanguage);
  };
  
  return {
    currentLanguage,
    changeLanguage,
    enabledLanguages: getEnabledLanguages()
  };
};
