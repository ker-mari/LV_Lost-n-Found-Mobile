import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postData } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CancelConfirmationModal from './CancelConfirmationModal';
import ItemReturnedModal from './ItemReturnedModal';
import MissingFieldsModal from './MissingFieldsModal';

// Helper to format stored date strings
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString.replace(' ', 'T')); 
  if (isNaN(date.getTime())) return dateString;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours || 12;
  const strHours = String(hours).padStart(2, '0');
  
  return `${month} ${day}, ${year} at ${strHours}:${minutes} ${ampm}`;
};

// Helper to get current datetime formatted
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[now.getMonth()];
  const day = String(now.getDate()).padStart(2, '0');
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours || 12;
  const strHours = String(hours).padStart(2, '0');
  return `${month} ${day}, ${year} at ${strHours}:${minutes} ${ampm}`;
};

export default function ClaimForm({ route, navigation }) {
  // Get the item data passed from ViewItemScreen
  const itemData = route.params?.itemData || {};

  const [formData, setFormData] = useState({
    ownerName: '',
    role: '',
    ownerId: ''
  });
  const [errors, setErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    const loadAdminName = async () => {
      const name = await AsyncStorage.getItem('userName');
      if (name) setAdminName(name);
    };
    loadAdminName();
  }, []);

  const isFormComplete = formData.ownerName.trim() !== '' && formData.role.trim() !== '' && formData.ownerId.trim() !== '';

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.ownerName) newErrors.ownerName = true;
    if (!formData.role) newErrors.role = true;
    if (!formData.ownerId) newErrors.ownerId = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      const itemId = itemData.id || itemData._id;
      
      if (!itemId) {
        Alert.alert("Invalid Item", "No item ID found. Cannot submit the claim.");
        setLoading(false);
        return;
      }

      // Format date for Laravel (YYYY-MM-DD HH:MM:SS)
      const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await postData(`/api/items/${itemId}/claim`, {
        owner: formData.ownerName,
        claimer_name: formData.ownerName,
        claimer_grade: formData.role,
        claimer_id: formData.ownerId,
        claim_date: currentDateTime
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Claim Submission Error:", error);
      if (error.message && error.message.includes('401')) {
        await AsyncStorage.clear();
        setErrorModal({ visible: true, title: 'Session Expired', message: 'Your session has expired. Please log in again.' });
      } else if (error.message && error.message.includes('404')) {
        setErrorModal({ visible: true, title: 'Endpoint Not Found', message: 'The claim route does not exist. Please contact support.' });
      } else if (error.message && error.message.includes('405')) {
        setErrorModal({ visible: true, title: 'Method Not Allowed', message: 'The backend route does not support this request.' });
      } else if (error.message && error.message.includes('429')) {
        setErrorModal({ visible: true, title: 'Too Many Requests', message: 'You have submitted too many requests. Please wait a moment and try again.' });
      } else {
        setErrorModal({ visible: true, title: 'Submission Failed', message: error.message || 'Failed to submit claim.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Image source={require('../../assets/LV-Logo.png')} style={styles.logoSmall} />
          <Text style={styles.headerTitle}>LA VERDAD <Text style={{fontWeight: '300'}}>LOST N FOUND</Text></Text>
        </View>
      </SafeAreaView>

      <View style={styles.solidBackground}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

          <Text style={styles.pageTitle}>CLAIM FORM</Text>

          {/* Main Card */}
          <View style={styles.card}>
            
            {/* Item Information Section (Read Only) */}
            <View style={styles.formHeader}>
              <View>
                <Text style={styles.sectionTitle}>Item’s Information</Text>
                <Text style={styles.sectionSubtitle}>(Detalye ng item)</Text>
              </View>
              <View style={styles.onDutyBadge}>
                <Text style={styles.onDutyText}>ON DUTY: {adminName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>Item No.: <Text style={styles.infoValue}>{itemData.id || itemData._id || 'N/A'}</Text></Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>Category: <Text style={styles.infoValue} numberOfLines={1}>{itemData.category || 'N/A'}</Text></Text>
                </View>
              </View>

              <Text style={styles.infoLabel}>Date and Time <Text style={styles.infoSubLabel}>(Araw at Oras nung nakita)</Text></Text>
              <Text style={styles.infoValue}>{formatDateTime(itemData.date || itemData.created_at)}</Text>

              <Text style={[styles.infoLabel, {marginTop: 10}]}>Location Found</Text>
              <Text style={styles.infoValue}>{itemData.location_found || itemData.location || 'N/A'}</Text>

              <Text style={[styles.infoLabel, {marginTop: 10}]}>Officer:</Text>
              <Text style={styles.infoValue}>{adminName}</Text>

              <Text style={[styles.infoLabel, {marginTop: 10}]}>Description</Text>
              <Text style={styles.infoValue}>{itemData.description || 'No description provided'}</Text>
            </View>

            <View style={[styles.divider, { marginVertical: 25 }]} />

            {/* Owner's Information Section (Input) */}
            <Text style={styles.sectionTitle}>Owner’s Information</Text>
            <Text style={styles.sectionSubtitle}>(Detalye ng may-ari o kukuha ng item)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner’s Name<Text style={styles.required}>*</Text> <Text style={styles.subLabel}>(Pangalan)</Text></Text>
              <TextInput 
                style={[styles.input, errors.ownerName && styles.inputError]} 
                placeholder="Enter owner's name" 
                placeholderTextColor="#C7C7CD" 
                value={formData.ownerName}
                onChangeText={(text) => { setFormData({...formData, ownerName: text}); setErrors(prev => ({...prev, ownerName: false})); }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grade Section/Course/Role<Text style={styles.required}>*</Text> <Text style={styles.subLabel}>(Baitang/Course/Katungkulan)</Text></Text>
              <TextInput 
                style={[styles.input, errors.role && styles.inputError]} 
                placeholder="Enter grade/course or role" 
                placeholderTextColor="#C7C7CD"
                value={formData.role}
                onChangeText={(text) => { setFormData({...formData, role: text}); setErrors(prev => ({...prev, role: false})); }} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner's ID<Text style={styles.required}>*</Text> <Text style={styles.subLabel}>(ID number ng may-ari)</Text></Text>
              <TextInput 
                style={[styles.input, errors.ownerId && styles.inputError]} 
                placeholder="Enter owner's ID" 
                placeholderTextColor="#C7C7CD" 
                value={formData.ownerId}
                onChangeText={(text) => { setFormData({...formData, ownerId: text}); setErrors(prev => ({...prev, ownerId: false})); }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date and Time of Claim <Text style={styles.subLabel}>(Petsa at Oras ng Pag-claim)</Text></Text>
              <TextInput style={[styles.input, {backgroundColor: '#F0F2F5'}]} value={getCurrentDateTime()} editable={false} />
            </View>

            {/* Footer Buttons */}
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCancelModal(true)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, isFormComplete && { backgroundColor: '#0056b3' }]} 
                onPress={handleSubmit} 
                disabled={loading || !isFormComplete}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Submit</Text>}
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <MissingFieldsModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal 
        visible={showCancelModal}
        onStay={() => setShowCancelModal(false)}
        onCancel={() => {
          setShowCancelModal(false);
          navigation.goBack();
        }}
      />

      <ItemReturnedModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.replace('Dashboard');
        }}
        onViewHistory={() => {
          setShowSuccessModal(false);
          navigation.replace('History');
        }}
      />

      <Modal animationType="fade" transparent={true} visible={errorModal.visible} onRequestClose={() => setErrorModal({ ...errorModal, visible: false })}>
        <View style={styles.modalOverlay}>
          <View style={styles.errorModalContainer}>
            <View style={styles.errorIconCircle}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorMainTitle}>{errorModal.title}</Text>
            <Text style={styles.errorSubTitle}>{errorModal.message}</Text>
            <TouchableOpacity
              style={styles.errorCloseButton}
              onPress={() => {
                setErrorModal({ ...errorModal, visible: false });
                if (errorModal.title === 'Session Expired') navigation.replace('Welcome');
              }}
            >
              <Text style={styles.errorButtonText}>{errorModal.title === 'Session Expired' ? 'Log In Again' : 'Close'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#002D52' },
  header: { backgroundColor: '#002D52' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  solidBackground: { flex: 1, backgroundColor: '#003b6f' },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  
  scrollContent: { paddingBottom: 40 },
  backButton: { backgroundColor: '#007AFF', paddingHorizontal: 25, paddingVertical: 8, borderRadius: 15, alignSelf: 'flex-start', marginHorizontal: 20, marginTop: 15 },
  backButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  pageTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginVertical: 20 },
  
  card: { backgroundColor: '#FFF', marginHorizontal: 15, borderRadius: 30, padding: 25, minHeight: 700 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#004A8D' },
  sectionSubtitle: { fontSize: 11, color: '#999', fontStyle: 'italic' },
  onDutyBadge: { backgroundColor: '#98D8E9', padding: 8, borderRadius: 5, maxWidth: '40%' },
  onDutyText: { fontSize: 9, fontWeight: 'bold', color: '#003366' },
  
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  
  // Read Only Info Styles
  infoGrid: { marginTop: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoColumn: { width: '48%' },
  infoLabel: { fontSize: 12, fontWeight: 'bold', color: '#004A8D' },
  infoSubLabel: { fontSize: 10, color: '#999', fontWeight: 'normal' },
  infoValue: { fontSize: 12, color: '#333', marginTop: 2 },

  // Input Styles
  inputGroup: { marginTop: 15 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  subLabel: { fontSize: 10, color: '#999', fontStyle: 'italic' },
  input: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 12, height: 40, fontSize: 12, marginTop: 5, color: '#333' },
  inputError: { borderColor: '#FF4D4D', backgroundColor: '#FFF0F0' },
  required: { color: 'red' },
  
  // Error Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorModalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 30, paddingVertical: 35, paddingHorizontal: 20, alignItems: 'center', elevation: 5 },
  errorIconCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: '#d31a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  errorIconText: { color: '#d31a1a', fontSize: 35, fontWeight: 'bold' },
  errorMainTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  errorSubTitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 25 },
  errorCloseButton: { backgroundColor: '#d31a1a', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  errorButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 30 },
  cancelButton: { borderWidth: 2, borderColor: '#000', borderRadius: 25, paddingHorizontal: 35, paddingVertical: 10 },
  cancelText: { fontWeight: 'bold', color: '#000' },
  submitButton: { backgroundColor: '#9FB6D4', borderRadius: 25, paddingHorizontal: 35, paddingVertical: 10 },
  submitText: { fontWeight: 'bold', color: '#FFF' },
});