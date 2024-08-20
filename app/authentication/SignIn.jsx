import React, { useState, useContext } from 'react';
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
import { DataContext } from '../../DataContext';
import { HospitalContext } from '../../HospitalContext';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { supabase } from '../../supabaseClient';

const LoginScreen = () => {
  const { updateUser } = useContext(UserContext);
  const {data,updateData} = useContext(DataContext);
  const { updateHospitalData } = useContext(HospitalContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
 ///////// This will convert the data to the desired format //////////
 function convertDataToDesiredFormat(data) {
  const convertedData = {};
  data.forEach((item, index) => {
    const newKey = (index + 1).toString();
    convertedData[newKey] = {
      department: item.specialization, // Map specialization to department
      email: item.email,
      gender: item.gender,
      doctor_id: item.doctor_id,
      image: null, // Assuming image is not provided in the received data
      name: item.name,
      phoneNumber: "", // Assuming phoneNumber is not provided in the received data
    };
  });
  return convertedData;
}
/////////////////////////////////////////////////////
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
      const uid = userData.uid;
      updateUser(userData);
      // Check if UID exists in Supabase
      const { data: hospitalId, error: hospitalIdError } = await supabase
        .from('hospitals')
        .select('hospital_id')
        .eq('hospital_id', user.uid)
        .single();

      if (hospitalIdError) {
        if (hospitalIdError.code !== 'PGRST116') {
          throw new Error(hospitalIdError.message);
        } else {
          console.log('UID does not exist in Supabase. Navigating to CollectDetails');
          // router.replace('/(tabs)/home/CollectDetails');
          router.replace(
            {
              pathname: '/(tabs)/home/CollectDetails',
              params: { uid: user.uid,
              email: user.email,
              },
            }
          )
          return; // Exit the function after navigation
        }
      }

      // Additional logic if UID exists in Supabase
      console.log('UID exists in Supabase:', hospitalId);
      const { data: docData, error } = await supabase
      .from('doctors')
      .select('name, specialization, gender, email,doctor_id')
      .eq('hospital_id', uid);


    if (error) throw error;


    console.log('The data from supabase in Signin  is : ', docData);
    updateData(convertDataToDesiredFormat(docData));
    console.log('data from supabase stored to local client')

      // Check if Doctor details exist in Supabase
      // Assuming similar logic to check doctor details and handle navigation

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
