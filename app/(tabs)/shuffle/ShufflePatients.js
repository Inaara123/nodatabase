import React, { useContext, useCallback, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native'; // Import SafeAreaView and StatusBar
import 'react-native-gesture-handler';

import { useFocusEffect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { RealTimeContext } from '../../../RealTimeContext';
import { UserContext } from '../../../UserContext';
import { ref, update } from 'firebase/database';
import { database } from '../../../firebase';

const ShufflePatients = () => {
  const { realData, updateRealData } = useContext(RealTimeContext);
  const { userData } = useContext(UserContext);
  const uid = userData.uid;
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function restructureWaitNo(dataArray) {
    const waitNoMap = {}; // To track the waitno for each docid
    const result = {}; // To store the final result

    dataArray.forEach((entry, index) => {
      const docid = entry.docid;

      // Initialize the waitno for this docid if it doesn't exist
      if (!waitNoMap[docid]) {
        waitNoMap[docid] = 0;
      }

      // Create a new entry with the correct waitno
      const newEntry = {
        ...entry,
        waitno: waitNoMap[docid], // Update the waitno directly
      };

      // Add the new entry to the result object with keys starting from 1
      result[index + 1] = newEntry;

      // Increment the waitno for this docid for the next entry
      waitNoMap[docid]++;
    });

    return result;
  }

  useFocusEffect(
    useCallback(() => {
      const initdataArray = Object.keys(realData).map((key) => ({
        id: key,
        ...realData[key],
      }));
      setDisplayData(initdataArray);
      console.log('The initdataArray inside shuffle is:', initdataArray);

      return () => {
        // Cleanup actions when the screen is unfocused
      };
    }, [realData]) // Dependencies array to rerun the effect when realData changes
  );

  // Function to handle delete confirmation and deletion
  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this entry?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Deletion Cancelled'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setLoading(true); // Set loading to true
            try {
              // Filter out the item to be deleted
              const updatedData = displayData.filter((item) => item.id !== id);
              // Reorganize the wait numbers
              const reorganizedData = restructureWaitNo(updatedData);
              await update(ref(database, 'users/' + uid), { realtime: JSON.stringify(reorganizedData) });
              Alert.alert('Success', 'User data updated successfully!');
              // Update the context and local state
              updateRealData(reorganizedData);
              setDisplayData(updatedData);
              console.log('Deleted entry with id:', id);
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false); // Set loading to false after completion
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Function to display wait number text based on the waitno value
  const getWaitNoText = (waitno) => {
    if (waitno === 0) return 'In Consultation';
    if (waitno === 1) return 'Next';
    return `Wait No: ${waitno}`;
  };

  if (displayData.length === 0) {
    console.log('No data to display');
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0E0F19" />
        <View style={styles.container}>
          <Image
            source={require('../../../assets/images/online-consultation.png')}
            style={styles.iconempty}
          />
          <Text style={styles.emptyText}>Your Patient List is empty!</Text>
        </View>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0E0F19" />
        <GestureHandlerRootView style={styles.container}>
          {loading && (
            <ActivityIndicator size="large" color="#6C5CE7" style={styles.loader} />
          )}
          <DraggableFlatList
            data={displayData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, drag, isActive }) => {
              return (
                <ScaleDecorator>
                  <TouchableOpacity
                    style={styles.card}
                    onLongPress={drag}
                    disabled={isActive}
                  >
                    <View style={styles.infoContainer}>
                      <Text style={styles.name}>{capitalizeFirstLetter(item.name)}</Text>
                      <Text style={styles.docname}>
                        {capitalizeFirstLetter(item.docdept)} | {capitalizeFirstLetter(item.docname)}
                      </Text>
                    </View>
                    <View style={styles.rightContainer}>
                      <View style={styles.waitnoContainer}>
                        <Text style={styles.waitno}>{getWaitNoText(item.waitno)}</Text>
                      </View>
                      <View style={styles.iconContainer}>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => console.log('Edit button pressed')}
                        >
                          <Icon name="edit" size={34} color="#9FC9FF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => handleDelete(item.id)}
                        >
                          <Icon name="delete" size={34} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </ScaleDecorator>
              );
            }}
            onDragEnd={async ({ data }) => {
              setLoading(true); // Set loading to true
              try {
                await update(ref(database, 'users/' + uid), { realtime: JSON.stringify(restructureWaitNo(data)) });
                updateRealData(restructureWaitNo(data));
                console.log('The new data order is:', data);
              } catch (error) {
                Alert.alert('Error', error.message);
              } finally {
                setLoading(false); // Set loading to false after completion
              }
            }}
          />
        </GestureHandlerRootView>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E0F19', // Match background color to app theme
  },
  container: {
    marginTop: '5%',
    flex: 1,
    backgroundColor: '#0E0F19', // Dark background color
    padding: 16,
  },
  card: {
    backgroundColor: '#1E1F28',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: 'white',
    fontSize: 24, // Increased font size
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'capitalize', // Capitalize first letter
  },
  docname: {
    color: '#a1a1a1',
    fontSize: 16,
    marginBottom: 8,
    textTransform: 'capitalize', // Capitalize first letter
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  waitnoContainer: {
    borderWidth: 0, // Added white border
    borderColor: '#FFFFFF', // Set border color to white
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitno: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins_300SemiBold',
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 8, // Added space between icons
  },
  iconButton: {
    backgroundColor: '#3a3a3c',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8, // Increased margin for more spacing
  },
  icon: {
    color: 'white',
    fontSize: 20,
  },
  iconempty: {
    marginTop: 100,
    marginLeft: 40,
    width: 300,
    height: 300,
    marginBottom: 30,
    resizeMode: 'contain', // Ensures the image maintains aspect ratio
  },
  emptyText: {
    fontSize: 28, // Slightly smaller for email
    fontFamily: 'Poppins_600Regular',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 50,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1,
  },
});

export default ShufflePatients;
