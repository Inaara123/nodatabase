import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import { UserContext } from '../../UserContext';
import { useContext } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = () => {
  const { updateUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  // Function to handle the Sign In button press
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log('response:', response);
      const { user } = response;
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
      updateUser(userData);
      router.replace('/(tabs)/home/HomePage');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    router.navigate('/authentication/SignUp');
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Function to handle the Forgot Password link
  const handleForgotPassword = () => {
    router.navigate('/authentication/ForgotPassword'); // Assuming you have a ForgotPassword page
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inaara.ai</Text>
      <Text style={styles.subtitle}>Log in to your account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9E9E9E"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#9E9E9E"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9E9E9E" />
        </TouchableOpacity>
      </View>

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleSignup}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 36, // Larger title font size
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    fontFamily: 'Poppins-Bold', // Custom font for a modern look
  },
  subtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 40,
    fontFamily: 'Poppins-Medium', // Custom font
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
  passwordContainer: {
    width: '100%',
    height: 50,
    backgroundColor: '#1F1F28',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular', // Custom font
  },
  eyeIcon: {
    padding: 5,
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
  forgotPasswordContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular', // Custom font 
    fontSize: 20,
  },
  forgotPasswordText: {
    color: '#FF6F61', // Accent color for the link
    fontWeight: '400',
    fontSize: 20,
    fontFamily: 'Poppins-Medium', // Custom font
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpText: {
    color: '#9E9E9E',
    fontSize: 18,
    fontFamily: 'Poppins-Regular', // Custom font
  },
  signUpLink: {
    color: '#FF6F61', // Accent color for the link
    fontWeight: 'bold',
    fontSize: 22, // Increased font size for Sign Up
    fontFamily: 'Poppins-Bold', // Custom font
  },
});

export default LoginScreen;
