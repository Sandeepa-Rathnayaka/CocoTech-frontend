import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { colors } from '../../../constants/colors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { validateRegistrationForm } from '../../../utils/validation';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Add phone state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSignup = async () => {
    const validationResult = validateRegistrationForm(
      name,
      email,
      password,
      confirmPassword,
      phone // Add phone to validation
    );

    if (!validationResult.isValid) {
      Alert.alert('Validation Error', validationResult.errors[0].message);
      return;
    }

    try {
      setIsLoading(true);
      await register(name, email, password, phone); // Include phone number in registration
      // Navigation will happen automatically through the auth state change
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'An error occurred during registration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          autoCapitalize="words"
          leftIcon="person-outline"
          autoCorrect={false}
        />

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
          autoCorrect={false}
        />

        {/* Add Phone Number Input */}
        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          leftIcon="call-outline"
          autoCorrect={false}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          isPassword
          leftIcon="lock-closed-outline"
        />

        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          isPassword
          leftIcon="lock-closed-outline"
        />

        <Button
          title="Create Account"
          onPress={handleSignup}
          isLoading={isLoading}
          variant="primary"
          size="large"
          style={styles.button}
        />

        <Button
          title="Already have an account? Sign In"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
          size="large"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: -100,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  button: {
    marginTop: 16,
  },
});

export default SignupScreen;