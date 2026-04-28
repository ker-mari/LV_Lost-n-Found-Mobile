import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchData } from '../api';
import { colors, gradients } from '../theme';

const categoryEmojis = {
  'Personal Belongings': 'https://cdn-icons-png.flaticon.com/512/8093/8093479.png',
  'School Supplies': 'https://cdn-icons-png.flaticon.com/512/5311/5311017.png',
  'Clothing': 'https://cdn-icons-png.flaticon.com/512/4634/4634005.png',
  'Accessories': 'https://cdn-icons-png.flaticon.com/512/941/941330.png',
  'Miscellaneous / Others': 'https://cdn-icons-png.flaticon.com/512/5692/5692058.png',
  'Documents / Identification': 'https://cdn-icons-png.flaticon.com/512/2997/2997954.png',
  'Gadgets / Electronics': 'https://cdn-icons-png.flaticon.com/512/7214/7214359.png',
  'Money and Payment Items': 'https://cdn-icons-png.flaticon.com/512/1198/1198333.png',
  'Identification and Wallets': 'ðŸ’³',
  'Bags and Storage': 'https://cdn-icons-png.flaticon.com/512/3275/3275955.png',
  'Jewelry / Valuables': 'https://cdn-icons-png.flaticon.com/512/4689/4689250.png'
};

// Helper to style status badges
const getStatusStyle = (status) => {
  switch (status) {
    case 'Edit Rejected': return { bg: '#FFD6D6', text: '#FF4D4D', border: '#FFBABA' };
    case 'Admin Update':
    case 'Admin Edit':
    case 'Updated':
      return { bg: '#D1E9FF', text: '#003580', border: '#007BFF' };
    case 'Edit Approved': return { bg: '#D5F5E3', text: '#28B463', border: '#ABEBC6' };
    case 'Claimed': return { bg: '#D5F5E3', text: '#28B463', border: '#ABEBC6' };
    default: return { bg: '#F2F3F4', text: '#7F8C8D', border: '#D7DBDD' };
  }
};

// Helper function to format date to "April 16, 2026"
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Replace space with 'T' to ensure cross-platform compatibility with standard ISO 8601
  const date = new Date(dateString.replace(' ', 'T')); 
  if (isNaN(date.getTime())) return dateString;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

// Helper function to format full date and time for the modal
const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown';
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
  hours = hours || 12;
  
  return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
};

// Helper Component for the Data Cards inside the modal
const InfoCard = ({ label, value, color }) => (
  <View style={styles.infoCard}>
    <View style={[styles.accentBar, { backgroundColor: color }]} />
    <View style={styles.cardContent}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

export default function HistoryScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAscending, setSortAscending] = useState(false); // Default to descending (newest first)
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        // Adjust '/api/history' to match your Laravel endpoint
        const response = await fetchData('/api/history'); 
        const data = response.data || response;
        console.log('History sample:', JSON.stringify(Array.isArray(data) ? data[0] : data).substring(0, 400));
        setHistoryData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("History fetch error:", error);
        Alert.alert("Error", "Could not load history data.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Sort the data based on the selected order
  const sortedData = useMemo(() => {
    return [...historyData].sort((a, b) => {
      const dateA = new Date((a.date || a.created_at || '').replace(' ', 'T')).getTime();
      const dateB = new Date((b.date || b.created_at || '').replace(' ', 'T')).getTime();
      
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;

      return sortAscending ? dateA - dateB : dateB - dateA;
    });
  }, [historyData, sortAscending]);

  const renderRow = useCallback(({ item, index }) => {
    const isOdd = index % 2 !== 0;
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={[styles.tableRow, isOdd && styles.oddRow]}>
        <Text style={styles.dateCell}>{formatDate(item.date || item.created_at)}</Text>
        <Text style={styles.nameCell} numberOfLines={1}>{item.name || item.item_name || 'Unnamed'}</Text>
        
        {/* Status Badge */}
        <View style={styles.statusCell}>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => {
            setSelectedItem(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.detailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  }, []);

  const itemImg = selectedItem?.image_url || selectedItem?.image;
  const fallback = categoryEmojis[selectedItem?.category];

  return (
    <View style={styles.container}>
      {/* Unified Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Image source={require('../../assets/LV-Logo.png')} style={styles.logoSmall} />
          <Text style={styles.headerTitle}>LA VERDAD <Text style={{fontWeight: '300'}}>LOST N FOUND</Text></Text>
        </View>
      </SafeAreaView>

      <LinearGradient colors={gradients.main} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>HISTORY PAGE</Text>

          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <TouchableOpacity style={styles.headerCellGroup} onPress={() => setSortAscending(!sortAscending)} activeOpacity={0.7}>
                <Text style={styles.headerCellText}>Date</Text>
                <Ionicons name={sortAscending ? "caret-up" : "caret-down"} size={12} color="#666" style={{marginLeft: 4}} />
              </TouchableOpacity>
              <Text style={[styles.headerCellText, {flex: 1}]}>Item Category</Text>
              <Text style={[styles.headerCellText, {flex: 1, textAlign: 'center'}]}>Status</Text>
              <Text style={[styles.headerCellText, {width: 80, textAlign: 'center'}]}>Action</Text>
            </View>

            {loading ? (
              <View style={{ padding: 40, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00AEEF" />
              </View>
            ) : (
              <FlatList
                data={sortedData}
                renderItem={renderRow}
                keyExtractor={item => item.id?.toString() || Math.random().toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', marginVertical: 30, color: '#666', fontStyle: 'italic' }}>No records yetâ€”you're all caught up!</Text>
                }
              />
            )}
          </View>
        </ScrollView>

        {/* Pagination Controls */}
        <View style={styles.bottomWrapper}>
          <View style={styles.paginationRow}>
            <TouchableOpacity style={styles.pageArrow}><Ionicons name="chevron-back" size={18} color="#666" /></TouchableOpacity>
            <View style={styles.activePageSquare}><Text style={styles.activePageText}>1</Text></View>
            <TouchableOpacity style={styles.pageArrow}><Ionicons name="chevron-forward" size={18} color="#666" /></TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Dynamic History Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalView}>
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.titleText}>Itemâ€™s Information</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Close </Text>
                <View style={styles.closeIconCircle}><Text style={styles.xIcon}>âœ•</Text></View>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Top Section: Item Basics */}
              <View style={styles.topSection}>
                <View style={styles.imagePlaceholder}>
                  {itemImg ? (
                    <Image source={{ uri: itemImg }} style={styles.modalImage} />
                  ) : fallback && fallback.startsWith('http') ? (
                    <Image source={{ uri: fallback }} style={styles.modalImage} />
                  ) : (
                    <Text style={{fontSize: 50}}>{fallback || 'ðŸ“¦'}</Text>
                  )}
                </View>
                <View style={styles.basicInfo}>
                  <Text style={styles.boldLabel}>ITEM NO. {selectedItem?.id || selectedItem?.item_no || 'N/A'}</Text>
                  <Text style={styles.categoryText}>{selectedItem?.category || 'Uncategorized'}</Text>
                  
                  <Text style={styles.sectionHeader}>Location Found</Text>
                  <Text style={styles.blueText}>{selectedItem?.location_found || selectedItem?.location || 'Unknown'}</Text>

                  <Text style={styles.sectionHeader}>Date and Time</Text>
                  <Text style={styles.blueText}>{formatDateTime(selectedItem?.date || selectedItem?.created_at || selectedItem?.date_time)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Description */}
              <View style={styles.descriptionBox}>
                <Text style={styles.sectionHeaderLarge}>Description</Text>
                <Text style={styles.blueText}>{selectedItem?.description || 'No description available'}</Text>
              </View>

              <View style={styles.divider} />

              {/* Bottom Section: Two Columns */}
              <View style={styles.infoGrid}>
                
                {/* Finder Column */}
                <View style={styles.column}>
                  <Text style={styles.columnTitle}>Finderâ€™s Information</Text>
                  <InfoCard label="Name:" value={selectedItem?.finder_name || selectedItem?.name} color="#4A90E2" />
                  <InfoCard label="Grade/Course:" value={selectedItem?.finder_grade || selectedItem?.grade_course_role} color="#4A90E2" />
                  <InfoCard label="ID Number:" value={selectedItem?.finder_id} color="#4A90E2" />
                  <InfoCard label="Officer on Duty:" value={selectedItem?.officer || selectedItem?.admin_name} color="#4A90E2" />
                </View>

                {/* Claimer Column */}
                <View style={styles.column}>
                  <Text style={styles.columnTitle}>Claimerâ€™s Information</Text>
                  <InfoCard label="Name:" value={selectedItem?.claimer_name} color="#4A90E2" />
                  <InfoCard label="Grade/Course:" value={selectedItem?.claimer_grade || selectedItem?.claimer_role} color="#4A90E2" />
                  <InfoCard label="ID Number:" value={selectedItem?.claimer_id} color="#4A90E2" />
                  <InfoCard label="Status:" value={selectedItem?.status || 'Pending'} color={selectedItem?.status === 'Claimed' ? "#2ECC71" : "#F39C12"} /> 
                </View>

              </View>
            </ScrollView>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#002D52' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  scrollContainer: { paddingHorizontal: 15, paddingBottom: 80 },
  backButton: { backgroundColor: '#4A6A8A', paddingHorizontal: 30, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', marginTop: 15 },
  backText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  pageTitle: { color: '#000', fontSize: 24, fontWeight: '900', textAlign: 'center', marginVertical: 20 },

  tableCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    borderWidth: 2, 
    borderColor: '#00AEEF', 
    overflow: 'hidden',
    marginBottom: 20 
  },
  tableHeader: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  headerCellGroup: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerCellText: { fontSize: 10, fontWeight: 'bold', color: '#000' },

  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10 },
  oddRow: { backgroundColor: '#F2F2F2' },
  dateCell: { flex: 1, fontSize: 10, color: '#333' },
  nameCell: { flex: 1, fontSize: 10, color: '#333' },
  statusCell: { flex: 1, alignItems: 'center' },
  
  badge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, alignSelf: 'center' },
  badgeText: { fontSize: 8, fontWeight: 'bold' },

  detailsButton: { backgroundColor: '#004A8D', borderRadius: 15, width: 80, height: 28, justifyContent: 'center', alignItems: 'center' },
  detailsText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },

  bottomWrapper: { position: 'absolute', bottom: 10, left: 0, right: 0, height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  pageArrow: { backgroundColor: '#FFF', padding: 5, borderRadius: 5, marginHorizontal: 10, elevation: 2 },
  activePageSquare: { backgroundColor: '#FFF', width: 35, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: 5, borderWidth: 1, borderColor: '#DDD', elevation: 2 },
  activePageText: { color: '#000', fontWeight: 'bold' },

  // --- Dynamic Modal Styles ---
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 15 },
  modalView: { width: '95%', maxHeight: '90%', backgroundColor: 'white', borderRadius: 35, padding: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  titleText: { fontSize: 22, fontWeight: 'bold', color: '#053e5a' },
  closeButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'red', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  closeText: { color: 'red', fontWeight: 'bold', fontSize: 12 },
  closeIconCircle: { backgroundColor: 'red', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  xIcon: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  
  topSection: { flexDirection: 'row', marginBottom: 15 },
  imagePlaceholder: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10 },
  modalImage: { width: '100%', height: '100%', borderRadius: 10, resizeMode: 'cover' },
  basicInfo: { flex: 1, marginLeft: 10 },
  boldLabel: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  categoryText: { color: '#053e5a', fontSize: 14, marginBottom: 8 },
  sectionHeader: { fontWeight: 'bold', fontSize: 13, color: '#333', marginTop: 4 },
  sectionHeaderLarge: { fontWeight: 'bold', fontSize: 16, color: '#333', marginBottom: 5 },
  blueText: { color: '#053e5a', fontSize: 13 },
  descriptionBox: { marginBottom: 5 },
  divider: { height: 1, backgroundColor: '#888', marginVertical: 15, opacity: 0.5 },
  
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { width: '48%' },
  columnTitle: { fontSize: 14, fontWeight: 'bold', color: '#053e5a', marginBottom: 10 },
  
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    height: 50,
  },
  accentBar: { width: 4 },
  cardContent: { paddingLeft: 10, justifyContent: 'center' },
  cardLabel: { fontSize: 11, color: '#666', fontWeight: 'bold' },
  cardValue: { fontSize: 12, color: '#333' },
});
