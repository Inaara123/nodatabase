import React, { useContext } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, StatusBar } from 'react-native'; // Import SafeAreaView and StatusBar
import HomeComponent from '../../../components/HomeComponent';
import PatientCard from '../../../components/PatientCard';
import { DataContext } from '../../../DataContext';
import { RealTimeContext } from '../../../RealTimeContext';
import { UserContext } from '../../../UserContext';

const HomePage = () => {
  const { userData } = useContext(UserContext);
  const { data } = useContext(DataContext);

  if (Object.keys(data).length === 0) {
    const email = userData.email;
    console.log('The email is:', email);
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0E0F19" />
        <HomeComponent email={email} />
      </SafeAreaView>
    );
  } else {
    const initdataArray = Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));

    const renderItem = ({ item }) => (
      <PatientCard name={item.name} id={item.id} department={item.department} gender={item.gender} image={item.image} />
    );

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0E0F19" />
        <View style={styles.container}>
          <FlatList
            data={initdataArray}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E0F19',
  },
});

export default HomePage;
