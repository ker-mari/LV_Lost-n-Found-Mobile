import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchData } from '../api';

// Helper to style status badges
const getStatusStyle = (status) => {
  switch (status) {
    case 'Edit Rejected': return { bg: '#FFD6D6', text: '#FF4D4D', border: '#FFBABA' };
    case 'Admin Update': return { bg: '#D6EAF8', text: '#2E86C1', border: '#AED6F1' };
    case 'Edit Approved': return { bg: '#D5F5E3', text: '#28B463', border: '#ABEBC6' };
    case 'Claimed': return { bg: '#D5F5E3', text: '#28B463', border: '#ABEBC6' };
    default: return { bg: '#F2F3F4', text: '#7F8C8D', border: '#D7DBDD' };
  }
};

export default function HistoryScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        // Adjust '/api/history' to match your Laravel endpoint
        const response = await fetchData('/api/history'); 
        const data = response.data || response;
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

  const renderRow = useCallback(({ item, index }) => {
    const isOdd = index % 2 !== 0;
    const colors = getStatusStyle(item.status);

    return (
      <View style={[styles.tableRow, isOdd && styles.oddRow]}>
        <Text style={styles.dateCell}>{item.date || item.created_at || 'N/A'}</Text>
        <Text style={styles.nameCell} numberOfLines={1}>{item.name || item.item_name || 'Unnamed'}</Text>
        
        {/* Status Badge */}
        <View style={styles.statusCell}>
          <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Unified Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Image source={require('../../assets/school.png')} style={styles.logoSmall} />
          <Text style={styles.headerTitle}>LA VERDAD <Text style={{fontWeight: '300'}}>LOST N FOUND</Text></Text>
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>HISTORY PAGE</Text>

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <View style={styles.headerCellGroup}>
              <Text style={styles.headerCellText}>Date</Text>
              <Ionicons name="swap-vertical" size={12} color="#666" style={{marginLeft: 4}} />
            </View>
            <Text style={[styles.headerCellText, {flex: 1}]}>Item Name</Text>
            <Text style={[styles.headerCellText, {flex: 1, textAlign: 'center'}]}>Status</Text>
            <View style={{width: 80}} />
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#00AEEF" />
            </View>
          ) : (
            <FlatList
              data={historyData}
              renderItem={renderRow}
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Pagination Controls */}
        <View style={styles.paginationRow}>
          <TouchableOpacity style={styles.pageArrow}><Ionicons name="chevron-back" size={18} color="#666" /></TouchableOpacity>
          <View style={styles.activePageSquare}><Text style={styles.activePageText}>1</Text></View>
          <TouchableOpacity style={styles.pageArrow}><Ionicons name="chevron-forward" size={18} color="#666" /></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B0C4DE' },
  header: { backgroundColor: '#002D52' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  
  body: { flex: 1, paddingHorizontal: 15 },
  backButton: { backgroundColor: '#4A6A8A', paddingHorizontal: 30, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', marginTop: 15 },
  backText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  pageTitle: { color: '#000', fontSize: 24, fontWeight: '900', textAlign: 'center', marginVertical: 20 },

  tableCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    borderWidth: 2, 
    borderColor: '#00AEEF', 
    flex: 1, 
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
  
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, width: '90%', alignItems: 'center' },
  badgeText: { fontSize: 8, fontWeight: 'bold' },

  detailsButton: { backgroundColor: '#004A8D', borderRadius: 15, width: 80, height: 28, justifyContent: 'center', alignItems: 'center' },
  detailsText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },

  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  pageArrow: { backgroundColor: '#FFF', padding: 5, borderRadius: 5, marginHorizontal: 10, elevation: 2 },
  activePageSquare: { backgroundColor: '#FFF', width: 35, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: 5, borderWidth: 1, borderColor: '#DDD', elevation: 2 },
  activePageText: { color: '#000', fontWeight: 'bold' }
});