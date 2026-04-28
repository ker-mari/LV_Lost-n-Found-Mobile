import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';

const parseDate = (dateString) => {
  if (!dateString) return null;
  const clean = dateString.toString().replace('Z', '').replace('T', ' ');
  const parts = clean.split(/[\s-:]/);
  if (parts.length < 3) return null;
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]),
    parseInt(parts[3] || 0), parseInt(parts[4] || 0), parseInt(parts[5] || 0));
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = parseDate(dateString);
  if (!date || isNaN(date.getTime())) return dateString;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} at ${String(hours).padStart(2,'0')}:${minutes} ${ampm}`;
};

const getDaysPassed = (dateString) => {
  if (!dateString) return 'N/A';
  const date = parseDate(dateString);
  if (!date || isNaN(date.getTime())) return 'N/A';
  const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
  return `${diff} ${diff === 1 ? 'day' : 'days'}`;
};

const ItemSummaryModal = ({ visible, item, onClose, onClear }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalView}>

          <View style={styles.header}>
            <Text style={styles.titleText}>Item's Information</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Close </Text>
              <View style={styles.closeIconCircle}>
                <Text style={styles.xIcon}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>ITEM NO. {item?.id || item?._id || 'N/A'}</Text>
            <Text style={styles.blueValue}>{item?.category || item?.name || 'N/A'}</Text>

            <Text style={styles.label}>Location Found</Text>
            <Text style={styles.blueValue}>{item?.location_found || item?.location || 'N/A'}</Text>

            <Text style={styles.label}>Date and Time</Text>
            <Text style={styles.blueValue}>{formatDateTime(item?.date_time || item?.date || item?.created_at)}</Text>

            <View style={styles.divider} />

            <Text style={styles.label}>Description</Text>
            <Text style={styles.blueValue}>{item?.description || 'No description provided'}</Text>

            <Text style={[styles.label, { marginTop: 20 }]}>Days Passed</Text>
            <Text style={styles.blueValue}>{getDaysPassed(item?.date_time || item?.date || item?.created_at)}</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={onClear}>
              <Text style={styles.clearButtonText}>Clear Item</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalView: { width: '100%', backgroundColor: 'white', borderRadius: 35, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  titleText: { fontSize: 20, fontWeight: 'bold', color: '#053e5a' },
  closeButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'red', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  closeText: { color: 'red', fontWeight: 'bold', fontSize: 12 },
  closeIconCircle: { backgroundColor: 'red', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  xIcon: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  content: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 12 },
  blueValue: { fontSize: 14, color: '#053e5a', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 15 },
  footer: { alignItems: 'flex-end', marginTop: 10 },
  clearButton: { backgroundColor: '#053e5a', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20 },
  clearButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});

export default ItemSummaryModal;
