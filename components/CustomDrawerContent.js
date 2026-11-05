import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { AuthContext } from '../context/AuthContext';

export default function CustomDrawerContent(props) {
  const { user, signOutUser, exitGuestMode } = useContext(AuthContext);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOutUser() },
    ]);
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.phoneNumber
                ? '📱'
                : user?.email
                ? user.email.charAt(0).toUpperCase()
                : 'G'}
            </Text>
          </View>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user ? (user.phoneNumber || user.email) : 'Guest Reader'}
          </Text>
          <View style={[styles.badge, user ? styles.badgeAuth : styles.badgeGuest]}>
            <Text style={styles.badgeText}>
              {user ? (user.phoneNumber ? 'Phone Verified' : 'Verified User') : 'Guest Mode'}
            </Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        {user ? (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.signInButton} onPress={exitGuestMode}>
            <Text style={styles.signInButtonText}>Sign In / Register</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerScroll: {
    paddingTop: 10,
  },
  header: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeAuth: {
    backgroundColor: '#dcfce7',
  },
  badgeGuest: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  itemsContainer: {
    flex: 1,
    paddingTop: 6,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  signOutButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
