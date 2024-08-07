import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // For image picking functionality
import RNPickerSelect from 'react-native-picker-select'; // Import picker for gender
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DataContext } from '../../../DataContext';
import { useNavigation } from 'expo-router';

const ProfileForm = () => {
  const navigate = useNavigation();
  const { data, updateData } = useContext(DataContext);
  console.log("Initially when the data came in add doctor : ", data);

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('male'); // Default gender
  const [image, setImage] = useState(null);

  // Function to submit the form
  const onSubmit = () => {
    if (!name || !department || !phoneNumber) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    alert('Details Submitted!');
    console.log('The keys are : ', data);
    const masterelement = {
      name: name,
      department: department,
      phoneNumber: phoneNumber,
      gender: gender,
      image: image, // Storing image URI
    };

    if (Object.keys(data).length === 0) {
      console.log("The data is empty");
      data[1] = masterelement;
    } else {
      const newKey = Object.keys(data).length + 1;
      data[newKey] = masterelement;
    }
    console.log("The data getting updated is : ", data);

    updateData(data);
    router.replace('settings/Settings');
  };

  // Function to request permissions and open the image picker
  const pickImage = async () => {
    // Request permissions to access media library and camera
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

    if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
      alert('Sorry, we need camera roll and camera permissions to make this work!');
      return;
    }

    Alert.alert(
      'Select Image Source',
      'Choose where to pick the image from:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Camera',
          onPress: async () => {
            try {
              // Open camera and capture an image
              let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });

              console.log('Camera result:', result);

              if (!result.canceled) {
                console.log('Image URI from Camera:', result.uri); // Debug: Log URI
                setImage(result.uri); // Set image URI
              }
            } catch (error) {
              console.error('Camera error:', error);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            try {
              // Open image library and pick an image
              let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });

              console.log('Gallery result:', result);

              // Check if the result contains assets and access the first asset's URI
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                console.log('Image URI from Gallery:', imageUri); // Debug: Log URI
                setImage(imageUri); // Set image URI
              }
            } catch (error) {
              console.error('Gallery error:', error);
            }
          },
        },
      ]
    );
  };

  // Define default images for male and female
  const defaultMaleImage = require('../../../assets/images/default-male.png');
  const defaultFemaleImage = require('../../../assets/images/default-female.png');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.select({ ios: 60, android: 80 })}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.addDoctor}>Add Doctor</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#bbb"
          />

          <Text style={styles.label}>Department</Text>
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
            placeholder="Enter your department"
            placeholderTextColor="#bbb"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            placeholderTextColor="#bbb"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Gender</Text>
          <RNPickerSelect
            onValueChange={(value) => setGender(value)}
            items={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]}
            value={gender}
            placeholder={{
              label: 'Select gender...',
              value: null,
              color: '#9E9E9E',
            }}
            style={pickerSelectStyles}
          />

          <View style={styles.photoContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>
                {image ? 'Modify Photo' : 'Upload Photo'}
              </Text>
            </TouchableOpacity>
            <Image
              source={
                image
                  ? { uri: image }
                  : gender === 'male'
                  ? defaultMaleImage
                  : defaultFemaleImage
              }
              style={styles.image}
              onError={(error) => console.error('Image loading error:', error.nativeEvent)}
            />
          </View>

          <TouchableOpacity onPress={onSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0F19', // Deep dark background for elegance
  },
  scrollContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addDoctor: {
    fontSize: 36,
    marginTop: 15,
    fontFamily: 'Poppins_600SemiBold', // Premium font style
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    color: '#CCCCCC', // Light gray for form labels
    marginBottom: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  input: {
    height: 50,
    borderColor: '#FFFFFF', // White border for inputs
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#FFFFFF', // White text color for inputs
    marginBottom: 16,
    backgroundColor: '#0E0F19', // Match input background with main background
    width: '100%', // Full width for better layout
  },
  photoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#FF69B4', // Pink color for the upload button
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  image: {
    marginTop: 10,
    width: 120,
    height: 120,
    borderRadius: 60, // Circular image for profile
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: '#6C5CE7', // Matches theme color
  },
  icon: {
    width: 200,
    height: 200,
    marginBottom: 30,
    resizeMode: 'contain', // Ensures the image maintains aspect ratio
  },
  submitButton: {
    backgroundColor: '#6C5CE7', // Purple color for submit button
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    height: 50,
    borderColor: '#FFFFFF', // White border for inputs
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#FFFFFF', // White text color for inputs
    marginBottom: 16,
    backgroundColor: '#0E0F19', // Match input background with main background
    width: '100%', // Full width for better layout
  },
  inputIOS: {
    height: 50,
    borderColor: '#FFFFFF', // White border for inputs
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#FFFFFF', // White text color for inputs
    marginBottom: 16,
    backgroundColor: '#0E0F19', // Match input background with main background
    width: '100%', // Full width for better layout
  },
  placeholder: {
    color: '#9E9E9E',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});

export default ProfileForm;
