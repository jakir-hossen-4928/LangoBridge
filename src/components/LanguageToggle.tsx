import React from 'react';
import { useVocabulary } from '@/context/VocabularyContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = "" }) => {
  const { selectedLanguage, toggleLanguage, translate } = useVocabulary();

  return (
    <div className={`flex items-center space-x-2 bg-muted/50 rounded-full px-3 py-1 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center space-x-2">
        <Label
          htmlFor="language-toggle"
          className="text-sm font-medium cursor-pointer flex items-center space-x-1"
        >
          <span className={selectedLanguage === 'bangla' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
            {translate('banglaWord')}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className={selectedLanguage === 'korean' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
            {translate('koreanWord')}
          </span>
        </Label>
        <Switch
          id="language-toggle"
          checked={selectedLanguage === 'korean'}
          onCheckedChange={toggleLanguage}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
};

export default LanguageToggle;