import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';

// Import screens
import WateringScheduleScreen from '../components/screens/watering/WateringScheduleScreen';
import ScheduleDetailScreen from '../components/screens/watering/ScheduleDetailScreen';
import CreateScheduleScreen from '../components/screens/watering/CreateScheduleScreen';
import ScheduleHistoryScreen from '../components/screens/watering/ScheduleHistoryScreen';

const Stack = createNativeStackNavigator();

const WateringNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="WateringSchedule"
        component={WateringScheduleScreen}
        options={({ navigation }) => ({
          title: t('water-scheduling.schedule.wateringSchedules'),
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTitleStyle: {
            color: colors.textPrimary,
            fontWeight: 'bold',
          },
          headerTintColor: colors.black,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ScheduleHistory')}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.black} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="ScheduleDetail"
        component={ScheduleDetailScreen}
        options={({ navigation }) => ({
          title: t('water-scheduling.schedule.scheduleDetails'),
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTitleStyle: {
            color: colors.textPrimary,
            fontWeight: 'bold',
          },
          headerTintColor: colors.black,
          headerShadowVisible: false,
        })}
      />
      <Stack.Screen
        name="CreateSchedule"
        component={CreateScheduleScreen}
        options={({ navigation }) => ({
          title: t('water-scheduling.schedule.createSchedule'),
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTitleStyle: {
            color: colors.textPrimary,
            fontWeight: 'bold',
          },
          headerTintColor: colors.black,
          headerShadowVisible: false,
        })}
      />
      <Stack.Screen
        name="ScheduleHistory"
        component={ScheduleHistoryScreen}
        options={({ navigation }) => ({
          title: t('water-scheduling.schedule.scheduleHistory'),
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTitleStyle: {
            color: colors.textPrimary,
            fontWeight: 'bold',
          },
          headerTintColor: colors.black,
          headerShadowVisible: false,
        })}
      />
    </Stack.Navigator>
  );
};

export default WateringNavigator;