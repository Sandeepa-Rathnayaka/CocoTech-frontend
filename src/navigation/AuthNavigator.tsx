import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Make sure these imports are correct and the components exist
import { LoginScreen } from '../components/screens/auth/LoginScreen';
import { SignupScreen } from '../components/screens/auth/SignupScreen';
import { colors } from '../constants/colors';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          title: 'Create Account',
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;