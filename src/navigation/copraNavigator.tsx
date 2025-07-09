import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CreateReadingScreen } from '../components/screens/copra/CreateReadingScreen';
import { BatchHistoryScreen } from '../components/screens/copra/BatchHistoryScreen';
import { AllBatchesScreen } from '../components/screens/copra/AllBatchesScreen';
import { UpdateReadingScreen } from '../components/screens/copra/UpdateReadingScreen';
import { MoistureGraphScreen } from '../components/screens/copra/MoistureGraphScreen';
import { DryingRecommendationsScreen } from '../components/screens/copra/DryingRecommendationsScreen';

const Stack = createNativeStackNavigator();

export const CopraNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator
      initialRouteName="CreateReading"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF', // White background
        },
        headerTintColor: '#000000', // Black text & icons
        headerTitleStyle: {
          fontWeight: '600',
          color: '#000000', // Ensure text is black
        },
      }}
    > 
      <Stack.Screen
        name="CreateReading"
        component={CreateReadingScreen}
        options={{
          title: t('copra.createReading'),
        }}
      />
      <Stack.Screen
        name="BatchHistory"
        component={BatchHistoryScreen}
        options={{
          title: t('copra.batchHistory'),
        }}
      />
      <Stack.Screen
        name="AllBatches"
        component={AllBatchesScreen}
        options={{
          title: t('copra.allBatches'),
        }}
      />
      <Stack.Screen
        name="UpdateReading"
        component={UpdateReadingScreen}
        options={{
          title: t('copra.updateReading'),
        }}
      />
      <Stack.Screen
        name="MoistureGraph"
        component={MoistureGraphScreen}
        options={{
          title: t('copra.moistureGraph'),
        }}
      />
      <Stack.Screen
        name="DryingRecommendations"
        component={DryingRecommendationsScreen}
        options={{
          title: t('copra.dryingRecommendations'),
        }}
      />
    </Stack.Navigator>
  );
};

export default CopraNavigator;