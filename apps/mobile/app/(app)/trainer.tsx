import { RoleGate } from '../../src/navigation/guards';
import { YStack, Text } from 'tamagui';

export default function TrainerScreen() {
  return (
    <RoleGate roles={['TRAINER']}>
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text fontSize="$6">Trainer Area</Text>
      </YStack>
    </RoleGate>
  );
}
