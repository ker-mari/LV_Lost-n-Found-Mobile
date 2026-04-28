import React from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AllClearedSuccessModal = ({ visible }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <LinearGradient colors={['#fdfcf0', '#e3d8a5']} style={styles.modalContainer}>
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <Text style={styles.messageText}>All items cleared successfully.</Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalContainer: { width: '100%', maxWidth: 340, borderRadius: 45, paddingVertical: 50, paddingHorizontal: 20, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  content: { alignItems: 'center' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 3.5, borderColor: '#32d74b', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  checkMark: { fontSize: 30, color: '#32d74b', fontWeight: 'bold' },
  messageText: { fontSize: 18, fontWeight: '600', color: '#444', textAlign: 'center' },
});

export default AllClearedSuccessModal;
