import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const defaultMaleImage = require('../assets/images/default-male.png'); // Ensure the path is correct
const defaultFemaleImage = require('../assets/images/default-female.png'); // Ensure the path is correct

const SettingsList = ({ name, phone, image,gender, onModify, onDelete, }) => {
  const displayImage = image
  ? { uri: image }
  : gender === 'male'
  ? defaultMaleImage
  : defaultFemaleImage;
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={displayImage} // Replace with your image URL
          style={styles.image}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.phone}>{phone}</Text>
        <View style={styles.iconsContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={onModify}>
            <Icon name="edit" size={34} color="#9FC9FF" /> 
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
            <Icon name="delete" size={34} color="#FF6B6B" /> 
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.25,
    flexDirection: 'row',
    borderRadius: 15,
    backgroundColor: '#1E1F28', // Darker card background
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '40%', // Increase width for larger image display
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1F28', // Subtle contrast for image container
    padding: 10,
  },
  image: {
    width: 120, // Larger image width
    height: 120, // Larger image height
    borderRadius: 50, // Circular image for a professional look
    borderWidth: 1.5,
    borderColor: '#CCCCCC', 
    marginLeft :  15// Accent color for image border
  },
  infoContainer: {
    width: '60%',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  phone: {
    fontSize: 20,
    color: '#CCCCCC', // Light gray for secondary text
    marginBottom: 15,
    fontFamily: 'Poppins_400Regular',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 5,
  },
  iconButton: {
    marginRight: 15,
    padding: 5,
  },
});

export default SettingsList;
