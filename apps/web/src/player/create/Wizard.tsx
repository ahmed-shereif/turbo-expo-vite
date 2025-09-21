import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/authClient';
import { createSession, combineDayAndTime, estimateIntendedShareLE } from '@repo/player-api';
import { notify } from '../../lib/notify';
import { Step1_Day } from './Step1_Day';
import { Step2_CourtTime } from './Step2_CourtTime';
import { Step3_Trainer } from './Step3_Trainer';
import { Step4_Review } from './Step4_Review';
import { BrandButton, Icon, BrandCard } from '@repo/ui';
import { YStack, XStack, Text, View } from 'tamagui';
import type { WizardState } from './types';

const initialState: WizardState = {
  dayISO: null,
  court: null,
  startTimeHHmm: null,
  durationMinutes: 60,
  trainer: null,
  seatsTotal: 4,
  type: 'OPEN',
  minRank: undefined,
};

export function Wizard() {
  const navigate = useNavigate();
  const [state, setState] = useState<WizardState>(initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const canProceedToStep2 = state.dayISO !== null;
  const canProceedToStep3 = state.court !== null && state.startTimeHHmm !== null;
  const canProceedToStep4 = state.trainer !== null;
  const canSubmit = state.court !== null && state.trainer !== null && state.dayISO !== null && state.startTimeHHmm !== null;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCancel = () => {
    setState(initialState);
    setCurrentStep(1);
    navigate('/player/home');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const payload = {
        entryFlow: 'COURT_FIRST' as const,
        courtId: state.court!.id,
        trainerId: state.trainer!.id,
        startAt: combineDayAndTime(state.dayISO!, state.startTimeHHmm!),
        durationMinutes: state.durationMinutes,
        type: state.type,
        seatsTotal: state.seatsTotal,
        minRank: state.minRank,
      };

      await createSession(auth, payload);
      
      notify.success('Session created successfully!');
      navigate('/player/home');
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_Day
            dayISO={state.dayISO}
            onDayChange={(dayISO) => updateState({ dayISO })}
          />
        );
      case 2:
        return (
          <Step2_CourtTime
            dayISO={state.dayISO!}
            court={state.court}
            startTimeHHmm={state.startTimeHHmm}
            durationMinutes={state.durationMinutes}
            onCourtChange={(court) => updateState({ court })}
            onTimeChange={(startTimeHHmm) => updateState({ startTimeHHmm })}
            onDurationChange={(durationMinutes) => updateState({ durationMinutes })}
          />
        );
      case 3:
        return (
          <Step3_Trainer
            dayISO={state.dayISO!}
            court={state.court!}
            startTimeHHmm={state.startTimeHHmm!}
            durationMinutes={state.durationMinutes}
            trainer={state.trainer}
            onTrainerChange={(trainer) => updateState({ trainer })}
          />
        );
      case 4:
        return (
          <Step4_Review
            state={state}
            onSeatsChange={(seatsTotal) => updateState({ seatsTotal })}
            onTypeChange={(type) => updateState({ type })}
            onMinRankChange={(minRank) => updateState({ minRank })}
            estimateIntendedShareLE={estimateIntendedShareLE}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select Day';
      case 2: return 'Pick Court & Time';
      case 3: return 'Pick Trainer';
      case 4: return 'Review & Confirm';
      default: return '';
    }
  };

  return (
    <View minHeight="100vh" backgroundColor="$color1">
      <View maxWidth={1024} marginHorizontal="auto" paddingHorizontal="$4" paddingVertical="$8">
        {/* Header Section */}
        <YStack alignItems="center" marginBottom="$12">
          <View
            width={64}
            height={64}
            backgroundColor="$blue9"
            borderRadius="$12"
            alignItems="center"
            justifyContent="center"
            marginBottom="$4"
          >
            <Icon name="Plus" size={24} color="white" />
          </View>
          <Text fontSize="$10" fontWeight="700" color="$textHigh" marginBottom="$2" textAlign="center">Create Your Session</Text>
          <Text fontSize="$6" color="$textMuted" maxWidth={512} textAlign="center">
            Let's set up your perfect paddle training session in just a few steps
          </Text>
        </YStack>

        {/* Progress Section */}
        <YStack marginBottom="$8">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$4">
            {[1, 2, 3, 4].map((step) => {
              const getStepColors = () => {
                if (step < currentStep) {
                  return { bg: '$green9', border: '$green9', color: 'white' };
                }
                if (step === currentStep) {
                  return { bg: '$blue9', border: '$blue9', color: 'white' };
                }
                return { bg: '$surface', border: '$color6', color: '$color8' };
              };
              
              const colors = getStepColors();
              
              return (
                <XStack key={step} alignItems="center" flex={1}>
                  <View
                    width={48}
                    height={48}
                    backgroundColor={colors.bg}
                    borderWidth={2}
                    borderColor={colors.border}
                    borderRadius="$12"
                    alignItems="center"
                    justifyContent="center"
                    animation="quick"
                  >
                    {step < currentStep ? (
                      <Icon name="Check" size={20} color="white" />
                    ) : (
                      <Text fontSize="$4" fontWeight="600" color={colors.color}>{step}</Text>
                    )}
                  </View>
                  {step < 4 && (
                    <View
                      flex={1}
                      height={4}
                      marginHorizontal="$4"
                      backgroundColor={step < currentStep ? '$green9' : '$color4'}
                      borderRadius="$10"
                      animation="quick"
                    />
                  )}
                </XStack>
              );
            })}
          </XStack>
          <YStack alignItems="center">
            <Text fontSize="$4" fontWeight="500" color="$textMuted">
              Step {currentStep} of 4: <Text color="$blue9">{getStepTitle()}</Text>
            </Text>
          </YStack>
        </YStack>

        {/* Main Content */}
        <BrandCard elevated padding="$8" marginBottom="$8">
          {renderStep()}
        </BrandCard>

        {/* Navigation */}
        <BrandCard padding="$6">
          <XStack alignItems="center" justifyContent="space-between">
            <View>
              {currentStep > 1 && (
                <BrandButton
                  variant="outline"
                  onPress={handleBack}
                  disabled={isSubmitting}
                  icon="ChevronLeft"
                  size="lg"
                >
                  Back
                </BrandButton>
              )}
            </View>
            
            <XStack alignItems="center" gap="$4">
              <BrandButton
                variant="ghost"
                onPress={handleCancel}
                disabled={isSubmitting}
                size="lg"
              >
                Cancel
              </BrandButton>
              
              {currentStep < 4 ? (
                <BrandButton
                  onPress={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedToStep2) ||
                    (currentStep === 2 && !canProceedToStep3) ||
                    (currentStep === 3 && !canProceedToStep4) ||
                    isSubmitting
                  }
                  iconAfter="ChevronRight"
                  size="lg"
                >
                  Continue
                </BrandButton>
              ) : (
                <BrandButton
                  onPress={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  loading={isSubmitting}
                  icon="Check"
                  size="lg"
                >
                  Create Session
                </BrandButton>
              )}
            </XStack>
          </XStack>
        </BrandCard>
      </View>
    </View>
  );
}
