import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import CartButton from '@/components/CartButton';
import { CATEGORIES, images, offers, sides } from '@/constants';
import cn from 'clsx';

export default function Index() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch = offer.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || offer.title.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const featuredOffer = filteredOffers[0] || offers[0];

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-5 pt-6 pb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-sm uppercase tracking-[2px] text-amber-300">Premium taste</Text>
            <Text className="text-3xl font-extrabold text-white mt-2">Luxury fast food, delivered beautifully.</Text>
          </View>
          <View className="bg-slate-800 p-3 rounded-3xl shadow-lg border border-slate-700">
            <Image source={images.avatar} className="w-14 h-14 rounded-full" />
          </View>
        </View>

        <Text className="mt-6 text-slate-300 text-base leading-6">
          Discover gourmet burgers, premium combos, and exclusive offers built to keep every order exciting.
        </Text>

        <View className="mt-6 rounded-[32px] bg-slate-900 border border-slate-700 p-4 shadow-xl">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for burgers, pizzas, or deals"
            placeholderTextColor="#94a3b8"
            className="text-white text-base px-4 py-4 rounded-[28px] bg-slate-950 border border-slate-800"
          />
        </View>
      </View>

      <View className="px-5">
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCategory(item.name)}
              className={cn(
                'mr-3 rounded-3xl px-5 py-3 border',
                selectedCategory === item.name
                  ? 'bg-amber-400 border-amber-400'
                  : 'bg-slate-900 border-slate-700'
              )}
            >
              <Text className={cn('text-sm font-semibold', selectedCategory === item.name ? 'text-slate-950' : 'text-slate-300')}>
                {item.name}
              </Text>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      <View className="mt-6 bg-slate-900 flex-1 rounded-t-[40px] border border-slate-800 px-5 pt-6">
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text className="text-xl font-semibold text-white">Featured Menu</Text>
            <Text className="text-slate-400 mt-1">Curated premium dishes just for you.</Text>
          </View>
          <CartButton />
        </View>

        <FlatList
          data={filteredOffers}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="mr-5 w-72 rounded-[34px] bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
              <View className="bg-amber-500 px-4 py-3">
                <Text className="text-xs uppercase tracking-[1px] font-semibold text-slate-950">Chef's Special</Text>
              </View>
              <Image source={item.image} className="h-48 w-full" resizeMode="cover" />
              <View className="p-5">
                <Text className="text-2xl font-bold text-white mb-2">{item.title}</Text>
                <Text className="text-slate-400">A luxurious flavor profile with premium ingredients and rich textures.</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />

        <Text className="text-xl font-semibold text-white mb-4">Best Sellers</Text>
        <FlatList
          data={sides}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View className="mr-4 w-48 rounded-[32px] bg-slate-950 border border-slate-800 shadow-lg overflow-hidden">
              <Image source={item.image} className="h-40 w-full" resizeMode="cover" />
              <View className="p-4">
                <Text className="text-lg font-semibold text-white">{item.name}</Text>
                <Text className="mt-2 text-slate-400">€{item.price.toFixed(2)}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.name}
        />
      </View>
    </SafeAreaView>
  );
}
