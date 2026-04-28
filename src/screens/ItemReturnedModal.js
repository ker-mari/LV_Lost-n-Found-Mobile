import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';

const ItemReturnedModal = ({ visible, onClose, onViewHistory }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.messageText}>
            Item successfully returned to owner, and currently visible in History Page
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.historyButton} onPress={onViewHistory}>
              <Text style={styles.historyText}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 35, paddingVertical: 35, paddingHorizontal: 20, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#32d74b', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  checkMark: { fontSize: 30, color: '#32d74b', fontWeight: 'bold' },
  messageText: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 30, lineHeight: 22, paddingHorizontal: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', width: '100%', gap: 12 },
  closeButton: { flex: 1, paddingVertical: 14, borderRadius: 25, borderWidth: 1.5, borderColor: '#ff6b6b', alignItems: 'center' },
  closeText: { color: '#ff6b6b', fontWeight: 'bold', fontSize: 15 },
  historyButton: { flex: 1.5, backgroundColor: '#053e5a', paddingVertical: 14, borderRadius: 25, alignItems: 'center' },
  historyText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});

export default ItemReturnedModal;
