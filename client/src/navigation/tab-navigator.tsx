import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import type { ComponentType } from 'react';
import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { MapNavigator } from '@/navigation/map-navigator';
import { ProfileNavigator } from '@/navigation/profile-navigator';
import { colors, Feed as FeedIcon } from '@/ui';

import { FeedNavigator } from './feed-navigator';

type TabParamList = {
  FeedNavigator: undefined;
  MapNavigator: undefined;
  ProfileNavigator: undefined;
};

type TabType = {
  name: keyof TabParamList;
  component: ComponentType<any>;
  label: string;
};

type TabIconsType = {
  [key in keyof TabParamList]: (props: SvgProps) => JSX.Element;
};

const Tab = createBottomTabNavigator<TabParamList>();

const tabsIcons: TabIconsType = {
  MapNavigator: ({ color }: SvgProps) => (
    <Ionicons name="map" size={24} color={color} />
  ),
  FeedNavigator: (props: SvgProps) => <FeedIcon {...props} />,
  ProfileNavigator: ({ color }: SvgProps) => (
    <Ionicons name="person-circle-outline" size={24} color={color} />
  ),
};

export type TabList<T extends keyof TabParamList> = {
  navigation: NativeStackNavigationProp<TabParamList, T>;
  route: RouteProp<TabParamList, T>;
};

const tabs: TabType[] = [
  {
    name: 'FeedNavigator',
    component: FeedNavigator,
    label: 'Feed',
  },
  {
    name: 'MapNavigator',
    component: MapNavigator,
    label: 'Maps',
  },
  {
    name: 'ProfileNavigator',
    component: ProfileNavigator,
    label: 'Profile',
  },
];

type BarIconType = {
  name: keyof TabParamList;
  color: string;
};

const BarIcon = ({ color, name, ...reset }: BarIconType) => {
  const Icon = tabsIcons[name];

  return <Icon color={color} {...reset} />;
};

export const TabNavigator = () => {
  const { colorScheme } = useColorScheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarInactiveTintColor:
          colorScheme === 'dark' ? colors.charcoal[400] : colors.neutral[400],
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color }) => <BarIcon name={route.name} color={color} />,
      })}
    >
      <Tab.Group
        screenOptions={{
          headerShown: false,
        }}
      >
        {tabs.map(({ name, component, label }) => {
          return (
            <Tab.Screen
              key={name}
              name={name}
              component={component}
              options={{
                title: label,
              }}
            />
          );
        })}
      </Tab.Group>
    </Tab.Navigator>
  );
};
