import { View, KeyboardAvoidingView, Platform, ScrollView, Dimensions, ImageBackground, Image, Text } from 'react-native'
import { Redirect, Slot } from 'expo-router';
import { images } from '@/constants';
import useAuthStore from '@/store/auth.store';

export default function AuthLayout() {
    const { isAuthenticated } = useAuthStore();

    if(isAuthenticated) return <Redirect href="/" />

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-950">
            <ScrollView className="h-full" keyboardShouldPersistTaps="handled">
                <View className="w-full relative overflow-hidden" style={{ height: Dimensions.get('screen').height / 2.5 }}>
                    <ImageBackground source={images.loginGraphic} className="size-full" resizeMode="cover" imageStyle={{ opacity: 0.9 }}>
                        <View className="absolute inset-0 bg-slate-950/70" />
                        <View className="absolute inset-x-0 top-16 px-6">
                            <Text className="text-4xl font-extrabold text-white">Curry & Burger</Text>
                            <Text className="mt-3 text-base text-slate-200 leading-7 max-w-[85%]">
                                Discover premium flavors, fast checkout, and a luxury ordering experience built for modern diners.
                            </Text>
                        </View>
                    </ImageBackground>
                    <Image source={images.logo} className="absolute w-28 h-28 self-center left-1/2 -translate-x-1/2 bottom-[-48]" />
                </View>
                <View className="pt-24 pb-10 px-4">
                    <Slot />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
