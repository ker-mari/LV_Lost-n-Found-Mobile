import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HandOverForm() {
  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/40' }} 
            style={styles.logoSmall} 
          />
          <Text style={styles.headerTitle}>
            LA VERDAD <Text style={{fontWeight: '300'}}>LOST N FOUND</Text>
          </Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageTitle}>HAND OVER FORM</Text>

          {/* Main Form Card */}
          <View style={styles.card}>
            
            {/* Form Header */}
            <View style={styles.formHeader}>
              <View>
                <Text style={styles.sectionTitle}>Finder’s Information</Text>
                <Text style={styles.sectionSubtitle}>(Detalye ng nakakita)</Text>
              </View>
              <View style={styles.onDutyBadge}>
                <Text style={styles.onDutyText}>ON DUTY: Mrs. Laura Sabillon</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Form Fields - Two Column Layout */}
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Finder’s Name</Text>
                <Text style={styles.subLabel}>(Detalye ng nakakita)</Text>
                <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#C7C7CD" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Finder’s ID Number</Text>
                <Text style={styles.subLabel}>(ID Number ng nakakita)</Text>
                <TextInput style={styles.input} placeholder="Enter your ID" placeholderTextColor="#C7C7CD" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Grade Section/Course/Role</Text>
                <Text style={styles.subLabel}>(Baitang - Seksyon/Kurso/Katungkulan)</Text>
                <TextInput style={styles.input} placeholder="Enter your grade/course/role" placeholderTextColor="#C7C7CD" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Item Category</Text>
                <Text style={styles.subLabel}>(Kategorya ng item)</Text>
                <TextInput style={styles.input} placeholder="Item" placeholderTextColor="#C7C7CD" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location Found</Text>
                <Text style={styles.subLabel}>(Lokasyon kung saan nakita)</Text>
                <TextInput style={styles.input} placeholder="Location" placeholderTextColor="#C7C7CD" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date and Time</Text>
                <Text style={styles.subLabel}>(Petsa at Oras)</Text>
                <TextInput style={styles.input} value="03/23/26 12:36 AM" editable={false} />
              </View>
            </View>

            {/* Description and Photo Section */}
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.subLabel}>(Ilarawan o i-describe ang item)</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="Please provide a description of the item" 
                  placeholderTextColor="#C7C7CD"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Item Photo</Text>
                <Text style={styles.subLabel}>(Larawan ng item)</Text>
                <TouchableOpacity style={styles.photoButton}>
                  <Ionicons name="camera-outline" size={20} color="#0056A0" />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.divider, { marginTop: 30 }]} />

            {/* Footer Buttons */}
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitText}>Submit</Text>
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
  header: { backgroundColor: '#002D52', paddingTop: 40 },
  headerContent: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  
  scrollContent: { paddingBottom: 40 },
  pageTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginVertical: 25 },
  
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    borderRadius: 30,
    padding: 20,
    minHeight: 600,
  },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#004A8D' },
  sectionSubtitle: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  
  onDutyBadge: { backgroundColor: '#98D8E9', padding: 8, borderRadius: 5, maxWidth: '45%' },
  onDutyText: { fontSize: 10, fontWeight: 'bold', color: '#003366' },
  
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  inputGroup: { width: '48%' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  subLabel: { fontSize: 10, color: '#999', fontStyle: 'italic', marginBottom: 5 },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 35,
    fontSize: 11,
    color: '#333',
  },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 10 },
  
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0056A0',
    borderRadius: 20,
    height: 40,
    marginTop: 10,
  },
  photoButtonText: { color: '#0056A0', fontWeight: 'bold', marginLeft: 8, fontSize: 12 },
  
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20 },
  cancelButton: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  cancelText: { fontWeight: 'bold', color: '#000' },
  submitButton: {
    backgroundColor: '#9FB6D4',
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  submitText: { fontWeight: 'bold', color: '#FFF' },
});