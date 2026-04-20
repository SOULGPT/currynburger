import { Stack } from 'expo-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminLayout() {
  return (
    <ProtectedRoute requiredRoles="admin">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Admin Dashboard',
          }}
        />
      </Stack>
    </ProtectedRoute>
  );
}