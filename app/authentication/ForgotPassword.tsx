import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleResetPassword = async () => {
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Success',
        'Reset link has been sent to your registered email ID. Please check your email and login again.'
      );
      router.push('/authentication/SignIn'); // Navigate back to Sign In page
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      Alert.alert('Error', errorMessage);
      console.error('Error sending password reset email:', errorCode, errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your registered email"
        placeholderTextColor="#9E9E9E"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E0F19', // Darker background for modern look
    padding: 20,
  },
  title: {
    fontSize: 30, // Larger title font size
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    fontFamily: 'Poppins-Bold', // Custom font for a modern look
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1F1F28', // Softer background for input fields
    borderRadius: 12, // More rounded corners
    padding: 15,
    marginBottom: 20,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular', // Custom font
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6C5CE7', // Accent color for the button
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium', // Custom font
  },
});

export default ForgotPasswordScreen;
