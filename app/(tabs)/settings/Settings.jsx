import React, { useContext } from 'react';
import { View, Text, FlatList, Alert, StyleSheet,SafeAreaView,TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import SettingsList from '../../../components/SettingsList';
import { DataContext } from '../../../DataContext';
import { UserContext } from '../../../UserContext';
import { RealTimeContext } from '../../../RealTimeContext';
import {auth } from '../../../firebase';
import {signOut} from 'firebase/auth';
import { update } from 'firebase/database';

// Updated styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0E12', // Darker background for elegance
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    padding: 20,
    color: '#FFFFFF', // White color for text
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16,
    marginTop: 20,  
  },
  signouttext: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
    color: '#FFFFFF', // White color for text
    fontFamily: 'Poppins_300SemiBold',
    marginBottom: 16,
    marginTop: 20,  
  },
  add: {
    fontSize: 18,
    paddingVertical: 15,
    paddingHorizontal: 30,
    fontWeight: 'bold',
    backgroundColor: '#6C5CE7', // Rich purple accent color
    color: '#FFFFFF',
    borderRadius: 15,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginTop: 20,
  },
  signout: {
    fontSize: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    fontWeight: 'bold',
    backgroundColor: '#FF6B6B', // Rich purple accent color
    color: '#FFFFFF',
    borderRadius: 15,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginTop: 20,
  },
});

const Settings = () => {
  const { data, updateData } = useContext(DataContext);
  const { updateUser} = useContext(UserContext);
  const {updateRealData} = useContext(RealTimeContext);


  const handleSignOut = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to log out? All your data will be deleted.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Sign out cancelled'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            console.log('Sign out');
            signOut(auth)
              .then(() => {
                // Sign-out successful.
                console.log('Sign out successful');
                updateUser({});
                updateData({});
                updateRealData({});
                router.push({ pathname: '/' });
              })
              .catch((error) => {
                // An error happened.
                console.log('Error happened', error);
              });
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  const initdataArray = Object.keys(data).map((key) => ({
    id: key,
    ...data[key],
  }));
  console.log('The data in settings.js  : ', initdataArray);

  const handleModify = (id,name) => {
    router.navigate({ pathname: '/settings/ProfileModify', params: { post: id,docname:name } });
  };

  const handleDelete = (id) => {
  Alert.alert(
    'DELETE USER',
    'Are you sure you want to delete this user?',
    [
      {
        text: 'Confirm',
        onPress: () => {
          // Create a copy of the data object
          const updatedData = { ...data };
          console.log('The data before is: ', updatedData);

          // Delete the entry with the specified key
          delete updatedData[id];
          console.log('Data after deletion: ', updatedData);

          // Reorder the remaining entries
          const reorderedData = {};
          let newKey = 1;

          // Iterate over the keys in sorted order and remap them
          Object.keys(updatedData)
            .sort((a, b) => parseInt(a) - parseInt(b)) // Sort keys numerically
            .forEach((key) => {
              reorderedData[newKey] = updatedData[key];
              newKey++;
            });

          console.log('The reordered data is: ', reorderedData);

          // Update the data with the reordered entries
          updateData(reorderedData);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ],
    { cancelable: true }
  );
};


  const renderItem = ({ item }) => (
    <SettingsList
      name={item.name}
      phone={item.department}
      image={item.image}
      gender={item.gender}
      onModify={() => handleModify(item.id,item.name)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (

    <View style={styles.container}>
      <Text style={styles.text}>Doctor Profiles</Text>
      <FlatList
        data={initdataArray}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <Link href="/settings/ProfileForm" style={styles.add}>
        Add Doctor
      </Link>
      <TouchableOpacity style={styles.signout} onPress={handleSignOut}>
        <Text style={{color:'white',fontSize:18,fontStyle:'bold'}}>Log Out</Text>
      </TouchableOpacity>

    </View>

  );
};

export default Settings;
