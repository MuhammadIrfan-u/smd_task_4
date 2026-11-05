import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import FirebaseRecaptchaModal from '../components/FirebaseRecaptchaModal';
import { firebaseConfig } from '../src/firebase';

const COUNTRY_CODES = [
  { label: '🇺🇸 +1', code: '+1' },
  { label: '🇵🇰 +92', code: '+92' },
  { label: '🇬🇧 +44', code: '+44' },
  { label: '🇮🇳 +91', code: '+91' },
  { label: '🇦🇺 +61', code: '+61' },
  { label: '🇨🇦 +1', code: '+1' },
];

export default function PhoneAuthScreen({ navigation }) {
  const { sendPhoneOtp, verifyPhoneOtp, continueAsGuest } = useContext(AuthContext);

  // Flow step: 1 = Phone Number Entry, 2 = OTP Verification
  const [step, setStep] = useState(1);

  // Form states
  const [selectedCountry, setSelectedCountry] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [simulatedSms, setSimulatedSms] = useState(null);

  // Demo / Simulation Mode switch
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Recaptcha Modal state for native platforms
  const [recaptchaVisible, setRecaptchaVisible] = useState(false);

  // Countdown timer for OTP resend
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  // Construct complete E.164 phone number
  const getFullPhoneNumber = () => {
    let clean = phoneNumber.trim().replace(/[\s-]/g, '');
    if (clean.startsWith('+')) {
      return clean;
    }
    // Remove leading 0 if present (common local dialing prefix)
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    return `${selectedCountry}${clean}`;
  };

  /**
   * STEP 2: Request and receive OTP via SMS
   */
  const handleRequestOtp = async (token = null) => {
    setErrorMessage('');
    setSuccessMessage('');
    setSimulatedSms(null);

    const fullPhone = getFullPhoneNumber();

    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }

    // On native mobile (not web), if not demo mode and no token yet, trigger reCAPTCHA modal
    if (Platform.OS !== 'web' && !isDemoMode && !token) {
      setRecaptchaVisible(true);
      return;
    }

    setLoading(true);

    try {
      const result = await sendPhoneOtp(fullPhone, token, isDemoMode);
      setLoading(false);

      if (result.success) {
        setVerificationId(result.verificationId);
        if (result.confirmationResult) {
          setConfirmationResult(result.confirmationResult);
        }

        // Show SMS simulation badge if demo mode or demo code provided
        if (result.demoCode) {
          setSimulatedSms(result.demoCode);
        }

        setStep(2);
        setCountdown(60);
        setSuccessMessage(`OTP sent via SMS to ${fullPhone}`);
      } else {
        // If Firebase rejected because Phone provider is disabled, suggest Demo Mode
        if (
          result.rawError === 'OPERATION_NOT_ALLOWED' ||
          (result.error && result.error.includes('Firebase Console'))
        ) {
          Alert.alert(
            'Firebase Phone Auth Setup',
            'Phone Authentication is not enabled yet in your Firebase Console for project "axeonic-be83b".\n\nWould you like to switch to Demo Mode to test the OTP flow right now?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Switch to Demo Mode',
                onPress: () => {
                  setIsDemoMode(true);
                  setErrorMessage(
                    'Demo Mode enabled! Tap "Request OTP via SMS" to test with simulated SMS.'
                  );
                },
              },
            ]
          );
        }
        setErrorMessage(result.error);
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Failed to send OTP.');
    }
  };

  /**
   * STEP 4: Verify the OTP and display success or failure message
   */
  const handleVerifyOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);

    const fullPhone = getFullPhoneNumber();
    const result = await verifyPhoneOtp({
      verificationId,
      otpCode: otpCode.trim(),
      confirmationResult,
      phoneNumber: fullPhone,
      isDemoMode,
    });

    setLoading(false);

    if (result.success) {
      setSuccessMessage('🎉 Success! Phone number verified successfully.');
      Alert.alert(
        'Verification Successful',
        `Phone number ${fullPhone} has been verified successfully!`,
        [{ text: 'Continue to App', style: 'default' }]
      );
    } else {
      setErrorMessage(result.error || 'Verification Failed: Invalid OTP code.');
    }
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setOtpCode('');
    handleRequestOtp();
  };

  const handleEditPhoneNumber = () => {
    setStep(1);
    setOtpCode('');
    setErrorMessage('');
    setSuccessMessage('');
    setSimulatedSms(null);
  };

  const handleFillTestNumber = () => {
    setSelectedCountry('+1');
    setPhoneNumber('6505553434');
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>📚 Book Library</Text>
          <Text style={styles.title}>Phone Authentication</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Enter your phone number to receive a verification OTP'
              : 'Enter the 6-digit verification code sent via SMS'}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorContainer}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step >= 1 && styles.stepDotTextActive]}>1</Text>
          </View>
          <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step === 2 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step === 2 && styles.stepDotTextActive]}>2</Text>
          </View>
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>
            1. Enter Phone
          </Text>
          <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>
            2. Verify OTP
          </Text>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {/* Success Message Banner */}
          {successMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Error Message Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Simulated SMS Notification Banner */}
          {simulatedSms ? (
            <TouchableOpacity
              style={styles.smsBanner}
              onPress={() => setOtpCode(simulatedSms)}
              activeOpacity={0.8}
            >
              <View style={styles.smsHeader}>
                <Text style={styles.smsIcon}>💬</Text>
                <Text style={styles.smsTitle}>New SMS Message</Text>
                <Text style={styles.smsTapToFill}>Tap to auto-fill</Text>
              </View>
              <Text style={styles.smsBody}>
                Your verification code is: <Text style={styles.smsCode}>{simulatedSms}</Text>
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* STEP 1: Phone Number Input */}
          {step === 1 ? (
            <View>
              <Text style={styles.sectionHeading}>Step 1: Enter Phone Number</Text>

              {/* Country Code Selector Buttons */}
              <Text style={styles.label}>Select Country Prefix</Text>
              <View style={styles.countryRow}>
                {COUNTRY_CODES.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.countryChip,
                      selectedCountry === item.code && styles.countryChipSelected,
                    ]}
                    onPress={() => setSelectedCountry(item.code)}
                  >
                    <Text
                      style={[
                        styles.countryChipText,
                        selectedCountry === item.code && styles.countryChipTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Phone Number</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.prefixBox}>
                    <Text style={styles.prefixText}>{selectedCountry}</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="650 555 3434"
                    placeholderTextColor="#9ca3af"
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      if (errorMessage) setErrorMessage('');
                    }}
                    keyboardType="phone-pad"
                    autoFocus
                  />
                  {phoneNumber ? (
                    <TouchableOpacity
                      onPress={() => setPhoneNumber('')}
                      style={styles.clearBtn}
                    >
                      <Text style={styles.clearBtnText}>✕</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <Text style={styles.helperText}>
                  Full Number: <Text style={styles.helperPhone}>{getFullPhoneNumber()}</Text>
                </Text>
              </View>

              {/* Quick Test Number Helper */}
              <TouchableOpacity style={styles.testNumberBtn} onPress={handleFillTestNumber}>
                <Text style={styles.testNumberBtnText}>🧪 Use Test Number (+1 650 555 3434)</Text>
              </TouchableOpacity>

              {/* Send OTP Button (Requirement 2) */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={() => handleRequestOtp()}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.buttonLoadingRow}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.primaryButtonText}> Requesting SMS OTP...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>📲 Request OTP via SMS</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 3 & 4: OTP Input & Verification */
            <View>
              <View style={styles.phoneSummaryRow}>
                <View>
                  <Text style={styles.sectionHeading}>Step 2: Enter Received OTP</Text>
                  <Text style={styles.sentToText}>
                    Sent to: <Text style={styles.sentToPhone}>{getFullPhoneNumber()}</Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={handleEditPhoneNumber} style={styles.editPhoneBtn}>
                  <Text style={styles.editPhoneBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
              </View>

              {/* 6-Digit OTP Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-Digit Verification Code</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor="#9ca3af"
                  value={otpCode}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                    setOtpCode(cleaned);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
                <Text style={styles.helperText}>Enter the 6-digit code received via SMS</Text>
              </View>

              {/* Verify OTP Button (Requirement 4) */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (loading || otpCode.length !== 6) && styles.buttonDisabled,
                ]}
                onPress={handleVerifyOtp}
                disabled={loading || otpCode.length !== 6}
              >
                {loading ? (
                  <View style={styles.buttonLoadingRow}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.primaryButtonText}> Verifying OTP Code...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>✅ Verify OTP Code</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP Row */}
              <View style={styles.resendRow}>
                <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>Resend in {countdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Web Recaptcha Container Placeholder */}
          {Platform.OS === 'web' ? <div id="recaptcha-container" /> : null}

          {/* Mode Switch Card */}
          <View style={styles.modeCard}>
            <View style={styles.modeRow}>
              <View style={styles.modeTextContainer}>
                <Text style={styles.modeTitle}>Demo Simulation Mode</Text>
                <Text style={styles.modeDescription}>
                  {isDemoMode
                    ? 'Simulates SMS locally (Code: 123456)'
                    : 'Uses real Firebase SMS (requires Phone enabled in Console)'}
                </Text>
              </View>
              <Switch
                value={isDemoMode}
                onValueChange={(val) => {
                  setIsDemoMode(val);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={isDemoMode ? '#2563eb' : '#f3f4f6'}
              />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Login Alternative */}
          <TouchableOpacity
            style={styles.secondaryNavButton}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.secondaryNavButtonText}>✉️ Sign In with Email & Password</Text>
          </TouchableOpacity>

          {/* Guest Mode */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={continueAsGuest}
            disabled={loading}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Book Library? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.linkText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ReCAPTCHA Modal for Native Mobile */}
      <FirebaseRecaptchaModal
        visible={recaptchaVisible}
        firebaseConfig={firebaseConfig}
        onVerify={(token) => {
          setRecaptchaVisible(false);
          handleRequestOtp(token);
        }}
        onCancel={() => {
          setRecaptchaVisible(false);
          setLoading(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#2563eb',
  },
  stepDotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  stepDotTextActive: {
    color: '#ffffff',
  },
  stepLine: {
    width: 60,
    height: 3,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#2563eb',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  stepLabelActive: {
    color: '#2563eb',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 14,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  successText: {
    color: '#065f46',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  smsBanner: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  smsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  smsIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  smsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e40af',
    flex: 1,
  },
  smsTapToFill: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
  },
  smsBody: {
    fontSize: 13,
    color: '#1e3a8a',
  },
  smsCode: {
    fontWeight: '700',
    letterSpacing: 2,
    color: '#1d4ed8',
  },
  countryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  countryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  countryChipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  countryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  countryChipTextSelected: {
    color: '#2563eb',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
  },
  prefixBox: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearBtnText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '700',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  helperPhone: {
    fontWeight: '700',
    color: '#2563eb',
  },
  testNumberBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 14,
  },
  testNumberBtnText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  phoneSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sentToText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  sentToPhone: {
    fontWeight: '700',
    color: '#111827',
  },
  editPhoneBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
  },
  editPhoneBtnText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  otpInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 10,
    color: '#111827',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  resendPrompt: {
    fontSize: 13,
    color: '#6b7280',
  },
  countdownText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modeCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  modeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  modeDescription: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryNavButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  secondaryNavButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
});

