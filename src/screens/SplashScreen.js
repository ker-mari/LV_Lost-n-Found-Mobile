import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Montserrat_300Light } from '@expo-google-fonts/montserrat/300Light';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat/700Bold';

export default function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  const [fontsLoaded] = useFonts({ 'Montserrat_300Light': Montserrat_300Light, 'Montserrat_700Bold': Montserrat_700Bold });

  useEffect(() => {
    if (!fontsLoaded) return;
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => navigation.replace('Welcome'));
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={['#002D52', '#16487d']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Image source={require('../../assets/LV-Logo.png')} style={styles.logo} />
        <Text style={styles.title}>La Verdad</Text>
        <Text style={styles.subtitle}>Lost & Found</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  logo: { width: 200, height: 200, borderRadius: 80, marginBottom: 24 },
  title: { fontSize: 28, fontFamily: 'Montserrat_700Bold', color: '#FFF', letterSpacing: 1 },
  subtitle: { fontSize: 14, fontFamily: 'Montserrat_300Light', color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginTop: 6 },
});
