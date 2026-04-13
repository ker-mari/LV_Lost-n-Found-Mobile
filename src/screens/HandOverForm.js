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
    Alert,
    ActivityIndicator,
    Modal,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postData } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = [
    'Personal Belongings', 'School Supplies', 'Clothing', 'Accessories',
    'Miscellaneous / Others', 'Documents / Identification', 'Gadgets / Electronics',
    'Money and Payment Items', 'Identification and Wallets', 'Bags and Storage',
    'Jewelry / Valuables'
];

const LOCATIONS = [
    'Auditorium', 'Entrance Lobby', 'Lobby 2 (Lost and Found Location)', 
    'Canteen', 'EFS 1st Floor', 'EFS 2nd Floor', 'EFS 3rd Floor', 'EFS 4th Floor', 
    'DSR 1st Floor', 'DSR 2nd Floor', 'DSR 3rd Floor', 'DSR 4th Floor', 'Others:'
];

const VALUABLE_CATEGORIES = [
    'Gadgets / Electronics', 'Money and Payment Items', 
    'Identification and Wallets', 'Bags and Storage', 'Jewelry / Valuables'
];

// Helper function to get current datetime
const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function HandOverForm({ navigation }) {
    const [formData, setFormData] = useState({
        finderName: '',
        finderId: '',
        gradeCourseRole: '',
        category: 'Item',
        location: 'Location',
        customLocation: '',
        date: getCurrentDateTime(),
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [adminName, setAdminName] = useState('Admin');
    
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        const loadAdminName = async () => {
            const name = await AsyncStorage.getItem('userName');
            if (name) setAdminName(name);
        };
        loadAdminName();
    }, []);

    const onChangeDate = (event, selectedValue) => {
        if (event.type === 'dismissed') {
            setShowPicker(false);
            return;
        }

        const currentDate = selectedValue || date;
        setDate(currentDate);

        const formatted = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        handleInputChange('date', formatted);
        setErrors(prev => ({...prev, date: false}));

        if (Platform.OS === 'android') {
            if (mode === 'date' && event.type === 'set') {
                setShowPicker(false);
                // Slight delay before opening time picker on Android to avoid UI glitches
                setTimeout(() => {
                    setMode('time');
                    setShowPicker(true);
                }, 100);
            } else if (mode === 'time' && event.type === 'set') {
                setShowPicker(false);
            }
        }
    };

    const showMode = (currentMode) => {
        if (Platform.OS === 'ios') {
            setMode('datetime');
        } else {
            setMode(currentMode);
        }
        setShowPicker(true);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isFormComplete = 
        formData.finderName.trim() !== '' &&
        formData.finderId.trim() !== '' &&
        formData.gradeCourseRole.trim() !== '' &&
        formData.category !== 'Item' &&
        formData.location !== 'Location' &&
        (formData.location !== 'Others:' || formData.customLocation.trim() !== '') &&
        formData.date.trim() !== '' &&
        formData.description.trim() !== '';

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.finderName) newErrors.finderName = true;
        if (!formData.finderId) newErrors.finderId = true;
        if (!formData.gradeCourseRole) newErrors.gradeCourseRole = true;
        if (formData.category === 'Item') newErrors.category = true;
        if (formData.location === 'Location') newErrors.location = true;
        if (formData.location === 'Others:' && !formData.customLocation) newErrors.customLocation = true;
        if (!formData.date) newErrors.date = true;
        if (!formData.description) newErrors.description = true;

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            Alert.alert("Missing Fields", "Please fill in all required fields indicated in red.");
            return;
        }
        
        setLoading(true);
        try {
            const payload = {
                ...formData,
                location: formData.location === 'Others:' ? formData.customLocation : formData.location,
                date_time: formData.date
            };

            await postData('/api/items', payload);
            setShowSuccessModal(true);
        } catch (error) {
            if (error.message && error.message.includes('405')) {
                Alert.alert("Backend Route Error (405)", "The POST method is not supported by your backend at this route.");
            } else {
                Alert.alert("Submission Failed", error.message || "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Top Header Bar */}
            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.headerContent}>
                    <Image
                        source={require('../../assets/LV-Logo.png')}
                        style={styles.logoSmall}
                    />
                    <Text style={styles.headerTitle}>
                        LA VERDAD <Text style={{ fontWeight: '300' }}>LOST N FOUND</Text>
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
                                <Text style={styles.onDutyText}>ON DUTY: {adminName}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Form Fields - Two Column Layout */}
                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Finder’s Name <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.subLabel}>(Pangalan ng nakakita)</Text>
                            <TextInput 
                                style={[styles.input, errors.finderName && styles.inputError]} 
                                placeholder="Enter your name" 
                                placeholderTextColor="#C7C7CD" 
                                value={formData.finderName}
                                onChangeText={(text) => { handleInputChange('finderName', text); setErrors(prev => ({...prev, finderName: false})); }}
                            />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Finder’s ID Number <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.subLabel}>(ID Number ng nakakita)</Text>
                            <TextInput 
                                style={[styles.input, errors.finderId && styles.inputError]} 
                                placeholder="Enter your ID" 
                                placeholderTextColor="#C7C7CD" 
                                value={formData.finderId}
                                onChangeText={(text) => { handleInputChange('finderId', text); setErrors(prev => ({...prev, finderId: false})); }}
                            />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Grade/Course/Role <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.subLabel}>(Baitang - Seksyon/Kurso/Katungkulan)</Text>
                            <TextInput 
                                style={[styles.input, errors.gradeCourseRole && styles.inputError]} 
                                placeholder="Enter your grade/course/role" 
                                placeholderTextColor="#C7C7CD" 
                                value={formData.gradeCourseRole}
                                onChangeText={(text) => { handleInputChange('gradeCourseRole', text); setErrors(prev => ({...prev, gradeCourseRole: false})); }}
                            />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Item Category <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.subLabel}>(Kategorya ng item){"\n"}</Text>
                
                                <TouchableOpacity 
                                    style={[styles.input, {justifyContent: 'center'}, errors.category && styles.inputError]} 
                                    onPress={() => setShowCategoryModal(true)}
                                >
                                    <Text style={{color: formData.category === 'Item' ? '#C7C7CD' : '#333', fontSize: 11}} numberOfLines={1}>
                                        {formData.category}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Location Found <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.subLabel}>(Lokasyon kung saan nakita)</Text>
                                <TouchableOpacity 
                                    style={[styles.input, {justifyContent: 'center'}, errors.location && styles.inputError]} 
                                    onPress={() => setShowLocationModal(true)}
                                >
                                    <Text style={{color: formData.location === 'Location' ? '#C7C7CD' : '#333', fontSize: 11}} numberOfLines={1}>
                                        {formData.location}
                                    </Text>
                                </TouchableOpacity>
                                
                                {formData.location === 'Others:' && (
                                    <TextInput 
                                        style={[styles.input, {marginTop: 8}, errors.customLocation && styles.inputError]} 
                                        placeholder="Enter specific location" 
                                        placeholderTextColor="#C7C7CD" 
                                        value={formData.customLocation}
                                        onChangeText={(text) => { handleInputChange('customLocation', text); setErrors(prev => ({...prev, customLocation: false})); }}
                                    />
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Date and Time <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.subLabel}>(Petsa at Oras)</Text>
                                <TouchableOpacity 
                                    style={[styles.input, errors.date && styles.inputError]} 
                                    onPress={() => showMode('date')}
                                >
                                    <Text style={{color: '#333', fontSize: 11, paddingTop: 9}}>{formData.date}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Description and Photo Section */}
                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.subLabel}>(Ilarawan o i-describe ang item)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                                    placeholder="Please provide a description of the item"
                                    placeholderTextColor="#C7C7CD"
                                    multiline={true}
                                    numberOfLines={4}
                                value={formData.description}
                                onChangeText={(text) => { handleInputChange('description', text); setErrors(prev => ({...prev, description: false})); }}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Item Photo</Text>
                                <Text style={styles.subLabel}>(Larawan ng item)</Text>
                                {VALUABLE_CATEGORIES.includes(formData.category) ? (
                                    <View style={styles.photoDisabledNote}>
                                        <Text style={styles.photoDisabledText}>Note: Photo not allowed for valuable items.</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.photoButton}>
                                        <Ionicons name="camera-outline" size={20} color="#0056A0" />
                                        <Text style={styles.photoButtonText}>Take Photo</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View style={[styles.divider, { marginTop: 30 }]} />

                        {/* Footer Buttons */}
                        <View style={styles.footerRow}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation?.goBack()}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.submitButton, isFormComplete && { backgroundColor: '#0056b3' }]} 
                                onPress={handleSubmit} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <Text style={styles.submitText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Category Dropdown Modal */}
            <Modal visible={showCategoryModal} transparent={true} animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
                    <View style={styles.dropdownMenu}>
                        <FlatList
                            data={CATEGORIES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.dropdownItem} onPress={() => {
                                    handleInputChange('category', item);
                                    setErrors(prev => ({...prev, category: false}));
                                    setShowCategoryModal(false);
                                }}>
                                    <Text style={styles.dropdownItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Location Dropdown Modal */}
            <Modal visible={showLocationModal} transparent={true} animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowLocationModal(false)}>
                    <View style={styles.dropdownMenu}>
                        <FlatList
                            data={LOCATIONS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.dropdownItem} onPress={() => {
                                    handleInputChange('location', item);
                                    if (item !== 'Others:') handleInputChange('customLocation', '');
                                    setErrors(prev => ({...prev, location: false}));
                                    setShowLocationModal(false);
                                }}>
                                    <Text style={styles.dropdownItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Success Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showSuccessModal}
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.successOverlay}>
                    <View style={styles.successModalContainer}>
                        <View style={styles.successIconCircle}>
                            <Text style={styles.successCheckMark}>✓</Text>
                        </View>
                        <Text style={styles.successMainTitle}>Item Handed Over Successfully</Text>
                        <Text style={styles.successSubTitle}>
                            Now waiting to be reunited with its owner!
                        </Text>
                        <TouchableOpacity 
                            style={styles.successCloseButton}
                            onPress={() => {
                                setShowSuccessModal(false);
                                if (navigation) navigation.goBack();
                            }}
                        >
                            <Text style={styles.successButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* iOS Date/Time Picker Modal */}
            {showPicker && Platform.OS === 'ios' && (
                <Modal transparent={true} animationType="slide">
                    <View style={styles.iosPickerOverlay}>
                        <View style={styles.iosPickerContainer}>
                            <View style={styles.iosPickerHeader}>
                                <TouchableOpacity onPress={() => setShowPicker(false)}>
                                    <Text style={styles.iosPickerDone}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={date}
                                mode="datetime"
                                display="spinner"
                                onChange={onChangeDate}
                                style={{ width: '100%', backgroundColor: 'white' }}
                            />
                        </View>
                    </View>
                </Modal>
            )}

            {/* Android Date/Time Picker */}
            {showPicker && Platform.OS === 'android' && (
                <DateTimePicker value={date} mode={mode} is24Hour={false} display="default" onChange={onChangeDate} />
            )}
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
    required: { color: 'red' },
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
    inputError: { borderColor: '#FF4D4D', backgroundColor: '#FFF0F0' },
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
    photoDisabledNote: { backgroundColor: '#F0F0F0', padding: 8, borderRadius: 8, marginTop: 10 },
    photoDisabledText: { fontSize: 10, color: '#666', fontStyle: 'italic', textAlign: 'center' },
    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    dropdownMenu: { backgroundColor: '#FFF', width: '80%', maxHeight: '60%', borderRadius: 15, padding: 10, elevation: 5 },
    dropdownItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    dropdownItemText: { fontSize: 14, color: '#333', textAlign: 'center' },

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
    iosPickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    iosPickerContainer: { backgroundColor: '#FFF', paddingBottom: 20 },
    iosPickerHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 15, borderBottomWidth: 1, borderColor: '#EEE' },
    iosPickerDone: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },

    // Success Modal Styles
    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successModalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 35,
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    successIconCircle: {
        width: 70, height: 70, borderRadius: 35, borderWidth: 4,
        borderColor: '#28a745', justifyContent: 'center', alignItems: 'center', marginBottom: 25,
    },
    successCheckMark: { fontSize: 35, color: '#28a745', fontWeight: 'bold' },
    successMainTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 10 },
    successSubTitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 30, paddingHorizontal: 10 },
    successCloseButton: {
        backgroundColor: '#053e5a',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
        width: '60%',
        alignItems: 'center',
    },
    successButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});