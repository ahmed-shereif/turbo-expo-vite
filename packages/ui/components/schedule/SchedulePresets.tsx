import { useState } from 'react';
import { BrandCard } from '../BrandCard';
import { BrandButton } from '../BrandButton';
import { SafeText } from '../SafeText';
import { YStack, XStack, H3 } from 'tamagui';
import { PRESET_SCHEDULES } from './types';
import type { PresetSchedule, WeekSchedule } from './types';

interface SchedulePresetsProps {
  onApplyPreset: (preset: PresetSchedule) => void;
  onCopyMondayToWeek: () => void;
  onClearAll: () => void;
}

export function SchedulePresets({ onApplyPreset, onCopyMondayToWeek, onClearAll }: SchedulePresetsProps) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <BrandCard>
      <YStack space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H3 color="$textHigh">Quick Setup</H3>
          <BrandButton 
            variant="outline" 
            size="sm"
            onPress={() => setShowPresets(!showPresets)}
          >
            {showPresets ? 'Hide Presets' : 'Show Presets'}
          </BrandButton>
        </XStack>
        
        {showPresets && (
          <YStack space="$3">
            <SafeText textAlign="left" color="$textMuted" fontSize="$3">
              Choose a preset schedule to get started quickly:
            </SafeText>
            <XStack space="$3" flexWrap="wrap">
              {PRESET_SCHEDULES.map((preset) => (
                <BrandCard key={preset.name} elevated={false} padding="$3" minWidth={200}>
                  <YStack space="$2">
                    <SafeText textAlign="left" fontWeight="600" color="$textHigh">
                      {preset.name}
                    </SafeText>
                    <SafeText textAlign="left" color="$textMuted" fontSize="$3">
                      {preset.description}
                    </SafeText>
                    <BrandButton 
                      size="sm" 
                      variant="outline"
                      onPress={() => onApplyPreset(preset)}
                    >
                      Use This
                    </BrandButton>
                  </YStack>
                </BrandCard>
              ))}
            </XStack>
          </YStack>
        )}

        <XStack space="$2" justifyContent="flex-end">
          <BrandButton 
            variant="outline" 
            size="sm"
            onPress={onCopyMondayToWeek}
          >
            Copy Monday
          </BrandButton>
          <BrandButton 
            variant="outline" 
            size="sm"
            onPress={onClearAll}
          >
            Clear All
          </BrandButton>
        </XStack>
      </YStack>
    </BrandCard>
  );
}
