import { Stack } from 'expo-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function FrontDeskLayout() {
  return (
    <ProtectedRoute requiredRoles={['desk', 'admin']}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Front Desk',
          }}
        />
      </Stack>
    </ProtectedRoute>
  );
}