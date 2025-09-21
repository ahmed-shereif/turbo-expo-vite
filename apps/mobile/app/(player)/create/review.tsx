import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useCreateSessionStore } from '../../../src/player/create/state';
import { auth } from '../../../src/lib/authClient';
import { createSession, combineDayAndTime, estimateIntendedShareLE, formatEGP } from '@repo/player-api';
import type { Rank } from '@repo/player-api';
import { notify } from '../../../src/lib/notify';
import { BrandButton, BrandCard } from '@repo/ui';

const rankLabels: Record<Rank, string> = {
  UNKNOWN: 'Unknown',
  LOW_D: 'Low D',
  MID_D: 'Mid D',
  HIGH_D: 'High D',
};

export default function CreateSessionStep4() {
  const { 
    dayISO, 
    court, 
    startTimeHHmm, 
    durationMinutes, 
    trainer, 
    seatsTotal, 
    type, 
    minRank, 
    updateState 
  } = useCreateSessionStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatLocalTime = (dayISO: string, timeHHmm: string) => {
    const date = new Date(`${dayISO}T${timeHHmm}:00`);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const intendedShare = estimateIntendedShareLE(
    court?.priceHourlyLE,
    trainer?.priceHourlyLE,
    seatsTotal
  );

  const handleSubmit = async () => {
    if (!court || !trainer || !dayISO || !startTimeHHmm) {
      Alert.alert('Missing information', 'Please complete all steps before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        entryFlow: 'COURT_FIRST' as const,
        courtId: court.id,
        trainerId: trainer.id,
        startAt: combineDayAndTime(dayISO, startTimeHHmm),
        durationMinutes: durationMinutes,
        type: type,
        seatsTotal: seatsTotal,
        minRank: minRank,
      };

      const result = await createSession(auth, payload);
      
      notify.success('Session created');
      useCreateSessionStore.getState().reset();
      router.replace(`/(player)/session/${result.id}`);
    } catch (error: any) {
      console.error('Failed to create session:', error);
      
      if (error.status === 422) {
        notify.error(error.message || 'Please check your input and try again.');
      } else if (error.status === 409) {
        notify.error("Trainer can't accept more requests for this time. Please choose another trainer or time.");
      } else {
        notify.error('Unexpected error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCancel = () => {
    useCreateSessionStore.getState().reset();
    router.replace('/(player)/home');
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <BrandCard style={{ padding: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
          Create Session
        </Text>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>
          Step 4 of 4: Review & Confirm
        </Text>
        
        {/* Progress bar */}
        <View style={{ 
          width: '100%', 
          height: 8, 
          backgroundColor: '#e5e7eb', 
          borderRadius: 4,
          marginBottom: 24
        }}>
          <View style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#3b82f6', 
            borderRadius: 4 
          }} />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Review & Confirm
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Review your session details before creating.
        </Text>
      </BrandCard>

      <ScrollView style={{ flex: 1 }}>
        {/* Session Summary */}
        <BrandCard style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Session Details
          </Text>
          
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#666' }}>Date & Time:</Text>
              <Text style={{ fontWeight: '500', textAlign: 'right', flex: 1 }}>
                {dayISO && startTimeHHmm && formatLocalTime(dayISO, startTimeHHmm)}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#666' }}>Duration:</Text>
              <Text style={{ fontWeight: '500' }}>{durationMinutes} minutes</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#666' }}>Court:</Text>
              <Text style={{ fontWeight: '500' }}>{court?.name}</Text>
            </View>
            
            {court?.area && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#666' }}>Area:</Text>
                <Text style={{ fontWeight: '500' }}>{court.area}</Text>
              </View>
            )}
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#666' }}>Trainer:</Text>
              <Text style={{ fontWeight: '500' }}>{trainer?.name}</Text>
            </View>
          </View>
        </BrandCard>

        {/* Session Configuration */}
        <BrandCard style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Session Configuration
          </Text>
          
          {/* Seats Total */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
              Number of Seats
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[2, 3, 4].map(seats => (
                <TouchableOpacity
                  key={seats}
                  onPress={() => updateState({ seatsTotal: seats as 2 | 3 | 4 })}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: seatsTotal === seats ? '#3b82f6' : '#d1d5db',
                    backgroundColor: seatsTotal === seats ? '#3b82f6' : '#ffffff',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: seatsTotal === seats ? '#ffffff' : '#374151',
                    fontWeight: '500',
                  }}>
                    {seats} seats
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Session Type */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
              Session Type
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['OPEN', 'PRIVATE'] as const).map(sessionType => (
                <TouchableOpacity
                  key={sessionType}
                  onPress={() => updateState({ type: sessionType })}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: type === sessionType ? '#3b82f6' : '#d1d5db',
                    backgroundColor: type === sessionType ? '#3b82f6' : '#ffffff',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: type === sessionType ? '#ffffff' : '#374151',
                    fontWeight: '500',
                  }}>
                    {sessionType}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {type === 'OPEN' 
                ? 'Other players can join your session'
                : 'Only invited players can join'
              }
            </Text>
          </View>

          {/* Minimum Rank */}
          <View>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
              Minimum Rank (Optional)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => updateState({ minRank: undefined })}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: !minRank ? '#3b82f6' : '#d1d5db',
                    backgroundColor: !minRank ? '#3b82f6' : '#ffffff',
                  }}
                >
                  <Text style={{
                    color: !minRank ? '#ffffff' : '#374151',
                    fontSize: 12,
                    fontWeight: '500',
                  }}>
                    Any Rank
                  </Text>
                </TouchableOpacity>
                {(['UNKNOWN', 'LOW_D', 'MID_D', 'HIGH_D'] as const).map(rank => (
                  <TouchableOpacity
                    key={rank}
                    onPress={() => updateState({ minRank: rank })}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: minRank === rank ? '#3b82f6' : '#d1d5db',
                      backgroundColor: minRank === rank ? '#3b82f6' : '#ffffff',
                    }}
                  >
                    <Text style={{
                      color: minRank === rank ? '#ffffff' : '#374151',
                      fontSize: 12,
                      fontWeight: '500',
                    }}>
                      {rankLabels[rank]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </BrandCard>

        {/* Pricing Preview */}
        <BrandCard style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Pricing Preview
          </Text>
          
          <View style={{ gap: 8 }}>
            {court?.priceHourlyLE && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#666' }}>
                  Court ({formatEGP(court.priceHourlyLE)}/hour):
                </Text>
                <Text style={{ fontWeight: '500' }}>
                  {formatEGP(court.priceHourlyLE / seatsTotal)} per person
                </Text>
              </View>
            )}
            
            {trainer?.priceHourlyLE && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#666' }}>
                  Trainer ({formatEGP(trainer.priceHourlyLE)}/hour):
                </Text>
                <Text style={{ fontWeight: '500' }}>
                  {formatEGP(trainer.priceHourlyLE / seatsTotal)} per person
                </Text>
              </View>
            )}
            
            <View style={{ 
              borderTopWidth: 1, 
              borderTopColor: '#e5e7eb', 
              paddingTop: 12,
              marginTop: 8
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  Your estimated share:
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#059669' }}>
                  {formatEGP(intendedShare)}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Final share may change if you choose to start early.
              </Text>
            </View>
          </View>
        </BrandCard>
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <BrandButton
          variant="outline"
          onPress={handleBack}
          style={{ flex: 1 }}
        >
          Back
        </BrandButton>
        
        <BrandButton
          variant="outline"
          onPress={handleCancel}
          style={{ flex: 1 }}
        >
          Cancel
        </BrandButton>
        
        <BrandButton
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={{ flex: 2 }}
        >
          {isSubmitting ? 'Creating...' : 'Create Session'}
        </BrandButton>
      </View>
    </View>
  );
}
