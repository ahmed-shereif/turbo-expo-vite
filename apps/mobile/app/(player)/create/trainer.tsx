import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useCreateSessionStore } from '../../../src/player/create/state';
import { auth } from '../../../src/lib/authClient';
import { fetchTrainers, quickCheckTrainer, combineDayAndTime } from '@repo/player-api';
import type { Trainer, Rank } from '@repo/player-api';
import { notify } from '../../../src/lib/notify';
import { BrandButton, BrandCard, Skeleton } from '@repo/ui';

interface TrainerAvailability {
  [trainerId: string]: {
    available: boolean;
    loading: boolean;
    checked: boolean;
  };
}

const rankLabels: Record<Rank, string> = {
  UNKNOWN: 'Unknown',
  LOW_D: 'Low D',
  MID_D: 'Mid D',
  HIGH_D: 'High D',
};

export default function CreateSessionStep3() {
  const { dayISO, court, startTimeHHmm, durationMinutes, trainer, updateState } = useCreateSessionStore();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<TrainerAvailability>({});
  const [noAvailableTrainers, setNoAvailableTrainers] = useState(false);

  const startAtISO = combineDayAndTime(dayISO!, startTimeHHmm!);

  const fetchTrainersData = useCallback(async () => {
    try {
      setLoading(true);
      setNoAvailableTrainers(false);
      
      const trainersData = await fetchTrainers(auth, {
        area: court!.area,
        pageSize: 50,
      });
      setTrainers(trainersData);
    } catch (error: any) {
      console.error('Failed to fetch trainers:', error);
      notify.error('Failed to load trainers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [court!.area]);

  useEffect(() => {
    fetchTrainersData();
  }, [fetchTrainersData]);

  const checkTrainerAvailability = useCallback(async (trainerId: string) => {
    // Check if already cached
    if (availability[trainerId]?.checked) {
      return;
    }

    // Set loading state
    setAvailability(prev => ({
      ...prev,
      [trainerId]: {
        available: false,
        loading: true,
        checked: false,
      },
    }));

    try {
      const result = await quickCheckTrainer(auth, trainerId, startAtISO, durationMinutes);
      
      setAvailability(prev => ({
        ...prev,
        [trainerId]: {
          available: result.available,
          loading: false,
          checked: true,
        },
      }));
    } catch (error: any) {
      console.error('Failed to check trainer availability:', error);
      setAvailability(prev => ({
        ...prev,
        [trainerId]: {
          available: false,
          loading: false,
          checked: true,
        },
      }));
    }
  }, [startAtISO, durationMinutes, availability]);

  const handleTrainerSelect = (selectedTrainer: Trainer) => {
    const isAvailable = availability[selectedTrainer.id]?.available;
    const isLoading = availability[selectedTrainer.id]?.loading;
    
    if (isLoading) return;
    
    if (!availability[selectedTrainer.id]?.checked) {
      checkTrainerAvailability(selectedTrainer.id);
      return;
    }
    
    if (isAvailable) {
      updateState({ trainer: selectedTrainer });
    } else {
      notify.error('Trainer is busy at this time.');
    }
  };

  const isTrainerEligible = (trainer: Trainer) => {
    // If trainer has areasCovered, ensure it contains court.area
    if (trainer.areasCovered && trainer.areasCovered.length > 0) {
      return !court!.area || trainer.areasCovered.includes(court!.area);
    }
    // If no areasCovered specified, assume eligible
    return true;
  };

  const getTrainerStatus = (trainerId: string) => {
    const status = availability[trainerId];
    if (!status) return 'unchecked';
    if (status.loading) return 'loading';
    if (status.checked && !status.available) return 'busy';
    if (status.checked && status.available) return 'available';
    return 'unchecked';
  };

  const isTrainerSelected = (trainerId: string) => {
    return trainer?.id === trainerId;
  };

  // Check if we have any available trainers after all checks are done
  useEffect(() => {
    const checkedTrainers = Object.values(availability).filter(status => status.checked);
    const availableTrainers = checkedTrainers.filter(status => status.available);
    
    if (checkedTrainers.length > 0 && availableTrainers.length === 0 && !loading) {
      setNoAvailableTrainers(true);
    }
  }, [availability, loading]);

  const handleNext = () => {
    if (!trainer) {
      Alert.alert('Please select a trainer', 'You need to choose a trainer for your session.');
      return;
    }
    router.push('/(player)/create/review');
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
            Step 3 of 4: Pick Trainer
          </Text>
          <Skeleton style={{ height: 80, marginBottom: 16 }} />
          <Skeleton style={{ height: 80, marginBottom: 16 }} />
          <Skeleton style={{ height: 80 }} />
        </BrandCard>
      </View>
    );
  }

  if (noAvailableTrainers) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <BrandCard style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
            Create Session
          </Text>
          <Text style={{ fontSize: 16, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
            Step 3 of 4: Pick Trainer
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
              width: '75%', 
              height: '100%', 
              backgroundColor: 'var(--color-brand-primary)', 
              borderRadius: 4 
            }} />
          </View>

          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Pick Trainer
          </Text>
          <Text style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
            Choose a trainer for your session.
          </Text>
        </BrandCard>
        
        <View style={{ 
          backgroundColor: 'var(--color-feedback-warning-bg)', 
          borderColor: 'var(--color-feedback-warning-border)', 
          borderWidth: 1, 
          borderRadius: 8, 
          padding: 16, 
          alignItems: 'center',
          marginBottom: 16
        }}>
          <Text style={{ fontSize: 16, color: 'var(--color-feedback-warning-text)', textAlign: 'center' }}>
            No available trainers. Please select another date and time.
          </Text>
        </View>

        <BrandButton
          variant="outline"
          onPress={handleBack}
        >
          Back
        </BrandButton>
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
          Step 3 of 4: Pick Trainer
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
            width: '75%', 
            height: '100%', 
            backgroundColor: 'var(--color-brand-primary)', 
            borderRadius: 4 
          }} />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Pick Trainer
        </Text>
        <Text style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
          Choose a trainer for your session.
        </Text>

        <View style={{ 
          backgroundColor: 'var(--color-feedback-info-bg)', 
          borderColor: 'var(--color-feedback-info-border)', 
          borderWidth: 1, 
          borderRadius: 8, 
          padding: 12, 
          marginBottom: 16 
        }}>
          <Text style={{ fontSize: 14, color: 'var(--color-feedback-info-text)' }}>
            <Text style={{ fontWeight: 'bold' }}>Session:</Text> {court!.name} at {startTimeHHmm} ({durationMinutes} min)
          </Text>
        </View>
      </BrandCard>

      <ScrollView style={{ flex: 1 }}>
        {trainers.length === 0 ? (
          <BrandCard style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: 'var(--color-text-tertiary)' }}>No trainers found in this area.</Text>
          </BrandCard>
        ) : (
          trainers
            .filter(isTrainerEligible)
            .map(trainerItem => {
              const status = getTrainerStatus(trainerItem.id);
              const isSelected = isTrainerSelected(trainerItem.id);
              
              return (
                <TouchableOpacity
                  key={trainerItem.id}
                  onPress={() => handleTrainerSelect(trainerItem)}
                  style={{
                    marginBottom: 16,
                    borderRadius: 8,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'var(--color-brand-primary)' : 'var(--color-border-primary)',
                    backgroundColor: isSelected ? 'var(--color-feedback-info-bg)' : 'var(--color-surface-primary)',
                    padding: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                        {trainerItem.name}
                      </Text>
                      {trainerItem.maxLevel !== undefined && (
                        <Text style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                          Max Level: {rankLabels[trainerItem.maxLevel as Rank] || 'Unknown'}
                        </Text>
                      )}
                      {trainerItem.priceHourlyLE && (
                        <Text style={{ fontSize: 14, fontWeight: '500', color: 'var(--color-feedback-success-text)', marginBottom: 8 }}>
                          {trainerItem.priceHourlyLE} EGP/hour
                        </Text>
                      )}
                      {trainerItem.areasCovered && trainerItem.areasCovered.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                            Areas Covered:
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                            {trainerItem.areasCovered.map(area => (
                              <View
                                key={area}
                                style={{
                                  backgroundColor: 'var(--color-surface-tertiary)',
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                  borderRadius: 4,
                                }}
                              >
                                <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                  {area}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                    
                    <View style={{ marginLeft: 16, alignItems: 'center' }}>
                      {status === 'loading' && (
                        <View style={{ 
                          width: 20, 
                          height: 20, 
                          borderWidth: 2, 
                          borderColor: 'var(--color-brand-primary)', 
                          borderTopColor: 'transparent', 
                          borderRadius: 10,
                          // Note: React Native doesn't have animate-spin, this would need a proper animation library
                        }} />
                      )}
                      {status === 'available' && (
                        <View style={{
                          backgroundColor: 'var(--color-feedback-success-bg)',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}>
                          <Text style={{ fontSize: 12, fontWeight: '500', color: 'var(--color-feedback-success-text)' }}>
                            Available
                          </Text>
                        </View>
                      )}
                      {status === 'busy' && (
                        <View style={{
                          backgroundColor: 'var(--color-feedback-error-bg)',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}>
                          <Text style={{ fontSize: 12, fontWeight: '500', color: 'var(--color-feedback-error-text)' }}>
                            Busy
                          </Text>
                        </View>
                      )}
                      {status === 'unchecked' && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            checkTrainerAvailability(trainerItem.id);
                          }}
                          style={{
                            backgroundColor: 'var(--color-feedback-info-bg)',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '500', color: 'var(--color-feedback-info-text)' }}>
                            Check
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
        )}
      </ScrollView>

      {trainer && (
        <BrandCard style={{ 
          backgroundColor: 'var(--color-feedback-success-bg)', 
          borderColor: 'var(--color-feedback-success-border)', 
          borderWidth: 1, 
          padding: 12, 
          marginBottom: 16 
        }}>
          <Text style={{ fontSize: 14, color: 'var(--color-feedback-success-text)' }}>
            <Text style={{ fontWeight: 'bold' }}>Selected:</Text> {trainer.name}
          </Text>
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
          disabled={!trainer}
          style={{ flex: 1, marginLeft: 8 }}
        >
          Next
        </BrandButton>
      </View>
    </View>
  );
}
