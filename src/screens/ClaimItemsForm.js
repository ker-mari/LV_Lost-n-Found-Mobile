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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postData } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClaimForm({ route, navigation }) {
  // Get the item data passed from ViewItemScreen
  const itemData = route.params?.itemData || {};

  const [formData, setFormData] = useState({
    ownerName: '',
    role: '',
    ownerId: ''
  });
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const loadAdminName = async () => {
      const name = await AsyncStorage.getItem('userName');
      if (name) setAdminName(name);
    };
    loadAdminName();
  }, []);

  const handleSubmit = async () => {
    if (!formData.ownerName || !formData.role) {
      Alert.alert("Missing Fields", "Please enter the owner's name and role.");
      return;
    }

    setLoading(true);
    try {
      const itemId = itemData.id || itemData._id;
      await postData(`/api/items/${itemId}/claim`, {
        owner_name: formData.ownerName,
        role: formData.role,
        owner_id: formData.ownerId
      });
      
      Alert.alert("Success", "Claim submitted for approval!");
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to submit claim.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Image source={require('../../assets/school.png')} style={styles.logoSmall} />
          <Text style={styles.headerTitle}>LA VERDAD <Text style={{fontWeight: '300'}}>LOST N FOUND</Text></Text>
        </View>
      </SafeAreaView>

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
              <Text style={styles.infoValue}>{itemData.date || itemData.created_at || 'N/A'}</Text>

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
              <Text style={styles.label}>Owner’s Name <Text style={styles.subLabel}>(Pangalan)</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter owner's name" 
                placeholderTextColor="#C7C7CD" 
                value={formData.ownerName}
                onChangeText={(text) => setFormData({...formData, ownerName: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grade Section/Course/Role <Text style={styles.subLabel}>(Baitang/Course/Katungkulan)</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter grade/course or role" 
                placeholderTextColor="#C7C7CD"
                value={formData.role}
                onChangeText={(text) => setFormData({...formData, role: text})} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner's ID</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter owner's ID" 
                placeholderTextColor="#C7C7CD" 
                value={formData.ownerId}
                onChangeText={(text) => setFormData({...formData, ownerId: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date and Time of Claim <Text style={styles.subLabel}>(Petsa at Oras ng Pag-claim)</Text></Text>
              <TextInput style={[styles.input, {backgroundColor: '#F0F2F5'}]} value={new Date().toLocaleString()} editable={false} />
            </View>

            {/* Footer Buttons */}
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Submit</Text>}
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#003366' },
  header: { backgroundColor: '#002D52' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  
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
  
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 30 },
  cancelButton: { borderWidth: 2, borderColor: '#000', borderRadius: 25, paddingHorizontal: 35, paddingVertical: 10 },
  cancelText: { fontWeight: 'bold', color: '#000' },
  submitButton: { backgroundColor: '#9FB6D4', borderRadius: 25, paddingHorizontal: 35, paddingVertical: 10 },
  submitText: { fontWeight: 'bold', color: '#FFF' },
});