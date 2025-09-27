import { useState, useEffect, useCallback } from 'react';
import { auth } from '../../lib/authClient';
import { fetchCourts, quickCheckCourt, combineDayAndTime } from '@repo/player-api';
import { notify } from '../../lib/notify';
import { BrandCard, Skeleton, Icon, BrandButton, TextField, SafeText } from '@repo/ui';
import { YStack, XStack, Text, View, Button, ScrollView } from 'tamagui';

// Create a compatible auth wrapper
const authWrapper = {
  withAuth: auth.withAuth.bind(auth),
  getBaseUrl: auth.getBaseUrl.bind(auth),
};

// Define Court type locally since it's not exported
interface Court {
  id: string;
  name: string;
  area?: string;
  address?: string;
  priceHourlyLE: number;
  facilities?: string[];
}

interface Step2_CourtTimeProps {
  dayISO: string;
  court: Court | null;
  startTimeHHmm: string | null;
  durationMinutes: number;
  onCourtChange: (court: Court | null) => void;
  onTimeChange: (startTimeHHmm: string) => void;
  onDurationChange: (durationMinutes: number) => void;
}

interface CourtAvailability {
  [courtId: string]: {
    [timeSlot: string]: {
      available: boolean;
      loading: boolean;
      checked: boolean;
    };
  };
}

interface SelectedSlot {
  courtId: string;
  startTime: string;
  duration: number;
}

export function Step2_CourtTime({
  dayISO,
  court,
  durationMinutes,
  onCourtChange,
  onTimeChange,
  onDurationChange,
}: Step2_CourtTimeProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState('');
  const [availability, setAvailability] = useState<CourtAvailability>({});
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [displayedCourts, setDisplayedCourts] = useState<Court[]>([]);
  const [hasMoreCourts, setHasMoreCourts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedCourtId, setExpandedCourtId] = useState<string | null>(null);

  // Generate time slots from 07:00 to 23:00 in 30-minute increments
  const timeSlots = Array.from({ length: 33 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Duration options in hours
  const durationOptions = [
    { value: 60, label: '1 Hour' },
    { value: 120, label: '2 Hours' },
    { value: 180, label: '3 Hours' },
  ];

  // Check if consecutive hours are available for multi-hour sessions
  const checkConsecutiveAvailability = useCallback((courtId: string, startTime: string, duration: number) => {
    const startIndex = timeSlots.indexOf(startTime);
    if (startIndex === -1) return false;
    
    const requiredSlots = duration / 30; // Convert minutes to 30-min slots
    const endIndex = startIndex + requiredSlots - 1;
    
    if (endIndex >= timeSlots.length) return false;
    
    for (let i = startIndex; i <= endIndex; i++) {
      const slot = availability[courtId]?.[timeSlots[i]];
      if (!slot?.checked || !slot?.available) {
        return false;
      }
    }
    return true;
  }, [availability, timeSlots]);

  const fetchCourtsData = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const courtsData = await fetchCourts(authWrapper, {
        area: areaFilter || undefined,
        pageSize: 10,
        page,
      });
      
      if (append) {
        setCourts(prev => [...prev, ...courtsData]);
        setDisplayedCourts(prev => [...prev, ...courtsData]);
      } else {
        setCourts(courtsData);
        setDisplayedCourts(courtsData.slice(0, 10));
      }
      
      setHasMoreCourts(courtsData.length === 10);
    } catch (error: any) {
      console.error('Failed to fetch courts:', error);
      notify.error('Failed to load courts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [areaFilter]);

  useEffect(() => {
    fetchCourtsData();
  }, [fetchCourtsData]);

  // Load more courts when scrolling
  const loadMoreCourts = useCallback(() => {
    if (!loadingMore && hasMoreCourts) {
      const currentPage = Math.floor(courts.length / 10) + 1;
      fetchCourtsData(currentPage, true);
    }
  }, [loadingMore, hasMoreCourts, courts.length, fetchCourtsData]);

  const checkCourtAvailability = useCallback(async (courtId: string, timeSlot: string) => {
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
      const startAtISO = combineDayAndTime(dayISO, timeSlot);
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

  const handleCourtCardClick = (courtId: string) => {
    if (expandedCourtId === courtId) {
      // Collapse if already expanded
      setExpandedCourtId(null);
    } else {
      // Expand this court and collapse others
      setExpandedCourtId(courtId);
    }
  };

  const handleTimeSlotClick = (courtId: string, timeSlot: string) => {
    const isAvailable = availability[courtId]?.[timeSlot]?.available;
    const isLoading = availability[courtId]?.[timeSlot]?.loading;
    
    if (isLoading) return;
    
    // Check if this slot is already selected
    if (selectedSlot?.courtId === courtId && selectedSlot?.startTime === timeSlot) {
      // Unselect the slot
      setSelectedSlot(null);
      onCourtChange(null);
      onTimeChange('');
      return;
    }
    
    if (!availability[courtId]?.[timeSlot]?.checked) {
      checkCourtAvailability(courtId, timeSlot);
      return;
    }
    
    if (isAvailable) {
      // For multi-hour sessions, check consecutive availability
      if (durationMinutes > 60) {
        const isConsecutiveAvailable = checkConsecutiveAvailability(courtId, timeSlot, durationMinutes);
        if (!isConsecutiveAvailable) {
          notify.error(`This time slot doesn't have ${durationMinutes / 60} consecutive hours available.`);
          return;
        }
      }
      
      const selectedCourt = courts.find(c => c.id === courtId);
      if (selectedCourt) {
        setSelectedSlot({ courtId, startTime: timeSlot, duration: durationMinutes });
        onCourtChange(selectedCourt);
        onTimeChange(timeSlot);
        notify.success(`Selected ${selectedCourt.name} at ${timeSlot}`);
      }
    } else {
      notify.error('This time slot is already booked.');
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
    return selectedSlot?.courtId === courtId && selectedSlot?.startTime === timeSlot;
  };

  // Get the end time for multi-hour sessions
  const getEndTime = (startTime: string, duration: number) => {
    const startIndex = timeSlots.indexOf(startTime);
    if (startIndex === -1) return startTime;
    
    const requiredSlots = duration / 30;
    const endIndex = startIndex + requiredSlots - 1;
    
    if (endIndex >= timeSlots.length) return startTime;
    
    return timeSlots[endIndex];
  };

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

        {/* Courts Skeleton */}
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
          <Icon name="Building" size={24} color="white" />
        </View>
        <SafeText fontSize="$7" fontWeight="800" color="$textHigh" marginBottom="$2" textAlign="center" letterSpacing={-0.5}>
          Pick Court & Time
        </SafeText>
        <SafeText color="$textMuted" fontSize="$4" textAlign="center" lineHeight="$5" maxWidth={400}>
          Choose your preferred court and time slot for the perfect game experience
        </SafeText>
      </YStack>

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
              Filter & Preferences
            </Text>
            <Text color="$textMuted" fontSize="$3">
              Customize your search to find the perfect court
            </Text>
          </YStack>
          
          <XStack gap="$5" $md={{ flexDirection: 'column', gap: '$4' }}>
            {/* Area Filter */}
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
                  <Icon name="MapPin" size={12} color="white" />
                </View>
                <Text fontSize="$4" fontWeight="700" color="$textHigh">Filter by Area</Text>
              </XStack>
              <TextField
                fullWidth
                value={areaFilter}
                onChangeText={setAreaFilter}
                placeholder="e.g., Maadi, Zamalek, New Cairo"
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

            {/* Duration Selector */}
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
                  <Icon name="Clock" size={12} color="white" />
                </View>
                <Text fontSize="$4" fontWeight="700" color="$textHigh">Session Duration</Text>
              </XStack>
              <XStack gap="$3" flexWrap="wrap">
                {durationOptions.map(option => (
                  <BrandButton
                    key={option.value}
                    flex={1}
                    minWidth={120}
                    variant={durationMinutes === option.value ? 'primary' : 'outline'}
                    onPress={() => {
                      onDurationChange(option.value);
                      // Clear selection when duration changes
                      setSelectedSlot(null);
                      onCourtChange(null);
                      onTimeChange('');
                    }}
                    backgroundColor={durationMinutes === option.value ? '$primary' : '$surface'}
                    borderColor={durationMinutes === option.value ? '$primary' : '$color6'}
                    borderWidth={2}
                    shadowColor={durationMinutes === option.value ? '$primary' : undefined}
                    shadowOffset={durationMinutes === option.value ? { width: 0, height: 2 } : undefined}
                    shadowOpacity={durationMinutes === option.value ? 0.2 : undefined}
                    shadowRadius={durationMinutes === option.value ? 4 : undefined}
                  >
                    {option.label}
                  </BrandButton>
                ))}
              </XStack>
            </YStack>
          </XStack>
        </YStack>
      </BrandCard>

      {/* Courts List */}
      <YStack gap="$4">
        {displayedCourts.length === 0 ? (
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
              <Icon name="Building2" size={32} color="$color8" />
            </View>
            <SafeText color="$textHigh" fontSize="$5" fontWeight="700" marginBottom="$2" textAlign="center">
              No Courts Found
            </SafeText>
            <SafeText color="$textMuted" fontSize="$4" textAlign="center" marginBottom="$3" maxWidth={400}>
              We couldn't find any courts in this area. Try adjusting your search criteria or location.
            </SafeText>
            <BrandButton
              variant="outline"
              onPress={() => setAreaFilter('')}
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
              if (isCloseToBottom && hasMoreCourts && !loadingMore) {
                loadMoreCourts();
              }
            }}
            scrollEventThrottle={400}
            showsVerticalScrollIndicator={false}
          >
            <YStack gap="$4" paddingBottom="$6">
              {displayedCourts.map(courtItem => {
                const isExpanded = expandedCourtId === courtItem.id;
                const isSelected = selectedSlot?.courtId === courtItem.id;
                
                return (
                  <BrandCard 
                    key={courtItem.id} 
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
                    {/* Court Basic Info - Always Visible */}
                    <Button
                      onPress={() => handleCourtCardClick(courtItem.id)}
                      backgroundColor="transparent"
                      padding={0}
                      margin={0}
                      width="100%"
                      justifyContent="flex-start"
                      accessibilityLabel={`${courtItem.name} court, ${courtItem.priceHourlyLE} EGP per hour, ${isExpanded ? 'expanded' : 'collapsed'}`}
                      accessibilityRole="button"
                      accessibilityHint={isExpanded ? 'Tap to collapse time slots' : 'Tap to expand time slots'}
                    >
                      <YStack width="100%" gap="$3">
                        {/* Header Row with Court Name, Price, and Expand Button */}
                        <XStack 
                          alignItems="center" 
                          justifyContent="space-between" 
                          width="100%"
                          $sm={{ flexDirection: 'column', alignItems: 'flex-start', gap: '$2' }}
                        >
                          <XStack alignItems="center" gap="$2" flex={1}>
                            <Text 
                              fontSize="$6" 
                              fontWeight="800" 
                              color={isSelected ? 'white' : '$textHigh'}
                              letterSpacing={-0.5}
                            >
                              {courtItem.name}
                            </Text>
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
                                {courtItem.priceHourlyLE}
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
                            
                            {/* Expand Button */}
                            <View
                              width={32}
                              height={32}
                              backgroundColor={isSelected ? 'white' : '$color4'}
                              borderRadius="$3"
                              alignItems="center"
                              justifyContent="center"
                              shadowColor={isSelected ? '$primary' : '$color8'}
                              shadowOffset={{ width: 0, height: 1 }}
                              shadowOpacity={0.1}
                              shadowRadius={2}
                            >
                              {isExpanded ? (
                                <Icon name="ChevronUp" size={14} color={isSelected ? '$primary' : '$textMuted'} />
                              ) : (
                                <Icon name="ChevronDown" size={14} color={isSelected ? '$primary' : '$textMuted'} />
                              )}
                            </View>
                          </XStack>
                        </XStack>

                        {/* Location Information */}
                        <YStack gap="$1">
                          {courtItem.area && (
                            <XStack alignItems="center" gap="$2">
                              <View
                                width={16}
                                height={16}
                                backgroundColor={isSelected ? 'white' : '$color4'}
                                borderRadius="$2"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Icon name="MapPin" size={10} color={isSelected ? '$primary' : '$textMuted'} />
                              </View>
                              <Text 
                                fontSize="$4" 
                                color={isSelected ? 'white' : '$textMuted'}
                                fontWeight="500"
                              >
                                {courtItem.area}
                              </Text>
                            </XStack>
                          )}
                          {courtItem.address && (
                            <XStack alignItems="center" gap="$2">
                              <View
                                width={16}
                                height={16}
                                backgroundColor={isSelected ? 'white' : '$color4'}
                                borderRadius="$2"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Icon name="MapPin" size={10} color={isSelected ? '$primary' : '$textMuted'} />
                              </View>
                              <Text 
                                fontSize="$3" 
                                color={isSelected ? 'rgba(255,255,255,0.8)' : '$color8'}
                                fontWeight="400"
                              >
                                {courtItem.address}
                              </Text>
                            </XStack>
                          )}
                        </YStack>
                      </YStack>
                    </Button>

                    {/* Facilities - Always Visible */}
                    {courtItem.facilities && courtItem.facilities.length > 0 && (
                      <YStack marginTop="$3">
                        <Text 
                          fontSize="$4" 
                          fontWeight="700" 
                          color={isSelected ? 'white' : '$textMuted'} 
                          marginBottom="$3"
                          marginTop="$6"
                        >
                          Facilities
                        </Text>
                        <XStack flexWrap="wrap" gap="$2">
                          {courtItem.facilities.map((facility: string) => (
                            <View
                              key={facility}
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
                                {facility}
                              </Text>
                            </View>
                          ))}
                        </XStack>
                      </YStack>
                    )}

                    {/* Time Slots - Only Visible When Expanded */}
                    {isExpanded && (
                      <YStack 
                        borderTopWidth={1} 
                        borderTopColor={isSelected ? 'rgba(255,255,255,0.2)' : '$color4'} 
                        paddingTop="$4" 
                        marginTop="$4"
                        backgroundColor={isSelected ? 'rgba(255,255,255,0.05)' : '$color2'}
                        borderRadius="$3"
                        padding="$4"
                      >
                        <XStack 
                          alignItems="center" 
                          justifyContent="space-between" 
                          marginBottom="$4"
                          $sm={{ flexDirection: 'column', alignItems: 'flex-start', gap: '$3' }}
                        >
                          <Text 
                            fontSize="$5" 
                            fontWeight="700" 
                            color={isSelected ? 'white' : '$textHigh'}
                          >
                            Select Time Slot
                          </Text>
                          <XStack 
                            alignItems="center" 
                            gap="$4" 
                            flexWrap="wrap"
                            $sm={{ justifyContent: 'flex-start' }}
                          >
                            <XStack alignItems="center" gap="$2">
                              <View 
                                width={16} 
                                height={16} 
                                backgroundColor="$secondary" 
                                borderRadius="$2"
                                shadowColor="$secondary"
                                shadowOffset={{ width: 0, height: 1 }}
                                shadowOpacity={0.3}
                                shadowRadius={2}
                              />
                              <Text 
                                fontSize="$3" 
                                color={isSelected ? 'rgba(255,255,255,0.8)' : '$textMuted'}
                                fontWeight="600"
                              >
                                Available
                              </Text>
                            </XStack>
                            <XStack alignItems="center" gap="$2">
                              <View 
                                width={16} 
                                height={16} 
                                backgroundColor="$red9" 
                                borderRadius="$2"
                                shadowColor="$red9"
                                shadowOffset={{ width: 0, height: 1 }}
                                shadowOpacity={0.3}
                                shadowRadius={2}
                              />
                              <Text 
                                fontSize="$3" 
                                color={isSelected ? 'rgba(255,255,255,0.8)' : '$textMuted'}
                                fontWeight="600"
                              >
                                Booked
                              </Text>
                            </XStack>
                            <XStack alignItems="center" gap="$2">
                              <View 
                                width={16} 
                                height={16} 
                                backgroundColor="white" 
                                borderRadius="$2"
                                shadowColor="$primary"
                                shadowOffset={{ width: 0, height: 1 }}
                                shadowOpacity={0.3}
                                shadowRadius={2}
                              />
                              <Text 
                                fontSize="$3" 
                                color={isSelected ? 'white' : '$textMuted'}
                                fontWeight="600"
                              >
                                Selected
                              </Text>
                            </XStack>
                          </XStack>
                        </XStack>
                        <XStack 
                          flexWrap="wrap" 
                          gap="$2" 
                          $md={{ justifyContent: 'space-between' }}
                          $sm={{ justifyContent: 'center' }}
                        >
                          {timeSlots.map(timeSlot => {
                            const status = getTimeSlotStatus(courtItem.id, timeSlot);
                            const isTimeSelected = isTimeSlotSelected(courtItem.id, timeSlot);
                            
                            const getButtonProps = () => {
                              if (isTimeSelected) {
                                return { 
                                  backgroundColor: 'white', 
                                  color: '$primary', 
                                  borderColor: 'white',
                                  borderWidth: 2,
                                  fontWeight: '800',
                                  shadowColor: '$primary',
                                  shadowOffset: { width: 0, height: 3 },
                                  shadowOpacity: 0.4,
                                  shadowRadius: 6,
                                  elevation: 4,
                                  transform: [{ scale: 1.05 }]
                                };
                              }
                              if (status === 'available') {
                                return { 
                                  backgroundColor: '$secondary', 
                                  color: 'white', 
                                  borderColor: '$secondary',
                                  borderWidth: 2,
                                  fontWeight: '700',
                                  shadowColor: '$secondary',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.3,
                                  shadowRadius: 4
                                };
                              }
                              if (status === 'busy') {
                                return { 
                                  backgroundColor: '$red9', 
                                  color: 'white', 
                                  borderColor: '$red9', 
                                  opacity: 0.7,
                                  borderWidth: 2,
                                  fontWeight: '600'
                                };
                              }
                              if (status === 'loading') {
                                return { 
                                  backgroundColor: '$color4', 
                                  color: '$color8', 
                                  borderColor: '$color6',
                                  borderWidth: 2,
                                  fontWeight: '500'
                                };
                              }
                              return { 
                                backgroundColor: '$color3', 
                                color: '$textMuted', 
                                borderColor: '$color6',
                                borderWidth: 2,
                                fontWeight: '500'
                              };
                            };
                            
                            return (
                              <Button
                                key={timeSlot}
                                onPress={() => handleTimeSlotClick(courtItem.id, timeSlot)}
                                disabled={status === 'loading'}
                                paddingHorizontal="$3"
                                paddingVertical="$2"
                                borderRadius="$3"
                                fontSize="$4"
                                minWidth={60}
                                height={40}
                                animation="quick"
                                accessibilityLabel={`${timeSlot} time slot, ${status === 'available' ? 'available' : status === 'busy' ? 'booked' : status === 'loading' ? 'checking availability' : 'not checked'}`}
                                accessibilityRole="button"
                                accessibilityHint={status === 'available' ? 'Tap to select this time slot' : status === 'busy' ? 'This time slot is already booked' : 'Tap to check availability'}
                                hoverStyle={{ 
                                  opacity: 0.9,
                                  scale: 1.02,
                                  shadowOffset: { width: 0, height: 4 },
                                  shadowOpacity: 0.4,
                                  shadowRadius: 8
                                }}
                                pressStyle={{ 
                                  scale: 0.95,
                                  opacity: 0.8
                                }}
                                {...getButtonProps()}
                              >
                                {status === 'loading' ? (
                                  <View 
                                    width={16} 
                                    height={16} 
                                    borderWidth={2} 
                                    borderColor="$color6" 
                                    borderTopColor="$color9" 
                                    borderRadius="$round"
                                  />
                                ) : (
                                  <Text 
                                    fontSize="$4" 
                                    fontWeight={getButtonProps().fontWeight}
                                    color={getButtonProps().color}
                                  >
                                    {timeSlot}
                                  </Text>
                                )}
                              </Button>
                            );
                          })}
                        </XStack>
                      </YStack>
                    )}
                  </BrandCard>
                );
              })}
              
              {/* Loading More Indicator */}
              {loadingMore && (
                <BrandCard backgroundColor="$color2" padding="$8" alignItems="center">
                  <View
                    width={40}
                    height={40}
                    borderWidth={3}
                    borderColor="$color6"
                    borderTopColor="$primary"
                    borderRadius="$round"
                    marginBottom="$4"
                  />
                  <Text color="$textMuted" fontSize="$5" fontWeight="600">Loading more courts...</Text>
                </BrandCard>
              )}
              
              {/* No More Courts */}
              {!hasMoreCourts && displayedCourts.length > 0 && (
                <YStack alignItems="center" paddingVertical="$6">
                  <View
                    width={48}
                    height={48}
                    backgroundColor="$color4"
                    borderRadius="$round"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="$3"
                  >
                    <Icon name="Check" size={24} color="$color8" />
                  </View>
                  <Text color="$textMuted" fontSize="$5" fontWeight="600">All courts loaded</Text>
                </YStack>
              )}
            </YStack>
          </ScrollView>
        )}
      </YStack>

      {selectedSlot && court && (
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
                Perfect! You're all set
              </Text>
              <Text fontSize="$6" fontWeight="700" color="white" marginBottom="$1">
                {court.name}
              </Text>
              <Text fontSize="$4" color="rgba(255,255,255,0.9)" marginBottom="$2" fontWeight="600">
                {selectedSlot.startTime} - {getEndTime(selectedSlot.startTime, selectedSlot.duration)}
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
                    {selectedSlot.duration / 60} hour{selectedSlot.duration / 60 > 1 ? 's' : ''} session
                  </Text>
                </XStack>
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
                    {Math.round(court.priceHourlyLE * selectedSlot.duration / 60)} EGP total
                  </Text>
                </XStack>
              </XStack>
            </YStack>
            <BrandButton
              variant="outline"
              size="md"
              onPress={() => {
                setSelectedSlot(null);
                onCourtChange(null);
                onTimeChange('');
              }}
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
