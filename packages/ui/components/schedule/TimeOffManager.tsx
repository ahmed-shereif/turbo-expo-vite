import { useState } from 'react';
import { BrandCard } from '../BrandCard';
import { BrandButton } from '../BrandButton';
import { TextField } from '../TextField';
import { SafeText } from '../SafeText';
import { YStack, XStack, H3, Label } from 'tamagui';
import type { BlackoutPeriod, NewBlackout } from './types';

interface TimeOffManagerProps {
  blackouts: BlackoutPeriod[];
  onAddBlackout: (blackout: Omit<NewBlackout, 'reason'> & { reason?: string }) => Promise<void>;
  onRemoveBlackout: (blackoutId: string) => Promise<void>;
  isAdding?: boolean;
  isRemoving?: boolean;
}

export function TimeOffManager({ 
  blackouts, 
  onAddBlackout, 
  onRemoveBlackout, 
  isAdding = false,
  isRemoving = false 
}: TimeOffManagerProps) {
  const [newBlackout, setNewBlackout] = useState<NewBlackout>({
    startAt: '',
    endAt: '',
    reason: '',
  });

  const handleAddBlackout = async () => {
    if (!newBlackout.startAt || !newBlackout.endAt) {
      return;
    }

    try {
      await onAddBlackout({
        startAt: newBlackout.startAt,
        endAt: newBlackout.endAt,
        reason: newBlackout.reason || undefined,
      });
      setNewBlackout({ startAt: '', endAt: '', reason: '' });
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleRemoveBlackout = async (blackoutId: string) => {
    try {
      await onRemoveBlackout(blackoutId);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <BrandCard>
      <YStack space="$4">
        <H3 color="$textHigh">Time Off</H3>
        <SafeText textAlign="left" color="$textMuted" fontSize="$4">
          Block out specific dates when you're not available (vacation, personal time, etc.)
        </SafeText>

        {/* Add Blackout Form */}
        <YStack space="$4" padding="$4" backgroundColor="$bgSoft" borderRadius="$4">
          <SafeText textAlign="left" fontWeight="600" color="$textHigh" fontSize="$4">
            Add Time Off
          </SafeText>
          
          <XStack space="$3" flexWrap="wrap">
            <YStack space="$2" flex={1} minWidth={200}>
              <Label fontSize="$3" color="$textMedium">Start Date & Time</Label>
              <TextField
                value={newBlackout.startAt}
                onChangeText={(value) => setNewBlackout(prev => ({ ...prev, startAt: value }))}
                placeholder="2024-01-15T09:00"
                type="datetime-local"
              />
            </YStack>
            
            <YStack space="$2" flex={1} minWidth={200}>
              <Label fontSize="$3" color="$textMedium">End Date & Time</Label>
              <TextField
                value={newBlackout.endAt}
                onChangeText={(value) => setNewBlackout(prev => ({ ...prev, endAt: value }))}
                placeholder="2024-01-20T18:00"
                type="datetime-local"
              />
            </YStack>
            
            <YStack space="$2" flex={1} minWidth={200}>
              <Label fontSize="$3" color="$textMedium">Reason (Optional)</Label>
              <TextField
                placeholder="e.g., Vacation, Personal time"
                value={newBlackout.reason}
                onChangeText={(value) => setNewBlackout(prev => ({ ...prev, reason: value }))}
              />
            </YStack>
            
            <BrandButton 
              size="sm"
              onPress={handleAddBlackout}
              disabled={isAdding}
              alignSelf="flex-end"
            >
              {isAdding ? 'Adding...' : 'Add Time Off'}
            </BrandButton>
          </XStack>
        </YStack>

        {/* Current Blackouts */}
        <YStack space="$3">
          <SafeText textAlign="left" fontWeight="600" color="$textHigh" fontSize="$4">
            Current Time Off
          </SafeText>
          
          {blackouts.length === 0 ? (
            <SafeText textAlign="left" color="$textMuted" fontSize="$4" fontStyle="italic">
              No time off scheduled
            </SafeText>
          ) : (
            <YStack space="$2">
              {blackouts.map((blackout) => (
                <XStack key={blackout.id} justifyContent="space-between" alignItems="center" padding="$3" backgroundColor="$bgSoft" borderRadius="$3">
                  <YStack space="$1">
                    <SafeText textAlign="left" fontSize="$4" fontWeight="500">
                      {new Date(blackout.startAt).toLocaleDateString()} {new Date(blackout.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {new Date(blackout.endAt).toLocaleDateString()} {new Date(blackout.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </SafeText>
                    {blackout.reason && (
                      <SafeText textAlign="left" fontSize="$3" color="$textMuted">
                        {blackout.reason}
                      </SafeText>
                    )}
                  </YStack>
                  <BrandButton 
                    size="sm" 
                    variant="outline"
                    onPress={() => handleRemoveBlackout(blackout.id)}
                    disabled={isRemoving}
                  >
                    Remove
                  </BrandButton>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      </YStack>
    </BrandCard>
  );
}
