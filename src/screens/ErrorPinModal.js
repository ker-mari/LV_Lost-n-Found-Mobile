import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
// Note: If not using Expo, use 'react-native-linear-gradient'
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

const ErrorPinModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* The Modal Container with Gradient */}
        <LinearGradient
          colors={gradients.cancelModal}
          style={styles.modalContainer}
        >
          <View style={styles.content}>
            <Text style={styles.titleText}>Incorrect PIN entered.</Text>
            <Text style={styles.subText}>
              Please check your PIN and try again.
            </Text>

            {/* Red Action Button */}
            <TouchableOpacity 
              style={styles.tryAgainButton} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Light dim for the background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 40, // Extra rounded corners as seen in the image
    paddingVertical: 40,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  content: { alignItems: 'center' },
  titleText: { fontSize: 18, fontWeight: '600', color: '#444', textAlign: 'center', marginBottom: 4 },
  subText: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 25 },
  tryAgainButton: {
    backgroundColor: '#d31a1a', // Vibrant red
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default ErrorPinModal;