import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';

import CustomDrawerContent from './components/CustomDrawerContent';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ReadingListContext, ReadingListProvider } from './context/ReadingListContext';
import AboutScreen from './screens/AboutScreen';
import BookDetailsScreen from './screens/BookDetailsScreen';
import BookListScreen from './screens/BookListScreen';
import HomeScreen from './screens/HomeScreen';
import ReadingListScreen from './screens/ReadingListScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import PhoneAuthScreen from './screens/PhoneAuthScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const AuthNavStack = createNativeStackNavigator();

function BooksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookList"
        component={BookListScreen}
        options={{ title: 'All Books' }}
      />
      <Stack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Book Details',
          headerRight: () => {
            const { addToReadingList } = React.useContext(ReadingListContext);
            return (
              <Button
                onPress={() => {
                  addToReadingList(route.params?.id);
                  Alert.alert('Success', `"${route.params?.title}" added to reading list!`);
                }}
                title="+"
                color="#000"
              />
            );
          },
        })}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <AuthNavStack.Navigator initialRouteName="PhoneAuth" screenOptions={{ headerShown: false }}>
      <AuthNavStack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <AuthNavStack.Screen name="SignIn" component={SignInScreen} />
      <AuthNavStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthNavStack.Navigator>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Drawer.Screen name="Books" component={BooksStack} options={{ title: 'Books' }} />
      <Drawer.Screen name="ReadingList" component={ReadingListScreen} options={{ title: 'My Reading List' }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
    </Drawer.Navigator>
  );
}

function RootNavigator() {
  const { user, loading, isGuest } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading Book Library...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user || isGuest ? <MainDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReadingListProvider>
        <RootNavigator />
      </ReadingListProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
});
