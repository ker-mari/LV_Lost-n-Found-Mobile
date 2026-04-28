import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';

const MissingFieldsModal = ({ visible, onClose }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>Missing Fields</Text>
          <Text style={styles.subtitle}>Please fill in all required fields indicated in red.</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 30, paddingVertical: 35, paddingHorizontal: 20, alignItems: 'center', elevation: 5 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: '#d31a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  iconText: { color: '#d31a1a', fontSize: 35, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 25 },
  closeButton: { backgroundColor: '#d31a1a', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  closeText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});

export default MissingFieldsModal;
