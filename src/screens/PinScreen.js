import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. Import AsyncStorage
import { postData } from '../api';

export default function PinScreen({ navigation }) {
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    if (!pin) {
      Alert.alert('Error', 'Please enter a PIN.');
      return;
    }

    setLoading(true);
    try {
      // 2. Capture the response from the backend
      const response = await postData('/api/auth/verify-pin', { pin });

      console.log("Login Success:", response);

      // 3. CRITICAL: Save the token to local storage. 
      // We check multiple common key names just in case your backend uses a different one!
      let token = response.auth_token || response.token || response.access_token || response.data?.token || response.user?.token;

      // If Laravel returned a token object instead of a string, extract the plain text:
      if (token && typeof token === 'object') {
        token = token.plainTextToken || token.token || String(token);
      }

      if (token) {
        await AsyncStorage.setItem('userToken', token);

        // Optional: Save user name if you want to show "Welcome, [Name]"
        if (response.user_name) {
          await AsyncStorage.setItem('userName', response.user_name);
        }

        // ALWAYS save the raw PIN.
        await AsyncStorage.setItem('userPin', pin);
        
        // Navigate to dashboard ONLY if we have a token
        navigation.navigate('Dashboard');
      } else {
        console.log("Backend Response missing token:", response);
        Alert.alert(
          "Backend Fix Required", 
          "Your Laravel backend did not return an authentication token. Please ask your backend developer to return a token in the verify-pin response."
        );
        return; // STOP the user from entering a broken session
      }

    } catch (error) {
      console.error("Verification Error:", error);
      Alert.alert('Verification Failed', error.message || 'Invalid PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <LinearGradient colors={['#E0EAFC', '#3f6b8e']} style={styles.gradient}>

            <View style={styles.headerContent}>
              <Image
                source={require('../../assets/LV-Logo.png')}
                style={styles.logoSmall}
              />
              <Text style={styles.headerTitle}>
                LA VERDAD <Text style={{ fontWeight: '300' }}>LOST N FOUND</Text>
              </Text>
            </View>

            <View style={styles.content}>
              <View style={styles.imageContainer}>
                <View style={styles.blueShape} />
                <View style={styles.circleImageWrapper}>
                  <Image
                    source={require('../../assets/school.png')}
                    style={styles.campusImage}
                  />
                </View>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.mainTitle}>Together, we bring{"\n"}things back!</Text>
                <Text style={styles.subtitle}>
                  Found or lost something?{"\n"}
                  Don't worry — help is just a click away!
                </Text>
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="ENTER PIN:"
                  placeholderTextColor="#999"
                  secureTextEntry={!isPinVisible}
                  keyboardType="numeric"
                  value={pin}
                  onChangeText={setPin}
                />

                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsPinVisible(!isPinVisible)}
                >
                  <Ionicons
                    name={isPinVisible ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.proceedButton}
                onPress={handleProceed}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#003366" />
                ) : (
                  <Text style={styles.proceedText}>Proceed</Text>
                )}
              </TouchableOpacity>
            </View>

          </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#002D52' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#002D52' },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  gradient: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 40, justifyContent: 'center' },
  imageContainer: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  blueShape: { width: 140, height: 140, backgroundColor: '#003366', borderRadius: 40, transform: [{ rotate: '15deg' }] },
  circleImageWrapper: { position: 'absolute', top: 5, right: -5, width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#FFEA00', overflow: 'hidden' },
  campusImage: { width: '100%', height: '100%' },
  textContainer: { alignItems: 'center', marginBottom: 25 },
  mainTitle: { fontSize: 24, fontWeight: '900', color: '#003366', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 13, color: '#333', textAlign: 'center', lineHeight: 18 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 30,
    width: '100%',
    height: 50,
    paddingHorizontal: 25,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  input: { flex: 1, fontSize: 14, color: '#000' },
  eyeIcon: { paddingLeft: 10 },
  proceedButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#003366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedText: { color: '#003366', fontSize: 16, fontWeight: '600' },
}); 