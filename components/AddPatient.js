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
  ActivityIndicator,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { UserContext } from '../UserContext';
import { RealTimeContext } from '../RealTimeContext';
import { DataContext } from '../DataContext';
import { supabase } from '../supabaseClient';
import { ref, update } from 'firebase/database';
import { database } from '../firebase';
import { router } from 'expo-router';

const AddPatient = () => {
  const { docid, docname, docdept } = useLocalSearchParams(); 
  const { realData, updateRealData } = useContext(RealTimeContext);
  const { data } = useContext(DataContext);
  const { userData } = useContext(UserContext);
  const uid = userData.uid;
  const doctor_id = data[docid].doctor_id;
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    dateOfBirth: new Date(),
    email: '',
    type: '',
    reasonForVisit: '',
    mobileNumber: '',
    gender: '',
    discovery: '',
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  let appointment_id;
  function getOrCreateWaitNumberForDocId(data, docid) {
    let totalWaitNo = 0;
    let docExists = false;

    for (const key in data) {
      if (data[key].docid === docid) {
        totalWaitNo += 1;
        docExists = true;
      }
    }

    if (!docExists) {
      totalWaitNo = 0;
    }

    return totalWaitNo;
  }

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('dateOfBirth', selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.mobileNumber || !formData.address || !formData.gender || !formData.reasonForVisit || !formData.dateOfBirth || !formData.discovery) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    setLoading(true);


    const masterelementsupabase = {
      name: formData.name,
      docid: docid,
      docname: docname,
      waitno: getOrCreateWaitNumberForDocId(realData, docid),
      docdept: docdept,
      address: formData.address,
      date_of_birth: formData.dateOfBirth.toISOString(),
      email: formData.email,
      reasonForVisit: formData.reasonForVisit,
      mobileNumber: formData.mobileNumber,
      gender: formData.gender,
      discovery: formData.discovery,
    };

    try {
      const { data: existingPatient, error: existingPatientError } = await supabase
        .from('patients')
        .select('patient_id,appointments (appointment_id)')
        .eq('contact_number', formData.mobileNumber)
        .eq('name', formData.name)
        .eq('appointments.hospital_id', uid)
        .single();
      let patientId;

      if (existingPatientError) {
        if (existingPatientError.code !== 'PGRST116') {
          throw new Error('Error checking patient existence: ' + existingPatientError.message);
        } else {
          const { data: newPatient, error: patientError } = await supabase
            .from('patients')
            .insert([
              {
                name: formData.name,
                address: formData.address,
                date_of_birth: formData.dateOfBirth.toISOString(),
                email: formData.email,
                gender: formData.gender,
                contact_number: formData.mobileNumber,
                how_did_you_get_to_know_us: formData.discovery,
              }
            ])
            .select('patient_id')
            .single();

          if (patientError) {
            throw new Error('Error adding patient: ' + patientError.message);
          }

          patientId = newPatient.patient_id;
        }
      } else {
        patientId = existingPatient.patient_id;
      }
      const appointmentTime = new Date();
        appointmentTime.setHours(appointmentTime.getHours() + 5);
        appointmentTime.setMinutes(appointmentTime.getMinutes() + 30);
      
        const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            hospital_id: uid,
            doctor_id: doctor_id, 
            patient_id: patientId,
            appointment_type: formData.type, 
            reason_for_visit: formData.reasonForVisit,
            appointment_time:appointmentTime.toISOString(),
            consultation_start_time: appointmentTime.toISOString(),
            status: 'scheduled',
          }
        ])
        .select('appointment_id')
        .single();
        appointment_id = newAppointment.appointment_id;
        console.log('The appointments id is:',appointment_id);
      if (appointmentError) {
        throw new Error('Error adding appointment: ' + appointmentError.message);
      }

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
    console.log('The appointment id is:',appointment_id);
    const masterelement = {
      name: formData.name,
      docname: docname,
      waitno: getOrCreateWaitNumberForDocId(realData, docid),
      docdept: docdept,
      docid: docid,
      appointment_id: appointment_id,
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
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{docname}</Text>
        </View>

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
        />

        <Text style={styles.label}>Date of Birth *</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{formData.dateOfBirth.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
        />

        <Text style={styles.label}>Appointment Type *</Text>
        <RNPickerSelect
          onValueChange={(value) => handleInputChange('type', value)}
          items={[
            { label: 'Walk-in', value: 'Walk-in' },
            { label: 'Booking', value: 'Booking' },
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

        <Text style={styles.label}>Reason for Visit *</Text>
        <TextInput
          style={styles.input}
          value={formData.reasonForVisit}
          onChangeText={(value) => handleInputChange('reasonForVisit', value)}
        />

        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={formData.mobileNumber}
          onChangeText={(value) => handleInputChange('mobileNumber', value)}
        />

        <Text style={styles.label}>Gender *</Text>
        <RNPickerSelect
          onValueChange={(value) => handleInputChange('gender', value)}
          items={[
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Other', value: 'Other' },
          ]}
          style={pickerSelectStyles}
          value={formData.gender}
          placeholder={{
            label: 'Select gender...',
            value: null,
            color: '#9E9E9E',
          }}
        />

        <Text style={styles.label}>How did you know about us? *</Text>
        <RNPickerSelect
          onValueChange={(value) => handleInputChange('discovery', value)}
          items={[
            { label: 'Friends and Family', value: 'Friends and Family' },
            { label: 'Google', value: 'Google' },
            { label: 'Instagram', value: 'Instagram' },
            { label: 'Facebook', value: 'Facebook' },
            { label: 'Other', value: 'Other' },
          ]}
          style={pickerSelectStyles}
          value={formData.discovery}
          placeholder={{
            label: 'Select...',
            value: null,
            color: '#9E9E9E',
          }}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Submit</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    padding: 20,
    marginTop: 25,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    color: '#fff',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  inputAndroid: {
    color: '#fff',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});

export default AddPatient;
