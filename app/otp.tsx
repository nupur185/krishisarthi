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
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL =
  'https://krishisarthi-backend-32yz.onrender.com';

interface FarmerData {
  id: number;
  farmerId: string;
  fullName: string;
  mobile: string;
  role: string;
  verificationStatus: string;
}

interface DemoAuthResult {
  token: string;
  farmer: FarmerData;
}

export default function OtpScreen() {
  const {
    mobile,
    demoOtp,
    demoMode,
  } =
    useLocalSearchParams<{
      mobile: string;
      demoOtp?: string;
      demoMode?: string;
    }>();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const isDemoMode =
    demoMode === 'true';

  /**
   * Wait for the backend JWT that was requested
   * in the background from the login screen.
   *
   * We check every 500ms for up to 15 seconds.
   */
  async function waitForDemoToken(): Promise<DemoAuthResult> {
    const maxAttempts = 30;

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt++
    ) {
      const error =
        await SecureStore.getItemAsync(
          'demoAuthError'
        );

      if (error) {
        throw new Error(error);
      }

      const token =
        await SecureStore.getItemAsync(
          'demoAuthToken'
        );

      const farmerJson =
        await SecureStore.getItemAsync(
          'demoFarmer'
        );

      if (token && farmerJson) {
        try {
          const farmer =
            JSON.parse(farmerJson) as FarmerData;

          return {
            token,
            farmer,
          };
        } catch {
          throw new Error(
            'Unable to read demo login information'
          );
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );
    }

    throw new Error(
      'Server is taking too long to prepare the login session. Please try again.'
    );
  }

  /**
   * Finish login after local OTP verification.
   */
  async function completeDemoLogin() {
    const result =
      await waitForDemoToken();

    await SecureStore.setItemAsync(
      'authToken',
      result.token
    );

    await SecureStore.setItemAsync(
      'farmer',
      JSON.stringify(result.farmer)
    );

    /*
     * Temporary demo credentials are no longer needed.
     */
    await SecureStore.deleteItemAsync(
      'demoAuthToken'
    );

    await SecureStore.deleteItemAsync(
      'demoFarmer'
    );

    await SecureStore.deleteItemAsync(
      'demoAuthError'
    );

    const isOperator =
      result.farmer.role === 'OPERATOR';

    const isAdmin =
      result.farmer.role === 'ADMIN';

    const destination =
      isOperator || isAdmin
        ? '/operator'
        : '/home';

    Alert.alert(
      'Login successful',
      `Welcome ${result.farmer.fullName}!`,
      [
        {
          text: 'Continue',
          onPress: () => {
            router.replace(destination);
          },
        },
      ]
    );
  }

  /**
   * Existing real OTP verification flow.
   *
   * This remains available when demoMode is not enabled.
   */
  async function verifyRealOtp() {
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
      throw new Error(
        data.message || 'Invalid OTP'
      );
    }

    const { token, farmer } =
      data.data;

    await SecureStore.setItemAsync(
      'authToken',
      token
    );

    await SecureStore.setItemAsync(
      'farmer',
      JSON.stringify(farmer)
    );

    console.log('LOGIN SUCCESS');
    console.log('Role:', farmer.role);
    console.log(
      'Farmer ID:',
      farmer.farmerId
    );

    const isOperator =
      farmer.role === 'OPERATOR';

    const isAdmin =
      farmer.role === 'ADMIN';

    const destination =
      isOperator || isAdmin
        ? '/operator'
        : '/home';

    Alert.alert(
      'Login successful',
      `Welcome ${farmer.fullName}!`,
      [
        {
          text: 'Continue',
          onPress: () => {
            router.replace(destination);
          },
        },
      ]
    );
  }

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

      if (isDemoMode) {
        /*
         * DEMO MODE:
         *
         * Verify OTP entirely on the device.
         */
        if (!demoOtp) {
          throw new Error(
            'Demo OTP is missing. Please request a new OTP.'
          );
        }

        if (otp !== demoOtp) {
          throw new Error(
            'Invalid demo OTP. Please enter the OTP shown on this screen.'
          );
        }

        /*
         * OTP is correct.
         *
         * Now wait for the backend JWT that has
         * been preparing in the background.
         */
        await completeDemoLogin();

        return;
      }

      /*
       * NORMAL MODE:
       *
       * Use the existing server-side OTP system.
       */
      await verifyRealOtp();
    } catch (error) {
      console.error(
        'OTP verification error:',
        error
      );

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
          <Text style={styles.backText}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.icon}>
            🔐
          </Text>

          <Text style={styles.title}>
            Verify Mobile Number
          </Text>

          <Text style={styles.subtitle}>
            Enter the 6-digit OTP for
          </Text>

          <Text style={styles.mobile}>
            +91 {mobile}
          </Text>

          {isDemoMode && (
            <View style={styles.demoOtpBox}>
              <Text style={styles.demoOtpLabel}>
                DEMO OTP
              </Text>

              <Text style={styles.demoOtp}>
                {demoOtp ?? '------'}
              </Text>

              <Text style={styles.demoOtpHint}>
                Use this OTP to continue
              </Text>
            </View>
          )}

          <TextInput
            style={styles.otpInput}
            placeholder="Enter OTP"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            textAlign="center"
            autoFocus
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
              {loading
                ? 'Verifying...'
                : 'Verify & Login'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.expiry}>
            {isDemoMode
              ? 'Demo OTP is generated instantly on this device.'
              : 'OTP is valid for 5 minutes'}
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
    textAlign: 'center',
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
    marginBottom: 22,
  },

  demoOtpBox: {
    width: '100%',
    backgroundColor: '#EAF6EC',
    borderWidth: 1,
    borderColor: '#BBDCC0',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
  },

  demoOtpLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#4F6F55',
    marginBottom: 5,
  },

  demoOtp: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#205C2B',
  },

  demoOtpHint: {
    fontSize: 11,
    color: '#718078',
    marginTop: 5,
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
    textAlign: 'center',
  },
});