import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabaseClient';
import { ref, update } from 'firebase/database';
import { database } from '../firebase';
import { UserContext } from '../UserContext';
import { DataContext } from '../DataContext';
import { RealTimeContext } from '../RealTimeContext';
import RNPickerSelect from 'react-native-picker-select'; // Import the picker
import { useLocalSearchParams } from 'expo-router';

const InitialVisit = () => {
  const { docid, docname, docdept } = useLocalSearchParams(); // Using docname from params
  const [isFirstVisit, setIsFirstVisit] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [consultationType, setConsultationType] = useState(null);
  const [appointmentType, setAppointmentType] = useState(null); // State for appointment type
  const [showDetails, setShowDetails] = useState(false);
  const [reasonToVisit, setReasonToVisit] = useState('');
  const { userData } = useContext(UserContext);
  const { data } = useContext(DataContext);
  const { realData, updateRealData } = useContext(RealTimeContext);
  const uid = userData.uid;
  console.log("the doctor data is : ",data);
  console.log("the doc id is : ",docid);
  const doctor_id = data[docid].doctor_id;
  const router = useRouter();
  console.log("the doc id for the clicked is : ",data[docid].doctor_id);
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

  const handleCheckVisit = async () => {
    if (isFirstVisit === null) {
      Alert.alert('Error', 'Please select if this is your first visit.');
      return;
    }

    if (isFirstVisit) {
        router.replace({
            pathname: '/home/FirstVisit',
            params: {
              docid: docid,
              docdept: docdept,
              docname: docname,
            },
          });
    
    }else {
      if (!mobileNumber) {
        Alert.alert('Error', 'Please enter a registered mobile number.');
        return;
      }

      try {
        const { data, error } = await supabase
        .from('patients')
        .select(`
          patient_id,
          name,
          gender,
          address,
          date_of_birth,
          appointments (
            appointment_id
          )
        `)
        .eq('contact_number', mobileNumber)
        .eq('appointments.hospital_id', uid);
      

        if (error) {
          console.error(error);
          Alert.alert('Error', 'Server error occurred. Please try again later.');
          return;
        }

        if (Array.isArray(data) && data.length > 0) {
          setPatients(data);
        } else {
          Alert.alert('Mobile number not found', 'Registering as a new patient.');
          router.replace({
            pathname: '/home/FirstVisit',
            params: {
              docid: docid,
              docdept: docdept,
              docname: docname,
            },
          });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'Server error occurred. Please try again later.');
      }
    }

    if (!reasonToVisit) {
      //Alert.alert('Error', 'Please provide a reason for the visit.');
      return;
    }

    if (!appointmentType) {
      Alert.alert('Error', 'Please select an appointment type.');
      return;
    }

    if (selectedPatient) {
        const appointmentTime = new Date();
        appointmentTime.setHours(appointmentTime.getHours() + 5);
        appointmentTime.setMinutes(appointmentTime.getMinutes() + 30);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([
            {
              hospital_id: uid,
              doctor_id: doctor_id, // This should be dynamic
              patient_id: selectedPatient.patient_id,
              appointment_type: appointmentType, // Use the selected appointment type
              reason_for_visit: reasonToVisit,
              appointment_time: appointmentTime.toISOString(), 
              consultation_start_time:appointmentTime.toISOString(), // Assuming you want to set the current time
              status: 'scheduled',
            },
          ]);

        if (error) {
          console.error('Error inserting appointment:', error);
          Alert.alert('Error', 'Failed to schedule the appointment.');
        } else {
            // GET APPOINTMENT ID //
            const { data: appointmentData, error } = await supabase
            .from('appointments')
            .select('appointment_id')
            .eq('hospital_id', uid)
            .eq('doctor_id', doctor_id)
            .eq('patient_id', selectedPatient.patient_id)
            .eq('appointment_time', appointmentTime.toISOString());
            // .eq('appointment_time::date', appointmentTime.toISOString().split('T')[0]);
            console.log("The patient_id is ",selectedPatient.patient_id)
            console.log("The appointment_id is ",appointmentData[0].appointment_id)
     
          if (error) throw error;
     
     
          console.log('The data from supabase  is : ', appointmentData);



            ///////////////////////
            const masterelement = {
                name: selectedPatient.name,
                docname: docname,
                waitno: getOrCreateWaitNumberForDocId(realData, docid),
                docdept: docdept,
                docid: docid,
                patient_id: selectedPatient.patient_id,
                appointment_id: appointmentData[0].appointment_id,

            }
          Alert.alert('Success', 'Appointment successfully scheduled.');
          if (Object.keys(realData).length === 0) {
            realData[1] = masterelement;
          } else {
            const newKey = Object.keys(realData).length + 1;
            realData[newKey] = masterelement;
          }
      
          // To save data locally  in realdata //
          try {
            await update(ref(database, 'users/' + uid), { realtime: JSON.stringify(realData) });
            updateRealData(realData);
          } catch (error) {
            Alert.alert('Error', error.message);
          }
          router.replace('/home/HomePage'); // Navigate to home or any other screen after success
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const handlePatientSelection = (patient) => {
    setSelectedPatient(patient);
    setPatients([]); // Clear the patient list after selection
  };

  const handleConsultationSelection = (type) => {
    setConsultationType(type);
    if (type === 'New Consultation') {
      setShowDetails(true); // Display patient details on the same screen
    }
    else if (type === 'Follow-Up') {
        setReasonToVisit('Follow-Up'); // Automatically set reason for follow-up
        setShowDetails(true); // Display patient details on the same screen
      }
  };

  const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const diffMs = Date.now() - dob.getTime(); // Difference in milliseconds
    const ageDt = new Date(diffMs); // Convert difference to date format
  
    return Math.abs(ageDt.getUTCFullYear() - 1970); // Calculate the difference in years
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        <Text style={styles.headerText}>Is this your first visit to the hospital?</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isFirstVisit === true && styles.buttonSelected]}
            onPress={() => setIsFirstVisit(true)}
          >
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isFirstVisit === false && styles.buttonSelected]}
            onPress={() => setIsFirstVisit(false)}
          >
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
        </View>
        {isFirstVisit === false && (
          <>
            <Text style={styles.label}>Enter Registered Mobile Number:</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={(value) => setMobileNumber(value)}
            />
            
            {patients.length > 0 && !selectedPatient && (
              <>
                <Text style={styles.label}>Select Patient:</Text>
                <FlatList
                  data={patients}
                  keyExtractor={(item) => item.patient_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.patientItem}
                      onPress={() => handlePatientSelection(item)}
                    >
                      <Text style={styles.patientText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
            {selectedPatient && !consultationType && (
              <>
                <Text style={styles.label}>Select Consultation Type:</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.consultationButton}
                    onPress={() => handleConsultationSelection('New Consultation')}
                  >
                    <Text style={styles.consultationButtonText}>New Consultation</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.consultationButton}
                    onPress={() => handleConsultationSelection('Follow-Up')}
                  >
                    <Text style={styles.consultationButtonText}>Follow-Up</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {selectedPatient && consultationType && (
              <>
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsText}>Patient Details:</Text>
                  <Text style={styles.detailsText}>Name: {selectedPatient.name}</Text>
                  <Text style={styles.detailsText}>Age: {calculateAge(selectedPatient.date_of_birth)}</Text>
                  <Text style={styles.detailsText}>Gender: {selectedPatient.gender}</Text>
                  <Text style={styles.detailsText}>Area: {selectedPatient.address}</Text>
                  <View style={styles.inlineContainer}>
                    <Text style={styles.detailsText}>Reason for visit:</Text>
                    <TextInput
                      style={[styles.input, styles.inlineInput]}
                      value={reasonToVisit}
                      onChangeText={(value) => setReasonToVisit(value)}
                      placeholder="Enter reason"
                      placeholderTextColor="#666"
                    />
                  </View>
                  <Text style={styles.label}>Appointment Type:</Text>
                  <RNPickerSelect
                    onValueChange={(value) => setAppointmentType(value)}
                    items={[
                      { label: 'Walk-In', value: 'Walk-In' },
                      { label: 'Booking', value: 'Appointment' },
                      { label: 'Emergency', value: 'Emergency' },
                    ]}
                    style={pickerSelectStyles}
                    placeholder={{ label: 'Select an appointment type', value: null }}
                    value={appointmentType}
                  />
                </View>
              </>
            )}
          </>
        )}
        <TouchableOpacity style={styles.submitButton} onPress={handleCheckVisit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
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
  inputAndroid: {
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
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6F61',
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1F1F28',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 10,
  },
  buttonSelected: {
    backgroundColor: '#FF6F61',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
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
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  inlineInput: {
    width: '60%',
    height: 40,
    marginBottom: 0,
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF6F61',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  patientItem: {
    padding: 15,
    backgroundColor: '#1F1F28',
    borderRadius: 12,
    marginBottom: 10,
    width: '100%',
  },
  patientText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
  },
  detailsContainer: {
    width: '100%',
    marginTop: 20,
  },
  detailsText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
  consultationButton: {
    flex: 1,
    backgroundColor: '#1F1F28',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
  },
  consultationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
});

export default InitialVisit;
