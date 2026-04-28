import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  FlatList, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchData, postData } from '../api';
import { colors, gradients } from '../theme';
import ItemSummaryModal from './ItemSummaryModal';
import ClearAllItemsModal from './ClearAllItemsModal';
import AllClearedSuccessModal from './AllClearedSuccessModal';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString.replace(' ', 'T'));
  if (isNaN(date.getTime())) return dateString;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export default function ItemsToClearScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAscending, setSortAscending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [clearAllModal, setClearAllModal] = useState(false);
  const [clearItemModal, setClearItemModal] = useState({ visible: false, id: null });
  const [showAllClearedModal, setShowAllClearedModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetchData('/api/items-to-be-cleared');
        const data = response.data || response;
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Items to clear fetch error:', error);
        Alert.alert('Error', 'Could not load items.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sortedData = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = new Date((a.date_time || a.date || a.created_at || '').replace(' ', 'T')).getTime();
      const dateB = new Date((b.date_time || b.date || b.created_at || '').replace(' ', 'T')).getTime();
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return sortAscending ? dateA - dateB : dateB - dateA;
    });
  }, [items, sortAscending]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [currentPage, sortedData]);

  const performClearAll = async () => {
    setClearAllModal(false);
    try {
      setLoading(true);
      await Promise.all(items.map(item => postData(`/api/items/${item.id || item._id}`, { _method: 'DELETE' })));
      setItems([]);
      setShowAllClearedModal(true);
      setTimeout(() => setShowAllClearedModal(false), 2000);
    } catch (error) {
      console.error('Error clearing all items:', error);
      Alert.alert('Error', 'Failed to clear items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performClearItem = async () => {
    const id = clearItemModal.id;
    setClearItemModal({ visible: false, id: null });
    try {
      setLoading(true);
      await postData(`/api/items/${id}`, { _method: 'DELETE' });
      setItems(prev => prev.filter(item => item.id !== id && item._id !== id));
    } catch (error) {
      console.error('Error clearing item:', error);
      Alert.alert('Error', 'Failed to clear item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRow = useCallback(({ item, index }) => {
    const isOdd = index % 2 !== 0;
    return (
      <View style={[styles.tableRow, isOdd && styles.oddRow]}>
        <Text style={styles.dateCell}>{formatDate(item.date_time || item.date || item.created_at)}</Text>
        <Text style={styles.nameCell} numberOfLines={1}>{item.category || item.name || item.item_name || 'Unnamed'}</Text>
        <TouchableOpacity style={styles.clearButton} onPress={() => setSelectedItem(item)}>
          <Text style={styles.clearButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Image source={require('../../assets/LV-Logo.png')} style={styles.logoSmall} />
          <Text style={styles.headerTitle}>
            LA VERDAD <Text style={{ fontWeight: '300' }}>LOST N FOUND</Text>
          </Text>
        </View>
      </SafeAreaView>

      <LinearGradient colors={gradients.main} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.actionText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.clearAllButton, items.length === 0 && { opacity: 0.5 }]}
              onPress={() => setClearAllModal(true)}
              disabled={items.length === 0 || loading}
            >
              <Text style={styles.actionText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.pageTitle}>ITEMS TO BE CLEARED</Text>

          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <TouchableOpacity
                style={styles.headerCellGroup}
                onPress={() => { setSortAscending(!sortAscending); setCurrentPage(1); }}
                activeOpacity={0.7}
              >
                <Text style={styles.headerCellText}>{'Date\n(Handed Over)  '}</Text>
                <Ionicons name={sortAscending ? 'caret-up' : 'caret-down'} size={12} color="#666" />
              </TouchableOpacity>
              <Text style={[styles.headerCellText, { flex: 1, paddingHorizontal: 5 }]}>Item Category</Text>
              <Text style={[styles.headerCellText, { width: 80, textAlign: 'center' }]}>Action</Text>
            </View>

            {loading ? (
              <View style={{ padding: 40, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00AEEF" />
              </View>
            ) : (
              <FlatList
                data={paginatedData}
                renderItem={renderRow}
                keyExtractor={(item, index) => (item.id || item._id || item.item_id || index).toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', marginVertical: 30, color: '#666', fontStyle: 'italic' }}>No items to be cleared.</Text>
                }
              />
            )}
          </View>
        </ScrollView>
      </LinearGradient>
      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
        <View style={styles.bottomWrapper}>
          <View style={styles.paginationRow}>
            <TouchableOpacity style={styles.pageArrow} onPress={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#FFF'} />
            </TouchableOpacity>
            <View style={styles.activePageSquare}>
              <Text style={styles.activePageText}>{currentPage}</Text>
            </View>
            <TouchableOpacity style={styles.pageArrow} onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#FFF'} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ItemSummaryModal
        visible={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onClear={() => {
          const id = selectedItem?.id || selectedItem?._id;
          setSelectedItem(null);
          setClearItemModal({ visible: true, id });
        }}
      />

      <ClearAllItemsModal
        visible={clearAllModal}
        onCancel={() => setClearAllModal(false)}
        onConfirm={performClearAll}
      />

      <ClearAllItemsModal
        visible={clearItemModal.visible}
        title="Are you sure you want to clear this item?"
        onCancel={() => setClearItemModal({ visible: false, id: null })}
        onConfirm={performClearItem}
      />

      <AllClearedSuccessModal visible={showAllClearedModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: colors.primary },
  gradient: { flex: 1 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: colors.textWhite, fontSize: 14, fontWeight: 'bold' },
  scrollContainer: { paddingHorizontal: 15, paddingBottom: 15 },
  topActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  backButton: { backgroundColor: '#4A6A8A', paddingHorizontal: 30, paddingVertical: 8, borderRadius: 15 },
  clearAllButton: { backgroundColor: '#003366', paddingHorizontal: 30, paddingVertical: 8, borderRadius: 15 },
  actionText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  pageTitle: { color: '#000', fontSize: 24, fontWeight: '900', textAlign: 'center', marginVertical: 20 },
  tableCard: { backgroundColor: '#FFF', borderRadius: 25, borderWidth: 2, borderColor: '#00AEEF', overflow: 'hidden', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  headerCellGroup: { width: 85, flexDirection: 'row', alignItems: 'center' },
  headerCellText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12 },
  oddRow: { backgroundColor: '#F2F2F2' },
  dateCell: { width: 85, fontSize: 10, color: '#333' },
  nameCell: { flex: 1, fontSize: 10, color: '#333', paddingHorizontal: 5 },
  clearButton: { backgroundColor: '#004A8D', borderRadius: 15, width: 80, height: 28, justifyContent: 'center', alignItems: 'center' },
  clearButtonText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  bottomSafeArea: { backgroundColor: '#1a3a5c' },
  bottomWrapper: { alignItems: 'center', paddingVertical: 12 },
  paginationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#002D52', borderRadius: 30, paddingVertical: 8, paddingHorizontal: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
  pageArrow: { padding: 6, borderRadius: 20, marginHorizontal: 8 },
  activePageSquare: { backgroundColor: '#FFF', width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginHorizontal: 8 },
  activePageText: { color: '#002D52', fontWeight: 'bold', fontSize: 14 },
});
