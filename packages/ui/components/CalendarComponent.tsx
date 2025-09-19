import { useState } from 'react';
import DateTimePicker from 'react-native-ui-datepicker';
import { YStack, H1, Button } from 'tamagui';
import dayjs from 'dayjs';

export function CalendarComponent() {
  const [date, setDate] = useState(dayjs());

  return (
    <YStack space padding="$4" margin="$4" backgroundColor="$color2" borderRadius="$4" alignItems="center">
      <H1>Select a Date</H1>
        <DateTimePicker
          value={date}
          onValueChange={(newDate) => setDate(dayjs(newDate))}
        />
      <Button onPress={() => console.log('Selected Date:', date.format('YYYY-MM-DD'))}>
        Confirm Date
      </Button>
    </YStack>
  );
};
