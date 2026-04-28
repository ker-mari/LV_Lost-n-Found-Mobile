import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Image
            source={require('../../assets/LV-Logo.png')}
            style={styles.logoSmall}
          />
          <Text style={styles.headerTitle}>
            LA VERDAD <Text style={{ fontWeight: '300' }}>LOST N FOUND</Text>
          </Text>
        </View>
      </SafeAreaView>

      {/* Main Background Gradient */}
      <LinearGradient
        colors={gradients.main}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>

          {/* Hero Illustration Area */}
          <View style={styles.imageContainer}>
            {/* The Navy Blue Squircle Background */}
            <View style={styles.blueShape} />
            {/* Circular Campus Image */}
            <View style={styles.circleImageWrapper}>
              <Image
                source={require('../../assets/school.png')} // Replace with campus image
                style={styles.campusImage}
              />
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>Welcome to La Verdad</Text>
            <Text style={styles.mainTitle}>LOST AND FOUND</Text>

            <Text style={styles.description}>
              Lost something or found an item on campus? 
              We're here to help reunite people and their belongings.
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Pin')}
          >
            <Text style={styles.buttonText}>Get Started!</Text>
          </TouchableOpacity>

        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: colors.primary },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: colors.textWhite, fontSize: 14, fontWeight: 'bold' },
  gradientBackground: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  imageContainer: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  blueShape: { width: 180, height: 180, backgroundColor: colors.primary, borderRadius: 50, transform: [{ rotate: '15deg' }] },
  circleImageWrapper: { position: 'absolute', top: 20, right: 10, width: 130, height: 130, borderRadius: 65, borderWidth: 4, borderColor: colors.gold, overflow: 'hidden' },
  campusImage: { width: '100%', height: '100%' },
  textContainer: { alignItems: 'center', marginBottom: 50 },
  welcomeText: { fontSize: 18, color: colors.primary, marginBottom: 5 },
  mainTitle: { fontSize: 28, fontWeight: '900', color: colors.primary, marginBottom: 20, textAlign: 'center' },
  description: { fontSize: 14, color: colors.textPrimary, textAlign: 'center', lineHeight: 20 },
  button: { backgroundColor: colors.primary, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, width: '80%', alignItems: 'center', elevation: 5, shadowColor: colors.textDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  buttonText: { color: colors.textWhite, fontSize: 16, fontWeight: 'bold' },
});