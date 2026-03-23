import React, { useState } from 'react'; // 1. Import useState
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function PinScreen() {
  // 2. Create state to track visibility
  const [isPinVisible, setIsPinVisible] = useState(false);

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
                source={{ uri: 'https://via.placeholder.com/40' }} 
                style={styles.logoSmall} 
              />
              <Text style={styles.headerTitle}>
                LA VERDAD <Text style={{fontWeight: '300'}}>LOST N FOUND</Text>
              </Text>
            </View>

            <View style={styles.content}>
              {/* Illustration Section */}
              <View style={styles.imageContainer}>
                <View style={styles.blueShape} />
                <View style={styles.circleImageWrapper}>
                  <Image 
                    source={{ uri: 'https://via.placeholder.com/150' }} 
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

              {/* 3. Input Field with Logic */}
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input} 
                  placeholder="ENTER PIN:" 
                  placeholderTextColor="#999"
                  // Use the state here: if isPinVisible is true, secureTextEntry is false
                  secureTextEntry={!isPinVisible}
                  keyboardType="numeric"
                />
                
                {/* 4. Toggle Button */}
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setIsPinVisible(!isPinVisible)} // Toggle true/false
                >
                  <Ionicons 
                    // Toggle icon name based on state
                    name={isPinVisible ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.proceedButton}>
                <Text style={styles.proceedText}>Proceed</Text>
              </TouchableOpacity>
            </View>

          </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... styles remain the same as the previous response ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#002D52' },
  headerContent: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#002D52' },
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