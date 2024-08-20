import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../supabaseClient';
import { HospitalContext } from '../../../HospitalContext'; 
import { useContext } from 'react';
import {router} from 'expo-router';

const CollectDetails = () => {
  const { uid, email } = useLocalSearchParams();
  const { hospitalData, updateHospitalData } = useContext(HospitalContext);
  console.log('this is inside collection form', 'UID:', uid, 'email:', email);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Ensure all fields are filled
    if (!name || !mobileNumber || !hospitalName || !hospitalAddress) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }

    setLoading(true);
    try {
      const { error: newHospitalError } = await supabase
        .from('hospitals')
        .insert([
          {
            hospital_id: uid,
            name: hospitalName,
            address: hospitalAddress,
            contact_number: mobileNumber,
            email: email,
            administrator: name,
            created_at: new Date().toISOString(),
          },
        ]);

      if (newHospitalError) {
        throw newHospitalError;
      }

      console.log('Successfully submitted details to Supabase');
      updateHospitalData({
        hospital_id: uid,
        name: hospitalName,
        address: hospitalAddress,
        contact_number: mobileNumber,
        email: email,
        administrator: name,
      });
      Alert.alert('Success', 'Details submitted successfully.');
      router.replace('/(tabs)/home/HomePage');
    } catch (error) {
      console.log('error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
    // router.replace('/(tabs)/home/HomePage');

  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0F19" />
      <View style={styles.container}>
        <Text style={styles.header}>Just a few more details</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter Name"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="Enter Mobile Number"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Hospital Name</Text>
        <TextInput
          style={styles.input}
          value={hospitalName}
          onChangeText={setHospitalName}
          placeholder="Enter Hospital Name"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Hospital Address</Text>
        <TextInput
          style={styles.input}
          value={hospitalAddress}
          onChangeText={setHospitalAddress}
          placeholder="Enter Hospital Address"
          placeholderTextColor="#666"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#6C5CE7" />
        ) : (
          <Button title="Submit" onPress={handleSubmit} color="#6C5CE7" />
        )}
      </View>
    </SafeAreaView>
  );
};

export default CollectDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E0F19', // Match background color to app theme
  },
  container: {
    marginTop: '5%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E0F19',
    padding: 20,
  },
  header: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Poppins-Bold', // Custom font
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
});
