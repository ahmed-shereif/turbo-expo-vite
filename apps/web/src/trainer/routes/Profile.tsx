import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Screen, 
  BrandCard, 
  BrandButton, 
  SimpleSelectField,
  PriceInput, 
  MultiSelectField,
  CourtsMultiSelectField,
  TrainerProfileSkeleton,
  Icon,
  SafeText
} from '@repo/ui';
import { useTrainerProfile, useUpdateTrainerProfile, useCourtsByAreas } from '../hooks/useTrainerQueries';
import { YStack, XStack, H2, H3, Separator } from 'tamagui';
import { EG_CITIES, getAreasByCity } from '@repo/geo-eg';
import { Rank } from '@repo/trainer-api';
import { notify } from '../../lib/notify';

const profileSchema = z.object({
  hourlyPriceLE: z.number().min(50).max(10000),
  maxLevel: Rank,
  city: z.string().min(1),
  areasCovered: z.array(z.string()).min(1),
  acceptedCourtIds: z.array(z.string()),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function TrainerProfile() {
  const [selectedCity, setSelectedCity] = useState('Cairo');
  const { data: profile, isLoading } = useTrainerProfile();
  const updateMutation = useUpdateTrainerProfile();

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      hourlyPriceLE: 100,
      maxLevel: 'UNKNOWN',
      city: 'Cairo',
      areasCovered: [],
      acceptedCourtIds: [],
    },
  });

  const watchedCity = watch('city');
  const watchedAreas = watch('areasCovered');
  const availableAreas = getAreasByCity(watchedCity);
  
  // Fetch courts based on selected areas
  const { data: courts = [], isLoading: courtsLoading, error: courtsError } = useCourtsByAreas(
    watchedAreas,
    watchedAreas && watchedAreas.length > 0
  );

  useEffect(() => {
    if (profile) {
      setValue('hourlyPriceLE', profile.hourlyPriceLE);
      setValue('maxLevel', profile.maxLevel);
      setValue('areasCovered', profile.areasCovered);
      setValue('acceptedCourtIds', profile.acceptedCourtIds);
      
      // Find city from areas
      const city = EG_CITIES.find(c => 
        profile.areasCovered?.some(area => c.areas.includes(area))
      );
      if (city) {
        setValue('city', city.name);
        setSelectedCity(city.name);
      }
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileForm) => {
    // Ensure acceptedCourtIds is an array
    const submitData = {
      hourlyPriceLE: data.hourlyPriceLE,
      maxLevel: data.maxLevel,
      areasCovered: data.areasCovered,
      acceptedCourtIds: data.acceptedCourtIds || [],
    };
    
    try {
      await updateMutation.mutateAsync(submitData);
      notify.success('Profile updated successfully! 🎉');
    } catch (error: any) {
      if (error.status === 422) {
        notify.error('Please check your input values');
      } else if (error.status === 409) {
        notify.error('Conflict while saving profile; please retry.');
      } else {
        notify.error('Could not save profile.');
      }
    }
  };

  // Convert areas to MultiSelectOption format
  const areaOptions = availableAreas.map(area => ({
    value: area,
    label: area,
  }));

  // No need to convert courts to options anymore - CourtsMultiSelectField handles this

  // Convert rank options for select
  const rankOptions = [
    { value: 'UNKNOWN', label: 'Unknown' },
    { value: 'LOW_D', label: 'Low Division' },
    { value: 'MID_D', label: 'Mid Division' },
    { value: 'HIGH_D', label: 'High Division' },
  ];

  // Convert city options for select
  const cityOptions = EG_CITIES.map(city => ({
    value: city.name,
    label: city.name,
  }));

  if (isLoading) {
    return (
      <Screen>
        <TrainerProfileSkeleton />
      </Screen>
    );
  }

  return (
    <Screen>
      <YStack space="$6" padding="$4" maxWidth={800} alignSelf="center" width="100%">
        {/* Header */}
        <YStack space="$2" alignItems="center">
          <XStack alignItems="center" space="$3">
            <Icon name="User" size={32} color="$primary" />
            <H2 color="$textHigh">Trainer Profile</H2>
          </XStack>
          <SafeText color="$textMuted" fontSize="$4" textAlign="center">
            Set up your profile to help players find and book sessions with you
          </SafeText>
        </YStack>

        <BrandCard elevated>
          <YStack space="$6" padding="$6">
            {/* Basic Information Section */}
            <YStack space="$4">
              <H3 color="$textHigh" fontSize="$6" fontWeight="600">
                Basic Information
              </H3>
              <Separator />
              
              <YStack space="$4">
                <Controller
                  name="hourlyPriceLE"
                  control={control}
                  render={({ field }) => (
                    <PriceInput
                      label="Hourly Rate"
                      description="Set your hourly training rate in LE"
                      value={field.value}
                      onValueChange={field.onChange}
                      currency="LE"
                    
                      error={errors.hourlyPriceLE?.message}
                      required
                    />
                  )}
                />

                <Controller
                  name="maxLevel"
                  control={control}
                  render={({ field }) => (
                    <SimpleSelectField
                      label="Maximum Level You Train"
                      description="Select the highest level you can train players"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={rankOptions}
                      placeholder="Select your maximum training level"
                      error={errors.maxLevel?.message}
                      required
                    />
                  )}
                />
              </YStack>
            </YStack>

            {/* Location Section */}
            <YStack space="$4">
              <H3 color="$textHigh" fontSize="$6" fontWeight="600">
                Location & Coverage
              </H3>
              <Separator />
              
              <YStack space="$4">
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <SimpleSelectField
                      label="City"
                      description="Select the city where you provide training"
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCity(value);
                        setValue('areasCovered', []); // Reset areas when city changes
                      }}
                      options={cityOptions}
                      placeholder="Select your city"
                      error={errors.city?.message}
                      required
                    />
                  )}
                />

                <Controller
                  name="areasCovered"
                  control={control}
                  render={({ field }) => (
                    <MultiSelectField
                      label="Areas Covered"
                      description={`Select all areas in ${selectedCity} where you can provide training`}
                      options={areaOptions}
                      selectedValues={field.value}
                      onSelectionChange={field.onChange}
                      searchable
                      searchPlaceholder={`Search areas in ${selectedCity}...`}
                      maxHeight={200}
                      error={errors.areasCovered?.message}
                      required
                      selectAllLabel={`Select All Areas in ${selectedCity}`}
                    />
                  )}
                />
              </YStack>
            </YStack>

            {/* Court Preferences Section */}
            <YStack space="$4">
              <H3 color="$textHigh" fontSize="$6" fontWeight="600">
                Court Preferences
              </H3>
              <Separator />
              
              <Controller
                name="acceptedCourtIds"
                control={control}
                render={({ field }) => (
                  <CourtsMultiSelectField
                    label="Accepted Courts"
                    description="Select courts where you're available to train. Courts will be loaded based on your selected areas."
                    selectedValues={field.value}
                    onSelectionChange={field.onChange}
                    courts={courts}
                    isLoading={courtsLoading}
                    error={courtsError?.message}
                    searchable
                    searchPlaceholder="Search courts..."
                    maxHeight={200}
                    selectAllLabel="Select All Courts"
                  />
                )}
              />
            </YStack>

            {/* Action Buttons */}
            <YStack space="$3" paddingTop="$2">
              <BrandButton 
                onPress={handleSubmit(onSubmit as any)}
                disabled={isSubmitting || updateMutation.isPending}
                loading={isSubmitting || updateMutation.isPending}
                size="lg"
                fullWidth
                icon="Save"
              >
                {isSubmitting || updateMutation.isPending ? 'Saving Profile...' : 'Save Profile'}
              </BrandButton>
              
              {(isSubmitting || updateMutation.isPending) && (
                <SafeText color="$textMuted" fontSize="$3" textAlign="center">
                  Please wait while we save your changes...
                </SafeText>
              )}
            </YStack>
          </YStack>
        </BrandCard>
      </YStack>
    </Screen>
  );
}