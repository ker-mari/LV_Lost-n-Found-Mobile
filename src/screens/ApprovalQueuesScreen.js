import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchData, postData } from '../api';
import { colors, gradients } from '../theme';
import RejectEditModal from './RejectEditModal';
import ChangesSavedModal from './ChangesSavedModal';

const VALUABLE_CATEGORIES = ['Gadgets / Electronics', 'Money and Payment Items', 'Identification and Wallets', 'Bags and Storage', 'Jewelry / Valuables'];

const getCode = (item) => {
  const category = item.original_data?.category || item.item?.category || item.new_category || item.category || '';
  return VALUABLE_CATEGORIES.includes(category) ? 'V' : 'L';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString.replace(' ', 'T'));
  if (isNaN(date.getTime())) return dateString;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export default function ApprovalQueuesScreen({ navigation }) {
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [codeFilter, setCodeFilter] = useState('All');
  const itemsPerPage = 10;

  const loadQueues = async () => {
    try {
      setLoading(true);
      const response = await fetchData('/api/pending-edits');
      let data = response.data || response;
      if (data && data.data) data = data.data;
      setQueueData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Approval queues fetch error:', error);
      Alert.alert('Error', 'Could not load approval queues.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadQueues(); }, []);

  const onRefresh = () => { setRefreshing(true); setCurrentPage(1); loadQueues(); };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await postData(`/api/pending-edits/${selectedItem.id}/approve`, {});
      setSelectedItem(null);
      loadQueues();
      setShowApproveSuccess(true);
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not approve.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      setActionLoading(true);
      await postData(`/api/pending-edits/${selectedItem.id}/reject`, { comments: reason });
      setSelectedItem(null);
      loadQueues();
      setShowRejectSuccess(true);
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not reject.');
    } finally {
      setActionLoading(false);
    }
  };

  // Extract old and new data from the selected item
  const oldData = selectedItem?.original_data || {};
  const newData = selectedItem?.new_data || {};

  // Dynamically sort data based on date
  const sortedData = useMemo(() => {
    const filtered = codeFilter === 'All' ? queueData : queueData.filter(item => getCode(item) === codeFilter);
    return [...filtered].sort((a, b) => {
      const dateA = new Date((a.created_at || a.date || '').replace(' ', 'T')).getTime();
      const dateB = new Date((b.created_at || b.date || '').replace(' ', 'T')).getTime();
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return sortAscending ? dateA - dateB : dateB - dateA;
    });
  }, [queueData, sortAscending, codeFilter]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [currentPage, sortedData]);

  const renderRow = ({ item, index }) => {
    const code = getCode(item);
    return (
    <View style={[styles.tableRow, index % 2 !== 0 && styles.oddRow]}>
      <Text style={styles.dateCell}>{formatDate(item.original_data?.date_time || item.original_data?.date || item.created_at || item.date)}</Text>
      <Text style={styles.nameCell} numberOfLines={1}>
        {item.original_data?.category || item.item?.category || item.new_category || item.category || 'Unnamed'}
      </Text>
      <View style={styles.codeCell}>
        {code === 'V' ? (
          <LinearGradient colors={['#FFD700', '#FFAA00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.codeBadge}>
            <Text style={[styles.codeBadgeText, styles.codeBadgeTextV]}>{code}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.codeBadge, styles.codeBadgeL]}>
            <Text style={[styles.codeBadgeText, styles.codeBadgeTextL]}>{code}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.detailsButton} onPress={() => setSelectedItem(item)}>
        <Text style={styles.detailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
  };

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

      <LinearGradient colors={gradients.main} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>APPROVAL QUEUES</Text>

          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <TouchableOpacity style={styles.headerCellGroup} onPress={() => { setSortAscending(!sortAscending); setCurrentPage(1); }} activeOpacity={0.7}>
                <Text style={styles.headerCellText}>Date</Text>
                <Ionicons name={sortAscending ? "caret-up" : "caret-down"} size={12} color="#666" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              <Text style={[styles.headerCellText, { flex: 1, paddingHorizontal: 5 }]}>Item Category</Text>
              <TouchableOpacity style={styles.codeHeaderGroup} onPress={() => { setCodeFilter(f => f === 'All' ? 'L' : f === 'L' ? 'V' : 'All'); setCurrentPage(1); }} activeOpacity={0.7}>
                <Text style={styles.headerCellText}>Code ({codeFilter})</Text>
                <Text style={{ fontSize: 9, color: '#666', marginLeft: 2, fontWeight: 'bold' }}></Text>
              </TouchableOpacity>
              <Text style={[styles.headerCellText, { width: 80, textAlign: 'center' }]}>Action</Text>
            </View>

            {loading && !refreshing ? (
              <View style={{ padding: 40, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00AEEF" />
              </View>
            ) : (
              <FlatList
                data={paginatedData}
                renderItem={renderRow}
                keyExtractor={item => item.id?.toString() || Math.random().toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', marginVertical: 30, color: '#666', fontStyle: 'italic' }}>No pending approvals found.</Text>
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
            <View style={styles.activePageSquare}><Text style={styles.activePageText}>{currentPage}</Text></View>
            <TouchableOpacity style={styles.pageArrow} onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#FFF'} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedItem}
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalView}>

            <View style={styles.modalHeader}>
              <Text style={styles.titleText}>Item's Information</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
                <Text style={styles.closeText}>Close </Text>
                <View style={styles.closeIconCircle}><Text style={styles.xIcon}>✕</Text></View>
              </TouchableOpacity>
            </View>

            <View showsVerticalScrollIndicator={false}>
              {/* OLD Section */}
              <View style={styles.oldSection}>
                <Text style={styles.sectionHeading}>OLD</Text>
                <InfoBlock label="Submitted By:" value={selectedItem?.user_name || 'N/A'} />
                <InfoBlock label="Item Category:" value={oldData.category || selectedItem?.item?.category || 'N/A'} isLink />
                <InfoBlock label="Location Found" value={oldData.location || 'N/A'} />
                <InfoBlock label="Date and Time" translation="(Araw at oras nong nakita)" value={formatDate(oldData.date_time)} />
                <InfoBlock label="Description" value={oldData.description || 'N/A'} />
              </View>

              {/* EDITED Section */}
              <View style={styles.divider} />
              <View style={styles.editedSection}>
                <Text style={styles.sectionHeading}>EDITED</Text>
                <InfoBlock label="Item Category:" value={newData.category || selectedItem?.new_category || 'N/A'} isLink isChanged={newData.category !== oldData.category} />
                <InfoBlock label="Location Found" value={newData.location || selectedItem?.new_location || 'N/A'} isChanged={newData.location !== oldData.location} />
                <InfoBlock label="Date and Time" translation="(Araw at oras nong nakita)" value={formatDate(newData.date_time || selectedItem?.new_date_time)} isChanged={newData.date_time !== oldData.date_time} />
                <InfoBlock label="Description" value={newData.description || selectedItem?.new_description || 'N/A'} isChanged={newData.description !== oldData.description} />
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.approveButton, actionLoading && { opacity: 0.5 }]}
                onPress={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.approveText}>✓  Approve</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectButton, actionLoading && { opacity: 0.5 }]}
                onPress={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <Text style={styles.rejectText}>✕  Reject</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      <RejectEditModal
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirmReject={(reason) => {
          setShowRejectModal(false);
          handleReject(reason);
        }}
      />

      <ChangesSavedModal
        visible={showApproveSuccess}
        title="Edit Approved!"
        subtitle="The edit has been approved successfully."
        onContinue={() => setShowApproveSuccess(false)}
      />

      <ChangesSavedModal
        visible={showRejectSuccess}
        title="Edit Rejected"
        subtitle="The edit has been rejected."
        onContinue={() => setShowRejectSuccess(false)}
      />
    </View>
  );
}

const InfoBlock = ({ label, translation, value, isLink, isChanged }) => (
  <View style={styles.infoBlock}>
    <Text style={styles.label}>
      {label} {translation && <Text style={styles.translationText}>{translation}</Text>}
    </Text>
    <Text style={[styles.value, isLink && styles.linkText, isChanged && styles.changedText]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#002D52' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  scrollContainer: { paddingHorizontal: 15, paddingBottom: 15 },
  backButton: { backgroundColor: '#4A6A8A', paddingHorizontal: 30, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', marginTop: 15 },
  backText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  pageTitle: { color: '#000', fontSize: 24, fontWeight: '900', textAlign: 'center', marginVertical: 20 },

  tableCard: { backgroundColor: '#FFF', borderRadius: 25, borderWidth: 2, borderColor: '#00AEEF', overflow: 'hidden', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  headerCellGroup: { width: 85, flexDirection: 'row', alignItems: 'center' },
  headerCellText: { fontSize: 10, fontWeight: 'bold', color: '#000' },

  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12 },
  oddRow: { backgroundColor: '#F2F2F2' },
  dateCell: { width: 85, fontSize: 10, color: '#333' },
  nameCell: { flex: 1, fontSize: 10, color: '#333', paddingHorizontal: 5 },

  detailsButton: { backgroundColor: '#004A8D', borderRadius: 15, width: 80, height: 28, justifyContent: 'center', alignItems: 'center' },
  detailsText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },

  codeHeaderGroup: { width: 75, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  codeCell: { width: 75, alignItems: 'center', justifyContent: 'center' },
  codeBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  codeBadgeL: { backgroundColor: '#37bf80' },
  codeBadgeV: { backgroundColor: '#FFD700' },
  codeBadgeText: { fontSize: 10, fontWeight: 'bold' },
  codeBadgeTextL: { color: '#FFF' },
  codeBadgeTextV: { color: '#FFF' },

  bottomSafeArea: { backgroundColor: '#1a3a5c' },
  bottomWrapper: { alignItems: 'center', paddingVertical: 12 },
  paginationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#002D52', borderRadius: 30, paddingVertical: 8, paddingHorizontal: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
  pageArrow: { padding: 6, borderRadius: 20, marginHorizontal: 8 },
  activePageSquare: { backgroundColor: '#FFF', width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginHorizontal: 8 },
  activePageText: { color: '#002D52', fontWeight: 'bold', fontSize: 14 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 15 },
  modalView: { width: '95%', backgroundColor: 'white', borderRadius: 40, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  titleText: { fontSize: 18, fontWeight: 'bold', color: '#053e5a' },
  closeButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'red', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  closeText: { color: 'red', fontWeight: 'bold', fontSize: 13 },
  closeIconCircle: { backgroundColor: 'red', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  xIcon: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  oldSection: { backgroundColor: '#f2f2f2', paddingHorizontal: 25, paddingVertical: 15 },
  divider: { height: 1, backgroundColor: '#c0c0c0', marginHorizontal: 25 },
  editedSection: { backgroundColor: '#eef6ff', paddingHorizontal: 25, paddingVertical: 15 },
  sectionHeading: { fontSize: 18, fontWeight: 'bold', color: '#053e5a', marginBottom: 10 },
  infoBlock: { marginBottom: 8 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  translationText: { fontWeight: 'normal', color: '#777', fontSize: 12 },
  value: { fontSize: 13, color: '#4A6A8A', marginTop: 1 },
  linkText: { color: '#4A6A8A' },
  changedText: { color: '#34c417', fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', padding: 20, gap: 12 },
  approveButton: { backgroundColor: '#053e5a', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 25, alignItems: 'center', minWidth: 120 },
  approveText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  rejectButton: { borderWidth: 1, borderColor: '#053e5a', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 25, alignItems: 'center', minWidth: 120 },
  rejectText: { color: '#053e5a', fontWeight: 'bold', fontSize: 14 },
});
