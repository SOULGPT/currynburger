import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useState } from 'react';
import { signIn, signInWithGoogle, signInWithApple } from '@/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async () => {
    const { email, password } = form;

    if (!email || !password)
      return Alert.alert('Error', 'Please enter a valid email address and password.');

    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      Sentry.captureEvent(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    setIsSubmitting(true);

    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithApple();
    } catch (error: any) {
      Alert.alert('Error', error.message);
      Sentry.captureEvent(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-6 bg-slate-950/95 rounded-3xl p-6 shadow-2xl mt-6 mx-4">
      <Text className="text-3xl font-extrabold text-white">Welcome back.</Text>
      <Text className="text-base text-slate-300 leading-6">Sign in to unlock premium ordering, exclusive deals, and lightning-fast delivery.</Text>

      <CustomInput
        placeholder="you@domain.com"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Your secure password"
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
        label="Password"
        secureTextEntry={true}
      />

      <CustomButton title="Sign In" isLoading={isSubmitting} onPress={submit} />

      <View className="flex-row items-center justify-center gap-3">
        <View className="h-px flex-1 bg-slate-500" />
        <Text className="text-slate-400 uppercase text-[11px] tracking-[1px]">or continue with</Text>
        <View className="h-px flex-1 bg-slate-500" />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => handleSocialSignIn('google')}
          className="flex-1 flex-row items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 py-3"
        >
          <FontAwesome name="google" size={18} color="white" />
          <Text className="text-sm font-semibold text-white ml-3">Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSocialSignIn('apple')}
          className="flex-1 flex-row items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 py-3"
        >
          <FontAwesome name="apple" size={18} color="white" />
          <Text className="text-sm font-semibold text-white ml-3">Apple</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center gap-2 mt-2">
        <Text className="text-slate-400">New to Curry & Burger?</Text>
        <Link href="/sign-up" className="font-semibold text-amber-400">Create account</Link>
      </View>
    </View>
  );
};

export default SignIn;
