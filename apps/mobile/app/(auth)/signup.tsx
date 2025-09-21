import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { YStack, Text, XStack } from 'tamagui';
import { Screen, BrandCard, BrandButton, TextField } from '@repo/ui'
import { SignupSchema } from '../../src/forms/schemas';
import { useAuth } from '../../src/providers/AuthProvider';
import { AuthClientError } from '../../src/lib/authClient';
import { notify } from '../../src/lib/notify';

type SignupFormValues = z.infer<typeof SignupSchema>;

export default function Signup() {
  const { signup, login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    // @ts-expect-error Allow zod resolver version mismatch in mobile app
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);
    try {
      await signup(
        data.name,
        data.email,
        data.phone,
        data.password,
        data.role,
      );
      // Auto-login after successful signup
      await login(data.email, data.password);
      notify.success('Account created');
      // Navigate to role-specific page
      if (data.role === 'TRAINER') {
        router.replace('/(app)/trainer');
      } else if (data.role === 'COURT_OWNER') {
        router.replace('/(app)/court-owner');
      } else {
        router.replace('/(app)');
      }
    } catch (error) {
      if (error instanceof AuthClientError) {
        if (error.fieldErrors) {
          for (const [field, message] of Object.entries(error.fieldErrors)) {
            setError(field as keyof SignupFormValues, { message });
          }
          notify.error('Please fix the highlighted fields');
        } else {
          setServerError(error.message);
          notify.error(error.message);
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
        notify.error('Unexpected error. Please try again.');
      }
    }
  };

  return (
    <Screen>
      <BrandCard>
        <Text fontSize="$6">Sign Up</Text>
        <YStack space>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Name"
                onBlur={onBlur as any}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && <Text color="red">{errors.name.message}</Text>}

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Phone (+201234567890)"
                onBlur={onBlur as any}
                onChangeText={onChange}
                value={value}
                keyboardType="phone-pad"
              />
            )}
          />
          {errors.phone && <Text color="red">{errors.phone.message}</Text>}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Email"
                onBlur={onBlur as any}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && <Text color="red">{errors.email.message}</Text>}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Password"
                onBlur={onBlur as any}
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
          />
          {errors.password && <Text color="red">{errors.password.message}</Text>}

          <Controller
            control={control}
            name="birthday"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Birthday (YYYY-MM-DD)"
                onBlur={onBlur as any}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.birthday && <Text color="red">{errors.birthday.message}</Text>}

          <Text>You are a</Text>
          <XStack space>
            <Controller
              control={control}
              name="role"
              render={({ field: { value, onChange } }) => (
                <>
                  <BrandButton
                    icon="User"
                    variant={value === 'PLAYER' ? 'primary' : 'outline'}
                    onPress={() => onChange('PLAYER')}
                  >
                    Player
                  </BrandButton>
                  <BrandButton
                    icon="Building"
                    variant={value === 'COURT_OWNER' ? 'primary' : 'outline'}
                    onPress={() => onChange('COURT_OWNER')}
                  >
                    Court Owner
                  </BrandButton>
                  <BrandButton
                    icon="Dumbbell"
                    variant={value === 'TRAINER' ? 'primary' : 'outline'}
                    onPress={() => onChange('TRAINER')}
                  >
                    Trainer
                  </BrandButton>
                </>
              )}
            />
          </XStack>
          {errors.role && <Text color="red">{(errors as any).role?.message}</Text>}

          <BrandButton icon="UserPlus" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </BrandButton>
          {serverError && <Text color="red">{serverError}</Text>}
          <BrandButton variant="outline" icon="ArrowLeft" onPress={() => router.back()}>
            Already have an account? Log in
          </BrandButton>
        </YStack>
      </BrandCard>
    </Screen>
  );
}
