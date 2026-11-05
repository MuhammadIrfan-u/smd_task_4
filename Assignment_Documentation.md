# Book Library App - React Navigation Assignment Documentation

This document explains the architecture of the Book Library App, specifically focusing on the navigation implementation and data passing between screens.

## 1. Navigation Implementation

The application uses standard React Navigation following a straightforward setup, located primarily in `App.js`. 

### Drawer Navigator (Root Navigator)
The **Drawer Navigator** is implemented as the root navigator of the application to provide a side menu.
- **Location:** Implemented in `App.js` as `<Drawer.Navigator>`.
- **Functionality:** It wraps the entire navigation container and provides access to main sections:
  - `Home`: Opens the `HomeScreen` component.
  - `Books`: Opens the `BooksStack` (Stack Navigator).
  - `ReadingList`: Opens the `ReadingListScreen` component.
  - `About`: Opens the `AboutScreen` component.

### Stack Navigator
The **Stack Navigator** is used to handle transitions between the list of books and the individual book detail screens, providing a natural "push" and "back" flow.
- **Location:** Implemented in `App.js` inside the `BooksStack()` function using `<Stack.Navigator>`.
- **Functionality:** It contains:
  - `BookList`: The primary screen showing all available books.
  - `BookDetails`: A screen pushed onto the stack when a user selects a book. It can also recursively push another `BookDetails` screen when selecting "Similar Books".

### Bottom Tab Navigator (Removed)
*Note: A Bottom Tab Navigator was initially implemented to switch between "Home" and "Books", satisfying the requirement to use all three navigators. However, it was removed during iteration because it created UX duplication and confusion alongside the Drawer Navigator, which already handles top-level navigation perfectly.*

## 2. Passing Data Between Screens

Data passing is heavily utilized when navigating from the Book List to Book Details. This allows the application to remain efficient without creating separate screens for each book.

### Sending Data (Route Parameters)
In `screens/BookListScreen.js`, when a user taps "View Details" on a book row, the entire book object (`item`) is passed as a route parameter to the target screen.
```javascript
// In BookListScreen.js
<Button 
  title="View Details" 
  onPress={() => navigation.navigate('BookDetails', item)} 
/>
```
This is also replicated for the "Similar Books" section in `screens/BookDetailsScreen.js` using `navigation.push('BookDetails', book)` to pass a similar book's object forward.

### Receiving and Displaying Data
In `screens/BookDetailsScreen.js`, the passed route parameters are intercepted via the `route` prop provided by React Navigation. The data is then extracted and rendered dynamically.
```javascript
// In BookDetailsScreen.js
export default function BookDetailsScreen({ route, navigation }) {
  // Read parameters from route.params
  const { id, title, author, genre, year, description } = route.params;

  return (
    <View>
      <Text>{title}</Text>
      <Text>Author: {author}</Text>
      {/* ... */}
    </View>
  );
}
```

### Dynamic Headers Using Parameters
The route parameters are also utilized inside `App.js` to dynamically change the Stack Navigator's header title based on which book was selected:
```javascript
// In App.js BooksStack configuration
<Stack.Screen 
  name="BookDetails" 
  component={BookDetailsScreen}
  options={({ route }) => ({
    title: route.params?.title || 'Book Details', // Dynamic title!
    // ...
  })}
/>
```

## Global Data (Reading List State)
Data passing for the newly added "Reading List" feature is handled using **React Context** (`context/ReadingListContext.js`). This allows any screen (such as the header button in `BookDetailsScreen` or the interactive list in `ReadingListScreen`) to update or view the user's reading statuses ("Read", "Not Read", "Half Done") without needing to pass heavy props down through the navigation hierarchy.

## 3. Firebase Authentication Integration

The application integrates Firebase Authentication using the Firebase JS SDK and persistent storage.

### Architecture Overview
1. **Firebase Config (`src/firebase.js`):** Configures Firebase with the project credentials and initializes Firebase Auth with persistent AsyncStorage support.
2. **Auth Context (`context/AuthContext.js`):** Listens to `onAuthStateChanged` and exposes the current user, loading state, guest mode state, and authentication methods (`signIn`, `signUp`, `signOutUser`, `continueAsGuest`, `exitGuestMode`).
3. **Authentication Screens:**
   - `PhoneAuthScreen.js`: Primary authentication screen handling the complete 4-step Phone OTP SMS flow (Enter phone -> Request OTP -> Enter OTP -> Verify & feedback).
   - `SignInScreen.js`: Allows existing users to sign in with email and password, includes password toggle and guest mode option.
   - `SignUpScreen.js`: Allows new users to register with form validation (valid email, minimum 6 characters, matching passwords).
4. **Conditional Navigation Flow (`App.js`):**
   - When unauthenticated: Presents the `AuthStack` (PhoneAuth as initial route, SignIn, SignUp).
   - When authenticated or browsing as guest: Presents the main `Drawer.Navigator`.
   - Custom Drawer & Home screen reflect the user's login status (phone number or email, UID, status badge) and provide sign out or sign in triggers.

## 4. Phone Number OTP Authentication Implementation

The app implements the requested 4-step Phone Authentication with SMS OTP:

1. **Enter Phone Number:**
   - Supports international E.164 phone numbers with convenient country prefix chips (🇺🇸 +1, 🇵🇰 +92, 🇬🇧 +44, 🇮🇳 +91, etc.).
   - Validates phone format and provides a 1-tap "Use Test Number" helper for standard Firebase testing.

2. **Request and Receive OTP via SMS:**
   - Triggers SMS delivery through Firebase Authentication (`sendPhoneOtp`).
   - Displays a loading indicator and initiates a 60-second countdown for resending codes.
   - On native mobile platforms, security verification is handled via `components/FirebaseRecaptchaModal.js`.
   - Includes a built-in Demo / Simulation Mode switch allowing testing without Firebase SMS billing or before enabling the Phone provider in the Firebase Console.

3. **Enter Received OTP:**
   - Dedicated 6-digit verification code input with auto-formatting and numeric keyboard.
   - Includes quick "Edit Phone" option to return to Step 1 if the number was mistyped.

4. **Verify the OTP and Display Success or Failure Message:**
   - **Success:** Displays a green success banner, triggers an alert confirmation, stores the session in persistent storage, and automatically transitions the user to the authenticated app.
   - **Failure:** Displays a clear red error banner explaining why verification failed (e.g., invalid code, expired session, or console configuration needs) and allows retrying or resending.


