import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAh6qaB6_6HcO-wgO2Sc8xDFKx7pkS92-A",
  authDomain: "axeonic-be83b.firebaseapp.com",
  projectId: "axeonic-be83b",
  storageBucket: "axeonic-be83b.firebasestorage.app",
  messagingSenderId: "306431321388",
  appId: "1:306431321388:web:0a8f0d6993e0337a293889",
  measurementId: "G-7YBW1NCCM1"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with persistent storage
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (_error) {
    // Fallback if already initialized
    auth = getAuth(app);
  }
}

export { app, auth, firebaseConfig };
