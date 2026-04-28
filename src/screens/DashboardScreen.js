import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients } from '../theme';

export default function DashboardScreen({ navigation }) {
  const [adminName, setAdminName] = useState('Loading...');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const name = await AsyncStorage.getItem('userName');
      // Fallback to 'User' if no name was returned from the server
      setAdminName(name || 'User');
      
      // Determine if the user is an admin
      const adminFlag = await AsyncStorage.getItem('isAdmin');
      setIsAdmin(adminFlag === 'true');
    };
    loadUserData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <SafeAreaView style={styles.header} edges={['top']}>
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
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={async () => {
              await AsyncStorage.clear(); // Ensure broken sessions are wiped clean!
              navigation.replace('Welcome');
            }}
          >
            <Text style={styles.logoutText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <LinearGradient colors={gradients.main} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Service Info */}
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceText}>Currently at your service,</Text>
            <Text style={styles.adminName}>{adminName}</Text>
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
            <TouchableOpacity 
              style={[styles.actionButton, styles.blueButton]}
              onPress={() => navigation.navigate('HandOver')}
            >
              <Text style={styles.buttonText}>Hand Over Item</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.blueButton]}
              onPress={() => navigation.navigate('ViewItem')}
            >
              <Text style={styles.buttonText}>View Claimable Items</Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.blueButton]}
                onPress={() => navigation.navigate('ItemsToClear')}
              >
                <Text style={styles.buttonText}>Items to be Cleared</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.actionButton, styles.yellowButton]}
              onPress={() => navigation.navigate('History')}
            >
              <Text style={styles.buttonTextBlack}>View History</Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.yellowButton]}
                onPress={() => navigation.navigate('ApprovalQueues')}
              >
                <Text style={styles.buttonTextBlack}>Approval Queues</Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: colors.primary },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoSmall: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  headerTitle: { color: colors.textWhite, fontSize: 13, fontWeight: 'bold' },
  logoutButton: { borderWidth: 2, borderColor: colors.textWhite, borderRadius: 15, paddingHorizontal: 20, paddingVertical: 5 },
  logoutText: { color: colors.textWhite, fontSize: 10, fontWeight: 'bold' },
  gradient: { flex: 1 },
  scrollContent: { paddingHorizontal: 40, paddingTop: 30, paddingBottom: 50 },
  serviceInfo: { marginBottom: 60 },
  serviceText: { fontSize: 14, color: colors.textPrimary },
  adminName: { fontSize: 16, fontWeight: 'bold', color: colors.textDark },
  heroSection: { alignItems: 'center', marginBottom: 40 },
  mainTitle: { fontSize: 26, fontWeight: '900', color: colors.primary, textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 13, color: colors.textPrimary, textAlign: 'center', lineHeight: 18 },
  buttonContainer: { width: '100%', gap: 15 },
  actionButton: { width: '100%', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: colors.textDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  blueButton: { backgroundColor: colors.buttonBlue },
  yellowButton: { backgroundColor: colors.warning },
  buttonText: { color: colors.textWhite, fontSize: 15, fontWeight: '600' },
  buttonTextBlack: { color: colors.textDark, fontSize: 15, fontWeight: '600' },
});