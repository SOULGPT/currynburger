import { Stack } from 'expo-router';

export default function WaiterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Table Grid',
        }}
      />
      <Stack.Screen
        name="order-browser"
        options={{
          title: 'Order Browser',
        }}
      />
      <Stack.Screen
        name="order-confirmation"
        options={{
          title: 'Order Confirmation',
        }}
      />
    </Stack>
  );
}
