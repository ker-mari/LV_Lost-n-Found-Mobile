import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

const CancelConfirmationModal = ({ visible, onStay, onCancel }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onStay}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={gradients.cancelModal}
          style={styles.modalContainer}
        >
          <View style={styles.content}>
            <Text style={styles.titleText}>Are you sure you want to cancel?</Text>
            <Text style={styles.subText}>All entered data will be lost.</Text>

            <View style={styles.buttonRow}>
              {/* Stay Button */}
              <TouchableOpacity 
                style={styles.stayButton} 
                onPress={onStay}
              >
                <Text style={styles.stayButtonText}>Stay</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel Form</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 40,
    paddingVertical: 45,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  content: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    marginBottom: 4,
  },
  subText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  stayButton: {
    backgroundColor: '#e0e0e0', // Light grey
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 100,
    alignItems: 'center',
  },
  stayButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#d31a1a', // Red
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 140,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CancelConfirmationModal;