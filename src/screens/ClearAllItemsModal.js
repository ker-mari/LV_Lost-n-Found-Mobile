import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ClearAllItemsModal = ({ visible, onCancel, onConfirm, title = 'Are you sure you want to clear all items?' }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <LinearGradient colors={['#fdfcf0', '#e3d8a5']} style={styles.modalContainer}>
          <View style={styles.content}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.subText}>This action cannot be undone.</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 380, borderRadius: 40, paddingVertical: 45, paddingHorizontal: 25, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
  content: { alignItems: 'center' },
  titleText: { fontSize: 16, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 5 },
  subText: { fontSize: 14, fontWeight: '600', color: '#333333ce', textAlign: 'center', marginBottom: 35 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 15 },
  cancelButton: { backgroundColor: '#e0e0e0', paddingVertical: 12, paddingHorizontal: 35, borderRadius: 25, minWidth: 110, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  cancelButtonText: { color: '#1a1a1a', fontSize: 16, fontWeight: 'bold' },
  confirmButton: { backgroundColor: '#d31a1a', paddingVertical: 12, paddingHorizontal: 35, borderRadius: 25, minWidth: 110, alignItems: 'center' },
  confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default ClearAllItemsModal;
