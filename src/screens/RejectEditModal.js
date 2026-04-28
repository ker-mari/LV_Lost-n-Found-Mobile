import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

const RejectEditModal = ({ visible, onClose, onConfirmReject }) => {
  const [rejectReason, setRejectReason] = useState('');

  const handleConfirm = () => {
    onConfirmReject(rejectReason);
    setRejectReason('');
    onClose();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <LinearGradient colors={gradients.cancelModal} style={styles.modalContainer}>
          <View style={styles.content}>
            <Text style={styles.titleText}>Reject Edit</Text>
            <Text style={styles.subText}>Please provide a reason for rejecting this edit (optional):</Text>
            <TextInput
              style={styles.textInputArea}
              placeholder="Enter your comment here..."
              placeholderTextColor="#888"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonTextBlack}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.buttonTextWhite}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 380, borderRadius: 35, paddingVertical: 30, paddingHorizontal: 25, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 8 },
  content: { alignItems: 'center' },
  titleText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  subText: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 20 },
  textInputArea: { width: '100%', backgroundColor: 'white', borderRadius: 15, borderWidth: 1, borderColor: '#ccc', padding: 15, fontSize: 14, color: '#333', minHeight: 100, marginBottom: 30 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 15 },
  cancelButton: { backgroundColor: '#e0e0e0', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, minWidth: 120, alignItems: 'center' },
  confirmButton: { backgroundColor: '#d31a1a', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, minWidth: 160, alignItems: 'center' },
  buttonTextBlack: { color: 'black', fontSize: 16, fontWeight: 'bold' },
  buttonTextWhite: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default RejectEditModal;
