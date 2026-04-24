import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.curryandburger.app',
  appName: 'Curry&Burger',
  webDir: 'out',
  server: {
    url: 'https://curryandburger.vercel.app',
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      '*.vercel.app',
      'curryandburger.vercel.app',
      '*.firebaseapp.com',
      '*.googleapis.com',
      '*.firebase.io',
      'firestore.googleapis.com',
      'accounts.google.com',
      'appleid.apple.com',
      '*.google.com',
      '*.apple.com',
    ],
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
    backgroundColor: '#FFF9F3',
  },
};

export default config;


