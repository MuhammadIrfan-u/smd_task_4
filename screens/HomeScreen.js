import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, signOutUser, exitGuestMode } = useContext(AuthContext);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOutUser() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.appIcon}>📚</Text>
        <Text style={styles.title}>Book Library</Text>

        <View style={styles.userCard}>
          <Text style={styles.cardHeader}>Firebase Authentication</Text>
          {user ? (
            <>
              <View style={styles.statusRow}>
                <View style={styles.statusDotActive} />
                <Text style={styles.statusTextActive}>
                  {user.phoneNumber ? 'Logged In via Phone OTP' : 'Logged In'}
                </Text>
              </View>
              <Text style={styles.userEmailLabel}>
                {user.phoneNumber ? 'Verified Phone Number:' : 'Account Email:'}
              </Text>
              <Text style={styles.userEmail}>{user.phoneNumber || user.email}</Text>
              <Text style={styles.userIdText}>UID: {user.uid}</Text>
            </>
          ) : (
            <>
              <View style={styles.statusRow}>
                <View style={styles.statusDotGuest} />
                <Text style={styles.statusTextGuest}>Guest Mode</Text>
              </View>
              <Text style={styles.guestDescription}>
                You are currently browsing as a guest. Sign in to sync your library across devices!
              </Text>
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Books')}
          >
            <Text style={styles.primaryButtonText}>📖 Browse All Books</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('ReadingList')}
          >
            <Text style={styles.secondaryButtonText}>🔖 My Reading List</Text>
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity style={styles.authActionButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.authActionButton} onPress={exitGuestMode}>
              <Text style={styles.signInText}>Sign In / Register</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  appIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  userCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#6b7280',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  statusDotGuest: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f59e0b',
    marginRight: 8,
  },
  statusTextGuest: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d97706',
  },
  userEmailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  userIdText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  guestDescription: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  authActionButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
  signInText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
});
