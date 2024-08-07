import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Image } from 'react-native';
import { router } from 'expo-router';

const WelcomeScreen = () => {
  const fallAnimation = useRef(new Animated.Value(-800)).current; // Start above the screen
  const bounceAnimation = useRef(new Animated.Value(0)).current; // For bouncing effect
  const smokeVisible = useRef(new Animated.Value(0)).current; // Smoke visibility

  useEffect(() => {
    // Character fall and bounce animation
    Animated.sequence([
      Animated.timing(fallAnimation, {
        toValue: 0, // End position
        duration: 1200, // Time it takes to fall
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnimation, {
        toValue: -20, // Bounce back slightly above
        friction: 2, // Control bounce effect
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnimation, {
        toValue: 0, // Settle at final position
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(smokeVisible, {
        toValue: 1, // Show smoke
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fallAnimation, bounceAnimation, smokeVisible]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>QEze</Text>
        <View style={styles.imagesContainer}>
          {/* Animated character image */}
          <Animated.Image
            source={require('../assets/images/brave-doctor.png')}
            style={[
              styles.Image,
              { transform: [{ translateY: fallAnimation }, { translateY: bounceAnimation }] },
            ]}
          />
          {/* Smoke effect image
          <Animated.Image
            source={require('../assets/images/smoke.gif')} // Replace with your smoke GIF path
            style={[
              styles.smokeEffect,
              { opacity: smokeVisible }, // Apply smoke visibility
            ]}
          /> */}
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>
          Grow your Medical practice with our advanced AI-powered technologies
        </Text>
        <Text style={styles.description}>
          A product of inaara.ai
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.navigate('/authentication/SignIn')}
        >
          <Text style={styles.buttonText}>Continue with Email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0F19', // Darker background color for a sleek look
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40, // Increased margin for better spacing
  },
  title: {
    fontSize: 34, // Larger font size for impact
    fontWeight: '700', // Use 700 for a bolder look
    color: '#FFFFFF',
    marginBottom: 30,
    fontFamily: 'Poppins-Bold', // Custom font for a modern look
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20, // Adjust padding for better alignment
    position: 'relative', // Relative positioning for smoke effect
  },
  Image: {
    width: 300,
    height: 300,
    marginBottom: 30,
    resizeMode: 'contain', // Ensures the image maintains aspect ratio
  },
  smokeEffect: {
    position: 'absolute',
    bottom: -10, // Position smoke at character's feet
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 120, // Increased margin for better spacing
  },
  subtitle: {
    fontSize: 26, // Slightly larger font size
    fontWeight: '600', // Slightly lighter weight for subtler impact
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30, // Adjust margin for better spacing
    fontFamily: 'Poppins-Medium', // Custom font
  },
  description: {
    fontSize: 20, // Larger font size for readability
    color: '#B0BEC5', // Use a lighter color for contrast
    textAlign: 'center',
    marginBottom: 30, // Adjust margin for spacing
    fontFamily: 'Poppins-Regular', // Custom font
  },
  button: {
    backgroundColor: '#6C5CE7', // Accent color for the button
    paddingVertical: 15, // Increased padding for a more modern button
    paddingHorizontal: 40, // Adjusted padding for a balanced look
    borderRadius: 25, // More rounded corners
    shadowColor: '#000', // Add shadow for a subtle 3D effect
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5, // Shadow for Android
  },
  buttonText: {
    fontSize: 24, // Larger font size for button text
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium', // Custom font
  },
});

export default WelcomeScreen;
