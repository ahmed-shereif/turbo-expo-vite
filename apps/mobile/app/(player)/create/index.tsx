import React from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useCreateSessionStore } from '../../../src/player/create/state';
import { BrandButton, BrandCard } from '@repo/ui';

export default function CreateSessionStep1() {
  const { dayISO, updateState } = useCreateSessionStore();

  const handleDateChange = (text: string) => {
    // Basic validation for YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(text)) {
      updateState({ dayISO: text });
    } else if (text === '') {
      updateState({ dayISO: null });
    }
  };

  const handleNext = () => {
    if (!dayISO) {
      Alert.alert('Please select a date', 'You need to choose a date for your session.');
      return;
    }
    router.push('/(player)/create/court-time');
  };

  const handleCancel = () => {
    useCreateSessionStore.getState().reset();
    router.replace('/(player)/home');
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <BrandCard style={{ padding: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
          Create Session
        </Text>
        <Text style={{ fontSize: 16, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
          Step 1 of 4: Select Day
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
            width: '25%', 
            height: '100%', 
            backgroundColor: 'var(--color-brand-primary)', 
            borderRadius: 4 
          }} />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Choose a Day
        </Text>
        <Text style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
          Select the date for your training session.
        </Text>

        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
          Session Date
        </Text>
        <TextInput
          value={dayISO || ''}
          onChangeText={handleDateChange}
          placeholder="YYYY-MM-DD"
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: 'var(--color-border-secondary)',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            marginBottom: 8,
          }}
        />
        <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          Select a date from today onwards
        </Text>

        {dayISO && (
          <View style={{ 
            backgroundColor: 'var(--color-feedback-info-bg)', 
            borderColor: 'var(--color-feedback-info-border)', 
            borderWidth: 1, 
            borderRadius: 8, 
            padding: 12, 
            marginTop: 16 
          }}>
            <Text style={{ fontSize: 14, color: 'var(--color-feedback-info-text)' }}>
              <Text style={{ fontWeight: 'bold' }}>Selected:</Text> {new Date(dayISO).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        )}
      </BrandCard>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <BrandButton
          variant="outline"
          onPress={handleCancel}
          style={{ flex: 1, marginRight: 8 }}
        >
          Cancel
        </BrandButton>
        
        <BrandButton
          onPress={handleNext}
          disabled={!dayISO}
          style={{ flex: 1, marginLeft: 8 }}
        >
          Next
        </BrandButton>
      </View>
    </View>
  );
}
