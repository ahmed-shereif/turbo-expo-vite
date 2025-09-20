import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { YStack, Input, Button, Text, XStack } from 'tamagui';
import { SignupSchema } from '../../src/forms/schemas';
import { useAuth } from '../../src/providers/AuthProvider';
import { AuthClientError } from '../../src/lib/authClient';

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
        } else {
          setServerError(error.message);
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <YStack space padding="$4">
      <Text fontSize="$6">Sign Up</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Name"
            onBlur={onBlur}
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
          <Input
            placeholder="Phone (+201234567890)"
            onBlur={onBlur}
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
          <Input
            placeholder="Email"
            onBlur={onBlur}
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
          <Input
            placeholder="Password"
            onBlur={onBlur}
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
          <Input
            placeholder="Birthday (YYYY-MM-DD)"
            onBlur={onBlur}
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
              <Button
                theme={value === 'PLAYER' ? 'active' : undefined}
                onPress={() => onChange('PLAYER')}
              >
                Player
              </Button>
              <Button
                theme={value === 'COURT_OWNER' ? 'active' : undefined}
                onPress={() => onChange('COURT_OWNER')}
              >
                Court Owner
              </Button>
              <Button
                theme={value === 'TRAINER' ? 'active' : undefined}
                onPress={() => onChange('TRAINER')}
              >
                Trainer
              </Button>
            </>
          )}
        />
      </XStack>
      {errors.role && <Text color="red">{(errors as any).role?.message}</Text>}

      <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? 'Signing up...' : 'Sign Up'}
      </Button>
      {serverError && <Text color="red">{serverError}</Text>}
      <Button onPress={() => router.back()}>
        Already have an account? Log in
      </Button>
    </YStack>
  );
}
