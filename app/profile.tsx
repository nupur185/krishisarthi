import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://10.164.217.66:5000/api';

interface FarmerProfile {
  id: number;
  farmerId: string;
  fullName: string;
  mobile: string;
  aadhaarLast4?: string | null;
  role: string;
  verificationStatus: string;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  landAreaAcres?: number | string | null;
  landOwnership?: string | null;
  bankAccountLast4?: string | null;
  bankIfsc?: string | null;
  createdAt: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function maskMobile(mobile: string) {
  if (mobile.length < 4) {
    return mobile;
  }

  return `******${mobile.slice(-4)}`;
}

function maskAadhaar(last4?: string | null) {
  if (!last4) {
    return 'Not provided';
  }

  return `XXXX XXXX ${last4}`;
}

function maskBankAccount(last4?: string | null) {
  if (!last4) {
    return 'Not provided';
  }

  return `XXXX XXXX ${last4}`;
}

function formatVerificationStatus(status: string) {
  switch (status) {
    case 'VERIFIED':
      return 'Verified';

    case 'PENDING':
      return 'Pending verification';

    case 'REJECTED':
      return 'Verification rejected';

    default:
      return status;
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setError('');

      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/farmers/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to load profile'
        );
      }

      setProfile(result.data);
    } catch (err) {
      console.error('Profile fetch error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load profile'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('authToken');
              router.replace('/login');
            } catch (err) {
              console.error('Logout error:', err);
            }
          },
        },
      ]
    );
  };

  const handlePersonalInformation = () => {
    if (!profile) return;

    Alert.alert(
      'Personal Information',
      `Name: ${profile.fullName}\n\nMobile: ${profile.mobile}\n\nFarmer ID: ${profile.farmerId}`
    );
  };

  const handleFarmDetails = () => {
    if (!profile) return;

    Alert.alert(
      'Farm Details',
      `Village: ${profile.village || 'Not provided'}\n\nDistrict: ${
        profile.district || 'Not provided'
      }\n\nState: ${profile.state || 'Not provided'}\n\nLand Area: ${
        profile.landAreaAcres
          ? `${profile.landAreaAcres} acres`
          : 'Not provided'
      }\n\nOwnership: ${
        profile.landOwnership || 'Not provided'
      }`
    );
  };

  const handlePaymentInformation = () => {
    if (!profile) return;

    Alert.alert(
      'Payment Information',
      `Bank Account: ${maskBankAccount(
        profile.bankAccountLast4
      )}\n\nIFSC: ${profile.bankIfsc || 'Not provided'}`
    );
  };

  const handleHelpCenter = () => {
    Alert.alert(
      'Help Center',
      'For assistance with booking, procurement, payment, or grievances, please contact your procurement center.'
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { paddingTop: insets.top },
        ]}
      >
        <Ionicons
          name="person-circle-outline"
          size={54}
          color="#2E7D32"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View
        style={[
          styles.errorContainer,
          { paddingTop: insets.top },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={54}
          color="#C62828"
        />

        <Text style={styles.errorTitle}>
          Unable to load profile
        </Text>

        <Text style={styles.errorMessage}>
          {error || 'Profile information is unavailable.'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchProfile();
          }}
        >
          <Text style={styles.retryButtonText}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  const initials = getInitials(profile.fullName);

  const location = [
    profile.village,
    profile.district,
    profile.state,
  ]
    .filter(Boolean)
    .join(', ');

  const verificationStatus = formatVerificationStatus(
    profile.verificationStatus
  );

  const isVerified =
    profile.verificationStatus === 'VERIFIED';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 12 },
          ]}
        >
          <View>
            <Text style={styles.headerTitle}>
              My Profile
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage your farmer account
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#2E7D32"
            />
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {profile.fullName}
            </Text>

            <Text style={styles.farmerId}>
              Farmer ID: {profile.farmerId}
            </Text>

            <Text style={styles.location}>
              {location || 'Location not provided'}
            </Text>

            <View style={styles.roleBadge}>
              <Ionicons
                name="leaf-outline"
                size={13}
                color="#2E7D32"
              />

              <Text style={styles.roleText}>
                {profile.role}
              </Text>
            </View>
          </View>
        </View>

        {/* Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Verification Status
          </Text>

          <View style={styles.verificationCard}>
            <View
              style={[
                styles.verificationIcon,
                isVerified
                  ? styles.verifiedIcon
                  : styles.pendingIcon,
              ]}
            >
              <Ionicons
                name={
                  isVerified
                    ? 'checkmark-circle'
                    : 'time-outline'
                }
                size={22}
                color={
                  isVerified
                    ? '#2E7D32'
                    : '#F57C00'
                }
              />
            </View>

            <View style={styles.verificationInfo}>
              <Text style={styles.verificationTitle}>
                Farmer Verification
              </Text>

              <Text
                style={[
                  styles.verificationStatus,
                  {
                    color: isVerified
                      ? '#2E7D32'
                      : '#F57C00',
                  },
                ]}
              >
                {verificationStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <View style={styles.menuCard}>
            <Pressable
              style={styles.menuItem}
              onPress={handlePersonalInformation}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="person-outline"
                  size={21}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.menuText}>
                Personal Information
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9E9E9E"
              />
            </Pressable>

            <View style={styles.separator} />

            <Pressable
              style={styles.menuItem}
              onPress={handleFarmDetails}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="business-outline"
                  size={21}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.menuText}>
                Farm Details
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9E9E9E"
              />
            </Pressable>

            <View style={styles.separator} />

            <Pressable
              style={styles.menuItem}
              onPress={() => router.push('/procurement-history')}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={21}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.menuText}>
                Procurement History
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9E9E9E"
              />
            </Pressable>

            <View style={styles.separator} />

            <Pressable
              style={styles.menuItem}
              onPress={handlePaymentInformation}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="card-outline"
                  size={21}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.menuText}>
                Payment Information
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9E9E9E"
              />
            </Pressable>
          </View>
        </View>

        {/* Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Help & Support
          </Text>

          <View style={styles.menuCard}>
            <Pressable
              style={styles.menuItem}
              onPress={handleHelpCenter}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="help-circle-outline"
                  size={21}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.menuText}>
                Help Center
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9E9E9E"
              />
            </Pressable>

            <View style={styles.separator} />

            <Pressable
              style={styles.menuItem}
              onPress={() => router.push('/my-grievances')}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={21}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.menuText}>
                My Grievances
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9E9E9E"
              />
            </Pressable>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#C62828"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>

        {/* Account details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>
            Account Details
          </Text>

          <Text style={styles.detailsText}>
            Mobile: {maskMobile(profile.mobile)}
          </Text>

          <Text style={styles.detailsText}>
            Aadhaar: {maskAadhaar(profile.aadhaarLast4)}
          </Text>

          <Text style={styles.detailsText}>
            Bank Account:{' '}
            {maskBankAccount(profile.bankAccountLast4)}
          </Text>

          <Text style={styles.detailsText}>
            IFSC: {profile.bankIfsc || 'Not provided'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F4',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F8F4',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#616161',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F6F8F4',
  },

  errorTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },

  errorMessage: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#757575',
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B1B1B',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#757575',
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },

  name: {
    fontSize: 21,
    fontWeight: '800',
    color: '#212121',
  },

  farmerId: {
    marginTop: 4,
    fontSize: 13,
    color: '#616161',
  },

  location: {
    marginTop: 4,
    fontSize: 13,
    color: '#757575',
  },

  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },

  section: {
    marginTop: 22,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '800',
    color: '#212121',
  },

  verificationCard: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  verificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifiedIcon: {
    backgroundColor: '#E8F5E9',
  },

  pendingIcon: {
    backgroundColor: '#FFF3E0',
  },

  verificationInfo: {
    marginLeft: 12,
  },

  verificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },

  verificationStatus: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
  },

  menuCard: {
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },

  menuItem: {
    minHeight: 62,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#303030',
  },

  separator: {
    height: 1,
    marginLeft: 67,
    backgroundColor: '#EEEEEE',
  },

  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C62828',
  },

  detailsCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  detailsTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#424242',
  },

  detailsText: {
    marginTop: 5,
    fontSize: 13,
    color: '#757575',
  },
});