import { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen, BrandCard, BrandButton } from '@repo/ui';
import { YStack, XStack, H2, Text, Input, Label, Select } from 'tamagui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../../src/lib/authClient';
import { getTrainerProfile, updateTrainerProfile, getAllCourts, Rank } from '@repo/trainer-api';
import { EG_CITIES, getAreasByCity } from '@repo/geo-eg';
import { notify } from '../../src/lib/notify';

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
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['trainer-profile'],
    queryFn: () => getTrainerProfile(auth),
  });

  const { data: allCourts = [] } = useQuery({
    queryKey: ['courts'],
    queryFn: () => getAllCourts(auth),
  });

  const updateMutation = useMutation({
    mutationFn: updateTrainerProfile.bind(null, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
    },
  });

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
  const watchedCourts = watch('acceptedCourtIds');
  const availableAreas = getAreasByCity(watchedCity);
  
  // Filter courts based on selected areas
  const filteredCourts = allCourts.filter(court => {
    // If no areas are selected, show all courts
    if (!watchedAreas || watchedAreas.length === 0) {
      return true;
    }
    // Filter courts that match any of the selected areas
    return watchedAreas.some(area => 
      court.area && court.area.toLowerCase().includes(area.toLowerCase())
    );
  });

  useEffect(() => {
    if (profile) {
      setValue('hourlyPriceLE', profile.hourlyPriceLE);
      setValue('maxLevel', profile.maxLevel as any);
      setValue('areasCovered', profile.areasCovered);
      setValue('acceptedCourtIds', profile.acceptedCourtIds);
      
      // Find city from areas
      const city = EG_CITIES.find(c => 
        profile.areasCovered.some(area => c.areas.includes(area))
      );
      if (city) {
        setValue('city', city.name);
        setSelectedCity(city.name);
      }
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateMutation.mutateAsync({
        hourlyPriceLE: data.hourlyPriceLE,
        maxLevel: data.maxLevel,
        areasCovered: data.areasCovered,
        acceptedCourtIds: data.acceptedCourtIds,
      });
      notify.success('Profile updated successfully');
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

  const toggleArea = (area: string) => {
    const current = watchedAreas;
    if (current.includes(area)) {
      setValue('areasCovered', current.filter(a => a !== area));
    } else {
      setValue('areasCovered', [...current, area]);
    }
  };

  const toggleCourt = (courtId: string) => {
    const current = watchedCourts;
    if (current.includes(courtId)) {
      setValue('acceptedCourtIds', current.filter(id => id !== courtId));
    } else {
      setValue('acceptedCourtIds', [...current, courtId]);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <YStack padding="$4">
          <Text>Loading profile...</Text>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack space="$4" padding="$4">
          <H2>Trainer Profile</H2>

          <BrandCard>
            <YStack space="$4" padding="$4">
              <YStack space="$2">
                <Label htmlFor="hourlyPrice">Hourly Price (LE)</Label>
                <Controller
                  name="hourlyPriceLE"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="hourlyPrice"
                      placeholder="Enter hourly price (50-10000)"
                      value={field.value?.toString() || ''}
                      onChangeText={(text: string) => field.onChange(parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.hourlyPriceLE && (
                  <Text color="$red10" fontSize="$2">{errors.hourlyPriceLE.message}</Text>
                )}
              </YStack>

              <YStack space="$2">
                <Label htmlFor="maxLevel">Maximum Level</Label>
                <Controller
                  name="maxLevel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select max level" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="UNKNOWN">Unknown</Select.Item>
                        <Select.Item value="LOW_D">Low Division</Select.Item>
                        <Select.Item value="MID_D">Mid Division</Select.Item>
                        <Select.Item value="HIGH_D">High Division</Select.Item>
                      </Select.Content>
                    </Select>
                  )}
                />
                {errors.maxLevel && (
                  <Text color="$red10" fontSize="$2">{errors.maxLevel.message}</Text>
                )}
              </YStack>

              <YStack space="$2">
                <Label htmlFor="city">City</Label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={(value: string) => {
                        field.onChange(value);
                        setSelectedCity(value);
                        setValue('areasCovered', []); // Reset areas when city changes
                      }}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select city" />
                      </Select.Trigger>
                      <Select.Content>
                        {EG_CITIES.map((city) => (
                          <Select.Item key={city.name} value={city.name}>
                            {city.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  )}
                />
              </YStack>

              <YStack space="$2">
                <Label>Areas Covered</Label>
                <Text fontSize="$2" color="$gray11">
                  Select areas you cover in {selectedCity}
                </Text>
                <YStack space="$2" maxHeight={200}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {availableAreas.map((area) => (
                      <XStack key={area} space="$2" alignItems="center" paddingVertical="$1">
                        <BrandButton
                          size="sm"
                          variant={watchedAreas.includes(area) ? 'outline' : 'ghost'}
                          onPress={() => toggleArea(area)}
                        >
                          {area}
                        </BrandButton>
                      </XStack>
                    ))}
                  </ScrollView>
                </YStack>
                {errors.areasCovered && (
                  <Text color="$red10" fontSize="$2">{errors.areasCovered.message}</Text>
                )}
              </YStack>

              <YStack space="$2">
                <Label>Accepted Courts</Label>
                <Text fontSize="$2" color="$gray11">
                  Selecting courts helps players find you. Showing {filteredCourts.length} courts in your selected areas.
                </Text>
                <YStack space="$2" maxHeight={200}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {filteredCourts.map((court) => (
                      <XStack key={court.id} space="$2" alignItems="center" paddingVertical="$1">
                        <BrandButton
                          size="sm"
                          variant={watchedCourts.includes(court.id) ? 'outline' : 'ghost'}
                          onPress={() => toggleCourt(court.id)}
                        >
                          {court.area ? `${court.name} • ${court.area}` : court.name}
                        </BrandButton>
                      </XStack>
                    ))}
                  </ScrollView>
                </YStack>
              </YStack>

              <BrandButton 
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || updateMutation.isPending}
              >
                {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Save Profile'}
              </BrandButton>
            </YStack>
          </BrandCard>
        </YStack>
      </ScrollView>
    </Screen>
  );
}