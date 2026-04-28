import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, Image,TouchableOpacity,TextInput, FlatList,Dimensions, Platform, ActivityIndicator, RefreshControl, Alert, ScrollView,
  Modal, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added this

import { fetchData, postData } from '../api';
import ChangesSavedModal from './ChangesSavedModal';
  
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

const CATEGORIES = [
  'Personal Belongings', 'School Supplies', 'Clothing', 'Accessories',
  'Miscellaneous / Others', 'Documents / Identification', 'Gadgets / Electronics',
  'Money and Payment Items', 'Identification and Wallets', 'Bags and Storage',
  'Jewelry / Valuables'
];

const LOCATIONS = [
  'Entrance Lobby', 'Lobby 2 (Lost and Found Location)', 'EFS 1st Floor',
  'EFS 2nd Floor', 'EFS 3rd Floor', 'EFS 4th Floor', 'DSR 1st Floor',
  'DSR 2nd Floor', 'DSR 3rd Floor', 'DSR 4th Floor'
];

// Helper function to format date
const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown';
  // Replace space with 'T' to ensure cross-platform compatibility with standard ISO 8601
  const date = new Date(dateString.replace(' ', 'T')); 
  if (isNaN(date.getTime())) return dateString;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours || 12; // the hour '0' should be '12'
  
  return `${month} ${day}, ${year}\nat ${hours}:${minutes} ${ampm}`;
};

// Skeleton Card Component for Loading State
const SkeletonCard = () => {
  const fadeAnim = React.useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, backgroundColor: '#F0F0F0', elevation: 0 }]}>
      <View style={{ width: '90%', height: 14, backgroundColor: '#E0E0E0', borderRadius: 4, alignSelf: 'flex-start', marginBottom: 6 }} />
      <View style={{ width: '60%', height: 10, backgroundColor: '#E0E0E0', borderRadius: 4, alignSelf: 'flex-start', marginBottom: 10 }} />
      
      <View style={{ width: 80, height: 100, backgroundColor: '#E0E0E0', borderRadius: 15, marginVertical: 6 }} />
      
      <View style={{ width: '100%', height: 30, backgroundColor: '#E0E0E0', borderRadius: 12, marginTop: 10 }} />
    </Animated.View>
  );
};

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
  
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    category: '', location: '', date_time: '', description: ''
  });
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [showLocationList, setShowLocationList] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successSubtitle, setSuccessSubtitle] = useState('Item has been updated successfully.');

  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const loadAdminName = async () => {
      const name = await AsyncStorage.getItem('userName');
      if (name) setAdminName(name);
    };
    loadAdminName();
  }, []);

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

  // Check if any changes were made compared to the original item data
  const hasChanges = selectedItem ? (
    editFormData.category !== (selectedItem.category || '') ||
    editFormData.location !== (selectedItem.location_found || selectedItem.location || '') ||
    editFormData.date_time !== (selectedItem.found_date || selectedItem.date_time || selectedItem.date || selectedItem.created_at || '') ||
    editFormData.description !== (selectedItem.description || '')
  ) : false;

  // Handle updating the item on the backend
  const handleUpdateItem = async () => {
    if (!editFormData.category || !editFormData.location || !editFormData.date_time || !editFormData.description) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    try {
      setUpdateLoading(true);
      const itemId = selectedItem?.id || selectedItem?._id;
      const isAdmin = await AsyncStorage.getItem('isAdmin');

      if (isAdmin === 'true') {
        await postData(`/api/items/${itemId}`, {
          _method: 'PUT',
          category: editFormData.category,
          location: editFormData.location,
          description: editFormData.description,
          date_time: editFormData.date_time,
        });
        setSuccessSubtitle('Item has been updated successfully.');
        setShowSuccessModal(true);
      } else {
        const userName = await AsyncStorage.getItem('userName') || 'Unknown';
        await postData('/api/pending-edits', {
          item_id: itemId,
          user_name: userName,
          edit_type: 'update',
          original_data: {
            category: selectedItem?.category || '',
            location: selectedItem?.location_found || selectedItem?.location || '',
            description: selectedItem?.description || '',
            date_time: selectedItem?.date || selectedItem?.created_at || '',
          },
          new_data: {
            category: editFormData.category,
            location: editFormData.location,
            description: editFormData.description,
            date_time: editFormData.date_time,
          },
          new_category: editFormData.category,
          new_location: editFormData.location,
          new_description: editFormData.description,
          new_date_time: editFormData.date_time,
        });
        setSuccessSubtitle('Your edit has been submitted for admin approval.');
        setShowSuccessModal(true);
      }

      setIsEditing(false);
      setModalVisible(false);
      onRefresh();
    } catch (error) {
      console.error('Update Error:', error);
      Alert.alert('Update Failed', error.message || 'Could not update the item.');
    } finally {
      setUpdateLoading(false);
    }
  };

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
            <LinearGradient 
              colors={['#FFD700', '#FFAA00']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }} 
              style={styles.valuableBadge}
            >
              <Text style={styles.valuableText}>V</Text>
            </LinearGradient>
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
            setIsEditing(false);
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
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/LV-Logo.png')} style={styles.logoSmall} />
            <Text style={styles.headerTitle}>LA VERDAD <Text style={{ fontWeight: '300' }}>LOST N FOUND</Text></Text>
          </View>
          
          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.dashboardText}>DASHBOARD</Text>
          </TouchableOpacity>
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
          {['All', 'Lost', 'Valuable'].map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => { setActiveFilter(tab); setCurrentPage(1); }}
                style={[
                  styles.filterTab, 
                  isActive && tab === 'All' && styles.activeFilterAll,
                  isActive && tab === 'Lost' && styles.activeFilterLost,
                  isActive && tab === 'Valuable' && styles.activeFilterValuable
                ]}
              >
                {isActive && tab === 'Valuable' && (
                  <LinearGradient
                    colors={['#FFD700', '#FFAA00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                  />
                )}
                {isActive && tab === 'Lost' && (
                  <LinearGradient
                    colors={['#00B37A', '#009666']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                  />
                )}
                <Text style={[styles.filterTabText, isActive && styles.activeFilterText, isActive && (tab === 'Valuable' || tab === 'Lost') && { zIndex: 1 }]}>
                  {tab === 'All' ? 'All Items' : `${tab} Items`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {(activeFilter === 'Lost' || activeFilter === 'Valuable') && (
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>
              {filteredData.length} {filteredData.length === 1 ? 'Item Found' : 'Items Found'}
            </Text>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 15 }}>
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
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

      </LinearGradient>

      {/* Fixed bottom bar with pagination */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
        <View style={styles.bottomWrapper}>
          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={styles.pageArrow}
              onPress={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#FFF'} />
            </TouchableOpacity>
            <View style={styles.activePageSquare}>
              <Text style={styles.activePageText}>{currentPage}</Text>
            </View>
            <TouchableOpacity
              style={styles.pageArrow}
              onPress={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#FFF'} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Dynamic Item Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setIsEditing(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            
            {/* Header Section */}
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>Item’s Information</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={() => {
                  setModalVisible(false);
                  setIsEditing(false);
                }}
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
                <Text style={styles.modalLabel}>ITEM NO. {selectedItem?.id || selectedItem?._id || 'N/A'}</Text>
                
                <Text style={styles.modalSubLabel}>{selectedItem?.category || 'Uncategorized'}</Text>
                
                <Text style={styles.modalSectionHeader}>Location Found</Text>
                <Text style={styles.modalInfoText}>{selectedItem?.location_found || selectedItem?.location || 'Unknown'}</Text>

                <Text style={styles.modalSectionHeader}>Date and Time</Text>
                <Text style={styles.modalInfoText}>{formatDateTime(selectedItem?.date || selectedItem?.created_at)}</Text>
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
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  setEditFormData({
                    category: selectedItem?.category || '',
                    location: selectedItem?.location_found || selectedItem?.location || '',
                    date_time: selectedItem?.found_date || selectedItem?.date_time || selectedItem?.date || selectedItem?.created_at || '',
                    description: selectedItem?.description || '',
                  });
                  setIsEditing(true);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={isEditing}
        onRequestClose={() => { setIsEditing(false); setModalVisible(true); }}
      >
        <View style={styles.editOverlay}>
          <View style={styles.editModalContainer}>
            
            {/* Dark Blue Header */}
            <View style={styles.editHeader}>
              <Text style={styles.editHeaderTitle}>Edit Item Information</Text>
              <TouchableOpacity onPress={() => { setIsEditing(false); setModalVisible(true); }}>
                <Text style={styles.editCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.editFormPadding}>
              {/* Top Info Bar */}
              <View style={styles.editTopBar}>
                <Text style={styles.editItemNoText}>
                  Item No.: <Text style={{ fontWeight: 'normal' }}>{selectedItem?.id || selectedItem?._id || 'N/A'}</Text>
                </Text>
                <View style={styles.editOnDutyTag}>
                  <Text style={styles.editOnDutyText}>ON DUTY: {adminName}</Text>
                </View>
              </View>

              <View style={styles.editDivider} />

              {/* Section Title */}
              <Text style={styles.editSectionTitle}>
                Item’s Information <Text style={styles.translationText}>(Detaye ng item)</Text>
              </Text>

              {/* Input Fields */}
              <InputField 
                label="Item Category" 
                translation="(Kategorya ng Item)" 
                value={editFormData.category} 
                onPress={() => setShowCategoryList(true)} 
              />
              
              <InputField 
                label="Date and Time" 
                translation="(Petsa at Oras)" 
                value={formatDateTime(editFormData.date_time)} 
                onChangeText={(text) => setEditFormData({...editFormData, date_time: text})} 
              />

              <InputField 
                label="Location Found" 
                translation="(Lokasyon kung saan nakita)" 
                value={editFormData.location} 
                onPress={() => setShowLocationList(true)} 
              />

              <InputField 
                label="Description" 
                translation="(Ilarawan ang item)" 
                value={editFormData.description} 
                onChangeText={(text) => setEditFormData({...editFormData, description: text})} 
                multiline={true}
              />

              {/* Footer Buttons */}
              <View style={styles.editFooter}>
                <TouchableOpacity style={styles.editCancelButton} onPress={() => { setIsEditing(false); setModalVisible(true); }}>
                  <Text style={styles.editCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.editSaveButton, (!hasChanges || updateLoading) && { opacity: 0.5 }]} 
                  onPress={handleUpdateItem}
                  disabled={!hasChanges || updateLoading}
                >
                  {updateLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.editSaveText}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Embedded Dropdowns for Edit Modal */}
            {showCategoryList && (
              <View style={styles.innerOverlay}>
                <View style={styles.innerDropdown}>
                  <TouchableOpacity style={{ alignSelf: 'flex-end', paddingBottom: 5, paddingRight: 10 }} onPress={() => setShowCategoryList(false)}>
                      <Ionicons name="close" size={22} color="#666" />
                  </TouchableOpacity>
                  <ScrollView nestedScrollEnabled>
                    {CATEGORIES.map(cat => (
                      <TouchableOpacity key={cat} style={styles.dropdownItem} onPress={() => { setEditFormData({...editFormData, category: cat}); setShowCategoryList(false); }}>
                        <Text style={styles.dropdownItemText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
            {showLocationList && (
              <View style={styles.innerOverlay}>
                <View style={styles.innerDropdown}>
                <TouchableOpacity style={{ alignSelf: 'flex-end', paddingBottom: 5, paddingRight: 10 }} onPress={() => setShowLocationList(false)}>
                    <Ionicons name="close" size={22} color="#666" />
                </TouchableOpacity>
                  <ScrollView nestedScrollEnabled>
                    {LOCATIONS.map(loc => (
                      <TouchableOpacity key={loc} style={styles.dropdownItem} onPress={() => { setEditFormData({...editFormData, location: loc}); setShowLocationList(false); }}>
                        <Text style={styles.dropdownItemText}>{loc}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
            
          </View>
        </View>
      </Modal>

      <ChangesSavedModal
        visible={showSuccessModal}
        subtitle={successSubtitle}
        onContinue={() => {
          setShowSuccessModal(false);
          setIsEditing(false);
          setModalVisible(false);
          onRefresh();
        }}
      />
    </View>
  );
}

// Sub-component for Inputs
const InputField = ({ label, translation, value, onChangeText, multiline, onPress }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>
      {label} <Text style={styles.translationText}>{translation}</Text>
    </Text>
    {onPress ? (
      <TouchableOpacity 
        style={[styles.textInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} 
        onPress={onPress}
      >
        <Text style={{color: value ? '#333' : '#999', fontSize: 13, flex: 1}} numberOfLines={1}>{value || `Select ${label}`}</Text>
        <Ionicons name="chevron-down" size={16} color="#999" />
      </TouchableOpacity>
    ) : (
      <TextInput
        style={[styles.textInput, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#002D52' },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  dashboardButton: { borderWidth: 2, borderColor: '#FFF', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 5 },
  dashboardText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  gradient: { flex: 1 },
  bottomSafeArea: { backgroundColor: '#16487d' },
  searchContainer: { margin: 15, backgroundColor: '#FFF', borderRadius: 25, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, elevation: 4 },
  searchInput: { flex: 1, height: 40, fontSize: 12 },
  filterRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 15 },
  filterTab: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  activeFilterAll: { backgroundColor: '#003366', borderColor: '#003366' },
  activeFilterLost: { backgroundColor: 'transparent', borderColor: 'transparent', shadowColor: '#00B37A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  activeFilterValuable: { backgroundColor: 'transparent', borderColor: 'transparent', shadowColor: '#FFAA00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  filterTabText: { fontSize: 11, color: '#666' },
  activeFilterText: { color: '#FFF', fontWeight: 'bold' },
  itemCountBadge: { backgroundColor: '#003366', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'center', marginBottom: 10 },
  itemCountText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  listPadding: { paddingHorizontal: 15, paddingBottom: 15 },
  columnWrapper: { justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', width: (width / 2) - 22, borderRadius: 20, padding: 12, marginBottom: 15, alignItems: 'center', elevation: 3 },
  cardHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  itemNumber: { fontSize: 13, fontWeight: 'bold', color: '#000' },
  itemCategory: { fontSize: 9, color: '#666' },
  valuableBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#FFAA00', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 3 },
  valuableText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  imageContainer: { height: 100, width: '100%', justifyContent: 'center', alignItems: 'center', marginVertical: 6 },
  itemImage: { width: 80, height: 100, resizeMode: 'contain' },
  viewDetailsButton: { backgroundColor: '#003366', borderRadius: 12, width: '100%', paddingVertical: 8, alignItems: 'center' },
  viewDetailsText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  bottomWrapper: { alignItems: 'center', paddingVertical: 12 },
  paginationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#002D52', borderRadius: 30, paddingVertical: 8, paddingHorizontal: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
  pageArrow: { padding: 6, borderRadius: 20, marginHorizontal: 8 },
  activePageSquare: { backgroundColor: '#FFF', width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginHorizontal: 8 },
  activePageText: { color: '#002D52', fontWeight: 'bold', fontSize: 14 },

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
  modalImagePlaceholder: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 15 },
  modalImage: { width: 150, height: 150, borderRadius: 15, resizeMode: 'contain' },
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
  editInput: {
    borderWidth: 1,
    borderColor: '#00AEEF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F9F9F9',
    marginTop: 2,
    fontSize: 12,
    color: '#333'
  },
  innerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 30 },
  innerDropdown: { backgroundColor: '#FFF', width: '85%', maxHeight: '70%', borderRadius: 15, elevation: 6, paddingVertical: 10 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dropdownItemText: { fontSize: 13, color: '#333' },
  charCount: { fontSize: 10, color: '#666', textAlign: 'right', marginTop: 4 },
  
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
  editOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center' },
  editModalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 25, overflow: 'hidden', maxHeight: '90%' },
  editHeader: { backgroundColor: '#053e5a', flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  editHeaderTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  editCloseX: { color: 'white', fontSize: 22 },
  editFormPadding: { padding: 20 },
  editTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  editItemNoText: { fontSize: 16, fontWeight: 'bold', color: '#053e5a' },
  editOnDutyTag: { backgroundColor: '#a0dae9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  editOnDutyText: { color: '#053e5a', fontSize: 12, fontWeight: 'bold' },
  editDivider: { height: 1, backgroundColor: '#eee', marginBottom: 20 },
  editSectionTitle: { fontSize: 18, color: '#053e5a', fontWeight: 'bold', marginBottom: 15 },
  inputContainer: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#053e5a', marginBottom: 5 },
  translationText: { fontWeight: 'normal', color: '#999', fontStyle: 'italic', fontSize: 12 },
  textInput: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, color: '#333' },
  textArea: { height: 80, textAlignVertical: 'top' },
  editFooter: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 15 },
  editCancelButton: { borderWidth: 2, borderColor: 'black', borderRadius: 25, paddingVertical: 10, paddingHorizontal: 35 },
  editCancelText: { fontWeight: 'bold' },
  editSaveButton: { backgroundColor: '#053e5a', borderRadius: 25, paddingVertical: 10, paddingHorizontal: 35 },
  editSaveText: { color: 'white', fontWeight: 'bold' },
});