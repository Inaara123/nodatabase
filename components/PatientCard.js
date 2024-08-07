import React, { useContext, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { RealTimeContext } from '../RealTimeContext';
import { ref, update } from 'firebase/database';
import { UserContext } from '../UserContext';
import { database } from '../firebase';

const defaultMaleImage = require('../assets/images/default-male.png'); // Ensure the path is correct
const defaultFemaleImage = require('../assets/images/default-female.png'); // Ensure the path is correct
const { width, height } = Dimensions.get('window');

const PatientCard = ({ name, id, department, gender, image, onAddPatient }) => {
  const displayImage = image ? { uri: image } : gender === 'male' ? defaultMaleImage : defaultFemaleImage;
  const { realData, updateRealData } = useContext(RealTimeContext);
  const { userData } = useContext(UserContext);
  const uid = userData.uid; // Get the user ID from the context

  const [loading, setLoading] = useState(false); // Loading state

  function deleteAndRestructureWaitNo(data, docid) {
    const result = {};
    let resultIndex = 1;

    const filteredEntries = Object.values(data).filter(
      (entry) => !(entry.docid === docid && entry.waitno === 0)
    );

    const waitNoMap = {};

    for (const entry of filteredEntries) {
      if (!waitNoMap[entry.docid]) {
        waitNoMap[entry.docid] = 0;
      }

      entry.waitno = waitNoMap[entry.docid];

      result[resultIndex++] = {
        docid: entry.docid,
        name: entry.name,
        docdept: entry.docdept,
        docname: entry.docname,
        waitno: entry.waitno,
      };

      waitNoMap[entry.docid]++;
    }

    return result;
  }

  function getNameForWaitNoZero(data, docid) {
    for (const key in data) {
      if (data[key].docid === docid && data[key].waitno === 0) {
        return data[key].name;
      }
    }
    return 'No Patients';
  }

  const handleTextPress = async () => {
    setLoading(true); // Start loading
    const newRealData = deleteAndRestructureWaitNo(realData, id);

    try {
      await update(ref(database, 'users/' + uid), { realtime: JSON.stringify(newRealData) });
      updateRealData(newRealData);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const onAddPatientIn = () => {
    router.push({
      pathname: '../home/PatientDetails',
      params: {
        docid: id,
        docdept: department,
        docname: name,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image source={displayImage} style={styles.photo} />
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.currentPatient}>Current Patient</Text>
        <Text style={styles.patientName}>{capitalizeFirstLetter(getNameForWaitNoZero(realData, id))}</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.buttonplus} onPress={handleTextPress} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>+</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onAddPatientIn}>
            <Text style={styles.buttonText}>Add Patient</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.35,
    flexDirection: 'row',
    borderRadius: 15,
    backgroundColor: '#1E1F28', // Dark theme background
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  leftSection: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1F28', // Contrast for image background
    padding: 15,
  },
  photo: {
    width: 120, // Larger image
    height: 120,
    borderRadius: 60, // Circular image
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: '#ffffff', // Accent color
  },
  name: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  rightSection: {
    width: '60%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentPatient: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff', // Light blue for current patient label
    fontFamily: 'Poppins_500SemiBold',
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    color: '#CCCCCC',
    fontFamily: 'Poppins_400Regular',
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#6C5CE7', // Purple for the add button
    paddingVertical: 12,
    marginBottom: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonplus: {
    backgroundColor: '#F47FA5', // Pink for the add button
    paddingVertical: 12,
    marginBottom: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
});

export default PatientCard;
