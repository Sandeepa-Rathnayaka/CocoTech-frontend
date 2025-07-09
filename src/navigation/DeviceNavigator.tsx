import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

import DeviceListScreen from '../components/screens/device/DeviceListScreen';
import DeviceDetailScreen from '../components/screens/device/DeviceDetailScreen';
import DeviceFormScreen from '../components/screens/device/DeviceFormScreen';
import { colors } from '../constants/colors';
import { DEVICE_ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

const DeviceNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerStatusBarHeight: 0,
        contentStyle: {
          backgroundColor: colors.white
        },
        headerShadowVisible: false,
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 40, bottom: 20, left: 20, right: 20 }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ) : null,
      })}
    >
      <Stack.Screen
        name={DEVICE_ROUTES.DEVICE_LIST}
        component={DeviceListScreen}
        options={({ route }) => ({
          title: t('water-scheduling.devices.deviceList'),
          headerShown: false
        })}
      />
      <Stack.Screen
        name={DEVICE_ROUTES.DEVICE_DETAILS}
        component={DeviceDetailScreen}
        options={({ route }) => ({
          title: t('water-scheduling.devices.deviceDetails'),
          headerShown: false
        })}
      />
      <Stack.Screen
        name={DEVICE_ROUTES.REGISTER_DEVICE}
        component={DeviceFormScreen}
        options={{
          title: t('water-scheduling.devices.registerDevice'),
          headerShown: false
        }}
      />
      <Stack.Screen
        name={DEVICE_ROUTES.EDIT_DEVICE}
        component={DeviceFormScreen}
        options={{
          title: t('water-scheduling.devices.editDevice'),
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

export default DeviceNavigator;