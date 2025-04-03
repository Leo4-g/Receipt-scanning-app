import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  async function handleSignup() {
    // Enhanced validation
    if (!email || !password || !confirmPassword) {
      return Alert.alert('Error', 'Please fill in all fields');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert('Error', 'Please enter a valid email address');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }

    if (password.length < 8) {
      return Alert.alert('Error', 'Password must be at least 8 characters long');
    }

    try {
      setLoading(true);
      await signup(email, password);
      
      // Success alert with platform-specific handling
      const alertTitle = Platform.OS === 'web' 
        ? 'Account Created' 
        : 'Success';
      
      Alert.alert(
        alertTitle, 
        'Account created successfully! You can now log in.',
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('Login') 
        }]
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // More specific error handling
      const errorMessage = error.message || 'Failed to create an account';
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Rest of the component remains the same...
}
