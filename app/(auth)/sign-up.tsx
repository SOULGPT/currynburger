import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useState } from 'react';
import { createUser, signInWithGoogle, signInWithApple } from '@/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password)
      return Alert.alert('Error', 'Please enter valid name, email, and password.');

    setIsSubmitting(true);

    try {
      await createUser({ email, password, name });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    setIsSubmitting(true);

    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithApple();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-6 bg-slate-950/95 rounded-3xl p-6 shadow-2xl mt-6 mx-4">
      <Text className="text-3xl font-extrabold text-white">Create your premium account.</Text>
      <Text className="text-base text-slate-300 leading-6">Join Curry & Burger and enjoy elevated ordering, exclusive deals and luxe restaurant-style visuals.</Text>

      <CustomInput
        placeholder="Your full name"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        label="Full Name"
      />
      <CustomInput
        placeholder="email@example.com"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Create a strong password"
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
        label="Password"
        secureTextEntry={true}
      />

      <CustomButton title="Sign Up" isLoading={isSubmitting} onPress={submit} />

      <View className="flex-row items-center justify-center gap-3">
        <View className="h-px flex-1 bg-slate-500" />
        <Text className="text-slate-400 uppercase text-[11px] tracking-[1px]">or sign up with</Text>
        <View className="h-px flex-1 bg-slate-500" />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => handleSocialSignUp('google')}
          className="flex-1 flex-row items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 py-3"
        >
          <FontAwesome name="google" size={18} color="white" />
          <Text className="text-sm font-semibold text-white ml-3">Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSocialSignUp('apple')}
          className="flex-1 flex-row items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 py-3"
        >
          <FontAwesome name="apple" size={18} color="white" />
          <Text className="text-sm font-semibold text-white ml-3">Apple</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center gap-2 mt-2">
        <Text className="text-slate-400">Already have an account?</Text>
        <Link href="/sign-in" className="font-semibold text-amber-400">Sign In</Link>
      </View>
    </View>
  );
};

export default SignUp;
