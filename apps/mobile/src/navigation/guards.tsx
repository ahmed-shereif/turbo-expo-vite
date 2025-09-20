import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { Role } from '@repo/auth-client';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  return <>{children}</>;
}

export function RoleGate({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { hasRole } = useAuth();

  if (!hasRole(...roles)) {
    return (
      <View>
        <Text>Not authorized</Text>
      </View>
    );
  }

  return <>{children}</>;
}
