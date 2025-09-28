import { BrandButton } from '../BrandButton';
import { XStack } from 'tamagui';
import type { ViewMode } from './types';

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ currentMode, onModeChange }: ViewModeToggleProps) {
  return (
    <XStack space="$2">
      <BrandButton 
        variant={currentMode === 'list' ? 'primary' : 'outline'}
        onPress={() => onModeChange('list')}
      >
        List View
      </BrandButton>
      <BrandButton 
        variant={currentMode === 'calendar' ? 'primary' : 'outline'}
        onPress={() => onModeChange('calendar')}
      >
        Calendar View
      </BrandButton>
    </XStack>
  );
}
