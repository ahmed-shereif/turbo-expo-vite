import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useCreateSessionStore } from '../../../src/player/create/state';
import { auth } from '../../../src/lib/authClient';
import { fetchCourts, quickCheckCourt, combineDayAndTime } from '@repo/player-api';
// Define Court type locally since it's not exported
interface Court {
  id: string;
  name: string;
  area?: string;
  address?: string;
  priceHourlyLE: number;
  facilities?: string[];
}
import { notify } from '../../../src/lib/notify';
import { BrandButton, BrandCard, Skeleton } from '@repo/ui';

interface CourtAvailability {
  [courtId: string]: {
    [timeSlot: string]: {
      available: boolean;
      loading: boolean;
      checked: boolean;
    };
  };
}

export default function CreateSessionStep2() {
  const { dayISO, court, startTimeHHmm, durationMinutes, updateState } = useCreateSessionStore();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState('');
  const [availability, setAvailability] = useState<CourtAvailability>({});

  // Generate time slots from 07:00 to 23:00 in 30-minute increments
  const timeSlots = Array.from({ length: 33 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Create a compatible auth wrapper
  const authWrapper = {
    withAuth: auth.withAuth.bind(auth),
    getBaseUrl: auth.getBaseUrl.bind(auth),
  };

  const fetchCourtsData = useCallback(async () => {
    try {
      setLoading(true);
      const courtsData = await fetchCourts(authWrapper, {
        area: areaFilter || undefined,
        pageSize: 50,
      });
      setCourts(courtsData);
    } catch (error: any) {
      console.error('Failed to fetch courts:', error);
      notify.error('Failed to load courts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [areaFilter]);

  useEffect(() => {
    fetchCourtsData();
  }, [fetchCourtsData]);

  const checkCourtAvailability = useCallback(async (courtId: string, timeSlot: string) => {
    const cacheKey = `${courtId}-${timeSlot}-${durationMinutes}`;
    
    // Check if already cached
    if (availability[courtId]?.[timeSlot]?.checked) {
      return;
    }

    // Set loading state
    setAvailability(prev => ({
      ...prev,
      [courtId]: {
        ...prev[courtId],
        [timeSlot]: {
          available: false,
          loading: true,
          checked: false,
        },
      },
    }));

    try {
      const startAtISO = combineDayAndTime(dayISO!, timeSlot);
      const result = await quickCheckCourt(authWrapper, courtId, startAtISO, durationMinutes);
      
      setAvailability(prev => ({
        ...prev,
        [courtId]: {
          ...prev[courtId],
          [timeSlot]: {
            available: result.available,
            loading: false,
            checked: true,
          },
        },
      }));
    } catch (error: any) {
      console.error('Failed to check court availability:', error);
      setAvailability(prev => ({
        ...prev,
        [courtId]: {
          ...prev[courtId],
          [timeSlot]: {
            available: false,
            loading: false,
            checked: true,
          },
        },
      }));
    }
  }, [dayISO, durationMinutes, availability]);

  const handleTimeSlotPress = (courtId: string, timeSlot: string) => {
    const isAvailable = availability[courtId]?.[timeSlot]?.available;
    const isLoading = availability[courtId]?.[timeSlot]?.loading;
    
    if (isLoading) return;
    
    if (!availability[courtId]?.[timeSlot]?.checked) {
      checkCourtAvailability(courtId, timeSlot);
      return;
    }
    
    if (isAvailable) {
      const selectedCourt = courts.find(c => c.id === courtId);
      if (selectedCourt) {
        updateState({ court: selectedCourt, startTimeHHmm: timeSlot });
        notify.success(`Selected ${selectedCourt.name} at ${timeSlot}`);
      }
    } else {
      notify.error('This time is busy on this court.');
    }
  };

  const getTimeSlotStatus = (courtId: string, timeSlot: string) => {
    const slot = availability[courtId]?.[timeSlot];
    if (!slot) return 'unchecked';
    if (slot.loading) return 'loading';
    if (slot.checked && !slot.available) return 'busy';
    if (slot.checked && slot.available) return 'available';
    return 'unchecked';
  };

  const isTimeSlotSelected = (courtId: string, timeSlot: string) => {
    return court?.id === courtId && startTimeHHmm === timeSlot;
  };

  const handleNext = () => {
    if (!court || !startTimeHHmm) {
      Alert.alert('Please select a court and time', 'You need to choose both a court and time slot.');
      return;
    }
    router.push('/(player)/create/trainer');
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <BrandCard style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
            Create Session
          </Text>
          <Text style={{ fontSize: 16, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
            Step 2 of 4: Pick Court & Time
          </Text>
          <Skeleton style={{ height: 100, marginBottom: 16 }} />
          <Skeleton style={{ height: 100, marginBottom: 16 }} />
          <Skeleton style={{ height: 100 }} />
        </BrandCard>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <BrandCard style={{ padding: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
          Create Session
        </Text>
        <Text style={{ fontSize: 16, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
          Step 2 of 4: Pick Court & Time
        </Text>
        
        {/* Progress bar */}
        <View style={{ 
          width: '100%', 
          height: 8, 
            backgroundColor: 'var(--color-border-primary)',
          borderRadius: 4,
          marginBottom: 24
        }}>
          <View style={{ 
            width: '50%', 
            height: '100%', 
            backgroundColor: 'var(--color-brand-primary)', 
            borderRadius: 4 
          }} />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Pick Court & Time
        </Text>
        <Text style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
          Choose your preferred court and time slot.
        </Text>

        {/* Area Filter */}
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
          Filter by Area (Optional)
        </Text>
        <TextInput
          value={areaFilter}
          onChangeText={setAreaFilter}
          placeholder="e.g., Maadi, Zamalek"
          style={{
            borderWidth: 1,
            borderColor: 'var(--color-border-secondary)',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            marginBottom: 16,
          }}
        />

        {/* Duration Selector */}
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
          Session Duration
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {[30, 60, 90].map(duration => (
            <TouchableOpacity
              key={duration}
              onPress={() => updateState({ durationMinutes: duration })}
              style={{
                flex: 1,
                padding: 12,
                marginHorizontal: 2,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: durationMinutes === duration ? 'var(--color-brand-primary)' : 'var(--color-border-secondary)',
                backgroundColor: durationMinutes === duration ? 'var(--color-brand-primary)' : 'var(--color-surface-primary)',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: durationMinutes === duration ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                fontWeight: '500',
              }}>
                {duration} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BrandCard>

      <ScrollView style={{ flex: 1 }}>
        {courts.length === 0 ? (
          <BrandCard style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: 'var(--color-text-tertiary)' }}>No courts found in this area.</Text>
          </BrandCard>
        ) : (
          courts.map(courtItem => (
            <BrandCard key={courtItem.id} style={{ padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                {courtItem.name}
              </Text>
              {courtItem.area && (
                <Text style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                  {courtItem.area}
                </Text>
              )}
              {courtItem.address && (
                <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                  {courtItem.address}
                </Text>
              )}
              <Text style={{ fontSize: 14, fontWeight: '500', color: 'var(--color-feedback-success-text)', marginBottom: 12 }}>
                {courtItem.priceHourlyLE} EGP/hour
              </Text>

              {/* Time Slots Grid */}
              <View style={{ borderTopWidth: 1, borderTopColor: 'var(--color-border-primary)', paddingTop: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                  Available Times
                </Text>
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  gap: 8 
                }}>
                  {timeSlots.map(timeSlot => {
                    const status = getTimeSlotStatus(courtItem.id, timeSlot);
                    const isSelected = isTimeSlotSelected(courtItem.id, timeSlot);
                    
                    return (
                      <TouchableOpacity
                        key={timeSlot}
                        onPress={() => handleTimeSlotPress(courtItem.id, timeSlot)}
                        disabled={status === 'loading'}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          borderWidth: isSelected ? 2 : 1,
                          minWidth: 60,
                          alignItems: 'center',
                          backgroundColor: isSelected
                            ? 'var(--color-brand-primary)'
                            : status === 'available'
                            ? 'var(--color-feedback-success-bg)'
                            : status === 'busy'
                            ? 'var(--color-feedback-error-bg)'
                            : status === 'loading'
                            ? 'var(--color-surface-tertiary)'
                            : 'var(--color-surface-tertiary)',
                          borderColor: isSelected
                            ? 'var(--color-brand-primary)'
                            : status === 'available'
                            ? 'var(--color-feedback-success-border)'
                            : status === 'busy'
                            ? 'var(--color-feedback-error-border)'
                            : status === 'loading'
                            ? 'var(--color-border-secondary)'
                            : 'var(--color-border-secondary)',
                          shadowColor: isSelected ? 'var(--color-brand-primary)' : undefined,
                          shadowOffset: isSelected ? { width: 0, height: 2 } : undefined,
                          shadowOpacity: isSelected ? 0.3 : undefined,
                          shadowRadius: isSelected ? 4 : undefined,
                          elevation: isSelected ? 3 : undefined,
                        }}
                      >
                        <Text style={{
                          fontSize: 12,
                          fontWeight: isSelected ? '700' : '500',
                          color: isSelected
                            ? 'var(--color-text-inverse)'
                            : status === 'available'
                            ? 'var(--color-feedback-success-text)'
                            : status === 'busy'
                            ? 'var(--color-feedback-error-text)'
                            : status === 'loading'
                            ? 'var(--color-text-tertiary)'
                            : 'var(--color-text-secondary)',
                        }}>
                          {status === 'loading' ? '...' : timeSlot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </BrandCard>
          ))
        )}
      </ScrollView>

      {court && startTimeHHmm && (
        <BrandCard style={{ 
          backgroundColor: 'var(--color-feedback-info-bg)', 
          borderColor: 'var(--color-brand-primary)', 
          borderWidth: 2, 
          padding: 16, 
          marginBottom: 16,
          shadowColor: 'var(--color-brand-primary)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              width: 24,
              height: 24,
              backgroundColor: 'var(--color-brand-primary)',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: 'var(--color-brand-primary)' }}>
              Selected Court & Time
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: 'var(--color-brand-primary)', marginBottom: 4 }}>
            {court.name}
          </Text>
          <Text style={{ fontSize: 16, color: 'var(--color-brand-primary)', marginBottom: 8 }}>
            {startTimeHHmm} ({durationMinutes} min)
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
              {Math.round(court.priceHourlyLE * durationMinutes / 60)} EGP total
            </Text>
            <TouchableOpacity
              onPress={() => updateState({ court: null, startTimeHHmm: null })}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: 'var(--color-brand-primary)',
                borderRadius: 6
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Change</Text>
            </TouchableOpacity>
          </View>
        </BrandCard>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <BrandButton
          variant="outline"
          onPress={handleBack}
          style={{ flex: 1, marginRight: 8 }}
        >
          Back
        </BrandButton>
        
        <BrandButton
          onPress={handleNext}
          disabled={!court || !startTimeHHmm}
          style={{ flex: 1, marginLeft: 8 }}
        >
          Next
        </BrandButton>
      </View>
    </View>
  );
}
