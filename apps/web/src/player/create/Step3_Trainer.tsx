import { useState, useEffect, useCallback } from 'react';
import { auth } from '../../lib/authClient';
import { fetchTrainers, quickCheckTrainer, combineDayAndTime } from '@repo/player-api';
import type { Rank } from '@repo/player-api';
import { notify } from '../../lib/notify';
import { BrandCard, Skeleton, Icon, BrandButton, TextField } from '@repo/ui';
import { YStack, XStack, Text, View, ScrollView } from 'tamagui';

// Define Trainer type locally since it's not exported
interface Trainer {
  id: string;
  name: string;
  maxLevel?: Rank;
  priceHourlyLE?: number;
  areasCovered?: string[];
}

interface Step3_TrainerProps {
  dayISO: string;
  court: { id: string; name: string; area?: string };
  startTimeHHmm: string;
  durationMinutes: number;
  trainer: Trainer | null;
  onTrainerChange: (trainer: Trainer | null) => void;
}

interface TrainerAvailability {
  [trainerId: string]: {
    available: boolean;
    loading: boolean;
    checked: boolean;
  };
}

interface TrainerFilters {
  searchQuery: string;
  rankFilter: Rank | 'all';
  priceRange: { min: number; max: number };
  availabilityFilter: 'all' | 'available' | 'checked';
}

const rankLabels: Record<Rank, string> = {
  UNKNOWN: 'Unknown',
  LOW_D: 'Low D',
  MID_D: 'Mid D',
  HIGH_D: 'High D',
};

const rankOrder: Record<Rank, number> = {
  UNKNOWN: 0,
  LOW_D: 1,
  MID_D: 2,
  HIGH_D: 3,
};

export function Step3_Trainer({
  dayISO,
  court,
  startTimeHHmm,
  durationMinutes,
  trainer,
  onTrainerChange,
}: Step3_TrainerProps) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<TrainerAvailability>({});
  const [noAvailableTrainers, setNoAvailableTrainers] = useState(false);
  const [filters, setFilters] = useState<TrainerFilters>({
    searchQuery: '',
    rankFilter: 'all',
    priceRange: { min: 0, max: 1000 },
    availabilityFilter: 'all',
  });
  const [displayedTrainers, setDisplayedTrainers] = useState<Trainer[]>([]);
  const [hasMoreTrainers, setHasMoreTrainers] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const startAtISO = combineDayAndTime(dayISO, startTimeHHmm);

  // Create a compatible auth wrapper
  const authWrapper = {
    withAuth: auth.withAuth.bind(auth),
    getBaseUrl: auth.getBaseUrl.bind(auth),
  };

  const fetchTrainersData = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setNoAvailableTrainers(false);

      const trainersData = await fetchTrainers(authWrapper, {
        area: court.area,
        pageSize: 10,
        page,
      });

      if (append) {
        setTrainers(prev => [...prev, ...trainersData as Trainer[]]);
        setDisplayedTrainers(prev => [...prev, ...trainersData as Trainer[]]);
      } else {
        setTrainers(trainersData as Trainer[]);
        setDisplayedTrainers((trainersData as Trainer[]).slice(0, 10));
      }

      setHasMoreTrainers(trainersData.length === 10);
    } catch (error: any) {
      console.error('Failed to fetch trainers:', error);
      notify.error('Failed to load trainers. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [court.area]);

  useEffect(() => {
    fetchTrainersData();
  }, [fetchTrainersData]);

  // Load more trainers when scrolling
  const loadMoreTrainers = useCallback(() => {
    if (!loadingMore && hasMoreTrainers) {
      const currentPage = Math.floor(trainers.length / 10) + 1;
      fetchTrainersData(currentPage, true);
    }
  }, [loadingMore, hasMoreTrainers, trainers.length, fetchTrainersData]);

  // Filter trainers based on current filters
  const filteredTrainers = useCallback(() => {
    return displayedTrainers.filter(trainerItem => {
      // Search query filter
      if (filters.searchQuery && !trainerItem.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }

      // Rank filter
      if (filters.rankFilter !== 'all' && trainerItem.maxLevel !== filters.rankFilter) {
        return false;
      }

      // Price range filter
      if (trainerItem.priceHourlyLE) {
        if (trainerItem.priceHourlyLE < filters.priceRange.min || trainerItem.priceHourlyLE > filters.priceRange.max) {
          return false;
        }
      }

      // Availability filter
      if (filters.availabilityFilter === 'available') {
        const status = availability[trainerItem.id];
        if (!status?.checked || !status?.available) {
          return false;
        }
      } else if (filters.availabilityFilter === 'checked') {
        const status = availability[trainerItem.id];
        if (!status?.checked) {
          return false;
        }
      }

      // Area coverage filter
      if (trainerItem.areasCovered && trainerItem.areasCovered.length > 0) {
        return !court.area || trainerItem.areasCovered.includes(court.area);
      }

      return true;
    }).sort((a, b) => {
      // Sort by rank (higher rank first), then by price (lower price first)
      const aRankOrder = rankOrder[a.maxLevel as Rank] || 0;
      const bRankOrder = rankOrder[b.maxLevel as Rank] || 0;

      if (aRankOrder !== bRankOrder) {
        return bRankOrder - aRankOrder;
      }

      const aPrice = a.priceHourlyLE || 0;
      const bPrice = b.priceHourlyLE || 0;
      return aPrice - bPrice;
    });
  }, [displayedTrainers, filters, availability, court.area]);

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
      const result = await quickCheckTrainer(authWrapper, trainerId, startAtISO, durationMinutes);

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
      onTrainerChange(selectedTrainer);
      notify.success(`Selected ${selectedTrainer.name} as your trainer!`);
    } else {
      notify.error('Trainer is busy at this time.');
    }
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

  const getRankColor = (rank: Rank) => {
    switch (rank) {
      case 'HIGH_D': return '$secondary';
      case 'MID_D': return '$accent';
      case 'LOW_D': return '$orange9';
      default: return '$color6';
    }
  };

  const getRankIcon = (rank: Rank) => {
    switch (rank) {
      case 'HIGH_D': return 'Crown';
      case 'MID_D': return 'Award';
      case 'LOW_D': return 'Star';
      default: return 'User';
    }
  };

  // Check if we have any available trainers after all checks are done
  useEffect(() => {
    const checkedTrainers = Object.values(availability).filter(status => status.checked);
    const availableTrainers = checkedTrainers.filter(status => status.available);

    if (checkedTrainers.length > 0 && availableTrainers.length === 0 && !loading) {
      setNoAvailableTrainers(true);
    }
  }, [availability, loading]);

  if (loading) {
    return (
      <YStack gap="$8" maxWidth={1200} width="100%" marginHorizontal="auto" paddingHorizontal="$4">
        {/* Header Skeleton */}
        <YStack alignItems="center" paddingVertical="$6">
          <Skeleton width={80} height={80} borderRadius="$round" marginBottom="$6" />
          <Skeleton width={300} height={40} marginBottom="$3" />
          <Skeleton width={500} height={24} />
        </YStack>

        {/* Filters Skeleton */}
        <BrandCard backgroundColor="$color2" padding="$8">
          <YStack gap="$8">
            <YStack alignItems="center" marginBottom="$2">
              <Skeleton width={200} height={32} marginBottom="$1" />
              <Skeleton width={300} height={20} />
            </YStack>
            <XStack gap="$8" $md={{ flexDirection: 'column', gap: '$6' }}>
              <YStack flex={1}>
                <Skeleton width={120} height={24} marginBottom="$4" />
                <Skeleton width="100%" height={48} borderRadius="$4" />
              </YStack>
              <YStack flex={1}>
                <Skeleton width={140} height={24} marginBottom="$4" />
                <XStack gap="$3">
                  <Skeleton width={100} height={48} borderRadius="$5" />
                  <Skeleton width={100} height={48} borderRadius="$5" />
                  <Skeleton width={100} height={48} borderRadius="$5" />
                </XStack>
              </YStack>
            </XStack>
          </YStack>
        </BrandCard>

        {/* Trainers Skeleton */}
        <YStack gap="$4">
          {[1, 2, 3].map(i => (
            <BrandCard key={i} padding="$6" backgroundColor="$surface">
              <YStack gap="$4">
                <XStack alignItems="flex-start" justifyContent="space-between" width="100%">
                  <YStack flex={1} gap="$2">
                    <Skeleton width={200} height={28} />
                    <Skeleton width={150} height={20} />
                    <Skeleton width={180} height={20} />
                  </YStack>
                  <Skeleton width={80} height={60} borderRadius="$4" />
                </XStack>
                <Skeleton width="100%" height={40} borderRadius="$3" />
              </YStack>
            </BrandCard>
          ))}
        </YStack>
      </YStack>
    );
  }

  if (noAvailableTrainers) {
    return (
      <YStack gap="$8" maxWidth={1200} width="100%" marginHorizontal="auto" paddingHorizontal="$4">
        {/* Header */}
        <YStack alignItems="center" paddingVertical="$6">
          <View
            width={80}
            height={80}
            backgroundColor="$primary"
            borderRadius="$round"
            alignItems="center"
            justifyContent="center"
            marginBottom="$6"
            shadowColor="$primary"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.2}
            shadowRadius={12}
          >
            <Icon name="User" size={32} color="white" />
          </View>
          <Text fontSize="$10" fontWeight="800" color="$textHigh" marginBottom="$3" textAlign="center" letterSpacing={-0.5}>
            Pick Your Trainer
          </Text>
          <Text color="$textMuted" fontSize="$6" textAlign="center" lineHeight="$6" maxWidth={500}>
            Choose the perfect trainer to guide your session
          </Text>
        </YStack>

        <BrandCard
          backgroundColor="$color2"
          padding="$12"
          alignItems="center"
          borderWidth={1}
          borderColor="$color4"
          borderStyle="dashed"
        >
          <View
            width={96}
            height={96}
            backgroundColor="$color4"
            borderRadius="$round"
            alignItems="center"
            justifyContent="center"
            marginBottom="$6"
            shadowColor="$color8"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={8}
          >
            <Icon name="UserX" size={40} color="$color8" />
          </View>
          <Text color="$textHigh" fontSize="$7" fontWeight="700" marginBottom="$2" textAlign="center">
            No Available Trainers
          </Text>
          <Text color="$textMuted" fontSize="$5" textAlign="center" marginBottom="$4" maxWidth={400}>
            We couldn't find any available trainers for this time slot. Try selecting a different date and time.
          </Text>
          <BrandButton
            variant="outline"
            onPress={() => {
              setFilters(prev => ({ ...prev, availabilityFilter: 'all' }));
            }}
            icon="RefreshCw"
          >
            Clear Filters
          </BrandButton>
        </BrandCard>
      </YStack>
    );
  }

  return (
    <YStack gap="$5" maxWidth={800} width="100%" marginHorizontal="auto" paddingHorizontal="$3">
      {/* Header */}
      <YStack alignItems="center" paddingVertical="$4">
        <View
          width={56}
          height={56}
          backgroundColor="$primary"
          borderRadius="$round"
          alignItems="center"
          justifyContent="center"
          marginBottom="$4"
          shadowColor="$primary"
          shadowOffset={{ width: 0, height: 3 }}
          shadowOpacity={0.2}
          shadowRadius={8}
        >
          <Icon name="User" size={24} color="white" />
        </View>
        <Text fontSize="$7" fontWeight="800" color="$textHigh" marginBottom="$2" textAlign="center" letterSpacing={-0.5}>
          Pick Your Trainer
        </Text>
        <Text color="$textMuted" fontSize="$4" textAlign="center" lineHeight="$5" maxWidth={400}>
          Choose the perfect trainer to guide your session
        </Text>
      </YStack>

      {/* Session Summary */}
      <BrandCard
        backgroundColor="$color2"
        padding="$5"
        borderWidth={2}
        borderColor="$primary"
        shadowColor="$primary"
        shadowOffset={{ width: 0, height: 3 }}
        shadowOpacity={0.15}
        shadowRadius={6}
      >
        <YStack alignItems="center" gap="$3">
          <XStack alignItems="center" gap="$2">
            <View
              width={24}
              height={24}
              backgroundColor="$primary"
              borderRadius="$3"
              alignItems="center"
              justifyContent="center"
            >
              <Icon name="CheckCircle" size={12} color="white" />
            </View>
            <Text fontSize="$5" fontWeight="700" color="$primary">Session Details</Text>
          </XStack>
          <YStack alignItems="center" gap="$1">
            <Text fontSize="$6" fontWeight="800" color="$textHigh">{court.name}</Text>
            <Text fontSize="$4" color="$primary" fontWeight="600">
              {startTimeHHmm} • {durationMinutes} minutes
            </Text>
          </YStack>
        </YStack>
      </BrandCard>

      {/* Filters Section */}
      <BrandCard
        backgroundColor="$surface"
        padding="$5"
        borderWidth={1}
        borderColor="$color4"
        shadowColor="$color8"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.08}
        shadowRadius={6}
      >
        <YStack gap="$5">
          <YStack alignItems="center" marginBottom="$1">
            <Text fontSize="$5" fontWeight="700" color="$textHigh" marginBottom="$1">
              Filter & Search
            </Text>
            <Text color="$textMuted" fontSize="$3">
              Find the perfect trainer for your needs
            </Text>
          </YStack>

          <XStack gap="$5" $md={{ flexDirection: 'column', gap: '$4' }}>
            {/* Search Filter */}
            <YStack flex={1}>
              <XStack alignItems="center" marginBottom="$3">
                <View
                  width={24}
                  height={24}
                  backgroundColor="$primary"
                  borderRadius="$3"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="$2"
                >
                  <Icon name="Search" size={12} color="white" />
                </View>
                <Text fontSize="$4" fontWeight="700" color="$textHigh">Search Trainers</Text>
              </XStack>
              <TextField
                fullWidth
                value={filters.searchQuery}
                onChangeText={(value) => setFilters(prev => ({ ...prev, searchQuery: value }))}
                placeholder="e.g., Ahmed, Mohamed, Professional"
                backgroundColor="$color2"
                borderColor="$color5"
                borderWidth={2}
                borderRadius="$4"
                paddingHorizontal="$4"
                paddingVertical="$3"
                fontSize="$5"
                focusStyle={{
                  borderColor: '$primary',
                  backgroundColor: '$surface',
                }}
              />
            </YStack>

            {/* Rank Filter */}
            <YStack flex={1}>
              <XStack alignItems="center" marginBottom="$3">
                <View
                  width={24}
                  height={24}
                  backgroundColor="$secondary"
                  borderRadius="$3"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="$2"
                >
                  <Icon name="Award" size={12} color="white" />
                </View>
                <Text fontSize="$4" fontWeight="700" color="$textHigh">Rank Level</Text>
              </XStack>
              <XStack gap="$3" flexWrap="wrap">
                <BrandButton
                  variant={filters.rankFilter === 'all' ? 'primary' : 'outline'}
                  onPress={() => setFilters(prev => ({ ...prev, rankFilter: 'all' }))}
                  backgroundColor={filters.rankFilter === 'all' ? '$primary' : '$surface'}
                  borderColor={filters.rankFilter === 'all' ? '$primary' : '$color6'}
                  borderWidth={2}
                >
                  All Ranks
                </BrandButton>
                {Object.entries(rankLabels).map(([rank, label]) => (
                  <BrandButton
                    key={rank}
                    variant={filters.rankFilter === rank ? 'primary' : 'outline'}
                    onPress={() => setFilters(prev => ({ ...prev, rankFilter: rank as Rank }))}
                    backgroundColor={filters.rankFilter === rank ? '$primary' : '$surface'}
                    borderColor={filters.rankFilter === rank ? '$primary' : '$color6'}
                    borderWidth={2}
                  >
                    {label}
                  </BrandButton>
                ))}
              </XStack>
            </YStack>
          </XStack>
        </YStack>
      </BrandCard>

      {/* Trainers List */}
      <YStack gap="$4">
        {filteredTrainers().length === 0 ? (
          <BrandCard
            backgroundColor="$color2"
            padding="$8"
            alignItems="center"
            borderWidth={1}
            borderColor="$color4"
            borderStyle="dashed"
          >
            <View
              width={72}
              height={72}
              backgroundColor="$color4"
              borderRadius="$round"
              alignItems="center"
              justifyContent="center"
              marginBottom="$4"
              shadowColor="$color8"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={6}
            >
              <Icon name="Users" size={32} color="$color8" />
            </View>
            <Text color="$textHigh" fontSize="$5" fontWeight="700" marginBottom="$2" textAlign="center">
              No Trainers Found
            </Text>
            <Text color="$textMuted" fontSize="$4" textAlign="center" marginBottom="$3" maxWidth={400}>
              We couldn't find any trainers matching your criteria. Try adjusting your search or filters.
            </Text>
            <BrandButton
              variant="outline"
              onPress={() => setFilters({
                searchQuery: '',
                rankFilter: 'all',
                priceRange: { min: 0, max: 1000 },
                availabilityFilter: 'all',
              })}
              icon="RefreshCw"
            >
              Clear Filters
            </BrandButton>
          </BrandCard>
        ) : (
          <ScrollView
            height={500}
            $md={{ height: 400 }}
            $sm={{ height: 350 }}
            onScroll={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
              const isCloseToBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
              if (isCloseToBottom && hasMoreTrainers && !loadingMore) {
                loadMoreTrainers();
              }
            }}
            scrollEventThrottle={400}
            showsVerticalScrollIndicator={false}
          >
            <YStack gap="$4" paddingBottom="$6">
              {filteredTrainers().map(trainerItem => {
                const status = getTrainerStatus(trainerItem.id);
                const isSelected = isTrainerSelected(trainerItem.id);

                return (
                  <BrandCard
                    key={trainerItem.id}
                    elevated
                    padding="$5"
                    backgroundColor={isSelected ? '$primary' : '$surface'}
                    borderColor={isSelected ? '$primary' : '$color4'}
                    borderWidth={isSelected ? 2 : 1}
                    shadowColor={isSelected ? '$primary' : '$color8'}
                    shadowOffset={isSelected ? { width: 0, height: 4 } : { width: 0, height: 2 }}
                    shadowOpacity={isSelected ? 0.2 : 0.08}
                    shadowRadius={isSelected ? 8 : 6}
                    borderRadius="$5"
                    animation="quick"
                    hoverStyle={{
                      scale: 1.01,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.12,
                      shadowRadius: 8
                    }}
                    pressStyle={{ scale: 0.99 }}
                  >
                    <YStack width="100%" gap="$3">
                      {/* Header Row with Trainer Name, Rank, and Price */}
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                        $sm={{ flexDirection: 'column', alignItems: 'flex-start', gap: '$2' }}
                      >
                        <XStack alignItems="center" gap="$2" flex={1}>
                          <View
                            width={48}
                            height={48}
                            backgroundColor={isSelected ? 'white' : getRankColor(trainerItem.maxLevel as Rank)}
                            borderRadius="$round"
                            alignItems="center"
                            justifyContent="center"
                            shadowColor={isSelected ? '$primary' : getRankColor(trainerItem.maxLevel as Rank)}
                            shadowOffset={{ width: 0, height: 2 }}
                            shadowOpacity={0.2}
                            shadowRadius={3}
                          >
                            <Icon
                              name={getRankIcon(trainerItem.maxLevel as Rank)}
                              size={20}
                              color={isSelected ? '$primary' : 'white'}
                            />
                          </View>
                          <YStack gap="$1">
                            <Text
                              fontSize="$6"
                              fontWeight="800"
                              color={isSelected ? 'white' : '$textHigh'}
                              letterSpacing={-0.5}
                            >
                              {trainerItem.name}
                            </Text>
                            {trainerItem.maxLevel !== undefined && (
                              <XStack alignItems="center" gap="$2">
                                <View
                                  width={16}
                                  height={16}
                                  backgroundColor={isSelected ? 'rgba(255,255,255,0.2)' : getRankColor(trainerItem.maxLevel as Rank)}
                                  borderRadius="$2"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Icon
                                    name={getRankIcon(trainerItem.maxLevel as Rank)}
                                    size={10}
                                    color={isSelected ? 'white' : 'white'}
                                  />
                                </View>
                                <Text
                                  fontSize="$4"
                                  color={isSelected ? 'rgba(255,255,255,0.9)' : '$textMuted'}
                                  fontWeight="600"
                                >
                                  {rankLabels[trainerItem.maxLevel as Rank] || 'Unknown'}
                                </Text>
                              </XStack>
                            )}
                          </YStack>
                          {isSelected && (
                            <View
                              backgroundColor="white"
                              paddingHorizontal="$3"
                              paddingVertical="$1"
                              borderRadius="$3"
                              shadowColor="$primary"
                              shadowOffset={{ width: 0, height: 2 }}
                              shadowOpacity={0.2}
                              shadowRadius={4}
                            >
                              <Text fontSize="$3" color="$primary" fontWeight="700">SELECTED</Text>
                            </View>
                          )}
                        </XStack>

                        <XStack alignItems="center" gap="$3">
                          {/* Price Tag */}
                          {trainerItem.priceHourlyLE && (
                            <View
                              backgroundColor={isSelected ? 'white' : '$secondary'}
                              paddingHorizontal="$3"
                              paddingVertical="$2"
                              borderRadius="$4"
                              shadowColor={isSelected ? '$primary' : '$secondary'}
                              shadowOffset={{ width: 0, height: 1 }}
                              shadowOpacity={0.2}
                              shadowRadius={3}
                              minWidth={100}
                              alignItems="center"
                            >
                              <Text
                                fontSize="$5"
                                fontWeight="800"
                                color={isSelected ? '$primary' : 'white'}
                              >
                                {trainerItem.priceHourlyLE}
                              </Text>
                              <Text
                                fontSize="$2"
                                fontWeight="600"
                                color={isSelected ? '$primary' : 'white'}
                                opacity={0.8}
                              >
                                EGP per hour
                              </Text>
                            </View>
                          )}
                        </XStack>
                      </XStack>

                      {/* Areas Covered */}
                      {trainerItem.areasCovered && trainerItem.areasCovered.length > 0 && (
                        <YStack gap="$1">
                          <Text
                            fontSize="$4"
                            fontWeight="700"
                            color={isSelected ? 'white' : '$textMuted'}
                            marginBottom="$2"
                          >
                            Areas Covered
                          </Text>
                          <XStack flexWrap="wrap" gap="$2">
                            {trainerItem.areasCovered.map((area: string) => (
                              <View
                                key={area}
                                backgroundColor={isSelected ? 'white' : '$color3'}
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$3"
                                borderWidth={1}
                                borderColor={isSelected ? 'rgba(255,255,255,0.3)' : '$color5'}
                              >
                                <Text
                                  fontSize="$3"
                                  color={isSelected ? '$primary' : '$textHigh'}
                                  fontWeight="600"
                                >
                                  {area}
                                </Text>
                              </View>
                            ))}
                          </XStack>
                        </YStack>
                      )}

                      {/* Availability Status */}
                      <YStack
                        borderTopWidth={1}
                        borderTopColor={isSelected ? 'rgba(255,255,255,0.2)' : '$color4'}
                        paddingTop="$4"
                        marginTop="$3"
                      >
                        <XStack
                          alignItems="center"
                          justifyContent="space-between"
                          marginBottom="$3"
                        >
                          <Text
                            fontSize="$5"
                            fontWeight="700"
                            color={isSelected ? 'white' : '$textHigh'}
                          >
                            Availability Status
                          </Text>
                          <XStack alignItems="center" gap="$4">
                            {status === 'loading' && (
                              <XStack alignItems="center" gap="$2">
                                <View
                                  width={20}
                                  height={20}
                                  borderWidth={2}
                                  borderColor={isSelected ? 'rgba(255,255,255,0.5)' : '$color6'}
                                  borderTopColor={isSelected ? 'white' : '$primary'}
                                  borderRadius="$round"
                                />
                                <Text
                                  fontSize="$4"
                                  color={isSelected ? 'rgba(255,255,255,0.8)' : '$textMuted'}
                                  fontWeight="600"
                                >
                                  Checking...
                                </Text>
                              </XStack>
                            )}
                            {status === 'available' && (
                              <XStack alignItems="center" gap="$2">
                                <View
                                  width={20}
                                  height={20}
                                  backgroundColor="$secondary"
                                  borderRadius="$2"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Icon name="Check" size={12} color="white" />
                                </View>
                                <Text
                                  fontSize="$4"
                                  color={isSelected ? 'rgba(255,255,255,0.9)' : '$textHigh'}
                                  fontWeight="600"
                                >
                                  Available
                                </Text>
                              </XStack>
                            )}
                            {status === 'busy' && (
                              <XStack alignItems="center" gap="$2">
                                <View
                                  width={20}
                                  height={20}
                                  backgroundColor="$red9"
                                  borderRadius="$2"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Icon name="X" size={12} color="white" />
                                </View>
                                <Text
                                  fontSize="$4"
                                  color={isSelected ? 'rgba(255,255,255,0.8)' : '$textMuted'}
                                  fontWeight="600"
                                >
                                  Busy
                                </Text>
                              </XStack>
                            )}
                            {status === 'unchecked' && (
                              <BrandButton
                                size="sm"
                                variant="outline"
                                onPress={(e) => {
                                  e.stopPropagation();
                                  checkTrainerAvailability(trainerItem.id);
                                }}
                                backgroundColor="$primary"
                                borderColor="$primary"
                                color="white"
                                fontWeight="600"
                              >
                                Check Availability
                              </BrandButton>
                            )}
                          </XStack>
                        </XStack>

                        {/* Action Button */}
                        {status === 'available' && (
                          <BrandButton
                            variant="primary"
                            onPress={() => handleTrainerSelect(trainerItem)}
                            backgroundColor={isSelected ? 'white' : '$primary'}
                            borderColor={isSelected ? 'white' : '$primary'}
                            color={isSelected ? '$primary' : 'white'}
                            fontWeight="700"
                            shadowColor={isSelected ? '$primary' : '$primary'}
                            shadowOffset={{ width: 0, height: 2 }}
                            shadowOpacity={0.2}
                            shadowRadius={4}
                          >
                            {isSelected ? 'Selected' : 'Select Trainer'}
                          </BrandButton>
                        )}
                      </YStack>
                    </YStack>
                  </BrandCard>
                );
              })
              }</YStack>
          </ScrollView>
        )}
      </YStack>

      {/* Selected Trainer Summary */}
      {trainer && (
        <BrandCard
          backgroundColor="$primary"
          borderWidth={2}
          borderColor="$primary"
          padding="$5"
          marginTop="$4"
          shadowColor="$primary"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.2}
          shadowRadius={8}
          borderRadius="$5"
          animation="quick"
        >
          <XStack alignItems="center" gap="$4" $md={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <View
              width={48}
              height={48}
              backgroundColor="white"
              borderRadius="$round"
              alignItems="center"
              justifyContent="center"
              shadowColor="white"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.3}
              shadowRadius={3}
            >
              <Icon name="Check" size={20} color="$primary" />
            </View>
            <YStack flex={1} gap="$2">
              <Text fontSize="$5" fontWeight="800" color="white" marginBottom="$1">
                Excellent Choice!
              </Text>
              <Text fontSize="$6" fontWeight="700" color="white" marginBottom="$1">
                {trainer.name}
              </Text>
              <Text fontSize="$4" color="rgba(255,255,255,0.9)" marginBottom="$2" fontWeight="600">
                {startTimeHHmm} • {durationMinutes} minutes
              </Text>
              <XStack gap="$4" flexWrap="wrap" $md={{ flexDirection: 'column', gap: '$2' }}>
                <XStack alignItems="center" gap="$2">
                  <View
                    width={20}
                    height={20}
                    backgroundColor="rgba(255,255,255,0.2)"
                    borderRadius="$2"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon name="Clock" size={12} color="white" />
                  </View>
                  <Text fontSize="$3" color="rgba(255,255,255,0.9)" fontWeight="600">
                    {(durationMinutes / 60)} hour{(durationMinutes / 60) > 1 ? 's' : ''} session
                  </Text>
                </XStack>
                {trainer.priceHourlyLE && (
                  <XStack alignItems="center" gap="$2">
                    <View
                      width={20}
                      height={20}
                      backgroundColor="rgba(255,255,255,0.2)"
                      borderRadius="$2"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon name="DollarSign" size={12} color="white" />
                    </View>
                    <Text fontSize="$3" color="rgba(255,255,255,0.9)" fontWeight="600">
                      {Math.round((trainer.priceHourlyLE * durationMinutes) / 60)} EGP total
                    </Text>
                  </XStack>
                )}
              </XStack>
            </YStack>
            <BrandButton
              variant="outline"
              size="md"
              onPress={() => onTrainerChange(null)}
              icon="X"
              backgroundColor="white"
              borderColor="white"
              color="$primary"
              fontWeight="700"
              shadowColor="white"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.3}
              shadowRadius={4}
            >
              Change Selection
            </BrandButton>
          </XStack>
        </BrandCard>
      )}
    </YStack>
  );
}
