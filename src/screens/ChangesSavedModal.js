import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';

const ChangesSavedModal = ({ visible, onContinue, title = 'Changes Saved!', subtitle = 'Item has been updated successfully.' }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.mainTitle}>{title}</Text>
          <Text style={styles.subTitle}>{subtitle}</Text>
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 40, paddingVertical: 45, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#053e5a', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  checkMark: { fontSize: 28, color: '#053e5a', fontWeight: 'bold' },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 8 },
  subTitle: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 35 },
  continueButton: { backgroundColor: '#053e5a', paddingVertical: 15, paddingHorizontal: 60, borderRadius: 30, minWidth: '50%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default ChangesSavedModal;
