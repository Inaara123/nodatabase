import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Image } from 'react-native';
import * as Font from 'expo-font'; // Import Font module for Expo
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { router } from 'expo-router'; // Import router from Expo

const HomeComponent = ({ email }) => {
  // Animated values
  const buttonScaleAnim = useRef(new Animated.Value(1)).current; // Use useRef for persistent values
  const buttonPulseAnim = useRef(new Animated.Value(1)).current; // Use useRef for persistent values

  // State for the typewriter effect and font loading
  const [displayedText, setDisplayedText] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const fullText = 'Hello'; // Only animate "Hello"

  // Load the font
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'DancingScript': require('../assets/fonts/DancingScript-VariableFont_wght.ttf'), // Ensure path is correct
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      // Typewriter effect
      let textIndex = 0;
      const interval = setInterval(() => {
        if (textIndex < fullText.length) {
          setDisplayedText((prev) => prev + fullText[textIndex]);
          textIndex += 1;
        } else {
          clearInterval(interval);
        }
      }, 200); // Adjust typing speed here (200ms per character)

      // Clean up interval on component unmount
      return () => clearInterval(interval);
    }
  }, [fontsLoaded]);

  // Set up the pulse animation loop using useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true, // Ensure use of native driver
          }),
          Animated.timing(buttonPulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      // Clean up the animation on unfocus or unmount
      return () => pulseAnimation.stop();
    }, [])
  );

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (!fontsLoaded) {
    return <View><Text>Loading Fonts...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.helloText}>{displayedText}</Text>
      <Text style={styles.emailText}>{email}</Text>
      {/* Use an image instead of the icon */}
      <Image source={require('../assets/images/doctor-finding-medical-file.png')} style={styles.icon} />
      <Text style={styles.message}>You haven't added any doctors yet!</Text>
      <Animated.View style={{ transform: [{ scale: Animated.multiply(buttonScaleAnim, buttonPulseAnim) }] }}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => router.push('/settings/ProfileForm')}
        >
          <Text style={styles.buttonText}>Add Doctors</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E0F19',
    padding: 20,
  },
  icon: {
    width: 300,
    height: 300,
    marginBottom: 30,
    resizeMode: 'contain', // Ensures the image maintains aspect ratio
  },
  helloText: {
    fontSize: 40,
    fontFamily: 'DancingScript', // Use the cursive font
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10, // Reduced margin for "Hello"
  },
  emailText: {
    fontSize: 28, // Slightly smaller for email
    fontFamily: 'Poppins_400Regular',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 50,
  },
  message: {
    fontSize: 32,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
  },
  button: {
    width: 185,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#6C5CE7',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontFamily: 'Poppins_400Regular',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default HomeComponent;
