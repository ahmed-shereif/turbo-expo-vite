import { useState, useEffect } from 'react';
// import { useForm, Controller } from 'react-hook-form';
import { Screen, BrandCard, BrandButton } from '@repo/ui';
import { useAuth } from '../../auth/AuthContext';
import { 
  useTrainerCalendar, 
  useUpdateWorkingWindows, 
  useBlackouts, 
  useAddBlackout, 
  useRemoveBlackout 
} from '../hooks/useTrainerQueries';
import { YStack, XStack, H2, H3, Text, Input, Button, Label } from 'tamagui';
import { WorkingWindow } from '@repo/trainer-api';
import { notify } from '../../lib/notify';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type DaySchedule = {
  enabled: boolean;
  ranges: Array<{ from: string; to: string }>;
};

type WeekSchedule = Record<typeof DAYS[number], DaySchedule>;

export default function TrainerAvailability() {
  const { user } = useAuth();
  const trainerId = user?.id || '';
  
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>(() => 
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { enabled: false, ranges: [] }
    }), {} as WeekSchedule)
  );
  
  const [newBlackout, setNewBlackout] = useState({
    startAt: '',
    endAt: '',
    reason: '',
  });

  const { data: calendar } = useTrainerCalendar(trainerId);
  const { data: blackouts = [] } = useBlackouts(trainerId);
  const updateWorkingMutation = useUpdateWorkingWindows(trainerId);
  const addBlackoutMutation = useAddBlackout(trainerId);
  const removeBlackoutMutation = useRemoveBlackout();

  useEffect(() => {
    if (calendar?.workingWindows) {
      const schedule: WeekSchedule = DAYS.reduce((acc, day) => ({
        ...acc,
        [day]: { enabled: false, ranges: [] }
      }), {} as WeekSchedule);

      calendar.workingWindows.forEach((window: WorkingWindow) => {
        schedule[window.day] = {
          enabled: true,
          ranges: window.ranges,
        };
      });

      setWeekSchedule(schedule);
    }
  }, [calendar]);

  const updateDaySchedule = (day: typeof DAYS[number], schedule: DaySchedule) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: schedule,
    }));
  };

  const addTimeRange = (day: typeof DAYS[number]) => {
    updateDaySchedule(day, {
      ...weekSchedule[day],
      ranges: [...weekSchedule[day].ranges, { from: '09:00', to: '17:00' }],
    });
  };

  const removeTimeRange = (day: typeof DAYS[number], index: number) => {
    updateDaySchedule(day, {
      ...weekSchedule[day],
      ranges: weekSchedule[day].ranges.filter((_, i) => i !== index),
    });
  };

  const updateTimeRange = (day: typeof DAYS[number], index: number, field: 'from' | 'to', value: string) => {
    const newRanges = [...weekSchedule[day].ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    updateDaySchedule(day, {
      ...weekSchedule[day],
      ranges: newRanges,
    });
  };

  const copyMondayToWeek = () => {
    const mondaySchedule = weekSchedule.Mon;
    const newSchedule = { ...weekSchedule };
    DAYS.forEach(day => {
      if (day !== 'Mon') {
        newSchedule[day] = { ...mondaySchedule };
      }
    });
    setWeekSchedule(newSchedule);
  };

  const clearAll = () => {
    setWeekSchedule(DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { enabled: false, ranges: [] }
    }), {} as WeekSchedule));
  };

  const saveWorkingWindows = async () => {
    try {
      const workingWindows: WorkingWindow[] = DAYS
        .filter(day => weekSchedule[day].enabled && weekSchedule[day].ranges.length > 0)
        .map(day => ({
          day,
          ranges: weekSchedule[day].ranges,
        }));

      await updateWorkingMutation.mutateAsync({ week: workingWindows });
      notify.success('Working hours saved successfully');
    } catch (error) {
      notify.error('Failed to save working hours');
    }
  };

  const handleAddBlackout = async () => {
    if (!newBlackout.startAt || !newBlackout.endAt) {
      notify.error('Please fill in start and end times');
      return;
    }

    try {
      await addBlackoutMutation.mutateAsync({
        startAt: new Date(newBlackout.startAt).toISOString(),
        endAt: new Date(newBlackout.endAt).toISOString(),
        reason: newBlackout.reason || undefined,
      });
      setNewBlackout({ startAt: '', endAt: '', reason: '' });
      notify.success('Blackout added successfully');
    } catch (error) {
      notify.error('Failed to add blackout');
    }
  };

  const handleRemoveBlackout = async (blackoutId: string) => {
    try {
      await removeBlackoutMutation.mutateAsync(blackoutId);
      notify.success('Blackout removed successfully');
    } catch (error) {
      notify.error('Failed to remove blackout');
    }
  };

  return (
    <Screen>
      <YStack space="$4" padding="$4">
        <H2>Availability Calendar</H2>
        <Text fontSize="$3" color="$gray11">Times are in Africa/Cairo timezone</Text>

        {/* Working Hours */}
        <BrandCard>
          <YStack space="$4" padding="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <H3>Weekly Working Hours</H3>
              <XStack space="$2">
                <Button size="$3" variant="outlined" onPress={copyMondayToWeek}>
                  Copy Mon → Week
                </Button>
                <Button size="$3" variant="outlined" onPress={clearAll}>
                  Clear All
                </Button>
              </XStack>
            </XStack>

            {DAYS.map((day) => (
              <YStack key={day} space="$2">
                <XStack space="$3" alignItems="center">
                  <input
                    type="checkbox"
                    checked={weekSchedule[day].enabled}
                    onChange={(e) => updateDaySchedule(day, {
                      ...weekSchedule[day],
                      enabled: e.target.checked,
                      ranges: e.target.checked ? weekSchedule[day].ranges : [],
                    })}
                  />
                  <Text fontSize="$4" fontWeight="600" minWidth={60}>
                    {day}
                  </Text>
                  {weekSchedule[day].enabled && (
                    <Button size="$2" variant="outlined" onPress={() => addTimeRange(day)}>
                      Add Range
                    </Button>
                  )}
                </XStack>

                {weekSchedule[day].enabled && (
                  <YStack space="$2" paddingLeft="$6">
                    {weekSchedule[day].ranges.map((range, index) => (
                      <XStack key={index} space="$2" alignItems="center">
                        <Input
                          size="sm"
                          width={80}
                          value={range.from}
                          onChangeText={(value) => updateTimeRange(day, index, 'from', value)}
                          placeholder="09:00"
                        />
                        <Text>to</Text>
                        <Input
                          size="sm"
                          width={80}
                          value={range.to}
                          onChangeText={(value) => updateTimeRange(day, index, 'to', value)}
                          placeholder="17:00"
                        />
                        <Button 
                          size="$2" 
                          variant="outlined" 
                          onPress={() => removeTimeRange(day, index)}
                        >
                          Remove
                        </Button>
                      </XStack>
                    ))}
                  </YStack>
                )}
              </YStack>
            ))}

            <BrandButton 
              onPress={saveWorkingWindows}
              disabled={updateWorkingMutation.isPending}
            >
              {updateWorkingMutation.isPending ? 'Saving...' : 'Save Working Hours'}
            </BrandButton>
          </YStack>
        </BrandCard>

        {/* Blackouts */}
        <BrandCard>
          <YStack space="$4" padding="$4">
            <H3>Blackout Periods</H3>

            {/* Add Blackout */}
            <YStack space="$3">
              <Text fontSize="$4" fontWeight="600">Add Blackout</Text>
              <XStack space="$2" alignItems="flex-end" flexWrap="wrap">
                <YStack space="$1">
                  <Label>Start Date & Time</Label>
                  <Input
                    value={newBlackout.startAt}
                    onChangeText={(value) => setNewBlackout(prev => ({ ...prev, startAt: value }))}
                  />
                </YStack>
                <YStack space="$1">
                  <Label>End Date & Time</Label>
                  <Input
                    value={newBlackout.endAt}
                    onChangeText={(value) => setNewBlackout(prev => ({ ...prev, endAt: value }))}
                  />
                </YStack>
                <YStack space="$1">
                  <Label>Reason (Optional)</Label>
                  <Input
                    placeholder="e.g., Vacation"
                    value={newBlackout.reason}
                    onChangeText={(value) => setNewBlackout(prev => ({ ...prev, reason: value }))}
                  />
                </YStack>
                <BrandButton 
                  size="sm"
                  onPress={handleAddBlackout}
                  disabled={addBlackoutMutation.isPending}
                >
                  Add
                </BrandButton>
              </XStack>
            </YStack>

            {/* Blackouts List */}
            <YStack space="$2">
              <Text fontSize="$4" fontWeight="600">Current Blackouts</Text>
              {blackouts.length === 0 ? (
                <Text color="$gray11">No blackouts scheduled</Text>
              ) : (
                blackouts.map((blackout) => (
                  <XStack key={blackout.id} justifyContent="space-between" alignItems="center">
                    <YStack>
                      <Text fontSize="$3">
                        {new Date(blackout.startAt).toLocaleDateString()} {new Date(blackout.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' → '}
                        {new Date(blackout.endAt).toLocaleDateString()} {new Date(blackout.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {blackout.reason && (
                        <Text fontSize="$2" color="$gray11">{blackout.reason}</Text>
                      )}
                    </YStack>
                    <Button 
                      size="$2" 
                      variant="outlined" 
                      onPress={() => handleRemoveBlackout(blackout.id)}
                      disabled={removeBlackoutMutation.isPending}
                    >
                      Remove
                    </Button>
                  </XStack>
                ))
              )}
            </YStack>
          </YStack>
        </BrandCard>
      </YStack>
    </Screen>
  );
}