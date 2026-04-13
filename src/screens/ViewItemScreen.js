import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Platform, ActivityIndicator, RefreshControl, Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added this

import { fetchData } from '../api';

const { width } = Dimensions.get('window');

const categoryEmojis = {
  'Personal Belongings': 'https://cdn-icons-png.flaticon.com/512/8093/8093479.png',
  'School Supplies': 'https://cdn-icons-png.flaticon.com/512/5311/5311017.png',
  'Clothing': 'https://cdn-icons-png.flaticon.com/512/4634/4634005.png',
  'Accessories': 'https://cdn-icons-png.flaticon.com/512/941/941330.png',
  'Miscellaneous / Others': 'https://cdn-icons-png.flaticon.com/512/5692/5692058.png',
  'Documents / Identification': 'https://cdn-icons-png.flaticon.com/512/2997/2997954.png',
  'Gadgets / Electronics': 'https://cdn-icons-png.flaticon.com/512/7214/7214359.png',
  'Money and Payment Items': 'https://cdn-icons-png.flaticon.com/512/1198/1198333.png',
  'Identification and Wallets': '💳',
  'Bags and Storage': 'https://cdn-icons-png.flaticon.com/512/3275/3275955.png',
  'Jewelry / Valuables': 'https://cdn-icons-png.flaticon.com/512/4689/4689250.png'
};

const valuableCategories = ['Gadgets / Electronics', 'Money and Payment Items', 'Identification and Wallets', 'Bags and Storage', 'Jewelry / Valuables'];

export default function ViewItemScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const isValuable = (item) => {
    return item?.is_valuable || valuableCategories.includes(item?.category);
  };

  const fetchItemsFromBackend = async () => {
    try {
      setLoading(true);
      console.log("Attempting to fetch items from Render...");

      // Use the updated fetchData function (it automatically attaches the token now!)
      const response = await fetchData('/api/items');
      
      // Print a snippet of the response to your terminal to help debug if needed
      console.log("Backend Response Snippet:", JSON.stringify(response).substring(0, 200));

      // Safely extract the array (handles Laravel pagination, resources, or raw arrays)
      let extractedData = response.data || response;
      if (extractedData && extractedData.data) {
        extractedData = extractedData.data; // Extracts from nested paginators
      }
      
      setItems(Array.isArray(extractedData) ? extractedData : []);
    } catch (error) {
      console.error("Fetch Error:", error);
      // Handle the specific 401 error so the user knows they need to log in again
      if (error.message.includes('401')) {
        await AsyncStorage.clear(); // FORCE completely clean state
        Alert.alert(
          "Session Expired", 
          "Your token was rejected (401 Unauthenticated). You have been securely logged out. Please log in again."
        );
        navigation.replace('Welcome'); // Use replace to prevent going back to the broken screen
      } else if (error.message.includes('500')) {
        Alert.alert(
          "Backend Crash (500 Error)", 
          "Your Laravel server encountered a PHP or Database error while trying to fetch the items. Please check your Render logs or set APP_DEBUG=true on Render to see the exact error!"
        );
      } else {
        Alert.alert("Connection Error", error.message || "Could not connect to the backend.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItemsFromBackend();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItemsFromBackend();
  };

  // Filter & Pagination Logic
  const filteredData = useMemo(() => {
    if (!Array.isArray(items)) return []; // Prevents app crash if items is an object
    let data = items;

    // 1. Apply category filters
    if (activeFilter === 'Lost') data = data.filter(item => !isValuable(item));
    if (activeFilter === 'Valuable') data = data.filter(item => isValuable(item));

    // 2. Apply search text filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      data = data.filter(item => {
        return (item.category || '').toLowerCase().includes(query) ||
               (item.description || '').toLowerCase().includes(query) ||
               (item.location || item.location_found || '').toLowerCase().includes(query) ||
               String(item.item_no || item.id || '').toLowerCase().includes(query);
      });
    }

    return data;
  }, [activeFilter, items, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [currentPage, filteredData]);

  const renderItem = useCallback(({ item }) => {
    const itemImg = item.image_url || item.image;
    const fallback = categoryEmojis[item.category];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemNumber} numberOfLines={1}>ITEM NO. {item.item_no || item.id || 'N/A'}</Text>
            <Text style={styles.itemCategory} numberOfLines={1}>{item.category || 'Uncategorized'}</Text>
          </View>
          {isValuable(item) && (
            <View style={styles.valuableBadge}><Text style={styles.valuableText}>V</Text></View>
          )}
        </View>
        <View style={styles.imageContainer}>
          {itemImg ? (
            <Image source={{ uri: itemImg }} style={styles.itemImage} />
          ) : fallback && fallback.startsWith('http') ? (
            <Image source={{ uri: fallback }} style={styles.itemImage} />
          ) : (
            <Text style={{fontSize: 40}}>{fallback || '📦'}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => {
            setSelectedItem(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  }, [navigation]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Image source={require('../../assets/LV-Logo.png')} style={styles.logoSmall} />
          <Text style={styles.headerTitle}>LA VERDAD <Text style={{ fontWeight: '300' }}>LOST N FOUND</Text></Text>
        </View>
      </SafeAreaView>

      <LinearGradient colors={['#E0EAFC', '#16487d']} style={styles.gradient}>
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search items..." 
            placeholderTextColor="#999" 
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setCurrentPage(1); // Reset page to 1 when user searches
            }}
          />
          <Ionicons name="search" size={20} color="#000" />
        </View>

        <View style={styles.filterRow}>
          {['All', 'Lost', 'Valuable'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => { setActiveFilter(tab); setCurrentPage(1); }}
              style={[styles.filterTab, activeFilter === tab && styles.activeFilter]}
            >
              <Text style={[styles.filterTabText, activeFilter === tab && styles.activeFilterText]}>
                {tab === 'All' ? 'All Items' : `${tab} Items`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && !refreshing ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={{ textAlign: 'center', color: '#FFF', marginTop: 10 }}>Waking up server...</Text>
          </View>
        ) : (
          <FlatList
            data={currentItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listPadding}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
            }
            ListEmptyComponent={
              <Text style={{ color: '#FFF', textAlign: 'center', marginTop: 20 }}>No items found.</Text>
            }
          />
        )}

        <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="light" style={styles.blurWrapper}>
          <View style={styles.paginationPill}>
            <TouchableOpacity onPress={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              <Ionicons name="chevron-back" size={20} color="#003366" style={currentPage === 1 && { opacity: 0.2 }} />
            </TouchableOpacity>

            <View style={styles.numberRow}>
              {currentPage > 1 && <Text style={styles.sideNumber} onPress={() => setCurrentPage(currentPage - 1)}>{currentPage - 1}</Text>}
              <View style={styles.activeCircle}><Text style={styles.activeNumberText}>{currentPage}</Text></View>
              {currentPage < totalPages && <Text style={styles.sideNumber} onPress={() => setCurrentPage(currentPage + 1)}>{currentPage + 1}</Text>}
            </View>

            <TouchableOpacity onPress={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
              <Ionicons name="chevron-forward" size={20} color="#003366" style={currentPage === totalPages && { opacity: 0.2 }} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>

      {/* Dynamic Item Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            
            {/* Header Section */}
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>Item’s Information</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close </Text>
                <View style={styles.closeIconCircle}>
                   <Text style={styles.xIcon}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Main Content Body */}
            <View style={styles.modalContentBody}>
              {selectedItem?.image_url || selectedItem?.image ? (
                <Image source={{ uri: selectedItem.image_url || selectedItem.image }} style={styles.modalImage} />
              ) : categoryEmojis[selectedItem?.category] && categoryEmojis[selectedItem?.category].startsWith('http') ? (
                <Image source={{ uri: categoryEmojis[selectedItem?.category] }} style={styles.modalImage} />
              ) : (
                <View style={styles.modalImagePlaceholder}>
                  <Text style={{fontSize: 40}}>{categoryEmojis[selectedItem?.category] || '📦'}</Text>
                </View>
              )}

              <View style={styles.modalDetailsContainer}>
                <Text style={styles.modalLabel} numberOfLines={1}>ITEM NO. {selectedItem?.id || selectedItem?._id || 'N/A'}</Text>
                <Text style={styles.modalSubLabel} numberOfLines={1}>{selectedItem?.category || 'Uncategorized'}</Text>
                
                <Text style={styles.modalSectionHeader}>Location Found</Text>
                <Text style={styles.modalInfoText}>{selectedItem?.location_found || selectedItem?.location || 'Unknown'}</Text>

                <Text style={styles.modalSectionHeader}>Date and Time</Text>
                <Text style={styles.modalInfoText}>{selectedItem?.date || selectedItem?.created_at || 'Unknown'}</Text>
              </View>
            </View>

            <View style={styles.modalDivider} />

            {/* Description Section */}
            <View style={styles.modalDescriptionSection}>
              <Text style={styles.modalDescriptionLabel}>Description</Text>
              <Text style={styles.modalDescriptionContent}>{selectedItem?.description || 'No description available'}</Text>
            </View>

            {/* Footer Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.claimButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Claim', { itemData: selectedItem });
                }}
              >
                <Text style={styles.claimButtonText}>Claim</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#002D52' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  gradient: { flex: 1 },
  searchContainer: { margin: 15, backgroundColor: '#FFF', borderRadius: 25, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, elevation: 4 },
  searchInput: { flex: 1, height: 40, fontSize: 12 },
  filterRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 15 },
  filterTab: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  activeFilter: { backgroundColor: '#003366', borderColor: '#003366' },
  filterTabText: { fontSize: 11, color: '#666' },
  activeFilterText: { color: '#FFF', fontWeight: 'bold' },
  listPadding: { paddingHorizontal: 15, paddingBottom: 80 },
  columnWrapper: { justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', width: (width / 2) - 22, borderRadius: 20, padding: 12, marginBottom: 15, alignItems: 'center', elevation: 3 },
  cardHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  itemNumber: { fontSize: 13, fontWeight: 'bold', color: '#000' },
  itemCategory: { fontSize: 9, color: '#666' },
  valuableBadge: { backgroundColor: '#EAD163', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  valuableText: { fontSize: 9, fontWeight: 'bold' },
  imageContainer: { height: 80, width: '100%', justifyContent: 'center', alignItems: 'center', marginVertical: 8 },
  itemImage: { width: 65, height: 65, resizeMode: 'contain' },
  viewDetailsButton: { backgroundColor: '#003366', borderRadius: 12, width: '100%', paddingVertical: 8, alignItems: 'center' },
  viewDetailsText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  blurWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.7)' : 'transparent' },
  paginationPill: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 25, alignItems: 'center', elevation: 5 },
  numberRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  sideNumber: { fontSize: 14, color: '#003366', fontWeight: 'bold', width: 30, textAlign: 'center' },
  activeCircle: { backgroundColor: '#003366', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  activeNumberText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // --- Dynamic Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleText: { fontSize: 18, fontWeight: 'bold', color: '#053e5a' },
  modalCloseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'red',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modalCloseText: { color: 'red', fontWeight: 'bold', fontSize: 11 },
  closeIconCircle: { backgroundColor: 'red', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  xIcon: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  modalContentBody: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  modalImagePlaceholder: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 15 },
  modalImage: { width: 100, height: 100, borderRadius: 15, resizeMode: 'cover' },
  modalDetailsContainer: { flex: 1, marginLeft: 15 },
  modalLabel: { fontWeight: 'bold', fontSize: 13, color: '#333' },
  modalSubLabel: { color: '#053e5a', fontSize: 12, marginBottom: 10 },
  modalSectionHeader: { fontWeight: 'bold', fontSize: 12, marginTop: 5 },
  modalInfoText: { color: '#053e5a', fontSize: 12 },
  modalDivider: { height: 1, backgroundColor: '#ccc', marginVertical: 15 },
  modalDescriptionSection: { marginBottom: 25 },
  modalDescriptionLabel: { fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
  modalDescriptionContent: { color: '#053e5a', fontSize: 13 },
  modalFooter: { flexDirection: 'row', justifyContent: 'center', gap: 15 },
  claimButton: {
    backgroundColor: '#053e5a',
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  claimButtonText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  editButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  editButtonText: { color: '#333', fontSize: 13 },
});