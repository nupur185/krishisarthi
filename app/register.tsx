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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [landAreaAcres, setLandAreaAcres] = useState('');
  const [landOwnership, setLandOwnership] = useState('');
  const [bankAccountLast4, setBankAccountLast4] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !mobile.trim()) {
      Alert.alert(
        'Missing information',
        'Please enter your full name and mobile number.'
      );
      return;
    }

    if (mobile.length !== 10) {
      Alert.alert(
        'Invalid mobile number',
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/farmers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          aadhaarLast4: aadhaarLast4.trim() || undefined,
          village: village.trim() || undefined,
          district: district.trim() || undefined,
          state: state.trim() || undefined,
          landAreaAcres: landAreaAcres
            ? Number(landAreaAcres)
            : undefined,
          landOwnership: landOwnership.trim() || undefined,
          bankAccountLast4: bankAccountLast4.trim() || undefined,
          bankIfsc: bankIfsc.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      Alert.alert(
        'Registration successful',
        `Your Farmer ID is ${result.data.farmerId}`,
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Registration failed',
        error instanceof Error
          ? error.message
          : 'Unable to connect to the server.'
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.title}>Register as Farmer</Text>
          <Text style={styles.subtitle}>
            Create your farmer profile to book procurement slots.
          </Text>
        </View>

        <SectionTitle title="Personal Information" />

        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />

        <Input
          label="Mobile Number"
          placeholder="10-digit mobile number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Input
          label="Aadhaar / Farmer ID"
          placeholder="Last 4 digits"
          value={aadhaarLast4}
          onChangeText={setAadhaarLast4}
          keyboardType="number-pad"
          maxLength={4}
        />

        <SectionTitle title="Location" />

        <Input
          label="Village / Locality"
          placeholder="Enter village or locality"
          value={village}
          onChangeText={setVillage}
        />

        <Input
          label="District"
          placeholder="Enter district"
          value={district}
          onChangeText={setDistrict}
        />

        <Input
          label="State"
          placeholder="Enter state"
          value={state}
          onChangeText={setState}
        />

        <SectionTitle title="Land Information" />

        <Input
          label="Land Area (Acres)"
          placeholder="e.g. 3.5"
          value={landAreaAcres}
          onChangeText={setLandAreaAcres}
          keyboardType="decimal-pad"
        />

        <Input
          label="Land Ownership"
          placeholder="Owned / Leased"
          value={landOwnership}
          onChangeText={setLandOwnership}
        />

        <SectionTitle title="Bank Details" />

        <Input
          label="Bank Account"
          placeholder="Last 4 digits"
          value={bankAccountLast4}
          onChangeText={setBankAccountLast4}
          keyboardType="number-pad"
          maxLength={4}
        />

        <Input
          label="IFSC Code"
          placeholder="e.g. SBIN0001234"
          value={bankIfsc}
          onChangeText={setBankIfsc}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={[styles.registerButton, loading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Registering...' : 'Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => Alert.alert('Login', 'Login screen will be added next.')}
        >
          <Text style={styles.loginText}>
            Already registered? <Text style={styles.loginBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  autoCapitalize,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad' | 'decimal-pad';
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#8A968D"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 28,
  },
  logo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#173B25',
  },
  subtitle: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: '#66736A',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#173B25',
    marginTop: 12,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34443A',
    marginBottom: 7,
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E3DB',
    borderRadius: 13,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#183523',
  },
  registerButton: {
    height: 53,
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  disabledButton: {
    opacity: 0.65,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loginText: {
    color: '#68756D',
    fontSize: 14,
  },
  loginBold: {
    color: '#2E7D32',
    fontWeight: '800',
  },
});