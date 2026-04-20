import { SplashScreen, Stack, Redirect } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

import './globals.css';
import * as Sentry from '@sentry/react-native';
import useAuthStore from '@/store/auth.store';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: sentryDsn || undefined,
  sendDefaultPii: true,
  replaysSessionSampleRate: 1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

export default Sentry.wrap(function RootLayout() {
  const { isLoading, fetchAuthenticatedUser, isAuthenticated } = useAuthStore();
  const { user } = useRoleBasedAccess();

  const [fontsLoaded, error] = useFonts({
    'QuickSand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'QuickSand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    'QuickSand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
    'QuickSand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
    'QuickSand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  if (!fontsLoaded || isLoading) return null;

  // Role-based routing: redirect to appropriate interface
  if (isAuthenticated && user) {
    switch (user.role) {
      case 'admin':
        return <Stack screenOptions={{ headerShown: false }} />;
      case 'kitchen':
        return <Stack screenOptions={{ headerShown: false }} />;
      case 'waiter':
        return <Stack screenOptions={{ headerShown: false }} />;
      case 'desk':
        return <Stack screenOptions={{ headerShown: false }} />;
      case 'customer':
      default:
        return <Stack screenOptions={{ headerShown: false }} />;
    }
  }

  return <Stack screenOptions={{ headerShown: false }} />;
});

Sentry.showFeedbackWidget();
