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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postData } from '../api';
import ErrorPinModal from './ErrorPinModal';
import { colors, gradients } from '../theme';

export default function PinScreen({ navigation }) {
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleProceed = async () => {
    if (!pin) {
      setShowError(true);
      return;
    }

    if (pin.length < 4 || pin.length > 10) {
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      // Capture the response from the backend
      const response = await postData('/api/auth/verify-pin', { pin });

      console.log("Login Success:", response);

      // Save the token to local storage. 
      // We check multiple common key names just in case your backend uses a different one!
      let token = response.auth_token || response.token || response.access_token || response.data?.token || response.user?.token;

      // If Laravel returned a token object instead of a string, extract the plain text:
      if (token && typeof token === 'object') {
        token = token.plainTextToken || token.token || String(token);
      }

      if (token) {
        await AsyncStorage.setItem('userToken', token);

        if (response.user_name) {
          await AsyncStorage.setItem('userName', response.user_name);
        }

        const isAdminUser = response.is_admin || response.user?.is_admin || response.role === 'admin';
        await AsyncStorage.setItem('isAdmin', isAdminUser ? 'true' : 'false');

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
      // Only log the error if it's not a 401 (which is expected for an invalid PIN)
      if (error.message && !error.message.includes('401')) {
        console.error("Verification Error:", error);
      }
      setShowError(true);
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
          <LinearGradient colors={gradients.main} style={styles.gradient}>

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
                    source={require('../../assets/LV-Logo.png')}
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
                style={[styles.proceedButton, pin.length > 0 && styles.proceedButtonFilled]}
                onPress={handleProceed}
                disabled={loading || pin.length === 0}
              >
                {loading ? (
                  <ActivityIndicator color={pin.length > 0 ? "#FFF" : "#003366"} />
                ) : (
                  <Text style={[styles.proceedText, pin.length > 0 && styles.proceedTextFilled]}>Proceed</Text>
                )}
              </TouchableOpacity>
            </View>

          </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <ErrorPinModal 
        visible={showError} 
        onClose={() => setShowError(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: colors.primary },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: colors.textWhite, fontSize: 14, fontWeight: 'bold' },
  gradient: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 40, justifyContent: 'center' },
  imageContainer: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  blueShape: { width: 180, height: 180, backgroundColor: colors.primary, borderRadius: 50, transform: [{ rotate: '15deg' }] },
  circleImageWrapper: { position: 'absolute', top: 20, right: 10, width: 130, height: 130, borderRadius: 65, borderWidth: 4, borderColor: colors.gold, overflow: 'hidden' },
  campusImage: { width: '100%', height: '100%' },
  textContainer: { alignItems: 'center', marginBottom: 25 },
  mainTitle: { fontSize: 24, fontWeight: '900', color: colors.primary, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, color: colors.textDark, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 30, width: '100%', height: 50, paddingHorizontal: 25, marginBottom: 15, elevation: 5, shadowColor: colors.textDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  input: { flex: 1, fontSize: 14, color: colors.textDark },
  eyeIcon: { paddingLeft: 10 },
  proceedButton: { width: '100%', height: 50, borderRadius: 25, borderWidth: 2, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  proceedButtonFilled: { backgroundColor: colors.primary },
  proceedText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  proceedTextFilled: { color: colors.textWhite },
}); 