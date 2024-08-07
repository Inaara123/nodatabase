import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native'; // Import SafeAreaView and StatusBar
import RNPickerSelect from 'react-native-picker-select';
import { useLocalSearchParams } from 'expo-router';
import { UserContext } from '../UserContext';
import { RealTimeContext } from '../RealTimeContext';
import { ref, update } from 'firebase/database';
import { database } from '../firebase';
import { router } from 'expo-router';

const AddPatient = () => {
  const { docid, docname, docdept } = useLocalSearchParams(); // Using docname from params
  const { realData, updateRealData } = useContext(RealTimeContext);
  const { userData } = useContext(UserContext);
  const uid = userData.uid; // Get the user ID from the context
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    age: '',
    type: '', // New type field
    reasonForVisit: '',
    mobileNumber: '',
    gender: '',
    discovery: '',
  });
  const [loading, setLoading] = useState(false); // Loading state

  function getOrCreateWaitNumberForDocId(data, docid) {
    let totalWaitNo = 0;
    let docExists = false;

    for (const key in data) {
      if (data[key].docid === docid) {
        totalWaitNo += 1;
        docExists = true; // Mark that the docid exists
      }
    }

    // If the docid does not exist, create a new entry with waitno = 0
    if (!docExists) {
      totalWaitNo = 0; // Since it's a new entry, waitno is 0
    }

    return totalWaitNo;
  }

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.mobileNumber) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    setLoading(true); // Start loading

    const masterelement = {
      name: formData.name,
      docid: docid,
      docname: docname,
      waitno: getOrCreateWaitNumberForDocId(realData, docid),
      docdept: docdept,
      type: formData.type,
      address: formData.address,
      age: formData.age,
      reasonForVisit: formData.reasonForVisit,
      mobileNumber: formData.mobileNumber,
      gender: formData.gender,
      discovery: formData.discovery,
    };

    if (Object.keys(realData).length === 0) {
      realData[1] = masterelement;
    } else {
      const newKey = Object.keys(realData).length + 1;
      realData[newKey] = masterelement;
    }

    try {
      await update(ref(database, 'users/' + uid), { realtime: JSON.stringify(realData) });
      updateRealData(realData);
      router.replace('/home/HomePage');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{docname}</Text>
        </View>

        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />

        <Text style={styles.label}>Address:</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
        />

        <Text style={styles.label}>Age:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={formData.age}
          onChangeText={(value) => handleInputChange('age', value)}
        />

        <Text style={styles.label}>Type:</Text>
        <RNPickerSelect
          onValueChange={(value) => handleInputChange('type', value)}
          items={[
            { label: 'Walk-in', value: 'Walk-in' },
            { label: 'Appointment', value: 'Appointment' },
            { label: 'Emergency', value: 'Emergency' },
          ]}
          style={pickerSelectStyles}
          value={formData.type}
          placeholder={{
            label: 'Select type...',
            value: null,
            color: '#9E9E9E',
          }}
        />

        <Text style={styles.label}>Reason for Visit:</Text>
        <TextInput
          style={styles.input}
          value={formData.reasonForVisit}
          onChangeText={(value) => handleInputChange('reasonForVisit', value)}
        />

        <Text style={styles.label}>Mobile Number:</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={formData.mobileNumber}
          onChangeText={(value) => handleInputChange('mobileNumber', value)}
        />

        <Text style={styles.label}>Gender:</Text>
        <RNPickerSelect
          onValueChange={(value) => handleInputChange('gender', value)}
          items={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ]}
          style={pickerSelectStyles}
          value={formData.gender}
          placeholder={{
            label: 'Select gender...',
            value: null,
            color: '#9E9E9E',
          }}
        />

        <Text style={styles.label}>Discovery:</Text>
        <TextInput
          style={styles.input}
          value={formData.discovery}
          onChangeText={(value) => handleInputChange('discovery', value)}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212', // Match background color to app theme
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#1F1F28',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6F61', // Accent color for header
    fontFamily: 'Poppins-Bold',
  },
  label: {
    alignSelf: 'flex-start',
    marginVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1F1F28',
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF6F61',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    width: '100%',
    height: 50,
    backgroundColor: '#1F1F28',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  inputIOS: {
    width: '100%',
    height: 50,
    backgroundColor: '#1F1F28',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  placeholder: {
    color: '#9E9E9E',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});

export default AddPatient;
