import { BrandCard } from '../BrandCard';
import { BrandButton } from '../BrandButton';
import { CheckboxField } from '../CheckboxField';
import { TextField } from '../TextField';
import { SafeText } from '../SafeText';
import { Icon } from '../Icon';
import { YStack, XStack, H3, Label, Button } from 'tamagui';
import { DAYS } from './types';
import type { WeekSchedule, DaySchedule } from './types';

interface WeeklyScheduleEditorProps {
  weeklyTemplate: WeekSchedule;
  onUpdateDay: (day: typeof DAYS[number]['key'], schedule: DaySchedule) => void;
  onAddTimeRange: (day: typeof DAYS[number]['key']) => void;
  onRemoveTimeRange: (day: typeof DAYS[number]['key'], index: number) => void;
  onUpdateTimeRange: (day: typeof DAYS[number]['key'], index: number, field: 'from' | 'to', value: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function WeeklyScheduleEditor({
  weeklyTemplate,
  onUpdateDay,
  onAddTimeRange,
  onRemoveTimeRange,
  onUpdateTimeRange,
  onSave,
  isSaving = false,
}: WeeklyScheduleEditorProps) {
  return (
    <BrandCard>
      <YStack space="$4">
        <H3 color="$textHigh">Weekly Schedule</H3>

        <YStack space="$4">
          {DAYS.map((day) => (
            <BrandCard key={day.key} elevated={false} padding="$4">
              <YStack space="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <CheckboxField
                    label={day.label}
                    checked={weeklyTemplate[day.key].enabled}
                    onCheckedChange={(checked) => onUpdateDay(day.key, {
                      ...weeklyTemplate[day.key],
                      enabled: checked,
                      ranges: checked ? weeklyTemplate[day.key].ranges : [],
                    })}
                  />
                  {weeklyTemplate[day.key].enabled && (
                    <BrandButton 
                      size="sm" 
                      variant="outline"
                      onPress={() => onAddTimeRange(day.key)}
                    >
                      Add Time
                    </BrandButton>
                  )}
                </XStack>

                {weeklyTemplate[day.key].enabled && (
                  <YStack space="$3" paddingLeft="$6">
                    {weeklyTemplate[day.key].ranges.length === 0 ? (
                      <SafeText textAlign="left" color="$textMuted" fontSize="$3" fontStyle="italic">
                        No time slots added yet. Click "Add Time" to get started.
                      </SafeText>
                    ) : (
                      weeklyTemplate[day.key].ranges.map((range, index) => (
                        <XStack key={index} space="$3" alignItems="center">
                          <YStack space="$1" flex={1}>
                            <Label fontSize="$3" color="$textMedium">From</Label>
                            <TextField
                              value={range.from}
                              onChangeText={(value) => onUpdateTimeRange(day.key, index, 'from', value)}
                              placeholder="09:00"
                              type="time"
                            />
                          </YStack>
                          <SafeText textAlign="center" color="$textMuted" fontSize="$4" marginTop="$6">
                            to
                          </SafeText>
                          <YStack space="$1" flex={1}>
                            <Label fontSize="$3" color="$textMedium">To</Label>
                            <TextField
                              value={range.to}
                              onChangeText={(value) => onUpdateTimeRange(day.key, index, 'to', value)}
                              placeholder="17:00"
                              type="time"
                            />
                          </YStack>
                          <Button 
                            size="$5" 
                            variant="ghost"
                            onPress={() => onRemoveTimeRange(day.key, index)}
                            marginTop="$6"
                            padding="$4"
                            backgroundColor="transparent"
                            borderWidth={0}
                            pressStyle={{ backgroundColor: '$red2', opacity: 0.8 }}
                            alignSelf="center"
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Icon name="Trash2" size={24} color="$red9" />
                          </Button>
                        </XStack>
                      ))
                    )}
                  </YStack>
                )}
              </YStack>
            </BrandCard>
          ))}
        </YStack>

        <BrandButton 
          onPress={onSave}
          disabled={isSaving}
          fullWidth
          size="lg"
        >
          {isSaving ? 'Saving Your Schedule...' : 'Save My Availability'}
        </BrandButton>
      </YStack>
    </BrandCard>
  );
}
