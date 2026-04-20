import { Stack } from 'expo-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function KitchenLayout() {
  return (
    <ProtectedRoute requiredRoles={['kitchen', 'admin']}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Kitchen Display System',
          }}
        />
      </Stack>
    </ProtectedRoute>
  );
}
