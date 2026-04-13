import React, { useState, useEffect } from 'react';
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

export default function ItemsToClearScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItemsToClear = async () => {
      try {
        setLoading(true);
        const response = await fetchData('/api/items-to-be-cleared');
        const data = response.data || response;
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Items to clear fetch error:", error);
        Alert.alert("Error", "Could not load items.");
      } finally {
        setLoading(false);
      }
    };
    loadItemsToClear();
  }, []);
  
  const renderRow = ({ item, index }) => {
    const isOdd = index % 2 !== 0;

    return (
      <View style={[styles.tableRow, isOdd && styles.oddRow]}>
        <Text style={styles.dateCell}>{item.date || item.created_at || 'N/A'}</Text>
        <Text style={styles.nameCell} numberOfLines={1}>{item.name || item.item_name || 'Unnamed'}</Text>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* --- UNIFIED HEADER START --- */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/school.png')} 
            style={styles.logoSmall} 
          />
          <Text style={styles.headerTitle}>
            LA VERDAD <Text style={{fontWeight: '300'}}>LOST N FOUND</Text>
          </Text>
        </View>
      </SafeAreaView>
      {/* --- UNIFIED HEADER END --- */}

      <View style={styles.body}>
        {/* Top Buttons */}
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.actionText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearAllButton}>
            <Text style={styles.actionText}>Clear all</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>ITEMS TO BE CLEARED</Text>

        {/* Table Card */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <View style={styles.headerCellGroup}>
               <Text style={styles.headerCellText}>Date (Handed Over)</Text>
               <Ionicons name="swap-vertical" size={12} color="#666" style={{marginLeft: 4}} />
            </View>
            <Text style={[styles.headerCellText, {flex: 1.5}]}>Item Name</Text>
            <View style={{width: 90}} /> 
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#00AEEF" />
            </View>
          ) : (
            <FlatList
              data={items}
              renderItem={renderRow}
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#B0C4DE' // Light steel blue background as per your snap
  },
  // Unified Header Styles
  header: { 
    backgroundColor: '#002D52'
  },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 10 
  },
  logoSmall: { 
    width: 30, 
    height: 30, 
    marginRight: 10, 
    borderRadius: 15 
  },
  headerTitle: { 
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  
  // Body Content
  body: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  topActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20 
  },
  backButton: { 
    backgroundColor: '#4A6A8A', 
    paddingHorizontal: 30, 
    paddingVertical: 8, 
    borderRadius: 15 
  },
  clearAllButton: { 
    backgroundColor: '#003366', 
    paddingHorizontal: 30, 
    paddingVertical: 8, 
    borderRadius: 15 
  },
  actionText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 12 
  },

  pageTitle: { 
    color: '#000', 
    fontSize: 22, 
    fontWeight: '900', 
    textAlign: 'center', 
    marginVertical: 25 
  },

  tableCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    overflow: 'hidden', 
    borderWidth: 2,
    borderColor: '#00AEEF',
    flex: 0.8, // Adjusts height of the table
    marginBottom: 20
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE',
    alignItems: 'center'
  },
  headerCellGroup: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerCellText: { fontSize: 11, fontWeight: 'bold', color: '#000' },

  tableRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 12 
  },
  oddRow: { backgroundColor: '#F2F2F2' }, 
  dateCell: { flex: 1, fontSize: 11, color: '#333' },
  nameCell: { flex: 1.5, fontSize: 11, color: '#333' },
  
  detailsButton: { 
    backgroundColor: '#004A8D', 
    borderRadius: 15,
    width: 90,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  detailsText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});