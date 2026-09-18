import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

const API_URL = 'https://krishisarthi-backend-32yz.onrender.com';

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!mobile.trim()) {
      Alert.alert(
        'Missing information',
        'Please enter your mobile number.'
      );
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      Alert.alert(
        'Invalid mobile number',
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/request-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Unable to send OTP'
        );
      }

      // OTP request successful.
      // Move to OTP verification screen.
      router.push({
        pathname: '/otp',
        params: {
          mobile,
        },
      });
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error
          ? error.message
          : 'Unable to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>KrishiSarthi</Text>

          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Login to manage your procurement slots, queue and payments.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Mobile Number</Text>

          <View style={styles.mobileInputContainer}>
            <Text style={styles.countryCode}>+91</Text>

            <TextInput
              style={styles.mobileInput}
              placeholder="10-digit mobile number"
              placeholderTextColor="#8A968D"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <Text style={styles.otpInfo}>
            We'll send a 6-digit OTP to this registered mobile number.
          </Text>

          <TouchableOpacity
            style={[
              styles.loginButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/register')}
            >
              <Text style={styles.registerLink}>
                {' '}
                Register as Farmer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.securityBox}>
          <Text style={styles.securityIcon}>🔒</Text>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Your information is secure
            </Text>

            <Text style={styles.securityText}>
              KrishiSarthi keeps your farmer and procurement information
              protected.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 35,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  backText: {
    fontSize: 34,
    color: '#174D2C',
    lineHeight: 34,
  },

  backLabel: {
    fontSize: 15,
    color: '#174D2C',
    marginLeft: 5,
    fontWeight: '600',
  },

  header: {
    marginBottom: 35,
  },

  logo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 12,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#173B25',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#66736A',
  },

  form: {
    width: '100%',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34443A',
    marginBottom: 7,
    marginTop: 4,
  },

  mobileInputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E3DB',
    borderRadius: 13,
    paddingHorizontal: 15,
  },

  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#D9E3DB',
  },

  mobileInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#183523',
  },

  otpInfo: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7A867D',
    marginTop: 9,
    marginBottom: 22,
  },

  loginButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.65,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },

  registerText: {
    color: '#68756D',
    fontSize: 13,
  },

  registerLink: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '800',
  },

  securityBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF7EF',
    borderRadius: 15,
    padding: 15,
    marginTop: 40,
  },

  securityIcon: {
    fontSize: 20,
    marginRight: 11,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#254331',
    marginBottom: 3,
  },

  securityText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#68756D',
  },
});