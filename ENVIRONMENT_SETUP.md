# Environment Variables Setup Guide

## 🚀 Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials** (see sections below)

3. **Test the configuration:**
   ```bash
   npx expo start
   ```

## 📋 Required Variables

### Minimum Required (for basic functionality):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

### Recommended for Production:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_APPLE_CLIENT_ID=com.curryandburger.app
```

## 🔑 Getting API Keys

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings → API
4. Copy the following values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-public-key
```

**Note:** Use the "anon public" key, not the service role key.

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - For Expo: `exp://your-app-slug`
7. Copy the Client ID:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. Apple Sign-In Setup

1. Go to [Apple Developer](https://developer.apple.com/account)
2. Create an App ID with Sign In with Apple capability
3. Create a Services ID for web authentication
4. Configure the Services ID with your domain
5. Get the Services ID:

```env
EXPO_PUBLIC_APPLE_CLIENT_ID=com.curryandburger.app
```

### 4. Sentry Error Tracking (Optional)

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new React Native project
3. Get the DSN from the project settings:

```env
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### 5. Appwrite Setup (Legacy)

1. Go to [appwrite.io](https://appwrite.io) and create an account
2. Create a new project
3. Go to Settings → General
4. Copy the Project ID and API Endpoint:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
```

## 🔒 Security Best Practices

### Never Commit Secrets
- The `.env` file is in `.gitignore`
- Only commit `.env.example`
- Use different keys for development/production

### Environment Separation
```bash
# Development
cp .env.example .env.development

# Production
cp .env.example .env.production
```

### EAS Build Secrets
For production builds, use EAS secrets:

```bash
# Set production secrets
npx eas secret:create --name SUPABASE_URL --value "https://prod-project.supabase.co"
npx eas secret:create --name SUPABASE_KEY --value "prod-anon-key"
```

## 🧪 Testing Configuration

### Test Supabase Connection:
```bash
npx expo start
# Check console for connection errors
```

### Test Authentication:
1. Try signing up with email
2. Try Google OAuth
3. Try Apple Sign-In (on iOS)

### Test Error Reporting:
```javascript
// In your code, test Sentry
throw new Error("Test error for Sentry");
```

## 🚨 Common Issues

### "Supabase connection failed"
- Check if URL and key are correct
- Verify project is active
- Check network connectivity

### "Google OAuth not working"
- Verify client ID is correct
- Check authorized redirect URIs
- Ensure Google+ API is enabled

### "Apple Sign-In not working"
- Verify Services ID is configured
- Check app bundle ID matches
- Test on physical iOS device

### "Sentry not reporting errors"
- Check DSN format
- Verify project is active
- Check console for Sentry initialization errors

## 📱 Platform-Specific Setup

### iOS Additional Setup
```env
# For iOS builds
EXPO_PUBLIC_APPLE_CLIENT_ID=com.curryandburger.app
EXPO_PUBLIC_APPLE_REDIRECT_URI=https://your-domain.com/auth/callback
```

### Android Additional Setup
```env
# For Android builds
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-android-client-id
```

### Web Additional Setup
```env
# For web builds
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
```

## 🔄 Updating Environment Variables

When you add new environment variables:

1. Add them to `.env.example` with documentation
2. Update the `.env` file with actual values
3. Update the setup documentation
4. Test the new functionality
5. Update EAS secrets for production

## 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all required variables are set
3. Test with a fresh `.env` file
4. Check the Supabase/Appwrite dashboards
5. Review the setup documentation

## 🎯 Environment Variable Checklist

- [ ] `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `EXPO_PUBLIC_SUPABASE_KEY` - Supabase anon key
- [ ] `EXPO_PUBLIC_SENTRY_DSN` - Sentry DSN (optional)
- [ ] `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `EXPO_PUBLIC_APPLE_CLIENT_ID` - Apple Services ID
- [ ] `EXPO_PUBLIC_APPWRITE_ENDPOINT` - Appwrite endpoint (legacy)
- [ ] `EXPO_PUBLIC_APPWRITE_PROJECT_ID` - Appwrite project ID (legacy)

**✅ Ready to start developing!**