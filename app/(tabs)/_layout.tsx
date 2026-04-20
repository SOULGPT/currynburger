import { Redirect, Tabs, router } from 'expo-router';
import useAuthStore from '@/store/auth.store';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { TabBarIconProps } from '@/type';
import { Image, Text, View, Alert } from 'react-native';
import { images } from '@/constants';
import cn from 'clsx';

const TabBarIcon = ({ focused, icon, title }: TabBarIconProps) => (
  <View className="tab-icon">
    <Image
      source={icon}
      className="size-7"
      resizeMode="contain"
      tintColor={focused ? '#FE8C00' : '#5D5F6D'}
    />
    <Text className={cn('text-sm font-bold', focused ? 'text-primary' : 'text-gray-200')}>
      {title}
    </Text>
  </View>
);

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const { isCustomer, canAccessWaiter, canAccessKitchen, canAccessFrontDesk, canAccessAdmin } = useRoleBasedAccess();

  if (!isAuthenticated) return <Redirect href="/sign-in" />;

  // Customer interface
  if (isCustomer()) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            marginHorizontal: 20,
            height: 80,
            position: 'absolute',
            bottom: 40,
            backgroundColor: 'white',
            shadowColor: '#1a1a1a',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="Home" icon={images.home} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="Search" icon={images.search} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="Cart" icon={images.bag} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="Profile" icon={images.person} focused={focused} />
            ),
          }}
        />
      </Tabs>
    );
  }

  // Waiter interface
  if (canAccessWaiter()) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            height: 80,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          },
        }}
      >
        <Tabs.Screen
          name="waiter-index"
          listeners={() => ({
            tabPress: () => router.replace('/(waiter)'),
          })}
          options={{
            title: 'Tables',
            href: null,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="Tables" icon={images.home} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Orders',
            href: null,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="Orders" icon={images.bag} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            href: null,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="Profile" icon={images.person} focused={focused} />
            ),
          }}
        />
      </Tabs>
    );
  }

  // Kitchen, Front Desk, Admin - hide tabs, show dedicated interfaces
  return <Redirect href="/" />;
}
