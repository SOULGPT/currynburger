import { Stack } from 'expo-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function CustomerDisplayLayout() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'desk']}>
      <Stack
        screenOptions={{
          headerShown: false,
          orientation: 'landscape',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Customer Display',
          }}
        />
      </Stack>
    </ProtectedRoute>
  );
}