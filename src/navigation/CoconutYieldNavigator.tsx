import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { colors } from '../constants/colors';
import CoconutYieldScreen from '../components/screens/CoconutYield/CoconutYieldScreen';
import PredictionScreen from '../components/screens/CoconutYield/PredictionScreen';
import PredictionHistoryScreen from '../components/screens/CoconutYield/PredictionHistoryScreen';
import CoconutPricePredictScreen from '../components/screens/CoconutPrice/CoconutPricePredictScreen';

// Add proper typing to the navigator
type CoconutYieldStackParamList = {
  CoconutYieldMain: undefined;
  Prediction: { locationId: string; locationName?: string };
  PredictionHistory: { locationId?: string } | undefined;
  CoconutPricePredict: undefined;
};

const Stack = createNativeStackNavigator<CoconutYieldStackParamList>();

const CoconutYieldNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: 'bold' },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="CoconutYieldMain"
        component={CoconutYieldScreen}
        options={{ 
          title: t('lands.title'),
        }}
      />
      <Stack.Screen
        name="Prediction"
        component={PredictionScreen}
        options={{ title: t('prediction.title') }}
      />
      <Stack.Screen
        name="PredictionHistory"
        component={PredictionHistoryScreen}
        options={{ title: t('prediction.historyTitle') }}
      />
      <Stack.Screen
        name="CoconutPricePredict"
        component={CoconutPricePredictScreen}
        options={{ title: t('price.screenTitle') }}
      />
    </Stack.Navigator>
  );
};

export default CoconutYieldNavigator;