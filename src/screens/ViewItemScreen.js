import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  FlatList, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock Data to represent your items
const DATA = [
  { id: '01', category: 'Clothing', title: 'Item no. 01' },
  { id: '02', category: 'Accessories', title: 'Item no. 02' },
  { id: '03', category: 'School Supplies', title: 'Item no. 03' },
  { id: '04', category: 'Personal Belongings', title: 'Item no. 04', valuable: true },
  { id: '05', category: 'Sports Equipments', title: 'Item no. 05' },
  { id: '06', category: 'Food and Drinks', title: 'Item no. 06' },
  { id: '07', category: 'Personal Belongings', title: 'Item no. 07', valuable: true },
  { id: '08', category: 'Sports Equipments', title: 'Item no. 08' },
];

const ItemCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.itemNumber}>{item.title}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      {item.valuable && (
        <View style={styles.valuableBadge}>
          <Text style={styles.valuableText}>V</Text>
        </View>
      )}
    </View>
    
    {/* Placeholder for the illustration/image */}
    <View style={styles.imagePlaceholder}>
       <Ionicons name="image-outline" size={60} color="#CCC" />
    </View>

    <TouchableOpacity style={styles.viewDetailsButton}>
      <Text style={styles.viewDetailsText}>View Details</Text>
    </TouchableOpacity>
  </View>
);

export default function ItemsListScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/school.png')} style={styles.logoSmall} />
            <Text style={styles.headerTitle}>LA VERDAD <Text style={{fontWeight: '300'}}>LOST N FOUND</Text></Text>
          </View>
          <TouchableOpacity style={styles.dashboardButton}>
            <Text style={styles.dashboardText}>DASHBOARD</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <LinearGradient colors={['#E0EAFC', '#16487d']} style={styles.gradient}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search by item number, category, description, or location"
            placeholderTextColor="#999"
          />
          <Ionicons name="search" size={20} color="#000" style={styles.searchIcon} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterTab, styles.activeFilter]}>
            <Text style={styles.activeFilterText}>All Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterTabText}>Lost Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterTabText}>Valuable Items</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Grid of Items */}
        <FlatList
          data={DATA}
          renderItem={({ item }) => <ItemCard item={item} />}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listPadding}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#002D52', paddingTop: 40 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  dashboardButton: { borderWidth: 2, borderColor: '#FFF', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5 },
  dashboardText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  
  gradient: { flex: 1 },
  searchContainer: { margin: 20, backgroundColor: '#FFF', borderRadius: 25, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, elevation: 5, shadowOpacity: 0.1, shadowRadius: 5 },
  searchInput: { flex: 1, height: 45, fontSize: 10 },
  searchIcon: { marginLeft: 10 },

  filterRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  filterTab: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  activeFilter: { backgroundColor: '#2B5D8C' },
  activeFilterText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  filterTabText: { color: '#666', fontSize: 11 },

  listPadding: { paddingHorizontal: 10, paddingBottom: 20 },
  columnWrapper: { justifyContent: 'space-between' },
  
  card: {
    backgroundColor: '#FFF',
    width: (width / 2) - 20,
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
  },
  cardHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  itemNumber: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  itemCategory: { fontSize: 10, color: '#666' },
  valuableBadge: { backgroundColor: '#EAD163', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#000' },
  valuableText: { fontSize: 10, fontWeight: 'bold' },
  
  imagePlaceholder: { height: 100, width: '100%', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  
  viewDetailsButton: { backgroundColor: '#003366', borderRadius: 15, width: '100%', paddingVertical: 8, alignItems: 'center' },
  viewDetailsText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
});