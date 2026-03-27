import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image
                        source={require('../../assets/LV-Logo.png')}
                        style={styles.logoSmall}
                      />
            <Text style={styles.headerTitle}>
              LA VERDAD <Text style={{fontWeight: '300'}}>LOST N FOUND</Text>
            </Text>
          </View>
          
          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <LinearGradient colors={['#E0EAFC', '#16487d']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Service Info */}
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceText}>Currently at your service,</Text>
            <Text style={styles.adminName}>Mrs. Laura Sabillon</Text>
          </View>

          {/* Main Hero Text */}
          <View style={styles.heroSection}>
            <Text style={styles.mainTitle}>Together, we bring{"\n"}things back!</Text>
            <Text style={styles.description}>
              Found or lost something? Don’t worry — help is just a click away! 
              We’ll guide you through every step to make sure your item gets back to you.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.blueButton]}>
              <Text style={styles.buttonText}>Hand Over Item</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.blueButton]}>
              <Text style={styles.buttonText}>View Claimable Items</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.blueButton]}>
              <Text style={styles.buttonText}>Items to be Cleared</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.yellowButton]}>
              <Text style={styles.buttonTextBlack}>View History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.yellowButton]}>
              <Text style={styles.buttonTextBlack}>Approval Queues</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#002D52', paddingTop: 40 },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 12 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  
  logoutButton: {
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  logoutText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  gradient: { flex: 1 },
  scrollContent: { paddingHorizontal: 40, paddingTop: 30, paddingBottom: 50 },

  serviceInfo: { marginBottom: 60 },
  serviceText: { fontSize: 14, color: '#333' },
  adminName: { fontSize: 16, fontWeight: 'bold', color: '#000' },

  heroSection: { alignItems: 'center', marginBottom: 40 },
  mainTitle: { fontSize: 26, fontWeight: '900', color: '#003366', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 13, color: '#333', textAlign: 'center', lineHeight: 18 },

  buttonContainer: { width: '100%', gap: 15 },
  actionButton: {
    width: '100%',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  blueButton: { backgroundColor: '#0061C1' },
  yellowButton: { backgroundColor: '#FFB81C' },
  
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  buttonTextBlack: { color: '#000', fontSize: 15, fontWeight: '600' },
});