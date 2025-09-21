import React from 'react';
import { View, Text, styled } from '@tamagui/core';
import { Icon, BrandCard } from '@repo/ui';

interface Step1_DayProps {
  dayISO: string | null;
  onDayChange: (dayISO: string) => void;
}

// Styled components using Tamagui
const Container = styled(View, {
  padding: '$3',
  gap: '$4',
  maxWidth: 800,
  marginHorizontal: 'auto',
});

const Header = styled(View, {
  alignItems: 'center',
  gap: '$2',
});

const IconContainer = styled(View, {
  width: 48,
  height: 48,
  borderRadius: '$round',
  backgroundColor: '$primary',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '$primary',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
});

const Title = styled(Text, {
  fontSize: '$6',
  fontWeight: '700',
  color: '$textHigh',
  textAlign: 'center',
});

const Subtitle = styled(Text, {
  fontSize: '$4',
  color: '$textMuted',
  textAlign: 'center',
  lineHeight: '$5',
});

const InputContainer = styled(View, {
  maxWidth: 400,
  alignSelf: 'center',
  width: '100%',
});

const Label = styled(Text, {
  fontSize: '$3',
  fontWeight: '600',
  color: '$textHigh',
  marginBottom: '$2',
});

const DateInputContainer = styled(View, {
  width: '100%',
  position: 'relative',
});

const InfoText = styled(Text, {
  fontSize: '$2',
  color: '$textMuted',
  marginTop: '$1',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
});

const ConfirmationCard = styled(BrandCard, {
  maxWidth: 400,
  alignSelf: 'center',
  backgroundColor: '$secondary',
  borderColor: '$secondary',
  padding: '$4',
  alignItems: 'center',
  gap: '$2',
});

const CheckIconContainer = styled(View, {
  width: 36,
  height: 36,
  borderRadius: '$round',
  backgroundColor: '$primaryContrast',
  alignItems: 'center',
  justifyContent: 'center',
});

const ConfirmationTitle = styled(Text, {
  fontSize: '$4',
  fontWeight: '600',
  color: '$textHigh',
});

const ConfirmationDate = styled(Text, {
  fontSize: '$3',
  color: '$primaryContrast',
  fontWeight: '500',
});

const QuickOptionsContainer = styled(View, {
  maxWidth: 500,
  alignSelf: 'center',
  width: '100%',
});

const QuickOptionsLabel = styled(Text, {
  fontSize: '$3',
  fontWeight: '500',
  color: '$textHigh',
  marginBottom: '$3',
  textAlign: 'center',
});

const QuickOptionsGrid = styled(View, {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '$2',
  justifyContent: 'center',
});


export function Step1_Day({ dayISO, onDayChange }: Step1_DayProps) {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDayChange(event.target.value);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <Container>
      {/* Header */}
      <Header>
        <IconContainer>
          <Icon name="Calendar" size={20} color="$primaryContrast" />
        </IconContainer>
        <Title>Choose Your Day</Title>
        <Subtitle>When would you like to play? Select your preferred date.</Subtitle>
      </Header>

      {/* Date Input */}
      <InputContainer>
        <Label htmlFor="session-date">Session Date</Label>
        <DateInputContainer>
          <input
            id="session-date"
            type="date"
            value={dayISO || ''}
            onChange={handleDateChange}
            min={today}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #F3F4F6',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              color: '#111827',
              transition: 'all 200ms ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
            onFocus={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.outline = 'none';
              target.style.borderColor = '#1E90FF';
              target.style.boxShadow = '0 0 0 4px rgba(30, 144, 255, 0.2)';
            }}
            onBlur={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.borderColor = '#F3F4F6';
              target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.backgroundColor = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.backgroundColor = '#FFFFFF';
            }}
          />
        </DateInputContainer>
        <InfoText>
          <Icon name="Info" size={14} color="$textMuted" />
          You can book sessions from today onwards
        </InfoText>
      </InputContainer>

      {/* Selected Date Confirmation */}
      {dayISO && (
        <ConfirmationCard>
          <CheckIconContainer>
            <Icon name="Check" size={16} color="$primary" />
          </CheckIconContainer>
          <ConfirmationTitle>Perfect Choice!</ConfirmationTitle>
          <ConfirmationDate>
            {new Date(dayISO).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </ConfirmationDate>
        </ConfirmationCard>
      )}

      {/* Quick Date Options */}
      <QuickOptionsContainer>
        <QuickOptionsLabel>Or choose a quick option:</QuickOptionsLabel>
        <QuickOptionsGrid>
          {Array.from({ length: 4 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateISO = date.toISOString().split('T')[0];
            const isSelected = dayISO === dateISO;
            
            return (
              <div
                key={i}
                onClick={() => onDayChange(dateISO)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  minWidth: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 200ms ease',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#1E90FF' : '#FFFFFF',
                  borderColor: isSelected ? '#1E90FF' : '#F3F4F6',
                  boxShadow: isSelected ? '0 4px 8px rgba(30, 144, 255, 0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#1E90FF';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#F3F4F6';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
                  }
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    opacity: 0.75,
                    color: isSelected ? '#FFFFFF' : '#6B7280',
                  }}
                >
                  {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: isSelected ? '#FFFFFF' : '#111827',
                  }}
                >
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </QuickOptionsGrid>
      </QuickOptionsContainer>
    </Container>
  );
}
