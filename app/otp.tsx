import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.164.217.66:5000';

export default function OtpScreen() {
  const { mobile } = useLocalSearchParams<{ mobile: string }>();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert(
        'Invalid OTP',
        'Please enter the 6-digit OTP.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid OTP');
      }

      const { token, farmer } = data.data;

      // Store authentication token securely.
      await SecureStore.setItemAsync('authToken', token);
       
      // Store farmer information securely.
      await SecureStore.setItemAsync(
        'farmer',
        JSON.stringify(farmer)
      );

      console.log('LOGIN SUCCESS');
      console.log('Farmer ID:', farmer.farmerId);

      Alert.alert(
        'Login successful',
        `Welcome ${farmer.fullName}!`,
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/home'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Verification failed',
        error instanceof Error
          ? error.message
          : 'Unable to verify OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.icon}>🔐</Text>

          <Text style={styles.title}>
            Verify Mobile Number
          </Text>

          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to
          </Text>

          <Text style={styles.mobile}>
            +91 {mobile}
          </Text>

          <TextInput
            style={styles.otpInput}
            placeholder="Enter OTP"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            textAlign="center"
          />

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.expiry}>
            OTP is valid for 5 minutes
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 10,
  },
  backText: {
    fontSize: 17,
    color: '#205C2B',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 42,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#18351D',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#667067',
  },
  mobile: {
    fontSize: 16,
    fontWeight: '700',
    color: '#205C2B',
    marginTop: 6,
    marginBottom: 28,
  },
  otpInput: {
    width: '100%',
    height: 58,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E2D9',
    borderRadius: 12,
    fontSize: 24,
    letterSpacing: 8,
    color: '#18351D',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  expiry: {
    marginTop: 18,
    color: '#7A847C',
    fontSize: 13,
  },
});