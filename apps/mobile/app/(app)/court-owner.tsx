import { RoleGate } from '../../src/navigation/guards';
import { YStack, Text } from 'tamagui';

export default function CourtOwnerScreen() {
  return (
    <RoleGate roles={['COURT_OWNER']}>
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text fontSize="$6">Court Owner Area</Text>
      </YStack>
    </RoleGate>
  );
}


